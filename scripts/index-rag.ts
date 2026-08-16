import { indexPortfolioKnowledge } from "../lib/rag/indexing";

async function main() {
  const result = await indexPortfolioKnowledge();
  console.log(`Indexed ${result.chunks} chunks into ${result.bucket}/${result.index}${result.removed ? ` and removed ${result.removed} stale vectors.` : "."}`);
}

main().catch((error) => {
  console.error("RAG indexing failed:", error);
  process.exitCode = 1;
});
