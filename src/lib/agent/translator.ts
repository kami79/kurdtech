import {
  RawNewsItem,
  enrichRawNewsItemWithFullArticle,
  splitIntoSentencesSafe,
  trimToCompleteSentences,
} from "./feedParser";
import { getSafeImageUrl } from "@/lib/imageUtils";

export interface TranslatedArticleDraft {
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  categorySlug: "ai" | "mobile" | "gaming" | "hardware" | "kurdistan" | "science";
  tags: string[];
  imageUrl: string;
  isBreaking: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  originalSource: {
    name: string;
    url: string;
  };
  extractedMetrics?: string[];
}

// 1. Comprehensive Kurdish Tech Entities (Companies, Platforms, Chips & People)
const TECH_ENTITIES: { en: string; ku: string; type: "company" | "person" | "product" }[] = [
  // Major Tech Companies & Platforms
  { en: "Apple", ku: "ئەپڵ", type: "company" },
  { en: "OpenAI", ku: "ئۆپن ئەی ئای (OpenAI)", type: "company" },
  { en: "Anthropic", ku: "ئانترۆپیک (Anthropic)", type: "company" },
  { en: "Replit", ku: "ڕیپلیت (Replit)", type: "company" },
  { en: "Google", ku: "گووگڵ", type: "company" },
  { en: "Microsoft", ku: "مایکرۆسۆفت", type: "company" },
  { en: "Meta", ku: "مێتا", type: "company" },
  { en: "Nvidia", ku: "ئینڤیدیا (NVIDIA)", type: "company" },
  { en: "NVIDIA", ku: "ئینڤیدیا (NVIDIA)", type: "company" },
  { en: "Tesla", ku: "تێسلا", type: "company" },
  { en: "SpaceX", ku: "سپەیس ئێکس", type: "company" },
  { en: "TikTok", ku: "تیک تۆک", type: "company" },
  { en: "ByteDance", ku: "بایت دانس", type: "company" },
  { en: "Samsung", ku: "سامسۆنگ", type: "company" },
  { en: "Sony", ku: "سۆنی", type: "company" },
  { en: "Amazon", ku: "ئەمەزۆن", type: "company" },
  { en: "Intel", ku: "ئینتێڵ", type: "company" },
  { en: "AMD", ku: "ئەی ئێم دی (AMD)", type: "company" },
  { en: "Qualcomm", ku: "کوالکۆم", type: "company" },
  { en: "TSMC", ku: "تی ئێس ئێم سی (TSMC)", type: "company" },
  { en: "ARM", ku: "ئارم (ARM)", type: "company" },
  { en: "DeepSeek", ku: "دیپ سیک (DeepSeek)", type: "company" },
  { en: "Perplexity", ku: "پێرپڵێکسیتی (Perplexity)", type: "company" },
  { en: "Mistral", ku: "میستڕاڵ (Mistral AI)", type: "company" },
  { en: "GitHub", ku: "گیت هاب (GitHub)", type: "company" },
  { en: "MacRumors", ku: "ماک ڕیومەرز (MacRumors)", type: "company" },
  { en: "The Verge", ku: "زە ڤێرج (The Verge)", type: "company" },
  { en: "TechCrunch", ku: "تێک کرەنچ (TechCrunch)", type: "company" },
  { en: "Ars Technica", ku: "ئارس تێکنیکا (Ars Technica)", type: "company" },
  { en: "YouTube", ku: "یوتیوب", type: "company" },
  { en: "Telegram", ku: "تێلیگرام", type: "company" },
  { en: "WhatsApp", ku: "واتسئەپ", type: "company" },
  { en: "Instagram", ku: "ئینستاگرام", type: "company" },
  { en: "Nintendo", ku: "نینتێندۆ", type: "company" },
  { en: "PlayStation", ku: "پلەی ستەیشن", type: "company" },
  { en: "Xbox", ku: "ئێکس بۆکس", type: "company" },
  { en: "Huawei", ku: "هواوی", type: "company" },
  { en: "Xiaomi", ku: "شیاومی", type: "company" },
  { en: "Netflix", ku: "نێتفلێکس", type: "company" },
  { en: "Uber", ku: "ئۆبەر", type: "company" },

  // Key Tech Figures & Leaders
  { en: "Elon Musk", ku: "ئیلۆن مەسک", type: "person" },
  { en: "Musk", ku: "ئیلۆن مەسک", type: "person" },
  { en: "Sam Altman", ku: "سام ئاڵتمان", type: "person" },
  { en: "Tim Cook", ku: "تیم کووک", type: "person" },
  { en: "Steve Jobs", ku: "ستیڤ جۆبز", type: "person" },
  { en: "Mark Zuckerberg", ku: "مارک زوکەربێرگ", type: "person" },
  { en: "Sundar Pichai", ku: "سوندەر پیچای", type: "person" },
  { en: "Satya Nadella", ku: "ساتیا نادێلا", type: "person" },
  { en: "Jensen Huang", ku: "جێنسن هوانگ", type: "person" },
  { en: "Dario Amodei", ku: "داریۆ ئامۆدەی", type: "person" },
  { en: "Amjad Masad", ku: "ئەمجەد مەساد", type: "person" },
  { en: "Masad", ku: "ئەمجەد مەساد", type: "person" },
  { en: "Alex Gibney", ku: "ئەلێکس گیبنی", type: "person" },
  { en: "Demis Hassabis", ku: "دێمیس حەسەبیس", type: "person" },
  { en: "Mira Murati", ku: "میرا موراتی", type: "person" },
  { en: "Ilya Sutskever", ku: "ئیلیا سوتسکێڤەر", type: "person" },
  { en: "Yann LeCun", ku: "یان لێکەن", type: "person" },
  { en: "Geoffrey Hinton", ku: "جێفری هینتۆن", type: "person" },

  // Key Models & Products
  { en: "Claude", ku: "کلاود (Claude)", type: "product" },
  { en: "ChatGPT", ku: "چات جی پی تی (ChatGPT)", type: "product" },
  { en: "GPT-4o", ku: "مۆدێلی GPT-4o", type: "product" },
  { en: "GPT-5", ku: "مۆدێلی GPT-5", type: "product" },
  { en: "Gemini", ku: "جێمینای (Gemini)", type: "product" },
  { en: "Blackwell", ku: "تەلارسازیی بلاکوێڵ (Blackwell)", type: "product" },
  { en: "iPhone", ku: "ئایفۆن", type: "product" },
  { en: "iPhone Duo", ku: "ئایفۆن دوۆ (iPhone Duo)", type: "product" },
  { en: "MacBook Pro", ku: "ماکبووک پرۆ (MacBook Pro)", type: "product" },
  { en: "MacBook", ku: "ماکبووک", type: "product" },
  { en: "iPad", ku: "ئایپاد", type: "product" },
  { en: "Galaxy", ku: "گالاکسی", type: "product" },
  { en: "Pixel", ku: "گووگڵ پێکسڵ", type: "product" },
  { en: "Snapdragon", ku: "سناپدراگۆن (Snapdragon)", type: "product" },
];

