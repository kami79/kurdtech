import { Metadata } from "next";
import { findArticle } from "@/lib/articleStore";
import ArticleDetailClient from "./ArticleDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await findArticle(params.id);
  if (!article) {
    return {
      title: "بابەتەکە نەدۆزرایەوە | کوردتێک KurdTech",
      description: "ببورە، ئەم بابەتە لە پۆڕتاڵی کوردتێک نەدۆزرایەوە.",
    };
  }

  const title = `${article.title} | کوردتێک KurdTech`;
  const description = article.excerpt || article.title;
  const canonical = `https://kurdtech.org/articles/${article.id}`;

  return {
    title,
    description,
    keywords: [
      article.category,
      ...(article.tags || []),
      "کوردتێک",
      "KurdTech",
      "تەکنەلۆژیا",
      "کوردستان",
    ],
    authors: [{ name: article.author?.name || "تیمی تەکنیکی کوردتێک" }],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "کوردتێک | KurdTech",
      locale: "ckb_IQ",
      type: "article",
      publishedTime: article.publishedDateIso,
      authors: [article.author?.name || "کوردتێک"],
      tags: article.tags,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.imageUrl],
    },
  };
}

export default function ArticlePage({ params }: Props) {
  return <ArticleDetailClient articleId={params.id} />;
}
