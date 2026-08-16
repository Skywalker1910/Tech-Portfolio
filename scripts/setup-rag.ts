import {
  CreateIndexCommand,
  CreateVectorBucketCommand,
  DataType,
  DistanceMetric,
  GetIndexCommand,
  GetVectorBucketCommand,
  NotFoundException,
} from "@aws-sdk/client-s3vectors";
import { createS3VectorsClient, getEmbeddingConfig, getRagConfig } from "../lib/rag/config";

async function resourceExists(check: () => Promise<unknown>) {
  try {
    await check();
    return true;
  } catch (error) {
    if (error instanceof NotFoundException) return false;
    throw error;
  }
}

async function main() {
  const rag = getRagConfig();
  const embedding = getEmbeddingConfig();
  if (!rag.vectorBucketName) {
    throw new Error("Set RAG_VECTOR_BUCKET before creating the S3 Vectors resources.");
  }

  const client = createS3VectorsClient();
  try {
    const bucketExists = await resourceExists(() => client.send(new GetVectorBucketCommand({
      vectorBucketName: rag.vectorBucketName,
    })));

    if (!bucketExists) {
      await client.send(new CreateVectorBucketCommand({
        vectorBucketName: rag.vectorBucketName,
      }));
      console.log(`Created vector bucket: ${rag.vectorBucketName}`);
    } else {
      console.log(`Vector bucket already exists: ${rag.vectorBucketName}`);
    }

    const indexExists = await resourceExists(() => client.send(new GetIndexCommand({
      vectorBucketName: rag.vectorBucketName,
      indexName: rag.indexName,
    })));

    if (!indexExists) {
      await client.send(new CreateIndexCommand({
        vectorBucketName: rag.vectorBucketName,
        indexName: rag.indexName,
        dataType: DataType.FLOAT32,
        dimension: embedding.dimensions,
        distanceMetric: DistanceMetric.COSINE,
        metadataConfiguration: {
          nonFilterableMetadataKeys: ["content"],
        },
      }));
      console.log(`Created vector index: ${rag.indexName} (${embedding.dimensions} dimensions)`);
    } else {
      const response = await client.send(new GetIndexCommand({
        vectorBucketName: rag.vectorBucketName,
        indexName: rag.indexName,
      }));
      if (response.index?.dimension !== embedding.dimensions) {
        throw new Error(
          `Index dimension is ${response.index?.dimension}, but OPENAI_EMBEDDING_DIMENSIONS is ${embedding.dimensions}. ` +
          "Create a new index or restore the matching embedding dimension.",
        );
      }
      if (response.index?.distanceMetric !== DistanceMetric.COSINE) {
        throw new Error("The configured vector index must use the cosine distance metric.");
      }
      console.log(`Vector index already exists and is compatible: ${rag.indexName}`);
    }
  } finally {
    client.destroy();
  }
}

main().catch((error) => {
  console.error("RAG setup failed:", error);
  process.exitCode = 1;
});
