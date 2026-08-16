import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() { return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_KEY || ""; }
function sign(value: string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }

export function isValidAdminKey(key: string | null): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!key || !expected || key.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(key), Buffer.from(expected));
}

export function createAdminSessionToken() {
  if (!secret()) throw new Error("Set ADMIN_SESSION_SECRET or ADMIN_KEY.");
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch { return false; }
}

export function isValidAdminRequest(req: NextRequest) {
  return isValidAdminSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value) || isValidAdminKey(req.headers.get("x-admin-key"));
}

export const adminCookieOptions = { httpOnly:true, sameSite:"strict" as const, secure:process.env.NODE_ENV === "production", path:"/", maxAge:SESSION_TTL_SECONDS };
