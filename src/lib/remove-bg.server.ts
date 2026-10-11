// Server-only: Official remove.bg API integration
import dns from "node:dns/promises";
import net from "node:net";

export interface RemoveBgOptions {
  imageUrl?: string;
  imageBase64?: string;
}

export interface RemoveBgResult {
  success: boolean;
  url?: string;
  error?: string;
  code?: string;
}

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB max size

export function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return true;
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 Loopback
    if (a === 10) return true; // 10.0.0.0/8 Private
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 Private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 Private
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 Link-local / Cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 Carrier-grade NAT
    if (a >= 224) return true; // 224.0.0.0/4 Multicast & reserved
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true; // Loopback / unspecified
    if (lower.startsWith("fe80:")) return true; // Link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // Unique local
    if (lower.startsWith("::ffff:")) {
      const v4 = lower.slice(7);
      return isPrivateOrReservedIp(v4);
    }
    return false;
  }
  return true;
}

export function validateImageMagicBytes(buffer: Buffer | Uint8Array): {
  valid: boolean;
  format?: "png" | "jpeg" | "webp";
  error?: string;
} {
  if (buffer.length < 12) {
    return { valid: false, error: "Archivo demasiado pequeño para ser una imagen válida." };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: "png" };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: "jpeg" };
  }
  // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: "webp" };
  }
  return {
    valid: false,
    error:
      "Formato de imagen no admitido. Solo se admiten archivos PNG, JPEG y WebP válidos (archivos SVG, HTML o scripts están prohibidos).",
  };
}

export async function fetchRemoteImageSafely(targetUrl: string, maxRedirects = 3): Promise<Buffer> {
  let currentUrl = targetUrl;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new Error("URL de imagen inválida.");
    }

    if (parsed.protocol !== "https:") {
      throw new Error("Solo se permiten URLs remotas con protocolo HTTPS seguro.");
    }

    if (parsed.username || parsed.password) {
      throw new Error("No se permiten credenciales en la URL.");
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".arpa")
    ) {
      throw new Error("Acceso a host local o interno denegado (SSRF bloqueado).");
    }

    // DNS lookup - checks all returned IP addresses
    let addresses: import("node:dns").LookupAddress[];
    try {
      addresses = await dns.lookup(hostname, { all: true });
    } catch (dnsErr) {
      throw new Error(`No se pudo resolver el nombre de host: ${(dnsErr as Error).message}`);
    }

    if (!addresses || addresses.length === 0) {
      throw new Error("No se obtuvieron direcciones IP para el host.");
    }

    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        throw new Error(
          `Destino denegado: el host resuelve a una dirección privada, local o de metadatos (${record.address}).`,
        );
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "DMPS-MediaOptimizer/1.0",
          Accept: "image/png,image/jpeg,image/webp",
        },
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      throw new Error(`Error al conectar con la URL de la imagen: ${(fetchErr as Error).message}`);
    }
    clearTimeout(timeout);

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Redirección sin encabezado Location.");
      currentUrl = new URL(loc, parsed).toString();
      continue;
    }

    if (!res.ok) {
      throw new Error(`El servidor de la imagen respondió con error HTTP ${res.status}.`);
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_BYTES) {
      throw new Error(
        `La imagen excede el límite máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw new Error(
        `La imagen descargada excede el límite de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
      );
    }

    return buffer;
  }
  throw new Error("Demasiadas redirecciones al descargar la imagen.");
}

function cleanBase64(raw: string): string {
  const m = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/.exec(raw.trim());
  return m ? m[1] : raw.trim();
}

