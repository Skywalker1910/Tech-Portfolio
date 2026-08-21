const DAY_MS = 86_400_000;

export const ANALYTICS_RETENTION_DEFAULTS = {
  mandatory:90,
  basic:180,
  enhanced:180,
  bb8:90,
  contacts:365,
} as const;

export type RetentionCategory = keyof typeof ANALYTICS_RETENTION_DEFAULTS;

const ENV_KEYS:Record<RetentionCategory, string> = {
  mandatory:"ANALYTICS_MANDATORY_RETENTION_DAYS",
  basic:"ANALYTICS_BASIC_RETENTION_DAYS",
  enhanced:"ANALYTICS_ENHANCED_RETENTION_DAYS",
  bb8:"ANALYTICS_BB8_RETENTION_DAYS",
  contacts:"CONTACT_RETENTION_DAYS",
};

export function retentionDays(category:RetentionCategory, environment:Record<string, string|undefined> = process.env) {
  const configured = Number(environment[ENV_KEYS[category]]);
  return Number.isInteger(configured) && configured >= 1 && configured <= 3650
    ? configured
    : ANALYTICS_RETENTION_DEFAULTS[category];
}

export function retentionEpoch(category:RetentionCategory, now = Date.now(), environment:Record<string, string|undefined> = process.env) {
  return Math.floor((now + retentionDays(category, environment) * DAY_MS) / 1000);
}
