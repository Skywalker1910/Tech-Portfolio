import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminCookieOptions, createAdminSessionToken, isValidAdminKey, isValidAdminRequest } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
const attempts = new Map<string, { count:number; resetAt:number }>();

export async function GET(req: NextRequest) {
  const authenticated = isValidAdminRequest(req);
  return NextResponse.json({ authenticated }, { status:authenticated ? 200 : 401 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= 8) return NextResponse.json({ error:"Too many attempts. Try again shortly." }, { status:429 });
  let key = "";
  try { key = String((await req.json()).key ?? ""); } catch {}
  if (!isValidAdminKey(key)) {
    attempts.set(ip, { count:entry && entry.resetAt > now ? entry.count + 1 : 1, resetAt:now + 10 * 60_000 });
    return NextResponse.json({ error:"Invalid admin key." }, { status:401 });
  }
  attempts.delete(ip);
  const response = NextResponse.json({ authenticated:true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), adminCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated:false });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions, maxAge:0 });
  return response;
}
