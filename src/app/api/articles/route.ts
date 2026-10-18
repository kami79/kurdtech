import { NextRequest, NextResponse } from "next/server";
import { ARTICLES } from "@/data/articles";
import { Article } from "@/types";
import { syncLatestTopNews } from "@/lib/agent/newsAgent";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CUSTOM_ARTICLES_FILE = path.join(DATA_DIR, "custom-articles.json");
const DELETED_IDS_FILE = path.join(DATA_DIR, "deleted-articles.json");

// Helper to safely read JSON file
async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

// Helper to safely write JSON file
async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Merge default articles with custom & deleted ones
async function getMergedArticles(): Promise<Article[]> {
  const customArticles = await readJsonFile<Article[]>(CUSTOM_ARTICLES_FILE, []);
  const deletedIds = await readJsonFile<string[]>(DELETED_IDS_FILE, []);

  // Map of custom articles by id (custom articles take precedence)
  const customMap = new Map<string, Article>();
  for (const art of customArticles) {
    if (!deletedIds.includes(art.id)) {
      customMap.set(art.id, art);
    }
  }

  // Filter default articles: skip deleted ones, and skip ones overridden by custom
  const remainingDefaults = ARTICLES.filter(
    (art) => !deletedIds.includes(art.id) && !customMap.has(art.id)
  );

  // Return custom articles first, followed by default articles
  return [...Array.from(customMap.values()), ...remainingDefaults];
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
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
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
      {
        status: "success",
        total: results.length,
        data: results,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
      }
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

    if (!body.title || !body.excerpt) {
      return NextResponse.json(
        { status: "error", message: "Title and excerpt are required" },
        { status: 400 }
      );
    }

    const customArticles = await readJsonFile<Article[]>(CUSTOM_ARTICLES_FILE, []);
    const deletedIds = await readJsonFile<string[]>(DELETED_IDS_FILE, []);

    const newId =
      body.id ||
      `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Remove from deleted list if ID was reused
    const updatedDeleted = deletedIds.filter((id) => id !== newId);
    if (updatedDeleted.length !== deletedIds.length) {
      await writeJsonFile(DELETED_IDS_FILE, updatedDeleted);
    }

    const newArticle: Article = {
      id: newId,
      title: body.title.trim(),
      excerpt: body.excerpt.trim(),
      content: Array.isArray(body.content)
        ? body.content
        : typeof body.content === "string"
        ? body.content.split("\n\n").filter(Boolean)
        : [body.excerpt.trim()],
      category: body.category || "هەواڵ",
      categorySlug: body.categorySlug || "ai",
      tags: body.tags || ["تەکنەلۆژیا", "کوردتێک"],
      author: body.author || {
        name: "ئارام کامەران",
        role: "نووسەری تیمی تەکنیکی",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "نووسەری تەکنیکی لە کوردتێک",
      },
      publishedAt: body.publishedAt || "ئێستا",
      publishedDateIso: body.publishedDateIso || new Date().toISOString(),
      readTime: body.readTime || "٤ خولەک",
      views: body.views || "١ بینین",
      likesCount: body.likesCount ?? 0,
      commentsCount: body.commentsCount ?? 0,
      comments: body.comments || [],
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=80",
      featuredPosition: body.featuredPosition || undefined,
      isBreaking: body.isBreaking ?? false,
      isEditorPick: body.isEditorPick ?? false,
      reviewScore: body.reviewScore ?? undefined,
      pros: body.pros || [],
      cons: body.cons || [],
      specs: body.specs || undefined,
    };

    // Prepend to custom articles
    const updatedCustom = [newArticle, ...customArticles.filter((a) => a.id !== newId)];
    await writeJsonFile(CUSTOM_ARTICLES_FILE, updatedCustom);

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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { status: "error", message: "Article ID is required for update" },
        { status: 400 }
      );
    }

    const customArticles = await readJsonFile<Article[]>(CUSTOM_ARTICLES_FILE, []);
    const existingIndex = customArticles.findIndex((a) => a.id === id);

    let updatedArticle: Article;

    if (existingIndex >= 0) {
      // Exists in custom articles
      const current = customArticles[existingIndex];
      updatedArticle = {
        ...current,
        ...updates,
        content: Array.isArray(updates.content)
          ? updates.content
          : typeof updates.content === "string"
          ? updates.content.split("\n\n").filter(Boolean)
          : current.content,
      };
      customArticles[existingIndex] = updatedArticle;
      await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
    } else {
      // Might be a default article being customized/overridden
      const defaultArt = ARTICLES.find((a) => a.id === id);
      if (!defaultArt) {
        return NextResponse.json(
          { status: "error", message: "Article not found" },
          { status: 404 }
        );
      }
      updatedArticle = {
        ...defaultArt,
        ...updates,
        content: Array.isArray(updates.content)
          ? updates.content
          : typeof updates.content === "string"
          ? updates.content.split("\n\n").filter(Boolean)
          : defaultArt.content,
      };
      customArticles.unshift(updatedArticle);
      await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
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
        id = body.id;
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

    // Remove from custom articles
    const customArticles = await readJsonFile<Article[]>(CUSTOM_ARTICLES_FILE, []);
    const filteredCustom = customArticles.filter((a) => a.id !== id);
    await writeJsonFile(CUSTOM_ARTICLES_FILE, filteredCustom);

    // Also record in deletedIds so default articles can be deleted
    const deletedIds = await readJsonFile<string[]>(DELETED_IDS_FILE, []);
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      await writeJsonFile(DELETED_IDS_FILE, deletedIds);
    }

    return NextResponse.json({
      status: "success",
      message: "Article deleted successfully",
      id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