const CATEGORY_NAMES = {
  ai: "زیرەکی دەستکرد",
  mobile: "مۆبایل و تابلێت",
  hardware: "ڕەقەواڵە و چیپسێت",
  gaming: "یاری و کۆنسۆڵ",
  science: "زانست و بۆشایی",
  kurdistan: "تەکنەلۆژیا لە کوردستان",
};

// Pre-process tricky English idioms & journalistic expressions so neural translation produces natural human Sorani Kurdish
function preProcessEnglishText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\bwalk-in purchases\b/gi, "direct in-store purchases")
    .replace(/\bwalk-in purchase\b/gi, "direct in-store purchase")
    .replace(/\bwalk-in\b/gi, "in-store")
    .replace(/\bmight be challenging\b/gi, "may be difficult")
    .replace(/\bper report\b/gi, "according to a new report")
    .replace(/\bdefault model provider\b/gi, "primary default model provider")
    .replace(/\bdefault over Anthropic\b/gi, "primary default choice instead of Anthropic")
    .replace(/\bscraping concerns\b/gi, "data collection concerns")
    .replace(/\bAI training concerns\b/gi, "AI model training concerns")
    .replace(/\bdocumentary account\b/gi, "documentary film account")
    .replace(/\bcommunity guidelines\b/gi, "community rules")
    .replace(/\bteardown\b/gi, "hardware internal analysis")
    .replace(/\brollout\b/gi, "official release")
    .replace(/\broll out\b/gi, "officially release")
    .replace(/\bdiscontinued\b/gi, "stopped manufacturing")
    .replace(/\beyebrows were raised\b/gi, "many people were surprised")
    .replace(/\braised eyebrows\b/gi, "caused surprise")
    .replace(/\bdid a U-turn on\b/gi, "completely reversed its position on")
    .replace(/\bU-turn on\b/gi, "complete reversal on")
    .replace(/\bboasts top benchmark scores\b/gi, "achieves top benchmark results")
    .replace(/\bboasts\b/gi, "features")
    .replace(/\bunder the hood\b/gi, "internally")
    .replace(/\bhands-on\b/gi, "practical experience")
    .replace(/\bcool again with younger generations\b/gi, "popular again among younger generations")
    .replace(/\bcool with younger generations\b/gi, "popular among younger generations")
    .replace(/\bstuck around\b/gi, "remained popular")
    .replace(/\bnever looked back\b/gi, "continued using them")
    .replace(/\bkill pointless meetings\b/gi, "cancel unnecessary meetings")
    .replace(/\bkilling pointless meetings\b/gi, "canceling unnecessary meetings")
    .replace(/\bhigh-stakes gamble\b/gi, "major strategic investment")
    .replace(/\bbig, expensive gamble\b/gi, "major, costly strategic move")
    .replace(/\bstep function leap\b/gi, "significant leap forward")
    .replace(/\bwell underway\b/gi, "actively progressing")
    .replace(/\s*(?:more…|more\.\.\.|Read more|Continue reading)\s*$/gi, "")
    .trim();
}

