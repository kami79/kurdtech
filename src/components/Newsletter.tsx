"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Newsletter() {
  const { showToast } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("تکایە ئیمەیڵێکی دروست بنووسە", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      showToast("بە سەرکەوتوویی لە هەواڵنامەی کوردتێک تۆمار کرایت!", "success");
    }, 600);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-10 border border-purple-500/30 text-white shadow-2xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Mail className="w-6 h-6" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black">
          هەفتانە گرنگترین هەواڵەکانی تەکنەلۆژیا لە ئیمەیڵەکەت وەربگرە
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
          تەنهـا هەواڵە گرنگەکان، پێداچوونەوەی ڕەقەواڵە و نوێترین نرخی ئامێرەکان لە بازاڕی کوردستان بۆتان دەنێرین بە بێ هیچ سپامێک.
        </p>

        {subscribed ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 text-sm font-bold animate-in zoom-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>سوپاس بۆ بەشداریکردنت! هەفتانە لە پەیوەندیدا دەبین.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ئیمەیڵی خۆت لێرە بنووسە..."
              className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs sm:text-sm outline-none focus:border-purple-500 transition-colors"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <span>چاوەڕوانبە...</span>
              ) : (
                <>
                  <span>بەشداربە</span>
                  <Send className="w-4 h-4 -scale-x-100" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
