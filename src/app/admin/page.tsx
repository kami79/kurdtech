"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Smartphone,
  TrendingUp,
  Users,
  CheckCircle2,
  Trash2,
  Eye,
  Star,
  Settings,
  ChevronRight,
  Send,
  Layers,
  Edit3,
  Search,
  Download,
  Upload,
  Sparkles,
  Zap,
  Flame,
  X,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Bot,
  Radio,
  ExternalLink,
  ArrowUpRight,
  Sliders,
  Globe,
  Clock,
  ShieldCheck,
  BarChart3,
  Activity,
  Heart,
  MessageSquare,
  Instagram,
  Share2,
} from "lucide-react";
import { CATEGORIES, KURDISTAN_MARKET_PRICES } from "@/data/articles";
import { TECH_NEWS_SOURCES } from "@/lib/agent/sources";
import { useApp } from "@/context/AppContext";
import { Article } from "@/types";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import SocialPublisherModal from "@/components/SocialPublisherModal";
import { loadSocialCredentials } from "@/lib/socialPublisher";

// Unsplash cover presets for instant 1-click selection
const IMAGE_PRESETS = [
  {
    name: "زیرەکی دەستکرد (AI)",
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "ئەپڵ و ئایفۆن (Apple)",
    url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "سامسۆنگ و گالاکسی (Samsung)",
    url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "گەیمینگ و کۆنسۆڵ (Gaming)",
    url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "چیپسێت و پڕۆسێسەر (Hardware)",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "تەکنەلۆژیا لە کوردستان (Tech Hub)",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
    preview:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&auto=format&fit=crop&q=80",
  },
];

const SUGGESTED_TAGS = [
  "Apple",
  "Samsung",
  "AI",
  "Nvidia",
  "iOS",
  "Android",
  "کوردستان",
  "مۆبایل",
  "گەیمینگ",
  "فایبەر ئۆپتیک",
  "نرخی بازاڕ",
];

