import crypto from "crypto";
import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "kurdtech_admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "kurdtech2026";
}

export function createAdminSessionToken(): string {
  const secret = getAdminPassword();
  return crypto.createHmac("sha256", secret).update("kurdtech-admin-authenticated-v1").digest("hex");
}

export function isValidAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const expected = createAdminSessionToken();
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyAdminRequest(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (isValidAdminToken(cookieToken)) return true;

  const headerToken = req.headers.get("x-admin-token");
  if (isValidAdminToken(headerToken)) return true;

  const headerPass = req.headers.get("x-admin-password");
  if (headerPass && headerPass === getAdminPassword()) return true;

  return false;
}
