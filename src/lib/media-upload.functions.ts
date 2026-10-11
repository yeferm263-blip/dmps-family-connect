import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DATA_IMG = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sha1Hex(bytes: Uint8Array): Promise<string> {
  const h = await crypto.subtle.digest("SHA-1", bytes as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(h))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Stores one base64 image as a file (deduplicated by content hash) and returns its short URL. */
async function storeDataUrl(admin: any, dataUrl: string): Promise<string> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return dataUrl;
  const mime = m[1];
  const bytes = b64ToBytes(m[2]);
  const ext = (mime.split("/")[1] || "jpg").replace("jpeg", "jpg").replace("svg+xml", "svg");
  const path = `articles/${await sha1Hex(bytes)}.${ext}`;
  let { error } = await admin.storage
    .from("ai-uploads")
    .upload(path, bytes, { contentType: mime, upsert: true });

  if (error && (error.message?.toLowerCase().includes("bucket") || (error as any).statusCode === 404 || (error as any).statusCode === "404")) {
    // Private folder: files are served through /api/public/media.
    await admin.storage.createBucket("ai-uploads", { public: false }).catch(() => undefined);
    const retry = await admin.storage
      .from("ai-uploads")
      .upload(path, bytes, { contentType: mime, upsert: true });
    error = retry.error;
  }

  if (error) {
    console.error("[media] upload error", error.message);
    throw new Error(`No se pudo guardar la imagen: ${error.message}`);
  }
  return `/api/public/media/${path}`;
}

/**
 * Uploads base64 images to file storage and returns their short media URLs,
 * so content never stores heavy inline images.
 */
export const uploadInlineImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ images: z.array(z.string()).max(50) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: canManage } = await context.supabase.rpc("can_manage_content");
    if (!canManage) throw new Error("No autorizado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const urls: string[] = [];
    for (const dataUrl of data.images) urls.push(await storeDataUrl(supabaseAdmin, dataUrl));
    return { urls };
  });

const TABLES = [
  "articles",
  "article_translations",
  "announcements",
  "announcement_translations",
  "appearance_settings",
  "categories",
  "events",
  "programs",
  "activities",
  "schools",
  "student_programs",
  "podcasts",
] as const;

/** Scans stored content and moves every embedded base64 image into file storage. */
export const compactStoredMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: canManage } = await context.supabase.rpc("can_manage_content");
    if (!canManage) throw new Error("No autorizado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    let rows = 0;
    let images = 0;
    let savedBytes = 0;
    for (const t of TABLES) {
      const { data, error } = await admin.from(t).select("*");
      if (error || !data) continue;
      for (const row of data as Record<string, unknown>[]) {
        const json = JSON.stringify(row);
        const found = Array.from(new Set(json.match(DATA_IMG) || []));
        if (!found.length || row.id == null) continue;
        const map = new Map<string, string>();
        for (const f of found) map.set(f, await storeDataUrl(admin, f));
        const next = JSON.parse(json.replace(DATA_IMG, (m) => map.get(m) ?? m));
        const changes: Record<string, unknown> = {};
        for (const k of Object.keys(next)) {
          if (JSON.stringify(next[k]) !== JSON.stringify(row[k])) changes[k] = next[k];
        }
        if (!Object.keys(changes).length) continue;
        const { error: upErr } = await admin.from(t).update(changes).eq("id", row.id);
        if (upErr) continue;
        rows++;
        images += found.filter((f) => map.get(f) !== f).length;
        savedBytes += json.length - JSON.stringify(next).length;
      }
    }
    return { rows, images, savedKb: Math.round(savedBytes / 1024) };
  });
