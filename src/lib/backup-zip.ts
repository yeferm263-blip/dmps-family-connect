/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from "jszip";
import { supabase } from "@/lib/db";
import {
  createPublicContentBackup,
  restorePublicContentBackup,
  type PublicContentBackup,
} from "@/lib/public-content-reset";
import { uploadInlineImages } from "@/lib/media-upload.functions";

/** Site-wide configuration tables included in a full ZIP backup (conflict column). */
const CONFIG_TABLES: Record<string, string> = {
  appearance_settings: "id",
  site_settings: "key",
  help_settings: "id",
  social_media_channels: "id",
  resources: "id",
  resource_translations: "id",
  contacts: "id",
};

export interface FullBackup extends PublicContentBackup {
  config?: Record<string, unknown[]>;
}

interface ImageEntry {
  url: string;
  file: string;
}

const URL_RE = /(?:https?:\/\/|\/api\/public\/media\/)[^"'\s)<>\\]+/g;
const IMG_EXT = /\.(png|jpe?g|webp|gif|svg|ico|avif)(\?|#|$)/i;

function isImageUrl(u: string) {
  return IMG_EXT.test(u) || u.includes("/storage/v1/object/") || u.startsWith("/api/public/media/");
}

function extFromType(type: string, url: string) {
  const m = IMG_EXT.exec(url);
  if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
  return (type.split("/")[1] || "jpg").replace("jpeg", "jpg").replace("svg+xml", "svg");
}

function folderFor(url: string, json: string, articleJson: string) {
  if (articleJson.includes(url)) return "articulos";
  if (json.includes(url)) return "branding";
  return "otros";
}

export async function createFullBackupZip(
  user: { id: string; email: string },
  onProgress?: (label: string) => void,
): Promise<FullBackup> {
  onProgress?.("Leyendo contenido…");
  const backup = (await createPublicContentBackup(user)) as FullBackup;
  onProgress?.("Leyendo configuración y logos…");
  backup.config = {};
  for (const t of Object.keys(CONFIG_TABLES)) {
    const { data } = await supabase.from(t as any).select("*");
    backup.config[t] = data || [];
  }

  const allJson = JSON.stringify(backup);
  const articleJson = JSON.stringify([backup.data.articles, backup.data.article_translations]);
  const configJson = JSON.stringify(backup.config.appearance_settings);
  const urls = Array.from(new Set(allJson.match(URL_RE) || [])).filter(isImageUrl);

  const zip = new JSZip();
  const images: ImageEntry[] = [];
  let i = 0;
  for (const url of urls) {
    i++;
    onProgress?.(`Descargando imágenes ${i}/${urls.length}…`);
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/") && !IMG_EXT.test(url)) continue;
      const folder = folderFor(url, configJson, articleJson);
      const file = `imagenes/${folder}/${String(i).padStart(4, "0")}.${extFromType(blob.type, url)}`;
      zip.file(file, blob);
      images.push({ url, file });
    } catch {
      // external image blocked by its site; its link stays in the data
    }
  }

  onProgress?.("Creando archivo ZIP…");
  zip.file("datos.json", JSON.stringify(backup, null, 2));
  zip.file("imagenes.json", JSON.stringify(images, null, 2));
  const out = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(out);
  a.download = `dmps-info-respaldo-${backup.backupId}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return backup;
}

export const ZIP_RESTORE_LIMITS = {
  MAX_ZIP_BYTES: 50 * 1024 * 1024, // 50 MB
  MAX_ENTRIES: 1000,
  MAX_UNCOMPRESSED_ENTRY_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_TOTAL_UNCOMPRESSED_BYTES: 150 * 1024 * 1024, // 150 MB
  MAX_EXPANSION_RATIO: 15,
};

const KNOWN_IMAGE_FIELD_NAMES = new Set([
  "featured_image_url",
  "card_banner_url",
  "image_url",
  "banner_url",
  "icon_url",
  "logo_url",
  "avatar_url",
  "cover_image_url",
]);

function replaceUrlInMarkdown(text: string, map: Map<string, string>): string {
  if (!text) return text;
  // Replace only in markdown images ![alt](url)
  let result = text.replace(
    /!\[(.*?)\]\((https?:\/\/[^\s)]+|\/api\/public\/media\/[^\s)]+)\)/g,
    (full, alt, url) => {
      const rep = map.get(url);
      return rep ? `![${alt}](${rep})` : full;
    },
  );
  // Replace in HTML img tags <img ... src="url" ...>
  result = result.replace(
    /(<img\b[^>]*?\bsrc=["'])(https?:\/\/[^"'\s]+|\/api\/public\/media\/[^"'\s]+)(["'][^>]*>)/gi,
    (full, pre, url, post) => {
      const rep = map.get(url);
      return rep ? `${pre}${rep}${post}` : full;
    },
  );
  return result;
}

function updateImageFieldsInRow(row: Record<string, any>, map: Map<string, string>) {
  if (!row || typeof row !== "object") return;

  // Direct string fields
  for (const field of Object.keys(row)) {
    if (KNOWN_IMAGE_FIELD_NAMES.has(field) && typeof row[field] === "string") {
      const match = map.get(row[field]);
      if (match) {
        row[field] = match;
      }
    }
  }

  // JSON fields with language keys like card_banners: { es?: string, en?: string }
  if (row.card_banners && typeof row.card_banners === "object") {
    for (const k of Object.keys(row.card_banners)) {
      const val = row.card_banners[k];
      if (typeof val === "string" && map.has(val)) {
        row.card_banners[k] = map.get(val)!;
      }
    }
  }
  if (row.featured_images && typeof row.featured_images === "object") {
    for (const k of Object.keys(row.featured_images)) {
      const val = row.featured_images[k];
      if (typeof val === "string" && map.has(val)) {
        row.featured_images[k] = map.get(val)!;
      }
    }
  }

  // Content blocks in translations (array of blocks)
  if (Array.isArray(row.content_blocks)) {
    for (const block of row.content_blocks) {
      if (block && typeof block === "object") {
        if (block.type === "image" && typeof block.url === "string" && map.has(block.url)) {
          block.url = map.get(block.url)!;
        }
        if (typeof block.text === "string") {
          block.text = replaceUrlInMarkdown(block.text, map);
        }
      }
    }
  }

  // Article / Announcement content or message fields (Markdown or HTML)
  if (typeof row.content === "string") {
    row.content = replaceUrlInMarkdown(row.content, map);
  }
  if (typeof row.bodyHtml === "string") {
    row.bodyHtml = replaceUrlInMarkdown(row.bodyHtml, map);
  }
  if (typeof row.body_html === "string") {
    row.body_html = replaceUrlInMarkdown(row.body_html, map);
  }

  // Appearance settings JSON
  if (row.settings && typeof row.settings === "object") {
    for (const k of Object.keys(row.settings)) {
      const val = row.settings[k];
      if (typeof val === "string" && map.has(val)) {
        row.settings[k] = map.get(val)!;
      }
    }
  }
}

export function updateStructuredImages(backup: FullBackup, map: Map<string, string>): FullBackup {
  const copy: FullBackup = JSON.parse(JSON.stringify(backup));

  if (copy.data && typeof copy.data === "object") {
    for (const tableRows of Object.values(copy.data)) {
      if (Array.isArray(tableRows)) {
        for (const row of tableRows) {
          updateImageFieldsInRow(row as Record<string, any>, map);
        }
      }
    }
  }

  if (copy.config && typeof copy.config === "object") {
    for (const configRows of Object.values(copy.config)) {
      if (Array.isArray(configRows)) {
        for (const row of configRows) {
          updateImageFieldsInRow(row as Record<string, any>, map);
        }
      }
    }
  }

  return copy;
}

export async function readBackupZip(file: File): Promise<{ backup: FullBackup; zip: JSZip }> {
  if (file.size > ZIP_RESTORE_LIMITS.MAX_ZIP_BYTES) {
    throw new Error(
      `El archivo ZIP excede el tamaño máximo permitido (${ZIP_RESTORE_LIMITS.MAX_ZIP_BYTES / (1024 * 1024)} MB).`,
    );
  }

  const zip = await JSZip.loadAsync(file);

  let entryCount = 0;
  const allowedPathRegex =
    /^(datos\.json|imagenes\.json|imagenes\/(articulos|branding|otros)\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif|svg|ico|avif))$/i;

  zip.forEach((relativePath, zipEntry) => {
    entryCount++;
    if (entryCount > ZIP_RESTORE_LIMITS.MAX_ENTRIES) {
      throw new Error(
        `El archivo ZIP contiene demasiadas entradas (máximo ${ZIP_RESTORE_LIMITS.MAX_ENTRIES}).`,
      );
    }

    if (
      relativePath.includes("..") ||
      relativePath.startsWith("/") ||
      relativePath.startsWith("\\") ||
      relativePath.includes("\0")
    ) {
      throw new Error(`Ruta de archivo peligrosa detectada en el ZIP: "${relativePath}".`);
    }

    if (zipEntry.dir) return;

    if (!allowedPathRegex.test(relativePath)) {
      throw new Error(
        `Archivo no permitido o formato sospechoso en el ZIP: "${relativePath}". Solo se admiten datos.json, imagenes.json y archivos de imagen dentro de imagenes/.`,
      );
    }
  });

  const data = zip.file("datos.json");
  if (!data) throw new Error("El ZIP no contiene datos.json de un respaldo de DMPS Info.");

  const datosText = await data.async("string");
  if (datosText.length > ZIP_RESTORE_LIMITS.MAX_UNCOMPRESSED_ENTRY_BYTES) {
    throw new Error("El archivo datos.json excede el límite de tamaño descomprimido.");
  }

  const backup = JSON.parse(datosText);
  if (!backup?.data) throw new Error("El respaldo no es válido.");
  return { backup, zip };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("No se pudo leer la imagen."));
    r.readAsDataURL(blob);
  });
}

export async function restoreFullBackup(
  backup: FullBackup,
  zip: JSZip | null,
  onProgress?: (label: string) => void,
) {
  let working: FullBackup = backup;
  let reuploaded = 0;
  let totalDecompressedBytes = 0;

  if (zip) {
    const manifest = zip.file("imagenes.json");
    let images: ImageEntry[] = [];
    if (manifest) {
      try {
        images = JSON.parse(await manifest.async("string"));
      } catch {
        images = [];
      }
    }

    // Also scan all image files inside the ZIP in case manifest was omitted or partial
    const existingFiles = new Set(images.map((img) => img.file));
    zip.forEach((relativePath, file) => {
      if (!file.dir && (relativePath.startsWith("imagenes/") || IMG_EXT.test(relativePath))) {
        if (!existingFiles.has(relativePath)) {
          // If omitted from manifest, use relativePath as identifier
          images.push({ url: relativePath, file: relativePath });
          existingFiles.add(relativePath);
        }
      }
    });

    const map = new Map<string, string>();
    let i = 0;
    for (const img of images) {
      i++;
      onProgress?.(`Restaurando imágenes ${i}/${images.length}…`);
      // Unblock main thread to allow browser UI updates
      await new Promise((resolve) => setTimeout(resolve, 0));

      const f = zip.file(img.file);
      if (!f) continue;
      try {
        const ext = img.file.split(".").pop() || "jpg";
        const mime =
          ext === "svg"
            ? "image/svg+xml"
            : ext === "ico"
              ? "image/x-icon"
              : `image/${ext === "jpg" ? "jpeg" : ext}`;
        const arrayBuf = await f.async("arraybuffer");

        totalDecompressedBytes += arrayBuf.byteLength;
        if (
          arrayBuf.byteLength > ZIP_RESTORE_LIMITS.MAX_UNCOMPRESSED_ENTRY_BYTES ||
          totalDecompressedBytes > ZIP_RESTORE_LIMITS.MAX_TOTAL_UNCOMPRESSED_BYTES
        ) {
          throw new Error(
            "El archivo ZIP supera los límites de descompresión (Zip Bomb mitigado).",
          );
        }

        const blob = new Blob([arrayBuf], { type: mime });
        const dataUrl = await blobToDataUrl(blob);

        let finalUrl = dataUrl;
        try {
          const { urls } = await uploadInlineImages({ data: { images: [dataUrl] } });
          if (urls?.[0]) {
            finalUrl = urls[0];
          }
        } catch (uploadErr) {
          console.warn("[Backup] Server upload error, restoring image as data URL:", uploadErr);
        }

        // Map original URL to final restored URL
        if (img.url) {
          map.set(img.url, finalUrl);
        }
        map.set(img.file, finalUrl);
        reuploaded++;
      } catch (err) {
        console.error("[Backup] Error restoring image file:", img.file, err);
      }
    }

    if (map.size) {
      // Structured replacement of image fields only - never touching slugs, titles or IDs
      working = updateStructuredImages(backup, map);
    }
  }

  const res = await restorePublicContentBackup(working, onProgress);
  const errors = [...res.errors];
  let restored = res.restored;
  for (const [table, rows] of Object.entries(working.config || {})) {
    if (!rows?.length) continue;
    onProgress?.(`Restaurando ${table}…`);
    const { error } = await supabase
      .from(table as any)
      .upsert(rows as any[], { onConflict: CONFIG_TABLES[table] || "id" });
    if (error) errors.push(`${table}: ${error.message}`);
    else restored += rows.length;
  }
  return { success: errors.length === 0, restored, removed: res.removed, reuploaded, errors };
}
