"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowRight, ChevronRight, Newspaper } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ARTICLES } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";

export default function SavedArticlesPage() {
  const { bookmarks, showToast, articles } = useApp();

  const savedArticles = articles.filter((art) => bookmarks.includes(art.id));

  const handleClearAll = () => {
    if (confirm("دڵنیایت لە سڕینەوەی هەموو بابەتە پاشەکەوتکراوەکان؟")) {
      localStorage.removeItem("kurdtech_bookmarks");
      window.location.reload();
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-purple-600 dark:text-purple-400 font-bold">بابەتە پاشەکەوتکراوەکان</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Bookmark className="w-6 h-6 fill-purple-500/20" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              لیستی پاشەکەوتکراوەکان (Reading List)
            </h1>
            <p className="text-xs text-slate-400">
              ئەو بابەتانەی کە نیشانەت کردوون بۆ ئەوەی دواتر بییانخوێنیتەوە
            </p>
          </div>
        </div>

        {savedArticles.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-bold transition-all w-fit"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سڕینەوەی هەمووی</span>
          </button>
        )}
      </div>

      {/* Saved Articles List */}
      {savedArticles.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-xl mx-auto p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 opacity-40 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            هێشتا هیچ بابەتێکت پاشەکەوت نەکردووە
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            دەتوانیت لە هەر بابەتێکدا بە کرتەکردن لەسەر نیشانەی پەڕاوگە (Bookmark) بابەتەکە لێرە کۆبکەیتەوە و هەر کاتێک ویستت بگەڕێیتەوە سەری.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
          >
            <Newspaper className="w-4 h-4" />
            گەڕان لە بابەتەکانی سەرەتا
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {savedArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </main>
  );
}
