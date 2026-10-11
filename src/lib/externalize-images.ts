import { uploadInlineImages } from "./media-upload.functions";

/**
 * Matches base64 images inside JSON text, tolerating line breaks inside the
 * base64 body (escaped as \n / \r in JSON) so no fragment is left behind.
 */
const DATA_IMG = /data:image\/[a-zA-Z0-9.+-]+;base64,(?:[A-Za-z0-9+/=]|\\[rn]|\s)+/g;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanDataUrl(raw: string): string {
  return raw.replace(/\\[rn]|\s/g, "").replace(/=+(?=[^=])/g, "");
}

async function uploadOne(dataUrl: string, attempts = 10): Promise<string | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const { urls } = await uploadInlineImages({ data: { images: [dataUrl] } });
      const url = urls?.[0];
      if (url && !url.startsWith("data:")) return url;
    } catch (e) {
      console.warn(`[media] upload attempt ${attempt + 1} failed`, e);
    }
    await wait(Math.min(15000, 600 * 2 ** attempt));
  }
  return null;
}

/** Uploads one inline image; if it keeps failing, shrinks it and tries again. */
export async function storeInlineImage(raw: string): Promise<string | null> {
  const dataUrl = cleanDataUrl(raw);
  let url = await uploadOne(dataUrl);
  if (url) return url;
  if (typeof window !== "undefined") {
    try {
      const { compressDataUrl } = await import("./image-compression");
      const smaller = await compressDataUrl(dataUrl, { maxWidth: 1600, maxHeight: 1600, quality: 0.8 });
      url = await uploadOne(smaller, 6);
      if (url) return url;
    } catch {
      // fall through
    }
  }
  return null;
}

/** Replaces every base64 image in a value (strings, arrays, objects) with a stored file URL. */
export async function externalizeInlineImages<T>(value: T): Promise<T> {
  const json = JSON.stringify(value ?? null);
  const found = Array.from(new Set(json.match(DATA_IMG) || []));
  if (!found.length) return value;
  const map = new Map<string, string>();
  for (const original of found) {
    const url = await storeInlineImage(original);
    // A failed upload must never inject megabytes into a database row.
    map.set(original, url || "[imagen no disponible]");
  }
  const out = json.replace(DATA_IMG, (match) => map.get(match) || "[imagen no disponible]");
  return JSON.parse(out) as T;
}

export function hasInlineImages(value: unknown): boolean {
  DATA_IMG.lastIndex = 0;
  return DATA_IMG.test(JSON.stringify(value ?? null));
}
