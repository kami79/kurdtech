import fs from "fs/promises";
import path from "path";
import { ARTICLES } from "@/data/articles";
import { Article } from "@/types";

/**
 * Shared JSON-file persistence for custom/deleted articles.
 * Used by both /api/articles and the news agent so every write goes through
 * the same serialized queue (prevents lost updates from concurrent requests).
 */

const DATA_DIR = path.join(process.cwd(), "src", "data");
export const CUSTOM_ARTICLES_FILE = path.join(DATA_DIR, "custom-articles.json");
export const DELETED_IDS_FILE = path.join(DATA_DIR, "deleted-articles.json");

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

// Write to a temp file then rename, so a crash mid-write can't corrupt the JSON.
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, json, "utf-8");
  try {
    await fs.rename(tmp, filePath);
  } catch {
    // Windows/OneDrive can briefly lock the target; fall back to a direct write.
    await fs.writeFile(filePath, json, "utf-8");
    await fs.unlink(tmp).catch(() => undefined);
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

  return [...Array.from(customMap.values()), ...remainingDefaults];
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

