import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminPassword,
  verifyAdminRequest,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAdmin = verifyAdminRequest(req);
  return NextResponse.json(
    { status: "success", isAdmin },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!password || password !== getAdminPassword()) {
      return NextResponse.json(
        { status: "error", message: "وشەی نهێنی بەڕێوەبەر هەڵەیە" },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ status: "success", isAdmin: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch {
    return NextResponse.json(
      { status: "error", message: "هەڵە لە چوونەژوورەوە" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ status: "success", isAdmin: false });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}

