import { S3VectorsClient } from "@aws-sdk/client-s3vectors";

const DEFAULT_EMBEDDING_DIMENSIONS = 1_024;

function parseInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function parseNumber(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

export function getEmbeddingConfig() {
  return {
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    dimensions: parseInteger(
      process.env.OPENAI_EMBEDDING_DIMENSIONS,
      DEFAULT_EMBEDDING_DIMENSIONS,
      1,
      4_096,
    ),
  };
}

export function getRagConfig() {
  return {
    enabled: process.env.RAG_ENABLED === "true",
    vectorBucketName: process.env.RAG_VECTOR_BUCKET?.trim() ?? "",
    indexName: process.env.RAG_VECTOR_INDEX?.trim() || "portfolio-knowledge",
    topK: parseInteger(process.env.RAG_TOP_K, 4, 1, 10),
    maxDistance: parseNumber(process.env.RAG_MAX_DISTANCE, 0.6, 0, 2),
  };
}

export function createS3VectorsClient() {
  const region =
    process.env.APP_AWS_REGION ??
    process.env.AWS_REGION ??
    process.env.REGION ??
    "us-east-1";
  const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY;

  return new S3VectorsClient({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}