// Clean and polish Kurdish text for natural human Sorani grammar, typography, and tech accuracy
export function cleanTechTermsInKurdish(text: string): string {
  if (!text) return "";
  let cleaned = text
    // Normalize Kurdish alphabet
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ة/g, "ە")
    // Fix common awkward machine-translation idioms into natural Sorani Kurdish
    .replace(/کڕینی بەپێ/g, "کڕینی ڕاستەوخۆ لە فرۆشگاکاندا")
    .replace(/کڕین بە شێوەی ڕۆیشتن/g, "کڕینی ڕاستەوخۆ لە فرۆشگاکاندا")
    .replace(/بە شێوەی ڕۆیشتن/g, "ڕاستەوخۆ لە فرۆشگاکاندا")
    .replace(/مۆدێلی شکستخواردوو/g, "مۆدێلی بنەڕەتی (Default)")
    .replace(/پێشوەختە لە ئەنترۆپیک/g, "مۆدێلی بنەڕەتی لەبری ئەنترۆپیک")
    .replace(/دەکاتە پێشوەختە/g, "دەکاتە هەڵبژاردەی بنەڕەتی")
    .replace(/مۆدێلی پێشوەختە/g, "مۆدێلی بنەڕەتی")
    .replace(/لە کاتی نمایشکردنیدا/g, "لە کاتی خستنەبازاڕیدا")
    .replace(/ڕۆژی نمایشکردنیدا|لە ڕۆژی نمایشکردن|ڕۆژی نمایشکردن/g, "ڕۆژی خستنەبازاڕیدا")
    .replace(/نیگەرانییەکانی لە خراپکردن|نیگەرانییەکانی داتاکانی ڕاهێنانی خراپکردن/g, "نیگەرانییەکان دەربارەی کۆکردنەوەی داتا")
    .replace(/ڕاهێنانی AI/g, "ڕاهێنانی زیرەکی دەستکرد (AI)")
    .replace(/دۆکیۆمێنتاریی|دیکۆمێنتاریی/g, "فیلمی دۆکیۆمێنتاری")
    .replace(/فیلمی\s+فیلمی/g, "فیلمی")
    .replace(/برۆکان بەرز ببنەوە/g, "جێگەی سەرسوڕمان بێت")
    .replace(/فێنک و ساردن/g, "سەرنجڕاکێش و باون")
    .replace(/کوشتنی کۆبوونەوە/g, "هەڵوەشاندنەوەی کۆبوونەوە")
    .replace(/قومارە گەورە و گرانبەهای/g, "هەنگاوە ستراتیژی و گەورەکەی")
    .replace(/شانازی بە نمرەی سەرەوەی پێوەرەکانەوە دەکات/g, "لە تاقیکردنەوە پێوانەییەکاندا بەرزترین نمرەی تۆمار کردووە")
    .replace(/کۆمپانیای Gemini/g, "مۆدێلی Gemini")
    // Clean up spacing around Kurdish punctuation
    .replace(/\s+،/g, "،")
    .replace(/،([^\s])/g, "، $1")
    .replace(/\s+\./g, ".")
    .replace(/\s*(?:more…|more\.\.\.|زیاتر…|زیاتر\.\.\.)\s*$/gi, "")
    .replace(/-\s*کەی ئای تی ئێن/g, "")
    .replace(/-\s*رووداو/g, "")
    .replace(/_\s*دەزگاى[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

// Call Google's Sorani Kurdish Neural translation endpoint
export async function translateSentenceToSorani(text: string): Promise<string | null> {
  if (!text || text.trim().length === 0) return null;

  const preProcessed = preProcessEnglishText(text);
  const clients = ["dict-chrome-ex", "webapp"];

  for (const client of clients) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=en&tl=ckb&dt=t&q=${encodeURIComponent(
        preProcessed
      )}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedRaw = data[0].map((segment: any) => segment[0]).join("");
        if (translatedRaw && translatedRaw.length > 2) {
          const polished = cleanTechTermsInKurdish(translatedRaw);
          if (/[\u0600-\u06FF]/.test(polished)) {
            return polished;
          }
        }
      }
    } catch (err: any) {
      console.warn(`Translation attempt with client ${client} failed:`, err.message);
    }
  }

  return null;
}

