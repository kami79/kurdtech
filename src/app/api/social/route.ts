import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import { generateSocialPosts, SocialCredentials } from "@/lib/socialPublisher";
import { Article } from "@/types";
import { getCategoryFallbackImage } from "@/lib/imageUtils";

export const dynamic = "force-dynamic";

export interface PlatformPublishResult {
  platform: "instagram" | "telegram" | "facebook" | "webhook";
  success: boolean;
  message: string;
  externalId?: string;
}

/**
 * Publishes an image + Sorani Kurdish caption to Instagram Business/Creator Account
 * via Official Meta Graph API
 */
async function publishToInstagramGraph(
  accountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string,
  categorySlug?: string
): Promise<PlatformPublishResult> {
  try {
    // Ensure public HTTPS URL for Instagram Graph API container creation
    const publicImageUrl =
      imageUrl && imageUrl.startsWith("https://")
        ? imageUrl
        : getCategoryFallbackImage(categorySlug || "ai", caption);

    // Step 1: Create Media Container
    const createUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      accountId.trim()
    )}/media`;

    const containerRes = await fetch(createUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: publicImageUrl,
        caption,
        access_token: accessToken.trim(),
      }),
    });

    const containerData = await containerRes.json();
    if (!containerRes.ok || !containerData.id) {
      const errMsg =
        containerData?.error?.message ||
        "نەتوانرا کۆنتەینەری پۆستی ئینستاگرام دروست بکرێت";
      return {
        platform: "instagram",
        success: false,
        message: `Instagram API: ${errMsg}`,
      };
    }

    // Step 2: Publish Media Container
    const publishUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      accountId.trim()
    )}/media_publish`;

    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken.trim(),
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      const errMsg =
        publishData?.error?.message || "ئینستاگرام پۆستەکەی بڵاونەکردەوە";
      return {
        platform: "instagram",
        success: false,
        message: `Instagram Publish: ${errMsg}`,
      };
    }

    return {
      platform: "instagram",
      success: true,
      message: "پۆستەکە بە سەرکەوتوویی لە ئینستاگرام بڵاوکرایەوە!",
      externalId: publishData.id,
    };
  } catch (err: any) {
    return {
      platform: "instagram",
      success: false,
      message: err?.message || "هەڵە لە پەیوەندیکردن بە سێرڤەری ئینستاگرام",
    };
  }
}

/**
 * Publishes an article photo + Sorani Kurdish HTML caption + inline Read More button
 * to a Telegram Channel or Group via Telegram Bot API
 */
async function publishToTelegramChannel(
  botToken: string,
  chatId: string,
  imageUrl: string,
  htmlCaption: string,
  articleUrl: string,
  categorySlug?: string
): Promise<PlatformPublishResult> {
  try {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const publicImageUrl =
      imageUrl && imageUrl.startsWith("https://")
        ? imageUrl
        : getCategoryFallbackImage(categorySlug || "ai", htmlCaption);

    // Telegram sendPhoto caption limit is 1024 characters
    const truncatedCaption =
      htmlCaption.length > 1000
        ? `${htmlCaption.slice(0, 995)}...`
        : htmlCaption;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "📖 خوێندنەوەی تەواوی هەواڵەکە لە KurdTech",
            url: articleUrl,
          },
        ],
      ],
    };

    const photoRes = await fetch(
      `https://api.telegram.org/bot${cleanToken}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanChatId,
          photo: publicImageUrl,
          caption: truncatedCaption,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      }
    );

    const photoData = await photoRes.json();
    if (photoRes.ok && photoData.ok) {
      return {
        platform: "telegram",
        success: true,
        message: "هەواڵەکە بە وێنەوە لە کەناڵی تێلیگرام بڵاوکرایەوە!",
        externalId: String(photoData.result?.message_id || ""),
      };
    }

    // Fallback to sendMessage if Telegram rejected the remote photo URL
    const msgRes = await fetch(
      `https://api.telegram.org/bot${cleanToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlCaption,
          parse_mode: "HTML",
          disable_web_page_preview: false,
          reply_markup: replyMarkup,
        }),
      }
    );

    const msgData = await msgRes.json();
    if (msgRes.ok && msgData.ok) {
      return {
        platform: "telegram",
        success: true,
        message: "هەواڵەکە لە کەناڵی تێلیگرام بڵاوکرایەوە!",
        externalId: String(msgData.result?.message_id || ""),
      };
    }

    return {
      platform: "telegram",
      success: false,
      message: `Telegram API: ${
        msgData?.description || photoData?.description || "نەتوانرا بنێردرێت"
      }`,
    };
  } catch (err: any) {
    return {
      platform: "telegram",
      success: false,
      message: err?.message || "هەڵە لە پەیوەندیکردن بە تێلیگرام",
    };
  }
}

