import { uploadInlineImages } from "./media-upload.functions";

const DATA_IMG = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;

/** Replaces every base64 image in a value (strings, arrays, objects) with a stored file URL. */
export async function externalizeInlineImages<T>(value: T): Promise<T> {
  const json = JSON.stringify(value ?? null);
  const found = Array.from(new Set(json.match(DATA_IMG) || []));
  if (!found.length) return value;
  const map = new Map<string, string>();
  for (let i = 0; i < found.length; i += 5) {
    const batch = found.slice(i, i + 5);
    try {
      const { urls } = await uploadInlineImages({ data: { images: batch } });
      batch.forEach((b, j) => map.set(b, urls[j] ?? b));
    } catch (e) {
      console.warn("[media] upload failed, keeping inline image", e);
    }
  }
  if (!map.size) return value;
  const out = json.replace(DATA_IMG, (m) => map.get(m) ?? m);
  return JSON.parse(out) as T;
}
