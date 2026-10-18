"use client";

import React, { useState } from "react";
import { Video, Play, X, Eye, Clock } from "lucide-react";
import { VIDEO_REVIEWS } from "@/data/articles";
import { VideoItem } from "@/types";

export default function VideoSection() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <section className="bg-slate-900 dark:bg-[#070b12] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">کوردتێک تیڤی (ڤیدیۆ و پێداچوونەوە)</h2>
            <p className="text-xs text-slate-400">تاقیکردنەوەی مەیدانی و شیکاری ڤیدیۆیی بە زمانی کوردی</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold w-fit">
          نوێترین هەڵسەنگاندنە ڤیدیۆییەکان
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {VIDEO_REVIEWS.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="group bg-slate-800/50 hover:bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer hover:border-purple-500/60 transition-all duration-300 shadow-md hover:shadow-2xl"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-purple-600 transition-transform">
                  <Play className="w-6 h-6 fill-white translate-x-0.5" />
                </div>
              </div>

              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/85 text-[11px] font-bold">
                {vid.duration}
              </span>
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-purple-600 text-[11px] font-bold shadow-md">
                {vid.category}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-bold text-sm leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
                {vid.title}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {vid.views} بینین
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold">
                {activeVideo.category}
              </span>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Simulated / Embed Screen */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl animate-pulse">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-200">
                  ڤیدیۆی شیکاری کوردتێک لە کەناڵی فەرمی یوتیوب
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white">{activeVideo.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activeVideo.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>ماوە: {activeVideo.duration}</span>
                <span>•</span>
                <span>{activeVideo.views} بینین</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
