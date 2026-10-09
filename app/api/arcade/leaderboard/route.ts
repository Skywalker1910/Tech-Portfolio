import { NextRequest, NextResponse } from "next/server";
import { allowWrite, failure, jsonBody } from "@/lib/arcade/http";
import { ArcadeError } from "@/lib/arcade/policy";
import { arcadeConfigured, topScores } from "@/lib/arcade/repository";
import { publishScore } from "@/lib/arcade/submission";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!arcadeConfigured()) return NextResponse.json({ configured:false, entries:[] },{ headers:{ "Cache-Control":"no-store" } });
  try { return NextResponse.json({ configured:true, entries:await topScores() },{ headers:{ "Cache-Control":"no-store" } }); }
  catch (error) { return failure(error); }
}
export async function POST(request:NextRequest) {
  try {
    allowWrite(request);
    if (!arcadeConfigured()) throw new ArcadeError("Public scores are not configured yet.",503);
    const body = await jsonBody(request);
    const entry = await publishScore(body);
    return NextResponse.json({ entry },{ status:201, headers:{ "Cache-Control":"no-store" } });
  } catch (error) { return failure(error); }
}
