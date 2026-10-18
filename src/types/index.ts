export interface Comment {
  id: string;
  author: string;
  role?: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  categorySlug: string;
  tags?: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  };
  publishedAt: string;
  publishedDateIso?: string;
  readTime: string;
  views: string;
  likesCount?: number;
  commentsCount: number;
  comments?: Comment[];
  imageUrl: string;
  featuredPosition?: "main" | "top-left" | "bottom-right" | "bottom-left";
  isBreaking?: boolean;
  isEditorPick?: boolean;
  reviewScore?: number;
  pros?: string[];
  cons?: string[];
  specs?: Record<string, string>;
  extractedMetrics?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  count: number;
  description?: string;
}

export interface MarketPriceItem {
  id: string;
  name: string;
  category: "phone" | "laptop" | "console" | "tablet" | "gpu";
  brand: string;
  priceUSD: number;
  change: string;
  trend: "up" | "down" | "neutral";
  storage?: string;
  color?: string;
  updatedAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  category: string;
  youtubeId?: string;
  description?: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  brand: string;
  category: "phone" | "laptop" | "console";
  imageUrl: string;
  priceUSD: number;
  reviewScore: number;
  specs: {
    display: string;
    chipset: string;
    ram: string;
    storage: string;
    mainCamera: string;
    selfieCamera: string;
    battery: string;
    charging: string;
    weight: string;
    os: string;
    network: string;
  };
  pros: string[];
  cons: string[];
}

export interface CommunityReply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  date: string;
  isSolution?: boolean;
  upvotes: number;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  details: string;
  author: string;
  avatar: string;
  city?: string;
  date: string;
  category: "mobile" | "internet" | "pc" | "gaming" | "general";
  tags: string[];
  isSolved: boolean;
  views: number;
  upvotes: number;
  repliesCount: number;
  replies: CommunityReply[];
}

export interface TechDeal {
  id: string;
  title: string;
  originalPriceUSD: number;
  discountPriceUSD: number;
  storeName: string;
  city: "هەولێر" | "سلێمانی" | "دهۆک" | "سەرتاسەری";
  imageUrl: string;
  category: "phone" | "laptop" | "accessory" | "gaming";
  promoCode?: string;
  expiresInDays: number;
  badge?: string;
}

export interface GlossaryTerm {
  id: string;
  termEn: string;
  termKu: string;
  shortDesc: string;
  fullDesc: string;
  category: "ai" | "display" | "hardware" | "network" | "gaming";
}
