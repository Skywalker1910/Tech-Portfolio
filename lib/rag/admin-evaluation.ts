import { createHash } from "node:crypto";
import OpenAI from "openai";
import cases from "@/evals/rag-development.json";
import { buildPortfolioContext } from "@/lib/portfolio-context";
import { buildCurrentPortfolioChunks } from "./live-knowledge";
import { getEmbeddingConfig } from "./config";
import { verifyEvaluationIndex } from "./evaluation-live";
import { EVALUATION_PRICING, evaluationPrice, priceNanoUsd } from "./evaluation-pricing";
import { evidenceCoverage, evidenceRedundancy, legacyHit, PaidBudget, type EvalCase } from "./evaluation";
import { retrievalDecision, retrievalQuery } from "./policy";
import { retrieveFromS3Vectors, retrievePortfolioContext } from "./retrieval";
import type { PortfolioChunk, RetrievedChunk } from "./types";

export const ADMIN_EVALUATION_CASES = ["dev-paraphrase-movies", "dev-career", "dev-followup-movie", "dev-missing-salary", "dev-ambiguous-it"] as const;
export type AdminEvaluationPreset = "retrieval" | "answers";
export type AdminEvaluationRow = {
  caseId:string; category:string; policy:string; mode:string; requestedK:number; hit:boolean|null;
  independentHitAt3:boolean|null; sourceIds:string[]; retrievalMs:number; qualifyingCount:number;
  duplicatesRemoved:number; contextTokenUpperBound:number; redundancy:number;
  termCoverage:number|null; routeCoverage:number|null; fallbackReason:string|null;
  semanticRequestReused:boolean;
  answer?:{ text:string; completed:boolean; inputTokens:number|null; outputTokens:number|null; latencyMs:number; standardRateCostUsd:number|null };
};
export type AdminEvaluationReport = {
  state:"complete"|"incomplete"; preset:AdminEvaluationPreset; startedAt:string; completedAt:string;
  corpusHash:string; corpusChunks:number; indexVerified:boolean; rows:AdminEvaluationRow[];
  approvedMaximumUsd:number; reservedMaximumUsd:number; paidCalls:number; elapsedMs:number; stopReason:string|null;
  humanReview:"not-reviewed";
  configuration:{generationModel:string;embeddingModel:string;maxDistance:number;contextTokenBudget:number;generationOutputLimit:number};
};
export function evaluationPlan(preset:AdminEvaluationPreset) {
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.6-terra";
  const embeddingModel = getEmbeddingConfig().model;
  const prices = [embeddingModel, ...(preset === "answers" ? [model] : [])].map(name => {
    const price = EVALUATION_PRICING[name as keyof typeof EVALUATION_PRICING];
    return { model:name, ...(price ?? {}), supported:Boolean(price) };
  });
  let available = Boolean(process.env.OPENAI_API_KEY);
  try { for (const price of prices) evaluationPrice(price.model); } catch { available = false; }
  return { preset, model, embeddingModel, prices, available, budgetUsd:.05, topK:[4,6,8], independentHitK:3,
    maxDistance:.65, contextTokenBudget:12000, maximumCalls:12, maximumDurationMs:20000,
    dryRun:true, caseIds:ADMIN_EVALUATION_CASES, generationOutputLimit:500,
    limitation:"Small development smoke test, not the held-out suite. Answers require human rubric review. Budget/time limits can stop a comparison early." };
}

