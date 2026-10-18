import { Article, Category, MarketPriceItem, VideoItem } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "all", slug: "all", name: "هەموو بابەتەکان", count: 184, description: "نوێترین هەواڵ و بابەتەکانی تەکنەلۆژیا بە کوردی" },
  { id: "ai", slug: "ai", name: "زیرەکی دەستکرد", badge: "گەرم", count: 48, description: "نوێترین مۆدێلەکان، داهێنانەکان و بەکارهێنانی AI" },
  { id: "mobile", slug: "mobile", name: "مۆبایل و تابلێت", count: 62, description: "پێداچوونەوە و هەواڵی ئایفۆن، گالاکسی، شیاومی و هیتر" },
  { id: "reviews", slug: "reviews", name: "پێداچوونەوە و شیکاری", count: 35, description: "تاقیکردنەوەی مەیدانی و تێستی ڕەقەواڵەکان" },
  { id: "gaming", slug: "gaming", name: "یاری و کۆنسۆڵ", count: 39, description: "هەواڵی پلەیستەیشن، ئێکس بۆکس، کۆمپیوتەری گەیمینگ" },
  { id: "kurdistan", slug: "kurdistan", name: "تەکنەلۆژیا لە کوردستان", badge: "تایبەت", count: 24, description: "ستارتئەپەکان، ئینتەرنێت و بازاڕەکانی هەرێمی کوردستان" },
  { id: "science", slug: "science", name: "زانست و بۆشایی", count: 18, description: "دۆزینەوە گەردوونییەکان و زانستە پێشکەوتووەکان" },
];

export const BREAKING_TICKER = [
  "ئەپڵ وەشانی نوێی زیرەکی دەستکردی Apple Intelligence بۆ هەموو بەکارهێنەران لە ڕۆژهەڵاتی ناوەڕاست بەردەست دەکات",
  "نرخی نوێترین مۆبایلەکانی زنجیرەی Galaxy S26 لە بازاڕەکانی هەولێر و سلێمانی ئاشکرا کرا",
  "ئینڤیدیا کارتی گرافیکی RTX 5090 بە تەلارسازی نوێ بۆ گەیمەران نمایش دەکات",
  "یەکەمین کۆنفرانسی ستارتئەپ و زیرەکی دەستکرد بە بەشداری ٤٠ کۆمپانیا لە هەولێر بەڕێوەدەچێت",
  "پڕۆژەی فایبەر ئۆپتیک لە دهۆک و هەڵەبجە دەستی پێکرد و کواڵیتی ئینتەرنێت بەرزدەبێتەوە",
];

export const DEFAULT_EXCHANGE_RATE = 1515; // 1 USD = 1515 IQD

