export const ANALYTICS_CONSENT_VERSION = "2";
export const ANALYTICS_PREFERENCE_KEY = "portfolio-analytics-preference";
export const ANALYTICS_CONSENT_VERSION_KEY = "portfolio-analytics-consent-version";
export const ANALYTICS_VISITOR_KEY = "portfolio-analytics-visitor";
export const ANALYTICS_IDENTITY_KEY = "portfolio-analytics-identity";
export const ANALYTICS_VISIT_KEY = "portfolio-analytics-visit";
export const BB8_CHAT_SESSION_KEY = "bb8-usage-session";

const LEGACY_CONSENT_KEY = "portfolio-analytics-consent";
const LEGACY_OPT_OUT_KEY = "portfolio-analytics-basic-opt-out";
const VISIT_TIMEOUT_MS = 30 * 60 * 1000;

export type AnalyticsPreference = "essential"|"basic"|"enhanced";
export type BasicAnalyticsEventName = "project_opened"|"demo_started"|"demo_completed"|"external_link_clicked"|"contact_form_started"|"contact_form_submitted";
export type AnalyticsIdentity = { visitorId:string; sessionId:string; lastActivityAt:number; reported:boolean };
type StorageLike = Pick<Storage, "getItem"|"setItem"|"removeItem">;

export function readAnalyticsPreference(storage:StorageLike):AnalyticsPreference|null {
  const current = storage.getItem(ANALYTICS_PREFERENCE_KEY);
  if (current === "essential" || current === "basic" || current === "enhanced") return current;

  const legacy = storage.getItem(LEGACY_CONSENT_KEY);
  const legacyOptOut = storage.getItem(LEGACY_OPT_OUT_KEY) === "true";
  if (legacy === "accepted") return "enhanced";
  if (legacy === "declined") return legacyOptOut ? "essential" : "basic";
  return null;
}

export function writeAnalyticsPreference(storage:StorageLike, preference:AnalyticsPreference) {
  storage.setItem(ANALYTICS_PREFERENCE_KEY, preference);
  storage.setItem(ANALYTICS_CONSENT_VERSION_KEY, ANALYTICS_CONSENT_VERSION);
  storage.removeItem(LEGACY_CONSENT_KEY);
  storage.removeItem(LEGACY_OPT_OUT_KEY);
}

export function optionalAnalyticsAllowed(preference:AnalyticsPreference|null, privacySignal:boolean) {
  return !privacySignal && (preference === "basic" || preference === "enhanced");
}

export function browserPrivacySignal(navigatorLike:Pick<Navigator, "doNotTrack"> & { globalPrivacyControl?:boolean }) {
  return navigatorLike.doNotTrack === "1" || navigatorLike.globalPrivacyControl === true;
}

export function enhancedAnalyticsAllowed(preference:AnalyticsPreference|null, privacySignal:boolean) {
  return !privacySignal && preference === "enhanced";
}

function readIdentity(storage:StorageLike) {
  try {
    const raw = storage.getItem(ANALYTICS_IDENTITY_KEY);
    return raw ? JSON.parse(raw) as Partial<AnalyticsIdentity> : null;
  } catch { return null; }
}

export function getOrCreateAnalyticsIdentity(input:{
  sessionStorage:StorageLike;
  localStorage:StorageLike;
  preference:AnalyticsPreference|null;
  privacySignal:boolean;
  now?:number;
  randomUUID?:()=>string;
}) {
  const now = input.now ?? Date.now();
  const randomUUID = input.randomUUID ?? (() => crypto.randomUUID());
  const enhanced = enhancedAnalyticsAllowed(input.preference, input.privacySignal);
  const stored = readIdentity(input.sessionStorage);
  const storedIsActive = stored && typeof stored.visitorId === "string" && typeof stored.sessionId === "string" &&
    typeof stored.lastActivityAt === "number" && now - stored.lastActivityAt < VISIT_TIMEOUT_MS;
  let persistentVisitorId = enhanced ? input.localStorage.getItem(ANALYTICS_VISITOR_KEY) : null;
  if (enhanced && !persistentVisitorId) {
    persistentVisitorId = storedIsActive ? stored.visitorId! : randomUUID();
    input.localStorage.setItem(ANALYTICS_VISITOR_KEY, persistentVisitorId);
  }

  if (storedIsActive) {
    const identity:AnalyticsIdentity = {
      visitorId:persistentVisitorId ?? stored.visitorId!,
      sessionId:stored.sessionId!,
      lastActivityAt:now,
      reported:stored.reported === true && (!persistentVisitorId || stored.visitorId === persistentVisitorId),
    };
    input.sessionStorage.setItem(ANALYTICS_IDENTITY_KEY, JSON.stringify(identity));
    return identity;
  }

  const identity:AnalyticsIdentity = {
    visitorId:persistentVisitorId ?? randomUUID(),
    sessionId:randomUUID(),
    lastActivityAt:now,
    reported:false,
  };
  input.sessionStorage.setItem(ANALYTICS_IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

export function markAnalyticsIdentityReported(storage:StorageLike, identity:AnalyticsIdentity) {
  storage.setItem(ANALYTICS_IDENTITY_KEY, JSON.stringify({ ...identity, reported:true }));
}

export function getOrCreateEnhancedVisitId(storage:StorageLike, now = Date.now(), randomUUID:()=>string = () => crypto.randomUUID()) {
  try {
    const raw = storage.getItem(ANALYTICS_VISIT_KEY);
    const stored = raw ? JSON.parse(raw) as { id?:unknown; lastActivityAt?:unknown } : null;
    if (stored && typeof stored.id === "string" && typeof stored.lastActivityAt === "number" && now - stored.lastActivityAt < VISIT_TIMEOUT_MS) {
      storage.setItem(ANALYTICS_VISIT_KEY, JSON.stringify({ id:stored.id, lastActivityAt:now }));
      return stored.id;
    }
  } catch {}
  const id = randomUUID();
  storage.setItem(ANALYTICS_VISIT_KEY, JSON.stringify({ id, lastActivityAt:now }));
  return id;
}

export function clearOptionalAnalyticsStorage(local:StorageLike, session:StorageLike, resetMandatoryIdentity = true) {
  local.removeItem(ANALYTICS_VISITOR_KEY);
  session.removeItem(ANALYTICS_VISIT_KEY);
  session.removeItem(BB8_CHAT_SESSION_KEY);
  if (resetMandatoryIdentity) session.removeItem(ANALYTICS_IDENTITY_KEY);
}

export function persistentVisitorIdForContact(local:StorageLike, preference:AnalyticsPreference|null, privacySignal:boolean) {
  return enhancedAnalyticsAllowed(preference, privacySignal) ? local.getItem(ANALYTICS_VISITOR_KEY) : null;
}

export function trackBasicAnalyticsEvent(eventName:BasicAnalyticsEventName, input:{ page:string; feature:string; metadata?:Record<string, string> }) {
  const preference = readAnalyticsPreference(localStorage);
  const privacySignal = browserPrivacySignal(navigator as Navigator & { globalPrivacyControl?:boolean });
  if (!optionalAnalyticsAllowed(preference, privacySignal)) return;
  const identity = getOrCreateAnalyticsIdentity({ sessionStorage, localStorage, preference, privacySignal });
  fetch("/api/analytics", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ eventType:"feature_event", eventId:crypto.randomUUID(), eventName, visitorId:identity.visitorId, sessionId:identity.sessionId, page:input.page, feature:input.feature, metadata:input.metadata ?? {} }),
    keepalive:true,
  }).catch(() => {});
}
