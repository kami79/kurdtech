import { Article } from "@/types";
import { CATEGORIES } from "@/data/articles";

export interface AnalyticsEvent {
  id: string;
  timestamp: number; // ms epoch
  dateKey: string; // YYYY-MM-DD
  hourKey: number; // 0-23
  visitorId: string;
  path: string;
  articleId?: string;
  device: "mobile" | "desktop" | "tablet";
  referrer: string;
}

export interface AnalyticsStoreData {
  events: AnalyticsEvent[];
}

export interface TimeSeriesPoint {
  label: string;
  subLabel?: string;
  dateKey: string;
  views: number;
  visitors: number;
}

export interface PeriodStats {
  views: number;
  uniqueVisitors: number;
  articleViews: number;
  topPages: { path: string; label: string; views: number; visitors: number }[];
}

export interface RealTimeAnalyticsReport {
  liveVisitorsNow: number;
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  allTimeRecordedViews: number;
  allTimeUniqueVisitors: number;
  hourlySeries: TimeSeriesPoint[]; // 24 hours (for "day" view)
  daily7Series: TimeSeriesPoint[]; // 7 days (for "week" view)
  daily30Series: TimeSeriesPoint[]; // 30 days (for "month" view)
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
    mobilePct: number;
    desktopPct: number;
    tabletPct: number;
  };
  referrers: { source: string; count: number; pct: number }[];
  recentEvents: {
    timestamp: number;
    path: string;
    label: string;
    device: "mobile" | "desktop" | "tablet";
    referrer: string;
  }[];
}

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

const KURDISH_WEEKDAYS = [
  "یەکشەممە",
  "دووشەممە",
  "سێشەممە",
  "چوارشەممە",
  "پێنجشەممە",
  "هەینی",
  "شەممە",
];

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

export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPathLabel(path: string, articles: Article[]): string {
  if (!path || path === "/") return "پەڕەی سەرەکی (Home)";
  if (path === "/admin") return "ستۆدیۆی بەڕێوەبردن (/admin)";
  if (path === "/prices") return "نرخی بازاڕ (/prices)";
  if (path === "/compare") return "بەراوردکاری ئامێرەکان (/compare)";
  if (path === "/advisor") return "ڕاوێژکاری زیرەکی دەستکرد (/advisor)";
  if (path === "/community") return "کۆمەڵگەی کوردتێک (/community)";
  if (path === "/saved") return "پاشەکەوتکراوەکان (/saved)";
  if (path === "/profile") return "پڕۆفایلی بەکارهێنەر (/profile)";

  if (path.startsWith("/category/")) {
    const slug = path.replace("/category/", "").split("?")[0];
    const cat = CATEGORIES.find((c) => c.slug === slug);
    return cat ? `بەشی: ${cat.name}` : `بەشی: ${slug}`;
  }

  if (path.startsWith("/articles/")) {
    const id = decodeURIComponent(path.replace("/articles/", "").split("?")[0]);
    const art = articles.find((a) => a.id === id);
    return art ? art.title : `بابەت: ${id}`;
  }

  return path;
}

