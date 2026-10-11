import { describe, expect, it } from "vitest";
import { countArticleWords, normalizeArticleWordCount } from "./article-length";

describe("article length", () => {
  it("defaults and bounds the requested length", () => {
    expect(normalizeArticleWordCount(undefined)).toBe(500);
    expect(normalizeArticleWordCount(NaN)).toBe(500);
    expect(normalizeArticleWordCount(20)).toBe(100);
    expect(normalizeArticleWordCount(2000)).toBe(1500);
    expect(normalizeArticleWordCount(349.8)).toBe(350);
  });
  it("counts visible bilingual text, not emojis or Markdown destinations", () => {
    expect(countArticleWords("### 📅 Fechas importantes\n1. Visita [el portal](https://example.com).\n![Foto](https://example.com/foto.jpg)")).toBe(5);
    expect(countArticleWords("💬 Don't forget your family's forms.")).toBe(5);
    expect(countArticleWords("")).toBe(0);
  });
});