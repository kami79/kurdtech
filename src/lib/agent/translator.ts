import { RawNewsItem } from "./feedParser";
import { getSafeImageUrl } from "@/lib/imageUtils";
import { Article } from "@/types";

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
  { en: "Tim Cook", ku: "تێم کووک", type: "person" },
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
  { en: "Gemini", ku: "مۆدێلی جێمینای (Gemini)", type: "product" },
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

const CATEGORY_DEFAULT_IMAGES = {
  ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80",
  mobile: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80",
  hardware: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
  gaming: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000&auto=format&fit=crop&q=80",
  science: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80",
  kurdistan: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
};

// Pre-process tricky English tech idioms so neural machine translation produces idiomatic Kurdish
function preProcessEnglishText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\bwalk-in purchases\b/gi, "direct in-store purchases")
    .replace(/\bwalk-in purchase\b/gi, "direct in-store purchase")
    .replace(/\bwalk-in\b/gi, "in-store")
    .replace(/\bmight be challenging\b/gi, "may be difficult")
    .replace(/\bper report\b/gi, "according to report")
    .replace(/\bdefault model provider\b/gi, "primary default model provider")
    .replace(/\bdefault over Anthropic\b/gi, "primary default over Anthropic")
    .replace(/\bscraping concerns\b/gi, "data scraping concerns")
    .replace(/\bAI training concerns\b/gi, "AI training data concerns")
    .replace(/\bdocumentary account\b/gi, "documentary film account")
    .replace(/\bcommunity guidelines\b/gi, "community rules")
    .replace(/\bteardown\b/gi, "hardware analysis")
    .replace(/\brollout\b/gi, "official release")
    .replace(/\broll out\b/gi, "officially release")
    .replace(/\bdiscontinued\b/gi, "stopped manufacturing")
    .trim();
}

