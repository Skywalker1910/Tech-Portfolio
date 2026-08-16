import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { getTrafficReport } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const days = Math.min(90, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 30));
  try { return NextResponse.json(await getTrafficReport(days)); }
  catch (error) { console.error("[analytics] Report failed", error); return NextResponse.json({ error:"Traffic data is unavailable until the portfolio table is provisioned." }, { status:503 }); }
}
