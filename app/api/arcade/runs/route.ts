import { NextRequest, NextResponse } from "next/server";
import { allowWrite, failure, jsonBody } from "@/lib/arcade/http";
import { ArcadeError, validateRunIdentity } from "@/lib/arcade/policy";
import { arcadeConfigured } from "@/lib/arcade/repository";
import { issueRun } from "@/lib/arcade/runs";
export const dynamic = "force-dynamic";
export async function POST(request:NextRequest) {
  try {
    allowWrite(request,20);
    if (!arcadeConfigured()) throw new ArcadeError("Public scores are not configured yet.",503);
    const identity = validateRunIdentity(await jsonBody(request));
    return NextResponse.json({ ticket:issueRun(identity) },{ headers:{ "Cache-Control":"no-store" } });
  } catch (error) { return failure(error); }
}
