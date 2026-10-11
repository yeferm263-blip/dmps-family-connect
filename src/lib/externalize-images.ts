import { uploadInlineImages } from "./media-upload.functions";

const DATA_IMG = /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g;

/** Replaces every base64 image in a value (strings, arrays, objects) with a stored file URL. */
export async function externalizeInlineImages<T>(value: T): Promise<T> {
  const json = JSON.stringify(value ?? null);
  const found = Array.from(new Set(json.match(DATA_IMG) || []));
  if (!found.length) return value;
  const map = new Map<string, string>();
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < found.length; i += 3) {
    const batch = found.slice(i, i + 3);
    let uploaded: string[] | undefined;
    for (let attempt = 0; attempt < 6 && !uploaded; attempt++) {
      try {
        const result = await uploadInlineImages({ data: { images: batch } });
        if (result.urls?.length === batch.length && result.urls.every(Boolean)) {
          uploaded = result.urls;
        }
      } catch (e) {
        console.warn(`[media] inline image upload attempt ${attempt + 1} failed`, e);
      }
      if (!uploaded && attempt < 5) await wait(Math.min(8000, 500 * 2 ** attempt));
    }

    batch.forEach((original, index) => {
      // A failed upload must never inject megabytes into a database row.
      map.set(original, uploaded?.[index] || "[imagen no disponible]");
    });
  }

  const out = json.replace(DATA_IMG, (match) => map.get(match) || "[imagen no disponible]");
  return JSON.parse(out) as T;
}
