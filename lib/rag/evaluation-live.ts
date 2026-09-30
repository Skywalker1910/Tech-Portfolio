import { ListVectorsCommand } from "@aws-sdk/client-s3vectors";
import { createS3VectorsClient, getEmbeddingConfig, getRagConfig } from "./config";
import type { PortfolioChunk } from "./types";

// Read-only, called ONLY by the explicitly approved live comparison harness.
// Verify the complete indexed corpus, not merely the nearest retrieved subset.
export async function verifyEvaluationIndex(corpus: PortfolioChunk[], signal?: AbortSignal) {
  const config = getRagConfig();
  if (!config.vectorBucketName) throw new Error("Index/corpus drift: no configured index");
  const client = createS3VectorsClient();
  const expected = new Map(corpus.map(chunk => [chunk.id, chunk]));
  const seen = new Set<string>();
  let nextToken: string | undefined;
  let pages = 0;
  try {
    do {
      if (++pages > 20) throw new Error("Index/corpus drift: evaluation snapshot exceeds 10,000-vector safety limit");
      const response = await client.send(new ListVectorsCommand({ vectorBucketName:config.vectorBucketName, indexName:config.indexName,
        maxResults:500, returnMetadata:true, nextToken }), { abortSignal:signal });
      for (const vector of response.vectors ?? []) {
        const chunk = expected.get(vector.key ?? "");
        const metadata = vector.metadata as Record<string, unknown> | undefined;
        if (!chunk || !metadata || seen.has(chunk.id) ||
          ["content", "title", "section", "href", "documentId"].some(key => metadata[key] !== chunk[key as keyof PortfolioChunk]) ||
          metadata.embeddingModel !== getEmbeddingConfig().model) throw new Error("Index/corpus drift: full index metadata does not match frozen current corpus");
        seen.add(chunk.id);
      }
      nextToken = response.nextToken;
    } while (nextToken);
    if (seen.size !== corpus.length) throw new Error("Index/corpus drift: missing vectors in full index snapshot");
    return { vectors:seen.size, pages, verifiedFields:["id","content","title","section","href","documentId","embeddingModel"] };
  } finally { client.destroy(); }
}
