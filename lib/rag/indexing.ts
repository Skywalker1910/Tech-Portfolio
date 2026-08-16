import { DeleteVectorsCommand, ListVectorsCommand, PutVectorsCommand } from "@aws-sdk/client-s3vectors";
import OpenAI from "openai";
import { createS3VectorsClient, getEmbeddingConfig, getRagConfig } from "./config";
import { buildCurrentPortfolioChunks } from "./live-knowledge";

const EMBEDDING_BATCH_SIZE = 32;
const VECTOR_BATCH_SIZE = 100;
const batches = <T>(items:T[], size:number) => Array.from({ length:Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

async function listKeys(client: ReturnType<typeof createS3VectorsClient>, bucket:string, index:string) {
  const keys:string[] = []; let nextToken:string | undefined;
  do { const result = await client.send(new ListVectorsCommand({ vectorBucketName:bucket, indexName:index, maxResults:500, nextToken })); keys.push(...(result.vectors ?? []).flatMap((v) => v.key ? [v.key] : [])); nextToken = result.nextToken; } while (nextToken);
  return keys;
}

export async function indexPortfolioKnowledge() {
  if (!process.env.OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY before indexing.");
  const rag = getRagConfig(); const embeddingConfig = getEmbeddingConfig();
  if (!rag.vectorBucketName) throw new Error("Set RAG_VECTOR_BUCKET before indexing.");
  const chunks = await buildCurrentPortfolioChunks();
  const openai = new OpenAI({ apiKey:process.env.OPENAI_API_KEY });
  const embeddings:number[][] = [];
  for (const batch of batches(chunks, EMBEDDING_BATCH_SIZE)) {
    const response = await openai.embeddings.create({ model:embeddingConfig.model, input:batch.map((c) => c.searchText), dimensions:embeddingConfig.dimensions, encoding_format:"float" });
    embeddings.push(...response.data.sort((a,b) => a.index - b.index).map((item) => item.embedding));
  }
  if (embeddings.length !== chunks.length) throw new Error(`Expected ${chunks.length} embeddings, received ${embeddings.length}.`);
  const client = createS3VectorsClient();
  try {
    const existing = await listKeys(client, rag.vectorBucketName, rag.indexName);
    const vectors = chunks.map((chunk, i) => ({ key:chunk.id, data:{ float32:embeddings[i] }, metadata:{ documentId:chunk.documentId, title:chunk.title, section:chunk.section, href:chunk.href, content:chunk.content, embeddingModel:embeddingConfig.model } }));
    for (const batch of batches(vectors, VECTOR_BATCH_SIZE)) await client.send(new PutVectorsCommand({ vectorBucketName:rag.vectorBucketName, indexName:rag.indexName, vectors:batch }));
    const current = new Set(chunks.map((chunk) => chunk.id)); const stale = existing.filter((key) => !current.has(key));
    for (const batch of batches(stale, VECTOR_BATCH_SIZE)) await client.send(new DeleteVectorsCommand({ vectorBucketName:rag.vectorBucketName, indexName:rag.indexName, keys:batch }));
    return { chunks:chunks.length, removed:stale.length, model:embeddingConfig.model, dimensions:embeddingConfig.dimensions, bucket:rag.vectorBucketName, index:rag.indexName };
  } finally { client.destroy(); }
}

export async function countIndexedVectors() {
  const rag = getRagConfig(); if (!rag.vectorBucketName) return 0;
  const client = createS3VectorsClient();
  try { return (await listKeys(client, rag.vectorBucketName, rag.indexName)).length; } finally { client.destroy(); }
}
