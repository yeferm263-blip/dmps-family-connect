export const ARTICLE_WORD_MIN = 100;
export const ARTICLE_WORD_MAX = 1500;
export const ARTICLE_WORD_DEFAULT = 500;

export function normalizeArticleWordCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(ARTICLE_WORD_MIN, Math.min(ARTICLE_WORD_MAX, Math.round(value)))
    : ARTICLE_WORD_DEFAULT;
}

/** Count visible words, excluding Markdown decoration, image URLs and emojis. */
export function countArticleWords(markdown: string): number {
  const visible = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*\d+[.)]\s+/gm, "");
  return visible.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}