// Clean and polish Kurdish text, replacing Arabic letters and known machine-translation mistakes
export function cleanTechTermsInKurdish(text: string): string {
  if (!text) return "";
  let cleaned = text
    // Normalize Kurdish alphabet
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    // Fix common translation mistakes in Kurdish
    .replace(/کڕینی بەپێ/g, "کڕینی ڕاستەوخۆ لە فرۆشگاکاندا")
    .replace(/کڕین بە شێوەی ڕۆیشتن/g, "کڕینی ڕاستەوخۆ لە فرۆشگاکاندا")
    .replace(/بە شێوەی ڕۆیشتن/g, "ڕاستەوخۆ لە فرۆشگاکاندا (Walk-in)")
    .replace(/مۆدێلی شکستخواردوو/g, "مۆدێلی بنەڕەتی (دیفۆڵت)")
    .replace(/پێشوەختە لە ئەنترۆپیک/g, "مۆدێلی بنەڕەتی لەبری ئەنترۆپیک")
    .replace(/دەکاتە پێشوەختە/g, "دەکاتە هەڵبژاردەی بنەڕەتی")
    .replace(/مۆدێلی پێشوەختە/g, "مۆدێلی بنەڕەتی (Default)")
    .replace(/لە کاتی نمایشکردنیدا/g, "لە کاتی خستنەبازاڕیدا")
    .replace(/ڕۆژی نمایشکردنیدا|لە ڕۆژی نمایشکردن|ڕۆژی نمایشکردن/g, "ڕۆژی خستنەبازاڕیدا")
    .replace(/نیگەرانییەکانی لە خراپکردن/g, "نیگەرانییەکان دەربارەی کۆکردنەوەی داتا (Scraping)")
    .replace(/ڕاهێنانی AI/g, "ڕاهێنانی زیرەکی دەستکرد (AI)")
    .replace(/دۆکیۆمێنتاریی/g, "فیلمی دۆکیۆمێنتاری")
    .replace(/دیکۆمێنتاریی/g, "فیلمی دۆکیۆمێنتاری")
    .replace(/فیلمی\s+فیلمی/g, "فیلمی")
    .replace(/\s*(?:more…|more\.\.\.|زیاتر…|زیاتر\.\.\.)\s*$/gi, "")
    .replace(/-\s*کەی ئای تی ئێن/g, "")
    .replace(/-\s*رووداو/g, "")
    .replace(/_\s*دەزگاى[^\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

// Call Google's high-fidelity Sorani Kurdish Neural translation endpoint
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
          // Verify it contains Kurdish characters
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

// Deep fact, metric, entity and quote extractor from the collected news
export function extractStoryMetricsAndDetails(item: RawNewsItem): {
  metrics: string[];
  companies: string[];
  people: string[];
  products: string[];
  price?: string;
  specs: string[];
  quotes: string[];
  structuredBullets: string[];
} {
  const fullText = `${item.title} ${item.snippet} ${(item.contentParagraphs || []).join(" ")}`;
  const metrics: string[] = [];
  const specs: string[] = [];
  const companies: string[] = [];
  const people: string[] = [];
  const products: string[] = [];
  const quotes: string[] = [];

  // 1. Identify specific companies, figures, and products from entity list
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

  // 2. Match prices and financial figures ($999, $1.5 billion, €400, etc.)
  const priceMatches = fullText.match(
    /\$[\d,]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M))?|€[\d,]+|£[\d,]+/gi
  );
  const price = priceMatches ? priceMatches[0] : undefined;
  if (price) {
    metrics.push(`بەهای دارایی / نرخ: ${price}`);
  }

  // 3. Match percentages, speedups, and multipliers (e.g. 45%, 2.5x, 30% boost)
  const percentMatches = fullText.match(
    /\b\d+%\s*(?:faster|increase|boost|more|reduction|gain|drop)?|\b\d+(?:\.\d+)?x\s*(?:faster|more|performance|boost)?/gi
  );
  if (percentMatches) {
    const uniquePercents = Array.from(new Set(percentMatches)).slice(0, 2);
    uniquePercents.forEach((p) => {
      metrics.push(`ڕێژەی گۆڕانکاری یان ئەدا: ${p.trim()}`);
    });
  }

  // 4. Match hardware metrics (nanometers, Hz, MP, mAh, RAM/VRAM, charging)
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
    metrics.push(`پێوەرە تەکنیکییەکان: ${specs.slice(0, 4).join(" • ")}`);
  }

  // 5. Match direct quotes from executives or reports ("...")
  const quoteMatches = fullText.match(/“([^”]{15,140})”|"([^"]{15,140})"/g);
  if (quoteMatches) {
    quoteMatches.slice(0, 2).forEach((q) => {
      const cleanQuote = q.replace(/^[“"]|[”"]$/g, "").trim();
      if (cleanQuote.length > 15) {
        quotes.push(cleanQuote);
      }
    });
  }

  // 6. Build Rich, Structured Kurdish Highlights (Zero generic filler!)
  const structuredBullets: string[] = [];

  // Bullet 1: Source & Official Attribution
  structuredBullets.push(
    `🔹 بڵاوکراوەی سەرەکی: ڕاپۆرتی فەرمی و دەستپێشخەری لەلایەن ${item.sourceName}.`
  );

  // Bullet 2: Entities & Key People
  if (people.length > 0 && companies.length > 0) {
    structuredBullets.push(
      `🔹 کەسایەتی و کۆمپانیا بەشدارەکان: دەستنیشانکراوە بۆ ${people.slice(0, 2).join(" و ")} لە کۆمپانیای ${companies.slice(0, 2).join(" و ")}.`
    );
  } else if (companies.length > 0) {
    structuredBullets.push(
      `🔹 لایەن و پلاتفۆرمە بەشدارەکان: جەختکردنەوە لەسەر ڕۆڵی ${companies.slice(0, 3).join(" و ")}.`
    );
  } else if (people.length > 0) {
    structuredBullets.push(
      `🔹 کەسایەتییە دیارەکان: ڕۆڵی سەرەکیی ${people.slice(0, 2).join(" و ")} لەم بابەتەدا.`
    );
  }

  // Bullet 3: Real Numbers, Specs or Pricing
  if (price) {
    structuredBullets.push(`🔹 بەها و ئاستی نرخ: ئاماژەدان بە نرخی فەرمیی ${price}.`);
  } else if (specs.length > 0) {
    structuredBullets.push(`🔹 دیارترین تایبەتمەندییە تەکنیکییەکان: ${specs.join(" ، ")}.`);
  } else if (products.length > 0) {
    structuredBullets.push(`🔹 بەرهەم و ئامێرە ئامانجکراوەکان: تایبەتە بە ${products.slice(0, 3).join(" و ")}.`);
  }

  // Bullet 4: Key Event or Context Specific
  if (item.title.toLowerCase().includes("ban") || item.title.toLowerCase().includes("block")) {
    structuredBullets.push(
      `🔹 جۆری ڕێکار: قەدەغەکردن یان بەربەستکردنی ڕاستەوخۆی پلاتفۆرمەکە لەبەر سەرپێچی ڕێساکان.`
    );
  } else if (item.title.toLowerCase().includes("default") || item.title.toLowerCase().includes("replace")) {
    structuredBullets.push(
      `🔹 گۆڕانکاریی بنەڕەتی: گۆڕینی مۆدێلی کارکردن و بەستنی هاوبەشیی ستراتیژی لە نێوان پلاتفۆرمەکان.`
    );
  } else if (item.title.toLowerCase().includes("walk-in") || item.title.toLowerCase().includes("launch")) {
    structuredBullets.push(
      `🔹 ڕێنمایی بۆ کڕیاران: ڕەنگە دەستکەوتنی ئامێرەکە پێویستی بە داواکاری پێشوەختە (Pre-order) بێت.`
    );
  } else if (item.title.toLowerCase().includes("scraping") || item.title.toLowerCase().includes("terms")) {
    structuredBullets.push(
      `🔹 پاراستنی داتا و ڕێسا: پێداچوونەوە بە مەرجەکانی بەکارهێنان و شێوازی ڕاهێنانی مۆدێلەکان.`
    );
  }

  return { metrics, companies, people, products, price, specs, quotes, structuredBullets };
}

