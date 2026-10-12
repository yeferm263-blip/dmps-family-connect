import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { getArticleReactions, toggleArticleReaction } from "@/lib/article-reactions";

interface ArticleReactionButtonProps {
  articleId: string;
  articleTitle?: string;
  variant?: "compact" | "prominent" | "minimal";
  initialCount?: number;
  className?: string;
}

export function ArticleReactionButton({
  articleId,
  articleTitle,
  variant = "prominent",
  initialCount,
  className = "",
}: ArticleReactionButtonProps) {
  const [data, setData] = useState(() => getArticleReactions(articleId, initialCount));
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setData(getArticleReactions(articleId, initialCount));

    const handleReactionChange = (e: Event) => {
      const custom = e as CustomEvent<{
        articleId: string;
        likesCount: number;
        isLiked: boolean;
      }>;
      if (custom.detail?.articleId === articleId) {
        setData({
          likesCount: custom.detail.likesCount,
          isLiked: custom.detail.isLiked,
        });
      }
    };

    window.addEventListener("dmps_article_reaction_changed", handleReactionChange);
    return () => {
      window.removeEventListener("dmps_article_reaction_changed", handleReactionChange);
    };
  }, [articleId, initialCount]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;
    setIsPending(true);

    try {
      const result = await toggleArticleReaction(articleId);
      setData(result);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      if (result.isLiked) {
        toast.success(
          articleTitle ? `¡Te gusta "${articleTitle.slice(0, 32)}..."!` : "¡Gracias por tu apoyo!",
          {
            description: "Tu reacción ayuda a resaltar información útil para las familias.",
            duration: 2500,
          }
        );
      }
    } catch {
      // Ignore error
    } finally {
      setTimeout(() => setIsPending(false), 250);
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={data.isLiked ? "Ya no me gusta" : "Me gusta este artículo"}
        title={data.isLiked ? "Quitar Me Gusta" : "Me Gusta"}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
          data.isLiked
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            : "bg-muted/80 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 border border-border/60"
        } ${className}`}
      >
        <Heart
          className={`size-3.5 transition-transform duration-300 ${
            data.isLiked
              ? "fill-rose-500 text-rose-500"
              : "text-muted-foreground group-hover:text-rose-500"
          } ${isAnimating ? "scale-125 rotate-12" : "scale-100"}`}
        />
        <span className="tabular-nums font-semibold">{data.likesCount}</span>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        aria-label={data.isLiked ? "Ya no me gusta" : "Me gusta"}
        title={data.isLiked ? "Ya no me gusta" : "Me gusta"}
        className={`group relative flex size-9 items-center justify-center rounded-xl transition-all duration-200 ${
          data.isLiked
            ? "bg-rose-500/15 text-rose-600 border border-rose-500/30 shadow-2xs"
            : "bg-secondary/80 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 border border-border"
        } ${className}`}
      >
        <Heart
          className={`size-4 transition-transform duration-300 ${
            data.isLiked ? "fill-rose-500 text-rose-500" : ""
          } ${isAnimating ? "scale-125" : "scale-100"}`}
        />
      </button>
    );
  }

  // Default "prominent" variant (used in article detail)
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={data.isLiked}
        aria-label={data.isLiked ? "Ya no me gusta este artículo" : "Me gusta este artículo"}
        className={`group relative inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs ${
          data.isLiked
            ? "bg-rose-500 text-white hover:bg-rose-600 border border-rose-600 shadow-rose-500/20 shadow-md"
            : "bg-background text-foreground border border-border hover:border-rose-500/50 hover:bg-rose-50/50 hover:text-rose-600 dark:hover:bg-rose-950/20"
        }`}
      >
        <Heart
          className={`size-4.5 transition-transform duration-300 ${
            data.isLiked
              ? "fill-white text-white"
              : "text-muted-foreground group-hover:text-rose-500 group-hover:fill-rose-500/20"
          } ${isAnimating ? "scale-135 rotate-12" : "scale-100"}`}
        />
        <span>{data.isLiked ? "Te gusta" : "Me gusta"}</span>
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-xs font-extrabold tabular-nums ${
            data.isLiked
              ? "bg-white/25 text-white"
              : "bg-muted text-muted-foreground group-hover:bg-rose-500/10 group-hover:text-rose-600"
          }`}
        >
          {data.likesCount}
        </span>
      </button>
    </div>
  );
}
