import { TECH_NEWS_SOURCES, TechNewsSource } from "./sources";
import { RawNewsItem, parseRssOrAtomXml } from "./feedParser";

// High-impact keywords that increase story importance
const IMPORTANCE_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "openai",
  "chatgpt",
  "gpt-5",
  "gemini",
  "claude",
  "anthropic",
  "apple",
  "iphone",
  "macbook",
  "m4",
  "m5",
  "ios",
  "nvidia",
  "rtx",
  "gpu",
  "blackwell",
  "google",
  "pixel",
  "android",
  "samsung",
  "galaxy",
  "snapdragon",
  "qualcomm",
  "semiconductor",
  "chip",
  "tsmc",
  "quantum",
  "cybersecurity",
  "hack",
  "data breach",
  "breakthrough",
  "launch",
  "release",
  "flagship",
  "fiber",
  "5g",
  "space",
  "spacex",
  "starlink",
];

// Calculate importance score (0 - 100)
export function calculateImportanceScore(item: RawNewsItem, source: TechNewsSource): number {
  let score = source.importanceWeight * 5; // base: 40 - 50

  const fullText = (item.title + " " + item.snippet).toLowerCase();

  // Keyword hits (+3 per keyword, capped at +30)
  let keywordHits = 0;
  for (const kw of IMPORTANCE_KEYWORDS) {
    if (fullText.includes(kw)) {
      keywordHits++;
    }
  }
  score += Math.min(30, keywordHits * 3.5);

  // Recency bonus: last 12h = +15, last 24h = +10, last 48h = +5
  const hoursOld = (Date.now() - item.publishedTimestamp) / (1000 * 60 * 60);
  if (hoursOld <= 12) {
    score += 15;
  } else if (hoursOld <= 24) {
    score += 10;
  } else if (hoursOld <= 48) {
    score += 5;
  } else {
    score -= Math.min(20, (hoursOld - 48) * 0.5);
  }

  // Has good cover image bonus
  if (item.imageUrl) {
    score += 5;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
}

// Fetch single feed with timeout
async function fetchSourceFeed(source: TechNewsSource): Promise<RawNewsItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(source.feedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) KurdTechBot/2.0",
        Accept: "application/rss+xml, application/atom+xml, text/xml, application/xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Failed to fetch ${source.name}: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items = parseRssOrAtomXml(xml, source);

    // Calculate score for each
    return items.map((it) => ({
      ...it,
      importanceScore: calculateImportanceScore(it, source),
    }));
  } catch (err: any) {
    console.warn(`Error fetching ${source.name}: ${err.message}`);
    return [];
  }
}

// Check title similarity to avoid duplicate coverage of same event
function areTitlesSimilar(titleA: string, titleB: string): boolean {
  const wordsA = new Set(
    titleA
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const wordsB = new Set(
    titleB
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  let common = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) common++;
  });

  const minLen = Math.min(wordsA.size, wordsB.size);
  if (minLen === 0) return false;
  return common / minLen > 0.55;
}

// Deduplicate items
function deduplicateNews(items: RawNewsItem[]): RawNewsItem[] {
  const unique: RawNewsItem[] = [];

  for (const item of items) {
    const isDuplicate = unique.some((existing) =>
      areTitlesSimilar(existing.title, item.title)
    );

    if (!isDuplicate) {
      unique.push(item);
    }
  }

  return unique;
}

// Fetch all sources and curate top news with offset, source filtering and rotation support
export async function curateTopTechNews(
  limit: number = 8,
  offset: number = 0,
  filterSource?: string,
  filterCategory?: string
): Promise<{
  topStories: RawNewsItem[];
  allStories: RawNewsItem[];
  sourceStats: { name: string; count: number; icon: string }[];
  scannedAt: string;
  totalAvailable: number;
  nextOffset: number;
}> {
  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    TECH_NEWS_SOURCES.map((s) => fetchSourceFeed(s))
  );

  let combined: RawNewsItem[] = [];
  const sourceStats: { name: string; count: number; icon: string }[] = [];

  results.forEach((res, index) => {
    const source = TECH_NEWS_SOURCES[index];
    if (res.status === "fulfilled" && res.value.length > 0) {
      combined.push(...res.value);
      sourceStats.push({
        name: source.name,
        count: res.value.length,
        icon: source.icon,
      });
    } else {
      sourceStats.push({
        name: source.name,
        count: 0,
        icon: source.icon,
      });
    }
  });

  // Deduplicate overlapping topics
  let deduplicated = deduplicateNews(combined);

  // Optional source filter
  if (filterSource && filterSource !== "all") {
    deduplicated = deduplicated.filter(
      (item) =>
        item.sourceId.toLowerCase() === filterSource.toLowerCase() ||
        item.sourceName.toLowerCase().includes(filterSource.toLowerCase())
    );
  }

  // Optional category filter
  if (filterCategory && filterCategory !== "all") {
    deduplicated = deduplicated.filter(
      (item) => item.categorySlug === filterCategory
    );
  }

  // Sort by importance score descending
  deduplicated.sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0));

  const totalAvailable = deduplicated.length;
  const safeOffset = offset >= totalAvailable ? 0 : Math.max(0, offset);
  const topStories = deduplicated.slice(safeOffset, safeOffset + limit);
  const nextOffset = (safeOffset + limit) % Math.max(1, totalAvailable);

  return {
    topStories,
    allStories: deduplicated,
    sourceStats,
    scannedAt: new Date().toISOString(),
    totalAvailable,
    nextOffset,
  };
}
