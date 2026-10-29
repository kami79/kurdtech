"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { ARTICLES, BREAKING_TICKER, DEFAULT_EXCHANGE_RATE } from "@/data/articles";
import { Article } from "@/types";
import { getSafeImageUrl } from "@/lib/imageUtils";

interface ToastInfo {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

export type FontSizeOption = "normal" | "large" | "xlarge";

interface AppContextType {
  bookmarks: string[];
  toggleBookmark: (id: string, title?: string) => void;
  isBookmarked: (id: string) => boolean;
  likedArticles: string[];
  toggleLike: (id: string) => boolean;
  isLiked: (id: string) => boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isDark: boolean;
  toggleTheme: () => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: "success" | "info" | "error") => void;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  readingHistory: string[];
  addToHistory: (articleId: string) => void;

  // Article & News Management
  articles: Article[];
  isLoadingArticles: boolean;
  getArticle: (id: string) => Article | undefined;
  addArticle: (data: Partial<Article>) => Promise<Article | null>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<Article | null>;
  deleteArticle: (id: string) => Promise<boolean>;
  breakingNews: string[];
  addBreakingNews: (text: string) => void;
  refreshArticles: (autoSync?: boolean) => Promise<void>;
  importArticles: (imported: Article[]) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [fontSize, setFontSizeState] = useState<FontSizeOption>("normal");
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  // Articles & News state
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [customBreaking, setCustomBreaking] = useState<string[]>([]);

