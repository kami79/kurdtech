"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Smartphone,
  Laptop,
  Gamepad2,
  DollarSign,
  Camera,
  Battery,
  Zap,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Scale,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { COMPARISON_DEVICES } from "@/data/devices";
import { formatIQD } from "@/data/articles";
import { useApp } from "@/context/AppContext";
import { DeviceItem } from "@/types";

export default function SmartAdvisorPage() {
  const { exchangeRate } = useApp();

  const [step, setStep] = useState<number>(1);
  const [deviceCategory, setDeviceCategory] = useState<"phone" | "laptop" | "console">("phone");
  const [budgetTier, setBudgetTier] = useState<"budget" | "midrange" | "flagship">("flagship");
  const [priority, setPriority] = useState<"camera" | "gaming" | "battery" | "value">("camera");
  const [brandPref, setBrandPref] = useState<string>("all");

  // Recommendation engine
  const recommendations = useMemo(() => {
    return COMPARISON_DEVICES.filter((device) => {
      // Category match
      if (device.category !== deviceCategory) return false;

      // Brand filter
      if (brandPref !== "all" && device.brand.toLowerCase() !== brandPref.toLowerCase()) {
        return false;
      }

      // Budget filter
      if (budgetTier === "budget" && device.priceUSD > 500) return false;
      if (budgetTier === "midrange" && (device.priceUSD < 400 || device.priceUSD > 900)) return false;
      if (budgetTier === "flagship" && device.priceUSD < 800) return false;

      return true;
    }).map((dev) => {
      // Calculate match score
      let match = 85;
      if (priority === "camera" && (dev.specs.mainCamera.includes("200MP") || dev.specs.mainCamera.includes("ProRes"))) {
        match += 12;
      }
      if (priority === "battery" && (dev.specs.battery.includes("6,100") || dev.specs.battery.includes("16 کاتژمێر"))) {
        match += 14;
      }
      if (priority === "gaming" && (dev.specs.chipset.includes("A19") || dev.specs.chipset.includes("Elite") || dev.specs.chipset.includes("M4"))) {
        match += 13;
      }
      if (priority === "value" && dev.brand === "Xiaomi") {
        match += 14;
      }
      return {
        device: dev,
        matchScore: Math.min(99, match),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [deviceCategory, budgetTier, priority, brandPref]);

  const handleReset = () => {
    setStep(1);
    setDeviceCategory("phone");
    setBudgetTier("flagship");
    setPriority("camera");
    setBrandPref("all");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-amber-500 font-bold">ڕاوێژکاری زیرەکی دەستکرد بۆ کڕینی ئامێر</span>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-950 p-6 sm:p-10 border border-amber-500/30 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>KurdTech Smart Advisor 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            ڕاوێژکاری زیرەک: چ مۆبایل یان ئامێرێک بۆ تۆ گونجاوترینە؟
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            وەڵامی چەند پرسیارێکی خێرا بدەرەوە؛ سیستەمە ژیرەکەی کوردتێک بەپێی بودجە و پێداویستییەکانت و نرخی ڕاستەقینەی بازاڕەکانی کوردستان باشترین بژاردەت بۆ دیاری دەکات.
          </p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
        {[
          { num: 1, label: "جۆری ئامێر" },
          { num: 2, label: "بودجە" },
          { num: 3, label: "ئەولەویەت" },
          { num: 4, label: "کۆمپانیا" },
          { num: 5, label: "ئەنجامی پێشنیار" },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all ${
              step === s.num
                ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                : step > s.num
                ? "bg-emerald-500/10 text-emerald-500 cursor-pointer"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-black">
              {s.num}
            </span>
            <span className="hidden md:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Device Category */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              دەگەڕێیت بەدوای چ جۆرە ئامێرێکدا؟
            </h2>
            <p className="text-xs text-slate-400">
              ئەو ئامێرە دیاری بکە کە دەتەوێت لە بازاڕی کوردستان بکڕیت
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "phone", label: "مۆبایلی زیرەک", desc: "ئایفۆن، گالاکسی، شیاومی", icon: Smartphone },
              { id: "laptop", label: "لاپتۆپ و کۆمپیوتەر", desc: "بۆ خوێندکاران و مۆنتیاژ", icon: Laptop },
              { id: "console", label: "کۆنسۆڵی گەیمینگ", desc: "پلەیستەیشن ٥ و ئێکس بۆکس", icon: Gamepad2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setDeviceCategory(item.id as any);
                    setStep(2);
                  }}
                  className={`p-6 rounded-3xl border-2 text-center space-y-3 cursor-pointer transition-all hover:scale-105 ${
                    deviceCategory === item.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">{item.label}</h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Budget Tier */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              بودجەکەت چەندە بۆ ئەم کڕینە؟
            </h2>
            <p className="text-xs text-slate-400">
              ئاستی بودجەی خەمڵێنراو بەپێی بازاڕی هەولێر و سلێمانی
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "budget", label: "ئابووری و هەرزان", range: "کەمتر لە ٤٥٠$", desc: "کاروباری ڕۆژانە و پاتری" },
              { id: "midrange", label: "مامناوەندی کارامە", range: "٤٥٠$ تا ٨٥٠$", desc: "باشترین هاوسەنگی نرخ و ئەدا" },
              { id: "flagship", label: "ئاڵاهەڵگری پرۆفیشناڵ", range: "سەرووی ٨٥٠$", desc: "لوتکەی کواڵیتی و کامێرا" },
            ].map((tier) => (
              <div
                key={tier.id}
                onClick={() => {
                  setBudgetTier(tier.id as any);
                  setStep(3);
                }}
                className={`p-6 rounded-3xl border-2 text-center space-y-3 cursor-pointer transition-all hover:scale-105 ${
                  budgetTier === tier.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto font-black text-lg">
                  $
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">{tier.label}</h3>
                <p className="text-xs font-black text-amber-500" dir="ltr">{tier.range}</p>
                <p className="text-[11px] text-slate-400">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Priority */}
      {step === 3 && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              گرنگترین ئەولەویەتت چییە لەم ئامێرەدا؟
            </h2>
            <p className="text-xs text-slate-400">
              ئەو تایبەتمەندییەی کە ناتەوێت دەستبەرداری ببیت
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "camera", label: "کواڵیتی باڵای کامێرا و وێنە", desc: "زوومی بەهێز، وێنەی شەوانە، ڤیدیۆی سینەمایی", icon: Camera },
              { id: "gaming", label: "گەیمینگ و خێرایی بەرز", desc: "یارییە قورسەکان، گەرم نەبوون، ڕوونمای 120Hz", icon: Zap },
              { id: "battery", label: "تەمەنی درێژی پاتری", desc: "کارکردنی زیاتر لە ١٥ کاتژمێر بێ پاوەربانک", icon: Battery },
              { id: "value", label: "بەهای زۆر بەرامبەر پارە", desc: "زۆرترین مواسەفات بە کەمترین تێچوو", icon: DollarSign },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setPriority(p.id as any);
                    setStep(4);
                  }}
                  className={`p-5 rounded-3xl border-2 flex items-start gap-4 cursor-pointer transition-all hover:scale-102 ${
                    priority === p.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">{p.label}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 4: Brand Preference */}
      {step === 4 && (
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ئایا براندێکی دیاریکراوت لە مێشکدایە؟
            </h2>
            <p className="text-xs text-slate-400">
              دەتوانیت براندەکە هەڵبژێریت یان بیهێڵیتەوە بۆ باشترین پێشنیار
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "all", label: "هەموو کۆمپانیاکان" },
              { id: "apple", label: "Apple (ئەپڵ)" },
              { id: "samsung", label: "Samsung (سامسۆنگ)" },
              { id: "xiaomi", label: "Xiaomi (شیاومی)" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBrandPref(b.id);
                  setStep(5);
                }}
                className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all ${
                  brandPref === b.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-500 font-black"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Final Recommendation Results */}
      {step === 5 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                شیکارییەکە تەواو بوو!
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                باشترین ئامێرە پێشنیارکراوەکان بۆتۆ
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-2 transition-all w-fit"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>دەستپێکردنەوەی پشکنین</span>
            </button>
          </div>

          {/* Results Grid */}
          {recommendations.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-md mx-auto p-6">
              <p className="font-bold text-slate-400">
                هیچ ئامێرێک نەدۆزرایەوە بەم فلتەرە وردە. تکایە براند یان بودجەکە فراوانتر بکە.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
              >
                دووبارە تاقیکردنەوە
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(({ device, matchScore }, idx) => {
                const iqd = formatIQD(device.priceUSD, exchangeRate);
                return (
                  <div
                    key={device.id}
                    className={`bg-white dark:bg-[#111827] rounded-3xl p-6 border shadow-xl flex flex-col justify-between space-y-5 relative transition-all ${
                      idx === 0
                        ? "border-amber-500 ring-4 ring-amber-500/10"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Top Best Match Ribbon */}
                    {idx === 0 && (
                      <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg">
                        🏆 گونجاوترین هەڵبژاردن بۆتۆ
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={device.imageUrl}
                          alt={device.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-black flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{matchScore}٪ گونجاوە</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          {device.brand}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white" dir="ltr">
                          {device.name}
                        </h3>
                      </div>

                      {/* Pricing */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400">نرخی بازاڕ:</span>
                          <p className="font-black text-lg text-purple-600" dir="ltr">
                            ${device.priceUSD}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400">بە دینار:</span>
                          <p className="font-bold text-xs text-emerald-500">{iqd}</p>
                        </div>
                      </div>

                      {/* Why it matches */}
                      <div className="space-y-2 text-xs">
                        <p className="font-bold text-slate-700 dark:text-slate-300">
                          بۆچی ئەم ئامێرە شایەنی کڕینە؟
                        </p>
                        <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                          {device.pros.slice(0, 2).map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Link
                        href="/compare"
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-1 shadow-md transition-all"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>بەراوردکاری</span>
                      </Link>

                      <Link
                        href="/prices"
                        className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white text-xs font-bold"
                        title="بینینی نرخ لە بازاڕەکانی تر"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
