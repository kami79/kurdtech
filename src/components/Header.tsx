"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Sun,
  Moon,
  Bookmark,
  TrendingUp,
  Menu,
  X,
  Scale,
  PlusCircle,
  Sparkles,
  MessageSquare,
  User,
  RefreshCw,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const pathname = usePathname();
  const {
    isDark,
    toggleTheme,
    setIsSearchOpen,
    bookmarks,
    refreshArticles,
    isLoadingArticles,
    showToast,
    isAdmin,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshArticles(true);
      showToast("پۆڕتاڵ بە سەرکەوتوویی نوێکرایەوە و نوێترین هەواڵەکان وەرگیران!", "success");
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 600);
    }
  };

  const navLinks = [
    { label: "سەرەتا", href: "/" },
    { label: "ڕاوێژکار", href: "/advisor", badge: "AI" },
    { label: "بەراوردکاری", href: "/compare" },
    { label: "کۆمەڵگە", href: "/community", badge: "نوێ" },
    { label: "زیرەکی دەستکرد", href: "/category/ai" },
    { label: "مۆبایل", href: "/category/mobile" },
    { label: "پێداچوونەوە", href: "/category/reviews" },
    { label: "تەکنەلۆژیا لە کوردستان", href: "/category/kurdistan" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 dark:bg-[#0b0f17]/90 border-b border-slate-200/80 dark:border-purple-900/20 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none shrink-0">
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-2xl shadow-lg shadow-purple-600/30 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                K
              </div>
              <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-md -z-10 group-hover:bg-purple-500/40 transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  کورد<span className="text-purple-600 dark:text-purple-400">تێک</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25">
                  KurdTech
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                مەگەزینی تەکنەلۆژیای کوردستان
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 relative ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Prices Quick Button */}
          <Link
            href="/prices"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold border border-emerald-500/30 transition-all shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>نرخی بازاڕ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </Link>

          {/* Live Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isManualRefreshing || isLoadingArticles}
            className="inline-flex items-center justify-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/25 transition-all shadow-sm active:scale-95 disabled:opacity-60"
            title="نوێکردنەوەی پۆڕتاڵ و دەستکەوتنی نوێترین هەواڵەکان"
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${
                isManualRefreshing || isLoadingArticles ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">نوێکردنەوە</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Admin Studio Quick Link (Visible ONLY to authenticated Admin) */}
          <Link
            href="/admin"
            className={
              isAdmin
                ? "hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-500/15 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold border border-slate-200 dark:border-slate-700/80 transition-all shadow-sm"
                : "hidden"
            }
            title="ستۆدیۆی نووسەران و بەڕێوەبردن"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>ستۆدیۆ</span>
          </Link>

          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/70 transition-all text-xs shadow-sm hover:border-purple-500/40 active:scale-95"
            title="گەڕان لە هەموو پۆڕتاڵ (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="hidden md:inline font-medium">گەڕان...</span>
            <kbd className="hidden lg:inline px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono text-[10px] text-slate-500 dark:text-slate-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Bookmarks Counter Button (Desktop/Tablet - on mobile it lives in Bottom Nav) */}
          <Link
            href="/saved"
            aria-label="پاشەکەوتکراوەکان"
            className="hidden sm:inline-flex relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 transition-all shadow-sm"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {/* User Profile Hub Link */}
          <Link
            href="/profile"
            aria-label="پەڕگەی بەکارهێنەر"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-purple-500/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 transition-all shadow-sm active:scale-95"
            title="پەڕگەی چالاکییەکان"
          >
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="گۆڕینی ڕەنگی پاشبنەما"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 transition-all shadow-sm group active:scale-95"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 shadow-sm active:scale-95"
            aria-label="مێنۆی مۆبایل"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Horizontal Swipeable Quick-Nav Strip for Mobile & Tablet */}
      <div className="xl:hidden border-t border-slate-200/60 dark:border-slate-800/70 bg-slate-50/70 dark:bg-[#0d131f]/80 px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                    : "bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/prices"
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95 ${
              pathname === "/prices"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>نرخی بازاڕ</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl px-4 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Link
              href="/prices"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex flex-col items-center gap-1.5 text-xs font-bold text-center hover:bg-emerald-500/20 transition-colors active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>نرخی بازاڕ</span>
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex flex-col items-center gap-1.5 text-xs font-bold text-center hover:bg-purple-500/20 transition-colors active:scale-95"
            >
              <Scale className="w-4 h-4" />
              <span>بەراوردکاری</span>
            </Link>
            <Link
              href="/advisor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex flex-col items-center gap-1.5 text-xs font-bold text-center hover:bg-amber-500/20 transition-colors active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>ڕاوێژکاری AI</span>
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 flex flex-col items-center gap-1.5 text-xs font-bold text-center hover:bg-indigo-500/20 transition-colors active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>کۆمەڵگە</span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1.5 pt-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-colors ${
                  pathname === link.href
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25"
              >
                <span>ستۆدیۆی بەڕێوەبەر (Admin Studio)</span>
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
