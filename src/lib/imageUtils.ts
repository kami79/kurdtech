// Rich pools of verified, high-resolution Unsplash tech images per category
export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  ai: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80",
  ],
  mobile: [
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1200&auto=format&fit=crop&q=80",
  ],
  hardware: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80",
  ],
  reviews: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=80",
  ],
  gaming: [
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
  ],
  science: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
  ],
  kurdistan: [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=80",
  ],
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pick a topic-matched or deterministic unique fallback image per article
export function getCategoryFallbackImage(
  categorySlug?: string,
  seedKey?: string
): string {
  const s = (seedKey || "").toLowerCase();

  // Topic-specific high-precision matching first
  if (s.includes("macbook") || s.includes("ماکبۆک") || s.includes("ماکبووک") || s.includes("لاپتۆپ")) {
    const macPool = [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=80",
    ];
    return macPool[hashSeed(seedKey || "mac") % macPool.length];
  }

  if (s.includes("iphone") || s.includes("ئایفۆن") || s.includes("ios")) {
    const iphonePool = [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
    ];
    return iphonePool[hashSeed(seedKey || "iphone") % iphonePool.length];
  }

  if (s.includes("spacex") || s.includes("سپەیس ئێکس") || s.includes("starlink") || s.includes("مانگی دەستکرد")) {
    const spacePool = [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&auto=format&fit=crop&q=80",
    ];
    return spacePool[hashSeed(seedKey || "space") % spacePool.length];
  }

  if (s.includes("tiktok") || s.includes("تیک تۆک") || s.includes("ئینستاگرام") || s.includes("مێتا") || s.includes("meta")) {
    const socialPool = [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    ];
    return socialPool[hashSeed(seedKey || "social") % socialPool.length];
  }

  const pool =
    (categorySlug && CATEGORY_IMAGE_POOLS[categorySlug]) ||
    CATEGORY_IMAGE_POOLS.ai;

  if (!seedKey) {
    return pool[0];
  }

  const idx = hashSeed(seedKey) % pool.length;
  return pool[idx];
}

export function getSafeImageUrl(
  url?: string,
  categorySlug?: string,
  seedKey?: string
): string {
  const fallback = getCategoryFallbackImage(categorySlug, seedKey);
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }

  const cleaned = url
    .replace(/&#038;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/21780efad99a/g, "21780ecad995")
    .trim();

  // Only replace known broken synthetic placeholder URL
  if (cleaned.includes("l-intro-1793266804.jpg")) {
    return fallback;
  }

  return cleaned;
}