export default function AdminStudioPage() {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    showToast,
    exchangeRate,
    setExchangeRate,
    refreshArticles,
    importArticles,
    isAdmin,
    loginAdmin,
    logoutAdmin,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "articles" | "create" | "agent" | "social" | "analytics" | "backup"
  >("articles");
  const [socialStudioArticle, setSocialStudioArticle] =
    useState<Article | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [publishToSocial, setPublishToSocial] = useState(true);
  const [editorMode, setEditorMode] = useState<"quick" | "full">("quick");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & Filter state for articles list
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");
  const [filterBreakingOnly, setFilterBreakingOnly] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categorySlug, setCategorySlug] = useState("ai");
  const [authorName, setAuthorName] = useState("ئارام کامەران");
  const [authorRole, setAuthorRole] = useState("سەرنووسەری بەشی ڕەقەواڵە");
  const [imageUrl, setImageUrl] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [featuredPosition, setFeaturedPosition] = useState<
    "none" | "main" | "top-left" | "bottom-right" | "bottom-left"
  >("none");
  const [reviewScore, setReviewScore] = useState("");
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");
  const [tagsText, setTagsText] = useState("تەکنەلۆژیا, هەواڵ");

  // JSON Import state
  const [importJsonText, setImportJsonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Tech News Agent State
  const [agentDrafts, setAgentDrafts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isAgentPublishing, setIsAgentPublishing] = useState(false);
  const [lastScannedTime, setLastScannedTime] = useState<string | null>(null);
  const [autoCurateCount, setAutoCurateCount] = useState<number>(3);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentOffset, setAgentOffset] = useState<number>(0);
  const [agentTotalAvailable, setAgentTotalAvailable] = useState<number>(0);
  const [agentSourceFilter, setAgentSourceFilter] = useState<string>("all");
  const [agentNewOnly, setAgentNewOnly] = useState<boolean>(false);

  // Load saved Gemini Key from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("kurdtech_gemini_key");
      if (savedKey) setGeminiApiKey(savedKey);
    } catch {}
  }, []);

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    try {
      localStorage.setItem("kurdtech_gemini_key", key);
      showToast(
        key ? "کلیلی Gemini پاشەکەوت کرا" : "کلیلی Gemini لابرا",
        "info"
      );
    } catch {}
  };

  // Filtered articles in Admin list
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCatFilter === "all" || art.categorySlug === selectedCatFilter;
      const matchBreaking = !filterBreakingOnly || art.isBreaking === true;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));
      return matchCat && matchBreaking && matchQuery;
    });
  }, [articles, selectedCatFilter, filterBreakingOnly, searchQuery]);

  // Start Editing an existing article
  const handleStartEdit = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(
      Array.isArray(art.content) ? art.content.join("\n\n") : art.excerpt
    );
    setCategorySlug(art.categorySlug || "ai");
    setAuthorName(art.author?.name || "ئارام کامەران");
    setAuthorRole(art.author?.role || "نووسەری تیمی تەکنیکی");
    setImageUrl(art.imageUrl || IMAGE_PRESETS[0].url);
    setIsBreaking(!!art.isBreaking);
    setIsEditorPick(!!art.isEditorPick);
    setFeaturedPosition(art.featuredPosition || "none");
    setReviewScore(art.reviewScore ? art.reviewScore.toString() : "");
    setProsText(art.pros ? art.pros.join("\n") : "");
    setConsText(art.cons ? art.cons.join("\n") : "");
    setTagsText(art.tags ? art.tags.join(", ") : "");

    if (art.reviewScore || (art.pros && art.pros.length > 0)) {
      setEditorMode("full");
    } else {
      setEditorMode("quick");
    }

    setActiveTab("create");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
    setActiveTab("articles");
  };

  // Reset Form
  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategorySlug("ai");
    setImageUrl("");
    setIsBreaking(false);
    setIsEditorPick(false);
    setFeaturedPosition("none");
    setReviewScore("");
    setProsText("");
    setConsText("");
    setTagsText("تەکنەلۆژیا, هەواڵ");
    setEditingId(null);
  };

  // Load Kurdish Sample Template
  const handleLoadSample = () => {
    setTitle(
      "ئاشکراکردنی نەوەی نوێی پرۆسێسەرەکانی M5 لەلایەن ئەپڵەوە بۆ ساڵی ٢٠٢٦"
    );
    setExcerpt(
      "ئەپڵ تەلارسازی نوێی نانۆمەتری و کارامەیی بێوێنە بۆ مۆدێلە زمانییە ناوخۆییەکانی سەر مەکبۆک ئاشکرا دەکات."
    );
    setContent(
      "کۆمپانیای ئەپڵ بە فەرمی زنجیرە چیپسێتی نوێی M5ی ناساند کە بە تەکنەلۆژیای ٢ نانۆمەتری TSMC دروستکراوە.\n\nبەپێی تاقیکردنەوە سەرەتاییەکانی تاقیگەی کوردتێک لە کوردستان، خێرایی مۆدێلە ناوخۆییەکانی زیرەکی دەستکرد بە شێوەیەکی سەرسوڕهێنەر بە ڕێژەی ٤٥٪ زیادی کردووە لە کاتێکدا کێشانی وزە کەمتر بووەتەوە.\n\nئەم ئامێرانە بڕیارە لە سەرەتای وەرزی داهاتوودا بگەنە بازاڕەکانی هەولێر و سلێمانی."
    );
    setCategorySlug("hardware");
    setImageUrl(IMAGE_PRESETS[4].url);
    setIsBreaking(true);
    setTagsText("Apple, M5, Silicon, ڕەقەواڵە, هەواڵ");
    setReviewScore("9.5");
    setProsText(
      "خێرایی بێهاوتا لە ڕاهێنانی مۆدێلەکانی AI\nکەمی کێشانی وزە و ساردی لە کارکردندا"
    );
    setConsText("نرخی بەرز لە سەرەتای هاتنە ناو بازاڕی کوردستان");
    showToast("نموونەی ئامادەکراو بارکرا!", "info");
  };

  // Trigger Social Media Auto-Publish & Studio Modal after Portal Publish
  const handleTriggerSocialOnPortalPublish = async (
    publishedArticle: Article
  ) => {
    setSocialStudioArticle(publishedArticle);
    if (!publishToSocial) return;

    const creds = loadSocialCredentials();
    if (creds.autoOpenStudioOnPublish) {
      setIsSocialModalOpen(true);
    }

    const hasAnyConnectedApi =
      (creds.enabledPlatforms.instagram &&
        creds.instagramAccountId &&
        creds.instagramAccessToken) ||
      (creds.enabledPlatforms.telegram &&
        creds.telegramBotToken &&
        creds.telegramChatId) ||
      (creds.enabledPlatforms.facebook &&
        creds.facebookPageId &&
        creds.facebookPageAccessToken) ||
      (creds.enabledPlatforms.webhook && creds.webhookUrl);

    if (creds.autoPostOnPortalPublish && hasAnyConnectedApi) {
      try {
        const res = await fetch("/api/social", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": localStorage.getItem("kurdtech_admin_token") || "",
          },
          body: JSON.stringify({
            article: publishedArticle,
            credentials: creds,
          }),
        });
        const data = await res.json();
        if (Array.isArray(data.results)) {
          const okCount = data.results.filter((r: any) => r.success).length;
          if (okCount > 0) {
            showToast(
              `هەواڵەکە هاوکات لە ${okCount} پلاتفۆرمی سۆشیاڵ میدیاش بڵاوکرایەوە!`,
              "success"
            );
          }
        }
      } catch (e) {
        console.warn("Background social auto-post warning:", e);
      }
    }
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) {
      showToast("تکایە سەردێڕ و پوختەی بابەت بنووسە", "error");
      return;
    }

    setIsSubmitting(true);
    const matchedCategory = CATEGORIES.find((c) => c.slug === categorySlug);

    const articleData: Partial<Article> = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim()
        ? content.split("\n\n").filter(Boolean)
        : [excerpt.trim()],
      category: matchedCategory ? matchedCategory.name : "هەواڵ",
      categorySlug,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      author: {
        name: authorName,
        role: authorRole,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      imageUrl:
        imageUrl.trim() ||
        getCategoryFallbackImage(categorySlug, `${title.trim()} ${Date.now()}`),
      isBreaking,
      isEditorPick,
      featuredPosition:
        featuredPosition !== "none" ? featuredPosition : undefined,
      reviewScore: reviewScore ? parseFloat(reviewScore) : undefined,
      pros: prosText ? prosText.split("\n").filter(Boolean) : [],
      cons: consText ? consText.split("\n").filter(Boolean) : [],
      publishedAt: editingId ? undefined : "ئێستا",
    };

    if (editingId) {
      const updated = await updateArticle(editingId, articleData);
      setIsSubmitting(false);
      if (updated) {
        resetForm();
        setActiveTab("articles");
        if (publishToSocial) {
          handleTriggerSocialOnPortalPublish(updated);
        }
      }
    } else {
      const created = await addArticle(articleData);
      setIsSubmitting(false);
      if (created) {
        resetForm();
        setActiveTab("articles");
        handleTriggerSocialOnPortalPublish(created);
      }
    }
  };

  // Delete article confirmation
  const handleDelete = async (id: string, artTitle: string) => {
    if (confirm(`دڵنیایت لە سڕینەوەی ئەم بابەتە؟\n«${artTitle}»`)) {
      await deleteArticle(id);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(articles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `kurdtech-articles-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("فایلی JSON بە سەرکەوتوویی هەناردە کرا!", "success");
  };

  // Import JSON
  const handleImportJson = async () => {
    if (!importJsonText.trim()) {
      showToast("تکایە دەقی JSON بنووسە یان بیلکێنە", "error");
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        showToast("فایلی JSON دەبێت لیستی بابەتەکان بێت (Array)", "error");
        return;
      }
      setIsSubmitting(true);
      await importArticles(parsed);
      setIsSubmitting(false);
      setImportJsonText("");
      setActiveTab("articles");
    } catch {
      showToast("فۆرماتی JSON هەڵەیە! تکایە پێداچوونەوە بکە", "error");
      setIsSubmitting(false);
    }
  };

  // AI Agent: Scan feeds with rotation and new-updates detection
  const handleScanAgentFeeds = async (
    nextBatch: boolean = false,
    customSource?: string,
    customNewOnly?: boolean
  ) => {
    setIsScanning(true);
    try {
      const targetOffset = nextBatch ? agentOffset : 0;
      const activeSource =
        customSource !== undefined ? customSource : agentSourceFilter;
      const activeNewOnly =
        customNewOnly !== undefined ? customNewOnly : agentNewOnly;

      const queryParam = geminiApiKey
        ? `&apiKey=${encodeURIComponent(geminiApiKey)}`
        : "";
      const sourceParam =
        activeSource !== "all"
          ? `&source=${encodeURIComponent(activeSource)}`
          : "";
      const newOnlyParam = activeNewOnly ? "&newOnly=true" : "";

      const res = await fetch(
        `/api/agent?limit=8&offset=${targetOffset}&t=${Date.now()}${queryParam}${sourceParam}${newOnlyParam}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      if (!res.ok) throw new Error("سێرڤەر نەیتوانی هەواڵەکان بهێنێت");

      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.drafts)) {
        setAgentDrafts(data.drafts);
        setAgentTotalAvailable(data.totalAvailable || data.drafts.length);
        setAgentOffset(data.nextOffset || 0);
        setLastScannedTime(new Date().toLocaleTimeString("ckb-IQ"));
        showToast(
          nextBatch
            ? `کۆمەڵە هەواڵی تری نوێ وەرگیران (لە کۆی ${
                data.totalAvailable || data.drafts.length
              } بابەت)!`
            : `${data.drafts.length} نوێترین هەواڵی دەستنیشانکراو ئامادەکران!`,
          "success"
        );
      }
    } catch (err: any) {
      showToast(err.message || "هەڵە لە پشکنینی سەرچاوەکان", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // AI Agent: Publish single curated draft
  const handlePublishAgentDraft = async (item: any) => {
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("kurdtech_admin_token") || "",
        },
        body: JSON.stringify({
          action: "publish-single",
          rawItem: item.raw,
          draft: item.draft,
          overrides: {
            title: item.draft.title,
            excerpt: item.draft.excerpt,
            content: item.draft.content,
            isBreaking: item.draft.isBreaking,
          },
          apiKey: geminiApiKey || undefined,
        }),
      });

      if (!res.ok) throw new Error("نەتوانرا بابەتەکە بڵاوبکرێتەوە");

      const data = await res.json();
      if (data.status === "success") {
        await refreshArticles();
        setAgentDrafts((prev) => prev.filter((d) => d.raw.id !== item.raw.id));
        showToast("هەواڵەکە بە کوردی لە پۆڕتاڵەکەدا بڵاوکرایەوە!", "success");
        if (data.article) {
          handleTriggerSocialOnPortalPublish(data.article);
        }
      }
    } catch (err: any) {
      showToast(err.message || "هەڵە لە بڵاوکردنەوەی هەواڵ", "error");
    }
  };

  // AI Agent: Edit Draft in Form before publishing
  const handleEditDraftBeforePublish = (item: any) => {
    setTitle(item.draft.title);
    setExcerpt(item.draft.excerpt);
    setContent(
      Array.isArray(item.draft.content)
        ? item.draft.content.join("\n\n")
        : item.draft.excerpt
    );
    setCategorySlug(item.draft.categorySlug || "ai");
    setAuthorName("ئەیجێنتی هۆشمەندی کوردتێک");
    setAuthorRole(`شیکەرەوەی هەواڵە جیهانییەکان (${item.raw.sourceName})`);
    setImageUrl(item.draft.imageUrl || IMAGE_PRESETS[0].url);
    setIsBreaking(!!item.draft.isBreaking);
    setTagsText(
      item.draft.tags ? item.draft.tags.join(", ") : "تەکنەلۆژیا, هەواڵ"
    );

    setEditorMode("full");
    setActiveTab("create");
    window.scrollTo({ top: 300, behavior: "smooth" });
    showToast("هەواڵەکە بۆ دەستکاریکردن ئامادەکرا!", "info");
  };

  // AI Agent: Autonomous Auto-Pilot Run
  const handleRunAutoPilot = async () => {
    setIsAgentPublishing(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("kurdtech_admin_token") || "",
        },
        body: JSON.stringify({
          action: "auto-curate-publish",
          count: autoCurateCount,
          apiKey: geminiApiKey || undefined,
        }),
      });

      if (!res.ok) throw new Error("ئەیجێنتەکە نەیتوانی پرۆسەکە تەواو بکات");

      const data = await res.json();
      if (data.status === "success") {
        await refreshArticles();
        showToast(
          `پیرۆزە! ${data.count} گرنگترین هەواڵی تەکنەلۆژیای ئەمڕۆ بە کوردی بڵاوکرانەوە.`,
          "success"
        );
        setActiveTab("articles");
        if (Array.isArray(data.published) && data.published.length > 0) {
          handleTriggerSocialOnPortalPublish(data.published[0]);
        }
      }
    } catch (err: any) {
      showToast(err.message || "هەڵە لە بڵاوکردنەوەی ئۆتۆماتیکی", "error");
    } finally {
      setIsAgentPublishing(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      {/* Breadcrumbs */}
      {!isAdmin ? (
        <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              چوونەژوورەوەی بەڕێوەبەر
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ئەم بەشە تەنها تایبەتە بە بەڕێوەبەرانی کوردتێک. تکایە وشەی نهێنی بەڕێوەبەر بنووسە بۆ کردنەوەی ستۆدیۆ و ئامارەکان.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!adminPasswordInput.trim()) return;
              setIsLoggingIn(true);
              const ok = await loginAdmin(adminPasswordInput);
              setIsLoggingIn(false);
              if (ok) setAdminPasswordInput("");
            }}
            className="space-y-4 text-right"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                وشەی نهێنی بەڕێوەبەر (Admin Password):
              </label>
              <input
                type="password"
                required
                autoFocus
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-purple-500 font-mono text-center"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? "پشکنین دەکرێت..." : "چوونەژوورەوە بۆ ستۆدیۆ"}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/"
              className="text-xs font-bold text-slate-400 hover:text-purple-600 transition-colors"
            >
              گەڕانەوە بۆ پەڕەی سەرەکی ماڵپەڕ
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-purple-600 transition-colors">
                سەرەتا
              </Link>
              <ChevronRight className="w-3.5 h-3.5 -scale-x-100" />
              <span className="text-purple-600 font-bold">
                ستۆدیۆی نووسەران و بەڕێوەبردن (Admin Studio CMS)
              </span>
            </nav>

            <button
              type="button"
              onClick={logoutAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
            >
              چوونەدەرەوە (Logout)
            </button>
          </div>

          {/* Header Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>کۆی بابەتەکان</span>
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {articles.length}
              </p>
              <span className="text-[11px] text-emerald-500 font-semibold">
                هەواڵ و شیکاری چالاک
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>هەواڵی بەپەلە (Breaking)</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {articles.filter((a) => a.isBreaking).length}
              </p>
              <span className="text-[11px] text-amber-500 font-semibold">
                لە شریتی سەرەوە نیشاندراون
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>ئەیجێنتی جیهانی</span>
                <Bot className="w-4 h-4 text-purple-600 animate-pulse" />
              </div>
              <p className="text-2xl font-black text-purple-600">٦ سەرچاوە</p>
              <span className="text-[11px] text-purple-500 font-semibold">
                The Verge, TechCrunch, Wired...
              </span>
            </div>

            <div
              onClick={() => {
                if (!socialStudioArticle && articles.length > 0) {
                  setSocialStudioArticle(articles[0]);
                }
                setActiveTab("social");
              }}
              className="p-5 rounded-3xl bg-gradient-to-br from-pink-600/15 via-purple-600/10 to-indigo-600/15 border border-pink-500/30 shadow-sm space-y-1 cursor-pointer hover:border-pink-500 transition-all"
            >
              <div className="flex items-center justify-between text-pink-600 dark:text-pink-400 text-xs font-bold">
                <span>سۆشیاڵ میدیا و ئینستاگرام</span>
                <Instagram className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                ستۆدیۆی پۆست و ستۆری
              </p>
              <span className="text-[11px] text-pink-500 font-semibold block">
                کلیک بکە بۆ ئینستاگرام، تێلیگرام و فەیسبووک ←
              </span>
            </div>
          </div>

          {/* Always-Visible Instagram & Social Media Quick-Launch Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-fuchsia-950 to-indigo-950 border border-pink-500/35 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black">
                    بڵاوکردنەوەی هەواڵ و میدیا لە ئینستاگرام و تۆڕە کۆمەڵایەتییەکان
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/40 text-pink-200 text-[10px] font-black">
                    Instagram • Telegram • Facebook • X • WhatsApp
                  </span>
                </div>
                <p className="text-xs text-purple-200/85">
                  دروستکردنی کارتی ئینستاگرام (پۆست 1:1 و ستۆری 9:16)، بارکردنی وێنە و بڵاوکردنەوەی خۆکار لە هەموو کەناڵەکانتەوە
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!socialStudioArticle && articles.length > 0) {
                    setSocialStudioArticle(articles[0]);
                  }
                  setActiveTab("social");
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>کردنەوەی ستۆدیۆی ئینستاگرام و سۆشیاڵ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!socialStudioArticle && articles.length > 0) {
                    setSocialStudioArticle(articles[0]);
                  }
                  setIsSocialModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-pink-300" />
                <span>پۆستی خێرا بۆ دوایین هەواڵ</span>
              </button>
            </div>
          </div>

          {/* Tabs Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab("articles")}
                className={`px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                  activeTab === "articles"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                بەڕێوەبردنی بابەتەکان ({articles.length})
              </button>

              <button
                onClick={() => {
                  if (!editingId) resetForm();
                  setActiveTab("create");
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "create"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {editingId ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>دەستکاری بابەتەکە</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>نووسینی بابەتی نوێ</span>
                  </>
                )}
              </button>

              {/* AI Tech News Agent Tab */}
              <button
                onClick={() => {
                  setActiveTab("agent");
                  if (agentDrafts.length === 0) {
                    handleScanAgentFeeds();
                  }
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "agent"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-500/50"
                    : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>ئەیجێنتی هۆشمەند (AI Agent)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  نوێ
                </span>
              </button>

              {/* Social Media & Instagram Studio Tab */}
              <button
                onClick={() => {
                  if (!socialStudioArticle && articles.length > 0) {
                    setSocialStudioArticle(articles[0]);
                  }
                  setActiveTab("social");
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "social"
                    ? "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-pink-600/30 ring-2 ring-pink-500/40"
                    : "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>سۆشیاڵ میدیا و ئینستاگرام</span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "analytics"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>ئامار و شیکاری (Analytics)</span>
              </button>

              <button
                onClick={() => setActiveTab("backup")}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "backup"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>هەناردە و هاوردە (JSON)</span>
              </button>
            </div>

            <button
              onClick={() => refreshArticles()}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1 transition-colors self-end sm:self-auto"
              title="نوێکردنەوە لە سێرڤەرەوە"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>نوێکردنەوەی داتا</span>
            </button>
          </div>

          {/* Tab: AI TECH NEWS AGENT */}
          {activeTab === "agent" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Agent Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 sm:p-8 border border-purple-500/30 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>KurdTech Autonomous Tech News Curator 2.0</span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black">
                      ئەیجێنتی ژیری دەستکرد بۆ هەواڵە تەکنەلۆژییە جیهانییەکان
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      ئەم ئەیجێنتە بەردەوام بە بەناوبانگترین سەرچاوەکانی تەکنەلۆژیای جیهانەوە بەستراوەتەوە. بەپێی ڕۆژ گرنگترین ڕووداوەکان دیاری دەکات، وەریدەگێڕێتە سەر زمانی کوردیی شیرین و لە پۆڕتاڵەکەدا بڵاوی دەکاتەوە.
                    </p>

                    {/* Auto Social Publish Toggle in Agent Banner */}
                    <label className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-pink-500/15 border border-pink-400/30 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={publishToSocial}
                        onChange={(e) => setPublishToSocial(e.target.checked)}
                        className="w-4 h-4 rounded text-pink-500"
                      />
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <span className="font-bold text-pink-100">
                        لەگەڵ بڵاوکردنەوە لە پۆڕتاڵ، کارتی ئینستاگرام و پۆستی سۆشیاڵ میدیاش ئامادە و بڵاوبکەرەوە
                      </span>
                    </label>

                    {lastScannedTime && (
                      <p className="text-[11px] text-purple-300 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        دواین پشکنین: {lastScannedTime}
                      </p>
                    )}
                  </div>

                  {/* Quick Actions in Banner */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleScanAgentFeeds(false)}
                        disabled={isScanning}
                        className="flex-1 px-4 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                        title="پشکنینی نوێترین هەواڵەکان لە سەرچاوەکانەوە (ئۆفسێت سفر)"
                      >
                        <RefreshCw
                          className={`w-4 h-4 text-purple-600 ${
                            isScanning ? "animate-spin" : ""
                          }`}
                        />
                        <span>
                          {isScanning ? "پشکنین..." : "نوێکردنەوە بۆ هەواڵی نوێ"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleScanAgentFeeds(true)}
                        disabled={isScanning}
                        className="px-4 py-3 rounded-2xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                        title="هێنانی کۆمەڵە هەواڵی تری ناو سەرچاوە جیهانییەکان"
                      >
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>
                          کۆمەڵەی تر (
                          {agentTotalAvailable > 0
                            ? `${agentTotalAvailable}+`
                            : "٨٥+"}
                          )
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={autoCurateCount}
                        onChange={(e) =>
                          setAutoCurateCount(Number(e.target.value))
                        }
                        className="p-3 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-xs font-bold text-white outline-none"
                      >
                        <option value={3} className="bg-slate-900">
                          ٣ هەواڵ
                        </option>
                        <option value={5} className="bg-slate-900">
                          ٥ هەواڵ
                        </option>
                        <option value={8} className="bg-slate-900">
                          ٨ هەواڵ
                        </option>
                      </select>

                      <button
                        onClick={handleRunAutoPilot}
                        disabled={isAgentPublishing}
                        className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/40 transition-all disabled:opacity-60"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>
                          {isAgentPublishing
                            ? "بڵاودەکرێتەوە..."
                            : "بڵاوکردنەوەی خۆکاری ڕۆژانە"}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                      className="text-xs text-purple-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors pt-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>ڕێکخستنەکانی مۆدێلی AI و کلیلی Gemini</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Settings Drawer */}
              {showSettingsDrawer && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>
                        ڕێکخستنی مۆدێلی وەرگێڕان (AI Translation Engine)
                      </span>
                    </h3>
                    <button
                      onClick={() => setShowSettingsDrawer(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        کلیلی Google Gemini API (ئارەزوومەندانە):
                      </label>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => handleSaveGeminiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono outline-none focus:border-purple-500"
                        dir="ltr"
                      />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        ئەگەر کلیل بنووسیت، ئەیجێنتەکە مۆدێلی Gemini 1.5/2.0 بۆ وەرگێڕانی زمانی کوردی بەکاردەهێنێت. ئەگەر بە بەتاڵی جێیبهێڵیت، مۆدێلی تەکنیکی ناوخۆیی بەکار دەهێنێت کە پێویستی بە هیچ کلیلێک نییە و ڕاستەوخۆ کار دەکات.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 space-y-2">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        دۆخی کارکردنی ئێستا:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {geminiApiKey
                          ? "سیستەمەکە ئێستا مۆدێلی Google Gemini بۆ وەرگێڕانی زمانی کوردی و داڕشتنی ڕاپۆرت بەکاردێنێت."
                          : "سیستەمەکە ئێستا مۆدێلی تەکنیکی ناوخۆیی کوردتێک (Built-in Tech Engine) بەکاردێنێت، خێرا و سەربەخۆیە."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected Sources Grid */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span>
                    سەرچاوە جیهانییە پەیوەستکراوەکان ({TECH_NEWS_SOURCES.length})
                  </span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TECH_NEWS_SOURCES.map((source) => {
                    const isSelected = agentSourceFilter === source.id;
                    return (
                      <div
                        key={source.id}
                        onClick={() => {
                          const next = isSelected ? "all" : source.id;
                          setAgentSourceFilter(next);
                          handleScanAgentFeeds(false, next, agentNewOnly);
                        }}
                        className={`p-3.5 rounded-2xl border shadow-sm flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-500/30"
                            : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-purple-300"
                        }`}
                        title={`کلیک بکە بۆ فلتەرکردنی هەواڵەکانی ${source.name}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">{source.icon}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {isSelected ? "دەستنیشانکراو" : "چالاک"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">
                            {source.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {source.defaultCategory}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            {isSelected ? "سڕینەوەی فلتەر" : "فلتەرکردن"}
                          </span>
                          <ExternalLink
                            className="w-2.5 h-2.5 text-slate-400 hover:text-purple-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(source.url, "_blank");
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Curated Feed Items Stream */}
              <div className="space-y-4">
                {/* Stream Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        هەواڵە دەستنیشانکراوەکانی ئەیجێنت ({agentDrafts.length})
                      </h3>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[11px] font-black">
                        کۆی بەردەست:{" "}
                        {agentTotalAvailable > 0
                          ? `${agentTotalAvailable}+`
                          : "٨٥+"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      نوێکردنەوە لەم بەشەدا تەنها هەواڵەکانی ناو ئەیجێنت دەهێنێتەوە و کارناکاتە سەر گشت پۆڕتاڵەکە
                    </p>
                  </div>

                  {/* Controls Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const next = !agentNewOnly;
                        setAgentNewOnly(next);
                        handleScanAgentFeeds(false, agentSourceFilter, next);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        agentNewOnly
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="تەنها ئەو هەواڵانە نیشان بدە کە هێشتا لە پۆڕتاڵ بڵاونەکراونەتەوە"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تەنها بڵاونەکراوەکان</span>
                    </button>

                    <button
                      onClick={() => handleScanAgentFeeds(false)}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="نوێکردنەوەی نوێترین هەواڵەکان"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-purple-600 ${
                          isScanning ? "animate-spin" : ""
                        }`}
                      />
                      <span>نوێکردنەوە</span>
                    </button>

                    <button
                      onClick={() => handleScanAgentFeeds(true)}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="کۆمەڵە هەواڵی تری ناو سەرچاوەکان بهێنە"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      <span>کۆمەڵەی دواتر</span>
                    </button>
                  </div>
                </div>

                {isScanning ? (
                  <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                    <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      ئەیجێنتەکە خەریکی پشکنینی سەرچاوە جیهانییەکان و وەرگێڕانی کوردییە...
                    </p>
                    <p className="text-xs text-slate-400">
                      پشکنینی نوێترین هەواڵەکانی{" "}
                      {agentSourceFilter !== "all"
                        ? agentSourceFilter
                        : "هەموو سەرچاوەکان"}
                    </p>
                  </div>
                ) : agentDrafts.length === 0 ? (
                  <div className="py-16 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <Bot className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        هیچ هەواڵێک بەپێی ئەم فلتەرە نەدۆزرایەوە
                      </p>
                      <p className="text-xs text-slate-400">
                        کلیک لەسەر نوێکردنەوە بکە بۆ هێنانی هەواڵ لە سەرچاوە جیهانییەکان
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAgentSourceFilter("all");
                        setAgentNewOnly(false);
                        handleScanAgentFeeds(false, "all", false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>پشکنینی هەموو سەرچاوەکان</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agentDrafts.map((item, idx) => (
                      <div
                        key={item.raw.id || idx}
                        className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
                      >
                        <div className="space-y-3">
                          {/* Cover Media Banner */}
                          <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                            <img
                              src={getSafeImageUrl(
                                item.draft.imageUrl,
                                item.draft.categorySlug,
                                `${item.raw.title} ${idx}`
                              )}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = getCategoryFallbackImage(
                                  item.draft.categorySlug,
                                  `${item.raw.title} ${idx}`
                                );
                              }}
                              alt={item.draft.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${item.raw.badgeColor}`}
                              >
                                {item.raw.sourceName}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {item.draft.category}
                              </span>
                              {item.isAlreadyPublished ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  لە پۆڕتاڵ هەیە
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center gap-1 border border-blue-500/20">
                                  <Sparkles className="w-3 h-3 text-blue-500" />
                                  هەواڵی نوێ
                                </span>
                              )}
                              {item.draft.isBreaking && (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-[10px] flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  بەپەلە
                                </span>
                              )}
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                              گرنگی: {item.raw.importanceScore || 85}٪
                            </span>
                          </div>

                          {/* Original English Title */}
                          <p
                            className="text-[11px] text-slate-400 font-mono line-clamp-1"
                            dir="ltr"
                          >
                            {item.raw.title}
                          </p>

                          {/* Kurdish Translated Title */}
                          <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                            {item.draft.title}
                          </h4>

                          {/* Kurdish Excerpt */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                            {item.draft.excerpt}
                          </p>

                          {/* Unique Factual Highlights Box */}
                          {item.draft.extractedMetrics &&
                            item.draft.extractedMetrics.length > 0 && (
                              <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/30 space-y-1.5">
                                <span className="text-[11px] font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-purple-600" />
                                  وردەکاری و خاڵە کلیلە ئاشکراکراوەکان:
                                </span>
                                <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {item.draft.extractedMetrics.map(
                                    (bullet: string, bIdx: number) => (
                                      <li
                                        key={bIdx}
                                        className="flex items-start gap-1.5"
                                      >
                                        <span className="text-purple-500 font-bold shrink-0">
                                          •
                                        </span>
                                        <span>
                                          {bullet.replace(/^🔹\s*/, "")}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Tags */}
                          {item.draft.tags && item.draft.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {item.draft.tags.map(
                                (tag: string, tIdx: number) => (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400 font-bold"
                                  >
                                    #{tag}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* Image Thumbnail and Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {item.draft.imageUrl && (
                              <img
                                src={getSafeImageUrl(
                                  item.draft.imageUrl,
                                  item.draft.categorySlug
                                )}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    getCategoryFallbackImage(
                                      item.draft.categorySlug
                                    );
                                }}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                              />
                            )}
                            <a
                              href={item.raw.originalLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1"
                            >
                              <span>سەرچاوەی ئینگلیزی</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const tempArt: Article = {
                                  id: item.raw.id || `draft-${idx}`,
                                  title: item.draft.title,
                                  excerpt: item.draft.excerpt,
                                  content: Array.isArray(item.draft.content)
                                    ? item.draft.content
                                    : [item.draft.excerpt],
                                  category: item.draft.category || "هەواڵ",
                                  categorySlug: item.draft.categorySlug || "ai",
                                  imageUrl: getSafeImageUrl(
                                    item.draft.imageUrl,
                                    item.draft.categorySlug,
                                    item.raw.title
                                  ),
                                  publishedAt: "ئێستا",
                                  readTime: "٣ خولەک",
                                  views: "١٠٠",
                                  isBreaking: !!item.draft.isBreaking,
                                  tags: item.draft.tags || [],
                                  author: {
                                    name: "ئەیجێنتی هۆشمەندی کوردتێک",
                                    role: item.raw.sourceName,
                                    avatar:
                                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                                  },
                                };
                                setSocialStudioArticle(tempArt);
                                setIsSocialModalOpen(true);
                              }}
                              className="px-3 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-600 text-pink-600 dark:text-pink-400 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                              title="ئامادەکردنی کارتی ئینستاگرام و پۆستی سۆشیاڵ میدیا"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                              <span>سۆشیاڵ</span>
                            </button>

                            <button
                              onClick={() => handleEditDraftBeforePublish(item)}
                              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                              title="دەستکاری دەقەکە پێش بڵاوکردنەوە"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>دەستکاری</span>
                            </button>

                            <button
                              onClick={() => handlePublishAgentDraft(item)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                item.isAlreadyPublished
                                  ? "bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300"
                                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                              }`}
                              title={
                                item.isAlreadyPublished
                                  ? "ئەم بابەتە پێشتر لە پۆڕتاڵ بڵاوکراوەتەوە، کلیک بکە بۆ دووبارە بڵاوکردنەوە"
                                  : "بڵاوکردنەوەی ئەم هەواڵە لە پۆڕتاڵ و سۆشیاڵ میدیادا"
                              }
                            >
                              <Send className="w-3 h-3 -scale-x-100" />
                              <span>
                                {item.isAlreadyPublished
                                  ? "دووبارە بڵاوکردنەوە"
                                  : "بڵاوکردنەوە + سۆشیاڵ"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 1: Articles List Management */}
          {activeTab === "articles" && (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="گەڕان بەدوای بابەت، سەردێڕ یان تاگ لە نێو هەموو بابەتەکان..."
                    className="w-full pr-10 pl-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold outline-none focus:border-purple-500 text-slate-700 dark:text-slate-300"
                  >
                    <option value="all">هەموو بەشەکان</option>
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setFilterBreakingOnly(!filterBreakingOnly)}
                    className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      filterBreakingOnly
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>هەواڵی بەپەلە</span>
                  </button>
                </div>
              </div>

              {/* Articles Table / Cards */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {filteredArticles.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="font-bold text-slate-500 text-sm">
                      هیچ بابەتێک بەم فلتەرە نەدۆزرایەوە
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredArticles.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={getSafeImageUrl(art.imageUrl, art.categorySlug)}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = getCategoryFallbackImage(
                                art.categorySlug
                              );
                            }}
                            alt={art.title}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-sm"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 font-bold">
                                {art.category}
                              </span>
                              {art.isBreaking && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  بەپەلە
                                </span>
                              )}
                              {art.reviewScore && (
                                <span className="text-amber-500 font-black flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  {art.reviewScore}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              {art.title}
                            </h3>
                            <p className="text-xs text-slate-400">
                              نووسەر: {art.author?.name} • {art.publishedAt} •{" "}
                              {art.views}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons: Social Media, Edit, View, Delete */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setSocialStudioArticle(art);
                              setIsSocialModalOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-600 dark:text-pink-400 hover:from-pink-600 hover:to-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-pink-500/20"
                            title="بڵاوکردنەوەی ئەم بابەتە لە ئینستاگرام و تۆڕە کۆمەڵایەتییەکان"
                          >
                            <Instagram className="w-3.5 h-3.5" />
                            <span>سۆشیاڵ میدیا</span>
                          </button>

                          <button
                            onClick={() => handleStartEdit(art)}
                            className="px-3 py-2 rounded-xl bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                            title="دەستکاری کردنی ئەم بابەتە"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>دەستکاری</span>
                          </button>

                          <Link
                            href={`/articles/${art.id}`}
                            target="_blank"
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="بینینی بابەت لە ماڵپەڕەکە"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                            title="سڕینەوە"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Create / Edit Article Form */}
          {activeTab === "create" && (
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
            >
              {/* Header Banner with Edit Notice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-7 rounded-full bg-purple-600"></span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {editingId
                        ? "دەستکاری کردنی بابەتەکە"
                        : "داڕشتن و بڵاوکردنەوەی بابەتی نوێ"}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {editingId
                      ? "دەستکاری زانیارییەکان بکە و کلیک لە نوێکردنەوە بکە تا لە هەموو ماڵپەڕەکەدا بگۆڕێت."
                      : "زانیارییەکان پڕبکەرەوە؛ بابەتەکە ڕاستەوخۆ دەچێتە بەردەست بەکارهێنەران و سۆشیاڵ میدیا."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!editingId && (
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>بارکردنی نموونەی ئامادە</span>
                    </button>
                  )}

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>هەڵوەشاندنەوە</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mode Switcher: Quick News vs Full In-depth */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEditorMode("quick")}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                    editorMode === "quick"
                      ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>هەواڵی خێرا (لە ١٠ چرکەدا)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorMode("full")}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                    editorMode === "full"
                      ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>شیکاری و پێداچوونەوەی تەواو</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>سەردێڕی بابەت:</span>
                    <span className="text-[11px] text-slate-400">پێویستە</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="بۆ نموونە: ئەپڵ وەشانی نوێی ئایفۆن ١٧ بە تەلارسازی تیتانیۆم نمایش دەکات"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    پوختەی هەواڵ (کورتەیەک بۆ کارتەکان و تۆڕە کۆمەڵایەتییەکان):
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="کورتەی سەرەکی هەواڵەکە بە زمانی شیرینی کوردی..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    بەش (Category):
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-bold"
                  >
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Breaking News Checkbox */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-end">
                  <input
                    type="checkbox"
                    id="breakingToggle"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label
                    htmlFor="breakingToggle"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>
                      هەواڵی بەپەلە (دەستبەجێ بچێتە شریتی بەپەلەی سەرپەڕە)
                    </span>
                  </label>
                </div>

                {/* Image URL, Device Upload & 1-Click Presets */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
                    <span>وێنە و میدیای کەڤەر (Cover Media):</span>
                    <span className="text-[11px] text-purple-600 font-bold">
                      وێنە لە ئامێرەکەت باربکە، لینک دابنێ یان لە خوارەوە هەڵيبژێرە
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... (ئارەزوومەندانە)"
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-mono"
                      dir="ltr"
                    />
                    <label className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 shrink-0 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>بارکردنی وێنە لە ئامێرەکەت</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setImageUrl(reader.result);
                              showToast("وێنەکە بە سەرکەوتوویی بارکرا!", "success");
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Always-Visible Media Preview Banner */}
                  <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
                    <img
                      src={
                        imageUrl.trim() ||
                        getCategoryFallbackImage(categorySlug, title || "preview")
                      }
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getCategoryFallbackImage(
                          categorySlug,
                          title || "preview"
                        );
                      }}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/15">
                      پێشبینینی وێنەی کەڤەر و کارتی سۆشیاڵ میدیا
                    </div>
                  </div>

                  {/* Presets Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                    {IMAGE_PRESETS.map((preset, idx) => {
                      const isSelected = imageUrl === preset.url;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setImageUrl(preset.url)}
                          className={`p-1.5 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                            isSelected
                              ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-600/30"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={preset.preview}
                            alt={preset.name}
                            className="w-full h-12 rounded-lg object-cover"
                          />
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FULL MODE EXTRA FIELDS */}
                {editorMode === "full" && (
                  <>
                    {/* Full Article Content */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        دەقی تەواوی بابەت (پەرەگرافەکان بە دوو ئینتەر جیا بکەرەوە):
                      </label>
                      <textarea
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="دەقی تەواوی شیکارییەکە بە کوردی بنووسە..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 leading-relaxed"
                      />
                    </div>

                    {/* Author Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        ناوی نووسەر:
                      </label>
                      <select
                        value={authorName}
                        onChange={(e) => {
                          setAuthorName(e.target.value);
                          if (e.target.value === "ئارام کامەران")
                            setAuthorRole("سەرنووسەری بەشی ڕەقەواڵە");
                          else if (e.target.value === "ژیار نەوزاد")
                            setAuthorRole("توێژەری زیرەکی دەستکرد");
                          else if (e.target.value === "سارا محەمەد")
                            setAuthorRole("پەیامنێری تەکنەلۆژیا");
                          else setAuthorRole("شارەزای مۆبایل و گادجێت");
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-bold"
                      >
                        <option value="ئارام کامەران">
                          ئارام کامەران (سەرنووسەری ڕەقەواڵە)
                        </option>
                        <option value="ژیار نەوزاد">
                          ژیار نەوزاد (توێژەری زیرەکی دەستکرد)
                        </option>
                        <option value="سارا محەمەد">
                          سارا محەمەد (پەیامنێری تەکنەلۆژیا)
                        </option>
                        <option value="بەڵێن کاروان">
                          بەڵێن کاروان (شارەزای مۆبایل)
                        </option>
                        <option value="ئەیجێنتی هۆشمەندی کوردتێک">
                          ئەیجێنتی هۆشمەندی کوردتێک (KurdTech AI Agent)
                        </option>
                      </select>
                    </div>

                    {/* Featured Placement */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        شوێنی دەرکەوتن لە پەڕەی سەرەکی (Featured Hero):
                      </label>
                      <select
                        value={featuredPosition}
                        onChange={(e) =>
                          setFeaturedPosition(e.target.value as any)
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-bold"
                      >
                        <option value="none">
                          ئاسایی (لە ناو لیستی هەواڵەکان)
                        </option>
                        <option value="main">
                          سەرەکی گەورە (Bento Hero Main)
                        </option>
                        <option value="top-left">
                          لاوەکی بەشی سەرەوە (Side Top)
                        </option>
                        <option value="bottom-right">
                          لاوەکی خوارەوە (Side Bottom)
                        </option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>تاگەکان (Tags - بە فاریزە جیا بکەرەوە):</span>
                        <span className="text-[11px] text-slate-400">
                          کلیک لە پێشنیارەکان بکە
                        </span>
                      </label>
                      <input
                        type="text"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="Apple, iPhone, کامێرا, کوردستان"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {SUGGESTED_TAGS.map((tag, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              if (!tagsText.includes(tag)) {
                                setTagsText(
                                  tagsText ? `${tagsText}, ${tag}` : tag
                                );
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 hover:text-purple-600 hover:bg-slate-200 transition-colors"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Score */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        نمرەی شایستەیی لەسەر ١٠ (ئارەزوومەندانە):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(e.target.value)}
                        placeholder="بۆ نموونە: 9.3"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-purple-500 font-mono"
                        dir="ltr"
                      />
                    </div>

                    {/* Editor's Pick Toggle */}
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-end">
                      <input
                        type="checkbox"
                        id="editorPickToggle"
                        checked={isEditorPick}
                        onChange={(e) => setIsEditorPick(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <label
                        htmlFor="editorPickToggle"
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5"
                      >
                        <Star className="w-4 h-4 text-purple-600" />
                        <span>
                          هەڵبژاردەی دەستەی نووسەران (Editor&apos;s Pick)
                        </span>
                      </label>
                    </div>

                    {/* Pros */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500">
                        خاڵە بەهێزەکان (Pros - هەر دێڕێک خاڵێک):
                      </label>
                      <textarea
                        rows={3}
                        value={prosText}
                        onChange={(e) => setProsText(e.target.value)}
                        placeholder="تەمەنی پاتری سەرسوڕهێنەر&#10;شاشەی ڕوون لە ژێر خۆردا"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-emerald-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Cons */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-rose-500">
                        خاڵە لاوازەکان (Cons - هەر دێڕێک خاڵێک):
                      </label>
                      <textarea
                        rows={3}
                        value={consText}
                        onChange={(e) => setConsText(e.target.value)}
                        placeholder="نرخی بەرز لە بازاڕی ناوخۆ&#10;خێرایی کەم لە بارگاویکردنەوە"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:border-rose-500 resize-none leading-relaxed"
                      />
                    </div>
                  </>
                )}

                {/* Social Media Co-Publish Banner in Form */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishToSocial}
                      onChange={(e) => setPublishToSocial(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <div className="text-xs">
                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span>
                          بڵاوکردنەوەی هاوکات لە ئینستاگرام و تۆڕە کۆمەڵایەتییەکان (Telegram, Facebook, X, WhatsApp)
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        ڕاستەوخۆ کارتی ئینستاگرام (پۆست و ستۆری) و دەقی کوردی بۆ هەموو پلاتفۆرمەکان دروست دەکات و دەینێرێت
                      </span>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!socialStudioArticle && articles.length > 0) {
                        setSocialStudioArticle(articles[0]);
                      }
                      setActiveTab("social");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 border border-pink-500/20 text-xs font-bold shrink-0 hover:bg-pink-50 transition-colors"
                  >
                    ڕێکخستنی کەناڵەکان
                  </button>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400">
                  {editingId
                    ? "دەستکاری دەکرێت لەسەر سێرڤەر"
                    : publishToSocial
                    ? "لە پۆڕتاڵ + ستۆدیۆی ئینستاگرام و سۆشیاڵ میدیا بڵاودەکرێتەوە"
                    : "ڕاستەوخۆ لە پۆڕتاڵ بڵاودەکرێتەوە"}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all"
                    >
                      هەڵوەشاندنەوە
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>تۆماردەکرێت...</span>
                      </>
                    ) : editingId ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>نوێکردنەوە و پاشەکەوتکردنی گۆڕانکارییەکان</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 -scale-x-100" />
                        <span>
                          {publishToSocial
                            ? "بڵاوکردنەوە لە ماڵپەڕ + ئینستاگرام و سۆشیاڵ"
                            : "بڵاوکردنەوەی بابەت لە ماڵپەڕدا"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tab: SOCIAL MEDIA & INSTAGRAM STUDIO */}
          {activeTab === "social" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Article Selector Strip for Social Studio */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>
                        کام هەواڵت دەوێت لە ئینستاگرام و سۆشیاڵ میدیا بڵاوبکەیتەوە؟
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      کلیک لە هەر هەواڵێک بکە بۆ دروستکردنی کارتی ئینستاگرام (پۆست و ستۆری) و بڵاوکردنەوەی ڕاستەوخۆ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {articles.slice(0, 12).map((art) => {
                    const selected = socialStudioArticle?.id === art.id;
                    return (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => setSocialStudioArticle(art)}
                        className={`p-2.5 rounded-2xl border text-right shrink-0 w-64 flex items-center gap-3 transition-all ${
                          selected
                            ? "border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/30"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-purple-400"
                        }`}
                      >
                        <img
                          src={getSafeImageUrl(art.imageUrl, art.categorySlug)}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(
                              art.categorySlug
                            );
                          }}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-pink-500 block">
                            {art.category}
                          </span>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {art.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <SocialPublisherModal
                article={socialStudioArticle || articles[0] || null}
                isOpen={true}
                onClose={() => {}}
                inlineMode={true}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* Tab: SITE ANALYTICS DASHBOARD */}
          {activeTab === "analytics" && (
            <AnalyticsDashboard articles={articles} />
          )}

          {/* Tab 4: Backup & JSON Import / Export */}
          {activeTab === "backup" && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  هەناردەکردن و هاوردەکردنی داتا (JSON Backup & Sync)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  دەتوانیت هەموو داتای بابەتەکان بە فایلی JSON هەناردە بکەیت یان بە کۆمەڵ بابەتی نوێ بە فۆرماتی JSON هاوردە بکەیت.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Export Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-500" />
                      هەناردەکردنی هەموو بابەتەکان (Export JSON)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      کۆپیەکی یەدەگ (Backup) لە هەموو {articles.length} بابەتەکەی ئێستا داگرە وەک فایلی فەرمی JSON.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>داگرتنی هەموو بابەتەکان (Download JSON)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-purple-600" />
                      هاوردەکردنی بابەت بە JSON (Bulk Import)
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      دەقی JSONـی بابەتەکان لێرە بچەسپێنە تا بە یەک کلیک زیاد بکرێنە سەر سیستەمەکە.
                    </p>
                  </div>

                  <textarea
                    rows={4}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='[ { "title": "...", "excerpt": "...", "categorySlug": "ai" } ]'
                    className="w-full p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono outline-none focus:border-purple-500"
                    dir="ltr"
                  />

                  <button
                    type="button"
                    onClick={handleImportJson}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>هاوردەکردنی داتاکان (Import Now)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Popup Social Media Studio Modal (triggers after Portal Publish or when clicking Social button) */}
          <SocialPublisherModal
            article={socialStudioArticle}
            isOpen={isSocialModalOpen}
            onClose={() => setIsSocialModalOpen(false)}
            onShowToast={showToast}
          />
        </>
      )}
    </main>
  );
}
