"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Filter, Layers } from "lucide-react";
import { CATEGORIES } from "@/data/articles";
import { useApp } from "@/context/AppContext";
import ArticleCard from "@/components/ArticleCard";
import MarketPricesWidget from "@/components/MarketPricesWidget";
import TrendingWidget from "@/components/TrendingWidget";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "all";
  const { articles } = useApp();

  const currentCategory =
    CATEGORIES.find((c) => c.slug === slug) || {
      id: slug,
      slug: slug,
      name: slug,
      count: 0,
      description: "ئەرشیڤی بابەتەکان لەم بەشەدا",
    };

  const categoryArticles =
    slug === "all"
      ? articles
      : articles.filter((a) => a.categorySlug === slug);

  const [sortOrder, setSortOrder] = useState<"latest" | "views">("latest");

  const sortedArticles = [...categoryArticles].sort((a, b) => {
    if (sortOrder === "views") {
      return (b.likesCount || 0) - (a.likesCount || 0);
    }
    return 0;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-slate-500 dark:text-slate-300 font-bold">بەشەکان</span>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-purple-600 dark:text-purple-400 font-bold">{currentCategory.name}</span>
      </nav>

      {/* Category Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-purple-500/20 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md shadow-purple-600/30">
              بەشی تایبەت
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {articles.length} بابەتی بڵاوکراوە
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">{currentCategory.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {currentCategory.description || "نوێترین هەواڵ، پێداچوونەوە و شیکارییە پسپۆڕییەکانی کوردتێک لەم بەشەدا."}
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right Articles List (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Controls Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ڕیزبەندی:
            </span>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSortOrder("latest")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  sortOrder === "latest"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                نوێترین
              </button>
              <button
                onClick={() => setSortOrder("views")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  sortOrder === "views"
                    ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                پڕبینەرترین
              </button>
            </div>
          </div>

          {/* List */}
          {sortedArticles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <p className="font-bold text-slate-400">هیچ بابەتێک لەم بەشەدا نەدۆزرایەوە.</p>
              <Link href="/" className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                گەڕانەوە بۆ پەڕەی سەرەکی
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>

        {/* Left Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <MarketPricesWidget />
          <TrendingWidget />
        </aside>
      </div>
    </main>
  );
}
