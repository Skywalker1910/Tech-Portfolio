// Standard API list prices verified September 30, 2026. No cached-input discount
// is assumed. Unknown models fail closed rather than borrowing another rate.
export const EVALUATION_PRICING = {
  "gpt-5.6-terra": { inputPerMillion:2, reservationInputPerMillion:2.5, outputPerMillion:12, verifiedAt:"2026-09-30", source:"https://developers.openai.com/api/docs/models/gpt-5.6-terra" },
  "text-embedding-3-small": { inputPerMillion:0.02, outputPerMillion:0, verifiedAt:"2026-09-30", source:"https://developers.openai.com/api/docs/models/text-embedding-3-small" },
} as const;

export type EvaluationPrice = { inputPerMillion:number; outputPerMillion:number; reservationInputPerMillion?:number };

export function evaluationPrice(model: string, now = Date.now()): EvaluationPrice {
  if (!Object.hasOwn(EVALUATION_PRICING, model)) throw new Error("Unverified evaluation pricing: review this model's official standard API rates first");
  const price = EVALUATION_PRICING[model as keyof typeof EVALUATION_PRICING];
  if (now - Date.parse(price.verifiedAt) > 7 * 86400000) throw new Error("Unverified evaluation pricing: rate verification is older than seven days; refresh official rates before paid execution");
  return price;
}

export function priceNanoUsd(inputTokens: number, outputTokens: number, price: EvaluationPrice) {
  if (![inputTokens,outputTokens].every(number=>Number.isSafeInteger(number) && number >= 0)
    || ![price.inputPerMillion,price.outputPerMillion].every(number=>Number.isFinite(number) && number >= 0)) throw new Error("Invalid evaluation cost inputs");
  // Round UP to avoid floating point permitting a request above the cap.
  return Math.ceil((inputTokens * price.inputPerMillion + outputTokens * price.outputPerMillion) * 1000);
}

export function dollarLimit(usd: number) {
  if (!Number.isFinite(usd) || usd <= 0 || usd > 0.05) throw new Error("Evaluation dollar budget must be positive and at most $0.05 per run");
  return Math.floor(usd * 1_000_000_000);
}
