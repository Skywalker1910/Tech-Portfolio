# BB-8 Portfolio RAG

BB-8 uses a small retrieval-augmented generation pipeline designed for a portfolio-sized corpus:

1. Stable profile facts live in `data/portfolio-knowledge.json`; published projects and experience come from the shared content repository with bundled fallback data.
2. `lib/rag/live-knowledge.ts` creates the current corpus and `lib/rag/knowledge.ts` performs deterministic, section-aware chunking.
3. `scripts/index-rag.ts` generates 1,024-dimensional OpenAI `text-embedding-3-small` embeddings.
4. Amazon S3 Vectors stores the embeddings and returns the nearest portfolio chunks for each query.
5. The retriever merges those semantic matches with up to two strong local keyword matches. This hybrid step keeps exact topics such as Projects or Experience from being crowded out by generic summary chunks.
6. `/api/chat` supplies only those verified chunks to the OpenAI Responses API.
7. The chat UI shows links to the retrieved portfolio pages.

If S3 Vectors is disabled, missing, or temporarily unavailable, the app uses a deterministic local keyword retriever over the same verified corpus. The response payload reports the active retrieval mode, match count, latency, and whether fallback occurred.

## Local setup

Copy the RAG variables from `.env.example` into `.env.local`. Choose a globally unique, lowercase vector bucket name, then run:

```powershell
npm run rag:setup
npm run rag:index
npm run rag:evaluate:s3
```

After indexing succeeds, set `RAG_ENABLED=true` and restart `npm run dev`. To update stable profile knowledge later, edit `data/portfolio-knowledge.json` and rerun `npm run rag:index`. Project and experience edits are included automatically in the next sync. The same sync is available from **Admin → RAG Control**. The indexer upserts current chunks and removes stale keys from this dedicated index.

`npm run rag:evaluate` evaluates the no-cost local fallback. `npm run rag:evaluate:s3` evaluates OpenAI embedding plus S3 Vectors retrieval. Both report Hit@3, mean retrieval latency, and P95 latency over the 27 cases in `evals/rag-cases.json`.

## AWS permissions

Use separate runtime and indexing permissions where practical. Replace the region, account ID, bucket, and index placeholders in these examples.

The Amplify runtime needs only query access plus `GetVectors`, because BB-8 requests metadata with each result:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3vectors:QueryVectors",
        "s3vectors:GetVectors"
      ],
      "Resource": "arn:aws:s3vectors:us-east-1:ACCOUNT_ID:bucket/BUCKET_NAME/index/portfolio-knowledge"
    }
  ]
}
```

The identity used for setup and indexing additionally needs `CreateVectorBucket`, `GetVectorBucket`, `CreateIndex`, `GetIndex`, `PutVectors`, `ListVectors`, and `DeleteVectors`. Scope index operations to the index ARN and bucket operations to the bucket ARN. The setup script creates resources only when they do not already exist and validates the index dimension and cosine metric.

Prefer an Amplify compute/service role with the runtime policy. For local scripts, the AWS SDK can use `APP_AWS_ACCESS_KEY_ID`, `APP_AWS_SECRET_ACCESS_KEY`, and `APP_AWS_REGION`, or the standard AWS credential provider chain.

## Retrieval tuning

- `RAG_TOP_K` controls how many chunks are supplied to the model; the default is 4.
- `RAG_MAX_DISTANCE` drops weak cosine-distance matches; lower is stricter. The measured portfolio baseline is 0.65, tuned against the evaluation set.
- `OPENAI_EMBEDDING_DIMENSIONS` is 1,024 by default. Changing it requires a new compatible S3 Vectors index and reindexing.
- Keep chunks factual and independently understandable. Do not add instructions or secrets to the corpus.

`enabled`, `topK`, and `maxDistance` can be changed safely at runtime from RAG Control and are stored in the portfolio DynamoDB table. The embedding model, dimensions, vector bucket, and index stay deployment-level settings because changing them requires a compatible index and full reindex.

The chat generation model remains configurable with `OPENAI_CHAT_MODEL`. Embeddings and generation are separate API calls and can use different models.

## Conversation and agent actions

The browser keeps the visible transcript for the current tab, but sends only the latest six messages (roughly three turns) to `/api/chat`. The server enforces the same limit and retrieves against only the two latest user messages. This short working window keeps BB-8 focused and caps token usage without discarding the visitor's visible history.

BB-8 uses strict Responses API function tools for three client-side actions: portfolio navigation, a resume download offer, and a contact-form draft. Tool arguments are validated again by the server before they reach the browser. Contact drafts are held in same-tab `sessionStorage`, prefilled on `/contact`, and never submitted automatically; the visitor must review and send the form.