export async function executeRemoveBg(opts: RemoveBgOptions): Promise<RemoveBgResult> {
  const apiKey = process.env["REMOVE_BG_API_KEY"] || process.env.REMOVE_BG_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error:
        "La clave de API de remove.bg (REMOVE_BG_API_KEY) no está configurada en el servidor. Por favor añade REMOVE_BG_API_KEY a tus variables de entorno.",
      code: "MISSING_API_KEY",
    };
  }

  const { imageUrl, imageBase64 } = opts;

  if (!imageUrl && !imageBase64) {
    return {
      success: false,
      error: "No se proporcionó ninguna imagen (se requiere URL o archivo base64).",
      code: "INVALID_INPUT",
    };
  }

  try {
    let imageBytes: Buffer;

    if (imageBase64) {
      const cleaned = cleanBase64(imageBase64);
      if (cleaned.length > MAX_IMAGE_BYTES * 1.4) {
        return {
          success: false,
          error: `Los datos base64 exceden el límite máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
          code: "PAYLOAD_TOO_LARGE",
        };
      }
      try {
        imageBytes = Buffer.from(cleaned, "base64");
      } catch {
        return {
          success: false,
          error: "Los datos de imagen en base64 no tienen una codificación válida.",
          code: "INVALID_BASE64",
        };
      }
    } else if (imageUrl) {
      if (imageUrl.startsWith("data:image/")) {
        const cleaned = cleanBase64(imageUrl);
        if (cleaned.length > MAX_IMAGE_BYTES * 1.4) {
          return {
            success: false,
            error: `La imagen excede el límite máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
            code: "PAYLOAD_TOO_LARGE",
          };
        }
        imageBytes = Buffer.from(cleaned, "base64");
      } else {
        // Fetch remote image safely with SSRF protection
        try {
          imageBytes = await fetchRemoteImageSafely(imageUrl.trim());
        } catch (ssrfErr) {
          return {
            success: false,
            error: (ssrfErr as Error).message,
            code: "SSRF_OR_URL_ERROR",
          };
        }
      }
    } else {
      return {
        success: false,
        error: "Entrada de imagen no válida.",
        code: "INVALID_INPUT",
      };
    }

    if (imageBytes.length > MAX_IMAGE_BYTES) {
      return {
        success: false,
        error: `El tamaño real de la imagen (${(imageBytes.length / (1024 * 1024)).toFixed(1)} MB) excede el límite permitido de ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`,
        code: "PAYLOAD_TOO_LARGE",
      };
    }

    // Verify magic bytes
    const magic = validateImageMagicBytes(imageBytes);
    if (!magic.valid) {
      return {
        success: false,
        error: magic.error || "Formato de imagen no admitido.",
        code: "INVALID_FORMAT",
      };
    }

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("format", "png");
    formData.append("image_file_b64", imageBytes.toString("base64"));

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey.trim(),
      },
      body: formData,
    });

    if (!res.ok) {
      let errMessage = `Error de remove.bg (${res.status})`;
      try {
        const errJson = (await res.json()) as {
          errors?: Array<{ title?: string; code?: string; detail?: string }>;
        };
        const firstErr = errJson.errors?.[0];
        if (firstErr) {
          if (res.status === 402 || firstErr.code === "insufficient_credits") {
            errMessage =
              "Se han agotado los créditos de remove.bg en esta cuenta o la clave no tiene saldo disponible.";
          } else if (res.status === 403 || firstErr.code === "auth_failed") {
            errMessage = "La clave REMOVE_BG_API_KEY no es válida o fue revocada.";
          } else {
            errMessage = firstErr.title || firstErr.detail || errMessage;
          }
        }
      } catch {
        // ignore JSON parse error
      }

      return {
        success: false,
        error: errMessage,
        code: `HTTP_${res.status}`,
      };
    }

    // Process transparent PNG output
    const arrayBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const b64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:image/png;base64,${b64}`;

    // Store in storage bucket so client gets permanent URL
    let storedUrl = dataUrl;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const sha1 = (await import("crypto")).createHash("sha1").update(bytes).digest("hex");
      const path = `articles/transparent-${sha1}.png`;

      let { error: uploadError } = await (supabaseAdmin as any).storage
        .from("ai-uploads")
        .upload(path, bytes, { contentType: "image/png", upsert: true });

      if (
        uploadError &&
        (uploadError.message?.includes("bucket") || (uploadError as any).statusCode === 404)
      ) {
        try {
          await (supabaseAdmin as any).storage.createBucket("ai-uploads", { public: false });
          const retry = await (supabaseAdmin as any).storage
            .from("ai-uploads")
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          uploadError = retry.error;
        } catch {
          // ignore
        }
      }

      if (!uploadError) {
        storedUrl = `/api/public/media/${path}`;
      }
    } catch {
      // Return dataUrl as robust fallback
    }

    return {
      success: true,
      url: storedUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Error de conexión con el servicio de remove.bg: ${msg}`,
      code: "NETWORK_ERROR",
    };
  }
}
