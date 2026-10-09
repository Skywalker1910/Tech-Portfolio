import { NextRequest, NextResponse } from "next/server";
import { volatileRequestKey } from "@/lib/request-rate-limit";
import { ArcadeError } from "./policy";

const buckets = new Map<string,{count:number; until:number}>();
export function allowWrite(request:NextRequest, limit=10) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) throw new ArcadeError("Use the portfolio page to submit scores.",403);
  const key = volatileRequestKey(`${request.nextUrl.pathname}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`);
  const now = Date.now();
  for (const [id,bucket] of buckets) if (bucket.until <= now) buckets.delete(id);
  if (buckets.size >= 5000 && !buckets.has(key)) throw new ArcadeError("Too many requests. Please try again later.",429);
  const bucket = buckets.get(key) ?? {count:0,until:now+10*60_000};
  bucket.count++;
  buckets.set(key,bucket);
  if (bucket.count>limit) throw new ArcadeError("Too many requests. Please try again later.",429);
}
export async function jsonBody(request:NextRequest):Promise<Record<string,unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ArcadeError("Send JSON.",415);
  const reader = request.body?.getReader();
  if (!reader) throw new ArcadeError("Missing request body.");
  const chunks:Uint8Array[] = [];
  let length=0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length>4096) { await reader.cancel(); throw new ArcadeError("Request is too large.",413); }
      chunks.push(value);
    }
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch (error) {
    if (error instanceof ArcadeError) throw error;
    throw new ArcadeError("Invalid JSON.");
  }
}
export function failure(error:unknown) {
  return NextResponse.json({ error:error instanceof ArcadeError ? error.message : "Arcade service is unavailable. Please try again." }, { status:error instanceof ArcadeError ? error.status : 503, headers:{ "Cache-Control":"no-store" } });
}
