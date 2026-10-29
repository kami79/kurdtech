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

// Clean HTML tags and decode basic XML entities
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    const rawContent = stripHtml(fullSourceText) || title;
    const snippet = descBlock ? stripHtml(descBlock[1]).slice(0, 320) : rawContent.slice(0, 320);

    // Extract genuine story paragraphs
    let contentParagraphs: string[] = [];
    if (fullSourceText) {
      contentParagraphs = fullSourceText
        .split(/<\/p>|<br\s*\/?>|\n\n|\r\n\r\n/gi)
        .map((p) => stripHtml(p))
        .filter(
          (p) =>
            p.length > 35 &&
            !p.toLowerCase().includes("subscribe") &&
            !p.toLowerCase().includes("sign up") &&
            !p.toLowerCase().includes("cookie") &&
            !p.toLowerCase().includes("all rights reserved") &&
            !p.toLowerCase().includes("appeared first on")
        )
        .slice(0, 6);
    }

    // If only 1 paragraph was extracted and it's rich, split on sentence boundary
    if (contentParagraphs.length === 1 && contentParagraphs[0].length > 180) {
      const sentences = contentParagraphs[0].match(/[^.!?]+[.!?]+(?:\s|$)/g);
      if (sentences && sentences.length >= 2) {
        const mid = Math.ceil(sentences.length / 2);
        contentParagraphs = [
          sentences.slice(0, mid).join(" ").trim(),
          sentences.slice(mid).join(" ").trim(),
        ];
      }
    }

    if (contentParagraphs.length === 0 && rawContent) {
      contentParagraphs = [rawContent.slice(0, 600)];
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
