import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { getOpenAIUsageReport, OpenAIUsageApiError } from "@/lib/openai-usage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const days = Math.min(90, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 30));
  try {
    return NextResponse.json(await getOpenAIUsageReport(days), { headers:{ "Cache-Control":"private, no-store" } });
  } catch (error) {
    console.error("[openai-usage] Report failed.", error);
    if (error instanceof OpenAIUsageApiError) {
      const status = error.status === 401 || error.status === 403 ? 502 : Math.max(500, error.status);
      return NextResponse.json({ error:"OpenAI usage data is unavailable. Verify the server-side Admin API key and project scope." }, { status });
    }
    return NextResponse.json({ error:"OpenAI usage data is temporarily unavailable." }, { status:503 });
  }
}
