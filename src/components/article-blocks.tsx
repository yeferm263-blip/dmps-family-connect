/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Info,
  TriangleAlert,
  CircleCheck,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  X,
  ZoomIn,
} from "lucide-react";

import type { Block } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import {
  CanvaSvgMaskDefs,
  syncArticleCanvasMinHeight,
} from "@/components/canva-image-direct-editor";

function normalizeVideoEmbed(url: string): { type: "iframe" | "video"; embedUrl: string } {
  if (!url) return { type: "iframe", embedUrl: "" };
  const trimmed = url.trim();

  // Direct video file (mp4, webm, ogg, mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { type: "video", embedUrl: trimmed };
  }

  // YouTube URLs (watch, embed, short, youtu.be)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (ytMatch?.[1]) {
    return {
      type: "iframe",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
    };
  }

  // Vimeo URLs
  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i,
  );
  if (vimeoMatch?.[1]) {
    return {
      type: "iframe",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0`,
    };
  }

  return { type: "iframe", embedUrl: trimmed };
}

function PhotoGalleryBlock({ block }: { block: any }) {
  const images: Array<{ url: string; alt?: string; caption?: string }> = Array.isArray(
    block.images,
  )
    ? block.images
    : Array.isArray(block.items)
      ? block.items
      : [];
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    alt?: string;
    caption?: string;
  } | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="clear-both my-6 space-y-3">
      {block.title && (
        <h3 className="text-xl font-bold tracking-tight text-foreground">{block.title}</h3>
      )}
      <div
        className={`grid gap-3 ${
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {images.map((img, i) => (
          <figure
            key={i}
            onClick={() => setSelectedImage(img)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/50"
          >
            <div className="aspect-4/3 w-full overflow-hidden">
              <img
                src={img.url}
                alt={img.alt || `Foto ${i + 1}`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="rounded-full bg-black/60 p-2 text-white shadow-sm">
                <ZoomIn className="size-4" />
              </span>
            </div>
            {img.caption && (
              <figcaption className="p-2.5 text-xs font-medium text-muted-foreground truncate">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.alt || ""}
              className="max-h-[75vh] w-auto object-contain mx-auto"
            />
            {selectedImage.caption && (
              <div className="p-4 text-center text-sm font-semibold text-foreground bg-card border-t border-border">
                {selectedImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KeyDatesBlock({ block }: { block: any }) {
  const events: Array<{
    date: string;
    title: string;
    time?: string;
    location?: string;
    description?: string;
  }> = Array.isArray(block.events)
    ? block.events
    : Array.isArray(block.dates)
      ? block.dates
      : [];

  if (events.length === 0) return null;

  return (
    <div className="clear-both my-6 space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-primary font-bold text-base sm:text-lg">
        <Calendar className="size-5 shrink-0" />
        <h3>{block.title || "Fechas Clave y Próximos Eventos"}</h3>
      </div>
      <div className="divide-y divide-border/60">
        {events.map((ev, i) => (
          <div
            key={i}
            className="py-3.5 first:pt-2 last:pb-1 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
          >
            <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-center sm:justify-center rounded-xl bg-card px-3.5 py-1.5 sm:size-16 sm:p-0 border border-border shadow-2xs">
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                {ev.date.split(" ")[0] || "Fecha"}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-foreground">
                {ev.date.split(" ").slice(1).join(" ") || ev.date}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-base text-foreground">{ev.title}</h4>
              {(ev.time || ev.location) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                  {ev.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5 text-primary" />
                      {ev.time}
                    </span>
                  )}
                  {ev.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-primary" />
                      {ev.location}
                    </span>
                  )}
                </div>
              )}
              {ev.description && (
                <p className="text-sm text-foreground/85 leading-relaxed pt-0.5">
                  {ev.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CALLOUT = {
  info: {
    wrap: "border-primary/25 bg-primary/10 text-primary-foreground",
    Icon: Info,
    tone: "text-primary",
  },
  important: {
    wrap: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
    Icon: TriangleAlert,
    tone: "text-amber-500",
  },
  warning: {
    wrap: "border-warning/40 bg-warning/10 text-warning-foreground",
    Icon: TriangleAlert,
    tone: "text-warning-foreground",
  },
  urgent: {
    wrap: "border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100",
    Icon: TriangleAlert,
    tone: "text-rose-500",
  },
  success: {
    wrap: "border-leaf/40 bg-leaf/10 text-leaf-foreground",
    Icon: CircleCheck,
    tone: "text-leaf-foreground",
  },
  verified: {
    wrap: "border-leaf/40 bg-leaf/10 text-leaf-foreground",
    Icon: CircleCheck,
    tone: "text-leaf-foreground",
  },
  luxury: {
    wrap: "border-amber-500/50 bg-slate-950 text-amber-400 shadow-md",
    Icon: Sparkles,
    tone: "text-amber-400",
  },
} as const;

function FormattedText({ text, className = "" }: { text?: string; className?: string }) {
  if (!text) return null;

  // Convert markdown **bold** to <strong>bold</strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert markdown [text](url) to <a href="url" target="_blank" rel="noopener noreferrer" class="text-primary font-bold underline">$1</a>
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary font-bold underline">$1</a>',
  );

  const hasHtml = html.includes("<") || html.includes(">");

  if (hasHtml) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <span className={className}>{text}</span>;
}

export function ArticleBlocks({ blocks }: { blocks: Block[] }) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const syncAll = () => {
      root
        .querySelectorAll<HTMLElement>(".article-rendered-content")
        .forEach((el) => syncArticleCanvasMinHeight(el));
    };
    syncAll();
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    imgs.forEach((img) => img.addEventListener("load", syncAll));
    const timer = setTimeout(syncAll, 150);
    return () => {
      clearTimeout(timer);
      imgs.forEach((img) => img.removeEventListener("load", syncAll));
    };
  }, [blocks]);

  if (!blocks || blocks.length === 0) return null;

  return (
    <>
      <CanvaSvgMaskDefs />
      <div ref={containerRef} className="space-y-6">
        {blocks.map((block: any, index: number) => {
          const key = `${block.type}-${index}`;
          switch (block.type) {
            case "heading": {
              const Tag = (block.level || "h2") as any;
              const sizeClass =
                block.level === "h1"
                  ? "text-3xl sm:text-4xl font-extrabold"
                  : block.level === "h3"
                    ? "text-xl sm:text-2xl font-bold"
                    : block.level === "h4"
                      ? "text-lg font-bold"
                      : "text-2xl sm:text-3xl font-extrabold";

              return (
                <Tag
                  key={key}
                  className={`pt-2 tracking-tight ${sizeClass}`}
                  style={{
                    color: block.color || undefined,
                    textAlign: block.align || "left",
                  }}
                >
                  <FormattedText text={block.text} />
                </Tag>
              );
            }

            case "paragraph": {
              const hasInlineImages =
                Array.isArray(block.inlineImages) && block.inlineImages.length > 0;
              const textContent = block.text || "";
              let html = textContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
              html = html.replace(
                /\[(.*?)\]\((.*?)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary font-bold underline">$1</a>',
              );
              const isHtml = html.includes("<") || html.includes(">");

              if (isHtml) {
                return (
                  <div
                    key={key}
                    className="article-rendered-content clear-both leading-relaxed font-sans text-foreground/90 transition-colors"
                    style={{
                      color: block.color || undefined,
                      backgroundColor: block.bgColor || undefined,
                      textAlign: block.align || "left",
                      fontSize:
                        block.fontSize === "sm"
                          ? "0.95rem"
                          : block.fontSize === "lg"
                            ? "1.2rem"
                            : block.fontSize === "xl"
                              ? "1.35rem"
                              : undefined,
                      padding: block.bgColor ? "1rem" : undefined,
                      borderRadius: block.bgColor ? "1rem" : undefined,
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              }

              return (
                <div
                  key={key}
                  className="article-rendered-content clear-both leading-relaxed font-sans text-foreground/90 transition-colors"
                  style={{
                    color: block.color || undefined,
                    backgroundColor: block.bgColor || undefined,
                    textAlign: block.align || "left",
                    fontSize:
                      block.fontSize === "sm"
                        ? "0.95rem"
                        : block.fontSize === "lg"
                          ? "1.2rem"
                          : block.fontSize === "xl"
                            ? "1.35rem"
                            : undefined,
                    padding: block.bgColor ? "1rem" : undefined,
                    borderRadius: block.bgColor ? "1rem" : undefined,
                  }}
                >
                  {/* Render inline or floating images attached to this paragraph */}
                  {hasInlineImages &&
                    block.inlineImages.map((img: any, imgIdx: number) => {
                      const isImgTransparent = Boolean(
                        img.transparent ||
                        (img.url &&
                          (img.url.startsWith("data:image/svg") ||
                            img.url.includes(".svg") ||
                            img.url.includes("transparent"))),
                      );
                      return (
                        <img
                          key={imgIdx}
                          src={img.url}
                          alt={img.alt || ""}
                          loading="lazy"
                          data-transparent={isImgTransparent ? "true" : "false"}
                          className={`transition-transform hover:scale-[1.01] ${
                            isImgTransparent
                              ? "bg-transparent border-0 shadow-none drop-shadow-md object-contain"
                              : "rounded-2xl border border-border/80 object-cover shadow-sm"
                          } ${
                            img.align === "left"
                              ? "float-left mr-5 mb-3 max-w-[45%] sm:max-w-[35%]"
                              : img.align === "right"
                                ? "float-right ml-5 mb-3 max-w-[45%] sm:max-w-[35%]"
                                : "mx-auto mb-4 block max-w-full"
                          }`}
                        />
                      );
                    })}

                  <p>{textContent}</p>
                  <div className="clear-both" />
                </div>
              );
            }

            case "image": {
              const isTransparent = Boolean(
                block.transparent ||
                block.noBackground ||
                (block.url &&
                  (block.url.startsWith("data:image/svg") ||
                    block.url.includes(".svg") ||
                    block.url.includes("transparent"))),
              );

              const alignClass =
                block.align === "left"
                  ? "float-left mr-6 mb-4 max-w-[45%]"
                  : block.align === "right"
                    ? "float-right ml-6 mb-4 max-w-[45%]"
                    : block.align === "full"
                      ? "w-full"
                      : block.width === "small"
                        ? "mx-auto max-w-[25%]"
                        : block.width === "medium"
                          ? "mx-auto max-w-[50%]"
                          : block.width === "large"
                            ? "mx-auto max-w-[75%]"
                            : "mx-auto w-full";

              const ImageElement = (
                <img
                  src={block.url}
                  alt={block.alt || ""}
                  loading="lazy"
                  data-transparent={isTransparent ? "true" : "false"}
                  className={`w-full transition-transform hover:scale-[1.005] ${
                    isTransparent
                      ? "bg-transparent border-0 shadow-none drop-shadow-md object-contain"
                      : "rounded-2xl border border-border/80 object-cover shadow-soft"
                  }`}
                />
              );

              return (
                <figure
                  key={key}
                  data-transparent={isTransparent ? "true" : undefined}
                  className={`space-y-2 clear-both ${alignClass}`}
                >
                  {block.linkUrl ? (
                    <a
                      href={block.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {ImageElement}
                    </a>
                  ) : (
                    ImageElement
                  )}
                  {block.caption ? (
                    <figcaption className="text-center text-sm font-medium text-muted-foreground">
                      {block.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }

            case "callout": {
              const styleKey = (block.level || block.variant || "info") as keyof typeof CALLOUT;
              const style = CALLOUT[styleKey] || CALLOUT.info;
              const Icon = style.Icon;

              return (
                <div
                  key={key}
                  className={`clear-both flex gap-3.5 rounded-2xl border p-4 sm:p-5 shadow-xs ${style.wrap}`}
                  style={{
                    textAlign: block.align || "left",
                  }}
                >
                  <Icon className={`mt-0.5 size-5 shrink-0 ${style.tone}`} aria-hidden="true" />
                  <div className="flex flex-col gap-1 min-w-0">
                    {block.title ? (
                      <h4 className="font-bold text-base">
                        <FormattedText text={block.title} />
                      </h4>
                    ) : null}
                    <div className="text-base font-semibold leading-relaxed">
                      <FormattedText text={block.text} />
                    </div>
                  </div>
                </div>
              );
            }

            case "button":
            case "link": {
              return (
                <div
                  key={key}
                  className="clear-both py-2"
                  style={{ textAlign: block.align || "left" }}
                >
                  <a
                    href={block.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center gap-2.5 rounded-2xl px-6 py-3 text-base font-bold shadow-soft transition-all hover:opacity-95 hover:shadow-md"
                    style={{
                      backgroundColor: block.bgColor || "#3b82f6",
                      color: block.textColor || "#ffffff",
                    }}
                  >
                    {block.text || block.label || t("articleBlocks.viewMore")}
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </div>
              );
            }

            case "list":
              return (
                <ul key={key} className="clear-both space-y-3 pl-1">
                  {(block.items || []).map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-lg leading-relaxed text-foreground/90">
                      <span
                        className="mt-2.5 size-2 shrink-0 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <FormattedText text={item} />
                    </li>
                  ))}
                </ul>
              );

            case "video": {
              const { type: videoType, embedUrl } = normalizeVideoEmbed(block.url);
              return (
                <figure key={key} className="clear-both space-y-2">
                  <div className="aspect-video overflow-hidden rounded-2xl border border-border shadow-soft bg-black/90">
                    {videoType === "video" ? (
                      <video
                        src={embedUrl}
                        controls
                        playsInline
                        className="size-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={embedUrl}
                        title={block.title || block.caption || "Video"}
                        loading="lazy"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="size-full"
                      />
                    )}
                  </div>
                  {block.title || block.caption ? (
                    <figcaption className="text-center text-sm font-medium text-muted-foreground">
                      {block.title || block.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            }

            case "gallery":
            case "photos":
              return <PhotoGalleryBlock key={key} block={block} />;

            case "key_dates":
            case "dates":
            case "timeline":
              return <KeyDatesBlock key={key} block={block} />;

            case "divider":
              return <hr key={key} className="my-6 border-t-2 border-dashed border-border/80" />;

            default:
              return null;
          }
        })}
      </div>
    </>
  );
}
