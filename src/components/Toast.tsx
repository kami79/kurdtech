"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";

export default function Toast() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            toast.type === "success"
              ? "bg-slate-900/95 dark:bg-[#0f172a]/95 text-emerald-400 border-emerald-500/30"
              : toast.type === "error"
              ? "bg-slate-900/95 dark:bg-[#0f172a]/95 text-rose-400 border-rose-500/30"
              : "bg-slate-900/95 dark:bg-[#0f172a]/95 text-sky-400 border-sky-500/30"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          {toast.type === "info" && <Info className="w-4 h-4 shrink-0 text-sky-400" />}
          <span className="leading-snug text-white">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