function buildPeriodStats(events: AnalyticsEvent[], articles: Article[]): PeriodStats {
  const visitors = new Set<string>();
  let articleViews = 0;
  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();

  for (const ev of events) {
    visitors.add(ev.visitorId);
    if (ev.articleId || ev.path.startsWith("/articles/")) {
      articleViews++;
    }
    const existing = pageMap.get(ev.path) || { views: 0, visitors: new Set<string>() };
    existing.views += 1;
    existing.visitors.add(ev.visitorId);
    pageMap.set(ev.path, existing);
  }

  const topPages = Array.from(pageMap.entries())
    .map(([path, info]) => ({
      path,
      label: formatPathLabel(path, articles),
      views: info.views,
      visitors: info.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    views: events.length,
    uniqueVisitors: visitors.size,
    articleViews,
    topPages,
  };
}

export function computeRealTimeAnalytics(
  events: AnalyticsEvent[],
  articles: Article[],
  nowMs: number = Date.now()
): RealTimeAnalyticsReport {
  const now = new Date(nowMs);
  const todayKey = getDateKey(now);

  const fifteenMinAgo = nowMs - 15 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;

  const liveVisitorSet = new Set<string>();
  const allTimeVisitorSet = new Set<string>();

  const todayEvents: AnalyticsEvent[] = [];
  const weekEvents: AnalyticsEvent[] = [];
  const monthEvents: AnalyticsEvent[] = [];

  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;

  const referrerMap = new Map<string, number>();

  for (const ev of events) {
    allTimeVisitorSet.add(ev.visitorId);

    if (ev.timestamp >= fifteenMinAgo) {
      liveVisitorSet.add(ev.visitorId);
    }
    if (ev.dateKey === todayKey || ev.timestamp >= startOfToday) {
      todayEvents.push(ev);
    }
    if (ev.timestamp >= sevenDaysAgo) {
      weekEvents.push(ev);
    }
    if (ev.timestamp >= thirtyDaysAgo) {
      monthEvents.push(ev);
    }

    if (ev.device === "mobile") mobileCount++;
    else if (ev.device === "tablet") tabletCount++;
    else desktopCount++;

    const ref = ev.referrer || "ڕاستەوخۆ (Direct)";
    referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
  }

  // 1. Hourly series for Today (24 buckets: 00:00 to 23:00)
  const hourlySeries: TimeSeriesPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const bucketEvents = todayEvents.filter((e) => {
      const hour = typeof e.hourKey === "number" ? e.hourKey : new Date(e.timestamp).getHours();
      return hour === h;
    });
    const vis = new Set(bucketEvents.map((e) => e.visitorId));
    hourlySeries.push({
      label: `${String(h).padStart(2, "0")}:00`,
      subLabel: h < 12 ? "بەیانی" : "دوای نیوەڕۆ",
      dateKey: `${todayKey}-${h}`,
      views: bucketEvents.length,
      visitors: vis.size,
    });
  }

  // 2. Daily series for Last 7 Days
  const daily7Series: TimeSeriesPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday - i * 24 * 60 * 60 * 1000);
    const key = getDateKey(d);
    const dayEvents = events.filter((e) => e.dateKey === key);
    const vis = new Set(dayEvents.map((e) => e.visitorId));
    const weekdayName = i === 0 ? "ئەمڕۆ" : i === 1 ? "دوێنێ" : KURDISH_WEEKDAYS[d.getDay()];
    daily7Series.push({
      label: weekdayName,
      subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      dateKey: key,
      views: dayEvents.length,
      visitors: vis.size,
    });
  }

  // 3. Daily series for Last 30 Days
  const daily30Series: TimeSeriesPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfToday - i * 24 * 60 * 60 * 1000);
    const key = getDateKey(d);
    const dayEvents = events.filter((e) => e.dateKey === key);
    const vis = new Set(dayEvents.map((e) => e.visitorId));
    daily30Series.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      subLabel: KURDISH_WEEKDAYS[d.getDay()],
      dateKey: key,
      views: dayEvents.length,
      visitors: vis.size,
    });
  }

  const totalEventsCount = Math.max(1, events.length);
  const mobilePct = Math.round((mobileCount / totalEventsCount) * 100);
  const tabletPct = Math.round((tabletCount / totalEventsCount) * 100);
  const desktopPct = Math.max(0, 100 - mobilePct - tabletPct);

  const referrers = Array.from(referrerMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      pct: Math.round((count / totalEventsCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const recentEvents = [...events]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
    .map((ev) => ({
      timestamp: ev.timestamp,
      path: ev.path,
      label: formatPathLabel(ev.path, articles),
      device: ev.device,
      referrer: ev.referrer || "ڕاستەوخۆ (Direct)",
    }));

  return {
    liveVisitorsNow: liveVisitorSet.size,
    today: buildPeriodStats(todayEvents, articles),
    week: buildPeriodStats(weekEvents, articles),
    month: buildPeriodStats(monthEvents, articles),
    allTimeRecordedViews: events.length,
    allTimeUniqueVisitors: allTimeVisitorSet.size,
    hourlySeries,
    daily7Series,
    daily30Series,
    devices: {
      mobile: mobileCount,
      desktop: desktopCount,
      tablet: tabletCount,
      mobilePct: events.length === 0 ? 0 : mobilePct,
      desktopPct: events.length === 0 ? 0 : desktopPct,
      tabletPct: events.length === 0 ? 0 : tabletPct,
    },
    referrers,
    recentEvents,
  };
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
