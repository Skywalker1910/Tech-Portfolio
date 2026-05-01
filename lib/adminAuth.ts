import { createHash } from "crypto";

/**
 * SHA-256 of the admin key — safe to commit.
 * Used as a fallback when process.env.ADMIN_KEY is not injected
 * by the Amplify SSR runtime (known Amplify env-var delivery issue).
 *
 * To rotate: generate a new key, update ADMIN_KEY in Amplify console,
 * and replace this hash with: node -e "require('crypto').createHash('sha256').update('NEW_KEY').digest('hex')"
 */
const ADMIN_KEY_HASH =
  "bce85e6c3cf48c15a23d09865559001277b092cba0d3c7e49e1a67d7d4745624";

/**
 * Returns true if the provided key matches the admin key.
 * Prefers process.env.ADMIN_KEY (direct comparison) when available.
 * Falls back to comparing the SHA-256 hash when the env var is not injected.
 */
export function isValidAdminKey(key: string | null): boolean {
  if (!key) return false;
  const envKey = process.env.ADMIN_KEY;
  if (envKey) return key === envKey;
  // Fallback: hash comparison (Amplify env var not delivered to SSR runtime)
  const incoming = createHash("sha256").update(key).digest("hex");
  return incoming === ADMIN_KEY_HASH;
}
