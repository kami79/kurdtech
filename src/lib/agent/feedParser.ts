import { TechNewsSource } from "./sources";

export interface RawNewsItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceIcon: string;
  badgeColor: string;
  title: string;
  originalLink: string;
  publishedDate: string;
  publishedTimestamp: number;
  originalAuthor?: string;
  snippet: string;
  rawContent: string;
  contentParagraphs: string[];
  feedTags: string[];
  imageUrl?: string;
  categorySlug: "ai" | "mobile" | "gaming" | "hardware" | "kurdistan" | "science";
  defaultCategory: string;
  importanceScore?: number;
}

// Clean HTML tags and decode XML/HTML entities
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, " ")
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#039;|&apos;|&#8217;|&#8216;/gi, "'")
    .replace(/&#8220;|&#8221;/gi, '"')
    .replace(/&#8211;|&#8212;|&mdash;|&ndash;/gi, " - ")
    .replace(/&#038;|&#38;/gi, "&")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\b(?:Read more|Continue reading|more…|more\.\.\.|Comments)\s*$/gi, "")
    .replace(/The post .* appeared first on .*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Trim text cleanly at a sentence boundary instead of cutting mid-word
export function trimToCompleteSentences(text: string, maxChars: number = 480): string {
  const cleaned = text.replace(/\s*(?:more…|more\.\.\.|\[…\]|\[\.\.\.\])\s*$/gi, "").trim();
  if (cleaned.length <= maxChars) return cleaned;

  const slice = cleaned.slice(0, maxChars);
  // Find last sentence-ending punctuation followed by space or end (not a decimal like 27.3)
  const sentenceEndMatch = slice.match(/^([\s\S]*?[^\d][.!?])(?:\s|$)/);
  if (sentenceEndMatch && sentenceEndMatch[1].length >= 90) {
    return sentenceEndMatch[1].trim();
  }

  // Otherwise cut cleanly at the last word boundary
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim();
}

// Split a long paragraph into natural multi-sentence chunks without splitting version numbers (e.g. iOS 27.3)
export function splitIntoSentencesSafe(text: string): string[] {
  if (!text) return [];
  // Protect decimal numbers and common abbreviations before splitting
  const protectedText = text
    .replace(/(\d)\.(\d)/g, "$1__DEC__$2")
    .replace(/\b(U\.S|U\.K|Dr|Mr|Ms|Prof|Inc|Co|Ltd|vs|v)\./gi, "$1__DOT__");

  const rawSentences = protectedText
    .split(/(?<=[.!?])\s+(?=[A-Z"“‘0-9])/)
    .map((s) =>
      s
        .replace(/__DEC__/g, ".")
        .replace(/__DOT__/g, ".")
        .trim()
    )
    .filter((s) => s.length > 20);

  return rawSentences.length > 0
    ? rawSentences
    : [text.replace(/__DEC__/g, ".").replace(/__DOT__/g, ".").trim()];
}

function isBoilerplateParagraph(p: string): boolean {
  const lower = p.toLowerCase();
  return (
    p.length < 45 ||
    lower.includes("subscribe to") ||
    lower.includes("sign up for") ||
    lower.includes("newsletter") ||
    lower.includes("privacy policy") ||
    lower.includes("terms of service") ||
    lower.includes("all rights reserved") ||
    lower.includes("appeared first on") ||
    lower.includes("affiliate commission") ||
    lower.includes("if you buy something") ||
    lower.includes("related:") ||
    lower.includes("read more:") ||
    lower.startsWith("image:") ||
    lower.startsWith("photo:") ||
    lower.startsWith("credit:") ||
    lower.startsWith("update ") ||
    lower.startsWith("ftc: we use income")
  );
}

// Extract image url from RSS/Atom block (handles both raw XML and HTML-escaped content)
function extractImageUrl(block: string): string | undefined {
  const decoded = block
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#038;|&#38;|&amp;/gi, "&");

  // 1. media:content or media:thumbnail url="..."
  const mediaMatch = /<media:(?:content|thumbnail)[^>]+url=["'](https?:\/\/[^"']+)["']/i.exec(decoded);
  if (mediaMatch) return mediaMatch[1];

  // 2. enclosure url="..." (with image MIME or extension)
  const enclosureMatch = /<enclosure[^>]+url=["'](https?:\/\/[^"']+)["'][^>]*type=["']image\//i.exec(decoded);
  if (enclosureMatch) return enclosureMatch[1];

  // 3. Fallback enclosure without strict mime check
  const anyEnclosure = /<enclosure[^>]+url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/i.exec(decoded);
  if (anyEnclosure) return anyEnclosure[1];

  // 4. img tag in description or content
  const imgMatch = /<img[^>]+(?:src|data-src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/i.exec(decoded);
  if (imgMatch && !imgMatch[1].includes("avatar") && !imgMatch[1].includes("icon") && !imgMatch[1].includes("1x1")) {
    return imgMatch[1];
  }

  // 5. generic img
  const genericImg = /<img[^>]+(?:src|data-src)=["'](https?:\/\/[^"']+)["']/i.exec(decoded);
  if (
    genericImg &&
    !genericImg[1].includes("avatar") &&
    !genericImg[1].includes("icon") &&
    !genericImg[1].includes("pixel") &&
    !genericImg[1].includes("1x1")
  ) {
    return genericImg[1];
  }

  return undefined;
}

// Fetch the original article webpage to extract full-length journalistic paragraphs when the RSS feed only has a short teaser
export async function enrichRawNewsItemWithFullArticle(item: RawNewsItem): Promise<RawNewsItem> {
  if (!item.originalLink || item.contentParagraphs.length >= 5) {
    return item;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(item.originalLink, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);
    if (!res.ok) return item;

    const html = await res.text();

    // Extract og:image if feed item was missing a cover photo
    let imageUrl = item.imageUrl;
    if (!imageUrl) {
      const ogImgMatch =
        /<meta[^>]+property=["']og:image["'][^>]+content=["'](https?:\/\/[^"']+)["']/i.exec(html) ||
        /<meta[^>]+content=["'](https?:\/\/[^"']+)["'][^>]+property=["']og:image["']/i.exec(html);
      if (ogImgMatch?.[1]) {
        imageUrl = ogImgMatch[1].replace(/&amp;|&#038;/g, "&").trim();
      }
    }

    // Isolate <article> or <main> body if available to avoid sidebar/footer noise
    const articleBlockMatch =
      /<article[\s>]([\s\S]*?)<\/article>/i.exec(html) ||
      /<main[\s>]([\s\S]*?)<\/main>/i.exec(html);
    const targetHtml = articleBlockMatch ? articleBlockMatch[1] : html;

    // Extract all <p> tags
    const pMatches = targetHtml.match(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/gi) || [];
    const extractedParagraphs: string[] = [];

    for (const pHtml of pMatches) {
      const clean = stripHtml(pHtml);
      if (!isBoilerplateParagraph(clean) && !extractedParagraphs.includes(clean)) {
        extractedParagraphs.push(clean);
      }
      if (extractedParagraphs.length >= 8) break;
    }

    if (extractedParagraphs.length >= 2) {
      return {
        ...item,
        imageUrl: imageUrl || item.imageUrl,
        snippet: trimToCompleteSentences(extractedParagraphs[0], 420),
        contentParagraphs: extractedParagraphs.slice(0, 7),
        rawContent: extractedParagraphs.join("\n\n"),
      };
    }

    return {
      ...item,
      imageUrl: imageUrl || item.imageUrl,
    };
  } catch {
    return item;
  }
}

// Parse an XML string from an RSS or Atom feed
export function parseRssOrAtomXml(xml: string, source: TechNewsSource): RawNewsItem[] {
  const items: RawNewsItem[] = [];

  // Match each <item> or <entry>
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const block = match[1];

    // Title
    const titleMatch = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block);
    const title = titleMatch ? stripHtml(titleMatch[1]) : "";
    if (!title || title.length < 8) continue;

    // Link
    const linkHrefMatch = /<link[^>]+href=["'](https?:\/\/[^"']+)["']/i.exec(block);
    const linkTextMatch = /<link[^>]*>(https?:\/\/[^<]+)<\/link>/i.exec(block);
    const originalLink = (linkHrefMatch ? linkHrefMatch[1] : linkTextMatch ? linkTextMatch[1] : "").trim();

    // Published date
    const dateMatch = /<(?:pubDate|published|updated)[^>]*>([^<]+)<\/(?:pubDate|published|updated)>/i.exec(block);
    const dateStr = dateMatch ? dateMatch[1].trim() : "";
    let timestamp = Date.now();
    if (dateStr) {
      const parsedTime = Date.parse(dateStr);
      if (!isNaN(parsedTime)) timestamp = parsedTime;
    }

    // Original Author
    const authorMatch = /<(?:dc:creator|author)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:dc:creator|author)>/i.exec(block);
    const originalAuthor = authorMatch ? stripHtml(authorMatch[1]) : "";

    // Tags / Categories from the feed
    const categoryMatches = block.match(/<category[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/gi);
    const feedTags: string[] = [];
    if (categoryMatches) {
      categoryMatches.forEach((cm) => {
        const clean = stripHtml(cm);
        if (clean && clean.length < 35 && !feedTags.includes(clean)) {
          feedTags.push(clean);
        }
      });
    }

    // Content snippets & rich paragraphs
    const rawContentBlock = /<(?:content:encoded|content)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:content:encoded|content)>/i.exec(block);
    const descBlock = /<(?:description|summary)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:description|summary)>/i.exec(block);

    const fullSourceText = rawContentBlock ? rawContentBlock[1] : descBlock ? descBlock[1] : "";
    const decodedSourceHtml = fullSourceText
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, "&");

    const rawContent = stripHtml(decodedSourceHtml) || title;
    const rawDesc = descBlock ? stripHtml(descBlock[1]) : rawContent;
    const snippet = trimToCompleteSentences(rawDesc, 420);

    // Extract genuine story paragraphs
    let contentParagraphs: string[] = [];
    if (decodedSourceHtml) {
      contentParagraphs = decodedSourceHtml
        .split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>|\n\n|\r\n\r\n/gi)
        .map((p) => stripHtml(p))
        .filter((p) => !isBoilerplateParagraph(p))
        .slice(0, 7);
    }

    // If only 1 long paragraph was extracted from RSS, split cleanly on safe sentence boundaries
    if (contentParagraphs.length === 1 && contentParagraphs[0].length > 220) {
      const sentences = splitIntoSentencesSafe(contentParagraphs[0]);
      if (sentences.length >= 4) {
        const third = Math.ceil(sentences.length / 3);
        contentParagraphs = [
          sentences.slice(0, third).join(" "),
          sentences.slice(third, third * 2).join(" "),
          sentences.slice(third * 2).join(" "),
        ].filter(Boolean);
      } else if (sentences.length >= 2) {
        const mid = Math.ceil(sentences.length / 2);
        contentParagraphs = [
          sentences.slice(0, mid).join(" "),
          sentences.slice(mid).join(" "),
        ].filter(Boolean);
      }
    }

    if (contentParagraphs.length === 0 && rawContent) {
      contentParagraphs = [trimToCompleteSentences(rawContent, 500)];
    }

    // Image
    const rawImg = extractImageUrl(block);
    const imageUrl = rawImg ? rawImg.replace(/&#038;|&#38;|&amp;/g, "&").trim() : undefined;

    const id = `${source.id}-${Math.abs(hashString(title + originalLink))}`;

    items.push({
      id,
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      sourceIcon: source.icon,
      badgeColor: source.badgeColor,
      title,
      originalLink,
      publishedDate: dateStr,
      publishedTimestamp: timestamp,
      originalAuthor,
      snippet,
      rawContent,
      contentParagraphs,
      feedTags: feedTags.slice(0, 6),
      imageUrl,
      categorySlug: source.categorySlug,
      defaultCategory: source.defaultCategory,
    });
  }

  return items;
}

// Simple string hash for deterministic IDs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
