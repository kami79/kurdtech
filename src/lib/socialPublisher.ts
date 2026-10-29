import { Article } from "@/types";
import { getSafeImageUrl } from "@/lib/imageUtils";

export interface SocialCredentials {
  siteUrl: string;
  // Instagram Graph API (Business/Creator account connected to FB Page)
  instagramAccountId: string;
  instagramAccessToken: string;
  // Telegram Bot API
  telegramBotToken: string;
  telegramChatId: string;
  // Facebook Page Graph API
  facebookPageId: string;
  facebookPageAccessToken: string;
  // Universal Automation Webhook (Make.com, Zapier, n8n, Buffer)
  webhookUrl: string;
  // Auto-publish preferences when publishing to portal
  autoOpenStudioOnPublish: boolean;
  autoPostOnPortalPublish: boolean;
  enabledPlatforms: {
    instagram: boolean;
    telegram: boolean;
    facebook: boolean;
    webhook: boolean;
  };
}

export const DEFAULT_SOCIAL_CREDENTIALS: SocialCredentials = {
  siteUrl: "https://kurdtech.vercel.app",
  instagramAccountId: "",
  instagramAccessToken: "",
  telegramBotToken: "",
  telegramChatId: "",
  facebookPageId: "",
  facebookPageAccessToken: "",
  webhookUrl: "",
  autoOpenStudioOnPublish: true,
  autoPostOnPortalPublish: true,
  enabledPlatforms: {
    instagram: true,
    telegram: true,
    facebook: true,
    webhook: false,
  },
};

export const SOCIAL_STORAGE_KEY = "kurdtech_social_config_v1";

export function loadSocialCredentials(): SocialCredentials {
  if (typeof window === "undefined") return DEFAULT_SOCIAL_CREDENTIALS;
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SOCIAL_CREDENTIALS,
        siteUrl: window.location.origin || DEFAULT_SOCIAL_CREDENTIALS.siteUrl,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SOCIAL_CREDENTIALS,
      ...parsed,
      siteUrl:
        parsed.siteUrl ||
        window.location.origin ||
        DEFAULT_SOCIAL_CREDENTIALS.siteUrl,
      enabledPlatforms: {
        ...DEFAULT_SOCIAL_CREDENTIALS.enabledPlatforms,
        ...(parsed.enabledPlatforms || {}),
      },
    };
  } catch {
    return DEFAULT_SOCIAL_CREDENTIALS;
  }
}

export function saveSocialCredentials(config: SocialCredentials): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save social credentials", e);
  }
}

export interface FormattedSocialPosts {
  articleUrl: string;
  imageUrl: string;
  hashtags: string[];
  instagramCaption: string;
  instagramStoryText: string;
  telegramHtml: string;
  telegramPlain: string;
  facebookPost: string;
  xPost: string;
  whatsappPost: string;
  linkedinPost: string;
}

/**
 * Generates clean Kurdish & English hashtags based on article category and tags
 */
