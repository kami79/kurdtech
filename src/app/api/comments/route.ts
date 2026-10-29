import { NextRequest, NextResponse } from "next/server";
import { Comment } from "@/types";
import { addCommentToArticle } from "@/lib/articleStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, author, content } = body;

    if (!articleId || !author || !content || typeof author !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { status: "error", message: "articleId, author and content are required" },
        { status: 400 }
      );
    }

    const cleanAuthor = author.trim().slice(0, 60);
    const cleanContent = content.trim().slice(0, 2000);

    if (!cleanAuthor || !cleanContent) {
      return NextResponse.json(
        { status: "error", message: "author and content cannot be blank" },
        { status: 400 }
      );
    }

    const newComment: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: cleanAuthor,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      date: "ئێستا",
      content: cleanContent,
      likes: 0,
    };

    const updatedArticle = await addCommentToArticle(articleId, newComment);

    if (!updatedArticle) {
      return NextResponse.json(
        { status: "error", message: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "سەرنجەکەت بە سەرکەوتوویی تۆمارکرا",
      comment: newComment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "سێرڤەر نەیتوانی سەرنجەکە پرۆسێس بکات" },
      { status: 500 }
    );
  }
}