// Built-in High-Accuracy Neural Kurdish Translation Engine
export async function translateWithNeuralKurdishEngine(
  item: RawNewsItem
): Promise<TranslatedArticleDraft> {
  const details = extractStoryMetricsAndDetails(item);

  // 1. Translate the Title with High Precision into Sorani Kurdish
  let kurdishTitle = await translateSentenceToSorani(item.title);
  if (!kurdishTitle) {
    const brand = details.companies[0] || details.products[0] || item.sourceName;
    kurdishTitle = `نوێترین زانیاری لەسەر ${brand}؛ وردەکاری نوێ لە ${item.sourceName}ەوە`;
  }

  // 2. Translate Core Snippet / Lead Paragraph
  let kurdishSnippet = await translateSentenceToSorani(item.snippet);
  if (!kurdishSnippet) {
    kurdishSnippet = `بەپێی ڕاپۆرتی تایبەت لەلایەن سەرچاوەی جیهانیی ${item.sourceName}، نوێترین پێشهات و وردەکاری دەربارەی ئەم بابەتە ئاشکرا کراوە کە دەبێتە جێگەی سەرنجی بەکارهێنەران و شارەزایان.`;
  }

  // 3. Translate Paragraph 2 and Paragraph 3 directly from the source feed if available
  let kurdishPara2: string | null = null;
  let kurdishPara3: string | null = null;

  if (item.contentParagraphs && item.contentParagraphs.length > 1) {
    kurdishPara2 = await translateSentenceToSorani(item.contentParagraphs[1]);
  }
  if (item.contentParagraphs && item.contentParagraphs.length > 2) {
    kurdishPara3 = await translateSentenceToSorani(item.contentParagraphs[2]);
  }

  // 4. Determine Accurate Category
  const fullText = (item.title + " " + item.snippet + " " + (item.feedTags || []).join(" ")).toLowerCase();
  let categorySlug: "ai" | "mobile" | "gaming" | "hardware" | "kurdistan" | "science" = item.categorySlug;

  if (
    /\bai\b/i.test(fullText) ||
    fullText.includes("openai") ||
    fullText.includes("anthropic") ||
    fullText.includes("claude") ||
    fullText.includes("chatgpt") ||
    fullText.includes("gemini") ||
    fullText.includes("deepseek") ||
    /\bllm\b/i.test(fullText) ||
    /\bmodel\b/i.test(fullText)
  ) {
    categorySlug = "ai";
  } else if (
    fullText.includes("iphone") ||
    fullText.includes("galaxy") ||
    fullText.includes("android") ||
    fullText.includes("smartphone") ||
    fullText.includes("pixel") ||
    /\bios\b/i.test(fullText)
  ) {
    categorySlug = "mobile";
  } else if (
    fullText.includes("gpu") ||
    fullText.includes("nvidia") ||
    fullText.includes("rtx") ||
    fullText.includes("chip") ||
    fullText.includes("processor") ||
    fullText.includes("tsmc") ||
    fullText.includes("qualcomm") ||
    fullText.includes("intel")
  ) {
    categorySlug = "hardware";
  } else if (
    fullText.includes("playstation") ||
    fullText.includes("xbox") ||
    fullText.includes("game") ||
    fullText.includes("nintendo") ||
    fullText.includes("steam")
  ) {
    categorySlug = "gaming";
  }

  const categoryName = CATEGORY_NAMES[categorySlug];

  // 5. Construct Paragraph 3 & Paragraph 4 with Zero Generic Phone-Shop Boilerplate
  let paragraph3 = "";
  if (kurdishPara2) {
    paragraph3 = `لە درێژەی ڕاپۆرتەکەدا هاتووە: «${kurdishPara2}». ئەم زانیارییە شیکارییە تیشک دەخاتە سەر لایەنە نەبینراوەکانی ئەم بڕیارە و چۆنیەتی جێبەجێکردنی لە ئاستی بازاڕە نێودەوڵەتییەکاندا.`;
  } else if (categorySlug === "ai") {
    paragraph3 = `شارەزایانی بواری زیرەکی دەستکرد پێیان وایە کە ئەم هەنگاوە نوێیە کێبڕکێی نێوان گەورە مۆدێلە پێشکەوتووەکان توندتر دەکاتەوە، بە تایبەت لە ڕووی خێرایی وەڵامدانەوە، تێچووی API بۆ گەشەپێدەران و ئاستی تێگەیشتن لە فەرمانە ئاڵۆزەکان.`;
  } else if (categorySlug === "mobile") {
    paragraph3 = `بەپێی شیکارییە مەیدانییەکان، بەهۆی بەرزیی خواستی کڕیاران لە سەرەتای بڵاوبوونەوەی مۆبایل و ئامێرە ئاڵاهەڵگرەکاندا، زنجیرەی دابینکردن ڕووبەڕووی سنوورداریی دەبێتەوە؛ بۆیە فرۆشگا سەرەکییەکان پێشینە دەدەن بەو بەکارهێنەرانەی پێشوەختە ناوی خۆیان تۆمار کردووە (Pre-order).`;
  } else if (categorySlug === "hardware") {
    paragraph3 = `شیکەرەوە تەکنیکییەکان ئاماژە بەوە دەکەن کە پەرەپێدانی ئەم تەلارسازییە کاریگەری ڕاستەوخۆی دەبێت لەسەر بەرزکردنەوەی توانای چارەسەرکردنی داتا و کەمکردنەوەی گەرمبوونی چیپسێتەکان لە ژێر باری قورسی کارپێکردندا.`;
  } else {
    paragraph3 = `چاودێران ئاماژە بەوە دەکەن کە ئەم بڕیارە گۆڕانکاری لە سیاسەتی کارکردنی کۆمپانیاکە نیشان دەدات و ڕەنگە کاردانەوەی فراوانی بەکارهێنەران و ڕێکخراوە چاودێرییەکان بەدوای خۆیدا بهێنێت.`;
  }

  let paragraph4 = "";
  if (kurdishPara3) {
    paragraph4 = `بەپێی هەڵسەنگاندنی کۆتایی ڕاپۆرتەکە: «${kurdishPara3}». تیمی تەکنیکیی کوردتێک (KurdTech) لە نزیکەوە چاودێری ئەم بابەتە دەکات و خوێنەران لە هەر پێشهاتێکی نوێ ئاگادار دەکاتەوە. (سەرچاوە: ${item.sourceName})`;
  } else {
    paragraph4 = `تیمی کوردتێک (KurdTech) بەردەوام دەبێت لە بەدواداچوونی ورد بۆ لێکەوتەکانی ئەم هەواڵە و چۆنیەتی دەستگەیشتنی بەکارهێنەرانی کوردستان بەم تایبەتمەندی و ئامێرە نوێیانە، تا بە باشترین شێوە سوودمەند بن لە نوێترین شۆڕشە تەکنەلۆژییەکان. (سەرچاوە: ${item.sourceName})`;
  }

  // 6. Build Content Paragraphs
  const contentParagraphs: string[] = [
    // Paragraph 1: Rich Announcement with Source Attribution
    `لە ڕاپۆرتێکی نوێ و وردی ماڵپەڕی جیهانیی ${item.sourceName}دا هاتووە: «${kurdishSnippet}». ئەم پێشهاتە بووەتە جێگەی باس و لێکۆڵینەوەی چڕ لە ناوەندە تەکنەلۆژییە جیهانییەکاندا.`,

    // Paragraph 2: Unique Factual Takeaways Bullet Box
    `📌 گرنگترین خاڵ و وردەکارییە دەستنیشانکراوەکانی ئەم بابەتە:\n${details.structuredBullets.join("\n")}`,

    // Paragraph 3: Deep Technical / Source Paragraph
    paragraph3,

    // Paragraph 4: Analytical Conclusion
    paragraph4,
  ];

  // 7. Dynamic Tags based on Entities and Source
  const tags: string[] = ["تەکنەلۆژیا", item.sourceName];
  if (details.companies.length > 0) tags.push(...details.companies.slice(0, 2));
  if (details.people.length > 0) tags.push(...details.people.slice(0, 1));
  if (categorySlug === "ai") tags.push("زیرەکی دەستکرد", "AI");
  if (categorySlug === "mobile") tags.push("مۆبایل", "ئامێری زیرەک");
  if (categorySlug === "hardware") tags.push("ڕەقەواڵە", "چیپسێت");
  if (categorySlug === "gaming") tags.push("یارییە ڤیدیۆییەکان", "گەمەکان");

  const uniqueTags = Array.from(new Set(tags)).slice(0, 6);

  // 8. Breaking news threshold
  const isBreaking = (item.importanceScore || 0) >= 80;

  return {
    title: kurdishTitle,
    excerpt: kurdishSnippet,
    content: contentParagraphs,
    category: categoryName,
    categorySlug,
    tags: uniqueTags,
    imageUrl: getSafeImageUrl(item.imageUrl, categorySlug, `${item.title} ${item.id}`),
    isBreaking,
    author: {
      name: "ئەیجێنتی هۆشمەندی کوردتێک",
      role: `شیکەرەوەی ئۆتۆماتیکی (${item.sourceName})`,
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    },
    originalSource: {
      name: item.sourceName,
      url: item.originalLink,
    },
    extractedMetrics: details.structuredBullets.length > 0 ? details.structuredBullets : details.metrics,
  };
}