  // Show Toast
  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Fetch articles from API with cache busting and optional live sync
  const refreshArticles = useCallback(async () => {
    try {
      setIsLoadingArticles(true);
      const res = await fetch(`/api/articles?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && Array.isArray(json.data)) {
          setArticles(json.data);
          try {
            localStorage.setItem("kurdtech_cached_articles", JSON.stringify(json.data));
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote articles, using local cache/defaults", e);
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  // Load persisted states on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem("kurdtech_bookmarks");
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const savedLikes = localStorage.getItem("kurdtech_likes");
      if (savedLikes) {
        setLikedArticles(JSON.parse(savedLikes));
      }
      const savedRate = localStorage.getItem("kurdtech_exchange_rate");
      if (savedRate) {
        setExchangeRate(Number(savedRate));
      }
      const savedTheme = localStorage.getItem("kurdtech_theme");
      if (savedTheme) {
        const isThemeDark = savedTheme === "dark";
        setIsDark(isThemeDark);
        if (isThemeDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        const isCurrentlyDark = document.documentElement.classList.contains("dark");
        setIsDark(isCurrentlyDark);
      }
      const savedFont = localStorage.getItem("kurdtech_font_size");
      if (savedFont && ["normal", "large", "xlarge"].includes(savedFont)) {
        setFontSizeState(savedFont as FontSizeOption);
      }
      const savedHistory = localStorage.getItem("kurdtech_reading_history");
      if (savedHistory) {
        setReadingHistory(JSON.parse(savedHistory));
      }
      const savedCachedArticles = localStorage.getItem("kurdtech_cached_articles");
      if (savedCachedArticles) {
        const parsed = JSON.parse(savedCachedArticles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed.map((a: Article) => ({ ...a, imageUrl: getSafeImageUrl(a.imageUrl, a.categorySlug) })));
        }
      }
      const savedBreaking = localStorage.getItem("kurdtech_custom_breaking");
      if (savedBreaking) {
        setCustomBreaking(JSON.parse(savedBreaking));
      }
    } catch (e) {
      console.error("Failed to load local settings", e);
    }

    // Load initial articles from disk/api on mount
    refreshArticles();
  }, [refreshArticles]);

  const toggleBookmark = (id: string, title?: string) => {
    setBookmarks((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        showToast("بابەتەکە لە لیستی پاشەکەوتکراوەکان دەرهێنرا", "info");
      } else {
        updated = [...prev, id];
        showToast(
          title
            ? `«${title.slice(0, 30)}...» پاشەکەوت کرا`
            : "بابەتەکە بە سەرکەوتوویی پاشەکەوت کرا",
          "success"
        );
      }
      try {
        localStorage.setItem("kurdtech_bookmarks", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  const toggleLike = (id: string): boolean => {
    let nowLiked = false;
    setLikedArticles((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
        nowLiked = false;
        showToast("دڵخوازی لابرا", "info");
      } else {
        updated = [...prev, id];
        nowLiked = true;
        showToast("سوپاس بۆ دەنگدان و پشتگیریت!", "success");
      }
      try {
        localStorage.setItem("kurdtech_likes", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return nowLiked;
  };

  const isLiked = (id: string) => likedArticles.includes(id);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kurdtech_theme", "dark");
      showToast("ڕووکاری تاریک (Dark Mode) چالاککرا", "info");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kurdtech_theme", "light");
      showToast("ڕووکاری رووناک (Light Mode) چالاککرا", "info");
    }
  };

  const updateExchangeRate = (rate: number) => {
    setExchangeRate(rate);
    try {
      localStorage.setItem("kurdtech_exchange_rate", rate.toString());
      showToast(`نرخی ئاڵوگۆڕی دۆلار نوێکرایەوە: ١$ = ${rate.toLocaleString()} د.ع`, "info");
    } catch (e) {}
  };

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    try {
      localStorage.setItem("kurdtech_font_size", size);
      showToast(
        size === "xlarge"
          ? "فۆنت گەورەتر کرا"
          : size === "large"
          ? "فۆنت مامناوەند کرا"
          : "قەبارەی فۆنت ئاساییە",
        "info"
      );
    } catch (e) {}
  };

  const addToHistory = (articleId: string) => {
    setReadingHistory((prev) => {
      const filtered = prev.filter((id) => id !== articleId);
      const updated = [articleId, ...filtered].slice(0, 15);
      try {
        localStorage.setItem("kurdtech_reading_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Get article by ID
  const getArticle = useCallback(
    (id: string): Article | undefined => {
      return articles.find((a) => a.id === id) || ARTICLES.find((a) => a.id === id);
    },
    [articles]
  );

  // Add a new article or quick news
  const addArticle = async (data: Partial<Article>): Promise<Article | null> => {
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("سێرڤەر نەیتوانی بابەتەکە تۆمار بکات");
      }

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const created: Article = json.data;
        setArticles((prev) => {
          const next = [created, ...prev.filter((a) => a.id !== created.id)];
          try {
            localStorage.setItem("kurdtech_cached_articles", JSON.stringify(next));
          } catch {}
          return next;
        });

        // If it's breaking, add to breaking news
        if (created.isBreaking) {
          addBreakingNews(created.title);
        }

        showToast("بابەتەکە بە سەرکەوتوویی بڵاوکرایەوە و تۆمارکرا!", "success");
        return created;
      }
      return null;
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "هەڵەیەک ڕوویدا لە بڵاوکردنەوەی بابەت", "error");
      return null;
    }
  };

  // Update existing article
  const updateArticle = async (id: string, updates: Partial<Article>): Promise<Article | null> => {
    try {
      const res = await fetch("/api/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!res.ok) {
        throw new Error("سێرڤەر نەیتوانی دەستکارییەکە تۆمار بکات");
      }

      const json = await res.json();
      if (json.status === "success" && json.data) {
        const updated: Article = json.data;
        setArticles((prev) => {
          const next = prev.map((a) => (a.id === id ? updated : a));
          try {
            localStorage.setItem("kurdtech_cached_articles", JSON.stringify(next));
          } catch {}
          return next;
        });

        showToast("گۆڕانکارییەکانی بابەت بە سەرکەوتوویی نوێکرانەوە!", "success");
        return updated;
      }
      return null;
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "هەڵەیەک ڕوویدا لە نوێکردنەوەی بابەت", "error");
      return null;
    }
  };

  // Delete article
  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("سێرڤەر نەیتوانی بابەتەکە بسڕێتەوە");
      }

      setArticles((prev) => {
        const next = prev.filter((a) => a.id !== id);
        try {
          localStorage.setItem("kurdtech_cached_articles", JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast("بابەتەکە لە ماڵپەڕەکە سڕایەوە", "info");
      return true;
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "هەڵەیەک ڕوویدا لە سڕینەوەی بابەت", "error");
      return false;
    }
  };

  // Add breaking news ticker item
  const addBreakingNews = (text: string) => {
    setCustomBreaking((prev) => {
      const updated = [text, ...prev.filter((t) => t !== text)].slice(0, 10);
      try {
        localStorage.setItem("kurdtech_custom_breaking", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Import articles array
  const importArticles = async (imported: Article[]): Promise<boolean> => {
    try {
      for (const art of imported) {
        await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(art),
        });
      }
      await refreshArticles();
      showToast(`${imported.length} بابەت بە سەرکەوتوویی هاوردە کران!`, "success");
      return true;
    } catch (e: any) {
      showToast("هەڵە لە هاوردەکردنی فایل", "error");
      return false;
    }
  };

  // Dynamic breaking news list
  const breakingNews = useMemo(() => {
    const breakingFromArticles = articles
      .filter((a) => a.isBreaking)
      .map((a) => a.title);

    return Array.from(new Set([...customBreaking, ...breakingFromArticles, ...BREAKING_TICKER]));
  }, [articles, customBreaking]);

  return (
    <AppContext.Provider
      value={{
        bookmarks,
        toggleBookmark,
        isBookmarked,
        likedArticles,
        toggleLike,
        isLiked,
        isSearchOpen,
        setIsSearchOpen,
        isDark,
        toggleTheme,
        exchangeRate,
        setExchangeRate: updateExchangeRate,
        toasts,
        showToast,
        fontSize,
        setFontSize,
        readingHistory,
        addToHistory,
        articles,
        isLoadingArticles,
        getArticle,
        addArticle,
        updateArticle,
        deleteArticle,
        breakingNews,
        addBreakingNews,
        refreshArticles,
        importArticles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