/**
 * Publishes an article photo + Sorani Kurdish post to a Facebook Page via Meta Graph API
 */
async function publishToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string,
  message: string,
  categorySlug?: string
): Promise<PlatformPublishResult> {
  try {
    const publicImageUrl =
      imageUrl && imageUrl.startsWith("https://")
        ? imageUrl
        : getCategoryFallbackImage(categorySlug || "ai", message);

    const fbRes = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(
        pageId.trim()
      )}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: publicImageUrl,
          caption: message,
          access_token: pageAccessToken.trim(),
        }),
      }
    );

    const fbData = await fbRes.json();
    if (!fbRes.ok || !fbData.id) {
      return {
        platform: "facebook",
        success: false,
        message: `Facebook API: ${
          fbData?.error?.message || "نەتوانرا لە پەیجی فەیسبووک بڵاوبکرێتەوە"
        }`,
      };
    }

    return {
      platform: "facebook",
      success: true,
      message: "پۆستەکە بە سەرکەوتوویی لە پەیجی فەیسبووک بڵاوکرایەوە!",
      externalId: fbData.post_id || fbData.id,
    };
  } catch (err: any) {
    return {
      platform: "facebook",
      success: false,
      message: err?.message || "هەڵە لە پەیوەندیکردن بە فەیسبووک",
    };
  }
}

/**
 * Sends a structured JSON payload to Make.com / Zapier / n8n / Buffer Webhook
 * for cross-platform automation (Instagram, X, Facebook, Telegram, LinkedIn)
 */
