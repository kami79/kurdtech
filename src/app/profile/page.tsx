"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Bookmark,
  Heart,
  Clock,
  Settings,
  Trash2,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Type,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ARTICLES } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";

export default function ProfileHubPage() {
  const {
    bookmarks,
    likedArticles,
    readingHistory,
    fontSize,
    setFontSize,
    isDark,
    toggleTheme,
    showToast,
    articles,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"history" | "bookmarks" | "likes" | "settings">("history");

  const historyArticles = articles.filter((a) => readingHistory.includes(a.id));
  const bookmarkArticles = articles.filter((a) => bookmarks.includes(a.id));
  const likeArticles = articles.filter((a) => likedArticles.includes(a.id));

  const handleClearHistory = () => {
    if (confirm("دڵنیایت لە سڕینەوەی مێژووی خوێندنەوەت؟")) {
      localStorage.removeItem("kurdtech_reading_history");
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
        <span className="text-purple-600 dark:text-purple-400 font-bold">پەڕگەی بەکارهێنەر و چالاکییەکان</span>
      </nav>

      {/* User Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-8 border border-purple-500/20 text-white shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-right">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-600/30 ring-4 ring-white/10">
            K
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black">خوێنەری کوردتێک</h1>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                خوێنەری ئاڵتونی
              </span>
            </div>

            <p className="text-xs text-slate-300">
              ئەندامی کۆمەڵگەی دیجیتاڵیی تەکنەلۆژیا لە هەرێمی کوردستان
            </p>
          </div>
        </div>

        {/* Quick Reader Stats */}
        <div className="flex items-center gap-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center">
          <div>
            <span className="text-lg font-black text-purple-400">{historyArticles.length}</span>
            <p className="text-[11px] text-slate-400">خوێندراوەتەوە</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <span className="text-lg font-black text-amber-500">{bookmarkArticles.length}</span>
            <p className="text-[11px] text-slate-400">پاشەکەوتکراو</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <span className="text-lg font-black text-emerald-500">{likeArticles.length}</span>
            <p className="text-[11px] text-slate-400">دڵخواز</p>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "history"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مێژووی خوێندنەوە ({historyArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "bookmarks"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>پاشەکەوتکراوەکان ({bookmarkArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("likes")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "likes"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>دڵخوازەکان ({likeArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "settings"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>ڕێکخستنەکان</span>
          </button>
        </div>

        {activeTab === "history" && historyArticles.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="hidden sm:flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold px-3 py-1.5 rounded-xl hover:bg-purple-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>سڕینەوەی مێژوو</span>
          </button>
        )}
      </div>

      {/* Tab 1: Reading History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {historyArticles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto p-6 shadow-sm">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <p className="font-bold text-slate-400 text-sm">هێشتا هیچ بابەتێکت نەخوێندووەتەوە.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
              >
                گەڕان لە هەواڵەکانی ئەمڕۆ
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {historyArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === "bookmarks" && (
        <div className="space-y-4">
          {bookmarkArticles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto p-6">
              <Bookmark className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <p className="font-bold text-slate-400 text-sm">هیچ بابەتێک نیشانە نەکراوە.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {bookmarkArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Likes */}
      {activeTab === "likes" && (
        <div className="space-y-4">
          {likeArticles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 max-w-md mx-auto p-6">
              <Heart className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
              <p className="font-bold text-slate-400 text-sm">هێشتا دەنگت بە هیچ بابەتێک نەداوە.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {likeArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Settings */}
      {activeTab === "settings" && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">
            ڕێکخستنەکانی تایبەتی خوێنەر
          </h3>

          {/* Theme */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">دۆخی ڕەنگ (Theme)</p>
              <p className="text-xs text-slate-400">گۆڕینی نێوان دۆخی تاریک و ڕووناک</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? "تاریک" : "ڕووناک"}</span>
            </button>
          </div>

          {/* Font Scaler */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">قەبارەی فۆنتی کوردی</p>
              <p className="text-xs text-slate-400">قەبارەی دەقی بابەتەکان بەپێی ئاسوودەیی چاو</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  fontSize === "normal" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ئاسایی
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  fontSize === "large" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                مامناوەند
              </button>
              <button
                onClick={() => setFontSize("xlarge")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  fontSize === "xlarge" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                گەورە
              </button>
            </div>
          </div>

          {/* Clear Data */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-sm text-rose-500">سڕینەوەی هەموو داتاکانی وێبگەڕ</p>
              <p className="text-xs text-slate-400">پاشەکەوتکراوەکان، لایکەکان و مێژووی خوێندنەوە</p>
            </div>
            <button
              onClick={() => {
                if (confirm("دڵنیایت لە پاککردنەوەی هەموو تۆمارەکانت؟")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
            >
              سڕینەوەی گشتی
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