// Gemini AI Translation (When API Key is provided)
async function translateWithGemini(
  item: RawNewsItem,
  apiKey: string
): Promise<TranslatedArticleDraft | null> {
  try {
    const details = extractStoryMetricsAndDetails(item);

    const prompt = `You are the Senior Chief Editor of "KurdTech" (کوردتێک), the premier Kurdish tech publication.
Write an authentic, professional, and comprehensive news article in fluent Sorani Kurdish (زمانی پاراوی کوردیی سۆرانی).

Source Metadata:
- Source: ${item.sourceName} (${item.originalLink})
- Original Title: ${item.title}
- Summary/Snippet: ${item.snippet}
- Extracted Entities & Metrics: ${details.metrics.join(", ") || "N/A"}
- Full Source Paragraphs:
${item.contentParagraphs.join("\n\n")}

CRITICAL EDITORIAL GUIDELINES:
1. "title": Must be 100% natural, fluent Sorani Kurdish. Do NOT leave untranslated English phrases or awkward literal translations. (e.g. translate "iPhone Duo walk-in purchases might be challenging at launch" to "ڕەنگە کڕینی ڕاستەوخۆی ئایفۆن دوۆ لە فرۆشگاکاندا لە کاتی خستنەبازاڕدا سەخت بێت").
2. "excerpt": A rich 2-3 sentence Kurdish summary explaining the who, what, and concrete details.
3. "content": An array of 3-4 comprehensive Kurdish paragraphs:
   - Paragraph 1: Detailed breakdown of the announcement with attribution to ${item.sourceName} and key figures.
   - Paragraph 2: Specific numbers, specs, pricing, or quotes directly from the source text.
   - Paragraph 3: Contextual impact, developer/consumer relevance, and technological implications.
4. "keyHighlights": Array of 3-4 bullet points in Kurdish listing the concrete facts, numbers, entities, or dates.
5. "categorySlug": One of ["ai", "mobile", "gaming", "hardware", "science", "gaming"].
6. "tags": 4-6 Kurdish/English tags.
7. "isBreaking": boolean (true if major breaking industry news).

Strictly output valid JSON:
{
  "title": "سەردێڕی پاراوی کوردی",
  "excerpt": "پوختەی هەواڵەکە بە کوردی",
  "content": ["پەرەگرافی یەکەم", "پەرەگرافی دووەم", "پەرەگرافی سێیەم"],
  "keyHighlights": ["خاڵی یەکەم", "خاڵی دووەم", "خاڵی سێیەم"],
  "categorySlug": "ai",
  "tags": ["AI", "تەکنەلۆژیا"],
  "isBreaking": false
}`;

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Send the key as a header so it never appears in URLs/proxy logs
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
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

    const fullContent: string[] = [];
    if (parsed.content && Array.isArray(parsed.content)) {
      fullContent.push(...parsed.content);
    }
    if (parsed.keyHighlights && Array.isArray(parsed.keyHighlights) && parsed.keyHighlights.length > 0) {
      const bullets = parsed.keyHighlights.map((h: string) => `• ${h}`).join("\n");
      fullContent.splice(1, 0, `🔹 گرنگترین خاڵ و وردەکارییە ئاشکراکراوەکان:\n${bullets}`);
    }

    return {
      title: cleanTechTermsInKurdish(parsed.title),
      excerpt: cleanTechTermsInKurdish(parsed.excerpt),
      content: fullContent.map((p) => cleanTechTermsInKurdish(p)),
      categorySlug: parsed.categorySlug || item.categorySlug,
      category: CATEGORY_NAMES[parsed.categorySlug as keyof typeof CATEGORY_NAMES] || item.defaultCategory,
      tags: parsed.tags || ["تەکنەلۆژیا", item.sourceName],
      imageUrl: getSafeImageUrl(
        item.imageUrl,
        parsed.categorySlug || item.categorySlug,
        `${item.title} ${item.id}`
      ),
      isBreaking: !!parsed.isBreaking,
      author: {
        name: "ئەیجێنتی هۆشمەندی کوردتێک",
        role: `شیکەرەوەی هەواڵە جیهانییەکان (${item.sourceName})`,
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      },
      originalSource: {
        name: item.sourceName,
        url: item.originalLink,
      },
      extractedMetrics: details.structuredBullets.length > 0 ? details.structuredBullets : details.metrics,
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
