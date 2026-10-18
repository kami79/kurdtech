"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Smartphone,
  Laptop,
  Gamepad2,
  Cpu,
  Tablet,
  Calculator,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { KURDISTAN_MARKET_PRICES, formatIQD } from "@/data/articles";
import { useApp } from "@/context/AppContext";

export default function MarketPricesPage() {
  const { exchangeRate, setExchangeRate, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempRate, setTempRate] = useState(exchangeRate.toString());
  const [converterUSD, setConverterUSD] = useState("1000");

  const categories = [
    { id: "all", label: "هەموو ئامێرەکان", icon: null },
    { id: "phone", label: "مۆبایل", icon: Smartphone },
    { id: "laptop", label: "لاپتۆپ و مەکبووک", icon: Laptop },
    { id: "console", label: "کۆنسۆڵ و گەیمینگ", icon: Gamepad2 },
    { id: "gpu", label: "کارتی گرافیک", icon: Cpu },
    { id: "tablet", label: "تابلێت و ئایپاد", icon: Tablet },
  ];

  const filteredPrices = useMemo(() => {
    return KURDISTAN_MARKET_PRICES.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleApplyRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Number(tempRate);
    if (!isNaN(rate) && rate > 500 && rate < 3000) {
      setExchangeRate(rate);
      showToast(`نرخی ١$ کرایە ${rate.toLocaleString()} د.ع`, "success");
    } else {
      showToast("تکایە نرخێکی گونجاو بنووسە", "error");
    }
  };

  const convertedIQD = Math.round(Number(converterUSD || 0) * exchangeRate);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-emerald-500 font-bold">نرخی ئامێرەکان لە بازاڕی کوردستان</span>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 p-6 sm:p-10 border border-emerald-500/30 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>نوێکراوەتەوە: کاتژمێرێک لەمەوبەر</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            نرخی مۆبایل و ئامێرە ئەلیکترۆنییەکان لە کوردستان
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تێکڕای نرخی دەستپێک لە فرۆشگاکانی شەقامی سوڵتان موزەفەر لە هەولێر، بازاڕی مەولەوی لە سلێمانی و ناوەندی دهۆک بە دۆلاری ئەمریکی ($) و دیناری عێراقی (د.ع).
          </p>
        </div>
      </div>

      {/* Interactive Exchange Rate & Converter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rate Setting */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <span className="text-xs text-slate-400 font-bold">نرخی ئاڵوگۆڕی دۆلار (Exchange Rate):</span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white" dir="ltr">
              1 USD = <span className="text-emerald-500">{exchangeRate.toLocaleString()}</span> IQD
            </p>
          </div>

          <form onSubmit={handleApplyRate} className="flex items-center gap-2">
            <input
              type="number"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="w-24 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none text-center"
              dir="ltr"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
            >
              نوێکردنەوە
            </button>
          </form>
        </div>

        {/* Currency Converter */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">حاسیبەی خێرای دۆلار بۆ دینار</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={converterUSD}
                  onChange={(e) => setConverterUSD(e.target.value)}
                  className="w-20 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400">بەرامبەر بە دینار:</span>
            <p className="text-sm sm:text-base font-black text-emerald-500 truncate" dir="ltr">
              {convertedIQD.toLocaleString()} د.ع
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەدوای مۆدێل یان کۆمپانیا..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Prices Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrices.map((item) => {
          const iqd = formatIQD(item.priceUSD, exchangeRate);
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition-all shadow-sm hover:shadow-lg space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.brand}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" dir="ltr">
                    {item.name}
                  </h3>
                </div>

                <span
                  dir="ltr"
                  className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-bold shrink-0 ${
                    item.trend === "down"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : item.trend === "up"
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                  {item.trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                  {item.trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
                  {item.change}
                </span>
              </div>

              {/* Badges / Specs */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {item.storage && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold" dir="ltr">
                    {item.storage}
                  </span>
                )}
                {item.color && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    {item.color}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mr-auto">
                  نوێکراوەتەوە: {item.updatedAt}
                </span>
              </div>

              {/* Price Details */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">نرخ بە دۆلار:</span>
                  <p className="font-black text-lg text-purple-600 dark:text-purple-400" dir="ltr">
                    ${item.priceUSD}
                  </p>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-slate-400">تەخمینی بە دینار:</span>
                  <p className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    {iqd}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Info Note */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">تێبینی گرنگ بۆ کڕیاران لە هەرێمی کوردستان:</p>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            نرخەکان بەپێی تێکڕای بازارەکانی تەکنەلۆژیا لە هەولێر و سلێمانی وەرگیراون و لە فرۆشگایەک بۆ فرۆشگایەکی تر بەهۆی جۆری گەرەنتی (گارانتی ناوخۆیی یان نێودەوڵەتی) و باج دەکرێت کەمێک جیاوازی هەبێت.
          </p>
        </div>
      </div>
    </main>
  );
}
