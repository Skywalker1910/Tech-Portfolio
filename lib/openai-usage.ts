const OPENAI_API_BASE = "https://api.openai.com/v1";
const CACHE_TTL_MS = 5 * 60_000;

type UsageResult = {
  input_tokens?:number;
  output_tokens?:number;
  input_cached_tokens?:number;
  num_model_requests?:number;
  model?:string|null;
  project_id?:string|null;
};

type CostResult = {
  amount?:{ value?:number; currency?:string };
  line_item?:string|null;
  project_id?:string|null;
};

type UsageBucket<T> = { start_time:number; end_time:number; results?:T[] };
type UsagePage<T> = { data?:UsageBucket<T>[]; has_more?:boolean; next_page?:string|null };

export type OpenAIUsageReport = {
  configured:true;
  scope:{ type:"project"|"organization"; projectId:string|null };
  generatedAt:string;
  days:number;
  totals:{
    requests:number;
    completionRequests:number;
    embeddingRequests:number;
    inputTokens:number;
    outputTokens:number;
    cachedInputTokens:number;
    totalTokens:number;
    costUsd:number;
  };
  daily:Array<{
    day:string;
    completionRequests:number;
    embeddingRequests:number;
    inputTokens:number;
    outputTokens:number;
    cachedInputTokens:number;
    costUsd:number;
  }>;
  models:Array<{ model:string; type:"completion"|"embedding"; requests:number; inputTokens:number; outputTokens:number; totalTokens:number }>;
  costItems:Array<{ label:string; costUsd:number }>;
};

type CachedReport = { expiresAt:number; report:OpenAIUsageReport };
const cache = new Map<string, CachedReport>();

export class OpenAIUsageApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "OpenAIUsageApiError";
  }
}

async function fetchPages<T>(path: string, params: URLSearchParams, maxBucketLimit: number) {
  const adminKey = process.env.OPENAI_ADMIN_KEY;
  if (!adminKey) throw new OpenAIUsageApiError("OPENAI_ADMIN_KEY is not configured.", 503);
  const results: UsageBucket<T>[] = [];
  let page: string | null = null;
  for (let request = 0; request < 10; request += 1) {
    const query = new URLSearchParams(params);
    query.set("limit", String(maxBucketLimit));
    if (page) query.set("page", page);
    const response = await fetch(`${OPENAI_API_BASE}${path}?${query.toString()}`, {
      headers:{ Authorization:`Bearer ${adminKey}` },
      cache:"no-store",
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => null) as { error?:{ message?:string } } | null;
      throw new OpenAIUsageApiError(detail?.error?.message ?? `OpenAI usage API returned ${response.status}.`, response.status);
    }
    const body = await response.json() as UsagePage<T>;
    results.push(...(body.data ?? []));
    if (!body.has_more || !body.next_page) break;
    page = body.next_page;
  }
  return results;
}

