"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Eye,
  MessageSquare,
  Star,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Sparkles,
} from "lucide-react";
import { Article } from "@/types";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";
import { useApp } from "@/context/AppContext";

interface ArticleCardProps {
  article: Article;
  viewMode?: "list" | "grid";
}

export default function ArticleCard({ article, viewMode = "list" }: ArticleCardProps) {
  const { isBookmarked, toggleBookmark, showToast } = useApp();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/articles/${article.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("بەستەری بابەتەکە بە سەرکەوتوویی کۆپی کرا!", "success");
    }
  };

  // Compact Grid View
  if (viewMode === "grid") {
    return (
      <article className="group bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151e31] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/90 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:border-purple-500/40">
        <div>
          {/* Thumbnail */}
          <div className="relative h-48 w-full overflow-hidden">
            <Link href={`/articles/${article.id}`} className="block w-full h-full">
              <img
                src={getSafeImageUrl(article.imageUrl, article.categorySlug)}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = getCategoryFallbackImage(article.categorySlug);
                }}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>

            {/* Category Badge */}
            <Link
              href={`/category/${article.categorySlug}`}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold hover:bg-purple-600 transition-colors shadow-sm"
            >
              {article.category}
            </Link>

            {/* Review Score Badge */}
            {article.reviewScore && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                {article.reviewScore}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-4 space-y-2.5">
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                {article.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="hover:text-purple-600 dark:hover:text-purple-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <Link href={`/articles/${article.id}`} className="block">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug line-clamp-2">
                {article.title}
              </h3>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
            <span className="font-bold text-slate-700 dark:text-slate-300 truncate text-[11px]">
              {article.author.name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              title="کۆپیکردنی بەستەر"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => toggleBookmark(article.id, article.title)}
              title="پاشەکەوتکردن"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isBookmarked(article.id) ? (
                <BookmarkCheck className="w-4 h-4 text-purple-600 fill-purple-600 dark:text-purple-400 dark:fill-purple-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <Link
              href={`/articles/${article.id}`}
              className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center text-xs group-hover:-translate-x-0.5 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Standard Detailed List View
  return (
    <article className="group bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#151e31] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/90 transition-all duration-300 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-2xl hover:border-purple-500/40">
      {/* Thumbnail */}
      <div className="relative sm:w-64 sm:h-44 h-52 shrink-0 rounded-2xl overflow-hidden">
        <Link href={`/articles/${article.id}`} className="block w-full h-full">
          <img
            src={getSafeImageUrl(article.imageUrl, article.categorySlug)}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = getCategoryFallbackImage(article.categorySlug);
            }}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Category Badge */}
        <Link
          href={`/category/${article.categorySlug}`}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold hover:bg-purple-600 transition-colors shadow-sm"
        >
          {article.category}
        </Link>

        {/* Review Score Badge */}
        {article.reviewScore && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            {article.reviewScore}
          </span>
        )}
      </div>

      {/* Story Details */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Tags & Read Time */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            {article.tags && article.tags.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="hover:text-purple-600 dark:hover:text-purple-400">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : <span />}

            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              {article.readTime || "٤ خولەک خوێندنەوە"}
            </span>
          </div>

          <Link href={`/articles/${article.id}`} className="block">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Meta Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {article.author.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {article.publishedAt}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {article.views}
            </span>

            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {article.commentsCount}
            </span>

            {/* Quick Share */}
            <button
              onClick={handleShare}
              title="کۆپیکردنی بەستەر"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Quick Bookmark */}
            <button
              onClick={() => toggleBookmark(article.id, article.title)}
              title="پاشەکەوتکردن"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isBookmarked(article.id) ? (
                <BookmarkCheck className="w-4 h-4 text-purple-600 fill-purple-600 dark:text-purple-400 dark:fill-purple-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <Link
              href={`/articles/${article.id}`}
              className="text-purple-600 dark:text-purple-400 font-black inline-flex items-center gap-0.5 group-hover:-translate-x-1 transition-transform mr-1"
            >
              خوێندنەوە
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
