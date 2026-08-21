import { createHash } from "node:crypto";

/** Process-local security key only. Never use this value as visitor identity or persist it. */
export function volatileRequestKey(value:string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}
