import { describe, expect, it } from "vitest";
import { removeArticleImageBackground } from "../lib/article-image-background";

describe("inline article background removal", () => {
  it("replaces only the clicked image and preserves its layout", async () => {
    const editor = document.createElement("div");
    editor.innerHTML = '<img src="https://example.com/one.png" style="width: 120px; transform: rotate(15deg)"><img src="https://example.com/two.png">';
    const [first, second] = Array.from(editor.querySelectorAll("img"));
    if (!first || !second) throw new Error("Missing test images");
    const result = await removeArticleImageBackground(editor, second, async (source) => {
      expect(source).toBe("https://example.com/two.png");
      return "https://example.com/transparent.png";
    });
    expect(result).toBe(true);
    expect(first.getAttribute("src")).toBe("https://example.com/one.png");
    expect(first.style.width).toBe("120px");
    expect(second.getAttribute("src")).toBe("https://example.com/transparent.png");
    expect(second.dataset.transparent).toBe("true");
  });

  it("keeps the original image when the service fails", async () => {
    const editor = document.createElement("div");
    const image = document.createElement("img");
    image.src = "https://example.com/original.png";
    editor.append(image);
    expect(await removeArticleImageBackground(editor, image, async () => null)).toBe(false);
    expect(image.src).toBe("https://example.com/original.png");
  });

  it("does not overwrite an image changed while processing", async () => {
    const editor = document.createElement("div");
    const image = document.createElement("img");
    image.src = "https://example.com/original.png";
    editor.append(image);
    const result = await removeArticleImageBackground(editor, image, async () => {
      image.src = "https://example.com/replacement.png";
      return "https://example.com/transparent.png";
    });
    expect(result).toBe(false);
    expect(image.src).toBe("https://example.com/replacement.png");
  });
});