import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOM_ARTICLES_FILE,
  getMergedArticles,
  readCustomArticles,
  withWriteLock,
  writeJsonFile,
} from "@/lib/articleStore";
import { ARTICLES } from "@/data/articles";
import {
  computeSiteAnalytics,
  formatKurdishViews,
  parseArticleViews,
} from "@/lib/analyticsUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const articles = await getMergedArticles();
    const summary = computeSiteAnalytics(articles);
    return NextResponse.json(
      { status: "success", data: summary },
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
    const { articleId } = body || {};

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json(
        { status: "error", message: "articleId is required" },
        { status: 400 }
      );
    }

    const updated = await withWriteLock(async () => {
      const customArticles = await readCustomArticles();
      const idx = customArticles.findIndex((a) => a.id === articleId);

      if (idx >= 0) {
        const currentViews = parseArticleViews(customArticles[idx].views);
        const nextViews = currentViews + 1;
        customArticles[idx] = {
          ...customArticles[idx],
          views: formatKurdishViews(nextViews),
        };
        await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
        return customArticles[idx];
      }

      const defaultArt = ARTICLES.find((a) => a.id === articleId);
      if (defaultArt) {
        const currentViews = parseArticleViews(defaultArt.views);
        const nextViews = currentViews + 1;
        const cloned = {
          ...defaultArt,
          views: formatKurdishViews(nextViews),
        };
        customArticles.unshift(cloned);
        await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
        return cloned;
      }

      return null;
    });

    return NextResponse.json({
      status: "success",
      article: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to record view" },
      { status: 500 }
    );
  }
}

