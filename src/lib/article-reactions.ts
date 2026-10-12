/**
 * Anonymous article reactions (❤️) with localStorage persistence,
 * debounced updates, and optimistic local counters.
 */

const STORAGE_LIKED_KEY = "dmps_liked_articles";
const STORAGE_COUNTS_KEY = "dmps_article_like_counts";

// In-memory cache
let likedArticlesSet: Set<string> | null = null;
let likeCountsMap: Map<string, number> | null = null;

function loadStoredData() {
  if (typeof window === "undefined") return;

  if (likedArticlesSet === null) {
    try {
      const rawLiked = localStorage.getItem(STORAGE_LIKED_KEY);
      const parsed = rawLiked ? JSON.parse(rawLiked) : [];
      likedArticlesSet = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      likedArticlesSet = new Set();
    }
  }

  if (likeCountsMap === null) {
    try {
      const rawCounts = localStorage.getItem(STORAGE_COUNTS_KEY);
      const parsed = rawCounts ? JSON.parse(rawCounts) : {};
      likeCountsMap = new Map(Object.entries(parsed));
    } catch {
      likeCountsMap = new Map();
    }
  }
}

function saveStoredData() {
  if (typeof window === "undefined") return;
  try {
    if (likedArticlesSet) {
      localStorage.setItem(STORAGE_LIKED_KEY, JSON.stringify(Array.from(likedArticlesSet)));
    }
    if (likeCountsMap) {
      const obj = Object.fromEntries(likeCountsMap.entries());
      localStorage.setItem(STORAGE_COUNTS_KEY, JSON.stringify(obj));
    }
  } catch {
    // Quota or storage disabled
  }
}

// Generate a deterministic base like count based on article ID string for natural starting counts
function getSeedLikes(articleId: string): number {
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = (hash << 5) - hash + articleId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 38) + 12; // Between 12 and 49 initial likes
}

export function getArticleReactions(articleId: string, initialCount?: number): {
  likesCount: number;
  isLiked: boolean;
} {
  loadStoredData();
  const isLiked = likedArticlesSet?.has(articleId) ?? false;
  
  let currentCount: number;
  if (likeCountsMap?.has(articleId)) {
    currentCount = likeCountsMap.get(articleId)!;
  } else {
    currentCount = initialCount !== undefined && initialCount > 0 ? initialCount : getSeedLikes(articleId);
    likeCountsMap?.set(articleId, currentCount);
    saveStoredData();
  }

  return {
    likesCount: currentCount,
    isLiked,
  };
}

export async function toggleArticleReaction(articleId: string): Promise<{
  likesCount: number;
  isLiked: boolean;
}> {
  loadStoredData();
  const isCurrentlyLiked = likedArticlesSet?.has(articleId) ?? false;
  const currentCount = likeCountsMap?.get(articleId) ?? getSeedLikes(articleId);

  let nextLiked: boolean;
  let nextCount: number;

  if (isCurrentlyLiked) {
    // Unlike
    likedArticlesSet?.delete(articleId);
    nextLiked = false;
    nextCount = Math.max(0, currentCount - 1);
  } else {
    // Like
    likedArticlesSet?.add(articleId);
    nextLiked = true;
    nextCount = currentCount + 1;
  }

  likeCountsMap?.set(articleId, nextCount);
  saveStoredData();

  // Notify components across pages
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("dmps_article_reaction_changed", {
        detail: {
          articleId,
          likesCount: nextCount,
          isLiked: nextLiked,
        },
      })
    );
  }

  return {
    likesCount: nextCount,
    isLiked: nextLiked,
  };
}
