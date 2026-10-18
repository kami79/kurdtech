import { curateTopTechNews } from "./curator";
import { RawNewsItem } from "./feedParser";
import { translateNewsStory, TranslatedArticleDraft } from "./translator";
import { Article } from "@/types";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CUSTOM_ARTICLES_FILE = path.join(DATA_DIR, "custom-articles.json");

// Save article directly to persistent storage
async function saveArticleToDisk(article: Article): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  let existing: Article[] = [];
  try {
    const raw = await fs.readFile(CUSTOM_ARTICLES_FILE, "utf-8");
    existing = JSON.parse(raw);
  } catch {
    existing = [];
  }

  // Check if article with same title already exists to avoid duplicate publishing
  const alreadyExists = existing.some(
    (a) =>
      a.title.toLowerCase().trim() === article.title.toLowerCase().trim() ||
      a.id === article.id
  );

  if (!alreadyExists) {
    const updated = [article, ...existing];
    await fs.writeFile(CUSTOM_ARTICLES_FILE, JSON.stringify(updated, null, 2), "utf-8");
  }
}

// Full workflow: Scan, Rank and Translate into Drafts with offset & refresh rotation
export async function getCuratedKurdishDrafts(
  limit: number = 8,
  apiKey?: string,
  offset: number = 0,
  filterSource?: string,
  filterCategory?: string,
  newOnly: boolean = false
): Promise<{
  drafts: {
    raw: RawNewsItem;
    draft: TranslatedArticleDraft;
    isAlreadyPublished: boolean;
  }[];
  sourceStats: { name: string; count: number; icon: string }[];
  scannedAt: string;
  totalAvailable: number;
  nextOffset: number;
}> {
  let existing: Article[] = [];
  try {
    const raw = await fs.readFile(CUSTOM_ARTICLES_FILE, "utf-8");
    existing = JSON.parse(raw);
  } catch {
    existing = [];
  }

  const { topStories, allStories, sourceStats, scannedAt, totalAvailable, nextOffset } =
    await curateTopTechNews(
      limit * 2, // fetch wider window to allow newOnly filtering
      offset,
      filterSource,
      filterCategory
    );

  // If newOnly requested, filter out stories whose title is already published
  let selectedStories = topStories;
  if (newOnly) {
    selectedStories = allStories.filter(
      (story) =>
        !existing.some((a) =>
          a.title.toLowerCase().trim().includes(story.title.toLowerCase().trim().slice(0, 30))
        )
    );
  }

  const slicedStories = selectedStories.slice(0, limit);

  // Translate selected stories in parallel
  const drafts = await Promise.all(
    slicedStories.map(async (raw) => {
      const draft = await translateNewsStory(raw, apiKey);
      const isAlreadyPublished = existing.some(
        (a) =>
          a.title.toLowerCase().trim().includes(raw.title.toLowerCase().trim().slice(0, 30)) ||
          a.title.toLowerCase().trim() === draft.title.toLowerCase().trim()
      );
      return { raw, draft, isAlreadyPublished };
    })
  );

  return {
    drafts,
    sourceStats,
    scannedAt,
    totalAvailable,
    nextOffset,
  };
}

// Publish single curated draft to the portal
export async function publishDraftToPortal(
  raw: RawNewsItem,
  apiKey?: string,
  overrides?: Partial<Article>
): Promise<Article> {
  const draft = await translateNewsStory(raw, apiKey);

  const newArticle: Article = {
    id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: overrides?.title || draft.title,
    excerpt: overrides?.excerpt || draft.excerpt,
    content: overrides?.content || draft.content,
    category: overrides?.category || draft.category,
    categorySlug: overrides?.categorySlug || draft.categorySlug,
    tags: overrides?.tags || draft.tags,
    author: {
      name: draft.author.name,
      role: draft.author.role,
      avatar: draft.author.avatar,
    },
    publishedAt: "ئێستا (نوێ)",
    publishedDateIso: new Date().toISOString(),
    readTime: "٤ خولەک",
    views: "١ بینین",
    likesCount: 1,
    commentsCount: 0,
    imageUrl: overrides?.imageUrl || draft.imageUrl,
    isBreaking: overrides?.isBreaking ?? draft.isBreaking,
    isEditorPick: overrides?.isEditorPick ?? false,
    featuredPosition: overrides?.featuredPosition || (draft.isBreaking ? "top-left" : undefined),
    pros: [],
    cons: [],
  };

  await saveArticleToDisk(newArticle);
  return newArticle;
}

// Autonomous Daily Pilot: Picks Top N and publishes them automatically
export async function runAutonomousDailyAgent(
  count: number = 3,
  apiKey?: string
): Promise<{
  published: Article[];
  count: number;
  message: string;
}> {
  const { drafts } = await getCuratedKurdishDrafts(count, apiKey);

  const published: Article[] = [];
  for (const item of drafts) {
    const art = await publishDraftToPortal(item.raw, apiKey, {
      title: item.draft.title,
      excerpt: item.draft.excerpt,
      content: item.draft.content,
      isBreaking: item.draft.isBreaking,
    });
    published.push(art);
  }

  return {
    published,
    count: published.length,
    message: `${published.length} گرنگترین هەواڵی تەکنەلۆژیای ئەمڕۆ بە کوردی لە پۆڕتاڵەکەدا بڵاوکرانەوە.`,
  };
}

// Auto-Sync: Discovers brand-new top tech news on refresh and automatically publishes it
export async function syncLatestTopNews(
  limit: number = 2,
  apiKey?: string
): Promise<{ newArticles: Article[]; count: number }> {
  try {
    const { topStories } = await curateTopTechNews(limit + 2);

    let existing: Article[] = [];
    try {
      const raw = await fs.readFile(CUSTOM_ARTICLES_FILE, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    const newArticles: Article[] = [];

    for (const story of topStories) {
      if (newArticles.length >= limit) break;

      // Check if title or link already exists
      const alreadyPublished = existing.some(
        (a) =>
          a.title.toLowerCase().trim().includes(story.title.toLowerCase().trim().slice(0, 30)) ||
          (a.id && a.id.includes(story.id))
      );

      if (!alreadyPublished) {
        const published = await publishDraftToPortal(story, apiKey);
        newArticles.push(published);
        existing.unshift(published);
      }
    }

    return {
      newArticles,
      count: newArticles.length,
    };
  } catch (err: any) {
    console.warn("syncLatestTopNews error:", err.message);
    return { newArticles: [], count: 0 };
  }
}

