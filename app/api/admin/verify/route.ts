import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  const envKey = process.env.ADMIN_KEY;

  if (!envKey) {
    return NextResponse.json({ error: "Server misconfiguration: ADMIN_KEY not set" }, { status: 500 });
  }
  if (!adminKey || adminKey !== envKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
