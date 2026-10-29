import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  CUSTOM_ARTICLES_FILE,
  getMergedArticles,
  readCustomArticles,
  readJsonFile,
  withWriteLock,
  writeJsonFile,
} from "@/lib/articleStore";
import { ARTICLES } from "@/data/articles";
import {
  AnalyticsEvent,
  AnalyticsStoreData,
  computeRealTimeAnalytics,
  computeSiteAnalytics,
  formatKurdishViews,
  getDateKey,
  parseArticleViews,
} from "@/lib/analyticsUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ANALYTICS_EVENTS_FILE = path.join(process.cwd(), "src", "data", "analytics-events.json");

async function readAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const store = await readJsonFile<AnalyticsStoreData>(ANALYTICS_EVENTS_FILE, { events: [] });
  return Array.isArray(store?.events) ? store.events : [];
}

function normalizeReferrer(rawRef?: string): string {
  if (!rawRef || !rawRef.trim()) return "ڕاستەوخۆ (Direct)";
  try {
    const url = new URL(rawRef);
    const host = url.hostname.toLowerCase();
    if (host.includes("google.")) return "Google Search";
    if (host.includes("t.me") || host.includes("telegram.")) return "Telegram";
    if (host.includes("facebook.") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("twitter.") || host.includes("x.com")) return "X / Twitter";
    if (host.includes("github.")) return "GitHub";
    if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("kurdtech")) {
      return "ناوخۆیی ماڵپەڕ (Internal)";
    }
    return host;
  } catch {
    return "ڕاستەوخۆ (Direct)";
  }
}

export async function GET() {
  try {
    const [articles, events] = await Promise.all([
      getMergedArticles(),
      readAnalyticsEvents(),
    ]);

    const summary = computeSiteAnalytics(articles);
    const realtime = computeRealTimeAnalytics(events, articles);

    return NextResponse.json(
      {
        status: "success",
        data: summary,
        realtime,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      articleId: rawArticleId,
      path: rawPath,
      visitorId: rawVisitorId,
      device: rawDevice,
      referrer: rawReferrer,
    } = body || {};

    const now = new Date();
    const pagePath =
      typeof rawPath === "string" && rawPath.trim()
        ? rawPath.trim()
        : rawArticleId
        ? `/articles/${rawArticleId}`
        : "/";

    const extractedArticleId =
      typeof rawArticleId === "string" && rawArticleId.trim()
        ? rawArticleId.trim()
        : pagePath.startsWith("/articles/")
        ? decodeURIComponent(pagePath.replace("/articles/", "").split("?")[0])
        : undefined;

    const visitorId =
      typeof rawVisitorId === "string" && rawVisitorId.trim()
        ? rawVisitorId.trim()
        : `anon-${now.getTime()}`;

    const device: "mobile" | "desktop" | "tablet" =
      rawDevice === "mobile" || rawDevice === "tablet" || rawDevice === "desktop"
        ? rawDevice
        : "desktop";

    const newEvent: AnalyticsEvent = {
      id: `ev-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now.getTime(),
      dateKey: getDateKey(now),
      hourKey: now.getHours(),
      visitorId,
      path: pagePath,
      articleId: extractedArticleId,
      device,
      referrer: normalizeReferrer(rawReferrer),
    };

    const result = await withWriteLock(async () => {
      // 1. Append event to analytics-events.json (keep last 40 days, max 5000 events)
      const existingEvents = await readAnalyticsEvents();
      const cutoff = now.getTime() - 40 * 24 * 60 * 60 * 1000;
      const filtered = existingEvents.filter((e) => e.timestamp >= cutoff);
      const updatedEvents = [...filtered, newEvent].slice(-5000);
      await writeJsonFile(ANALYTICS_EVENTS_FILE, { events: updatedEvents });

      // 2. If an article was viewed, increment its view counter
      let updatedArticle = null;
      if (extractedArticleId) {
        const customArticles = await readCustomArticles();
        const idx = customArticles.findIndex((a) => a.id === extractedArticleId);

        if (idx >= 0) {
          const currentViews = parseArticleViews(customArticles[idx].views);
          const nextViews = currentViews + 1;
          customArticles[idx] = {
            ...customArticles[idx],
            views: formatKurdishViews(nextViews),
          };
          await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
          updatedArticle = customArticles[idx];
        } else {
          const defaultArt = ARTICLES.find((a) => a.id === extractedArticleId);
          if (defaultArt) {
            const currentViews = parseArticleViews(defaultArt.views);
            const nextViews = currentViews + 1;
            const cloned = {
              ...defaultArt,
              views: formatKurdishViews(nextViews),
            };
            customArticles.unshift(cloned);
            await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
            updatedArticle = cloned;
          }
        }
      }

      return { updatedArticle, event: newEvent };
    });

    return NextResponse.json({
      status: "success",
      article: result.updatedArticle,
      event: result.event,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to record analytics event" },
      { status: 500 }
    );
  }
}
