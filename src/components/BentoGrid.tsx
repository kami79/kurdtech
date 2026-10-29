"use client";

import React from "react";
import Link from "next/link";
import { Star, Clock, MessageSquare, Bookmark, BookmarkCheck, Flame } from "lucide-react";
import { Article } from "@/types";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";
import { useApp } from "@/context/AppContext";

interface BentoGridProps {
  mainArticle: Article;
  sideArticles: Article[];
}

export default function BentoGrid({ mainArticle, sideArticles }: BentoGridProps) {
  const { isBookmarked, toggleBookmark } = useApp();

  if (!mainArticle) return null;

  return (
    <section aria-label="سەردێڕە گرنگەکان" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5">
        {/* Main Hero Card (7 Cols on desktop, compact 330px on mobile) */}
        <div className="lg:col-span-7 group relative h-[330px] sm:h-[460px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/40 dark:border-purple-900/30 shadow-xl hover:shadow-2xl hover:shadow-purple-600/20 transition-all duration-500">
          <Link href={`/articles/${mainArticle.id}`} className="block w-full h-full">
            <img
              src={getSafeImageUrl(
                mainArticle.imageUrl,
                mainArticle.categorySlug,
                `${mainArticle.title} ${mainArticle.id}`
              )}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = getCategoryFallbackImage(
                  mainArticle.categorySlug,
                  `${mainArticle.title} ${mainArticle.id}`
                );
              }}
              alt={mainArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Multi-stop High Contrast Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/10 sm:via-black/45 sm:to-transparent" />
          </Link>

          {/* Top Badges */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 left-3 sm:left-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] sm:text-xs font-black flex items-center gap-1 shadow-lg shadow-amber-500/30">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
                <span>دەستنیشانکراو</span>
              </span>

              <Link
                href={`/category/${mainArticle.categorySlug}`}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-purple-600/95 backdrop-blur-md text-white text-[11px] sm:text-xs font-black shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-colors"
              >
                {mainArticle.category}
              </Link>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {mainArticle.reviewScore && (
                <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded-xl font-black text-xs sm:text-sm shadow-md">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                  <span>{mainArticle.reviewScore}</span>
                  <span className="text-[10px] text-slate-400 font-normal">/ ١٠</span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBookmark(mainArticle.id, mainArticle.title);
                }}
                aria-label="پاشەکەوتکردن"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:text-purple-400 border border-white/10 hover:border-purple-500/40 transition-all shadow-md active:scale-90"
              >
                {isBookmarked(mainArticle.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-purple-400 fill-purple-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Headline Info */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 space-y-2 sm:space-y-3 pointer-events-none">
            <Link
              href={`/articles/${mainArticle.id}`}
              className="pointer-events-auto block group-hover:text-purple-300 transition-colors"
            >
              <h1 className="text-lg sm:text-3xl font-black text-white leading-snug drop-shadow-md line-clamp-2 sm:line-clamp-none">
                {mainArticle.title}
              </h1>
            </Link>

            <p className="text-slate-200/90 text-xs sm:text-sm line-clamp-2 leading-relaxed max-w-2xl">
              {mainArticle.excerpt}
            </p>

            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-300 pt-2.5 sm:pt-3 border-t border-white/15">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={mainArticle.author.avatar}
                  alt={mainArticle.author.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-purple-500/80 shadow shrink-0"
                />
                <span className="font-bold text-white truncate">{mainArticle.author.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {mainArticle.publishedAt}
                </span>
                <span className="hidden xs:flex items-center gap-1 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  {mainArticle.commentsCount}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-[11px] font-bold text-slate-300">
                  {mainArticle.readTime || "٥ خولەک"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Side 3 Featured Cards: Horizontal Swipe Carousel on Mobile, 2-Col Bento Grid on Tablet/Desktop */}
        <div className="lg:col-span-5 flex sm:grid sm:grid-cols-2 gap-3 sm:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-1 sm:pb-0 no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
          {sideArticles.slice(0, 3).map((story, index) => (
            <div
              key={story.id}
              className={`${
                index === 0 ? "sm:col-span-2" : ""
              } w-[80vw] max-w-[310px] sm:w-auto sm:max-w-none shrink-0 snap-center h-[210px] sm:h-[240px] group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/30 dark:border-purple-900/20 shadow-lg hover:shadow-xl hover:shadow-purple-600/15 transition-all duration-500`}
            >
              <Link href={`/articles/${story.id}`} className="block w-full h-full">
                <img
                  src={getSafeImageUrl(
                    story.imageUrl,
                    story.categorySlug,
                    `${story.title} ${story.id}`
                  )}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = getCategoryFallbackImage(
                      story.categorySlug,
                      `${story.title} ${story.id}`
                    );
                  }}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
              </Link>

              {/* Category & Bookmark */}
              <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                <Link
                  href={`/category/${story.categorySlug}`}
                  className="pointer-events-auto px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-purple-300 border border-purple-500/30 text-[10px] sm:text-[11px] font-bold hover:bg-purple-600 hover:text-white transition-colors"
                >
                  {story.category}
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBookmark(story.id, story.title);
                  }}
                  className="pointer-events-auto p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white hover:text-purple-400 border border-white/10 active:scale-90 transition-all"
                >
                  {isBookmarked(story.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Headline & Meta */}
              <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 space-y-2 pointer-events-none">
                <Link
                  href={`/articles/${story.id}`}
                  className="pointer-events-auto block group-hover:text-purple-300 transition-colors"
                >
                  <h2 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                    {story.title}
                  </h2>
                </Link>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300 pt-1.5 border-t border-white/10">
                  <span className="font-medium truncate max-w-[140px]">{story.author.name}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {story.publishedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
