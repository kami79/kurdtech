import fs from "fs/promises";
import os from "os";
import path from "path";
import { ARTICLES } from "@/data/articles";
import { Article } from "@/types";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";

/**
 * Shared JSON-file persistence for custom/deleted articles.
 * Works on both local disk (src/data) and read-only serverless filesystems
 * like Vercel (automatically falls back to os.tmpdir() + in-memory cache).
 */

const DATA_DIR = path.join(process.cwd(), "src", "data");
const TMP_DATA_DIR = path.join(os.tmpdir(), "kurdtech-data");

export const CUSTOM_ARTICLES_FILE = path.join(DATA_DIR, "custom-articles.json");
export const DELETED_IDS_FILE = path.join(DATA_DIR, "deleted-articles.json");

const globalStore = globalThis as unknown as {
  __kurdtechJsonStore?: Record<string, unknown>;
};
if (!globalStore.__kurdtechJsonStore) {
  globalStore.__kurdtechJsonStore = {};
}

function getTmpFallbackPath(filePath: string): string {
  return path.join(TMP_DATA_DIR, path.basename(filePath));
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const key = path.basename(filePath);
  const tmpPath = getTmpFallbackPath(filePath);

  // 1. If a serverless runtime write went to /tmp, prefer the /tmp file
  try {
    const tmpData = await fs.readFile(tmpPath, "utf-8");
    const parsed = JSON.parse(tmpData) as T;
    globalStore.__kurdtechJsonStore![key] = parsed;
    return parsed;
  } catch {
    // No /tmp override yet
  }

  // 2. If in-memory cache was updated in this serverless instance, return it
  if (key in globalStore.__kurdtechJsonStore!) {
    return globalStore.__kurdtechJsonStore![key] as T;
  }

  // 3. Read from repository src/data directory
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as T;
    globalStore.__kurdtechJsonStore![key] = parsed;
    return parsed;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  const key = path.basename(filePath);
  globalStore.__kurdtechJsonStore![key] = data;
  const json = JSON.stringify(data, null, 2);

  // 1. Try writing to the primary repo path (works in local development)
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, json, "utf-8");
    try {
      await fs.rename(tmp, filePath);
    } catch {
      await fs.writeFile(filePath, json, "utf-8");
      await fs.unlink(tmp).catch(() => undefined);
    }
    return;
  } catch {
    // Primary path is read-only (e.g. Vercel serverless /var/task) -> fall back to os.tmpdir()
  }

  // 2. Fallback to os.tmpdir() (/tmp/kurdtech-data) for serverless environments
  try {
    const tmpFallback = getTmpFallbackPath(filePath);
    await fs.mkdir(path.dirname(tmpFallback), { recursive: true });
    await fs.writeFile(tmpFallback, json, "utf-8");
  } catch {
    // In-memory globalStore.__kurdtechJsonStore still retains the data
  }
}

// Simple in-process mutex: chains all mutations one after another.
let writeQueue: Promise<unknown> = Promise.resolve();
export function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.catch(() => undefined);
  return run;
}

export async function readCustomArticles(): Promise<Article[]> {
  const list = await readJsonFile<Article[]>(CUSTOM_ARTICLES_FILE, []);
  return Array.isArray(list) ? list : [];
}

export async function readDeletedIds(): Promise<string[]> {
  const list = await readJsonFile<string[]>(DELETED_IDS_FILE, []);
  return Array.isArray(list) ? list : [];
}

// Merge default articles with custom & deleted ones (custom take precedence).
export async function getMergedArticles(): Promise<Article[]> {
  const [customArticles, deletedIds] = await Promise.all([
    readCustomArticles(),
    readDeletedIds(),
  ]);
  const deleted = new Set(deletedIds);

  const customMap = new Map<string, Article>();
  for (const art of customArticles) {
    if (art && art.id && !deleted.has(art.id)) {
      customMap.set(art.id, art);
    }
  }

  const remainingDefaults = ARTICLES.filter(
    (art) => !deleted.has(art.id) && !customMap.has(art.id)
  );

  const usedUrls = new Set<string>();
  return [...Array.from(customMap.values()), ...remainingDefaults].map((art, index) => {
    let resolvedUrl = getSafeImageUrl(art.imageUrl, art.categorySlug, `${art.title} ${art.id}`);
    if (usedUrls.has(resolvedUrl)) {
      resolvedUrl = getCategoryFallbackImage(art.categorySlug, `${art.title} ${art.id} ${index}`);
    }
    usedUrls.add(resolvedUrl);
    return {
      ...art,
      imageUrl: resolvedUrl,
    };
  });
}

export async function findArticle(id: string): Promise<Article | undefined> {
  const all = await getMergedArticles();
  return all.find((a) => a.id === id);
}

export async function addCommentToArticle(
  articleId: string,
  comment: import("@/types").Comment
): Promise<Article | null> {
  return withWriteLock(async () => {
    const customArticles = await readCustomArticles();
    const existingIndex = customArticles.findIndex((a) => a.id === articleId);

    if (existingIndex >= 0) {
      const art = customArticles[existingIndex];
      const comments = [comment, ...(art.comments || [])];
      const updated: Article = {
        ...art,
        comments,
        commentsCount: comments.length,
      };
      customArticles[existingIndex] = updated;
      await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
      return updated;
    }

    // Check if it's a default article
    const defaultArt = ARTICLES.find((a) => a.id === articleId);
    if (!defaultArt) return null;

    const comments = [comment, ...(defaultArt.comments || [])];
    const updated: Article = {
      ...defaultArt,
      comments,
      commentsCount: comments.length,
    };
    customArticles.unshift(updated);
    await writeJsonFile(CUSTOM_ARTICLES_FILE, customArticles);
    return updated;
  });
}
