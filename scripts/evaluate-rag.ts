import casesJson from "../evals/rag-cases.json";
import { retrievePortfolioContext } from "../lib/rag/retrieval";

type EvalCase = {
  question: string;
  expectedRoutes: string[];
};

function percentile(values: number[], fraction: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function main() {
  const useS3 = process.argv.includes("--s3");
  const cases = casesJson as EvalCase[];
  const rows: Array<Record<string, string | number>> = [];
  let hits = 0;

  for (const testCase of cases) {
    const result = await retrievePortfolioContext(testCase.question, {
      mode: useS3 ? "s3" : "local",
      topK: 3,
    });
    const routes = [...new Set(result.chunks.map((chunk) => chunk.href))];
    const hit = routes.some((route) => testCase.expectedRoutes.includes(route));
    if (hit) hits += 1;
    rows.push({
      result: hit ? "PASS" : "MISS",
      expected: testCase.expectedRoutes.join(" | "),
      retrieved: routes.join(" | ") || "none",
      latencyMs: Math.round(result.durationMs),
      question: testCase.question,
    });
  }

  console.table(rows);
  const latencies = rows.map((row) => Number(row.latencyMs));
  console.log(`Mode: ${useS3 ? "S3 Vectors + OpenAI embeddings" : "local keyword fallback"}`);
  console.log(`Hit@3: ${hits}/${cases.length} (${((hits / cases.length) * 100).toFixed(1)}%)`);
  console.log(`Mean retrieval latency: ${(latencies.reduce((sum, value) => sum + value, 0) / latencies.length).toFixed(1)} ms`);
  console.log(`P95 retrieval latency: ${percentile(latencies, 0.95)} ms`);
  if (hits !== cases.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error("RAG evaluation failed:", error);
  process.exitCode = 1;
});
