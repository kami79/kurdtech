"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookA,
  Search,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
} from "lucide-react";
import { GLOSSARY_TERMS } from "@/data/glossary";

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("npu");

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      const matchCat = selectedCat === "all" || item.category === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.termEn.toLowerCase().includes(q) ||
        item.termKu.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCat]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-purple-600 font-bold">فەرهەنگی زاراوەکانی تەکنەلۆژیا</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 p-6 sm:p-10 border border-teal-500/30 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold">
            <BookA className="w-4 h-4 text-teal-400" />
            <span>فەرهەنگی دیجیتاڵیی کوردتێک</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            فەرهەنگی تەکنەلۆژیا بە زمانی کوردی (Kurdish Tech Glossary)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            مانای زاراوە و چەمکە ئاڵۆزەکانی جیهانی تەکنەلۆژیا و ژیری دەستکرد وەک NPU، Ray Tracing، FTTH و OLED بە زمانی شیرینی کوردی بە شێوازێکی سادە و زانستی تێبگە.
          </p>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: "هەموو چەمکەکان" },
            { id: "ai", label: "زیرەکی دەستکرد" },
            { id: "hardware", label: "ڕەقەواڵە" },
            { id: "display", label: "شاشە و ڕوونما" },
            { id: "network", label: "تۆڕ و ئینتەرنێت" },
            { id: "gaming", label: "گەیمینگ" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all ${
                selectedCat === cat.id
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەدوای زاراوە (ئینگلیزی یان کوردی)..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Terms Accordion / Cards List */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="font-bold text-slate-400 text-sm">هیچ زاراوەیەک بەم وشەیە نەدۆزرایەوە.</p>
            <button
              onClick={() => {
                setSelectedCat("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-teal-500 hover:underline"
            >
              بینینی هەموو چەمکەکان
            </button>
          </div>
        ) : (
          filteredTerms.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <div
                key={t.id}
                className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white" dir="ltr">
                        {t.termEn}
                      </h3>
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        — {t.termKu}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t.shortDesc}
                    </p>
                  </div>

                  <div className="p-2 text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm leading-loose text-slate-700 dark:text-slate-300 animate-in slide-in-from-top-2 duration-200">
                    <p className="font-bold text-slate-900 dark:text-white">شیکردنەوەی وردی تەکنیکی:</p>
                    <p>{t.fullDesc}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