export function buildHashtags(article: Article): string[] {
  const baseTags = [
    "#کوردتێک",
    "#تەکنەلۆژیا",
    "#هەواڵی_تەکنەلۆژیا",
    "#کوردستان",
    "#KurdTech",
    "#KurdistanTech",
  ];

  const categoryTags: Record<string, string[]> = {
    ai: ["#زیرەکی_دەستکرد", "#AI", "#ArtificialIntelligence"],
    mobile: ["#مۆبایل", "#ئایفۆن", "#ئەندرۆید", "#Smartphones"],
    hardware: ["#ڕەقەواڵە", "#کۆمپیوتەر", "#چیپسێت", "#Hardware"],
    gaming: ["#گەیمینگ", "#یاری_ئەلیکترۆنی", "#Gaming"],
    kurdistan: ["#ئابووری_کوردستان", "#بازاڕی_مۆبایل", "#هەولێر", "#سلێمانی"],
    cybersecurity: ["#ئاسایشی_سایبەری", "#هاک", "#CyberSecurity"],
  };

  const extra = categoryTags[article.categorySlug] || ["#TechNews"];

  const customTags = (article.tags || [])
    .slice(0, 5)
    .map((t) => {
      const cleaned = t
        .trim()
        .replace(/^#+/, "")
        .replace(/\s+/g, "_")
        .replace(/[^\p{L}\p{N}_]/gu, "");
      return cleaned ? `#${cleaned}` : "";
    })
    .filter(Boolean);

  return Array.from(new Set([...baseTags, ...extra, ...customTags]));
}

/**
 * Generates platform-specific Sorani Kurdish captions and posts for an article
 */
export function generateSocialPosts(
  article: Article,
  siteOrigin?: string
): FormattedSocialPosts {
  const baseUrl = (
    siteOrigin ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    DEFAULT_SOCIAL_CREDENTIALS.siteUrl
  ).replace(/\/+$/, "");

  const articleUrl = `${baseUrl}/articles/${article.id}`;
  const imageUrl = getSafeImageUrl(
    article.imageUrl,
    article.categorySlug,
    `${article.id} ${article.title}`
  );
  const hashtags = buildHashtags(article);
  const hashtagBlock = hashtags.join(" ");

  const paragraphs = Array.isArray(article.content)
    ? article.content.filter((p) => p && p.trim().length > 25)
    : [];

  // Extract 2-3 key points from paragraphs or pros
  const keyBullets: string[] = [];
  if (article.pros && article.pros.length > 0) {
    article.pros.slice(0, 3).forEach((p) => keyBullets.push(p.trim()));
  } else if (paragraphs.length > 1) {
    paragraphs.slice(1, 3).forEach((p) => {
      const firstSentence = p.split(/(?<=[.؟!])\s+/)[0] || p;
      const trimmed =
        firstSentence.length > 160
          ? `${firstSentence.slice(0, 157).trim()}...`
          : firstSentence.trim();
      if (trimmed && trimmed !== article.excerpt.trim()) {
        keyBullets.push(trimmed);
      }
    });
  }

  const headerBadge = article.isBreaking
    ? "🚨 هەواڵی بەپەلە | کوردتێک"
    : `✨ ${article.category || "هەواڵی تەکنەلۆژیا"} | کوردتێک`;

  const bulletsSection =
    keyBullets.length > 0
      ? `\n\n📌 گرنگترین خاڵەکانی هەواڵەکە:\n${keyBullets
          .map((b) => `• ${b}`)
          .join("\n")}`
      : "";

  // 1. Instagram Feed & Reel Caption
  const instagramCaption = `${headerBadge}

🔥 ${article.title}

${article.excerpt}${bulletsSection}

🔗 بۆ خوێندنەوەی تەواوی بابەتەکە و وردەکارییەکان، سەردانی لینکی ناو بایۆ (Link in Bio) بکە یان لە ماڵپەڕی کوردتێک بیخوێنەرەوە:
🌐 ${articleUrl}

💬 ڕای تۆ لەسەر ئەم هەواڵە چییە؟ لە کۆمێنت بۆمان بنووسە 👇

.
.
${hashtagBlock}`;

  // 2. Instagram Story short overlay text
  const instagramStoryText = `${article.isBreaking ? "🚨 بەپەلە" : `📡 ${article.category}`}\n${article.title}\n\n🔗 تەواوی هەواڵەکە لە ماڵپەڕی کوردتێک بخوێنەرەوە`;

  // 3. Telegram HTML formatted post
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const tgBullets =
    keyBullets.length > 0
      ? `\n\n📌 <b>گرنگترین خاڵەکان:</b>\n${keyBullets
          .map((b) => `🔹 ${escapeHtml(b)}`)
          .join("\n")}`
      : "";

  const telegramHtml = `<b>${escapeHtml(headerBadge)}</b>\n\n📰 <b>${escapeHtml(
    article.title
  )}</b>\n\n${escapeHtml(article.excerpt)}${tgBullets}\n\n🔗 <a href="${articleUrl}">خوێندنەوەی تەواوی بابەتەکە لە ماڵپەڕی کوردتێک</a>\n\n${escapeHtml(
    hashtags.slice(0, 6).join(" ")
  )}`;

  const telegramPlain = `${headerBadge}\n\n📰 ${article.title}\n\n${article.excerpt}${bulletsSection}\n\n🔗 خوێندنەوەی تەواوی بابەتەکە:\n${articleUrl}\n\n${hashtags
    .slice(0, 6)
    .join(" ")}`;

  // 4. Facebook Page Post
  const facebookPost = `${headerBadge}

${article.title}

${article.excerpt}${bulletsSection}

👇 تەواوی ڕاپۆرت و شیکارییەکە لەم لینکەوە بخوێنەرەوە:
${articleUrl}

${hashtagBlock}`;

  // 5. X (Twitter) Post (kept concise)
  const shortExcerpt =
    article.excerpt.length > 110
      ? `${article.excerpt.slice(0, 107).trim()}...`
      : article.excerpt;
  const xPost = `${article.isBreaking ? "🚨 " : "⚡ "}${article.title}\n\n${shortExcerpt}\n\n${hashtags
    .slice(0, 3)
    .join(" ")}\n${articleUrl}`;

  // 6. WhatsApp Channel / Group Post
  const whatsappPost = `*${headerBadge}*\n\n*${article.title}*\n\n${article.excerpt}${
    keyBullets.length > 0
      ? `\n\n${keyBullets.map((b) => `✅ ${b}`).join("\n")}`
      : ""
  }\n\n🔗 *لینکی هەواڵەکە:*\n${articleUrl}`;

  // 7. LinkedIn Post
  const linkedinPost = `${article.title}\n\n${article.excerpt}${bulletsSection}\n\nخوێندنەوەی تەواوی بابەتەکە لە پۆڕتاڵی KurdTech:\n${articleUrl}\n\n${hashtags
    .slice(0, 6)
    .join(" ")}`;

  return {
    articleUrl,
    imageUrl,
    hashtags,
    instagramCaption,
    instagramStoryText,
    telegramHtml,
    telegramPlain,
    facebookPost,
    xPost,
    whatsappPost,
    linkedinPost,
  };
}