// Extract specific entities, numbers, specs and real highlights from the story
export function extractStoryMetricsAndDetails(item: RawNewsItem): {
  metrics: string[];
  companies: string[];
  people: string[];
  products: string[];
  price?: string;
  specs: string[];
  quotes: string[];
} {
  const fullText = `${item.title} ${item.snippet} ${(item.contentParagraphs || []).join(" ")}`;
  const metrics: string[] = [];
  const specs: string[] = [];
  const companies: string[] = [];
  const people: string[] = [];
  const products: string[] = [];
  const quotes: string[] = [];

  for (const ent of TECH_ENTITIES) {
    const regex = new RegExp(`\\b${ent.en}\\b`, "i");
    if (regex.test(fullText)) {
      if (ent.type === "company" && !companies.includes(ent.ku)) {
        companies.push(ent.ku);
      } else if (ent.type === "person" && !people.includes(ent.ku)) {
        people.push(ent.ku);
      } else if (ent.type === "product" && !products.includes(ent.ku)) {
        products.push(ent.ku);
      }
    }
  }

  const priceMatches = fullText.match(
    /\$[\d,]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M))?|€[\d,]+|£[\d,]+/gi
  );
  const price = priceMatches ? priceMatches[0] : undefined;
  if (price) {
    metrics.push(`بەها / تێچوو: ${price}`);
  }

  const percentMatches = fullText.match(
    /\b\d+%\s*(?:faster|increase|boost|more|reduction|gain|drop)?|\b\d+(?:\.\d+)?x\s*(?:faster|more|performance|boost)?/gi
  );
  if (percentMatches) {
    Array.from(new Set(percentMatches))
      .slice(0, 2)
      .forEach((p) => metrics.push(`ڕێژەی گۆڕانکاری: ${p.trim()}`));
  }

  const specPatterns = [
    /\b\d+\s*nm\b/gi,
    /\b\d+\s*Hz\b/gi,
    /\b\d+\s*MP\b/gi,
    /\b\d+(?:,\d+)?\s*mAh\b/gi,
    /\b\d+\s*GB(?:\s*(?:RAM|VRAM|HBM3e|memory))?\b/gi,
    /\b\d+\s*TB\b/gi,
    /\b\d+\s*W(?:\s*charging)?\b/gi,
  ];

  for (const pattern of specPatterns) {
    const match = pattern.exec(fullText);
    if (match && !specs.includes(match[0])) {
      specs.push(match[0]);
    }
  }

  if (specs.length > 0) {
    metrics.push(`تایبەتمەندی تەکنیکی: ${specs.slice(0, 4).join(" • ")}`);
  }

  const quoteMatches = fullText.match(/“([^”]{15,140})”|"([^"]{15,140})"/g);
  if (quoteMatches) {
    quoteMatches.slice(0, 2).forEach((q) => {
      const cleanQuote = q.replace(/^[“"]|[”"]$/g, "").trim();
      if (cleanQuote.length > 15) quotes.push(cleanQuote);
    });
  }

  return { metrics, companies, people, products, price, specs, quotes };
}

