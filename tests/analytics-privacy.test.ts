import test from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_IDENTITY_KEY,
  ANALYTICS_VISITOR_KEY,
  clearOptionalAnalyticsStorage,
  enhancedAnalyticsAllowed,
  getOrCreateAnalyticsIdentity,
  optionalAnalyticsAllowed,
  persistentVisitorIdForContact,
  readAnalyticsPreference,
  writeAnalyticsPreference,
} from "../lib/client-analytics";
import {
  buildMandatoryTelemetryRecord,
  buildChatTelemetryRecord,
  getAnalyticsContext,
  getAnalyticsVisitorReference,
  sanitizeBasicFeatureEvent,
} from "../lib/analytics";
import { retentionDays } from "../lib/analytics-policy";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key:string) { return this.values.get(key) ?? null; }
  setItem(key:string, value:string) { this.values.set(key, value); }
  removeItem(key:string) { this.values.delete(key); }
}

const UUIDS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
  "55555555-5555-4555-8555-555555555555",
  "66666666-6666-4666-8666-666666666666",
];

function uuidSequence() {
  let index = 0;
  return () => UUIDS[index++] ?? UUIDS.at(-1)!;
}

test("mandatory identity creates distinct opaque visitor and session IDs without persistent storage", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const identity = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:session, preference:null, privacySignal:false, now:1, randomUUID:uuidSequence() });
  assert.equal(identity.visitorId, UUIDS[0]);
  assert.equal(identity.sessionId, UUIDS[1]);
  assert.notEqual(identity.visitorId, identity.sessionId);
  assert.equal(local.getItem(ANALYTICS_VISITOR_KEY), null);
  assert.ok(session.getItem(ANALYTICS_IDENTITY_KEY));
});

test("only Enhanced consent creates persistent cross-session recognition", () => {
  const local = new MemoryStorage();
  const randomUUID = uuidSequence();
  const basicSession = new MemoryStorage();
  const basic = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:basicSession, preference:"basic", privacySignal:false, now:1, randomUUID });
  assert.equal(local.getItem(ANALYTICS_VISITOR_KEY), null);

  const enhancedSession = new MemoryStorage();
  const enhanced = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:enhancedSession, preference:"enhanced", privacySignal:false, now:1, randomUUID });
  assert.equal(local.getItem(ANALYTICS_VISITOR_KEY), enhanced.visitorId);
  assert.notEqual(basic.visitorId, enhanced.visitorId);

  const nextSession = new MemoryStorage();
  const returning = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:nextSession, preference:"enhanced", privacySignal:false, now:2, randomUUID });
  assert.equal(returning.visitorId, enhanced.visitorId);
  assert.notEqual(returning.sessionId, enhanced.sessionId);
});

test("upgrading the active session to Enhanced persists the existing anonymous visitor without duplicating the visit", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const randomUUID = uuidSequence();
  const anonymous = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:session, preference:null, privacySignal:false, now:1, randomUUID });
  const enhanced = getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:session, preference:"enhanced", privacySignal:false, now:2, randomUUID });
  assert.equal(enhanced.visitorId, anonymous.visitorId);
  assert.equal(enhanced.sessionId, anonymous.sessionId);
  assert.equal(local.getItem(ANALYTICS_VISITOR_KEY), anonymous.visitorId);
});

test("consent purposes are explicit and privacy signals disable optional analytics", () => {
  assert.equal(optionalAnalyticsAllowed(null, false), false);
  assert.equal(optionalAnalyticsAllowed("essential", false), false);
  assert.equal(optionalAnalyticsAllowed("basic", false), true);
  assert.equal(optionalAnalyticsAllowed("enhanced", false), true);
  assert.equal(optionalAnalyticsAllowed("enhanced", true), false);
  assert.equal(enhancedAnalyticsAllowed("basic", false), false);
  assert.equal(enhancedAnalyticsAllowed("enhanced", false), true);
});

test("revocation removes optional identifiers and prevents contact linkage", () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  writeAnalyticsPreference(local, "enhanced");
  getOrCreateAnalyticsIdentity({ localStorage:local, sessionStorage:session, preference:"enhanced", privacySignal:false, randomUUID:uuidSequence() });
  assert.ok(persistentVisitorIdForContact(local, readAnalyticsPreference(local), false));
  clearOptionalAnalyticsStorage(local, session);
  writeAnalyticsPreference(local, "essential");
  assert.equal(local.getItem(ANALYTICS_VISITOR_KEY), null);
  assert.equal(session.getItem(ANALYTICS_IDENTITY_KEY), null);
  assert.equal(persistentVisitorIdForContact(local, readAnalyticsPreference(local), false), null);
});

