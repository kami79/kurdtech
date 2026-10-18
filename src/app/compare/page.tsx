"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Star,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Plus,
  Trash2,
  Zap,
  Cpu,
  Layers,
  Battery,
  Camera,
  Monitor,
  Share2,
} from "lucide-react";
import { COMPARISON_DEVICES } from "@/data/devices";
import { formatIQD } from "@/data/articles";
import { useApp } from "@/context/AppContext";
import { DeviceItem } from "@/types";

export default function ComparePage() {
  const { exchangeRate, showToast } = useApp();

  const [device1Id, setDevice1Id] = useState<string>("iphone-17-pro-max");
  const [device2Id, setDevice2Id] = useState<string>("galaxy-s26-ultra");
  const [device3Id, setDevice3Id] = useState<string>("xiaomi-15-pro");
  const [showDevice3, setShowDevice3] = useState<boolean>(true);

  const d1 = COMPARISON_DEVICES.find((d) => d.id === device1Id) || COMPARISON_DEVICES[0];
  const d2 = COMPARISON_DEVICES.find((d) => d.id === device2Id) || COMPARISON_DEVICES[1];
  const d3 = COMPARISON_DEVICES.find((d) => d.id === device3Id) || COMPARISON_DEVICES[2];

  const activeDevices: DeviceItem[] = showDevice3 ? [d1, d2, d3] : [d1, d2];

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("بەستەری بەراوردکارییەکە کۆپی کرا!", "success");
    }
  };

  const specRows = [
    { label: "ڕوونما (Display)", key: "display", icon: Monitor },
    { label: "پرۆسێسەر (Chipset)", key: "chipset", icon: Cpu },
    { label: "ڕام (RAM)", key: "ram", icon: Layers },
    { label: "بیرگەی ناوەکی (Storage)", key: "storage", icon: Layers },
    { label: "کامێرای سەرەکی (Main Camera)", key: "mainCamera", icon: Camera },
    { label: "کامێرای سێڵفی (Selfie)", key: "selfieCamera", icon: Camera },
    { label: "پاتری و کارکردن (Battery)", key: "battery", icon: Battery },
    { label: "خێرایی بارگاویکردنەوە (Charging)", key: "charging", icon: Zap },
    { label: "کێش و کەرەستە (Weight & Build)", key: "weight", icon: Scale },
    { label: "سیستەمی کارپێکەر (OS)", key: "os", icon: Layers },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          سەرەتا
        </Link>
        <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
        <span className="text-purple-600 font-bold">ئامرازی بەراوردکاری ئامێرەکان</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 p-6 sm:p-10 border border-purple-500/30 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold">
              <Scale className="w-4 h-4" />
              <span>شیکارییە مەیدانییەکانی تیمی کوردتێک</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">
              بەراوردی ڕاستەوخۆی مۆبایل و ئامێرە زیرەکەکان
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ئامێرەکان دەستنیشان بکە بۆ بینینی هەموو وردەکارییەکان، نرخی بازاڕ لە کوردستان، خاڵە بەهێزەکان و نمرەی شایستەیی.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>هاوبەشکردنی بەراوردکاری</span>
            </button>
          </div>
        </div>
      </div>

      {/* Device Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device 1 Selector */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <label className="text-xs font-bold text-slate-400">ئامێری یەکەم:</label>
          <select
            value={device1Id}
            onChange={(e) => setDevice1Id(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
          >
            {COMPARISON_DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Device 2 Selector */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <label className="text-xs font-bold text-slate-400">ئامێری دووەم:</label>
          <select
            value={device2Id}
            onChange={(e) => setDevice2Id(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
          >
            {COMPARISON_DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Device 3 Selector / Toggle */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400">ئامێری سێیەم (ئارەزوومەندانە):</label>
            <button
              onClick={() => setShowDevice3(!showDevice3)}
              className="text-xs text-purple-600 font-bold hover:underline"
            >
              {showDevice3 ? "لابردن" : "+ زیادکردن"}
            </button>
          </div>

          {showDevice3 ? (
            <select
              value={device3Id}
              onChange={(e) => setDevice3Id(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold outline-none focus:border-purple-500 text-slate-900 dark:text-white"
            >
              {COMPARISON_DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setShowDevice3(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-purple-600 hover:border-purple-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>زیادکردنی ئامێری سێیەم بۆ بەراورد</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Overview Cards */}
      <div className={`grid grid-cols-1 ${showDevice3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
        {activeDevices.map((device, index) => {
          const iqd = formatIQD(device.priceUSD, exchangeRate);
          return (
            <div
              key={device.id}
              className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-5 text-center flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={device.imageUrl}
                    alt={device.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-purple-400 text-xs font-black">
                    {device.brand}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white" dir="ltr">
                  {device.name}
                </h3>

                {/* Score and Price */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-1 rounded-xl font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{device.reviewScore} / ١٠</span>
                  </div>

                  <div className="text-center">
                    <span className="text-xl font-black text-purple-600" dir="ltr">
                      ${device.priceUSD}
                    </span>
                    <p className="text-[11px] text-slate-400 font-bold">{iqd}</p>
                  </div>
                </div>
              </div>

              {/* Pros & Cons Highlights */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-right text-xs">
                <div className="space-y-1.5">
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> بەهێزترین خاڵ:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 pr-4">
                    {device.pros[0]}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> لاوازترین خاڵ:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 pr-4">
                    {device.cons[0]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Side-by-Side Specs Matrix Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            خشتەی شیکاری تەکنیکی بەراوردکراو
          </h3>
          <span className="text-xs text-slate-400">بەپێی تاقیکردنەوەی تاقیگەی کوردتێک</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {specRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.key} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-full md:w-56 shrink-0 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                  <Icon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>{row.label}</span>
                </div>

                <div className={`grid grid-cols-1 ${showDevice3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 flex-1 w-full text-xs sm:text-sm`}>
                  {activeDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100 leading-relaxed text-right"
                    >
                      <span className="block text-[10px] text-slate-400 font-bold md:hidden mb-1" dir="ltr">
                        {dev.name}:
                      </span>
                      {dev.specs[row.key as keyof typeof dev.specs]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
