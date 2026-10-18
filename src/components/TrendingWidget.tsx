"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Eye, Heart, Flame } from "lucide-react";
import { getTrendingArticles } from "@/data/articles";

export default function TrendingWidget() {
  const trending = getTrendingArticles(5);

  return (
    <div className="bg-white/90 dark:bg-[#111827]/90 rounded-3xl p-5 border border-slate-200/80 dark:border-purple-900/20 shadow-sm space-y-4 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
          <Flame className="w-4 h-4 fill-white" />
        </div>
        <div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
            پڕخوێنەرترینەکانی هەفتە
          </h3>
          <p className="text-[10px] text-slate-400">بابەتە گەرمەکانی تیمی کوردتێک</p>
        </div>
      </div>

      <div className="space-y-3">
        {trending.map((item, index) => (
          <Link
            key={item.id}
            href={`/articles/${item.id}`}
            className="group flex items-start gap-3.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <span
              className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                index === 0
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-105"
                  : index === 1
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-purple-600 group-hover:text-white"
              }`}
            >
              {index + 1}
            </span>

            <div className="space-y-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold leading-snug text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                {item.title}
              </h4>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" /> {item.views}
                </span>
                {item.likesCount && (
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                    <Heart className="w-3 h-3 fill-purple-600 dark:fill-purple-400" /> {item.likesCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
