"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  Search,
  Filter,
  Send,
  X,
  HelpCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { COMMUNITY_QUESTIONS } from "@/data/community";
import { useApp } from "@/context/AppContext";
import { CommunityQuestion, CommunityReply } from "@/types";

export default function CommunityPage() {
  const { showToast } = useApp();

  const [questions, setQuestions] = useState<CommunityQuestion[]>(COMMUNITY_QUESTIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterSolved, setFilterSolved] = useState<"all" | "solved" | "unsolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQId, setExpandedQId] = useState<string | null>("q1");

  // Upvoted questions tracking
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

  // New Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCity, setNewCity] = useState("هەولێر");
  const [newCategory, setNewCategory] = useState<CommunityQuestion["category"]>("mobile");

  // New Reply State
  const [replyText, setReplyText] = useState("");

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCat = selectedCategory === "all" || q.category === selectedCategory;
      const matchSolved =
        filterSolved === "all" ||
        (filterSolved === "solved" && q.isSolved) ||
        (filterSolved === "unsolved" && !q.isSolved);
      const matchQuery =
        !searchQuery.trim() ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSolved && matchQuery;
    });
  }, [questions, selectedCategory, filterSolved, searchQuery]);

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds.includes(id)) {
      setUpvotedIds((prev) => prev.filter((i) => i !== id));
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes - 1 } : q))
      );
      showToast("دەنگەکەت لابرا", "info");
    } else {
      setUpvotedIds((prev) => [...prev, id]);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
      );
      showToast("دەنگت بە سەرکەوتوویی تۆمارکرا!", "success");
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetails.trim() || !newAuthor.trim()) {
      showToast("تکایە هەموو خانەکان پڕبکەرەوە", "error");
      return;
    }

    const created: CommunityQuestion = {
      id: `q_${Date.now()}`,
      title: newTitle.trim(),
      details: newDetails.trim(),
      author: newAuthor.trim(),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      city: newCity,
      date: "ئێستا",
      category: newCategory,
      tags: ["پرسیار", newCity],
      isSolved: false,
      views: 1,
      upvotes: 1,
      repliesCount: 0,
      replies: [],
    };

    setQuestions([created, ...questions]);
    setIsModalOpen(false);
    setNewTitle("");
    setNewDetails("");
    setNewAuthor("");
    setExpandedQId(created.id);
    showToast("پرسیارەکەت بڵاوکرایەوە! تیمی کۆمەڵگە وەڵامت دەدەنەوە.", "success");
  };

  const handleAddReply = (questionId: string) => {
    if (!replyText.trim()) {
      showToast("تکایە وەڵامەکەت بنووسە", "error");
      return;
    }

    const newReply: CommunityReply = {
      id: `r_${Date.now()}`,
      author: "بەکارهێنەری کوردتێک",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      content: replyText.trim(),
      date: "کەمێک لەمەوبەر",
      upvotes: 1,
    };

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            repliesCount: q.repliesCount + 1,
            replies: [...q.replies, newReply],
          };
        }
        return q;
      })
    );

    setReplyText("");
    showToast("وەڵامەکەت زیاد کرا!", "success");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-10 border border-indigo-500/30 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
              <MessageSquare className="w-4 h-4" />
              <span>کۆمەڵگەی پرسیار و وەڵامی تەکنیکی کوردستان</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black">
              کێشەیەکی تەکنیکیت هەیە؟ لێرە بپرسە و وەڵام وەربگرە
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              هەزاران ئەندازیار و پسپۆڕی تەکنەلۆژیا لە هەولێر، سلێمانی و دهۆک لەم پلاتفۆرمەدا چارەسەری کێشەکانی ئینتەرنێت، مۆبایل، کۆمپیوتەر و فینتێک دەخەنە ڕوو.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>پرسیارێکی نوێ بنووسە</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: "all", label: "هەموو پرسەکان" },
            { id: "mobile", label: "مۆبایل و ئەپەکان" },
            { id: "internet", label: "ئینتەرنێت و فایبەر" },
            { id: "gaming", label: "گەیمینگ و پینگ" },
            { id: "pc", label: "کۆمپیوتەر و ڕەقەواڵە" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all ${
                selectedCategory === c.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status and Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterSolved("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filterSolved === "all" ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm" : "text-slate-400"
              }`}
            >
              هەمووی
            </button>
            <button
              onClick={() => setFilterSolved("solved")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filterSolved === "solved" ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm" : "text-slate-400"
              }`}
            >
              چارەسەرکراو
            </button>
          </div>

          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان لە پرسیارەکان..."
              className="w-full pr-9 pl-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
            <p className="font-bold text-slate-400 text-sm">هیچ پرسیارێک بەم پێوەرانە نەدۆزرایەوە.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setFilterSolved("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              پاککردنەوەی فلتەرەکان
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQId === q.id;
            const hasUpvoted = upvotedIds.includes(q.id);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Question Header */}
                <div
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={q.avatar}
                      alt={q.author}
                      className="w-10 h-10 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
                    />

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {q.isSolved ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            چارەسەرکراوە
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                            لە چاوەڕوانی وەڵامە
                          </span>
                        )}

                        {q.city && (
                          <span className="text-slate-400 flex items-center gap-1 font-semibold">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            {q.city}
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{q.date}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                        {q.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {q.details}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                        {q.tags.map((t, i) => (
                          <span key={i} className="hover:text-purple-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Upvote & Reply Stats */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleUpvote(q.id, e)}
                      className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl border text-xs font-black transition-all ${
                        hasUpvoted
                          ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-500"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4 mb-0.5" />
                      <span>{q.upvotes}</span>
                    </button>

                    <div className="p-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Replies & Answer Form */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      وەڵام و چارەسەرەکان ({q.replies.length})
                    </h4>

                    {/* Replies List */}
                    <div className="space-y-3">
                      {q.replies.map((rep) => (
                        <div
                          key={rep.id}
                          className={`p-4 rounded-2xl border space-y-2 ${
                            rep.isSolution
                              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                              : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img
                                src={rep.avatar}
                                alt={rep.author}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="font-bold text-slate-900 dark:text-white">
                                {rep.author}
                              </span>
                              {rep.isSolution && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  چارەسەری پەسەندکراو
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[11px]">{rep.date}</span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-8">
                            {rep.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Add Reply Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="شارەزایت لەم کێشەیەدا هەیە؟ وەڵامەکەت بنووسە..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddReply(q.id)}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 -scale-x-100" />
                        <span>ناردنی وەڵام</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Question Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-500" />
                پرسیارێکی نوێ بنووسە
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">سەردێڕی کورت و ڕوون:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="بۆ نموونە: کێشەی نەبوونی تۆڕی 5G لە شەقامی سەد مەتری هەولێر"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ناوت یان ناسناوت:</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="ناوت بنووسە..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">شارەکەت:</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500"
                  >
                    <option value="هەولێر">هەولێر</option>
                    <option value="سلێمانی">سلێمانی</option>
                    <option value="دهۆک">دهۆک</option>
                    <option value="کەرکووک">کەرکووک</option>
                    <option value="هەڵەبجە">هەڵەبجە</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">بەش:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500"
                >
                  <option value="mobile">مۆبایل و ئەپڵیکەیشن</option>
                  <option value="internet">ئینتەرنێت و فایبەر ئۆپتیک</option>
                  <option value="gaming">گەیمینگ و کۆنسۆڵ</option>
                  <option value="pc">کۆمپیوتەر و ڕەقەواڵە</option>
                  <option value="general">گشتی</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ڕوونکردنەوەی تەواوی کێشەکە:</label>
                <textarea
                  rows={4}
                  required
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="هەموو وردەکارییەکان بنووسە تا پسپۆڕان بە دروستی وەڵامت بدەنەوە..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Send className="w-4 h-4 -scale-x-100" />
                <span>بڵاوکردنەوەی پرسیار لە کۆمەڵگە</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
