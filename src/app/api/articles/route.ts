import { NextRequest, NextResponse } from "next/server";
import { ARTICLES } from "@/data/articles";
import { Article } from "@/types";
import {
  CUSTOM_ARTICLES_FILE,
  DELETED_IDS_FILE,
  getMergedArticles,
  readCustomArticles,
  readDeletedIds,
  withWriteLock,
  writeJsonFile,
} from "@/lib/articleStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
};

const FEATURED_POSITIONS = ["main", "top-left", "bottom-right", "bottom-left"] as const;

const isStr = (v: unknown): v is string => typeof v === "string";
const strArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter(isStr).map((s) => s.trim()).filter(Boolean) : undefined;

function normalizeContent(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return strArray(v);
  if (isStr(v)) return v.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return undefined;
}

/**
 * Whitelist & type-check incoming article fields so clients can't inject
 * arbitrary keys (or change the id) through POST/PUT.
 */
function sanitizeArticleInput(body: any): Partial<Article> {
  const out: Partial<Article> = {};
  if (!body || typeof body !== "object") return out;

  if (isStr(body.title)) out.title = body.title.trim();
  if (isStr(body.excerpt)) out.excerpt = body.excerpt.trim();
  const content = normalizeContent(body.content);
  if (content) out.content = content;
  if (isStr(body.category)) out.category = body.category.trim();
  if (isStr(body.categorySlug)) out.categorySlug = body.categorySlug.trim();
  const tags = strArray(body.tags);
  if (tags) out.tags = tags;
  if (body.author && typeof body.author === "object" && isStr(body.author.name)) {
    out.author = {
      name: body.author.name,
      role: isStr(body.author.role) ? body.author.role : "",
      avatar: isStr(body.author.avatar) ? body.author.avatar : "",
      ...(isStr(body.author.bio) ? { bio: body.author.bio } : {}),
    };
  }
  if (isStr(body.publishedAt)) out.publishedAt = body.publishedAt;
  if (isStr(body.publishedDateIso)) out.publishedDateIso = body.publishedDateIso;
  if (isStr(body.readTime)) out.readTime = body.readTime;
  if (isStr(body.views)) out.views = body.views;
  if (typeof body.likesCount === "number") out.likesCount = body.likesCount;
  if (typeof body.commentsCount === "number") out.commentsCount = body.commentsCount;
  if (Array.isArray(body.comments)) out.comments = body.comments;
  if (isStr(body.imageUrl) && /^https?:\/\//i.test(body.imageUrl.trim())) {
    out.imageUrl = body.imageUrl.trim();
  }
  if ("featuredPosition" in body) {
    out.featuredPosition = FEATURED_POSITIONS.includes(body.featuredPosition)
      ? body.featuredPosition
      : undefined;
  }
  if (typeof body.isBreaking === "boolean") out.isBreaking = body.isBreaking;
  if (typeof body.isEditorPick === "boolean") out.isEditorPick = body.isEditorPick;
  if ("reviewScore" in body) {
    const n = Number(body.reviewScore);
    out.reviewScore =
      body.reviewScore !== null && body.reviewScore !== "" && Number.isFinite(n)
        ? Math.min(10, Math.max(0, n))
        : undefined;
  }
  const pros = strArray(body.pros);
  if (pros) out.pros = pros;
  const cons = strArray(body.cons);
  if (cons) out.cons = cons;
  if (body.specs && typeof body.specs === "object" && !Array.isArray(body.specs)) {
    out.specs = body.specs;
  }
  const metrics = strArray(body.extractedMetrics);
  if (metrics) out.extractedMetrics = metrics;
  if (
    body.originalSource &&
    typeof body.originalSource === "object" &&
    isStr(body.originalSource.name) &&
    isStr(body.originalSource.url)
  ) {
    out.originalSource = { name: body.originalSource.name, url: body.originalSource.url };
  }
  return out;
}

