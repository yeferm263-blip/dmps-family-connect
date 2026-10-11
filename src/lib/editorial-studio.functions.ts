import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const STUDIO_MARK = "AI Editorial Studio";

async function assertEditor(supabase: any) {
  const { data } = await supabase.rpc("can_manage_content");
  if (!data) throw new Error("No autorizado");
}

async function storeImage(prompt: string) {
  const { generateImage } = await import("./editorial-studio.server");
  const img = await generateImage(prompt);
  const ext = img.mime.includes("jpeg") ? "jpg" : "png";
  const path = `articles/studio-${crypto.randomUUID()}.${ext}`;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let { error } = await supabaseAdmin.storage
      .from("ai-uploads")
      .upload(path, img.data, { contentType: img.mime, upsert: true });

    if (error && (error.message?.includes("bucket") || (error as any).statusCode === 404)) {
      try {
        await supabaseAdmin.storage.createBucket("ai-uploads", { public: true });
        const retry = await supabaseAdmin.storage
          .from("ai-uploads")
          .upload(path, img.data, { contentType: img.mime, upsert: true });
        error = retry.error;
      } catch {
        // ignore
      }
    }

    if (!error) {
      return `/api/public/media/${path}`;
    }
  } catch {
    // fallback to data url
  }

  // Robust data url fallback
  const b64 = Buffer.from(img.data).toString("base64");
  return `data:${img.mime};base64,${b64}`;
}

/** Creates ONE draft article (ES + EN) with research. Never publishes. */
export const generateStudioDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ topic: z.string().max(300).optional(), withImage: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    await assertEditor(sb);
    const { researchArticle, markdownToBlocks } = await import("./editorial-studio.server");
    const [{ data: cats }, { data: existing }] = await Promise.all([
      sb.from("categories").select("id, name"),
      sb.from("articles").select("title").order("created_at", { ascending: false }).limit(80),
    ]);
    const { article, sources, verificationAudit } = await researchArticle({
      topic: data.topic,
      categories: cats ?? [],
      avoidTitles: (existing ?? []).map((r: any) => r.title).filter(Boolean),
    });

    const id = `art_${Date.now()}`;
    const now = new Date().toISOString();
    const slug =
      article.title_es
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 70) + `-${Date.now().toString().slice(-4)}`;

    let imageUrlEs: string | null = null;
    let imageUrlEn: string | null = null;
    let imageError: string | null = null;
    if (data.withImage) {
      try {
        const promptEs =
          article.image_prompt_es ||
          `Editorial cover photo representing: ${article.title_es}. ${article.summary_es}`;
        imageUrlEs = await storeImage(promptEs);
      } catch (e) {
        imageError = (e as Error).message;
      }

      try {
        const promptEn =
          article.image_prompt_en ||
          `Editorial cover photo representing: ${article.title_en}. ${article.summary_en}`;
        imageUrlEn = await storeImage(promptEn);
      } catch {
        // Fall back to Spanish image if English image generation hit rate limits
        imageUrlEn = imageUrlEs;
      }
    }
    const validCat = (cats ?? []).some((c: any) => c.id === article.category_id);
    const cardBanners = {
      es: imageUrlEs || "",
      en: imageUrlEn || imageUrlEs || "",
    };
    const { error } = await sb.from("articles").insert({
      id,
      slug,
      title: article.title_es,
      summary: article.summary_es,
      content: article.content_es,
      status: "draft",
      category_id: validCat ? article.category_id : null,
      featured_image_url: imageUrlEs,
      card_banner_url: imageUrlEs,
      card_banners: cardBanners,
      featured_images: cardBanners,
      image_alt: article.image_alt_es,
      official_url: article.official_url || null,
      source_url: article.official_url || sources[0] || null,
      source_name: article.source_name || null,
      verification_status: "pending",
      admin_note: STUDIO_MARK,
      verification_details: verificationAudit || sources.slice(0, 10).join("\n") || null,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    const tr = [
      [
        "es",
        article.title_es,
        article.summary_es,
        article.content_es,
        imageUrlEs,
        article.image_alt_es,
      ],
      [
        "en",
        article.title_en,
        article.summary_en,
        article.content_en,
        imageUrlEn || imageUrlEs,
        article.image_alt_en || article.image_alt_es,
      ],
    ].map(([lang, title, summary, md, imgUrl, imgAlt]) => ({
      id: `tr_${id}_${lang}`,
      article_id: id,
      language_code: lang,
      title,
      summary,
      content_blocks: markdownToBlocks(md || ""),
      featured_image_url: imgUrl,
      card_banner_url: imgUrl,
      image_alt: imgAlt,
      updated_at: now,
    }));
    const { error: trErr } = await sb.from("article_translations").insert(tr);
    if (trErr) throw new Error(trErr.message);
    return { id, title: article.title_es, imageError };
  });

/** Regenerates only the image; text is never touched. Synchronizes both languages. */
export const regenerateStudioImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as any;
    await assertEditor(sb);
    const { data: row } = await sb
      .from("articles")
      .select("title, summary")
      .eq("id", data.id)
      .single();
    if (!row) throw new Error("Artículo no encontrado");
    const url = await storeImage(
      `Editorial illustration about: ${row.title}. ${row.summary ?? ""}`,
    );
    const now = new Date().toISOString();
    const cardBanners = { es: url, en: url };
    const { error } = await sb
      .from("articles")
      .update({
        featured_image_url: url,
        card_banner_url: url,
        card_banners: cardBanners,
        featured_images: cardBanners,
        updated_at: now,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    // Synchronize article_translations without touching text
    await sb
      .from("article_translations")
      .update({
        featured_image_url: url,
        card_banner_url: url,
        updated_at: now,
      })
      .eq("article_id", data.id);

    return { url };
  });
