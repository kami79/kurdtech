export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80",
  mobile: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80",
  hardware: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
  reviews: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80",
  gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000&auto=format&fit=crop&q=80",
  science: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
  kurdistan: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
};

export function getCategoryFallbackImage(categorySlug?: string): string {
  if (categorySlug && CATEGORY_FALLBACK_IMAGES[categorySlug]) {
    return CATEGORY_FALLBACK_IMAGES[categorySlug];
  }
  return CATEGORY_FALLBACK_IMAGES.ai;
}

export function getSafeImageUrl(url?: string, categorySlug?: string): string {
  const fallback = getCategoryFallbackImage(categorySlug);
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }

  let cleaned = url
    .replace(/&#038;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/21780efad99a/g, "21780ecad995")
    .trim();

  // Catch broken synthetic / future-dated feed image paths that return 404
  if (
    cleaned.includes("l-intro-1793266804.jpg") ||
    cleaned.includes("/uploads/sites/6/2026/") ||
    cleaned.includes("/uploads/sites/2/2026/") ||
    cleaned.includes("/uploads/2026/")
  ) {
    return fallback;
  }

  return cleaned;
}

