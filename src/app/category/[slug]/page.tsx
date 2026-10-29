import { Metadata } from "next";
import { CATEGORIES } from "@/data/articles";
import CategoryClient from "./CategoryClient";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const currentCategory = CATEGORIES.find((c) => c.slug === params.slug);

  const name = currentCategory?.name || params.slug;
  const description =
    currentCategory?.description ||
    `نوێترین هەواڵ، پێداچوونەوە و بابەتەکانی ${name} لە کوردتێک`;
  const title = `بەشی ${name} | کوردتێک KurdTech`;
  const canonical = `https://kurdtech.org/category/${params.slug}`;

  return {
    title,
    description,
    keywords: [name, "کوردتێک", "KurdTech", "تەکنەلۆژیا", "کوردستان"],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "کوردتێک | KurdTech",
      locale: "ckb_IQ",
      type: "website",
    },
  };
}

export default function CategoryPage({ params }: Props) {
  return <CategoryClient slug={params.slug} />;
}
