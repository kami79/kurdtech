"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tag,
  Clock,
  MapPin,
  Copy,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TECH_DEALS } from "@/data/deals";
import { formatIQD } from "@/data/articles";
import { useApp } from "@/context/AppContext";

export default function DealsPage() {
  const { exchangeRate, showToast } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDeals = TECH_DEALS.filter((d) => {
    if (selectedCity === "all") return true;
    return d.city === selectedCity;
  });

  const handleCopyCode = (id: string, code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      showToast(`کۆدی داشکاندن «${code}» کۆپی کرا!`, "success");
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-purple-600 dark:text-purple-400 font-bold">داشکاندن و ئۆفەرەکانی بازاڕی کوردستان</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-purple-500/30 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>ئۆفەرە کاتییە پشتڕاستکراوەکان</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            نوێترین داشکاندنی فرۆشگاکانی تەکنەلۆژیا لە کوردستان
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            کوردتێک ڕۆژانە پەیوەندی بە باوەڕپێکراوترین فرۆشگا و بریکارە فەرمییەکانی هەولێر، سلێمانی و دهۆک دەکات تاوەکو تایبەتترین کۆدی داشکاندنتان بۆ دابین بکات.
          </p>
        </div>
      </div>

      {/* City Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "هەموو شارەکان" },
          { id: "هەولێر", label: "هەولێر" },
          { id: "سلێمانی", label: "سلێمانی" },
          { id: "دهۆک", label: "دهۆک" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCity(c.id)}
            className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all ${
              selectedCity === c.id
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-500"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => {
          const discountAmount = deal.originalPriceUSD - deal.discountPriceUSD;
          const iqdPrice = formatIQD(deal.discountPriceUSD, exchangeRate);

          return (
            <div
              key={deal.id}
              className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row gap-5"
            >
              <div className="relative sm:w-44 h-48 sm:h-auto rounded-2xl overflow-hidden shrink-0">
                <img
                  src={deal.imageUrl}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-black shadow-md">
                  داشکاندنی ${discountAmount}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      {deal.storeName} ({deal.city})
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">
                    {deal.title}
                  </h3>

                  {/* Pricing Comparison */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400" dir="ltr">
                      ${deal.discountPriceUSD}
                    </span>
                    <span className="text-xs text-slate-400 line-through" dir="ltr">
                      ${deal.originalPriceUSD}
                    </span>
                    <span className="text-xs text-emerald-500 font-bold mr-auto">
                      {iqdPrice}
                    </span>
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {deal.promoCode ? (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white" dir="ltr">
                        {deal.promoCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(deal.id, deal.promoCode!)}
                        className="text-purple-600 hover:text-purple-500"
                        title="کۆپیکردنی کۆد"
                      >
                        {copiedId === deal.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-500 font-bold">بێ پێویستی بە کۆد</span>
                  )}

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {deal.expiresInDays} ڕۆژی ماوە
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
