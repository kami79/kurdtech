import { CommunityQuestion } from "@/types";

export const COMMUNITY_QUESTIONS: CommunityQuestion[] = [
  {
    id: "q1",
    title: "چۆن کارتی ئەلیکترۆنی و هەژماری من لەگەڵ Apple Pay یان کیف پول ڕێکبخەم؟",
    details:
      "سڵاو هاوڕێیان، ئایا کەس توانیویەتی کارتی بانکی هەژماری من ڕاستەوخۆ لە ناو مۆبایلی ئایفۆن یان سامسۆنگ کارپێبکات بە بێ ئەوەی کارتەکەی پێبێت؟ چ بانکێک لە کوردستان ئەم خزمەتگوزارییە پێشکەش دەکات؟",
    author: "ڕێباز سەباح",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    city: "هەولێر",
    date: "٢ کاتژمێر لەمەوبەر",
    category: "mobile",
    tags: ["هەژماری من", "بانک", "Apple Pay", "مۆبایل"],
    isSolved: true,
    views: 420,
    upvotes: 38,
    repliesCount: 3,
    replies: [
      {
        id: "r1",
        author: "ئەحمەد فاروق (ئەندازیاری فینتێک)",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        content:
          "لە ئێستادا بانکی FIB و بانکی بازرگانی عێراقی TBI و NBI پشتگیری Apple Pay و Google Wallet دەکەن ئەگەر کارتی نێودەوڵەتیت هەبێت. بۆ کارتی هەژماری من ئەتوانی لە ڕێگەی ئەپی خودی بانکەکەوە (وەک ئەپی RT Bank یان Cihan) تایبەتمەندی Contactless (NFC) لە ناو ئەندرۆید چالاک بکەیت بەڵام لەسەر ئایفۆن تەنها لە ڕێگەی Apple Pay کاردەکات.",
        date: "١ کاتژمێر لەمەوبەر",
        isSolution: true,
        upvotes: 24,
      },
      {
        id: "r2",
        author: "سەنگەر حەسەن",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        content: "من کارتی FIB م لەسەر ئایفۆن داناوە و لە هەموو مارکێتەکانی هەولێر بە مۆبایل پارە دەدەم زۆر بێ کێشەیە.",
        date: "٤٥ خولەک لەمەوبەر",
        upvotes: 9,
      },
    ],
  },
  {
    id: "q2",
    title: "باشترین ڕاوتەری Wi-Fi 6 یان Wi-Fi 7 بۆ هێڵی فایبەر ئۆپتیک (FTTH) لە سلێمانی چییە؟",
    details:
      "ڕاوتەرە ئەسڵییەکەی کۆمپانیا لە ژوورەکانی تر ئیشارەتی کەم دەبێت و پینگی یاری بەرز دەبێتەوە. بودجەم لە نێوان ٥٠$ بۆ ١٢٠$ دۆلارە. چ مۆدێلێک لە بازاڕی مەولەوی پێشنیار دەکەن؟",
    author: "دیاری عومەر",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    city: "سلێمانی",
    date: "٥ کاتژمێر لەمەوبەر",
    category: "internet",
    tags: ["فایبەر ئۆپتیک", "ڕاوتەر", "پینگ", "سلێمانی"],
    isSolved: true,
    views: 610,
    upvotes: 45,
    repliesCount: 2,
    replies: [
      {
        id: "r3",
        author: "کاردۆ جەزا (شارەزای تۆڕ)",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        content:
          "بەو بودجەیە دوو بژاردەی یەکەمت هەیە: ١- TP-Link Archer AX55 (نرخی نزیکەی ٦٥$ە و لەگەڵ فایبەر مەعلوومە زۆر جێگیرە). ٢- ئەگەر ماڵتان گەورەیە پاکێجی Mesh ی TP-Link Deco X20 بە دوو دانە بە ١١٠$ بکڕە هەموو ماڵەکە بە یەک ناو و یەک وشەی نهێنی دادەپۆشێت.",
        date: "٣ کاتژمێر لەمەوبەر",
        isSolution: true,
        upvotes: 31,
      },
    ],
  },
  {
    id: "q3",
    title: "چۆن پینگی PUBG Mobile و Valorant کەم بکەمەوە لە دهۆک؟",
    details:
      "پینگی من لەسەر 5G لە ٧٥ کەمتر نابێت، ئایا بەرنامەی DNS یان کێبڵ باشترە بۆ ئەوەی بێتە خوار ٤٠ms؟",
    author: "ئەمیر زاخۆیی",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    city: "دهۆک",
    date: "١ ڕۆژ لەمەوبەر",
    category: "gaming",
    tags: ["PUBG", "Valorant", "دهۆک", "پینگ"],
    isSolved: false,
    views: 890,
    upvotes: 52,
    repliesCount: 4,
    replies: [
      {
        id: "r4",
        author: "شەماڵ ڕەمەزان",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
        content: "هەمیشە کێبڵی LAN (Cat6) بەکاربهێنە، بە وایفای ناتوانی پینگی جێگیر وەربگریت بەهۆی لەرینەوەی ئیشارەت.",
        date: "١٨ کاتژمێر لەمەوبەر",
        upvotes: 14,
      },
    ],
  },
];
