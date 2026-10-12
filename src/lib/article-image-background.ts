/** Replace only the requested inline image, even if selection changes while processing. */
export async function removeArticleImageBackground(
  editor: HTMLElement,
  image: HTMLImageElement,
  removeBg: (source: string) => Promise<string | null>,
): Promise<boolean> {
  if (!editor.contains(image)) return false;
  const id = image.dataset.editorImgId;
  const source = image.getAttribute("src") || "";
  if (!source) return false;
  const url = await removeBg(image.src);
  if (!url) return false;
  const current = editor.contains(image)
    ? image
    : Array.from(editor.querySelectorAll("img")).find(
        (candidate) => id && candidate.dataset.editorImgId === id,
      );
  if (!current || current.getAttribute("src") !== source) return false;
  current.src = url;
  delete current.dataset.originalSrc;
  current.dataset.transparent = "true";
  current.style.background = "transparent";
  current.style.border = "none";
  current.style.boxShadow = "none";
  current.closest("figure")?.setAttribute("data-transparent", "true");
  return true;
}