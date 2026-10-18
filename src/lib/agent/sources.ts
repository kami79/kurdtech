export interface TechNewsSource {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  categorySlug: "ai" | "mobile" | "gaming" | "hardware" | "kurdistan" | "science";
  defaultCategory: string;
  badgeColor: string;
  importanceWeight: number; // 1-10
  icon: string;
  description: string;
}

export const TECH_NEWS_SOURCES: TechNewsSource[] = [
  {
    id: "the-verge",
    name: "The Verge",
    url: "https://www.theverge.com",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    categorySlug: "ai",
    defaultCategory: "زیرەکی دەستکرد و تەکنەلۆژیا",
    badgeColor: "bg-purple-600 text-white",
    importanceWeight: 9.5,
    icon: "🌐",
    description: "گرنگترین ماڵپەڕی هەواڵی تەکنەلۆژیا، ئامێرە زیرەکەکان و زیرەکی دەستکرد",
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/feed/",
    categorySlug: "ai",
    defaultCategory: "زیرەکی دەستکرد",
    badgeColor: "bg-emerald-600 text-white",
    importanceWeight: 9.2,
    icon: "🚀",
    description: "تایبەت بە کۆمپانیا زەبەلاحەکانی تەکنەلۆژیا، وەبەرهێنان و مۆدێلە نوێیەکان",
  },
  {
    id: "9to5mac",
    name: "9to5Mac",
    url: "https://9to5mac.com",
    feedUrl: "https://9to5mac.com/feed/",
    categorySlug: "mobile",
    defaultCategory: "مۆبایل و تابلێت",
    badgeColor: "bg-sky-600 text-white",
    importanceWeight: 8.8,
    icon: "🍎",
    description: "باوەڕپێکراوترین سەرچاوەی هەواڵ و دزەپێکردنەکانی ئەپڵ، ئایفۆن و iOS",
  },
  {
    id: "arstechnica",
    name: "Ars Technica",
    url: "https://arstechnica.com",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    categorySlug: "hardware",
    defaultCategory: "ڕەقەواڵە و چیپسێت",
    badgeColor: "bg-amber-600 text-white",
    importanceWeight: 9.0,
    icon: "⚡",
    description: "شیکاری قووڵی ڕەقەواڵە، پرۆسێسەر، ئاسایشی ئەلیکترۆنی و سیستمەکان",
  },
  {
    id: "wired",
    name: "Wired Tech",
    url: "https://www.wired.com",
    feedUrl: "https://www.wired.com/feed/rss",
    categorySlug: "science",
    defaultCategory: "زانست و بۆشایی",
    badgeColor: "bg-indigo-600 text-white",
    importanceWeight: 8.5,
    icon: "🔬",
    description: "کاریگەری داهێنانە زانستییەکان، ڕۆبۆت و زیرەکی دەستکرد لەسەر جیهان",
  },
  {
    id: "engadget",
    name: "Engadget",
    url: "https://www.engadget.com",
    feedUrl: "https://www.engadget.com/rss.xml",
    categorySlug: "gaming",
    defaultCategory: "یاری و کۆنسۆڵ",
    badgeColor: "bg-rose-600 text-white",
    importanceWeight: 8.0,
    icon: "🎮",
    description: "پێداچوونەوەی ڕەقەواڵەی گەیمینگ، ڕوونما، کۆنسۆڵ و ئەلیکترۆنیاتی بەکاربەر",
  },
];