export const ARTICLES: Article[] = [
  {
    id: "iphone-17-pro-max-review-kurdistan",
    title: "پێداچوونەوەی تەواوی ئایفۆن ١٧ پرۆ ماکس؛ ئایا شایەنی کڕینە لە بازاڕەکانی کوردستان؟",
    excerpt:
      "دوای دوو هەفتە تاقیکردنەوەی چڕی کامێرا، پاتری و چیپسێتی A19 Pro لە هەولێر، هەموو خاڵە بەهێز و لاوازەکانی نوێترین مۆبایلی ئەپڵتان بۆ دەخەینە ڕوو.",
    content: [
      "ئەپڵ ئەمساڵ گۆڕانکارییەکی بنەڕەتی لە دیزاین و سیستەمی ساردکەرەوەی ئایفۆن ١٧ پرۆ ماکس ئەنجام داوە. لە تاقیکردنەوە مەیدانییەکانماندا لە ژینگەی گەرمی هاوین و ناوخۆی کوردستان، مۆبایلەکە بە شێوەیەکی بەرچاو بە تەلارسازی ژووری هەڵمی نوێ کەمتر گەرم دەبێت بەراورد بە نەوەکانی پێشوو.",
      "ڕوونمای نوێی Super Retina XDR بە ڕووناکی سەرسوڕهێنەری ٣٢٠٠ نیت وا دەکات لە ژێر تیشکی بەتینی ڕاستەوخۆی خۆردا هەموو دەق و ڕەنگەکان بە تەواوی ڕوون و دەوڵەمەند دەربکەون. کامێرای تێلەفۆتۆی ٤٨ مێگاپیکسڵی تێترابریزمی نوێ دەرفەت دەدات لە هەموو بۆنە و مەودا دوورەکاندا وێنەی زوومی بێ کاڵبوونەوە بگریت.",
      "تەمەنی پاتری بە بەکارهێنانی سکرین و تۆڕی 5G توانی زیاتر لە ١٦ کاتژمێر کارکردنی سەخت بەرگە بگرێت، ئەمەش وا دەکات بۆ بەکارهێنەرانی کوردستان کە ڕۆژانە گەشت دەکەن یان لە دەوامی دەرەکیدان پێویستیان بە پاوەربانک نەبێت.",
      "لە ڕووی نرخ و دەستکەوتنەوە، مۆبایلەکە ئێستا لە هەموو فرۆشگاکانی شەقامی سوڵتان موزەفەر لە هەولێر و بازاڕی مەولەوی لە سلێمانی و ناوەندی دهۆک بەردەستە. پێشنیاری ئێمە ئەوەیە ئەگەر خاوەنی ئایفۆن ١٥ یان ١٤یت، ئەم نوێکردنەوەیە هەنگاوێکی زۆر گەورەیە."
    ],
    category: "پێداچوونەوە و شیکاری",
    categorySlug: "reviews",
    tags: ["Apple", "iPhone 17 Pro", "iOS", "کامێرا", "مۆبایل"],
    author: {
      name: "ئارام کامەران",
      role: "سەرنووسەری بەشی ڕەقەواڵە",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "زیاتر لە ٨ ساڵە لە بواری پشکنین و شیکاری ڕەقەواڵەی زیرەک لە کوردستان دەنووسێت.",
    },
    publishedAt: "٢ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T20:30:00Z",
    readTime: "٨ خولەک",
    views: "١٤.٢ هەزار",
    likesCount: 382,
    commentsCount: 64,
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80",
    featuredPosition: "main",
    isEditorPick: true,
    reviewScore: 9.3,
    pros: [
      "تەمەنی پاتری نایاب (زیاتر لە ١٦ کاتژمێر بەکارهێنانی بەردەوام)",
      "کامێرای تێلەفۆتۆی ٤٨ مێگاپیکسڵ بە کواڵیتی سینەمایی و زوومی ١٠ هێندە",
      "سیستەمی ساردکەرەوەی پێشکەوتوو بۆ یارییە قورسەکان و مۆنتیاژ",
      "ڕوونمای دژە-درەوشانەوە لە ژێر تیشکی خۆردا",
    ],
    cons: [
      "نرخی دەستپێکی بەرز لە بازاڕە ناوخۆییەکان ($1,245)",
      "خێرایی بارگاویکردنەوە لە دوای مۆبایلە ئاڵاهەڵگرەکانی وەک شیاومی و وەنپڵەسە",
    ],
    specs: {
      "ڕوونما": "6.9 ئینج Super Retina XDR OLED, 120Hz ProMotion",
      "پرۆسێسەر": "Apple A19 Pro (3nm)",
      "ڕام و بیرگە": "12GB RAM / 256GB, 512GB, 1TB, 2TB",
      "کامێرای سەرەکی": "48MP Wide + 48MP Ultra-Wide + 48MP Telephoto",
      "پاتری": "4,950 mAh بە بارگاویکردنەوەی 35W بێتەل",
      "کێش": "223 گرام بە چوارچێوەی تیتانیۆمی",
    },
    comments: [
      {
        id: "c1",
        author: "ڕێبین سەردار",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        date: "١ کاتژمێر لەمەوبەر",
        content: "دەستتان خۆش بۆ ئەم پێداچوونەوە وردە! ئایا بیرگەی ٢٥٦ بەسە بۆ ڤیدیۆی ProRes یان ناچارین ٥١٢ بکڕین؟",
        likes: 12,
      },
      {
        id: "c2",
        author: "سۆران فەتاح",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        date: "٤٥ خولەک لەمەوبەر",
        content: "ڕێک خاڵە گرنگەکەتان باس کردووە، کێشەی گەرمبوون لە وەرزی هاویندا گرنگترین خاڵ بوو بۆ ئێمە.",
        likes: 8,
      },
    ],
  },
  {
    id: "kurdish-llm-ai-models-2026",
    title: "شۆڕشی مۆدێلە زمانییە گەورەکان (LLM) بە زمانی کوردی؛ چۆن زیرەکی دەستکرد فێری سۆرانی و کورمانجی کرا؟",
    excerpt:
      "توێژەرانی کورد لە زانکۆکانی کوردستان و جیهان کار لەسەر دروستکردنی داتاسێتی ملیۆنی دەکەن بۆ باشترکردنی تێگەیشتنی زیرەکی دەستکرد لە زمانی کوردی.",
    content: [
      "لە ماوەی ساڵی ڕابردوودا، زمانی کوردی لە نێو گەورە مۆدێلە جیهانییەکانی وەک Gemini و GPT و Claude وەک زمانێکی سەرەکی هەژمار کراوە و گەشەیەکی سەرسوڕهێنەری لە وەرگێڕان، داڕشتنەوە و دەرهێنانی زانیاری تۆمار کردووە.",
      "ئەم پێشکەوتنە لە ئەنجامی هەوڵی خۆبەخشانە و ئەکادیمی چەندین تیمی زمانەوانی و ئەندازیاری کۆمپیوتەر بوو لە هەولێر و سلێمانی، کە توانیان سەدان ملیۆن وشەی ستاندارد، زاراوەی زانستی و فەرهەنگی کوردی بە دیجیتاڵی ئامادە بکەن.",
      "ئێستا چەندین کۆمپانیای ناوخۆیی دەستیان کردووە بە دروستکردنی بۆتی خزمەتگوزاری بەشداربووان بە زمانی کوردی، کە دەتوانێت دەنگی کڕیار لێکبداتەوە و بە کوردی وەڵامی دروست و خێرا بداتەوە."
    ],
    category: "زیرەکی دەستکرد",
    categorySlug: "ai",
    tags: ["AI", "Kurdish LLM", "ChatGPT", "Gemini", "زمان"],
    author: {
      name: "ژیار نەوزاد",
      role: "توێژەری زیرەکی دەستکرد",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "ماستەر لە ئەندازیاری داتا و ژیری دەستکرد لە زانکۆی سەلاحەدین.",
    },
    publishedAt: "٣ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T19:30:00Z",
    readTime: "٦ خولەک",
    views: "٩.٨ هەزار",
    likesCount: 245,
    commentsCount: 41,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=80",
    featuredPosition: "top-left",
    isEditorPick: true,
  },
  {
    id: "fiber-optic-5g-kurdistan-report",
    title: "ڕاپۆرتی تایبەت: داهاتووی ئینتەرنێتی 5G و فایبەر ئۆپتیک لە شارەکانی هەرێمی کوردستان",
    excerpt:
      "بەراوردێکی وردی خێرایی، پینگ و نرخی پاکێجەکانی ئینتەرنێت لە هەولێر، سلێمانی، دهۆک و هەڵەبجە لە ساڵی ٢٠٢٦دا.",
    content: [
      "ژێرخانی ئینتەرنێتی فایبەر ئۆپتیک (FTTH) لە ساڵی ٢٠٢٦دا زیاتر لە ٧٠٪ی گەڕەکەکانی ناوەندی شارە گەورەکانی کوردستانی گرتووەتەوە. بەڵام پرسیاری بەردەوامی بەکارهێنەران لەسەر جێگیری پەیوەندی، پینگ بۆ یارییە ئۆنلاینەکان و کێبڕکێی نرخەکانە.",
      "بەپێی تاقیکردنەوە مەیدانییە بەردەوامەکانی ماڵپەڕی کوردتێک، تێکڕای خێرایی داگرتن گەیشتووەتە سەرووی ١٥٠ مێگابیت لە چرکەیەکدا، و پینگی یارییەکانی وەک PUBG و Valorant و FIFA لە سێرڤەرەکانی ئەوروپا و کەنداو بۆ ٣٥ تا ٥٥ میلی چرکە دابەزیوە.",
      "ڕاپۆرتەکە هاوکات تیشک دەخاتە سەر پێشبڕکێی کۆمپانیاکانی پەیوەندی بۆ وەرگرتنی لایسێنسی فەرمی 5G و چۆنیەتی کاریگەرییەکەی لەسەر شۆڕشی ئینتەرنێتی مۆبایل."
    ],
    category: "تەکنەلۆژیا لە کوردستان",
    categorySlug: "kurdistan",
    tags: ["ئینتەرنێت", "فایبەر ئۆپتیک", "5G", "کوردستان", "خێرایی"],
    author: {
      name: "سارا محەمەد",
      role: "پەیامنێری تەکنەلۆژیا",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      bio: "پەیامنێری ئابووری دیجیتاڵی و ژێرخانی پەیوەندییەکان لە هەرێمی کوردستان.",
    },
    publishedAt: "٥ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T17:30:00Z",
    readTime: "٥ خولەک",
    views: "١٩.٥ هەزار",
    likesCount: 512,
    commentsCount: 93,
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop&q=80",
    featuredPosition: "bottom-right",
    isEditorPick: true,
  },
  {
    id: "galaxy-s26-ultra-vs-iphone-17-pro",
    title: "بەراوردی کامێرای گالاکسی S26 Ultra و ئایفۆن ١٧ پرۆ ماکس؛ کامیان شایەنی نازناوی پاشای مۆبایلەکانە؟",
    excerpt:
      "تاقیکردنەوەی وێنەگرتن لە شەو و ڕۆژدا، زوومی ١٠٠ هێندە و تۆمارکردنی ڤیدیۆی 8K لە نێوان دوو زەبەلاحەکەی جیهانی تەکنەلۆژیا.",
    content: [
      "سامسۆنگ بە پەرەپێدانی هەستەوەری ٢٠٠ مێگاپیکسڵی ISOCELL و پشتگیری تەواوی مۆدێلی Galaxy AI بۆ دەستکاریکردنی ڕاستەوخۆی وێنەکان هاتووەتە گۆڕەپانەکەوە. لە لایەکی ترەوە ئەپڵ بە پرۆسێسکردنی سروشتی وێنە و تایبەتمەندی ڕەنگی سینەمایی خۆی دەپارێزێت.",
      "لە تاقیکردنەوەکانی شەوانەدا لە ژێر ڕووناکیی تەمومژاوی شەقامەکانی هەولێر، گالاکسی ڕووناکی زیاتر وەردەگرێت بەڵام هەندێک جار دەستکارییەکی دەستکرد پێوە دیارە. لە بەرامبەردا ئایفۆن باڵانسی ڕەنگی ڕاستەقینە دەپارێزێت.",
      "ئەگەر کارەکەت پەیوەستە بە بەرهەمهێنانی ڤیدیۆ بۆ تیکتۆک، یوتوب و ئینستاگرام، ئایفۆن هێشتا بەربەستی سەرەکی شکاندووە، بەڵام بۆ زووم و نیشاندانی وردەکاری ژمارە پلێت یان بۆنەی وەرزشی گالاکسی بێهاوتایە."
    ],
    category: "مۆبایل و تابلێت",
    categorySlug: "mobile",
    tags: ["Samsung", "Apple", "Galaxy S26", "Camera", "بەراورد"],
    author: {
      name: "بەڵێن کاروان",
      role: "شارەزای مۆبایل",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "پێداچوونەوەکاری سەرەکی مۆبایلە ئەندرۆید و ئایفۆنەکان.",
    },
    publishedAt: "٦ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T16:30:00Z",
    readTime: "١٠ خولەک",
    views: "١١.٣ هەزار",
    likesCount: 298,
    commentsCount: 52,
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=900&auto=format&fit=crop&q=80",
    featuredPosition: "bottom-left",
    reviewScore: 9.4,
    pros: [
      "ڕوونمای دژە-درەوشانەوەی بێهاوتای Corning Gorilla Armor 2",
      "سیستەمی زوومی ئۆپتیکاڵ تا ١٠٠ هێندە بە کواڵیتی باوەڕپێنەکراو",
      "قەڵەمی S-Pen ی نوێ بە تایبەتمەندی زیرەکی دەستکرد",
    ],
    cons: [
      "قەبارەی گەورە و قورسایی لە گیرفاندا",
      "نرخی فرۆشتنەوە لە بازاڕی دەستی دوو هێشتا کەمترە لە ئایفۆن",
    ],
  },
  {
    id: "gta-6-pc-console-performance-analysis",
    title: "شیکاری تەکنیکی یاری GTA VI؛ ئایا کۆنسۆڵەکانی PS5 Pro دەتوانن بە ٦٠ چوارچێوە لە چرکەیەکدا بیشەپۆلێنن؟",
    excerpt:
      "نوێترین زانیارییەکان لەسەر بزوێنەری گرافیکی RAGE 9 و قەبارەی نەخشەی یارییەکە و کاتی بڵاوبوونەوەی وەشانی کۆمپیوتەر.",
    content: [
      "ڕۆکستار گەیمز لە یاری GTA VI دا تەکنەلۆژیای تیشکهاوێژی جیهانی (Ray Tracing Global Illumination) و کارلێکی فیزیکی ئاو و ئۆتۆمبێلی گەیاندووەتە لوتکەی پیشەسازییەکە.",
      "بەپێی تاقیکردنەوە سەرەتاییەکانی Digital Foundry لەسەر کۆنسۆڵی نوێی PS5 Pro بە پشتبەستن بە تەکنەلۆژیای PSSR، یارییەکە توانای هەیە بە دۆخی 60fps لەگەڵ ڕوونی داینامیکی کار بکات، لە کاتێکدا لە کۆنسۆڵی ئاساییدا پێدەچێت لەسەر ٣٠ چوارچێوە جێگیر بێت.",
      "بۆ گەیمەرانی کوردستان، قەبارەی دابەزاندنی یارییەکە زیاتر لە ١٨٠ گێگابایت دەبێت و پێویستە لە ئێستاوە ئامادەکاری بۆ فراوانکردنی بیرگەی SSD ی کۆنسۆڵەکانیان بکەن."
    ],
    category: "یاری و کۆنسۆڵ",
    categorySlug: "gaming",
    tags: ["GTA 6", "PS5 Pro", "Rockstar", "Gaming", "گرافیک"],
    author: {
      name: "دیار عەلی",
      role: "سەرنووسەری گەیمینگ",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "٨ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T14:30:00Z",
    readTime: "٧ خولەک",
    views: "٢٢.١ هەزار",
    likesCount: 680,
    commentsCount: 118,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "rtx-5090-nvidia-blackwell-review",
    title: "کارتی گرافیکی RTX 5090 لە تاقیکردنەوەی ڕاستەقینەدا؛ پاشای نوێی گەیمینگ و مۆدێلەکانی AI",
    excerpt:
      "تاقیکردنەوەی تەلارسازی نوێی Blackwell لەگەڵ بیرگەی 32GB GDDR7 لە ڕوونی 4K و 8K؛ ئایا گەیمەرانی کوردستان پێویستیان بە گۆڕینی پاوەر سەپلای هەیە؟",
    content: [
      "ئینڤیدیا بە کارتی RTX 5090 سنورەکانی ئەدای گرافیکی تێپەڕاندووە. لە تاقیکردنەوەکانی ڕێندەرینگی 3D و ڕاهێنانی مۆدێلە بچووکەکانی زیرەکی دەستکرد، ئەم کارتە زیاتر لە ٦٥٪ خێراترە لە نەوەی پێشووی خۆی.",
      "خاڵی سەرەکی ئەوەیە کە بەکارهێنانی وزەی کارتەکە لە هەندێک حاڵەتدا دەگاتە سەرووی ٥٥٠ وات، ئەمەش بەو مانایەیە کە پێویستت بە پاوەر سەپلای لانیکەم ١٠٠٠ وات دەبێت بۆ ئەوەی بە سەلامەتی کار بکات.",
      "نرخی ئەم کارتە لە بازاڕەکانی کۆمپیوتەری هەولێر لە نزیکەی ٢,١٠٠ دۆلارەوە دەست پێدەکات و زیاتر بۆ ستۆدیۆکانی دیزاین و گەیمەرە پرۆفیشناڵەکان بەرهەمهێنراوە."
    ],
    category: "پێداچوونەوە و شیکاری",
    categorySlug: "reviews",
    tags: ["Nvidia", "RTX 5090", "GPU", "PC Master Race", "ڕەقەواڵە"],
    author: {
      name: "ئارام کامەران",
      role: "سەرنووسەری بەشی ڕەقەواڵە",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "٩ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T13:30:00Z",
    readTime: "٨ خولەک",
    views: "١٦.٣ هەزار",
    likesCount: 395,
    commentsCount: 44,
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    reviewScore: 9.6,
    pros: [
      "ئەدای خەیاڵی لە 4K Max Settings و هەموو یارییە قورسەکاندا",
      "بیرگەی 32GB GDDR7 بە پەردەیەکی پەیوەندی سەرسوڕهێنەر",
      "پشتگیری DLSS 4 بە زیرەکی دەستکردی پێشکەوتوو",
    ],
    cons: [
      "تێچووی زۆر بەرز کە لە دەسەڵاتی هەموو کەسێکدا نییە",
      "کێشی قورس و بەکارهێنانی زۆری وزە کە گەرمییەکی زۆر دروست دەکات",
    ],
  },
  {
    id: "best-laptops-for-students-kurdistan-2026",
    title: "ڕێبەری کڕینی باشترین لاپتۆپ بۆ خوێندکاران و پرۆگرامسازان لە کوردستان (لە ٤٠٠$ تا ١٢٠٠$)",
    excerpt:
      "لیستی باشترین لاپتۆپەکانی Lenovo، ASUS، HP و MacBook بەپێی بودجە و نرخی بازاڕەکانی هەرێم لەگەڵ ڕێنمایی هەڵبژاردنی بیرگە و پرۆسێسەر.",
    content: [
      "ئەگەر خوێندکاری زانکۆیت لە بەشەکانی کۆمپیوتەر، تەلارسازی، پزیشکی یان دیزاین، کڕینی لاپتۆپێک کە بە لایەنی کەمەوە ٤ ساڵ بە بێ کێشە لەگەڵتدا بمێنێتەوە هەنگاوێکی چارەنووسسازە.",
      "لە پلەی یەکەمی بودجەی مامناوەند (٦٠٠$ - ٨٠٠$)، زنجیرەی ASUS Vivobook و Lenovo ThinkBook بە چیپەکانی Ryzen AI باشترین کارامەیی و تەمەنی پاتری پێشکەش دەکەن.",
      "بۆ ئەو کەسانەی کار لەسەر کۆدین و بەرنامەسازی دەکەن، مەکبووک ئەیر M3 یان M4 بە هێزی بێدەنگ و پاتری ١٨ کاتژمێری و شاشەی نایاب بەهای هەموو سەنتێکی هەیە."
    ],
    category: "پێداچوونەوە و شیکاری",
    categorySlug: "reviews",
    tags: ["لاپتۆپ", "MacBook", "ASUS", "Lenovo", "خوێندکاران"],
    author: {
      name: "ئارام کامەران",
      role: "سەرنووسەری بەشی ڕەقەواڵە",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "١٠ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T12:30:00Z",
    readTime: "٩ خولەک",
    views: "١٥.٧ هەزار",
    likesCount: 340,
    commentsCount: 37,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    reviewScore: 8.9,
  },
  {
    id: "james-webb-exoplanet-discovery",
    title: "تەلەسکۆپی جەیمس وێب بەرگەهەوای هەسارەیەکی هاوشێوەی زەوی لە دەرەوەی کۆمەڵەی خۆر دەدۆزێتەوە",
    excerpt:
      "ئاماژە سەرەتاییەکان بوونی هەڵمی ئاو و گازی دوانەئۆکسیدی کاربۆن لەسەر هەسارەکە پشتڕاست دەکەنەوە کە دەکرێت ئاماژەیەک بێت بۆ بوونی ژیان.",
    content: [
      "ئاژانسی ناسا و ئاژانسی بۆشایی ئەوروپا ڕایانگەیاند کە داتا شەبەنگییەکانی تەلەسکۆپی جەیمس وێب شیکارییەکی بێوێنەی بۆ هەسارەی دەرەکی K2-18b تۆمار کردووە.",
      "ئەم هەسارەیە لە کەمەربەندی گونجاو بۆ ژیان بە دەوری ئەستێرەکەی دەسوڕێتەوە و هەڵگری بەڵگەی بەهێزە لەسەر بوونی ئۆقیانووسێکی گەورە لە ژێر بەرگەهەواکەیدا.",
      "ئەم دۆزینەوەیە تێڕوانینی مرۆڤایەتی بۆ گەردوون و ئەگەری دۆزینەوەی شارستانیەت و ژیانی تر لە دەرەوەی زەوی دەباتە قۆناغێکی نوێوە."
    ],
    category: "زانست و بۆشایی",
    categorySlug: "science",
    tags: ["ناسا", "جەیمس وێب", "بۆشایی", "ئەستێرەناسی", "زانست"],
    author: {
      name: "ژیار نەوزاد",
      role: "توێژەری زانستی",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "١٢ کاتژمێر لەمەوبەر",
    publishedDateIso: "2026-10-17T10:30:00Z",
    readTime: "٤ خولەک",
    views: "٧.٤ هەزار",
    likesCount: 182,
    commentsCount: 19,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "kurdistan-startups-fintech-ecosystem",
    title: "ڕێنێسانسی فینتێک و پارەدانی ئەلیکترۆنی لە کوردستان؛ ئایا پارەی کاش ماڵئاوایی دەکات؟",
    excerpt:
      "بەربڵاوبوونی خێرای کارتی بانکی، کیوکۆد و ئەپڵیکەیشنە داراییەکان لە مارکێت و کافێ و بەنزینخانەکانی هەرێم چۆن ئابووری دەگۆڕن؟",
    content: [
      "لە ماوەی دوو ساڵی ڕابردوودا بە هەوڵی بەردەوامی بانکە ناوخۆییەکان و بانکی ناوەندی و پڕۆژەی 'هەژماری من'، کلتووری پارەدانی دیجیتاڵی لە هەرێمی کوردستان لە چەند لەسەدێکەوە بۆ سەرووی ٤٥٪ گەشەی کردووە.",
      "ئێستا زۆربەی سوپەرمارکێتەکان، فرۆشگاکانی جلوبەرگ و بەنزینخانەکانی هەولێر، سلێمانی و دهۆک ئامێرەکانی POSیان داناوە و خەڵک زیاتر پشتبەستن بە کارتی ئەلیکترۆنی هەڵدەبژێرن بەهۆی ئاسانی و پارێزراوی لە دزین.",
      "هاوکات ستارتئەپە کوردییەکان دەستیان کردووە بە دروستکردنی پردی پارەدانی ئۆنلاین (Payment Gateway) بۆ ئەوەی خاوەن کارەکان بتوانن لە ناو ماڵپەڕ و ئەپەکانیان راستەوخۆ پارە لە کڕیاران وەربگرن."
    ],
    category: "تەکنەلۆژیا لە کوردستان",
    categorySlug: "kurdistan",
    tags: ["فینتێک", "هەژماری من", "بانک", "کوردستان", "ستارتئەپ"],
    author: {
      name: "سارا محەمەد",
      role: "پەیامنێری تەکنەلۆژیا",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "١ ڕۆژ لەمەوبەر",
    publishedDateIso: "2026-10-16T18:00:00Z",
    readTime: "٦ خولەک",
    views: "١٣.٨ هەزار",
    likesCount: 421,
    commentsCount: 56,
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
  },
];

export const KURDISTAN_MARKET_PRICES: MarketPriceItem[] = [
  { id: "p1", name: "iPhone 17 Pro Max (256GB)", category: "phone", brand: "Apple", priceUSD: 1245, change: "-$15", trend: "down", storage: "256GB", color: "تیتانیۆمی سروشتی", updatedAt: "ئەمڕۆ" },
  { id: "p2", name: "iPhone 17 Pro (128GB)", category: "phone", brand: "Apple", priceUSD: 1045, change: "-$10", trend: "down", storage: "128GB", color: "ڕەش / شین", updatedAt: "ئەمڕۆ" },
  { id: "p3", name: "iPhone 17 (128GB)", category: "phone", brand: "Apple", priceUSD: 820, change: "جێگیر", trend: "neutral", storage: "128GB", color: "سپی / پەمەیی", updatedAt: "دوێنێ" },
  { id: "p4", name: "Samsung Galaxy S26 Ultra (256GB)", category: "phone", brand: "Samsung", priceUSD: 1180, change: "جێگیر", trend: "neutral", storage: "256GB", color: "خۆڵەمێشی تیتانیۆم", updatedAt: "ئەمڕۆ" },
  { id: "p5", name: "Samsung Galaxy S26 (256GB)", category: "phone", brand: "Samsung", priceUSD: 790, change: "-$25", trend: "down", storage: "256GB", color: "سەوز / ڕەش", updatedAt: "ئەمڕۆ" },
  { id: "p6", name: "Xiaomi 15 Pro (512GB)", category: "phone", brand: "Xiaomi", priceUSD: 790, change: "-$20", trend: "down", storage: "512GB", color: "زیوی شین", updatedAt: "دوێنێ" },
  { id: "p7", name: "MacBook Air M4 (13-inch, 16GB)", category: "laptop", brand: "Apple", priceUSD: 1050, change: "+$10", trend: "up", storage: "256GB SSD", color: "Space Gray", updatedAt: "ئەمڕۆ" },
  { id: "p8", name: "MacBook Pro M4 Pro (14-inch)", category: "laptop", brand: "Apple", priceUSD: 1890, change: "جێگیر", trend: "neutral", storage: "512GB SSD", color: "Space Black", updatedAt: "دوێنێ" },
  { id: "p9", name: "PlayStation 5 Pro (2TB)", category: "console", brand: "Sony", priceUSD: 685, change: "-$15", trend: "down", storage: "2TB SSD", color: "سپی کلاسیک", updatedAt: "ئەمڕۆ" },
  { id: "p10", name: "Xbox Series X (1TB Digital)", category: "console", brand: "Microsoft", priceUSD: 460, change: "جێگیر", trend: "neutral", storage: "1TB SSD", color: "سپی ڕۆبۆت", updatedAt: "٣ ڕۆژ لەمەوبەر" },
  { id: "p11", name: "Nvidia GeForce RTX 5090 (32GB)", category: "gpu", brand: "Nvidia", priceUSD: 2150, change: "-$50", trend: "down", storage: "32GB GDDR7", color: "Founders Edition", updatedAt: "ئەمڕۆ" },
  { id: "p12", name: "iPad Pro M4 (11-inch OLED)", category: "tablet", brand: "Apple", priceUSD: 940, change: "-$10", trend: "down", storage: "256GB", color: "Silver", updatedAt: "دوێنێ" },
];

export const VIDEO_REVIEWS: VideoItem[] = [
  {
    id: "v1",
    title: "تاقیکردنەوەی مەیدانی ئایفۆن ١٧ پرۆ ماکس لە قەڵای هەولێر",
    duration: "١٤:٢٠",
    views: "٣٤ هەزار",
    category: "ڤیدیۆ ڕیڤیو",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    description: "لە گەشتێکی دوو ڕۆژە لە قەڵای دێرینی هەولێر، کامێرای سینەمایی، گەرمبوون و باترییەکەی دەخەینە ژێر تاقیکردنەوە.",
  },
  {
    id: "v2",
    title: "چۆن بە کەمترین تێچوو کۆمپیوتەرێکی بەهێزی گەیمینگ لە ٢٠٢٦ کۆبکەینەوە؟",
    duration: "١٨:٠٥",
    views: "٢١ هەزار",
    category: "ڕێبەری کڕین",
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
    description: "ڕێبەری هەنگاو بە هەنگاوی هەڵبژاردنی دایکەبۆرد، پرۆسێسەر، ڕام و کارتی گرافیک بەپێی نرخی بازاڕەکانی پیشەسازی.",
  },
  {
    id: "v3",
    title: "پێداچوونەوەی ئۆتۆمبێلی کارەبایی BYD Seal لە شەقامەکانی سلێمانی",
    duration: "٢٢:٤٠",
    views: "٤٩ هەزار",
    category: "ئۆتۆمبێلی کارەبایی",
    thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80",
    description: "تاقیکردنەوەی مەودای بڕین، سیستەمی ئۆتۆپایلۆت و دەستکەوتنی وێستگەکانی بارگاوی لە سلێمانی و دووکان.",
  },
];

// Helper Functions
export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  if (categorySlug === "all") return ARTICLES;
  return ARTICLES.filter((a) => a.categorySlug === categorySlug);
}

export function getRelatedArticles(currentId: string, categorySlug: string, limit = 3): Article[] {
  const sameCat = ARTICLES.filter((a) => a.id !== currentId && a.categorySlug === categorySlug);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  const others = ARTICLES.filter((a) => a.id !== currentId && a.categorySlug !== categorySlug);
  return [...sameCat, ...others].slice(0, limit);
}

export function getFeaturedArticles() {
  const main = ARTICLES.find((a) => a.featuredPosition === "main") || ARTICLES[0];
  const side = ARTICLES.filter((a) => a.featuredPosition && a.featuredPosition !== "main");
  return { main, side };
}

export function getTrendingArticles(limit = 5): Article[] {
  return [...ARTICLES]
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, limit);
}

export function searchArticles(query: string): Article[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

export function formatIQD(usd: number, rate = DEFAULT_EXCHANGE_RATE): string {
  const total = Math.round(usd * rate);
  return total.toLocaleString("ar-IQ") + " د.ع";
}
