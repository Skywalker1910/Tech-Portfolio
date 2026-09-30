import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import OpenAI from "openai";
import originalCases from "../evals/rag-cases.json";
import developmentCases from "../evals/rag-development.json";
import heldoutCases from "../evals/rag-heldout.json";
import { buildPortfolioChunks } from "../lib/rag/knowledge";
import { buildCurrentPortfolioChunks } from "../lib/rag/live-knowledge";
import { retrievePortfolioContext, retrieveFromS3Vectors } from "../lib/rag/retrieval";
import { retrievalDecision, retrievalQuery } from "../lib/rag/policy";
import { ANSWER_RUBRIC, evidenceCoverage, evidenceRedundancy, legacyHit, PaidBudget, parseJudgment, percentile, SCORE_KEYS, type EvalCase } from "../lib/rag/evaluation";
import { buildPortfolioContext } from "../lib/portfolio-context";
import type { RetrievedChunk } from "../lib/rag/types";
import { verifyEvaluationIndex } from "../lib/rag/evaluation-live";
import { getEmbeddingConfig } from "../lib/rag/config";
import { dollarLimit, evaluationPrice, EVALUATION_PRICING, priceNanoUsd } from "../lib/rag/evaluation-pricing";

const args = process.argv.slice(2);
const argument = (key: string, fallback: string) => args.find(arg => arg.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;

async function main() {
  const dryRun = args.includes("--dry-run");
  const requestedLive = args.includes("--live");
  const live = requestedLive && !dryRun;
  const answers = args.includes("--answers") && !dryRun;
  const judge = args.includes("--judge");
  if ((live || answers) && !args.includes("--approve-paid")) throw new Error("Paid evaluation requires explicit --approve-paid; use --dry-run to plan without calls");
  const budgetUsd = Number(argument("budget-usd", "0.05"));
  dollarLimit(budgetUsd);
  const budget = live || answers ? new PaidBudget(Number(argument("max-calls", "0")), Number(argument("max-tokens", "0")), budgetUsd) : null;
  const split = argument("split", "development");
  if (!["development", "heldout", "legacy"].includes(split)) throw new Error("Unknown dataset split");
  const all: EvalCase[] = split === "heldout" ? heldoutCases as EvalCase[] : split === "legacy" ? originalCases : [...originalCases, ...developmentCases] as EvalCase[];
  const limit = Number(argument("limit", String(all.length)));
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("Invalid case limit");
  const caseId = argument("case", "");
  const cases = (caseId ? all.filter(test=>test.id === caseId) : all).slice(0, limit);
  if (!cases.length) throw new Error("Invalid case selection: ID not in selected split");
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.6-terra";
  const embeddingModel = getEmbeddingConfig().model;
  const generationPrice = args.includes("--answers") ? evaluationPrice(model) : null;
  const embeddingPrice = requestedLive ? evaluationPrice(embeddingModel) : null;
  // Freeze one corpus for every strategy/K in this run; no content/index writes.
  const corpus = live ? await buildCurrentPortfolioChunks() : buildPortfolioChunks();
  const corpusHash = createHash("sha256").update(JSON.stringify(corpus)).digest("hex");
  const availableModes = requestedLive ? ["keyword", "semantic", "runtime"] as const : ["keyword", "runtime-disabled"] as const;
  const requestedMode = argument("mode", "all");
  if (requestedMode !== "all" && !availableModes.some(mode=>mode === requestedMode)) throw new Error("Invalid evaluation mode for this environment");
  const modes = availableModes.filter(mode=>requestedMode === "all" || mode === requestedMode);
  const availablePolicies = args.includes("--adaptive") ? [4, 6, 8, "adaptive"] as const : [4, 6, 8] as const;
  const requestedPolicy = argument("policy", "all");
  if (requestedPolicy !== "all" && !availablePolicies.some(policy=>String(policy) === requestedPolicy)) throw new Error("Invalid evaluation policy");
  const policies = availablePolicies.filter(policy=>requestedPolicy === "all" || String(policy) === requestedPolicy);
  const plan = { split, cases:cases.length, corpusHash, corpusChunks:corpus.length, threshold:0.65, contextTokenBudget:12000, modes, policies, model,
    requestedCeilings:{ maxUsd:budgetUsd, maxOpenAICalls:Number(argument("max-calls","0")), maxReservedTokens:Number(argument("max-tokens","0")) },
    pricing:{ generation:generationPrice, embedding:embeddingPrice, embeddingModel, registry:EVALUATION_PRICING },
    plannedEmbeddingCalls:requestedLive ? cases.length * modes.filter(mode=>mode !== "keyword").length * (new Set([3,...policies.flatMap(policy=>policy === "adaptive" ? [3,4,6,8] : [policy])]).size) : 0,
    plannedGenerationCalls:args.includes("--answers") ? cases.length * modes.length * policies.length : 0,
    plannedJudgeCalls:args.includes("--answers") && judge ? cases.length * modes.length * policies.length : 0,
    note:"Dry run/offline never initializes a paid client. Dry-run corpus hash is bundled, not a live corpus attestation. Embedding count is an upper bound (distinct k=3/4/6/8 for each semantic/runtime mode). Call/token ceilings may stop a plan early. Index/corpus drift invalidates live comparison." };
  if (dryRun) { console.log(JSON.stringify({ ...plan, dryRun:true }, null, 2)); return; }
  const client = budget ? new OpenAI({ apiKey:process.env.OPENAI_API_KEY, baseURL:"https://api.openai.com/v1", maxRetries:0, timeout:60000 }) : null;
  const rows: Array<Record<string, unknown>> = [];
  let stopped: string | null = null;
  let indexVerification: unknown = "No AWS/OpenAI calls";
  const generation = async (instructions: string, input: string | OpenAI.Responses.ResponseInput) => {
    budget!.reserve(JSON.stringify({ instructions, input }), 1000, generationPrice!);
    const started = performance.now();
    const response = await client!.responses.create({ model, instructions, input, store:false, service_tier:"default", max_output_tokens:1000, reasoning:{ effort:"low" }, text:{ verbosity:"medium" } });
    return { text:response.output_text, inputTokens:response.usage?.input_tokens ?? null, outputTokens:response.usage?.output_tokens ?? null,
      standardRateCostUsd:response.usage ? priceNanoUsd(response.usage.input_tokens,response.usage.output_tokens,generationPrice!) / 1e9 : null,
      durationMs:performance.now() - started, completed:response.status === "completed" };
  };
  try {
    if (live) indexVerification = { before:await verifyEvaluationIndex(corpus), after:null };
    for (const [index, test] of cases.entries()) {
      const messages = [...(test.history ?? []), { role:"user" as const, content:test.question }];
      const query = retrievalQuery(messages);
      const semanticCache = new Map<number, { chunks:RetrievedChunk[]; durationMs:number }>();
      const semanticSearch = async (q: string, k: number, distance: number) => {
        const cached = semanticCache.get(k);
        if (cached) return cached.chunks;
        budget!.reserve(q, 0, embeddingPrice!);
        const started = performance.now();
        const chunks = await retrieveFromS3Vectors(q, client!, k, distance);
        // Reject drift rather than comparing keyword defaults to a different index.
        if (chunks.some(chunk => !corpus.some(known => known.id === chunk.id && known.content === chunk.content))) throw new Error("Index/corpus drift; reindex separately after review, not during evaluation");
        semanticCache.set(k, { chunks, durationMs:performance.now() - started });
        return chunks;
      };
      for (const mode of modes) {
        semanticCache.clear(); // Separate full live latency for semantic and runtime modes.
        // Independently query k=3: Hit@3 must not mean 'prefix of a larger ANN search'.
        const baseline = await retrievePortfolioContext(query, { mode:mode === "semantic" ? "semantic" : mode === "runtime" ? "s3" : "local", topK:3, corpus,
          settings:{ enabled:live, strategy:"fixed" }, maxDistance:0.65, ...(live && mode !== "keyword" ? { semanticSearch } : {}) });
        if (live && mode !== "keyword" && baseline.mode !== "s3-vectors") throw new Error("Live retrieval fell back; semantic comparison invalid");
        for (const policy of policies) {
          const start = performance.now();
          const effectiveK = retrievalDecision(query, { topK:policy === "adaptive" ? 4 : policy, strategy:policy === "adaptive" ? "adaptive" : "fixed", adaptiveMaxK:8 }).topK;
          const cachedSemantic = live && mode !== "keyword" && semanticCache.has(effectiveK);
          const result = await retrievePortfolioContext(query, { mode:mode === "semantic" ? "semantic" : mode === "runtime" ? "s3" : mode === "runtime-disabled" ? "auto" : "local",
            corpus, settings:{ enabled:live, strategy:"fixed" }, topK:policy === "adaptive" ? 4 : policy, strategy:policy === "adaptive" ? "adaptive" : "fixed", adaptiveMaxK:8,
            contextTokenBudget:12000, maxDistance:0.65, ...(live && mode !== "keyword" ? { semanticSearch } : {}) });
          if (live && mode !== "keyword" && result.mode !== "s3-vectors") throw new Error("Live retrieval fell back or index drifted; comparison invalid");
          const row: Record<string, unknown> = { id:test.id ?? `legacy-${index + 1}`, category:test.category ?? "general", mode, actualMode:result.mode,
            fallbackReason:result.fallbackReason ?? null, policy, answerable:test.answerable !== false,
            hit3:test.answerable === false ? null : legacyHit(test, baseline.chunks),
            hitAtK:test.answerable === false ? null : legacyHit(test, result.chunks), ...evidenceCoverage(test, result.chunks),
            retrievalMs:result.durationMs, semanticSearchMs:semanticCache.get(result.diagnostics!.requestedK)?.durationMs ?? null,
            cachedSemantic, qualifyingCount:result.diagnostics?.qualifyingCount, returnedCount:result.chunks.length,
            duplicatesRemoved:result.diagnostics?.duplicatesRemoved, budgetDropped:result.diagnostics?.budgetDropped, contextTokenUpperBound:result.diagnostics?.contextTokenUpperBound,
            redundancy:evidenceRedundancy(result.chunks),
            sourceIds:result.chunks.map(chunk => chunk.id), sourceRoutes:result.chunks.map(chunk => chunk.href),
            humanReview:{ status:"not-reviewed", factualAccuracy:null, groundedness:null, completeness:null, relevance:null, appropriateRefusal:null } };
          rows.push(row); // Retain paid usage already obtained if a later judge call fails/stops.
          if (answers) { try {
            const answer = await generation(buildPortfolioContext(result), messages);
            row.answer = answer; // Synthetic fixtures only, local artifact; never analytics.
            if (judge) {
              const judgment = await generation(ANSWER_RUBRIC, JSON.stringify({ question:messages, answerable:test.answerable !== false, reviewNotes:test.reviewNotes,
                expectedTerms:test.expectedTerms, evidence:result.chunks.map(chunk => ({ content:chunk.content, href:chunk.href })), candidateAnswer:answer.text }));
              const assessment = { ...judgment, scores:null as Record<string,unknown> | null, status:"unverified-model-judgment" };
              row.automatedJudgment = assessment;
              assessment.scores = judgment.completed ? parseJudgment(judgment.text) : null;
            }
          } finally { row.endToEndMs = performance.now() - start; }
          }
        }
      }
    }
    if (live) indexVerification = { ...(indexVerification as object), after:await verifyEvaluationIndex(corpus) };
  } catch (error) { const known = error instanceof Error && /^(Paid evaluation budget exhausted|Index\/corpus drift|Live retrieval fell back|Invalid automated judgment)/.test(error.message) ? error.message : "Service or judgment parsing error (request details omitted)";
    stopped = `Run incomplete: ${known}. Do not compare this as a complete run.`; process.exitCode = 1; }
  const mean = (items: Array<Record<string, unknown>>, key: string) => { const values = items.flatMap(item => typeof item[key] === "number" ? [item[key] as number] : []); return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null; };
  const summaries = modes.flatMap(mode => policies.flatMap(policy => ["all", ...new Set(cases.map(test => test.category ?? "general"))].map(category => {
    const items = rows.filter(row => row.mode === mode && row.policy === policy && (category === "all" || row.category === category));
    const scored = items.filter(row => row.answerable);
    const judgments = items.flatMap(row => row.automatedJudgment ? [(row.automatedJudgment as { scores:Record<string, unknown>|null }).scores].filter(Boolean) as Array<Record<string, unknown>> : []);
    const generations = items.flatMap(row => row.answer ? [row.answer as Record<string,unknown>] : []);
    const judgeCalls = items.flatMap(row => row.automatedJudgment ? [row.automatedJudgment as Record<string,unknown>] : []);
    const tokenTotals = (calls:Array<Record<string,unknown>>) => ({ inputTokens:calls.length && calls.every(call=>typeof call.inputTokens === "number") ? calls.reduce((total,call)=>total+Number(call.inputTokens),0) : null,
      outputTokens:calls.length && calls.every(call=>typeof call.outputTokens === "number") ? calls.reduce((total,call)=>total+Number(call.outputTokens),0) : null });
    return { mode, policy, category, n:items.length, positiveCases:scored.length,
      hit3:scored.length ? scored.filter(row => row.hit3).length / scored.length : null,
      hitAtK:scored.length ? scored.filter(row => row.hitAtK).length / scored.length : null,
      termCoverage:mean(items,"termCoverage"), routeCoverage:mean(items,"routeCoverage"), qualifyingCount:mean(items,"qualifyingCount"), returnedCount:mean(items,"returnedCount"), duplicatesRemoved:mean(items,"duplicatesRemoved"), redundancy:mean(items,"redundancy"),
      retrievalMeanMs:mean(items,"retrievalMs"), retrievalP95Ms:percentile(items.map(row => Number(row.retrievalMs)), .95),
      automatedScores:Object.fromEntries(SCORE_KEYS.map(key => [key, mean(judgments,key)])), humanReview:"not-reviewed",
      generationUsage:tokenTotals(generations), judgeUsage:tokenTotals(judgeCalls), endToEndMeanMs:mean(items,"endToEndMs"),
      completedAnswers:generations.filter(call=>call.completed).length, generatedAnswers:generations.length };
  })));
  const report = { ...plan, environment:live ? "live-semantic-and-runtime" : "offline-keyword-only", timestamp:new Date().toISOString(), stopped,
    reservedCostUpperBoundUsd:budget ? budget.reservedNanoUsd / 1_000_000_000 : 0,
    indexVerification, budget, summaries, rows };
  await mkdir("artifacts/rag", { recursive:true });
  const variant = `${live ? "-live" : answers ? "-answers" : ""}${requestedMode !== "all" ? `-${requestedMode}` : ""}${requestedPolicy !== "all" ? `-k${requestedPolicy}` : ""}`;
  await writeFile(`artifacts/rag/comparison-${split}${args.includes("--adaptive") ? "-adaptive" : ""}${variant}.json`, JSON.stringify(report,null,2));
  console.table(summaries.filter(row => row.category === "all"));
  console.log(stopped ?? "Complete. This is retrieval evidence coverage, not proof of answer quality.");
  if (budget) console.log(`Reserved OpenAI cost upper bound: $${(budget.reservedNanoUsd/1e9).toFixed(6)} / $${budgetUsd.toFixed(6)}. AWS reads, taxes, other traffic, and future price changes are not covered by this local model-cost guard.`);
}

main().catch(error => { const safe = error instanceof Error && /^(Paid evaluation requires|Explicit positive|Unknown dataset split|Invalid case|Invalid evaluation|Evaluation dollar budget|Unverified evaluation pricing)/.test(error.message) ? error.message : "Evaluation refused or failed. Check flags/configuration; no secrets or request bodies are logged.";
  console.error(safe); process.exitCode = 1; });
