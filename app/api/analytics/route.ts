import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsContext, recordBasicFeatureEvent, recordChatOpen, recordMandatoryVisitorSession, recordOperationalPageView, recordPageActivity, recordPageEngagement, sanitizeAnalyticsId, sanitizeBasicFeatureEvent, sanitizeTrackedPath, sanitizeTrafficSource } from "@/lib/analytics";
import { isMissingPortfolioTable } from "@/lib/content/repository";
import { volatileRequestKey } from "@/lib/request-rate-limit";

export const dynamic = "force-dynamic";
const requests = new Map<string, { count:number; resetAt:number }>();
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;
const noStore = { "Cache-Control":"no-store" };

function isRateLimited(ip: string) {
  const now = Date.now();
  if (requests.size > 500) for (const [key, value] of requests) if (value.resetAt <= now) requests.delete(key);
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
  const requestKey = volatileRequestKey(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local");
  if (isRateLimited(requestKey)) return NextResponse.json({ error:"Too many analytics events." }, { status:429, headers:noStore });
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) return NextResponse.json({ error:"Event is too large." }, { status:413, headers:noStore });
  const body = await req.json().catch(() => ({}));
  const eventId = sanitizeAnalyticsId(body.eventId);
  if (!eventId) return NextResponse.json({ error:"Invalid event." }, { status:400, headers:noStore });

  const visitorId = sanitizeAnalyticsId(body.visitorId);
  const sessionId = sanitizeAnalyticsId(body.sessionId);

  if (body.eventType === "visitor_session_started") {
    if (!visitorId || !sessionId) return NextResponse.json({ error:"Invalid mandatory identifiers." }, { status:400, headers:noStore });
    const context = getAnalyticsContext(req.headers);
    try { await recordMandatoryVisitorSession({ eventId, visitorId, sessionId, location:context.location }); }
    catch (error) {
      if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record mandatory visitor telemetry.", error);
      return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
    }
    return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
  }

  if (body.eventType === "chat_open") {
    const chatSessionId = sanitizeAnalyticsId(body.chatSessionId);
    const tier = body.tier === "enhanced" ? "enhanced" : body.tier === "basic" ? "basic" : null;
    if (!visitorId || !sessionId || !chatSessionId || !tier) return NextResponse.json({ error:"Invalid chat telemetry." }, { status:400, headers:noStore });
    const context = getAnalyticsContext(req.headers, body.client);
    try { await recordChatOpen({ eventId, visitorId, sessionId, chatSessionId, context, detailed:tier === "enhanced" }); }
    catch (error) {
      if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record BB-8 open.", error);
      return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
    }
    return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
  }

  if (body.eventType === "feature_event") {
    const event = sanitizeBasicFeatureEvent(body);
    if (!visitorId || !sessionId || !event) return NextResponse.json({ error:"Invalid feature event." }, { status:400, headers:noStore });
    try { await recordBasicFeatureEvent({ eventId, visitorId, sessionId, event }); }
    catch (error) {
      if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record feature event.", error);
      return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
    }
    return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
  }

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
  const visitId = sanitizeAnalyticsId(body.visitId);
  if (!visitorId || !sessionId) return NextResponse.json({ error:"Invalid analytics identifiers." }, { status:400, headers:noStore });
  if (body.visitId && !visitId) return NextResponse.json({ error:"Invalid journey identifier." }, { status:400, headers:noStore });
  const context = getAnalyticsContext(req.headers, body.client);
  const source = visitId ? sanitizeTrafficSource(body.source) : null;
  try {
    await recordOperationalPageView({ path, eventId, visitorId, sessionId, context, source });
    if (visitorId && visitId) await recordPageActivity({ path, visitorId, sessionId, visitId, eventId, context, source });
  }
  catch (error) {
    if (!isMissingPortfolioTable(error)) console.error("[analytics] Could not record page view.", error);
    return NextResponse.json({ accepted:false }, { status:202, headers:noStore });
  }
  return NextResponse.json({ accepted:true }, { status:202, headers:noStore });
}
