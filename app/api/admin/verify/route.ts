import { NextRequest, NextResponse } from "next/server";
import { isValidAdminKey } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
