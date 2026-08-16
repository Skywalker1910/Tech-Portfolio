import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { getRagRuntimeSettings, getRagStatus, saveRagRuntimeSettings, saveRagStatus } from "@/lib/content/repository";
import { getEmbeddingConfig, getRagConfig } from "@/lib/rag/config";
import { countIndexedVectors, indexPortfolioKnowledge } from "@/lib/rag/indexing";

export const dynamic = "force-dynamic";
const unauthorized = () => NextResponse.json({ error:"Unauthorized" }, { status:401 });

export async function GET(req: NextRequest) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const env = getRagConfig(); const embedding = getEmbeddingConfig(); const runtime = await getRagRuntimeSettings();
  let vectors:number | null = null; let connection:"connected" | "unconfigured" | "error" = env.vectorBucketName ? "connected" : "unconfigured";
  if (env.vectorBucketName) { try { vectors = await countIndexedVectors(); } catch { connection = "error"; } }
  return NextResponse.json({ settings:{ enabled:runtime?.enabled ?? env.enabled, topK:runtime?.topK ?? env.topK, maxDistance:runtime?.maxDistance ?? env.maxDistance }, infrastructure:{ connection, bucketConfigured:Boolean(env.vectorBucketName), index:env.indexName, embeddingModel:embedding.model, dimensions:embedding.dimensions, vectors }, lastSync:await getRagStatus() });
}

export async function PATCH(req: NextRequest) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const topK = Math.min(10, Math.max(1, Math.round(Number(body.topK) || 4)));
  const maxDistance = Math.min(2, Math.max(0, Number(body.maxDistance) || 0));
  try { return NextResponse.json(await saveRagRuntimeSettings({ enabled:Boolean(body.enabled), topK, maxDistance })); }
  catch (error) { console.error("[rag admin] Settings save failed", error); return NextResponse.json({ error:"Could not save settings. Provision the portfolio table first." }, { status:503 }); }
}

export async function POST(req: NextRequest) {
  if (!isValidAdminRequest(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (body.action !== "reindex") return NextResponse.json({ error:"Unknown action." }, { status:400 });
  try {
    await saveRagStatus({ state:"running", startedAt:new Date().toISOString() });
    const result = await indexPortfolioKnowledge();
    await saveRagStatus({ state:"ready", completedAt:new Date().toISOString(), ...result });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexing failed.";
    try { await saveRagStatus({ state:"error", completedAt:new Date().toISOString(), message }); } catch {}
    console.error("[rag admin] Reindex failed", error);
    return NextResponse.json({ error:message }, { status:503 });
  }
}
