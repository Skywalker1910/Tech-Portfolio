import { NextRequest, NextResponse } from "next/server";
import { recordPageView, sanitizeTrackedPath } from "@/lib/analytics";
import { isMissingPortfolioTable } from "@/lib/content/repository";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const path = sanitizeTrackedPath(body.path);
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
  if (!path || sessionId.length < 8) return NextResponse.json({ error:"Invalid event." }, { status:400 });
  try { await recordPageView(path, sessionId); }
  catch (error) {
    if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record page view.", error);
    return NextResponse.json({ accepted:false }, { status:202 });
  }
  return NextResponse.json({ accepted:true }, { status:202 });
}
