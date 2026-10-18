"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Clock,
  ChevronLeft,
  Smartphone,
  FileText,
  Sparkles,
  Scale,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ARTICLES, KURDISTAN_MARKET_PRICES, CATEGORIES } from "@/data/articles";

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, articles } = useApp();
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isSearchOpen]);

  const matchedArticles = useMemo(() => {
    if (!query.trim() && selectedCat === "all") return articles.slice(0, 5);
    const q = query.toLowerCase().trim();
    return articles.filter((art) => {
      const matchCat = selectedCat === "all" || art.categorySlug === selectedCat;
      const matchText =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));
      return matchCat && matchText;
    });
  }, [articles, query, selectedCat]);

  const matchedPrices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return KURDISTAN_MARKET_PRICES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden mt-6 sm:mt-12 transition-all text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="گەڕان لە هەواڵەکان، ئایفۆن، پێداچوونەوەکان، زیرەکی دەستکرد..."
            className="w-full bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Command Shortcuts (When Query is Empty) */}
        {!query.trim() && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/advisor"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ڕاوێژکاری کڕین</span>
              </Link>
              <Link
                href="/compare"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>بەراوردکاری</span>
              </Link>
              <Link
                href="/prices"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>نرخی ئامێرەکان</span>
              </Link>
              <Link
                href="/saved"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-500/10 border border-slate-200 dark:border-slate-700 flex items-center gap-2 font-bold transition-colors shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>پاشەکەوتکراو</span>
              </Link>
            </div>

            {/* Popular Search Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-bold">گەڕانی باو:</span>
              {["iPhone 17", "Apple Intelligence", "Galaxy S26", "RTX 5090", "نرخی دۆلار", "M5"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-[11px] font-medium transition-colors"
                  >
                    #{tag}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Quick Category Filters */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-bold">بەشەکان:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.slug)}
              className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
                selectedCat === cat.slug
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Hardware Prices Match */}
          {matchedPrices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                نرخی مۆبایل و ئامێرەکان لە بازاڕی کوردستان
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedPrices.map((item) => (
                  <Link
                    key={item.id}
                    href="/prices"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-purple-500/10 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400" dir="ltr">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{item.brand}</p>
                    </div>
                    <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400" dir="ltr">
                      ${item.priceUSD}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Match */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {query.trim() ? `ئەنجامەکانی هەواڵ و بابەت (${matchedArticles.length})` : "بابەتە پێشنیارکراوەکان"}
            </div>

            {matchedArticles.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-40 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-semibold">هیچ بابەتێک بەم زانیارییە نەدۆزرایەوە</p>
                <p className="text-xs">وشەیەکی تر تاقی بکەرەوە وەک «ئایفۆن»، «زیرەکی دەستکرد» یان «PS5»</p>
              </div>
            ) : (
              <div className="space-y-2">
                {matchedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all group"
                  >
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{article.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {article.excerpt}
                      </p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>کلیلەکانی سەر تەختەکلیل: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl+K</kbd> بۆ گەڕان</span>
          <span>کوردتێک — مەگەزینی تەکنەلۆژیای کوردستان</span>
        </div>
      </div>
    </div>
  );
}
