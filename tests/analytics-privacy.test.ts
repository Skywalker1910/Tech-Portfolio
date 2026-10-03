import test from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_IDENTITY_KEY,
  ANALYTICS_CONSENT_VERSION_KEY,
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
  getTrafficReport,
  recordMandatoryVisitorSession,
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

import { buildPromptReviewRecord, promptReviewAllowed, redactReviewPrompt, validReviewDay, validReviewId } from "../lib/chat-review";
import { resolveAnalyticsLocation, publicViewerIp } from "../lib/analytics-location";

test("expanded prompt-review consent cannot reuse old permissions",()=>{
  const storage=new MemoryStorage();
  writeAnalyticsPreference(storage,"enhanced");
  storage.setItem(ANALYTICS_CONSENT_VERSION_KEY,"2");
  assert.equal(readAnalyticsPreference(storage),null);
  assert.equal(promptReviewAllowed("2","enhanced"),false);
  assert.equal(promptReviewAllowed("3","essential"),false);
  assert.equal(promptReviewAllowed("3","basic"),true);
  assert.equal(promptReviewAllowed("3","basic",true),false);
  assert.equal(promptReviewAllowed("3","enhanced"),true);
});
test("prompt reviews are separate, redacted, bounded, and cannot retain identities or responses",()=>{
  const record=buildPromptReviewRecord({prompt:"Which projects use React? email me at user@example.com or +1 (412) 555-0123. https://example.com/?token=secret sk-123456789abcdefghijkl",successful:false,model:"test",retrievalMode:"keyword",retrievalFallback:true,response:"private response",visitorId:UUIDS[0],location:{city:"Private"}} as Parameters<typeof buildPromptReviewRecord>[0],Date.parse("2026-10-02T12:00:00Z"),UUIDS[0]);
  assert.ok(record.prompt.includes("Which projects use React?"));
  for(const secret of ["user@example.com","555-0123","token=secret","sk-123456789abcdefghijkl","private response","Private"])assert.equal(JSON.stringify(record).includes(secret),false);
  assert.equal("visitorId" in record,false);assert.equal("location" in record,false);assert.equal(record.successful,false);
  assert.ok(record.expiresAt>Date.parse(record.occurredAt)/1000);assert.equal(redactReviewPrompt("a".repeat(2000)).length,1000);
  assert.equal(validReviewDay("2026-02-30"),false);assert.equal(validReviewId("2026-10-02",record.sk),true);
  assert.equal(validReviewId("2026-10-01",record.sk),false);
});
test("local geography fallback keeps only country/state and never mixes countries",async()=>{
  const headers=new Headers({"x-forwarded-for":"8.8.8.8, 10.0.0.1"});
  const local=()=>({country:"US",region:"CA",city:"Mountain View",ll:[37,-122],postal:"94043"});
  const result=await resolveAnalyticsLocation(headers,undefined,local);
  assert.deepEqual(result,{countryCode:"US",country:"United States",region:null,regionCode:"CA"});
  const existing={countryCode:"IN",country:"India",region:null,regionCode:null};
  assert.deepEqual(await resolveAnalyticsLocation(headers,existing,local),existing);
  const complete={countryCode:"US",country:"United States",region:"Pennsylvania",regionCode:"PA"};
  assert.deepEqual(await resolveAnalyticsLocation(headers,complete,()=>{throw new Error("Must not lookup");}),complete);
  assert.equal(publicViewerIp(new Headers({"x-forwarded-for":"10.0.0.1"})),null);
  assert.equal(publicViewerIp(new Headers({"x-forwarded-for":"::ffff:127.0.0.1"})),null);
  assert.equal(publicViewerIp(new Headers({"cloudfront-viewer-address":"[2606:4700::1111]:443"})),"2606:4700::1111");
  assert.equal(publicViewerIp(new Headers({"x-forwarded-for":"not-an-ip"})),null);
});
test("mandatory source records discard referring paths and arbitrary payloads",()=>{
  const record=buildMandatoryTelemetryRecord({eventId:UUIDS[2],visitorId:UUIDS[0],sessionId:UUIDS[1],location:{countryCode:"US",country:"United States",region:null,regionCode:"PA"},source:{category:"professional_network",host:"linkedin.com",url:"https://linkedin.com/private?secret=1"} as never,timestamp:"2026-10-02T12:00:00Z",expiresAt:1800000000});
  assert.deepEqual(record.source,{category:"professional_network",host:"linkedin.com"});assert.equal(JSON.stringify(record).includes("secret=1"),false);
});

import { docClient } from "../lib/dynamodb";
import { QueryCommand, GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
test("traffic report includes later DynamoDB pages in mandatory geography and sources",async()=>{
  const original=docClient.send;
  let laterPages=0;
  Object.defineProperty(docClient,"send",{configurable:true,value:async(command:QueryCommand)=>{
    if(!(command instanceof QueryCommand))return {};
    const input=command.input;
    const pk=input.ExpressionAttributeValues?.[":pk"] as string;
    if(!pk.startsWith("ANALYTICS#"))return {Items:[],Count:0};
    if(!input.ExclusiveStartKey)return {Items:[{sk:"GEO#one",visits:10,visitors:2,location:{countryCode:"US",regionCode:"PA"}}],LastEvaluatedKey:{pk,sk:"GEO#one"}};
    laterPages++;
    return {Items:[{sk:"GEO#two",visits:5,visitors:1,location:{countryCode:"IN",regionCode:"MH"}},{sk:"SOURCE#search",visits:5,source:{category:"search",host:"google.com"}}]};
  }});
  try{
    const report=await getTrafficReport(7);
    assert.equal(laterPages,7);assert.equal(report.geography.measuredVisits,105);assert.equal(report.geography.regionVisits,105);
    assert.equal(report.totals.mandatoryVisits,105);assert.equal(report.breakdowns.sources[0].count,35);
  }finally{Object.defineProperty(docClient,"send",{configurable:true,value:original});}
});

test("mandatory reach and source writes are atomic and retries do not duplicate sessions",async()=>{
  const original=docClient.send;let transactionCalls=0;
  Object.defineProperty(docClient,"send",{configurable:true,value:async(command:GetCommand|TransactWriteCommand)=>{
    if(command instanceof GetCommand)return {};
    assert.ok(command instanceof TransactWriteCommand);transactionCalls++;
    const items=command.input.TransactItems!;
    assert.equal(items.length,4);
    assert.ok(items[0].Put?.ConditionExpression);assert.ok(items[2].Update?.Key?.sk.startsWith("GEO#"));assert.ok(items[3].Update?.Key?.sk.startsWith("SOURCE#"));
    if(transactionCalls===2)throw Object.assign(new Error("Duplicate"),{name:"TransactionCanceledException",CancellationReasons:[{Code:"ConditionalCheckFailed"}]});
    return {};
  }});
  const input={eventId:UUIDS[1],visitorId:UUIDS[0],sessionId:UUIDS[1],location:{countryCode:"US",country:"United States",region:null,regionCode:"PA"},source:{category:"direct",host:null} as const};
  try{assert.equal((await recordMandatoryVisitorSession(input)).duplicate,false);assert.equal((await recordMandatoryVisitorSession(input)).duplicate,true);}
  finally{Object.defineProperty(docClient,"send",{configurable:true,value:original});}
});