async function publishToWebhook(
  webhookUrl: string,
  article: Article,
  posts: ReturnType<typeof generateSocialPosts>
): Promise<PlatformPublishResult> {
  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "KurdTech Social Studio",
        timestamp: new Date().toISOString(),
        article: {
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          categorySlug: article.categorySlug,
          isBreaking: !!article.isBreaking,
          tags: article.tags || [],
          url: posts.articleUrl,
          imageUrl: posts.imageUrl,
        },
        formattedPosts: {
          instagram: posts.instagramCaption,
          instagramStory: posts.instagramStoryText,
          telegramHtml: posts.telegramHtml,
          telegramPlain: posts.telegramPlain,
          facebook: posts.facebookPost,
          x: posts.xPost,
          whatsapp: posts.whatsappPost,
          linkedin: posts.linkedinPost,
          hashtags: posts.hashtags,
        },
      }),
    });

    if (!res.ok) {
      return {
        platform: "webhook",
        success: false,
        message: `Webhook HTTP ${res.status}: نەتوانرا بنێردرێت`,
      };
    }

    return {
      platform: "webhook",
      success: true,
      message: "هەواڵەکە نێردرا بۆ Webhookـی ئۆتۆماتیکی (Make / Zapier)!",
    };
  } catch (err: any) {
    return {
      platform: "webhook",
      success: false,
      message: err?.message || "هەڵە لە ناردنی Webhook",
    };
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      {
        status: "error",
        message: "ڕێگەپێنەدراوە؛ تەنها بەڕێوەبەر دەتوانێت لە سۆشیاڵ میدیا بڵاوبکاتەوە",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      article,
      platforms,
      credentials,
      customCaption,
      customImageUrl,
    }: {
      article: Article;
      platforms?: ("instagram" | "telegram" | "facebook" | "webhook")[];
      credentials?: Partial<SocialCredentials>;
      customCaption?: string;
      customImageUrl?: string;
    } = body;

    if (!article || !article.title) {
      return NextResponse.json(
        { status: "error", message: "زانیاری بابەتەکە ناتەواوە" },
        { status: 400 }
      );
    }

    const siteUrl =
      credentials?.siteUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://kurdtech.vercel.app";

    const posts = generateSocialPosts(article, siteUrl);
    const activeImageUrl = customImageUrl || posts.imageUrl;

    // Resolve credentials from request or server environment variables
    const igAccountId =
      credentials?.instagramAccountId || process.env.INSTAGRAM_ACCOUNT_ID || "";
    const igAccessToken =
      credentials?.instagramAccessToken ||
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      "";

    const tgBotToken =
      credentials?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || "";
    const tgChatId =
      credentials?.telegramChatId || process.env.TELEGRAM_CHAT_ID || "";

    const fbPageId =
      credentials?.facebookPageId || process.env.FACEBOOK_PAGE_ID || "";
    const fbPageToken =
      credentials?.facebookPageAccessToken ||
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
      "";

    const webhookUrl =
      credentials?.webhookUrl || process.env.SOCIAL_WEBHOOK_URL || "";

    const targetPlatforms = platforms || [
      "instagram",
      "telegram",
      "facebook",
      "webhook",
    ];

    const results: PlatformPublishResult[] = [];

    // 1. Instagram
    if (targetPlatforms.includes("instagram")) {
      if (igAccountId && igAccessToken) {
        const igRes = await publishToInstagramGraph(
          igAccountId,
          igAccessToken,
          activeImageUrl,
          customCaption || posts.instagramCaption,
          article.categorySlug
        );
        results.push(igRes);
      } else if (platforms?.includes("instagram")) {
        results.push({
          platform: "instagram",
          success: false,
          message:
            "تکایە سەرەتا Instagram Account ID و Access Token لە ڕێکخستنەکانی سۆشیاڵ میدیا دابنێ (یان کارتی ئینستاگرام دابگرە)",
        });
      }
    }

    // 2. Telegram Channel
    if (targetPlatforms.includes("telegram")) {
      if (tgBotToken && tgChatId) {
        const tgRes = await publishToTelegramChannel(
          tgBotToken,
          tgChatId,
          activeImageUrl,
          customCaption || posts.telegramHtml,
          posts.articleUrl,
          article.categorySlug
        );
        results.push(tgRes);
      } else if (platforms?.includes("telegram")) {
        results.push({
          platform: "telegram",
          success: false,
          message:
            "تکایە سەرەتا Telegram Bot Token و ناسنامەی کەناڵ (@Channel) لە ڕێکخستنەکان دابنێ",
        });
      }
    }

    // 3. Facebook Page
    if (targetPlatforms.includes("facebook")) {
      if (fbPageId && fbPageToken) {
        const fbRes = await publishToFacebookPage(
          fbPageId,
          fbPageToken,
          activeImageUrl,
          customCaption || posts.facebookPost,
          article.categorySlug
        );
        results.push(fbRes);
      } else if (platforms?.includes("facebook")) {
        results.push({
          platform: "facebook",
          success: false,
          message:
            "تکایە سەرەتا Facebook Page ID و Access Token لە ڕێکخستنەکان دابنێ",
        });
      }
    }

    // 4. Universal Webhook
    if (targetPlatforms.includes("webhook")) {
      if (webhookUrl) {
        const whRes = await publishToWebhook(webhookUrl, article, posts);
        results.push(whRes);
      } else if (platforms?.includes("webhook")) {
        results.push({
          platform: "webhook",
          success: false,
          message: "تکایە سەرەتا لینکی Webhook (Make / Zapier) لە ڕێکخستنەکان دابنێ",
        });
      }
    }

    const anySuccess = results.some((r) => r.success);

    return NextResponse.json({
      status: anySuccess ? "success" : "partial",
      results,
      posts,
    });
  } catch (err: any) {
    console.error("Social publish error:", err);
    return NextResponse.json(
      {
        status: "error",
        message: err?.message || "هەڵە لە بڵاوکردنەوە لە سۆشیاڵ میدیا",
      },
      { status: 500 }
    );
  }
}