function classifyArticleCategory(
  item: RawNewsItem
): "ai" | "mobile" | "gaming" | "hardware" | "kurdistan" | "science" {
  const titleAndTags = `${item.title} ${(item.feedTags || []).join(" ")}`.toLowerCase();
  const fullText = `${titleAndTags} ${item.snippet}`.toLowerCase();

  if (
    titleAndTags.includes("iphone") ||
    titleAndTags.includes("ios") ||
    titleAndTags.includes("ipad") ||
    titleAndTags.includes("galaxy") ||
    titleAndTags.includes("android") ||
    titleAndTags.includes("pixel") ||
    titleAndTags.includes("smartphone")
  ) {
    return "mobile";
  }

  if (
    titleAndTags.includes("macbook") ||
    titleAndTags.includes("imac") ||
    titleAndTags.includes("mac mini") ||
    titleAndTags.includes("oled") ||
    titleAndTags.includes("gpu") ||
    titleAndTags.includes("nvidia") ||
    titleAndTags.includes("rtx") ||
    titleAndTags.includes("chip") ||
    titleAndTags.includes("processor") ||
    titleAndTags.includes("tsmc") ||
    titleAndTags.includes("qualcomm") ||
    titleAndTags.includes("intel") ||
    titleAndTags.includes("amd") ||
    titleAndTags.includes("earbuds") ||
    titleAndTags.includes("headphones")
  ) {
    return "hardware";
  }

  if (
    titleAndTags.includes("playstation") ||
    titleAndTags.includes("xbox") ||
    titleAndTags.includes("nintendo") ||
    titleAndTags.includes("steam") ||
    /\bgaming\b|\bgame\b/i.test(titleAndTags)
  ) {
    return "gaming";
  }

  if (
    titleAndTags.includes("spacex") ||
    titleAndTags.includes("starlink") ||
    titleAndTags.includes("nasa") ||
    titleAndTags.includes("satellite") ||
    titleAndTags.includes("science") ||
    titleAndTags.includes("study") ||
    titleAndTags.includes("research")
  ) {
    return "science";
  }

  if (
    /\bai\b/i.test(fullText) ||
    fullText.includes("openai") ||
    fullText.includes("anthropic") ||
    fullText.includes("claude") ||
    fullText.includes("chatgpt") ||
    fullText.includes("gemini") ||
    fullText.includes("deepseek") ||
    /\bllm\b/i.test(fullText)
  ) {
    return "ai";
  }

  return item.categorySlug;
}

