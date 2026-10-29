"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Search, Sparkles, Bookmark } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { setIsSearchOpen, bookmarks } = useApp();

  // Hide on admin studio to give full screen to CMS tables/forms
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      label: "سەرەتا",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "نرخی بازاڕ",
      href: "/prices",
      icon: TrendingUp,
      isActive: pathname === "/prices",
    },
    {
      label: "گەڕان",
      action: () => setIsSearchOpen(true),
      icon: Search,
      isCenter: true,
    },
    {
      label: "ڕاوێژکار",
      href: "/advisor",
      icon: Sparkles,
      isActive: pathname === "/advisor",
    },
    {
      label: "پاشەکەوت",
      href: "/saved",
      icon: Bookmark,
      isActive: pathname === "/saved",
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
    },
  ];

  return (
    <nav
      aria-label="مێنۆی خوارەوەی مۆبایل"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0b0f17]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-2 max-w-md mx-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={idx} className="flex justify-center">
                <button
                  type="button"
                  onClick={item.action}
                  aria-label={item.label}
                  className="-mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-purple-600/40 ring-4 ring-white dark:ring-[#0b0f17] active:scale-90 transition-transform"
                >
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl transition-all active:scale-95 ${
                item.isActive
                  ? "text-purple-600 dark:text-purple-400 font-black"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#0b0f17]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none">{item.label}</span>
              {item.isActive && (
                <span className="absolute top-0 w-6 h-0.5 rounded-full bg-purple-600 dark:bg-purple-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

