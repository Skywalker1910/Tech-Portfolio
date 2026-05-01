/**
 * Returns true if the provided key matches the ADMIN_KEY environment variable.
 * ADMIN_KEY is injected into .env.production at build time via amplify.yml.
 */
export function isValidAdminKey(key: string | null): boolean {
  if (!key) return false;
  return key === process.env.ADMIN_KEY;
}