test("geography accepts only country and region fields and ignores precise provider values", () => {
  const headers = new Headers({
    "cloudfront-viewer-country":"US",
    "cloudfront-viewer-country-name":"United%20States",
    "cloudfront-viewer-country-region-name":"Pennsylvania",
    "cloudfront-viewer-country-region":"PA",
    "cloudfront-viewer-city":"Pittsburgh",
    "x-vercel-ip-city":"Pittsburgh",
    "x-forwarded-for":"203.0.113.7",
  });
  const location = getAnalyticsContext(headers).location;
  assert.deepEqual(location, { countryCode:"US", country:"United States", region:"Pennsylvania", regionCode:"PA" });
  const serialized = JSON.stringify(location).toLowerCase();
  for (const forbidden of ["city", "county", "postal", "latitude", "longitude", "pittsburgh", "203.0.113.7"]) assert.equal(serialized.includes(forbidden), false);
});

test("mandatory telemetry persists the required anonymous identity, coarse geography, and server timestamp", () => {
  const record = buildMandatoryTelemetryRecord({
    eventId:UUIDS[2], visitorId:UUIDS[0], sessionId:UUIDS[1],
    location:{ country:"United States", countryCode:"US", region:"Pennsylvania", regionCode:"PA" },
    timestamp:"2026-08-20T15:04:05.000Z", expiresAt:1_800_000_000,
  });
  assert.equal(record.eventName, "visitor_session_started");
  assert.equal(record.occurredAt, "2026-08-20T15:04:05.000Z");
  assert.deepEqual(record.location, { country:"United States", countryCode:"US", region:"Pennsylvania", regionCode:"PA" });
  assert.equal(record.visitorId.length, 12);
  assert.equal(record.sessionId.length, 12);
  assert.equal(JSON.stringify(record).includes(UUIDS[0]), false);
  assert.equal(JSON.stringify(record).includes(UUIDS[1]), false);
});

test("feature analytics uses an allow-listed schema and drops arbitrary metadata", () => {
  const event = sanitizeBasicFeatureEvent({
    eventName:"external_link_clicked",
    page:"/projects?secret=value",
    feature:"project:bb8-rag",
    metadata:{ targetCategory:"github", email:"person@example.com", prompt:"private text", city:"Pittsburgh" },
  });
  assert.deepEqual(event, { eventName:"external_link_clicked", page:"/projects", feature:"project:bb8-rag", metadata:{ targetCategory:"github" } });
  assert.equal(sanitizeBasicFeatureEvent({ eventName:"mouse_moved", page:"/", feature:"cursor" }), null);
});

test("BB-8 telemetry builder cannot persist prompts or responses", () => {
  const record = buildChatTelemetryRecord({
    visitorId:UUIDS[0], sessionId:UUIDS[1], chatSessionId:UUIDS[2], successful:true, durationMs:1240,
    model:"gpt-test", usage:{ inputTokens:10, outputTokens:20, totalTokens:30, cachedTokens:0 }, retrievalMode:"s3-vectors", retrievalFallback:false, actionType:"navigate", detailed:true,
    prompt:"secret prompt", response:"private response",
  } as Parameters<typeof buildChatTelemetryRecord>[0] & { prompt:string; response:string });
  const serialized = JSON.stringify(record);
  assert.equal(serialized.includes("secret prompt"), false);
  assert.equal(serialized.includes("private response"), false);
  assert.equal("prompt" in record, false);
  assert.equal("response" in record, false);
});

test("contact linkage is a one-way hash and never stores the raw enhanced UUID", () => {
  const reference = getAnalyticsVisitorReference(UUIDS[0]);
  assert.ok(reference);
  assert.equal(reference?.visitorId.length, 12);
  assert.equal(reference?.visitorKey.length, 64);
  assert.equal(JSON.stringify(reference).includes(UUIDS[0]), false);
  assert.equal(getAnalyticsVisitorReference("not-a-uuid"), null);
});

test("retention is category-specific, configurable, and bounded", () => {
  assert.notEqual(retentionDays("mandatory", {}), retentionDays("basic", {}));
  assert.equal(retentionDays("bb8", { ANALYTICS_BB8_RETENTION_DAYS:"30" }), 30);
  assert.equal(retentionDays("contacts", { CONTACT_RETENTION_DAYS:"99999" }), 365);
});
