import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import {
  getCuratedKurdishDrafts,
  publishDraftToPortal,
  runAutonomousDailyAgent,
} from "@/lib/agent/newsAgent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const apiKey = searchParams.get("apiKey") || undefined;
    const source = searchParams.get("source") || undefined;
    const category = searchParams.get("category") || undefined;
    const newOnly = searchParams.get("newOnly") === "true";

    const limit = limitParam ? parseInt(limitParam, 10) : 8;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const result = await getCuratedKurdishDrafts(
      limit,
      apiKey,
      offset,
      source,
      category,
      newOnly
    );

    return NextResponse.json(
      {
        status: "success",
        total: result.drafts.length,
        ...result,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (err: any) {
    console.error("AI Agent scan error:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to scan tech feeds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { status: "error", message: "ڕێگەپێنەدراوە؛ تەنها بەڕێوەبەر دەتوانێت ئەم کردارە بکات" },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();
    const { action, rawItem, overrides, draft, count = 3, apiKey } = body;

    if (action === "publish-single") {
      if (!rawItem) {
        return NextResponse.json(
          { status: "error", message: "rawItem is required for publish-single" },
          { status: 400 }
        );
      }

      const publishedArticle = await publishDraftToPortal(rawItem, apiKey, overrides, draft);

      return NextResponse.json({
        status: "success",
        message: "Article published to KurdTech portal successfully",
        article: publishedArticle,
      });
    }

    if (action === "auto-curate-publish") {
      const result = await runAutonomousDailyAgent(count, apiKey);

      return NextResponse.json({
        status: "success",
        ...result,
      });
    }

    return NextResponse.json(
      { status: "error", message: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("AI Agent action error:", err);
    return NextResponse.json(
      { status: "error", message: err.message || "Failed to execute agent action" },
      { status: 500 }
    );
  }
}
