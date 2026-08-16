import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsContext, recordOperationalPageView, recordPageActivity, recordPageEngagement, sanitizeAnalyticsId, sanitizeTrackedPath, sanitizeTrafficSource } from "@/lib/analytics";
import { isMissingPortfolioTable } from "@/lib/content/repository";

export const dynamic = "force-dynamic";
const requests = new Map<string, { count:number; resetAt:number }>();
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;
const noStore = { "Cache-Control":"no-store" };

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = requests.get(ip);
  if (!current || current.resetAt <= now) {
    requests.set(ip, { count:1, resetAt:now + RATE_WINDOW_MS });
    return false;
  }
  if (current.count >= RATE_LIMIT) return true;
  current.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) return NextResponse.json({ error:"Too many analytics events." }, { status:429, headers:noStore });
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) return NextResponse.json({ error:"Event is too large." }, { status:413, headers:noStore });
  const body = await req.json().catch(() => ({}));
  const eventId = sanitizeAnalyticsId(body.eventId);
  if (!eventId) return NextResponse.json({ error:"Invalid event." }, { status:400, headers:noStore });

  if (body.eventType === "engagement") {
    const durationMs = Number(body.durationMs);
    if (!Number.isFinite(durationMs) || durationMs < 1_000 || durationMs > 7_200_000) return NextResponse.json({ error:"Invalid engagement event." }, { status:400, headers:noStore });
    try { await recordPageEngagement(eventId, Math.round(durationMs)); }
    catch (error) {
      if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record engagement.", error);
      return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
    }
    return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
  }

  if (body.eventType !== "page_view") return NextResponse.json({ error:"Invalid event type." }, { status:400, headers:noStore });
  const path = sanitizeTrackedPath(body.path);
  if (!path) return NextResponse.json({ error:"Invalid event." }, { status:400, headers:noStore });
  const visitorId = sanitizeAnalyticsId(body.visitorId);
  const visitId = sanitizeAnalyticsId(body.visitId);
  const hasJourneyIdentifiers = Boolean(visitorId && visitId);
  if ((body.visitorId || body.visitId) && !hasJourneyIdentifiers) return NextResponse.json({ error:"Invalid journey identifiers." }, { status:400, headers:noStore });
  const context = getAnalyticsContext(req.headers, body.client);
  const source = hasJourneyIdentifiers ? sanitizeTrafficSource(body.source) : null;
  try {
    await recordOperationalPageView({ path, eventId, context, source });
    if (visitorId && visitId) await recordPageActivity({ path, visitorId, visitId, eventId, context, source });
  }
  catch (error) {
    if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record page view.", error);
    return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
  }
  return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
}
