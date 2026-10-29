"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Clock,
  Eye,
  MessageSquare,
  Heart,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  XCircle,
  Star,
  ChevronRight,
  Send,
  Sparkles,
  ArrowRight,
  User,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Type,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import ArticleCard from "@/components/ArticleCard";
import MarketPricesWidget from "@/components/MarketPricesWidget";
import { Comment } from "@/types";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";

export default function ArticleDetailClient({ articleId }: { articleId?: string }) {
  const params = useParams();
  const id = articleId || (params?.id as string);

  const {
    getArticle,
    articles,
    isBookmarked,
    toggleBookmark,
    isLiked,
    toggleLike,
    showToast,
    fontSize,
    setFontSize,
    addToHistory,
    isLoadingArticles,
  } = useApp();

  const [isHydrated, setIsHydrated] = useState(false);
  const article = getArticle(id);

  // Reading progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Audio reader simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<"1x" | "1.5x">("1x");

  // Comments state (interactive local addition)
  const [comments, setComments] = useState<Comment[]>(article?.comments || []);
  const [newAuthor, setNewAuthor] = useState("");
  const [newComment, setNewComment] = useState("");
  const [likesCount, setLikesCount] = useState(article?.likesCount || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (article) {
      setComments(article.comments || []);
      setLikesCount(article.likesCount || 0);
      addToHistory(article.id);
    }
  }, [article?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Audio timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + (audioSpeed === "1.5x" ? 3 : 2);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, audioSpeed]);

  if (!isHydrated || (!article && isLoadingArticles)) {
    return (
      <div className="max-w-2xl mx-auto py-28 px-4 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-bold text-sm">چاوەڕێبە، بابەتەکە باردەکرێت...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">بابەتەکە نەدۆزرایەوە</h1>
        <p className="text-slate-500 dark:text-slate-400">ببورە، ڕەنگە ئەم بابەتە لابرابێت یان بەستەرەکەی هەڵە بێت.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          گەڕانەوە بۆ پەڕەی سەرەکی
        </Link>
      </div>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.categorySlug === article.categorySlug)
    .slice(0, 3);
  const currentlyLiked = isLiked(article.id);

  const handleLikeClick = () => {
    const nowLiked = toggleLike(article.id);
    setLikesCount((prev) => (nowLiked ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleShare = (platform: "copy" | "whatsapp" | "telegram" | "facebook") => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const text = `${article.title} - کوردتێک KurdTech`;

    if (platform === "copy") {
      navigator.clipboard.writeText(currentUrl);
      showToast("بەستەری بابەتەکە بە سەرکەوتوویی کۆپی کرا!", "success");
    } else if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + currentUrl)}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) {
      showToast("تکایە ناو و سەرنجەکەت بنووسە", "error");
      return;
    }

    const authorText = newAuthor.trim();
    const commentText = newComment.trim();

    try {
      setIsSubmittingComment(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          author: authorText,
          content: commentText,
        }),
      });

      if (!res.ok) {
        throw new Error("سێرڤەر نەیتوانی سەرنجەکە تۆمار بکات");
      }

      const json = await res.json();
      const created: Comment = json.comment || {
        id: `c_${Date.now()}`,
        author: authorText,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        date: "ئێستا",
        content: commentText,
        likes: 0,
      };

      setComments((prev) => [created, ...prev]);
      setNewComment("");
      setNewAuthor("");
      showToast("سەرنجەکەت بە سەرکەوتوویی زیاد کرا و تۆمارکرا!", "success");
    } catch (err: any) {
      showToast(err?.message || "هەڵەیەک ڕوویدا لە تۆمارکردنی سەرنج", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const contentFontSizeClass =
    fontSize === "xlarge"
      ? "text-lg sm:text-2xl leading-loose"
      : fontSize === "large"
      ? "text-base sm:text-xl leading-loose"
      : "text-base sm:text-lg leading-loose";

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
        {/* Top Controls Bar: Breadcrumbs & Accessibility Font Size */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              سەرەتا
            </Link>
            <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
            <Link
              href={`/category/${article.categorySlug}`}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              {article.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
            <span className="truncate max-w-xs sm:max-w-md">{article.title}</span>
          </nav>

          {/* Font Size Scaler Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white dark:bg-[#111827] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <span className="text-[11px] text-slate-400 font-bold px-2 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" /> فۆنت:
            </span>
            <button
              onClick={() => setFontSize("normal")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                fontSize === "normal"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              ئاسایی
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                fontSize === "large"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              مامناوەند
            </button>
            <button
              onClick={() => setFontSize("xlarge")}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                fontSize === "xlarge"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              گەورە
            </button>
          </div>
        </div>

        {/* 2-Column Article Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/category/${article.categorySlug}`}
                  className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  {article.category}
                </Link>

                {article.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-snug">
                {article.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {article.excerpt}
              </p>

              {/* Author & Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 pb-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {article.author.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{article.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {article.publishedAt}
                  </span>
                  <span>•</span>
                  <span>کاتی خوێندنەوە: {article.readTime}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {article.views}
                  </span>
                </div>
              </div>
            </div>

            {/* Kurdish AI Voice Audio Player Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      گوێگرتن لە خوێندنەوەی دەنگیی بابەتەکە
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      پەخشی دەنگی بە کوردی لە ڕێگەی زیرەکی دەستکرد
                    </p>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isPlayingAudio && (
                    <div className="flex items-center gap-1 h-5 px-2" title="دەنگی زیرەکی دەستکرد لە کاردایە">
                      <span className="w-1 bg-purple-400 rounded-full animate-wave-1"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-wave-2"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-wave-3"></span>
                      <span className="w-1 bg-purple-400 rounded-full animate-wave-4"></span>
                    </div>
                  )}

                  <button
                    onClick={() => setAudioSpeed(audioSpeed === "1x" ? "1.5x" : "1x")}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white"
                  >
                    خێرایی: {audioSpeed}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlayingAudio(!isPlayingAudio);
                      if (!isPlayingAudio && audioProgress === 0) {
                        showToast("پەخشی دەنگی دەستی پێکرد", "info");
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>ڕاگرتن</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                        <span>لێدان</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400" dir="ltr">
                  <span>{Math.round((audioProgress / 100) * 150)}s</span>
                  <span>2:30m</span>
                </div>
              </div>
            </div>

            {/* Main Featured Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800">
              <img
                src={getSafeImageUrl(article.imageUrl, article.categorySlug, `${article.title} ${article.id}`)}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = getCategoryFallbackImage(article.categorySlug, `${article.title} ${article.id}`);
                }}
                alt={article.title}
                className="w-full h-80 sm:h-[450px] object-cover"
              />
              {article.reviewScore && (
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-400 px-4 py-2 rounded-2xl font-black text-lg flex items-center gap-1.5 shadow-xl">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span>{article.reviewScore}</span>
                  <span className="text-xs text-slate-400 font-normal">/ ١٠</span>
                </div>
              )}
            </div>

            {/* Quick Actions Bar (Like, Bookmark, Social Share) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLikeClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentlyLiked
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentlyLiked ? "fill-white" : ""}`} />
                  <span>بەسوود بوو ({likesCount})</span>
                </button>

                <button
                  onClick={() => toggleBookmark(article.id, article.title)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    isBookmarked(article.id)
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                  }`}
                  title="پاشەکەوتکردن بۆ دواتر"
                >
                  {isBookmarked(article.id) ? (
                    <BookmarkCheck className="w-4 h-4 fill-white" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">هاوبەشکردن:</span>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  واتسئاپ
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors"
                >
                  تێلێگرام
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>کۆپیکردن</span>
                </button>
              </div>
            </div>

            {/* Factual Highlights Box */}
            {article.extractedMetrics && article.extractedMetrics.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/5 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-500/30 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    وردەکاری و خاڵە کلیلە ئاشکراکراوەکانی بابەتەکە
                  </h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  {article.extractedMetrics.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <span className="text-purple-600 dark:text-purple-400 font-black text-base shrink-0 leading-none mt-0.5">•</span>
                      <span>{bullet.replace(/^🔹\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Content Paragraphs with Dynamic Font Scaler */}
            <div className={`space-y-6 text-slate-800 dark:text-slate-200 transition-all ${contentFontSizeClass}`}>
              {article.content.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Zoomit Review Box (Score + Pros + Cons) */}
            {article.reviewScore && (
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-[#111827] dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      ئەنجامی هەڵسەنگاندنی کوردتێک
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      بەپێی تاقیکردنەوەی چڕی تیمی پسپۆڕانی تەکنیکی لە بازاڕی کوردستان
                    </p>
                  </div>

                  <div className="bg-purple-600 text-white px-5 py-3 rounded-2xl font-black text-2xl flex items-center gap-2 shadow-lg shadow-purple-600/30 w-fit">
                    <Star className="w-6 h-6 fill-white" />
                    <span>{article.reviewScore}</span>
                    <span className="text-sm font-normal text-purple-200">/ ١٠</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {article.pros && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> خاڵە بەهێزەکان
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {article.pros.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {article.cons && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-rose-500 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> خاڵە لاوازەکان
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {article.cons.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hardware Specs Table if Available */}
            {article.specs && (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  تایبەتمەندییە تەکنیکییەکان (Specifications)
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                  {Object.entries(article.specs).map(([key, val]) => (
                    <div key={key} className="py-2.5 flex items-center justify-between gap-4">
                      <span className="font-bold text-slate-500 dark:text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-left" dir="ltr">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author Profile Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-500/20"
              />
              <div className="space-y-1.5 flex-1">
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  نووسەر: {article.author.name}
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">{article.author.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {article.author.bio || "ئەندامی دەستەی نووسەران و شیکارە تەکنیکییەکانی کوردتێک لە هەرێمی کوردستان."}
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  سەرنج و لێدوانەکان ({comments.length})
                </h3>
              </div>

              {/* Add Comment Form */}
              <form
                onSubmit={handleAddComment}
                className="bg-white dark:bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ڕای خۆت لەسەر ئەم بابەتە دەرببڕە
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="ناوت یان ناسناوت..."
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="سەرنج و تێبینییەکانت لەم بەشە بنووسە..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all"
                >
                  <Send className="w-4 h-4 -scale-x-100" />
                  <span>{isSubmittingComment ? "تۆمار دەکرێت..." : "ناردنی سەرنج"}</span>
                </button>
              </form>

              {/* Existing Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    هێشتا هیچ سەرنجێک تۆمار نەکراوە. ببە یەکەم کەس کە سەرنج دەنووسێت!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.avatar}
                            alt={c.author}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {c.author}
                          </span>
                        </div>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-9">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Kurdistan Market Prices Quick Widget */}
            <MarketPricesWidget />

            {/* Related Articles in Same Category */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                بابەتە پەیوەندیدارەکان
              </h3>

              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/articles/${rel.id}`}
                    className="group flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <img
                      src={getSafeImageUrl(rel.imageUrl, rel.categorySlug, `${rel.title} ${rel.id}`)}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallbackImage(rel.categorySlug, `${rel.title} ${rel.id}`);
                      }}
                      alt={rel.title}
                      className="w-20 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        {rel.category}
                      </span>
                      <h4 className="font-bold text-xs leading-snug line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{rel.publishedAt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
