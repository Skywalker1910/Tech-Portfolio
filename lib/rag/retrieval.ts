import { QueryVectorsCommand } from "@aws-sdk/client-s3vectors";
import OpenAI from "openai";
import { buildPortfolioChunks } from "./knowledge";
import { createS3VectorsClient, getEmbeddingConfig, getRagConfig } from "./config";
import type { ChatSource, RetrievalResult, RetrievedChunk } from "./types";
import { buildCurrentPortfolioChunks } from "./live-knowledge";
import { getRagRuntimeSettings } from "@/lib/content/repository";

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

type RetrievalOptions = {
  mode?: "auto" | "local" | "s3";
  openai?: OpenAI;
  topK?: number;
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

async function createQueryEmbedding(openai: OpenAI, query: string) {
  const { model, dimensions } = getEmbeddingConfig();
  const response = await openai.embeddings.create({
    model,
    input: query.replace(/\s+/g, " ").trim(),
    dimensions,
    encoding_format: "float",
  });
  return response.data[0]?.embedding ?? [];
}

async function retrieveFromS3Vectors(
  query: string,
  openai: OpenAI,
  topK: number,
  maxDistance: number,
): Promise<RetrievedChunk[]> {
  const config = getRagConfig();
  const embedding = await createQueryEmbedding(openai, query);
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
    }));

    return (response.vectors ?? []).flatMap((vector) => {
      const content = metadataString(vector.metadata, "content");
      const title = metadataString(vector.metadata, "title");
      const section = metadataString(vector.metadata, "section");
      const href = metadataString(vector.metadata, "href");
      const documentId = metadataString(vector.metadata, "documentId");
      if (!vector.key || !content || !title || !section || !href || !documentId) return [];
      if (typeof vector.distance === "number" && vector.distance > maxDistance) return [];

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
  if (requestedMode === "local") {
    return { mode:"local-keyword", chunks:retrieveLocally(query, options.topK ?? config.topK), durationMs:performance.now() - startedAt, fallbackReason:"disabled" };
  }
  const runtime = await getRagRuntimeSettings();
  const topK = options.topK ?? runtime?.topK ?? config.topK;
  const enabled = runtime?.enabled ?? config.enabled;
  const maxDistance = runtime?.maxDistance ?? config.maxDistance;
  const liveChunks = await buildCurrentPortfolioChunks();
  const useS3 = requestedMode === "s3" || (requestedMode === "auto" && enabled);

  if (!useS3) {
    return {
      mode: "local-keyword",
      chunks: retrieveLocally(query, topK, liveChunks),
      durationMs: performance.now() - startedAt,
      fallbackReason: "disabled",
    };
  }

  if (!config.vectorBucketName || !process.env.OPENAI_API_KEY) {
    return {
      mode: "local-keyword",
      chunks: retrieveLocally(query, topK, liveChunks),
      durationMs: performance.now() - startedAt,
      fallbackReason: "missing-config",
    };
  }

  try {
    const openai = options.openai ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const semanticChunks = await retrieveFromS3Vectors(query, openai, topK, maxDistance);
    // Hybrid retrieval keeps exact page/topic matches (for example, "projects")
    // alongside semantic S3 Vector matches instead of letting generic summaries crowd them out.
    const lexicalChunks = retrieveLocally(query, Math.min(2, topK), liveChunks);
    const seen = new Set<string>();
    const chunks = [...lexicalChunks, ...semanticChunks].filter((chunk) => {
      if (seen.has(chunk.id)) return false;
      seen.add(chunk.id);
      return true;
    }).slice(0, topK);
    return {
      mode: "s3-vectors",
      chunks,
      durationMs: performance.now() - startedAt,
    };
  } catch (error) {
    console.error("[portfolio-rag] S3 Vectors query failed; using local retrieval.", error);
    return {
      mode: "local-keyword",
      chunks: retrieveLocally(query, topK, liveChunks),
      durationMs: performance.now() - startedAt,
      fallbackReason: "query-failed",
    };
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
