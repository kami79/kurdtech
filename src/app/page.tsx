"use client";

import React, { useState, useMemo } from "react";
import { Newspaper, Sparkles, SlidersHorizontal, RefreshCw, LayoutGrid, List } from "lucide-react";
import { CATEGORIES } from "@/data/articles";
import { useApp } from "@/context/AppContext";
import BentoGrid from "@/components/BentoGrid";
import ArticleCard from "@/components/ArticleCard";
import MarketPricesWidget from "@/components/MarketPricesWidget";
import TrendingWidget from "@/components/TrendingWidget";
import VideoSection from "@/components/VideoSection";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  const { articles, refreshArticles, isLoadingArticles, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "popular">("latest");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isRefreshingHome, setIsRefreshingHome] = useState(false);

  const { main, side } = useMemo(() => {
    const mainArt = articles.find((a) => a.featuredPosition === "main") || articles[0];
    const sideArts = articles.filter(
      (a) => a.featuredPosition && a.featuredPosition !== "main"
    );
    return {
      main: mainArt,
      side: sideArts.length > 0 ? sideArts.slice(0, 3) : articles.slice(1, 4),
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let list = articles.filter((article) => {
      if (selectedCategory === "all") return true;
      return article.categorySlug === selectedCategory;
    });

    if (sortOrder === "popular") {
      list = [...list].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    return list;
  }, [articles, selectedCategory, sortOrder]);

  return (
    <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 space-y-8 sm:space-y-12">
      {/* Zoomit Bento Hero Grid */}
      <BentoGrid mainArticle={main} sideArticles={side} />

      {/* Main 2-Column Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Column (8 Cols in RTL): Chronological & Filterable Stream */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filter Bar */}
          <div className="bg-white/90 dark:bg-[#111827]/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-purple-900/20 space-y-3.5 sm:space-y-4 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-purple-600 to-indigo-600 shadow-sm shadow-purple-600/40"></span>
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                  <Newspaper className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>نوێترین هەواڵ و ڕاپۆرتەکان</span>
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
                  ({filteredArticles.length})
                </span>
                <button
                  onClick={async () => {
                    setIsRefreshingHome(true);
                    try {
                      await refreshArticles(true);
                      showToast("هەواڵ و بابەتەکان بە سەرکەوتوویی نوێکرانەوە!", "success");
                    } finally {
                      setTimeout(() => setIsRefreshingHome(false), 600);
                    }
                  }}
                  disabled={isRefreshingHome || isLoadingArticles}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-all cursor-pointer shadow-sm"
                  title="نوێکردنەوەی هەواڵەکان بە شێوەی ڕاستەوخۆ"
                >
                  <RefreshCw
                    className={`w-3 h-3 text-emerald-500 ${
                      isRefreshingHome || isLoadingArticles ? "animate-spin" : ""
                    }`}
                  />
                  <span>ڕاستەوخۆ</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>
              </div>

              {/* View Mode & Sorting Toolbar */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                {/* Layout Grid / List Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    title="نیشاندان بە شێوازی لیست"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    title="نیشاندان بە شێوازی چوارگۆشە (تۆڕ)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {/* Sorting Pill */}
                <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setSortOrder("latest")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      sortOrder === "latest"
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    نوێترینەکان
                  </button>
                  <button
                    onClick={() => setSortOrder("popular")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      sortOrder === "popular"
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    گەرمترینەکان
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.slug
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-600/20"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/40"
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.badge && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                      {cat.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Feed */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <p className="text-slate-400 font-bold">هیچ بابەتێک لەم بەشەدا نەدۆزرایەوە</p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/30"
              >
                گەڕانەوە بۆ هەموو بابەتەکان
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>

        {/* Left Column (4 Cols in RTL): Sidebar Widgets */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Kurdistan Market Prices Widget */}
          <MarketPricesWidget />

          {/* Weekly Trending Articles Widget */}
          <TrendingWidget />

          {/* Telegram / Community Promo Card */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-purple-500/10 via-sky-500/10 to-slate-100 dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 border border-purple-500/20 text-slate-900 dark:text-white space-y-3 shadow-sm">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold uppercase border border-purple-500/20">
              کەناڵی تێلێگرام
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              ئاگاداری نرخی نوێ و داشکاندنی ئامێرەکان بە لە تێلێگرام
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              زیاتر لە ٤٥ هەزار هەواداری تەکنەلۆژیا لە هەرێمی کوردستان ڕۆژانە هەواڵەکان وەردەگرن.
            </p>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noreferrer"
              className="inline-block w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs text-center transition-all shadow-md shadow-purple-600/30"
            >
              بەشداربوون لە کەناڵی کوردتێک
            </a>
          </div>
        </aside>
      </section>

      {/* Video Section (KurdTech TV) */}
      <VideoSection />

      {/* Interactive Newsletter */}
      <Newsletter />
    </main>
  );
}
