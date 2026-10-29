"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Send, Heart, Sparkles, Scale, BookA, Tag, MessageSquare } from "lucide-react";
import { CATEGORIES } from "@/data/articles";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 dark:bg-[#070a10] text-slate-400 border-t border-slate-800/80 pt-16 pb-12 px-4 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-600/30">
                K
              </div>
              <span className="text-xl font-black text-white">
                کورد<span className="text-purple-500">تێک</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              کوردتێک یەکەمین و پێشکەوتووترین مەگەزینی دیجیتاڵیی تەکنەلۆژیایە لە هەرێمی کوردستان، کە شیکاری و پێداچوونەوەی بێلایەنانە بۆ ئامێرە زیرەکەکان و زیرەکی دەستکرد پێشکەش دەکات.
            </p>

            <div className="flex items-center gap-3 text-xs pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                هەولێر
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                سلێمانی
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                دهۆک
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">بەشە سەرەکییەکان</h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(1, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">خزمەتگوزارییە تایبەتەکان</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/advisor" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ڕاوێژکاری کڕینی ئامێر</span>
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  <span>بەراوردکاری ئامێرەکان</span>
                </Link>
              </li>
              <li>
                <Link href="/prices" className="hover:text-emerald-400 transition-colors">
                  پێنوێنی نرخی بازاڕ
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-500" />
                  <span>داشکاندنی فرۆشگاکان</span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>کۆمەڵگەی پرسیار و چارەسەر</span>
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <BookA className="w-3.5 h-3.5 text-teal-400" />
                  <span>فەرهەنگی تەکنەلۆژیا</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* User & Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">بەستەرە سوودبەخشەکان</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  پەڕگەی چالاکییەکان
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-white transition-colors">
                  بابەتە پاشەکەوتکراوەکان
                </Link>
              </li>
              <li>
                <Link href="/prices" className="hover:text-white transition-colors">
                  نرخی ڕۆژانەی بازاڕ
                </Link>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">یاسای پاراستنی نهێنی</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">پەیوەندی و ڕیکلام</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>دروستکراوە بە</span>
            <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
            <span>بۆ کۆمەڵگەی تەکنەلۆژیای کوردستان © ٢٠٢٦ KurdTech</span>
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-all text-xs font-bold"
          >
            <span>گەڕانەوە بۆ سەرەوە</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
