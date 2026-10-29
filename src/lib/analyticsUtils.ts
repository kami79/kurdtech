import { Article } from "@/types";
import { CATEGORIES } from "@/data/articles";

const ARABIC_TO_LATIN_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

export function toKurdishDigits(num: number | string): string {
  const kurdishDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/\d/g, (d) => kurdishDigits[Number(d)]);
}

export function parseArticleViews(viewsStr?: string): number {
  if (!viewsStr) return 1;
  const normalized = viewsStr.replace(/[٠-٩۰-۹]/g, (ch) => ARABIC_TO_LATIN_DIGITS[ch] || ch);
  const numMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return 1;
  const value = parseFloat(numMatch[1]);
  if (isNaN(value)) return 1;
  if (viewsStr.includes("هەزار") || normalized.toLowerCase().includes("k")) {
    return Math.round(value * 1000);
  }
  return Math.max(1, Math.round(value));
}

export function formatKurdishViews(count: number): string {
  if (count >= 1000) {
    const k = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return `${toKurdishDigits(k)} هەزار`;
  }
  return `${toKurdishDigits(count)} بینین`;
}

export interface SiteAnalyticsSummary {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  breakingCount: number;
  editorPickCount: number;
  aiCuratedCount: number;
  avgEngagementPerArticle: number;
  categoryBreakdown: {
    slug: string;
    name: string;
    articleCount: number;
    views: number;
    likes: number;
    percentageOfViews: number;
  }[];
  sourceBreakdown: {
    name: string;
    count: number;
    views: number;
  }[];
  topArticles: {
    id: string;
    title: string;
    category: string;
    viewsCount: number;
    viewsLabel: string;
    likesCount: number;
    commentsCount: number;
  }[];
}

export function computeSiteAnalytics(articles: Article[]): SiteAnalyticsSummary {
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let breakingCount = 0;
  let editorPickCount = 0;
  let aiCuratedCount = 0;

  const catMap = new Map<
    string,
    { slug: string; name: string; articleCount: number; views: number; likes: number }
  >();

  CATEGORIES.filter((c) => c.slug !== "all").forEach((c) => {
    catMap.set(c.slug, {
      slug: c.slug,
      name: c.name,
      articleCount: 0,
      views: 0,
      likes: 0,
    });
  });

  const sourceMap = new Map<string, { name: string; count: number; views: number }>();

  const rankedArticles = articles.map((art) => {
    const v = parseArticleViews(art.views);
    const l = art.likesCount || 0;
    const c = art.comments ? art.comments.length : art.commentsCount || 0;

    totalViews += v;
    totalLikes += l;
    totalComments += c;
    if (art.isBreaking) breakingCount++;
    if (art.isEditorPick) editorPickCount++;
    if (
      art.id.startsWith("agent-") ||
      art.id.startsWith("art-") ||
      art.author?.name?.includes("ئەیجێنت")
    ) {
      aiCuratedCount++;
    }

    const slug = art.categorySlug || "ai";
    const existingCat = catMap.get(slug) || {
      slug,
      name: art.category || slug,
      articleCount: 0,
      views: 0,
      likes: 0,
    };
    existingCat.articleCount += 1;
    existingCat.views += v;
    existingCat.likes += l;
    catMap.set(slug, existingCat);

    // Determine source attribution
    let srcName = art.originalSource?.name || "";
    if (!srcName && art.author?.role) {
      const m = art.author.role.match(/\(([^)]+)\)/);
      if (m) srcName = m[1];
    }
    if (!srcName && art.tags) {
      const knownSources = ["The Verge", "TechCrunch", "9to5Mac", "Ars Technica", "Engadget", "Wired"];
      const matched = art.tags.find((t) => knownSources.includes(t));
      if (matched) srcName = matched;
    }
    if (!srcName) {
      srcName = "دەستەی نووسەرانی کوردتێک";
    }

    const existingSrc = sourceMap.get(srcName) || { name: srcName, count: 0, views: 0 };
    existingSrc.count += 1;
    existingSrc.views += v;
    sourceMap.set(srcName, existingSrc);

    return {
      id: art.id,
      title: art.title,
      category: art.category,
      viewsCount: v,
      viewsLabel: formatKurdishViews(v),
      likesCount: l,
      commentsCount: c,
    };
  });

  const categoryBreakdown = Array.from(catMap.values())
    .map((item) => ({
      ...item,
      percentageOfViews: totalViews > 0 ? Math.round((item.views / totalViews) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views);

  const sourceBreakdown = Array.from(sourceMap.values()).sort((a, b) => b.count - a.count);

  const topArticles = rankedArticles
    .sort((a, b) => b.viewsCount + b.likesCount * 10 - (a.viewsCount + a.likesCount * 10))
    .slice(0, 6);

  const avgEngagementPerArticle =
    articles.length > 0 ? Math.round((totalLikes + totalComments) / articles.length) : 0;

  return {
    totalArticles: articles.length,
    totalViews,
    totalLikes,
    totalComments,
    breakingCount,
    editorPickCount,
    aiCuratedCount,
    avgEngagementPerArticle,
    categoryBreakdown,
    sourceBreakdown,
    topArticles,
  };
}