type Dependencies = {
  corpus:()=>Promise<PortfolioChunk[]>;
  verify:(corpus:PortfolioChunk[],signal:AbortSignal)=>Promise<unknown>;
  search:(query:string,k:number,distance:number,signal:AbortSignal)=>Promise<RetrievedChunk[]>;
  client:OpenAI;
  pricingNow?:number;
};
export async function runAdminEvaluation(preset:AdminEvaluationPreset, caseId:string, injected?:Dependencies):Promise<AdminEvaluationReport> {
  if (!(ADMIN_EVALUATION_CASES as readonly string[]).includes(caseId)) throw new Error("Unknown evaluation fixture");
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.6-terra";
  const embeddingPrice = evaluationPrice(getEmbeddingConfig().model,injected?.pricingNow);
  const generationPrice = preset === "answers" ? evaluationPrice(model,injected?.pricingNow) : null;
  const client = injected?.client ?? new OpenAI({ apiKey:process.env.OPENAI_API_KEY, maxRetries:0, timeout:8000 });
  const deps:Dependencies = injected ?? { client, corpus:buildCurrentPortfolioChunks, verify:verifyEvaluationIndex,
    search:(q,k,d,s)=>retrieveFromS3Vectors(q,client,k,d,s) };
  const started = performance.now(); const signal = AbortSignal.timeout(20000);
  const budget = new PaidBudget(12,150000,.05);
  const report:AdminEvaluationReport = { state:"incomplete", preset, startedAt:new Date().toISOString(), completedAt:"",
    corpusHash:"", corpusChunks:0, indexVerified:false, rows:[], approvedMaximumUsd:.05, reservedMaximumUsd:0,
    paidCalls:0, elapsedMs:0, stopReason:null, humanReview:"not-reviewed",
    configuration:{generationModel:model,embeddingModel:getEmbeddingConfig().model,maxDistance:.65,contextTokenBudget:12000,generationOutputLimit:500} };
  try {
    const corpus = await deps.corpus(); signal.throwIfAborted();
    report.corpusHash = createHash("sha256").update(JSON.stringify(corpus)).digest("hex"); report.corpusChunks=corpus.length;
    await deps.verify(corpus,signal);
    const fixtures = (cases as EvalCase[]).filter(c=>preset === "answers" ? c.id===caseId : ["dev-paraphrase-movies","dev-career","dev-followup-movie"].includes(c.id!));
    for (const fixture of fixtures) {
      const messages = [...(fixture.history ?? []), { role:"user" as const, content:fixture.question }];
      const query = retrievalQuery(messages);
      const cache = new Map<number,RetrievedChunk[]>();
      const search = async (q:string,k:number,d:number) => {
        signal.throwIfAborted();
        if (!cache.has(k)) { budget.reserve(q,0,embeddingPrice); cache.set(k,await deps.search(q,k,d,signal)); }
        return cache.get(k)!;
      };
      for (const mode of (preset === "answers" ? ["auto"] : ["local","semantic","auto"]) as Array<"auto"|"local"|"semantic">) {
        const retrieve = (k:number,strategy:"fixed"|"adaptive"="fixed")=>retrievePortfolioContext(query,{ mode, corpus,
          settings:{ enabled:true, topK:k, strategy, adaptiveMaxK:8, contextTokenBudget:12000, maxDistance:.65 }, semanticSearch:search });
        const independent = await retrieve(3);
        if (mode !== "local" && independent.mode !== "s3-vectors") throw new Error("Semantic evaluation unavailable");
        for (const policy of ["4","6","8","adaptive"]) {
          signal.throwIfAborted();
          const requestedK=retrievalDecision(query,{topK:policy === "adaptive" ? 4 : Number(policy),strategy:policy === "adaptive" ? "adaptive" : "fixed",adaptiveMaxK:8}).topK;
          const semanticRequestReused=mode!=="local" && cache.has(requestedK);
          const result = await retrieve(policy === "adaptive" ? 4 : Number(policy),policy === "adaptive" ? "adaptive" : "fixed");
          if (mode !== "local" && result.mode !== "s3-vectors") throw new Error("Semantic evaluation unavailable");
          const row:AdminEvaluationRow = { caseId:fixture.id!, category:fixture.category!, policy,
            mode:mode === "auto" ? "runtime-hybrid" : mode === "local" ? "keyword-published-corpus" : "pure-semantic",
            requestedK:result.diagnostics!.requestedK, hit:fixture.answerable===false ? null : legacyHit(fixture,result.chunks),
            independentHitAt3:fixture.answerable===false ? null : legacyHit(fixture,independent.chunks), sourceIds:result.chunks.map(c=>c.id),
            retrievalMs:result.durationMs, qualifyingCount:result.diagnostics!.qualifyingCount, duplicatesRemoved:result.diagnostics!.duplicatesRemoved,
            contextTokenUpperBound:result.diagnostics!.contextTokenUpperBound, redundancy:evidenceRedundancy(result.chunks),
            ...evidenceCoverage(fixture,result.chunks), fallbackReason:result.fallbackReason ?? null, semanticRequestReused };
          report.rows.push(row);
          if (preset === "answers") {
            const instructions = buildPortfolioContext(result); signal.throwIfAborted();
            budget.reserve(JSON.stringify({ instructions,input:messages }),500,generationPrice!);
            const answerStarted=performance.now();
            const answer=await deps.client.responses.create({ model, instructions, input:messages, store:false,
              service_tier:"default", max_output_tokens:500, reasoning:{effort:"low"},text:{verbosity:"medium"} },{signal});
            row.answer={ text:answer.output_text, completed:answer.status==="completed",inputTokens:answer.usage?.input_tokens ?? null,
              outputTokens:answer.usage?.output_tokens ?? null, latencyMs:performance.now()-answerStarted,
              standardRateCostUsd:answer.usage ? priceNanoUsd(answer.usage.input_tokens,answer.usage.output_tokens,generationPrice!)/1e9 : null };
          }
        }
      }
    }
    await deps.verify(corpus,signal); report.indexVerified=true; report.state="complete";
  } catch (error) {
    // Never serialize SDK error payloads, prompts, keys or provider request bodies.
    const message=error instanceof Error ? error.message : "";
    report.stopReason=message.startsWith("Paid evaluation budget exhausted") ? "Stopped before exceeding the $0.05/call/token budget. Partial results only."
      : signal.aborted ? "Stopped at the 20-second time limit. Partial results only."
      : message.startsWith("Index/corpus drift") ? "Published corpus and vector index differ; reindex deliberately before retesting."
      : "Evaluation could not complete. Check configuration, connectivity and index health; provider details were not retained.";
  }
  report.completedAt=new Date().toISOString(); report.elapsedMs=performance.now()-started;
  report.reservedMaximumUsd=budget.reservedNanoUsd/1e9; report.paidCalls=budget.calls;
  return report;
}

// Synthetic answers are transient admin-only output, not persistent telemetry.
export function storedEvaluationReport(report:AdminEvaluationReport) {
  return { ...report, rows:report.rows.map(({answer,...row})=>({...row,...(answer ? {answer:{...answer,text:undefined}} : {})})) };
}
