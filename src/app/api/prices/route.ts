import { NextRequest, NextResponse } from "next/server";
import { KURDISTAN_MARKET_PRICES, DEFAULT_EXCHANGE_RATE, formatIQD } from "@/data/articles";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const rateParam = searchParams.get("rate");

  const rate = rateParam ? parseInt(rateParam, 10) || DEFAULT_EXCHANGE_RATE : DEFAULT_EXCHANGE_RATE;

  let list = [...KURDISTAN_MARKET_PRICES];

  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  if (brand) {
    list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  const enhanced = list.map((item) => ({
    ...item,
    priceIQD: formatIQD(item.priceUSD, rate),
  }));

  return NextResponse.json({
    status: "success",
    exchangeRateUsed: rate,
    total: enhanced.length,
    data: enhanced,
  });
}
