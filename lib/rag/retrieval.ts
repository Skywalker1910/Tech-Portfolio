import { QueryVectorsCommand } from "@aws-sdk/client-s3vectors";
import OpenAI from "openai";
import { buildPortfolioChunks } from "./knowledge";
import { createS3VectorsClient, getEmbeddingConfig, getRagConfig } from "./config";
import type { ChatSource, RetrievalResult, RetrievedChunk } from "./types";
import { buildCurrentPortfolioChunks } from "./live-knowledge";
import { getRagRuntimeSettings } from "@/lib/content/repository";
import { budgetEvidence, qualifiesDistance, retrievalDecision, uniqueEvidence, type RetrievalPolicy } from "./policy";
import type { PortfolioChunk } from "./types";

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "can", "did", "do", "does",
  "for", "from", "has", "have", "he", "her", "him", "his", "how", "i", "in", "is",
  "it", "me", "more", "of", "on", "or", "please", "she", "tell", "that", "the", "their",
  "them", "they", "this", "to", "us", "was", "what", "when", "where", "which", "who",
  "with", "would", "you", "your",
]);

const QUERY_EXPANSIONS: Record<string, string[]> = {
  career: ["experience", "work", "role"],
  contact: ["email", "reach", "linkedin"],
  course: ["education", "coursework", "degree"],
  education: ["degree", "university", "school", "gpa"],
  email: ["contact", "reach"],
  experience: ["work", "role", "career"],
  job: ["experience", "work", "role"],
  project: ["projects", "built", "system"],
  projects: ["project", "built", "system"],
  reach: ["contact", "email", "linkedin"],
  school: ["education", "university", "degree"],
  skill: ["skills", "technology", "stack"],
  skills: ["skill", "technology", "stack"],
  social: ["linkedin", "github", "contact"],
  technology: ["skills", "stack", "tools"],
  work: ["experience", "role", "career"],
};

export type RetrievalOptions = RetrievalPolicy & {
  mode?: "auto" | "local" | "s3" | "semantic";
  openai?: OpenAI;
  maxDistance?: number;
  // Injection isolates offline evaluation/tests from DynamoDB and paid services.
  corpus?: PortfolioChunk[];
  settings?: RetrievalPolicy & { enabled?: boolean; maxDistance?: number };
  semanticSearch?: (query: string, topK: number, maxDistance: number) => Promise<RetrievedChunk[]>;
};

function tokenize(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  const expanded = base.flatMap((token) => [token, ...(QUERY_EXPANSIONS[token] ?? [])]);
  return [...new Set(expanded)];
}

