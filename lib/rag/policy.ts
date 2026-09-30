import type { RetrievedChunk } from "./types";

export type RetrievalPolicy = {
  strategy?: "fixed" | "adaptive";
  topK?: number;
  adaptiveMaxK?: number;
  contextTokenBudget?: number;
};

export function boundedInteger(value: unknown, fallback: number, min: number, max: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

export function retrievalDecision(query: string, policy: RetrievalPolicy = {}) {
  const fixed = boundedInteger(policy.topK, 4, 1, 10);
  if (policy.strategy !== "adaptive") return { topK: fixed, reason: "fixed" };
  const maximum = boundedInteger(policy.adaptiveMaxK, 8, 1, 10);
  if (/\b(compare|comparison|versus|vs|across|all projects|career|summari[sz]e|summary|overview)\b/i.test(query)) {
    return { topK: Math.min(maximum, /compare|comparison|versus|across|all projects/i.test(query) ? 8 : 6), reason: "broad" };
  }
  // Ambiguous/follow-up questions are not assumed to be narrow facts.
  if (/\b(when|where|gpa|email|url|exact|how many)\b/i.test(query) && query.length < 160) {
    return { topK: Math.min(maximum, 3), reason: "narrow" };
  }
  return { topK: Math.min(maximum, fixed), reason: "standard-or-ambiguous" };
}

export function retrievalQuery(messages: Array<{ role: string; content: string }>) {
  // Preserve the existing two-user-turn query; assistant text is never evidence.
  return messages.filter(message => message.role === "user").slice(-2).map(message => message.content).join("\n");
}

export function qualifiesDistance(chunk: RetrievedChunk, maximum: number) {
  return typeof chunk.distance === "number" && Number.isFinite(chunk.distance) && chunk.distance <= maximum;
}

export function uniqueEvidence(chunks: RetrievedChunk[]) {
  const ids = new Set<string>();
  const texts = new Set<string>();
  return chunks.filter(chunk => {
    const text = chunk.content.toLowerCase().replace(/\s+/g, " ").trim();
    if (!text || ids.has(chunk.id) || texts.has(text)) return false;
    ids.add(chunk.id); texts.add(text);
    return true;
  });
}

export function sourceText(chunk: RetrievedChunk, index: number) {
  return `[Source ${index + 1}]\nPage: ${chunk.title}\nSection: ${chunk.section}\nRoute: ${chunk.href}\n${chunk.content}`;
}

// Conservative upper bound for byte-level BPE text tokens, not a chars/4 estimate.
// Counts source labels too. Does not include system policy or conversation tokens.
export function tokenUpperBound(text: string) { return new TextEncoder().encode(text).length; }

export function budgetEvidence(chunks: RetrievedChunk[], budget = 12_000) {
  const limit = boundedInteger(budget, 12_000, 1, 32_000);
  const selected: RetrievedChunk[] = [];
  let used = 0;
  for (const chunk of chunks) {
    const cost = tokenUpperBound(sourceText(chunk, selected.length)) + (selected.length ? 2 : 0);
    // Keep whole sources; skipping a large one permits smaller relevant sources later.
    if (used + cost > limit) continue;
    selected.push(chunk); used += cost;
  }
  return { chunks: selected, tokenUpperBound: used, budget: limit };
}