// Built-in Full-Essay Kurdish Translation Engine (Translates the real source paragraphs directly without repetitive templates)
export async function translateWithNeuralKurdishEngine(
  rawItem: RawNewsItem
): Promise<TranslatedArticleDraft> {
  // 1. Fetch full article paragraphs from the original source URL if RSS only had a short teaser
  const item = await enrichRawNewsItemWithFullArticle(rawItem);
  const details = extractStoryMetricsAndDetails(item);
  const categorySlug = classifyArticleCategory(item);
  const categoryName = CATEGORY_NAMES[categorySlug];

  // 2. Prepare all real source paragraphs (up to 6 substantial paragraphs from the original article)
  let sourceParagraphs = (item.contentParagraphs || [])
    .map((p) => p.trim())
    .filter((p) => p.length > 35);

  if (sourceParagraphs.length === 0 && item.snippet) {
    sourceParagraphs = [item.snippet];
  }

  // If the feed/page only had 1 very long block, split it cleanly on sentence boundaries
  if (sourceParagraphs.length === 1 && sourceParagraphs[0].length > 260) {
    const sentences = splitIntoSentencesSafe(sourceParagraphs[0]);
    if (sentences.length >= 4) {
      const third = Math.ceil(sentences.length / 3);
      sourceParagraphs = [
        sentences.slice(0, third).join(" "),
        sentences.slice(third, third * 2).join(" "),
        sentences.slice(third * 2).join(" "),
      ].filter(Boolean);
    } else if (sentences.length >= 2) {
      const mid = Math.ceil(sentences.length / 2);
      sourceParagraphs = [
        sentences.slice(0, mid).join(" "),
        sentences.slice(mid).join(" "),
      ].filter(Boolean);
    }
  }

  // 3. Translate Title and all Source Paragraphs in parallel into natural Sorani Kurdish
  const [translatedTitle, ...translatedParagraphsRaw] = await Promise.all([
    translateSentenceToSorani(item.title),
    ...sourceParagraphs.slice(0, 6).map((p) => translateSentenceToSorani(p)),
  ]);

  const kurdishTitle =
    translatedTitle ||
    `${details.companies[0] || details.products[0] || item.sourceName}: ${item.title}`;

  const contentParagraphs = translatedParagraphsRaw
    .filter((p): p is string => Boolean(p && p.trim().length > 20))
    .map((p) => cleanTechTermsInKurdish(p));

  // Ensure excerpt is a clean, complete 1-2 sentence summary from the first translated paragraph
  const kurdishExcerpt =
    contentParagraphs.length > 0
      ? trimToCompleteSentences(contentParagraphs[0], 340)
      : (await translateSentenceToSorani(item.snippet)) || kurdishTitle;

  if (contentParagraphs.length === 0) {
    contentParagraphs.push(kurdishExcerpt);
  }

  // Add source attribution naturally at the end of the final paragraph without robotic repetition
  const lastIdx = contentParagraphs.length - 1;
  if (lastIdx >= 0 && !contentParagraphs[lastIdx].includes(item.sourceName)) {
    contentParagraphs[lastIdx] = `${contentParagraphs[lastIdx]} (سەرچاوە: ${item.sourceName})`;
  }

  // 4. Build real key takeaways from actual translated sentences / metrics (no generic template bullets)
  const realTakeaways: string[] = [];
  if (contentParagraphs.length > 1) {
    contentParagraphs.slice(0, 3).forEach((p) => {
      const firstSentence = trimToCompleteSentences(p, 160);
      if (firstSentence && !realTakeaways.includes(firstSentence)) {
        realTakeaways.push(firstSentence);
      }
    });
  }
  if (details.metrics.length > 0) {
    realTakeaways.push(...details.metrics.slice(0, 2));
  }

  // 5. Dynamic Tags based on Entities and Category
  const tags: string[] = ["تەکنەلۆژیا", item.sourceName];
  if (details.companies.length > 0) tags.push(...details.companies.slice(0, 2));
  if (details.products.length > 0) tags.push(...details.products.slice(0, 2));
  if (details.people.length > 0) tags.push(...details.people.slice(0, 1));
  if (categorySlug === "ai") tags.push("زیرەکی دەستکرد", "AI");
  if (categorySlug === "mobile") tags.push("مۆبایل", "ئامێری زیرەک");
  if (categorySlug === "hardware") tags.push("ڕەقەواڵە", "چیپسێت");
  if (categorySlug === "gaming") tags.push("یارییە ڤیدیۆییەکان", "گەیمینگ");
  if (categorySlug === "science") tags.push("زانست", "تۆڕ و بۆشایی");

  const uniqueTags = Array.from(new Set(tags)).slice(0, 6);
  const isBreaking = (item.importanceScore || 0) >= 82;

  return {
    title: kurdishTitle,
    excerpt: kurdishExcerpt,
    content: contentParagraphs,
    category: categoryName,
    categorySlug,
    tags: uniqueTags,
    imageUrl: getSafeImageUrl(item.imageUrl, categorySlug, `${item.title} ${item.id}`),
    isBreaking,
    author: {
      name: item.originalAuthor ? `${item.originalAuthor} (${item.sourceName})` : "دەستەی نووسەرانی کوردتێک",
      role: `ڕاپۆرتی وەرگێڕدراو لە ${item.sourceName}`,
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    },
    originalSource: {
      name: item.sourceName,
      url: item.originalLink,
    },
    extractedMetrics: realTakeaways.slice(0, 4),
  };
}