function countToken(haystack: string, token: string) {
  const pattern = new RegExp(`(^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "g");
  return haystack.match(pattern)?.length ?? 0;
}

export function retrieveLocally(query: string, topK = 4, chunks = buildPortfolioChunks()): RetrievedChunk[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const documentFrequency = new Map<string, number>();
  for (const token of queryTokens) {
    documentFrequency.set(
      token,
      chunks.filter((chunk) => chunk.searchText.toLowerCase().includes(token)).length,
    );
  }

  return chunks
    .map((chunk) => {
      const title = `${chunk.title} ${chunk.section}`.toLowerCase();
      const content = chunk.content.toLowerCase();
      let score = 0;

      for (const token of queryTokens) {
        const idf = Math.log((chunks.length + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1;
        score += countToken(content, token) * idf;
        score += countToken(title, token) * idf * 3;
      }

      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").trim();
      if (normalizedQuery.length >= 8 && content.includes(normalizedQuery)) score += 8;
      return { ...chunk, score };
    })
    .filter((chunk) => (chunk.score ?? 0) >= 1)
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
    .slice(0, topK);
}

function metadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object") return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function createQueryEmbedding(openai: OpenAI, query: string, signal?: AbortSignal) {
  const { model, dimensions } = getEmbeddingConfig();
  const response = await openai.embeddings.create({
    model,
    input: query.replace(/\s+/g, " ").trim(),
    dimensions,
    encoding_format: "float",
  }, { signal });
  return response.data[0]?.embedding ?? [];
}

export async function retrieveFromS3Vectors(
  query: string,
  openai: OpenAI,
  topK: number,
  maxDistance: number,
  signal?: AbortSignal,
): Promise<RetrievedChunk[]> {
  const config = getRagConfig();
  const embedding = await createQueryEmbedding(openai, query, signal);
  if (embedding.length === 0) throw new Error("OpenAI returned an empty query embedding.");

  const client = createS3VectorsClient();
  try {
    const response = await client.send(new QueryVectorsCommand({
      vectorBucketName: config.vectorBucketName,
      indexName: config.indexName,
      queryVector: { float32: embedding },
      topK,
      returnDistance: true,
      returnMetadata: true,
    }), { abortSignal:signal });

    return (response.vectors ?? []).flatMap((vector) => {
      const content = metadataString(vector.metadata, "content");
      const title = metadataString(vector.metadata, "title");
      const section = metadataString(vector.metadata, "section");
      const href = metadataString(vector.metadata, "href");
      const documentId = metadataString(vector.metadata, "documentId");
      if (!vector.key || !content || !title || !section || !href || !documentId) return [];
      if (!Number.isFinite(vector.distance) || vector.distance! > maxDistance) return [];

      const chunk: RetrievedChunk = {
        id: vector.key,
        documentId,
        title,
        section,
        href,
        content,
        searchText: `${title}\n${section}\n${content}`,
        distance: vector.distance,
      };
      return [chunk];
    });
  } finally {
    client.destroy();
  }
}

export async function retrievePortfolioContext(
  query: string,
  options: RetrievalOptions = {},
): Promise<RetrievalResult> {
  const startedAt = performance.now();
  const config = getRagConfig();
  const requestedMode = options.mode ?? "auto";
  const runtime = requestedMode === "local" ? null : options.settings ?? await getRagRuntimeSettings();
  const policy = { ...config, ...runtime, ...options };
  const { topK, reason } = retrievalDecision(query, policy);
  const enabled = runtime?.enabled ?? config.enabled;
  const maxDistance = options.maxDistance ?? runtime?.maxDistance ?? config.maxDistance;
  const liveChunks = options.corpus ?? (requestedMode === "local" ? buildPortfolioChunks() : await buildCurrentPortfolioChunks());
  const useS3 = requestedMode === "s3" || requestedMode === "semantic" || (requestedMode === "auto" && enabled);
  const finish = (mode: RetrievalResult["mode"], candidates: RetrievedChunk[], fallbackReason?: RetrievalResult["fallbackReason"]): RetrievalResult => {
    const unique = uniqueEvidence(candidates);
    const budget = budgetEvidence(unique.slice(0, topK), policy.contextTokenBudget);
    return { mode, chunks:budget.chunks, durationMs:performance.now() - startedAt, fallbackReason,
      diagnostics:{ requestedK:topK, decision:reason, qualifyingCount:candidates.length,
        duplicatesRemoved:candidates.length - unique.length, budgetDropped:Math.min(unique.length, topK) - budget.chunks.length,
        contextTokenUpperBound:budget.tokenUpperBound, contextTokenBudget:budget.budget } };
  };

  if (!useS3) {
    return finish("local-keyword", retrieveLocally(query, liveChunks.length, liveChunks), "disabled");
  }

  if (!options.semanticSearch && (!config.vectorBucketName || !process.env.OPENAI_API_KEY)) {
    return finish("local-keyword", retrieveLocally(query, liveChunks.length, liveChunks), "missing-config");
  }

  try {
    const search = options.semanticSearch ?? ((q: string, k: number, distance: number) => retrieveFromS3Vectors(q, options.openai ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), k, distance));
    const semanticChunks = (await search(query, topK, maxDistance)).filter(chunk => qualifiesDistance(chunk, maxDistance));
    // Hybrid retrieval keeps exact page/topic matches (for example, "projects")
    // alongside semantic S3 Vector matches instead of letting generic summaries crowd them out.
    const lexicalChunks = requestedMode === "semantic" ? [] : retrieveLocally(query, Math.min(2, topK), liveChunks);
    return finish("s3-vectors", requestedMode === "semantic" ? semanticChunks : [...lexicalChunks, ...semanticChunks]);
  } catch {
    console.error("[portfolio-rag] S3 Vectors query failed; using local retrieval.");
    return finish("local-keyword", retrieveLocally(query, liveChunks.length, liveChunks), "query-failed");
  }
}

export function getChatSources(chunks: RetrievedChunk[]): ChatSource[] {
  const seen = new Set<string>();
  return chunks.flatMap((chunk) => {
    const key = chunk.href;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ title: chunk.title, section: chunk.section, href: chunk.href }];
  });
}