function dayFromUnix(timestamp: number) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function roundUsd(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export async function getOpenAIUsageReport(days = 30): Promise<OpenAIUsageReport | { configured:false }> {
  if (!process.env.OPENAI_ADMIN_KEY) return { configured:false };
  const safeDays = Math.min(90, Math.max(7, Math.floor(days)));
  const projectId = process.env.OPENAI_PROJECT_ID?.trim() || null;
  const cacheKey = `${safeDays}:${projectId ?? "organization"}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.report;

  const endTime = Math.floor(Date.now() / 1000) + 1;
  const startTime = endTime - safeDays * 86_400;
  const baseParams = new URLSearchParams({
    start_time:String(startTime),
    end_time:String(endTime),
    bucket_width:"1d",
  });
  if (projectId) baseParams.append("project_ids", projectId);

  const completionParams = new URLSearchParams(baseParams);
  completionParams.append("group_by", "model");
  const embeddingParams = new URLSearchParams(baseParams);
  embeddingParams.append("group_by", "model");
  const costParams = new URLSearchParams(baseParams);
  costParams.append("group_by", "line_item");

  const [completionBuckets, embeddingBuckets, costBuckets] = await Promise.all([
    fetchPages<UsageResult>("/organization/usage/completions", completionParams, Math.min(31, safeDays)),
    fetchPages<UsageResult>("/organization/usage/embeddings", embeddingParams, Math.min(31, safeDays)),
    fetchPages<CostResult>("/organization/costs", costParams, safeDays),
  ]);

  const daily = new Map<string, OpenAIUsageReport["daily"][number]>();
  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const day = new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
    daily.set(day, { day, completionRequests:0, embeddingRequests:0, inputTokens:0, outputTokens:0, cachedInputTokens:0, costUsd:0 });
  }
  const models = new Map<string, OpenAIUsageReport["models"][number]>();
  const addUsage = (bucket: UsageBucket<UsageResult>, type: "completion"|"embedding") => {
    const day = dayFromUnix(bucket.start_time);
    const dayEntry = daily.get(day);
    for (const result of bucket.results ?? []) {
      const requests = Number(result.num_model_requests ?? 0);
      const inputTokens = Number(result.input_tokens ?? 0);
      const outputTokens = Number(result.output_tokens ?? 0);
      const cachedInputTokens = Number(result.input_cached_tokens ?? 0);
      if (dayEntry) {
        if (type === "completion") dayEntry.completionRequests += requests;
        else dayEntry.embeddingRequests += requests;
        dayEntry.inputTokens += inputTokens;
        dayEntry.outputTokens += outputTokens;
        dayEntry.cachedInputTokens += cachedInputTokens;
      }
      const model = result.model ?? `Unknown ${type} model`;
      const key = `${type}:${model}`;
      const current = models.get(key) ?? { model, type, requests:0, inputTokens:0, outputTokens:0, totalTokens:0 };
      current.requests += requests;
      current.inputTokens += inputTokens;
      current.outputTokens += outputTokens;
      current.totalTokens += inputTokens + outputTokens;
      models.set(key, current);
    }
  };
  completionBuckets.forEach((bucket) => addUsage(bucket, "completion"));
  embeddingBuckets.forEach((bucket) => addUsage(bucket, "embedding"));

  const costItems = new Map<string, number>();
  for (const bucket of costBuckets) {
    const dayEntry = daily.get(dayFromUnix(bucket.start_time));
    for (const result of bucket.results ?? []) {
      const value = Number(result.amount?.value ?? 0);
      if (dayEntry) dayEntry.costUsd += value;
      const label = result.line_item ?? "Other OpenAI usage";
      costItems.set(label, (costItems.get(label) ?? 0) + value);
    }
  }

  const dailyValues = [...daily.values()].map((entry) => ({ ...entry, costUsd:roundUsd(entry.costUsd) }));
  const totals = dailyValues.reduce((sum, entry) => ({
    completionRequests:sum.completionRequests + entry.completionRequests,
    embeddingRequests:sum.embeddingRequests + entry.embeddingRequests,
    inputTokens:sum.inputTokens + entry.inputTokens,
    outputTokens:sum.outputTokens + entry.outputTokens,
    cachedInputTokens:sum.cachedInputTokens + entry.cachedInputTokens,
    costUsd:sum.costUsd + entry.costUsd,
  }), { completionRequests:0, embeddingRequests:0, inputTokens:0, outputTokens:0, cachedInputTokens:0, costUsd:0 });

  const report: OpenAIUsageReport = {
    configured:true,
    scope:{ type:projectId ? "project" : "organization", projectId },
    generatedAt:new Date().toISOString(),
    days:safeDays,
    totals:{
      ...totals,
      requests:totals.completionRequests + totals.embeddingRequests,
      totalTokens:totals.inputTokens + totals.outputTokens,
      costUsd:roundUsd(totals.costUsd),
    },
    daily:dailyValues,
    models:[...models.values()].sort((left, right) => right.requests - left.requests),
    costItems:[...costItems.entries()].map(([label, costUsd]) => ({ label, costUsd:roundUsd(costUsd) })).sort((left, right) => right.costUsd - left.costUsd),
  };
  cache.set(cacheKey, { report, expiresAt:Date.now() + CACHE_TTL_MS });
  return report;
}
