"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  TrendingDown,
  TrendingUp,
  Minus,
  Calculator,
  ChevronLeft,
  ArrowLeftRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import { KURDISTAN_MARKET_PRICES, formatIQD } from "@/data/articles";
import { useApp } from "@/context/AppContext";

export default function MarketPricesWidget() {
  const { exchangeRate } = useApp();
  const [selectedCity, setSelectedCity] = useState<"erbil" | "slemani" | "duhok">("erbil");
  const [calcAmount, setCalcAmount] = useState("100");
  const [calcDirection, setCalcDirection] = useState<"usd-to-iqd" | "iqd-to-usd">("usd-to-iqd");
  const [showCalc, setShowCalc] = useState(false);

  // City-specific minor exchange rate adjustments (authentic Kurdistan market reality)
  const cityRates = {
    erbil: exchangeRate || 1515,
    slemani: (exchangeRate || 1515) - 1,
    duhok: (exchangeRate || 1515) + 1,
  };
  const activeRate = cityRates[selectedCity];

  // Calculation logic
  const calculatedResult =
    calcDirection === "usd-to-iqd"
      ? Math.round(Number(calcAmount || 0) * activeRate)
      : (Number(calcAmount || 0) / activeRate).toFixed(2);

  return (
    <div className="bg-white/90 dark:bg-[#111827]/90 rounded-3xl p-5 border border-slate-200/80 dark:border-purple-900/20 shadow-sm space-y-4 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>نرخی بازاڕی ئامێرەکان</span>
            </h3>
            <p className="text-[10px] text-slate-400">هەولێر، سلێمانی و دهۆک</p>
          </div>
        </div>

        <button
          onClick={() => setShowCalc(!showCalc)}
          title="حاسیبەی ئاڵوگۆڕی دراو"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            showCalc
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">حاسیبە</span>
        </button>
      </div>

      {/* Kurdistan City Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setSelectedCity("erbil")}
          className={`py-1.5 rounded-xl transition-all ${
            selectedCity === "erbil"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          هەولێر
        </button>
        <button
          onClick={() => setSelectedCity("slemani")}
          className={`py-1.5 rounded-xl transition-all ${
            selectedCity === "slemani"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          سلێمانی
        </button>
        <button
          onClick={() => setSelectedCity("duhok")}
          className={`py-1.5 rounded-xl transition-all ${
            selectedCity === "duhok"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          دهۆک
        </button>
      </div>

      {/* Dynamic Currency Calculator Drawer */}
      {showCalc && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in slide-in-from-top-2 duration-200 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>نرخی ١٠٠ دۆلار:</span>
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">
              {(activeRate * 100).toLocaleString()} IQD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                {calcDirection === "usd-to-iqd" ? "$" : "IQD"}
              </span>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                placeholder="بڕ بنووسە"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() =>
                setCalcDirection(calcDirection === "usd-to-iqd" ? "iqd-to-usd" : "usd-to-iqd")
              }
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
              title="گۆڕینی ئاڕاستە"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 text-right truncate">
              {calcDirection === "usd-to-iqd"
                ? `${Number(calculatedResult).toLocaleString()} د.ع`
                : `$${calculatedResult}`}
            </div>
          </div>
        </div>
      )}

      {/* Gadget Prices List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {KURDISTAN_MARKET_PRICES.slice(0, 5).map((item) => {
          const formattedIQD = formatIQD(item.priceUSD, activeRate);
          return (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
            >
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate" dir="ltr">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {formattedIQD}
                </p>
              </div>

              <div className="text-left shrink-0">
                <p className="font-black text-sm text-purple-600 dark:text-purple-400 font-mono" dir="ltr">
                  ${item.priceUSD}
                </p>
                <span
                  dir="ltr"
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                    item.trend === "down"
                      ? "text-emerald-500"
                      : item.trend === "up"
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {item.trend === "down" && <TrendingDown className="w-3 h-3" />}
                  {item.trend === "up" && <TrendingUp className="w-3 h-3" />}
                  {item.trend === "neutral" && <Minus className="w-3 h-3" />}
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Prices Link */}
      <Link
        href="/prices"
        className="w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group shadow-sm"
      >
        <span>بینینی هەموو نرخەکان و دۆخی بازاڕ</span>
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