// GET /api/articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q") || searchParams.get("search");
    const isBreaking = searchParams.get("isBreaking");
    const limit = searchParams.get("limit");

    let results = await getMergedArticles();

    if (category && category !== "all") {
      results = results.filter((a) => a.categorySlug === category);
    }

    if (isBreaking === "true") {
      results = results.filter((a) => a.isBreaking === true);
    }

    if (query) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.excerpt?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (limit) {
      const num = parseInt(limit, 10);
      if (!isNaN(num) && num > 0) {
        results = results.slice(0, num);
      }
    }

    return NextResponse.json(
      { status: "success", total: results.length, data: results },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create new article or news
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = sanitizeArticleInput(body);

    if (!input.title || !input.excerpt) {
      return NextResponse.json(
        { status: "error", message: "Title and excerpt are required" },
        { status: 400 }
      );
    }

    const newId =
      isStr(body.id) && body.id.trim()
        ? body.id.trim()
        : `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newArticle: Article = {
      id: newId,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content && input.content.length > 0 ? input.content : [input.excerpt],
      category: input.category || "هەواڵ",
      categorySlug: input.categorySlug || "ai",
      tags: input.tags && input.tags.length > 0 ? input.tags : ["تەکنەلۆژیا", "کوردتێک"],
      author: input.author || {
        name: "ئارام کامەران",
        role: "نووسەری تیمی تەکنیکی",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "نووسەری تەکنیکی لە کوردتێک",
      },
      publishedAt: input.publishedAt || "ئێستا",
      publishedDateIso: input.publishedDateIso || new Date().toISOString(),
      readTime: input.readTime || "٤ خولەک",
      views: input.views || "١ بینین",
      likesCount: input.likesCount ?? 0,
      commentsCount: input.commentsCount ?? 0,
      comments: input.comments || [],
      imageUrl:
        input.imageUrl ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80",
      featuredPosition: input.featuredPosition,
      isBreaking: input.isBreaking ?? false,
      isEditorPick: input.isEditorPick ?? false,
      reviewScore: input.reviewScore,
      pros: input.pros || [],
      cons: input.cons || [],
      specs: input.specs,
      extractedMetrics: input.extractedMetrics,
      originalSource: input.originalSource,
    };

    await withWriteLock(async () => {
      const [customArticles, deletedIds] = await Promise.all([
        readCustomArticles(),
        readDeletedIds(),
      ]);

      // Remove from deleted list if ID was reused
      const updatedDeleted = deletedIds.filter((id) => id !== newId);
      if (updatedDeleted.length !== deletedIds.length) {
        await writeJsonFile(DELETED_IDS_FILE, updatedDeleted);
      }

      const updatedCustom = [newArticle, ...customArticles.filter((a) => a.id !== newId)];
      await writeJsonFile(CUSTOM_ARTICLES_FILE, updatedCustom);
    });

    return NextResponse.json({
      status: "success",
      message: "Article created successfully",
      data: newArticle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to create article" },
      { status: 500 }
    );
  }
}

// PUT /api/articles - Update existing article
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = isStr(body?.id) ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Article ID is required for update" },
        { status: 400 }
      );
    }

    const updates = sanitizeArticleInput(body);
    // Don't let an update blank out required fields
    if (updates.title === "") delete updates.title;
    if (updates.excerpt === "") delete updates.excerpt;
    if (updates.content && updates.content.length === 0) delete updates.content;

    const updatedArticle = await withWriteLock(async () => {
      const customArticles = await readCustomArticles();
      const existingIndex = customArticles.findIndex((a) => a.id === id);

      if (existingIndex >= 0) {
        const merged: Article = { ...customArticles[existingIndex], ...updates, id };
        customArticles[existingIndex] = merged;
        await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
        return merged;
      }

      // Might be a default article being customized/overridden
      const defaultArt = ARTICLES.find((a) => a.id === id);
      if (!defaultArt) return null;

      const merged: Article = { ...defaultArt, ...updates, id };
      customArticles.unshift(merged);
      await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
      return merged;
    });

    if (!updatedArticle) {
      return NextResponse.json(
        { status: "error", message: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles - Delete article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = isStr(body?.id) ? body.id : null;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Article ID is required" },
        { status: 400 }
      );
    }

    const targetId = id;
    await withWriteLock(async () => {
      // Remove from custom articles
      const customArticles = await readCustomArticles();
      const filteredCustom = customArticles.filter((a) => a.id !== targetId);
      if (filteredCustom.length !== customArticles.length) {
        await writeJsonFile(CUSTOM_ARTICLES_FILE, filteredCustom);
      }

      // Only default (built-in) articles need a tombstone; custom ones are simply removed.
      if (ARTICLES.some((a) => a.id === targetId)) {
        const deletedIds = await readDeletedIds();
        if (!deletedIds.includes(targetId)) {
          deletedIds.push(targetId);
          await writeJsonFile(DELETED_IDS_FILE, deletedIds);
        }
      }
    });

    return NextResponse.json({
      status: "success",
      message: "Article deleted successfully",
      id: targetId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
