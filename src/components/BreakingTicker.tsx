"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, Radio, TrendingUp, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BreakingTicker() {
  const { setIsSearchOpen, breakingNews, refreshArticles, showToast, exchangeRate } = useApp();
  const [isPaused, setIsPaused] = useState(false);
  const [kurdishDate, setKurdishDate] = useState("");

  useEffect(() => {
    const days = ["یەکشەممە", "دووشەممە", "سێشەممە", "چوارشەممە", "پێنجشەممە", "هەینی", "شەممە"];
    const months = [
      "کانوونی دووەم", "شوبات", "ئادار", "نیسان", "ئایار", "حوزەیران",
      "تەممووز", "ئاب", "ئەیلوول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    setKurdishDate(`${dayName}، ${dayNum}ی ${monthName}ی ${year}`);
  }, []);

  return (
    <div className="bg-slate-950/95 dark:bg-[#060910] text-slate-200 border-b border-purple-900/30 text-xs py-2 px-4 select-none relative overflow-hidden backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Ticker Section */}
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Breaking Pulse Badge */}
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black px-2.5 py-1 rounded-xl text-[11px] shrink-0 shadow-lg shadow-purple-600/40 animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>بەپەلە</span>
          </span>

          {/* Marquee Wrapper */}
          <div
            className="flex items-center gap-8 overflow-hidden text-slate-300 whitespace-nowrap cursor-pointer"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => setIsSearchOpen(true)}
            title="کلیک بکە بۆ گەڕان"
          >
            <div className={`flex items-center gap-8 ${isPaused ? "" : "animate-ticker"}`}>
              {breakingNews.concat(breakingNews).map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 hover:text-purple-300 transition-colors text-right text-xs shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Indicators (Currency + Date + Cities) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
          {/* USD Exchange Rate Badge */}
          <Link
            href="/prices"
            className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-mono font-bold flex items-center gap-1.5"
            title="نرخی دۆلار لە بازاڕی هەولێر و سلێمانی"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>$100 = {((exchangeRate || 1515) * 100).toLocaleString()} IQD</span>
          </Link>

          <span className="text-slate-800 dark:text-slate-700">|</span>

          {/* Kurdish Real-Time Date */}
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{kurdishDate || "ئەمڕۆ"}</span>
          </span>

          <span className="text-slate-800 dark:text-slate-700">|</span>

          {/* Kurdish Cities */}
          <span className="text-purple-300/80 font-bold tracking-wide">
            هەولێر • سلێمانی • دهۆک
          </span>
        </div>
      </div>
    </div>
  );
}
