import casesJson from "../evals/rag-cases.json";
import { retrievePortfolioContext } from "../lib/rag/retrieval";
import OpenAI from "openai";
import { PaidBudget } from "../lib/rag/evaluation";
import { getEmbeddingConfig } from "../lib/rag/config";
import { evaluationPrice } from "../lib/rag/evaluation-pricing";

type EvalCase = {
  category?: string;
  question: string;
  expectedRoutes: string[];
  expectedTerms?: string[];
};

function percentile(values: number[], fraction: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function main() {
  const useS3 = process.argv.includes("--s3");
  if (useS3 && process.argv.includes("--dry-run")) { console.log("Dry run: legacy Hit@3 would query 83 cases using live embeddings and hybrid retrieval. No calls made. Use rag:compare for a budget-bounded live comparison."); return; }
  if (useS3 && !process.argv.includes("--approve-paid")) throw new Error("Live embeddings require explicit --approve-paid. Use rag:compare --dry-run for a budgeted plan.");
  const usd = Number(process.argv.find(arg=>arg.startsWith("--budget-usd="))?.split("=")[1] ?? ".05");
  const budget = useS3 ? new PaidBudget(83,100000,usd) : null;
  const price = useS3 ? evaluationPrice(getEmbeddingConfig().model) : null;
  const openai = useS3 ? new OpenAI({ apiKey:process.env.OPENAI_API_KEY, maxRetries:0, baseURL:"https://api.openai.com/v1" }) : undefined;
  const cases = casesJson as EvalCase[];
  const rows: Array<Record<string, string | number>> = [];
  let hits = 0;

  for (const testCase of cases) {
    if (budget) budget.reserve(testCase.question,0,price!);
    const result = await retrievePortfolioContext(testCase.question, {
      mode: useS3 ? "s3" : "local",
      topK: 3,
      strategy: "fixed",
      openai,
    });
    const routes = [...new Set(result.chunks.map((chunk) => chunk.href))];
    const routeHit = routes.some((route) => testCase.expectedRoutes.includes(route));
    const evidence = result.chunks.map((chunk) => chunk.searchText).join("\n").toLowerCase();
    const evidenceHit = !testCase.expectedTerms?.length
      || testCase.expectedTerms.every((term) => evidence.includes(term.toLowerCase()));
    const hit = routeHit && evidenceHit;
    if (hit) hits += 1;
    rows.push({
      result: hit ? "PASS" : "MISS",
      category: testCase.category ?? "general",
      expected: testCase.expectedRoutes.join(" | "),
      evidence: evidenceHit ? "yes" : `missing: ${testCase.expectedTerms?.join(" | ")}`,
      retrieved: routes.join(" | ") || "none",
      latencyMs: Math.round(result.durationMs),
      question: testCase.question,
      actualMode:result.mode,
      fallback:result.fallbackReason ?? "none",
    });
  }

  console.table(rows);
  const latencies = rows.map((row) => Number(row.latencyMs));
  console.log(`Requested mode: ${useS3 ? "S3 Vectors hybrid + OpenAI embeddings (paid)" : "offline local keyword"}; actual modes and fallback reasons are listed per row.`);
  console.log(`Hit@3: ${hits}/${cases.length} (${((hits / cases.length) * 100).toFixed(1)}%)`);
  console.log(`Mean retrieval latency: ${(latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(1)} ms`);
  console.log(`P95 retrieval latency: ${percentile(latencies, 0.95)} ms`);
  if (hits !== cases.length) process.exitCode = 1;
  if (budget) console.log(`Reserved OpenAI embedding cost upper bound: $${(budget.reservedNanoUsd/1e9).toFixed(6)} / $${usd.toFixed(2)}.`);
}

main().catch(() => {
  console.error("RAG evaluation failed or budget/configuration rejected; request details omitted.");
  process.exitCode = 1;
});
