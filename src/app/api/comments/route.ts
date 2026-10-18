import { NextRequest, NextResponse } from "next/server";
import { ARTICLES } from "@/data/articles";
import { Comment } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, author, content } = body;

    if (!articleId || !author || !content) {
      return NextResponse.json(
        { error: "articleId, author and content are required" },
        { status: 400 }
      );
    }

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: author.trim(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      date: "کەمێک لەمەوبەر",
      content: content.trim(),
      likes: 1,
    };

    return NextResponse.json({
      status: "success",
      message: "سەرنجەکەت بە سەرکەوتوویی تۆمارکرا",
      comment: newComment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "سێرڤەر نەیتوانی سەرنجەکە پرۆسێس بکات" },
      { status: 500 }
    );
  }
}
