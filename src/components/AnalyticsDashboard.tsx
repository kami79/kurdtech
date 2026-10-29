"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bot,
  Calendar,
  Clock,
  Eye,
  Flame,
  Globe,
  Heart,
  Laptop,
  MessageSquare,
  RefreshCw,
  Smartphone,
  Star,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import { Article } from "@/types";
import {
  AnalyticsEvent,
  computeRealTimeAnalytics,
  computeSiteAnalytics,
  formatKurdishViews,
  RealTimeAnalyticsReport,
  toKurdishDigits,
} from "@/lib/analyticsUtils";

interface AnalyticsDashboardProps {
  articles: Article[];
}

export default function AnalyticsDashboard({ articles }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [serverReport, setServerReport] = useState<RealTimeAnalyticsReport | null>(null);
  const [localEvents, setLocalEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const contentSummary = useMemo(() => computeSiteAnalytics(articles), [articles]);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load local browser-tracked events as fallback/instant sync
      let localList: AnalyticsEvent[] = [];
      try {
        const raw = localStorage.getItem("kurdtech_analytics_events");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localList = parsed;
        }
      } catch {}
      setLocalEvents(localList);

      const res = await fetch(`/api/analytics?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.realtime) {
          setServerReport(json.realtime);
        }
      }
      setLastUpdated(new Date().toLocaleTimeString("ckb-IQ"));
    } catch {
      // Fallback to local events if offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 15000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  // Use server report if it has events, or compute from local events if server is fresher/empty
  const realtime: RealTimeAnalyticsReport = useMemo(() => {
    const localComputed = computeRealTimeAnalytics(localEvents, articles);
    if (!serverReport) return localComputed;
    if (serverReport.allTimeRecordedViews >= localComputed.allTimeRecordedViews) {
      return serverReport;
    }
    return localComputed;
  }, [serverReport, localEvents, articles]);

  const activeSeries = useMemo(() => {
    if (period === "day") return realtime.hourlySeries;
    if (period === "week") return realtime.daily7Series;
    return realtime.daily30Series;
  }, [period, realtime]);

  const activePeriodStats = useMemo(() => {
    if (period === "day") return realtime.today;
    if (period === "week") return realtime.week;
    return realtime.month;
  }, [period, realtime]);

  const maxChartViews = useMemo(() => {
    const m = Math.max(...activeSeries.map((p) => p.views), 1);
    return m;
  }, [activeSeries]);

  const periodTitle =
    period === "day"
      ? "ئەمڕۆ (٢٤ کاتژمێر بەپێی کاتژمێر)"
      : period === "week"
      ? "ئەم هەفتەیە (٧ ڕۆژی ڕابردوو بەپێی ڕۆژ)"
      : "ئەم مانگە (٣٠ ڕۆژی ڕابردوو بەپێی ڕۆژ)";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Real-Time Header & Period Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 border border-purple-500/30 text-white shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ئاماری ڕاستەقینەی سەردانیکەران (Real-Time Analytics)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black">
              ئاماری ڕاستەوخۆی ڕۆژانە، هەفتانە و مانگانە
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              هەموو سەردانێکی پەڕەکان و خوێندنەوەی بابەتەکان بە شێوەی ڕاستەقینە بەپێی کاتژمێر، ڕۆژ، هەفتە و مانگ تۆمار دەکرێت.
            </p>
          </div>

          {/* Period Switcher + Refresh */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-purple-500/30 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPeriod("day")}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  period === "day"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ڕۆژانە (٢٤ کاتژمێر)
              </button>
              <button
                type="button"
                onClick={() => setPeriod("week")}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  period === "week"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                هەفتانە (٧ ڕۆژ)
              </button>
              <button
                type="button"
                onClick={() => setPeriod("month")}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  period === "month"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                مانگانە (٣٠ ڕۆژ)
              </button>
            </div>

            <button
              type="button"
              onClick={loadAnalytics}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
              title="نوێکردنەوەی ئاماری ڕاستەوخۆ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>نوێکردنەوە</span>
            </button>
          </div>
        </div>

        {/* 4 Real-Time Period Summary Cards (Live / Today / Week / Month) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Live Now */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ئێستا لە ماڵپەڕن (١٥ خولەک)
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {toKurdishDigits(Math.max(1, realtime.liveVisitorsNow))} سەردانیکەر
            </p>
            <p className="text-[11px] text-slate-300">
              دواین نوێکردنەوە: {lastUpdated || "ئێستا"}
            </p>
          </div>

          {/* Card 2: Today (Per Day) */}
          <div
            onClick={() => setPeriod("day")}
            className={`p-4 rounded-2xl backdrop-blur-md border cursor-pointer transition-all space-y-1.5 ${
              period === "day"
                ? "bg-purple-600/30 border-purple-400 ring-2 ring-purple-400/30"
                : "bg-white/10 border-white/15 hover:bg-white/15"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-200 font-bold">
              <span>ئەمڕۆ (ڕۆژانە)</span>
              <Clock className="w-4 h-4 text-purple-300" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {toKurdishDigits(realtime.today.views)} بینین
            </p>
            <p className="text-[11px] text-purple-200 flex items-center justify-between">
              <span>{toKurdishDigits(realtime.today.uniqueVisitors)} سەردانیکەری جیاواز</span>
              <span>{toKurdishDigits(realtime.today.articleViews)} خوێندنەوەی بابەت</span>
            </p>
          </div>

          {/* Card 3: This Week (Last 7 Days) */}
          <div
            onClick={() => setPeriod("week")}
            className={`p-4 rounded-2xl backdrop-blur-md border cursor-pointer transition-all space-y-1.5 ${
              period === "week"
                ? "bg-purple-600/30 border-purple-400 ring-2 ring-purple-400/30"
                : "bg-white/10 border-white/15 hover:bg-white/15"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-200 font-bold">
              <span>ئەم هەفتەیە (٧ ڕۆژ)</span>
              <Calendar className="w-4 h-4 text-sky-300" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {toKurdishDigits(realtime.week.views)} بینین
            </p>
            <p className="text-[11px] text-purple-200 flex items-center justify-between">
              <span>{toKurdishDigits(realtime.week.uniqueVisitors)} سەردانیکەری جیاواز</span>
              <span>{toKurdishDigits(realtime.week.articleViews)} خوێندنەوەی بابەت</span>
            </p>
          </div>

          {/* Card 4: This Month (Last 30 Days) */}
          <div
            onClick={() => setPeriod("month")}
            className={`p-4 rounded-2xl backdrop-blur-md border cursor-pointer transition-all space-y-1.5 ${
              period === "month"
                ? "bg-purple-600/30 border-purple-400 ring-2 ring-purple-400/30"
                : "bg-white/10 border-white/15 hover:bg-white/15"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-200 font-bold">
              <span>ئەم مانگە (٣٠ ڕۆژ)</span>
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {toKurdishDigits(realtime.month.views)} بینین
            </p>
            <p className="text-[11px] text-purple-200 flex items-center justify-between">
              <span>{toKurdishDigits(realtime.month.uniqueVisitors)} سەردانیکەری جیاواز</span>
              <span>{toKurdishDigits(realtime.month.articleViews)} خوێندنەوەی بابەت</span>
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Chart (Per Day / Per Week / Per Month) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>هێڵکاری هاتووچۆ و بینین — {periodTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              کۆی بینین لەم ماوەیەدا:{" "}
              <strong className="text-purple-600 dark:text-purple-400">
                {toKurdishDigits(activePeriodStats.views)} بینین
              </strong>{" "}
              لەلایەن{" "}
              <strong className="text-emerald-500">
                {toKurdishDigits(activePeriodStats.uniqueVisitors)} سەردانیکەری جیاواز
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-purple-600 inline-block" />
              بینینی پەڕە (Views)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              سەردانیکەر (Visitors)
            </span>
          </div>
        </div>

        {/* Bar Chart Grid */}
        <div className="overflow-x-auto pb-2">
          <div
            className="flex items-end gap-2 sm:gap-3 h-52 pt-8 px-2 min-w-[600px]"
            dir="ltr"
          >
            {activeSeries.map((pt) => {
              const viewsHeightPct =
                pt.views > 0 ? Math.max(10, Math.round((pt.views / maxChartViews) * 100)) : 3;
              const visitorsHeightPct =
                pt.visitors > 0
                  ? Math.max(8, Math.round((pt.visitors / maxChartViews) * 100))
                  : 0;

              return (
                <div
                  key={pt.dateKey}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-7 z-20 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
                    {toKurdishDigits(pt.views)} بینین • {toKurdishDigits(pt.visitors)} کەس
                  </div>

                  {/* Count label above bar when > 0 */}
                  {pt.views > 0 && (
                    <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 mb-1">
                      {toKurdishDigits(pt.views)}
                    </span>
                  )}

                  {/* Bars container */}
                  <div className="w-full flex items-end justify-center gap-0.5 h-36 bg-slate-100/70 dark:bg-slate-800/40 rounded-t-xl overflow-hidden px-0.5">
                    <div
                      className={`flex-1 rounded-t-lg transition-all duration-500 ${
                        pt.views > 0
                          ? "bg-gradient-to-t from-purple-700 to-purple-500 group-hover:from-purple-600 group-hover:to-purple-400"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                      style={{ height: `${viewsHeightPct}%` }}
                    />
                    {pt.visitors > 0 && (
                      <div
                        className="w-1.5 sm:w-2 rounded-t-lg bg-emerald-500 transition-all duration-500"
                        style={{ height: `${visitorsHeightPct}%` }}
                      />
                    )}
                  </div>

                  {/* X-Axis Label */}
                  <div className="mt-2 text-center">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {pt.label}
                    </p>
                    {pt.subLabel && period !== "month" && (
                      <p className="text-[9px] text-slate-400 truncate">{pt.subLabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Visited Pages in Selected Period & Device/Referrer Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Pages for Selected Period (Day / Week / Month) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <span>
                پڕسەردانترین پەڕە و بابەتەکان (
                {period === "day"
                  ? "ئەمڕۆ"
                  : period === "week"
                  ? "ئەم هەفتەیە"
                  : "ئەم مانگە"}
                )
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">بینینی ڕاستەقینە</span>
          </div>

          {activePeriodStats.topPages.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              هێشتا هیچ سەردانێک لەم ماوەیەدا تۆمار نەکراوە.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activePeriodStats.topPages.map((pg, idx) => (
                <div
                  key={pg.path}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center shrink-0">
                      {toKurdishDigits(idx + 1)}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={pg.path}
                        className="font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 truncate block"
                      >
                        {pg.label}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                        {pg.path}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black">
                      {toKurdishDigits(pg.views)} بینین
                    </span>
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {toKurdishDigits(pg.visitors)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices & Traffic Sources */}
        <div className="lg:col-span-5 space-y-6">
          {/* Device Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span>ئامێری سەردانیکەران (Devices)</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <Smartphone className="w-5 h-5 text-purple-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">مۆبایل</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {toKurdishDigits(realtime.devices.mobilePct)}٪
                </p>
                <p className="text-[10px] text-slate-400">
                  ({toKurdishDigits(realtime.devices.mobile)} سەردان)
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <Laptop className="w-5 h-5 text-sky-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">کۆمپیوتەر</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {toKurdishDigits(realtime.devices.desktopPct)}٪
                </p>
                <p className="text-[10px] text-slate-400">
                  ({toKurdishDigits(realtime.devices.desktop)} سەردان)
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <Tablet className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">تابلێت</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {toKurdishDigits(realtime.devices.tabletPct)}٪
                </p>
                <p className="text-[10px] text-slate-400">
                  ({toKurdishDigits(realtime.devices.tablet)} سەردان)
                </p>
              </div>
            </div>
          </div>

          {/* Referrers / Traffic Sources */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>سەرچاوەی هاتنی خوێنەران (Traffic Sources)</span>
            </h3>

            {realtime.referrers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">هیچ داتایەک نییە</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {realtime.referrers.map((ref, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {ref.source}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {toKurdishDigits(ref.count)} سەردان
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black">
                        {toKurdishDigits(ref.pct)}٪
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Recent Visits Log */}
      {realtime.recentEvents.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>دواین سەردانە ڕاستەوخۆکان (Live Visitor Stream)</span>
            </h3>
            <span className="text-xs text-slate-400">دواین ١٠ چالاکی</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {realtime.recentEvents.map((ev, i) => (
              <div
                key={i}
                className="py-2.5 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <Link
                    href={ev.path}
                    className="font-bold text-slate-800 dark:text-slate-200 hover:text-purple-600 truncate"
                  >
                    {ev.label}
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    {ev.device === "mobile"
                      ? "📱 مۆبایل"
                      : ev.device === "tablet"
                      ? "📟 تابلێت"
                      : "💻 کۆمپیوتەر"}
                  </span>
                  <span>{ev.referrer}</span>
                  <span dir="ltr">
                    {new Date(ev.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Content & Category Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>کۆی بینینی بەشەکانی ماڵپەڕ</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold">
              کۆی گشتی: {formatKurdishViews(contentSummary.totalViews)}
            </span>
          </div>

          <div className="space-y-4">
            {contentSummary.categoryBreakdown.map((cat) => (
              <div key={cat.slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.name}{" "}
                    <span className="text-slate-400 font-normal">
                      ({toKurdishDigits(cat.articleCount)} بابەت)
                    </span>
                  </span>
                  <span className="font-black text-purple-600 dark:text-purple-400">
                    {formatKurdishViews(cat.views)} ({toKurdishDigits(cat.percentageOfViews)}٪)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(4, cat.percentageOfViews)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles All-Time */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>پڕبینەرترین بابەتەکان (گشتی)</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {contentSummary.topArticles.map((art, idx) => (
              <div
                key={art.id}
                className="py-3 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg font-black flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? "bg-amber-500 text-slate-950"
                        : idx === 1
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {toKurdishDigits(idx + 1)}
                  </span>
                  <Link
                    href={`/articles/${art.id}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-purple-600 truncate"
                  >
                    {art.title}
                  </Link>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {art.viewsLabel}
                  </span>
                  <span className="flex items-center gap-0.5 text-rose-500 font-bold">
                    <Heart className="w-3 h-3" />
                    {toKurdishDigits(art.likesCount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