// Gemini AI Translation (When API Key is provided)
async function translateWithGemini(
  rawItem: RawNewsItem,
  apiKey: string
): Promise<TranslatedArticleDraft | null> {
  try {
    const item = await enrichRawNewsItemWithFullArticle(rawItem);
    const details = extractStoryMetricsAndDetails(item);

    const prompt = `You are a senior human journalist and native Sorani Kurdish editor at "KurdTech" (کوردتێک).
Translate and adapt the following technology article from ${item.sourceName} into a complete, natural, fluent, grammatically impeccable Sorani Kurdish (زمانی کوردیی سۆرانیی پاراو و سروشتی) essay that faithfully preserves all details, facts, quotes, and technical explanations from the original source.

Source Metadata:
- Source: ${item.sourceName} (${item.originalLink})
- Author: ${item.originalAuthor || item.sourceName}
- Original Title: ${item.title}
- Full Source Article Paragraphs:
${item.contentParagraphs.join("\n\n")}

STRICT EDITORIAL RULES:
1. Write like a skilled human Kurdish tech journalist. NEVER use repetitive boilerplate templates such as "لە ڕاپۆرتێکی نوێ و وردی ماڵپەڕی جیهانیی..." or "ئەم پێشهاتە بووەتە جێگەی باس و لێکۆڵینەوەی چڕ..." or "تیمی کوردتێک بەردەوام دەبێت...".
2. Translate the actual paragraphs of the source article faithfully into 4 to 6 rich, detailed, well-structured Sorani Kurdish paragraphs ("content" array).
3. Use natural Sorani Kurdish sentence structure, proper izafe (ی / ـی), accurate punctuation, and natural Kurdish equivalents for English idioms.
4. "title": Natural, compelling Sorani Kurdish headline faithful to the original title.
5. "excerpt": 2-3 fluent Kurdish sentences summarizing the core news and why it matters.
6. "keyHighlights": 3-4 specific factual takeaways directly from the article.
7. "categorySlug": One of ["ai", "mobile", "gaming", "hardware", "science"].

Output valid JSON only:
{
  "title": "سەردێڕی کوردی",
  "excerpt": "پوختەی بابەتەکە",
  "content": ["پەرەگرافی یەکەم...", "پەرەگرافی دووەم...", "پەرەگرافی سێیەم...", "پەرەگرافی چوارەم..."],
  "keyHighlights": ["خاڵی یەکەم", "خاڵی دووەم", "خاڵی سێیەم"],
  "categorySlug": "hardware",
  "tags": ["تەکنەلۆژیا", "Apple"],
  "isBreaking": false
}`;

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`Gemini API error (${model}) ${res.status}: ${detail.slice(0, 300)}`);
      return null;
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText);
    const fullContent: string[] = Array.isArray(parsed.content)
      ? parsed.content.map((p: string) => cleanTechTermsInKurdish(p)).filter(Boolean)
      : [];

    if (fullContent.length === 0) return null;

    const catSlug = (parsed.categorySlug || classifyArticleCategory(item)) as
      | "ai"
      | "mobile"
      | "gaming"
      | "hardware"
      | "kurdistan"
      | "science";

    return {
      title: cleanTechTermsInKurdish(parsed.title),
      excerpt: cleanTechTermsInKurdish(parsed.excerpt),
      content: fullContent,
      categorySlug: catSlug,
      category: CATEGORY_NAMES[catSlug] || item.defaultCategory,
      tags: parsed.tags || ["تەکنەلۆژیا", item.sourceName],
      imageUrl: getSafeImageUrl(item.imageUrl, catSlug, `${item.title} ${item.id}`),
      isBreaking: !!parsed.isBreaking,
      author: {
        name: item.originalAuthor ? `${item.originalAuthor} (${item.sourceName})` : "دەستەی نووسەرانی کوردتێک",
        role: `ڕاپۆرتی وەرگێڕدراو لە ${item.sourceName}`,
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      },
      originalSource: {
        name: item.sourceName,
        url: item.originalLink,
      },
      extractedMetrics:
        Array.isArray(parsed.keyHighlights) && parsed.keyHighlights.length > 0
          ? parsed.keyHighlights.map((h: string) => cleanTechTermsInKurdish(h))
          : details.metrics,
    };
  } catch (err: any) {
    console.warn("Gemini translation error, falling back to neural engine:", err.message);
    return null;
  }
}

// Master Translator Function
export async function translateNewsStory(
  item: RawNewsItem,
  geminiApiKey?: string
): Promise<TranslatedArticleDraft> {
  const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    const aiResult = await translateWithGemini(item, apiKey);
    if (aiResult) return aiResult;
  }

  return translateWithNeuralKurdishEngine(item);
}
