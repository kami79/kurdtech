"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Instagram,
  Send,
  Share2,
  Copy,
  Check,
  Download,
  Sparkles,
  Settings,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Square,
  Globe,
  Zap,
  Image as ImageIcon,
  Link2,
} from "lucide-react";
import { Article } from "@/types";
import {
  generateSocialPosts,
  loadSocialCredentials,
  saveSocialCredentials,
  SocialCredentials,
} from "@/lib/socialPublisher";
import { getSafeImageUrl, getCategoryFallbackImage } from "@/lib/imageUtils";

interface SocialPublisherModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  inlineMode?: boolean;
  onShowToast?: (msg: string, type?: "success" | "info" | "error") => void;
}

type PlatformTab =
  | "instagram"
  | "telegram"
  | "facebook"
  | "x"
  | "whatsapp"
  | "linkedin";

type CardFormat = "square" | "story";
type CardTheme = "purple" | "breaking" | "cyber";

function wrapRtlCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        const remaining = words.slice(i).join(" ");
        let lastLine = remaining;
        while (
          ctx.measureText(lastLine + "...").width > maxWidth &&
          lastLine.length > 5
        ) {
          lastLine = lastLine.slice(0, -4).trim();
        }
        lines.push(
          lastLine.length < remaining.length ? `${lastLine}...` : lastLine
        );
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export default function SocialPublisherModal({
  article,
  isOpen,
  onClose,
  inlineMode = false,
  onShowToast,
}: SocialPublisherModalProps) {
  const [activePlatform, setActivePlatform] =
    useState<PlatformTab>("instagram");
  const [cardFormat, setCardFormat] = useState<CardFormat>("square");
  const [cardTheme, setCardTheme] = useState<CardTheme>("purple");
  const [credentials, setCredentials] = useState<SocialCredentials>(() =>
    loadSocialCredentials()
  );
  const [showConfig, setShowConfig] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customCaption, setCustomCaption] = useState("");
  const [isPublishingApi, setIsPublishingApi] = useState(false);
  const [publishResults, setPublishResults] = useState<
    {
      platform: string;
      success: boolean;
      message: string;
    }[]
  >([]);
  const [isRenderingCard, setIsRenderingCard] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const notify = useCallback(
    (msg: string, type: "success" | "info" | "error" = "success") => {
      if (onShowToast) onShowToast(msg, type);
    },
    [onShowToast]
  );

  useEffect(() => {
    setCredentials(loadSocialCredentials());
  }, [isOpen]);

  const posts = React.useMemo(() => {
    if (!article) return null;
    return generateSocialPosts(article, credentials.siteUrl);
  }, [article, credentials.siteUrl]);

  // Update editable caption when platform or article changes
  useEffect(() => {
    if (!posts) return;
    if (activePlatform === "instagram") setCustomCaption(posts.instagramCaption);
    else if (activePlatform === "telegram")
      setCustomCaption(posts.telegramPlain);
    else if (activePlatform === "facebook") setCustomCaption(posts.facebookPost);
    else if (activePlatform === "x") setCustomCaption(posts.xPost);
    else if (activePlatform === "whatsapp") setCustomCaption(posts.whatsappPost);
    else if (activePlatform === "linkedin") setCustomCaption(posts.linkedinPost);
  }, [activePlatform, posts]);

  useEffect(() => {
    if (article?.isBreaking) {
      setCardTheme("breaking");
    } else {
      setCardTheme("purple");
    }
    setPublishResults([]);
  }, [article]);

  // Render Branded Instagram Card (1080x1080 or 1080x1920) on Canvas
  const renderInstagramCard = useCallback(async () => {
    if (!article || !canvasRef.current) return;
    setIsRenderingCard(true);

    const canvas = canvasRef.current;
    const width = 1080;
    const height = cardFormat === "square" ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsRenderingCard(false);
      return;
    }

    // 1. Background Base
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (cardTheme === "breaking") {
      bgGrad.addColorStop(0, "#1a050d");
      bgGrad.addColorStop(0.5, "#2d0714");
      bgGrad.addColorStop(1, "#09040a");
    } else if (cardTheme === "cyber") {
      bgGrad.addColorStop(0, "#020617");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#030712");
    } else {
      bgGrad.addColorStop(0, "#0f0728");
      bgGrad.addColorStop(0.5, "#1e1040");
      bgGrad.addColorStop(1, "#080b14");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Load & Draw Article Cover Photo via Proxy (avoids CORS tainting)
    const rawImgUrl = getSafeImageUrl(
      article.imageUrl,
      article.categorySlug,
      `${article.id} ${article.title}`
    );
    const proxiedUrl = `/api/social/image-proxy?url=${encodeURIComponent(
      rawImgUrl
    )}`;

    const loadImage = (src: string): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    let loadedImg = await loadImage(proxiedUrl);
    if (!loadedImg) {
      const fallbackUrl = getCategoryFallbackImage(
        article.categorySlug,
        article.title
      );
      loadedImg = await loadImage(
        `/api/social/image-proxy?url=${encodeURIComponent(fallbackUrl)}`
      );
    }

    if (loadedImg) {
      // Draw cover image occupying top 62% (square) or 58% (story)
      const imgAreaHeight =
        cardFormat === "square" ? height * 0.65 : height * 0.56;
      const scale = Math.max(
        width / loadedImg.width,
        imgAreaHeight / loadedImg.height
      );
      const drawW = loadedImg.width * scale;
      const drawH = loadedImg.height * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (imgAreaHeight - drawH) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, imgAreaHeight);
      ctx.clip();
      ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    // 3. Smooth Multi-Stop Dark Gradient Overlay for Text Readability
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
    overlayGrad.addColorStop(0, "rgba(7, 10, 22, 0.55)");
    overlayGrad.addColorStop(0.25, "rgba(7, 10, 22, 0.15)");
    overlayGrad.addColorStop(
      cardFormat === "square" ? 0.48 : 0.42,
      cardTheme === "breaking"
        ? "rgba(28, 6, 15, 0.88)"
        : cardTheme === "cyber"
        ? "rgba(8, 15, 32, 0.88)"
        : "rgba(15, 9, 36, 0.88)"
    );
    overlayGrad.addColorStop(
      1,
      cardTheme === "breaking"
        ? "#120309"
        : cardTheme === "cyber"
        ? "#030712"
        : "#090618"
    );
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, width, height);

    // 4. Decorative Glow Accent Line
    const accentColor =
      cardTheme === "breaking"
        ? "#f59e0b"
        : cardTheme === "cyber"
        ? "#38bdf8"
        : "#a855f7";

    // Top Header Bar (KurdTech Logo + Category / Breaking Pill)
    const padX = 68;
    const topY = cardFormat === "square" ? 64 : 110;

    // KurdTech Brand Pill (Top Left)
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(padX, topY, 270, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(padX + 38, topY + 32, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("KURDTECH", padX + 64, topY + 42);
    ctx.restore();

    // Category / Breaking Badge (Top Right - RTL)
    ctx.save();
    const badgeText = article.isBreaking
      ? "🚨 هەواڵی بەپەلە"
      : `✨ ${article.category || "تەکنەلۆژیا"}`;
    ctx.font = "bold 26px Vazirmatn, system-ui, sans-serif";
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = Math.max(badgeMetrics.width + 56, 180);

    ctx.fillStyle = article.isBreaking
      ? "rgba(225, 29, 72, 0.92)"
      : "rgba(124, 58, 237, 0.9)";
    ctx.beginPath();
    ctx.roundRect(width - padX - badgeW, topY, badgeW, 64, 32);
    ctx.fill();

    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeText, width - padX - badgeW / 2, topY + 41);
    ctx.restore();

    // 5. Main Kurdish Headline & Excerpt Block
    const contentStartY = cardFormat === "square" ? 560 : 940;
    const maxTextWidth = width - padX * 2;

    // Accent bar on the right side
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(width - padX - 120, contentStartY - 36, 120, 8, 4);
    ctx.fill();

    // Draw Headline (RTL)
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    const titleFontSize = cardFormat === "square" ? 48 : 56;
    ctx.font = `900 ${titleFontSize}px Vazirmatn, "Noto Sans Arabic", Tahoma, sans-serif`;

    const titleLines = wrapRtlCanvasText(
      ctx,
      article.title,
      maxTextWidth,
      cardFormat === "square" ? 3 : 4
    );

    let cursorY = contentStartY + 30;
    const titleLineHeight = cardFormat === "square" ? 72 : 84;
    for (const line of titleLines) {
      ctx.fillText(line, width - padX, cursorY);
      cursorY += titleLineHeight;
    }
    ctx.restore();

    // Draw Excerpt / Summary (RTL)
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#cbd5e1";
    const excerptFontSize = cardFormat === "square" ? 29 : 34;
    ctx.font = `500 ${excerptFontSize}px Vazirmatn, "Noto Sans Arabic", Tahoma, sans-serif`;

    const excerptLines = wrapRtlCanvasText(
      ctx,
      article.excerpt,
      maxTextWidth,
      cardFormat === "square" ? 3 : 5
    );

    cursorY += 20;
    const excerptLineHeight = cardFormat === "square" ? 48 : 58;
    for (const line of excerptLines) {
      ctx.fillText(line, width - padX, cursorY);
      cursorY += excerptLineHeight;
    }
    ctx.restore();

    // Story Extra Callout Box
    if (cardFormat === "story") {
      const boxY = height - 340;
      ctx.save();
      ctx.fillStyle = "rgba(168, 85, 247, 0.16)";
      ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(padX, boxY, maxTextWidth, 130, 28);
      ctx.fill();
      ctx.stroke();

      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 30px Vazirmatn, Tahoma, sans-serif";
      ctx.fillText(
        "🔗 تەواوی ڕاپۆرتەکە لە لینکی بایۆ (Link in Bio) بخوێنەرەوە",
        width / 2,
        boxY + 76
      );
      ctx.restore();
    }

    // 6. Footer Bar
    const footerY = height - (cardFormat === "square" ? 68 : 110);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, footerY - 38);
    ctx.lineTo(width - padX, footerY - 38);
    ctx.stroke();

    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 24px Vazirmatn, Tahoma, sans-serif";
    ctx.fillText(
      "پۆڕتاڵی یەکەمی هەواڵ و شیکاری تەکنەلۆژیا بە زمانی کوردی",
      width - padX,
      footerY
    );

    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = accentColor;
    ctx.font = "bold 24px monospace";
    ctx.fillText("@KurdTech", padX, footerY);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL("image/png", 0.95);
      setCardDataUrl(dataUrl);
    } catch (e) {
      console.warn("Canvas export fallback", e);
    } finally {
      setIsRenderingCard(false);
    }
  }, [article, cardFormat, cardTheme]);

  useEffect(() => {
    if ((isOpen || inlineMode) && article) {
      const timer = setTimeout(() => {
        renderInstagramCard();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, inlineMode, article, cardFormat, cardTheme, renderInstagramCard]);

  if ((!isOpen && !inlineMode) || !article || !posts) return null;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      notify(`${label} بە سەرکەوتوویی کۆپی کرا!`, "info");
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      notify("نەتوانرا کۆپی بکرێت", "error");
    }
  };

  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `kurdtech-${cardFormat}-${article.id.slice(0, 20)}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify(
        cardFormat === "square"
          ? "وێنەی پۆستی ئینستاگرام (1080×1080) داگیرا!"
          : "وێنەی ستۆری ئینستاگرام (1080×1920) داگیرا!",
        "success"
      );
    } catch {
      notify("هەڵە لە داگرتنی وێنە", "error");
    }
  };

  // Native Web Share with Image File + Caption (Ideal for Mobile Instagram / Telegram / WhatsApp)
  const handleNativeMobileShare = async () => {
    if (!canvasRef.current) return;
    try {
      // Also copy caption to clipboard so user can paste it in Instagram
      await navigator.clipboard.writeText(customCaption);
    } catch {}

    try {
      const blob: Blob | null = await new Promise((resolve) =>
        canvasRef.current?.toBlob((b) => resolve(b), "image/png", 0.95)
      );
      if (blob && navigator.canShare) {
        const file = new File([blob], `kurdtech-${cardFormat}.png`, {
          type: "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: article.title,
            text: customCaption,
          });
          notify("ئامادەکرا بۆ بڵاوکردنەوە لە ئەپی مۆبایل!", "success");
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: customCaption,
          url: posts.articleUrl,
        });
        return;
      }
      handleDownloadCard();
      notify(
        "وێنەکە داگیرا و دەقەکەش کۆپی کرا! ئێستا لە ئینستاگرام دایبنێ.",
        "info"
      );
    } catch {
      // User cancelled share sheet
    }
  };

  const handleSaveCredentials = (next: SocialCredentials) => {
    setCredentials(next);
    saveSocialCredentials(next);
  };

  // Trigger Server-Side Auto-Publish API
  const handleAutoPublishApi = async (
    targetPlatforms?: ("instagram" | "telegram" | "facebook" | "webhook")[]
  ) => {
    setIsPublishingApi(true);
    setPublishResults([]);
    try {
      const selected =
        targetPlatforms ||
        (Object.entries(credentials.enabledPlatforms)
          .filter(([, enabled]) => enabled)
          .map(([k]) => k) as (
          | "instagram"
          | "telegram"
          | "facebook"
          | "webhook"
        )[]);

      const res = await fetch("/api/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("kurdtech_admin_token") || "",
        },
        body: JSON.stringify({
          article,
          platforms: selected,
          credentials,
          customCaption:
            targetPlatforms?.length === 1 ? customCaption : undefined,
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.results)) {
        setPublishResults(data.results);
        const successCount = data.results.filter((r: any) => r.success).length;
        if (successCount > 0) {
          notify(
            `بە سەرکەوتوویی لە ${successCount} پلاتفۆرمی سۆشیاڵ میدیا بڵاوکرایەوە!`,
            "success"
          );
        } else {
          notify(
            "تکایە کلیلەکانی API لە بەشی ڕێکخستنی سۆشیاڵ میدیا پڕبکەرەوە یان بڵاوکردنەوەی خێرا بەکاربهێنە",
            "info"
          );
        }
      } else {
        notify(data.message || "کێشەیەک لە بڵاوکردنەوە ڕوویدا", "error");
      }
    } catch (err: any) {
      notify(err?.message || "هەڵە لە پەیوەندی بە سێرڤەر", "error");
    } finally {
      setIsPublishingApi(false);
    }
  };

  const innerContent = (
    <div
      className={`${
        inlineMode
          ? "w-full bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          : "relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl"
      }`}
    >
      {/* Top Studio Header */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-purple-950 via-fuchsia-950 to-indigo-950 text-white border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-500 flex items-center justify-center shadow-lg">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black">
                ستۆدیۆی بڵاوکردنەوە لە ئینستاگرام و سۆشیاڵ میدیا
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-[10px] font-black">
                Social Auto-Publisher
              </span>
            </div>
            <p className="text-[11px] text-purple-200/80 line-clamp-1">
              {article.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              showConfig
                ? "bg-white text-slate-900 shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ڕێکخستنی API و بڵاوکردنەوەی خۆکار</span>
          </button>

          {!inlineMode && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors"
              title="داخستن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* API & Auto-Publish Configuration Drawer */}
      {showConfig && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>
                  بەستنەوەی ڕاستەوخۆی کەناڵەکانی سۆشیاڵ میدیا (Instagram Graph API, Telegram Bot, Facebook, Webhook)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                کلیلەکانت لێرە پاشەکەوت بکە تا لەگەڵ هەر بڵاوکردنەوەیەکی هەواڵ لە پۆڕتاڵ، ڕاستەوخۆ لە سۆشیاڵ میدیاکانیشت بڵاوببێتەوە.
              </p>
            </div>
          </div>

          {/* Portal Publish Automation Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={credentials.autoOpenStudioOnPublish}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    autoOpenStudioOnPublish: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-purple-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  کردنەوەی ستۆدیۆی ئینستاگرام دوای بڵاوکردنەوە لە پۆڕتاڵ
                </span>
                <span className="text-[11px] text-slate-400">
                  هەر کاتێک بابەتێک بڵاودەکەیتەوە، کارتی ئینستاگرام و پۆستەکە ئامادە دەکات
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={credentials.autoPostOnPortalPublish}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    autoPostOnPortalPublish: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded text-purple-600"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  بڵاوکردنەوەی خۆکار لە کەناڵە پەیوەستکراوەکان (Auto-Post)
                </span>
                <span className="text-[11px] text-slate-400">
                  لەگەڵ بڵاوکردنەوە لە ماڵپەڕ، ڕاستەوخۆ دەینێرێت بۆ تێلیگرام/ئینستاگرام/فەیسبووک
                </span>
              </div>
            </label>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Instagram Graph API */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-pink-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4" />
                  Instagram Graph API (هەژماری بزنس)
                </span>
                <input
                  type="checkbox"
                  checked={credentials.enabledPlatforms.instagram}
                  onChange={(e) =>
                    handleSaveCredentials({
                      ...credentials,
                      enabledPlatforms: {
                        ...credentials.enabledPlatforms,
                        instagram: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-pink-600"
                />
              </div>
              <input
                type="text"
                value={credentials.instagramAccountId}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    instagramAccountId: e.target.value,
                  })
                }
                placeholder="Instagram Business Account ID (e.g. 1784140...)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
              <input
                type="password"
                value={credentials.instagramAccessToken}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    instagramAccessToken: e.target.value,
                  })
                }
                placeholder="Meta Graph User/Page Access Token (EAAB...)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
            </div>

            {/* Telegram Bot API */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-sky-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  Telegram Channel Bot API (کەناڵی تێلیگرام)
                </span>
                <input
                  type="checkbox"
                  checked={credentials.enabledPlatforms.telegram}
                  onChange={(e) =>
                    handleSaveCredentials({
                      ...credentials,
                      enabledPlatforms: {
                        ...credentials.enabledPlatforms,
                        telegram: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-sky-600"
                />
              </div>
              <input
                type="password"
                value={credentials.telegramBotToken}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    telegramBotToken: e.target.value,
                  })
                }
                placeholder="Bot Token from @BotFather (e.g. 712345:AAH...)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
              <input
                type="text"
                value={credentials.telegramChatId}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    telegramChatId: e.target.value,
                  })
                }
                placeholder="Channel Username or ID (e.g. @kurdtech)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
            </div>

            {/* Facebook Page API */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Facebook Page Graph API (پەیجی فەیسبووک)
                </span>
                <input
                  type="checkbox"
                  checked={credentials.enabledPlatforms.facebook}
                  onChange={(e) =>
                    handleSaveCredentials({
                      ...credentials,
                      enabledPlatforms: {
                        ...credentials.enabledPlatforms,
                        facebook: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>
              <input
                type="text"
                value={credentials.facebookPageId}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    facebookPageId: e.target.value,
                  })
                }
                placeholder="Facebook Page ID"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
              <input
                type="password"
                value={credentials.facebookPageAccessToken}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    facebookPageAccessToken: e.target.value,
                  })
                }
                placeholder="Facebook Page Access Token"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
            </div>

            {/* Make / Zapier / n8n Webhook + Site URL */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-purple-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4" />
                  Make.com / Zapier Webhook و دۆمەینی ماڵپەڕ
                </span>
                <input
                  type="checkbox"
                  checked={credentials.enabledPlatforms.webhook}
                  onChange={(e) =>
                    handleSaveCredentials({
                      ...credentials,
                      enabledPlatforms: {
                        ...credentials.enabledPlatforms,
                        webhook: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded text-purple-600"
                />
              </div>
              <input
                type="url"
                value={credentials.webhookUrl}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    webhookUrl: e.target.value,
                  })
                }
                placeholder="https://hook.eu1.make.com/... (ئارەزوومەندانە)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
              <input
                type="url"
                value={credentials.siteUrl}
                onChange={(e) =>
                  handleSaveCredentials({
                    ...credentials,
                    siteUrl: e.target.value,
                  })
                }
                placeholder="https://kurdtech.vercel.app"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Studio Body */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1 (5 cols): Branded Instagram Post & Story Card Generator */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <span>دیزاینی کارتی ئینستاگرام (پۆست و ستۆری)</span>
            </h3>
            <button
              type="button"
              onClick={renderInstagramCard}
              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRenderingCard ? "animate-spin" : ""}`}
              />
              <span>نوێکردنەوە</span>
            </button>
          </div>

          {/* Format & Theme Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCardFormat("square")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  cardFormat === "square"
                    ? "bg-white dark:bg-slate-900 text-pink-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>پۆست (1:1)</span>
              </button>
              <button
                type="button"
                onClick={() => setCardFormat("story")}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  cardFormat === "story"
                    ? "bg-white dark:bg-slate-900 text-pink-600 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ستۆری (9:16)</span>
              </button>
            </div>

            {/* Theme Pills */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: "purple", label: "مۆر", color: "bg-purple-600" },
                  { id: "breaking", label: "بەپەلە", color: "bg-rose-600" },
                  { id: "cyber", label: "سایبەر", color: "bg-sky-500" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCardTheme(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
                    cardTheme === t.id
                      ? "border-purple-500 bg-purple-500/10 text-slate-900 dark:text-white"
                      : "border-transparent bg-slate-200/60 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hidden High-Res Canvas + Responsive Preview */}
          <div className="relative flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner min-h-[260px]">
            <canvas
              ref={canvasRef}
              className={`${
                cardFormat === "square"
                  ? "w-full aspect-square max-w-[340px]"
                  : "w-auto h-[360px] aspect-[9/16]"
              } object-contain rounded-xl`}
            />
          </div>

          {/* Download & Mobile Share Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>
                داگرتنی وێنەی {cardFormat === "square" ? "پۆست" : "ستۆری"} (PNG)
              </span>
            </button>

            <button
              type="button"
              onClick={handleNativeMobileShare}
              className="py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              title="لە مۆبایلدا ڕاستەوخۆ وێنە و دەقەکە دەنێرێت بۆ ئەپی Instagram یان Telegram"
            >
              <Share2 className="w-4 h-4" />
              <span>ناردن بۆ ئەپی ئینستاگرام / مۆبایل</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed text-center">
            وێنەکە بە کوالێتی بەرزی ستانداردی ئینستاگرام (1080p) بە لۆگۆ و ناونیشانی کوردییەوە ئامادەکراوە.
          </p>
        </div>

        {/* Column 2 (7 cols): Multi-Platform Captions, Direct Share & Auto-Publisher */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1-Click Auto-Publish Bar */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/25 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>بڵاوکردنەوەی ئۆتۆماتیکی ڕاستەوخۆ (One-Click Auto-Post)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ناردنی وێنە و دەقی هەواڵەکە ڕاستەوخۆ لە سێرڤەرەوە بۆ پلاتفۆرمە پەیوەستکراوەکان
                </p>
              </div>

              <button
                type="button"
                disabled={isPublishingApi}
                onClick={() => handleAutoPublishApi()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 shrink-0"
              >
                {isPublishingApi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>دەنێردرێت...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>بڵاوکردنەوەی خۆکار لە هەموویان</span>
                  </>
                )}
              </button>
            </div>

            {/* Individual API Trigger Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isPublishingApi}
                onClick={() => handleAutoPublishApi(["instagram"])}
                className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500 hover:text-white text-pink-600 dark:text-pink-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>پۆستی ڕاستەوخۆ لە Instagram API</span>
              </button>

              <button
                type="button"
                disabled={isPublishingApi}
                onClick={() => handleAutoPublishApi(["telegram"])}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ناردن بۆ کەناڵی Telegram</span>
              </button>

              <button
                type="button"
                disabled={isPublishingApi}
                onClick={() => handleAutoPublishApi(["facebook"])}
                className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>پۆست لە پەیجی Facebook</span>
              </button>

              <button
                type="button"
                disabled={isPublishingApi}
                onClick={() => handleAutoPublishApi(["webhook"])}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500 hover:text-white text-purple-600 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>ناردن بۆ Webhook</span>
              </button>
            </div>

            {/* API Publish Results Feedback */}
            {publishResults.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-purple-500/20">
                {publishResults.map((res, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      res.success
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {res.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    )}
                    <span>{res.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Selector Tabs for Captions & Quick Intents */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(
              [
                {
                  id: "instagram",
                  label: "Instagram",
                  badge: "کەپشن + هاشتاگ",
                  color: "from-pink-600 to-purple-600",
                },
                {
                  id: "telegram",
                  label: "Telegram",
                  badge: "کەناڵ و گرووپ",
                  color: "from-sky-500 to-blue-600",
                },
                {
                  id: "facebook",
                  label: "Facebook",
                  badge: "پەیج و پڕۆفایل",
                  color: "from-blue-600 to-indigo-600",
                },
                {
                  id: "x",
                  label: "X (Twitter)",
                  badge: "تویت",
                  color: "from-slate-800 to-slate-950",
                },
                {
                  id: "whatsapp",
                  label: "WhatsApp",
                  badge: "کەناڵ و ستاتۆس",
                  color: "from-emerald-500 to-teal-600",
                },
                {
                  id: "linkedin",
                  label: "LinkedIn",
                  badge: "پیشەیی",
                  color: "from-blue-700 to-sky-700",
                },
              ] as const
            ).map((tab) => {
              const active = activePlatform === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePlatform(tab.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 flex flex-col items-start ${
                    active
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      active ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Formatted Kurdish Caption Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 dark:text-slate-200">
                دەقی ئامادەکراوی پۆست بە کوردی ({activePlatform.toUpperCase()}):
              </label>
              <button
                type="button"
                onClick={() => handleCopy(customCaption, "دەقی پۆستەکە")}
                className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600 text-purple-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copiedField === "دەقی پۆستەکە" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>کۆپی کرا!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کۆپیکردنی دەق و هاشتاگ</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={9}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed outline-none focus:border-purple-500"
            />
          </div>

          {/* Direct Web / App Share Intent Buttons */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
              بڵاوکردنەوەی دەستبەجێ لە ڕێگەی وێب و ئەپەکانەوە (1-Click Launch):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Instagram Launch (Downloads Card + Copies Caption + Opens IG) */}
              <button
                type="button"
                onClick={async () => {
                  await handleCopy(customCaption, "کەپشنی ئینستاگرام");
                  handleDownloadCard();
                  window.open("https://www.instagram.com/", "_blank");
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>ئامادەکردن و کردنەوەی Instagram</span>
              </button>

              {/* Telegram Share */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  posts.articleUrl
                )}&text=${encodeURIComponent(posts.telegramPlain)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>ناردن لە Telegram</span>
              </a>

              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  posts.whatsappPost
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>ناردن لە WhatsApp</span>
              </a>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  posts.articleUrl
                )}&quote=${encodeURIComponent(posts.facebookPost)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleCopy(posts.facebookPost, "پۆستی فەیسبووک")}
                className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>بڵاوکردنەوە لە Facebook</span>
              </a>

              {/* X / Twitter Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  posts.xPost
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>پۆستکردن لە X (Twitter)</span>
              </a>

              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  posts.articleUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleCopy(posts.linkedinPost, "پۆستی لینکدئین")}
                className="p-3 rounded-2xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>هاوبەشکردن لە LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Direct Article Link Copy */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs">
            <span
              className="font-mono text-slate-600 dark:text-slate-300 truncate"
              dir="ltr"
            >
              {posts.articleUrl}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(posts.articleUrl, "لینکی بابەت")}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-purple-600 font-bold shrink-0 flex items-center gap-1 shadow-sm"
            >
              <Copy className="w-3 h-3" />
              <span>کۆپیکردنی لینک</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (inlineMode) {
    return innerContent;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {innerContent}
      </div>
    </div>
  );
}

