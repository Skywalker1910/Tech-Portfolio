import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { getTrafficReport, sanitizeAudienceSegment, sanitizeVisitorKey, setVisitorAudienceSegment } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const days = Math.min(90, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 30));
  try { return NextResponse.json(await getTrafficReport(days), { headers:{ "Cache-Control":"private, no-store" } }); }
  catch (error) { console.error("[analytics] Report failed", error); return NextResponse.json({ error:"Traffic data is unavailable until the portfolio table is provisioned." }, { status:503 }); }
}

export async function PATCH(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const body = await req.json().catch(() => ({}));
  const visitorKey = sanitizeVisitorKey(body.visitorKey);
  const segment = sanitizeAudienceSegment(body.segment);
  if (!visitorKey || !segment) return NextResponse.json({ error:"Invalid visitor classification." }, { status:400 });
  try { return NextResponse.json(await setVisitorAudienceSegment(visitorKey, segment), { headers:{ "Cache-Control":"private, no-store" } }); }
  catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return NextResponse.json({ error:"Visitor profile was not found." }, { status:404 });
    console.error("[analytics] Visitor classification failed", error);
    return NextResponse.json({ error:"Could not update visitor classification." }, { status:503 });
  }
}
