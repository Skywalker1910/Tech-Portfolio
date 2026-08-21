import { createHash } from "node:crypto";
import { BatchGetCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "@/lib/dynamodb";
import { retentionEpoch } from "@/lib/analytics-policy";

const DAY_MS = 86_400_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VISITOR_KEY_PATTERN = /^[0-9a-f]{64}$/;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const hashId = (value: string) => createHash("sha256").update(value).digest("hex");

export const AUDIENCE_SEGMENTS = ["unclassified", "recruiter", "hiring-manager", "technical-peer", "student", "general"] as const;
export type AudienceSegment = typeof AUDIENCE_SEGMENTS[number];
export type AnalyticsClientHints = { platform?:unknown; touchPoints?:unknown; viewportWidth?:unknown };
export type AnalyticsLocation = {
  countryCode:string|null;
  country:string|null;
  region:string|null;
  regionCode:string|null;
};
export type AnalyticsContext = {
  location:AnalyticsLocation;
  device:{ type:"Mobile"|"Tablet"|"Desktop"|"Unknown"; os:string; browser:string };
  viewport:string;
};
export type TrafficSource = { category:"direct"|"internal"|"search"|"social"|"professional_network"|"github"|"referral"|"other"; host:string|null };
export type ChatTokenUsage = { inputTokens:number; outputTokens:number; totalTokens:number; cachedTokens:number };
export type ChatTelemetryRecordInput = {
  visitorId:string;
  sessionId:string;
  chatSessionId:string;
  successful:boolean;
  durationMs:number;
  model:string;
  usage:ChatTokenUsage;
  retrievalMode?:string|null;
  retrievalFallback?:boolean;
  actionType?:string|null;
  detailed:boolean;
};
export const BASIC_EVENT_NAMES = ["project_opened", "demo_started", "demo_completed", "external_link_clicked", "contact_form_started", "contact_form_submitted"] as const;
export type BasicEventName = typeof BASIC_EVENT_NAMES[number];
export type BasicFeatureEvent = { eventName:BasicEventName; page:string; feature:string; metadata:{ targetCategory?:"github"|"linkedin"|"demo"|"resume"|"other" } };

type OperationalPageViewInput = {
  path:string;
  eventId:string;
  visitorId:string;
  sessionId:string;
  context:AnalyticsContext;
  source:TrafficSource|null;
};

export type PageActivityInput = OperationalPageViewInput & {
  visitorId:string;
  visitId:string;
};

export function sanitizeTrackedPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0].replace(/\/+$/, "") || "/";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api") || path.length > 120) return null;
  return path;
}

export function sanitizeAnalyticsId(value: unknown) {
  return typeof value === "string" && UUID_PATTERN.test(value) ? value.toLowerCase() : null;
}

export function sanitizeAudienceSegment(value: unknown): AudienceSegment | null {
  return typeof value === "string" && (AUDIENCE_SEGMENTS as readonly string[]).includes(value) ? value as AudienceSegment : null;
}

export function sanitizeVisitorKey(value: unknown) {
  return typeof value === "string" && VISITOR_KEY_PATTERN.test(value) ? value : null;
}

export function sanitizeBasicFeatureEvent(value:unknown):BasicFeatureEvent|null {
  if (!value || typeof value !== "object") return null;
  const input = value as { eventName?:unknown; page?:unknown; feature?:unknown; metadata?:unknown };
  if (typeof input.eventName !== "string" || !(BASIC_EVENT_NAMES as readonly string[]).includes(input.eventName)) return null;
  const page = sanitizeTrackedPath(input.page);
  const feature = typeof input.feature === "string" && /^[a-z0-9:_-]{1,80}$/.test(input.feature) ? input.feature : null;
  if (!page || !feature) return null;
  const metadataInput = input.metadata && typeof input.metadata === "object" ? input.metadata as { targetCategory?:unknown } : {};
  const targetCategories = new Set(["github", "linkedin", "demo", "resume", "other"]);
  const targetCategory = typeof metadataInput.targetCategory === "string" && targetCategories.has(metadataInput.targetCategory) ? metadataInput.targetCategory as BasicFeatureEvent["metadata"]["targetCategory"] : undefined;
  return { eventName:input.eventName as BasicEventName, page, feature, metadata:targetCategory ? { targetCategory } : {} };
}

export function getAnalyticsVisitorReference(value: unknown) {
  const visitorId = sanitizeAnalyticsId(value);
  if (!visitorId) return null;
  const visitorKey = hashId(visitorId);
  return { visitorKey, visitorId:visitorKey.slice(0, 12) };
}

export function buildChatTelemetryRecord(input:ChatTelemetryRecordInput) {
  return {
    eventName:input.successful ? "request_success" : "request_failure",
    visitorId:hashId(input.visitorId).slice(0, 12),
    visitorKey:hashId(input.visitorId),
    sessionId:hashId(input.sessionId).slice(0, 12),
    sessionKey:hashId(input.sessionId),
    chatSessionId:hashId(input.chatSessionId).slice(0, 12),
    chatSessionKey:hashId(input.chatSessionId),
    responseLatencyMs:Math.max(0, Math.round(input.durationMs)),
    model:input.model.slice(0, 80),
    tokenCount:Math.max(0, Math.round(input.usage.totalTokens)),
    ragUsed:Boolean(input.retrievalMode),
    ragFallback:Boolean(input.retrievalFallback),
    ...(input.detailed && input.actionType ? { agentAction:input.actionType.slice(0, 40), agentActionSuccess:input.successful } : {}),
  };
}

export function buildMandatoryTelemetryRecord(input:{
  eventId:string;
  visitorId:string;
  sessionId:string;
  location:AnalyticsLocation;
  timestamp:string;
  expiresAt:number;
}) {
  const eventKey = hashId(input.eventId);
  const visitorKey = hashId(input.visitorId);
  const sessionKey = hashId(input.sessionId);
  return {
    pk:`MANDATORY_EVENT#${eventKey}`,
    sk:"SUMMARY",
    eventId:eventKey.slice(0, 12),
    eventKey,
    eventName:"visitor_session_started" as const,
    day:input.timestamp.slice(0, 10),
    occurredAt:input.timestamp,
    visitorId:visitorKey.slice(0, 12),
    visitorKey,
    sessionId:sessionKey.slice(0, 12),
    sessionKey,
    location:input.location,
    expiresAt:input.expiresAt,
  };
}

function cleanHeader(value: string | null, maxLength = 80) {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value).replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return decoded ? decoded.slice(0, maxLength) : null;
  } catch {
    return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength) || null;
  }
}

function detectDevice(userAgent: string, hints: AnalyticsClientHints): AnalyticsContext["device"] {
  const ua = userAgent.toLowerCase();
  const platform = typeof hints.platform === "string" ? hints.platform.toLowerCase().slice(0, 40) : "";
  const touchPoints = typeof hints.touchPoints === "number" ? Math.min(20, Math.max(0, Math.floor(hints.touchPoints))) : 0;
  const isiPad = /ipad/.test(ua) || (/macintosh/.test(ua) && touchPoints > 1);
  const isTablet = isiPad || /tablet|kindle|silk|playbook/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua));
  const isMobile = !isTablet && (/iphone|ipod|android.*mobile|windows phone|mobile/.test(ua) || /iphone|ipod/.test(platform));

  let os = "Unknown";
  if (isiPad || /iphone|ipod/.test(ua)) os = "iOS / iPadOS";
  else if (/android/.test(ua)) os = "Android";
  else if (/windows/.test(ua) || /win/.test(platform)) os = "Windows";
  else if (/cros/.test(ua)) os = "Chrome OS";
  else if (/mac os|macintosh/.test(ua) || /mac/.test(platform)) os = "macOS";
  else if (/linux/.test(ua) || /linux/.test(platform)) os = "Linux";

  let browser = "Other";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\//.test(ua) || /opera/.test(ua)) browser = "Opera";
  else if (/firefox\//.test(ua) || /fxios\//.test(ua)) browser = "Firefox";
  else if (/chrome\//.test(ua) || /crios\//.test(ua)) browser = "Chrome";
  else if (/safari\//.test(ua)) browser = "Safari";

  return { type:isTablet ? "Tablet" : isMobile ? "Mobile" : userAgent ? "Desktop" : "Unknown", os, browser };
}

function viewportBucket(value: unknown) {
  const width = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  if (width <= 0) return "Unknown";
  if (width < 480) return "Compact (<480px)";
  if (width < 768) return "Mobile (480–767px)";
  if (width < 1024) return "Tablet (768–1023px)";
  if (width < 1440) return "Laptop (1024–1439px)";
  return "Desktop (1440px+)";
}

export function getAnalyticsContext(headers: Headers, hints: AnalyticsClientHints = {}): AnalyticsContext {
  const safeHints = hints && typeof hints === "object" ? hints : {};
  const countryCandidate = cleanHeader(headers.get("cloudfront-viewer-country") ?? headers.get("x-vercel-ip-country"), 2)?.toUpperCase() ?? null;
  const countryCode = countryCandidate && /^[A-Z]{2}$/.test(countryCandidate) ? countryCandidate : null;
  const region = cleanHeader(headers.get("cloudfront-viewer-country-region-name"));
  const regionCandidate = cleanHeader(headers.get("cloudfront-viewer-country-region") ?? headers.get("x-vercel-ip-country-region"), 12)?.toUpperCase() ?? null;
  const regionCode = regionCandidate && /^[A-Z0-9-]{1,12}$/.test(regionCandidate) ? regionCandidate : null;
  const country = cleanHeader(headers.get("cloudfront-viewer-country-name"));
  return {
    location:{ countryCode, country, region, regionCode },
    device:detectDevice(headers.get("user-agent") ?? "", safeHints),
    viewport:viewportBucket(safeHints.viewportWidth),
  };
}

export function sanitizeTrafficSource(value: unknown): TrafficSource | null {
  if (!value || typeof value !== "object") return null;
  const input = value as { category?:unknown; host?:unknown };
  const categories = new Set<TrafficSource["category"]>(["direct", "internal", "search", "social", "professional_network", "github", "referral", "other"]);
  if (typeof input.category !== "string" || !categories.has(input.category as TrafficSource["category"])) return null;
  const rawHost = typeof input.host === "string" ? input.host.toLowerCase().trim().slice(0, 120) : "";
  const host = rawHost && /^[a-z0-9.-]+$/.test(rawHost) ? rawHost : null;
  return { category:input.category as TrafficSource["category"], host };
}

function isConditionalFailure(error: unknown) {
  return error instanceof Error && error.name === "ConditionalCheckFailedException";
}

function contextKey(context: AnalyticsContext, source: TrafficSource | null) {
  return hashId(JSON.stringify([
    context.location.countryCode,
    context.location.country,
    context.location.region,
    context.location.regionCode,
    context.device.type,
    context.device.os,
    context.device.browser,
    context.viewport,
    source?.category ?? null,
    source?.host ?? null,
  ])).slice(0, 24);
}

function locationKey(location: AnalyticsLocation) {
  return hashId(JSON.stringify([location.countryCode, location.country, location.region, location.regionCode])).slice(0, 24);
}

export async function recordMandatoryVisitorSession(input:{ eventId:string; visitorId:string; sessionId:string; location:AnalyticsLocation }) {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = isoDay(now);
  const expiration = retentionEpoch("mandatory", now.getTime());
  const visitorKey = hashId(input.visitorId);
  const sessionKey = hashId(input.sessionId);
  const event = buildMandatoryTelemetryRecord({ ...input, timestamp, expiresAt:expiration });

  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:event,
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { duplicate:true, day };
    throw error;
  }

  let uniqueVisitor = 0;
  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{ pk:`MANDATORY_VISITORS#${day}`, sk:`${locationKey(input.location)}#${visitorKey}`, expiresAt:expiration },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
    uniqueVisitor = 1;
  } catch (error) {
    if (!isConditionalFailure(error)) throw error;
  }

  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`ANALYTICS#${day}`, sk:`GEO#${locationKey(input.location)}` },
    UpdateExpression:"SET #day = :day, #location = :location, updatedAt = :now, expiresAt = :expires ADD #visits :one, #visitors :visitor",
    ExpressionAttributeNames:{ "#day":"day", "#location":"location", "#visits":"visits", "#visitors":"visitors" },
    ExpressionAttributeValues:{ ":day":day, ":location":input.location, ":now":timestamp, ":expires":expiration, ":one":1, ":visitor":uniqueVisitor },
  }));
  return { duplicate:false, day, timestamp, visitorId:visitorKey.slice(0, 12), sessionId:sessionKey.slice(0, 12) };
}

export async function recordBasicFeatureEvent(input:{ eventId:string; visitorId:string; sessionId:string; event:BasicFeatureEvent }) {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = isoDay(now);
  const expiration = retentionEpoch("basic", now.getTime());
  const eventHash = hashId(input.eventId);
  const visitorKey = hashId(input.visitorId);
  const sessionKey = hashId(input.sessionId);
  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{
        pk:`OP_EVENT#${eventHash}`,
        sk:"SUMMARY",
        eventId:eventHash.slice(0, 12),
        eventKey:eventHash,
        eventName:input.event.eventName,
        occurredAt:timestamp,
        day,
        page:input.event.page,
        feature:input.event.feature,
        metadata:input.event.metadata,
        visitorId:visitorKey.slice(0, 12),
        visitorKey,
        sessionId:sessionKey.slice(0, 12),
        sessionKey,
        expiresAt:expiration,
      },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { duplicate:true, day };
    throw error;
  }
  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`ANALYTICS#${day}`, sk:`FEATURE#${input.event.eventName}#${hashId(input.event.feature).slice(0, 16)}` },
    UpdateExpression:"SET #day = :day, eventName = :eventName, feature = :feature, metadata = :metadata, updatedAt = :now, expiresAt = :expires ADD #count :one",
    ExpressionAttributeNames:{ "#day":"day", "#count":"count" },
    ExpressionAttributeValues:{ ":day":day, ":eventName":input.event.eventName, ":feature":input.event.feature, ":metadata":input.event.metadata, ":now":timestamp, ":expires":expiration, ":one":1 },
  }));
  return { duplicate:false, day };
}

async function ensureChatSession(day: string, sessionId: string | null, expiration: number) {
  if (!sessionId) return false;
  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{ pk:`ANALYTICS_CHAT_SESSIONS#${day}`, sk:hashId(sessionId), expiresAt:expiration },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
    return true;
  } catch (error) {
    if (isConditionalFailure(error)) return false;
    throw error;
  }
}

async function recordChatContext(day: string, context: AnalyticsContext, requests: number, opens: number, sessions: number, expiration: number) {
  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`ANALYTICS#${day}`, sk:`CHAT_CONTEXT#${contextKey(context, null)}` },
    UpdateExpression:"SET #day = :day, #location = :location, device = :device, viewport = :viewport, updatedAt = :now, expiresAt = :expires ADD #requests :requests, #opens :opens, #sessions :sessions",
    ExpressionAttributeNames:{ "#day":"day", "#location":"location", "#requests":"requests", "#opens":"opens", "#sessions":"sessions" },
    ExpressionAttributeValues:{
      ":day":day,
      ":location":context.location,
      ":device":context.device,
      ":viewport":context.viewport,
      ":now":new Date().toISOString(),
      ":expires":expiration,
      ":requests":requests,
      ":opens":opens,
      ":sessions":sessions,
    },
  }));
}

export async function recordChatOpen(input:{ eventId:string; visitorId:string; sessionId:string; chatSessionId:string; context:AnalyticsContext; detailed:boolean }) {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = isoDay(now);
  const expiration = retentionEpoch("bb8", now.getTime());
  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{
        pk:`ANALYTICS_CHAT_EVENT#${hashId(input.eventId)}`,
        sk:"OPEN",
        eventId:hashId(input.eventId).slice(0, 12),
        eventKey:hashId(input.eventId),
        eventName:"copilot_opened",
        day,
        occurredAt:timestamp,
        visitorId:hashId(input.visitorId).slice(0, 12),
        visitorKey:hashId(input.visitorId),
        sessionId:hashId(input.sessionId).slice(0, 12),
        sessionKey:hashId(input.sessionId),
        chatSessionId:hashId(input.chatSessionId).slice(0, 12),
        chatSessionKey:hashId(input.chatSessionId),
        detailed:input.detailed,
        expiresAt:expiration,
      },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { duplicate:true, day };
    throw error;
  }
  const firstSessionEvent = await ensureChatSession(day, input.chatSessionId, expiration);
  await Promise.all([
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:"CHAT#SUMMARY" },
      UpdateExpression:"SET #day = :day, updatedAt = :now, expiresAt = :expires ADD #opens :one, #sessions :sessions",
      ExpressionAttributeNames:{ "#day":"day", "#opens":"opens", "#sessions":"sessions" },
      ExpressionAttributeValues:{ ":day":day, ":now":timestamp, ":expires":expiration, ":one":1, ":sessions":firstSessionEvent ? 1 : 0 },
    })),
    recordChatContext(day, input.context, 0, 1, firstSessionEvent ? 1 : 0, expiration),
  ]);
  return { duplicate:false, day };
}

export async function recordChatUsage(input: {
  eventId:string;
  visitorId:string;
  sessionId:string;
  chatSessionId:string;
  context:AnalyticsContext;
  model:string;
  successful:boolean;
  durationMs:number;
  retrievalMode?:string|null;
  retrievalFallback?:boolean;
  actionType?:string|null;
  usage?:ChatTokenUsage|null;
  detailed:boolean;
}) {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = isoDay(now);
  const expiration = retentionEpoch("bb8", now.getTime());
  const firstSessionEvent = await ensureChatSession(day, input.chatSessionId, expiration);
  const usage = input.usage ?? { inputTokens:0, outputTokens:0, totalTokens:0, cachedTokens:0 };
  const success = input.successful ? 1 : 0;
  const failure = input.successful ? 0 : 1;
  const fallback = input.retrievalFallback ? 1 : 0;
  const modelKey = hashId(input.model).slice(0, 16);

  const writes: Promise<unknown>[] = [
    docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{
        pk:`ANALYTICS_CHAT_EVENT#${hashId(input.eventId)}`,
        sk:"REQUEST",
        eventId:hashId(input.eventId).slice(0, 12),
        eventKey:hashId(input.eventId),
        day,
        occurredAt:timestamp,
        ...buildChatTelemetryRecord({ ...input, usage }),
        expiresAt:expiration,
      },
    })),
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:"CHAT#SUMMARY" },
      UpdateExpression:"SET #day = :day, updatedAt = :now, expiresAt = :expires ADD #requests :one, #sessions :sessions, #successful :success, #failed :failure, #duration :duration, #input :input, #output :output, #total :total, #cached :cached, #fallback :fallback",
      ExpressionAttributeNames:{ "#day":"day", "#requests":"requests", "#sessions":"sessions", "#successful":"successfulRequests", "#failed":"failedRequests", "#duration":"durationMs", "#input":"inputTokens", "#output":"outputTokens", "#total":"totalTokens", "#cached":"cachedTokens", "#fallback":"fallbackRequests" },
      ExpressionAttributeValues:{
        ":day":day, ":now":timestamp, ":expires":expiration, ":one":1, ":sessions":firstSessionEvent ? 1 : 0,
        ":success":success, ":failure":failure, ":duration":Math.max(0, Math.round(input.durationMs)),
        ":input":usage.inputTokens, ":output":usage.outputTokens, ":total":usage.totalTokens, ":cached":usage.cachedTokens, ":fallback":fallback,
      },
    })),
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:`CHAT_MODEL#${modelKey}` },
      UpdateExpression:"SET #day = :day, #model = :model, updatedAt = :now, expiresAt = :expires ADD #requests :one, #input :input, #output :output, #total :total",
      ExpressionAttributeNames:{ "#day":"day", "#model":"model", "#requests":"requests", "#input":"inputTokens", "#output":"outputTokens", "#total":"totalTokens" },
      ExpressionAttributeValues:{ ":day":day, ":model":input.model, ":now":timestamp, ":expires":expiration, ":one":1, ":input":usage.inputTokens, ":output":usage.outputTokens, ":total":usage.totalTokens },
    })),
    recordChatContext(day, input.context, 1, 0, firstSessionEvent ? 1 : 0, expiration),
  ];

  if (input.detailed && input.actionType) {
    writes.push(docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:`CHAT_ACTION#${input.actionType.slice(0, 40)}` },
      UpdateExpression:"SET #day = :day, actionType = :action, updatedAt = :now, expiresAt = :expires ADD #count :one",
      ExpressionAttributeNames:{ "#day":"day", "#count":"count" },
      ExpressionAttributeValues:{ ":day":day, ":action":input.actionType.slice(0, 40), ":now":timestamp, ":expires":expiration, ":one":1 },
    })));
  }
  if (input.retrievalMode) {
    writes.push(docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:`CHAT_RETRIEVAL#${input.retrievalMode.slice(0, 40)}` },
      UpdateExpression:"SET #day = :day, retrievalMode = :mode, updatedAt = :now, expiresAt = :expires ADD #count :one",
      ExpressionAttributeNames:{ "#day":"day", "#count":"count" },
      ExpressionAttributeValues:{ ":day":day, ":mode":input.retrievalMode.slice(0, 40), ":now":timestamp, ":expires":expiration, ":one":1 },
    })));
  }
  await Promise.all(writes);
}

export async function recordOperationalPageView(input: OperationalPageViewInput) {
  const now = new Date();
  const timestamp = now.toISOString();
  const day = isoDay(now);
  const expiration = retentionEpoch("basic", now.getTime());
  const eventHash = hashId(input.eventId);
  const visitorKey = hashId(input.visitorId);
  const sessionKey = hashId(input.sessionId);
  const analyticsContextKey = contextKey(input.context, input.source);

  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{
        pk:`OP_EVENT#${eventHash}`,
        sk:"SUMMARY",
        eventId:eventHash.slice(0, 12),
        eventKey:eventHash,
        eventName:"page_view",
        day,
        path:input.path,
        occurredAt:timestamp,
        visitorId:visitorKey.slice(0, 12),
        visitorKey,
        sessionId:sessionKey.slice(0, 12),
        sessionKey,
        contextKey:analyticsContextKey,
        context:input.context,
        source:input.source,
        expiresAt:expiration,
      },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { duplicate:true, day };
    throw error;
  }

  await Promise.all([
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:`PAGE#${input.path}` },
      UpdateExpression:"SET #path = :path, #day = :day, updatedAt = :now, expiresAt = :expires ADD #views :one",
      ExpressionAttributeNames:{ "#path":"path", "#day":"day", "#views":"views" },
      ExpressionAttributeValues:{ ":path":input.path, ":day":day, ":now":timestamp, ":expires":expiration, ":one":1 },
    })),
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${day}`, sk:`CONTEXT#${analyticsContextKey}` },
      UpdateExpression:"SET #day = :day, #location = :location, device = :device, viewport = :viewport, #source = :source, updatedAt = :now, expiresAt = :expires ADD #views :one",
      ExpressionAttributeNames:{ "#day":"day", "#location":"location", "#source":"source", "#views":"views" },
      ExpressionAttributeValues:{
        ":day":day,
        ":location":input.context.location,
        ":device":input.context.device,
        ":viewport":input.context.viewport,
        ":source":input.source,
        ":now":timestamp,
        ":expires":expiration,
        ":one":1,
      },
    })),
    recordUniquePageSession(input.path, input.sessionId),
  ]);

  return { duplicate:false, day };
}

export async function recordPageEngagement(eventId: string, durationMs: number) {
  const eventHash = hashId(eventId);
  let previous;
  try {
    previous = await docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`OP_EVENT#${eventHash}`, sk:"SUMMARY" },
      UpdateExpression:"SET durationMs = :duration, engagementRecordedAt = :now",
      ConditionExpression:"attribute_exists(pk) AND attribute_not_exists(durationMs)",
      ExpressionAttributeValues:{ ":duration":durationMs, ":now":new Date().toISOString() },
      ReturnValues:"ALL_OLD",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { accepted:false, duplicate:true };
    throw error;
  }
  const item = previous.Attributes;
  if (!item?.day || !item.path || !item.contextKey) return { accepted:false, duplicate:false };
  await Promise.all([
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${String(item.day)}`, sk:`PAGE#${String(item.path)}` },
      UpdateExpression:"ADD engagementMs :duration, engagedViews :one",
      ExpressionAttributeValues:{ ":duration":durationMs, ":one":1 },
    })),
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:`ANALYTICS#${String(item.day)}`, sk:`CONTEXT#${String(item.contextKey)}` },
      UpdateExpression:"ADD engagementMs :duration, engagedViews :one",
      ExpressionAttributeValues:{ ":duration":durationMs, ":one":1 },
    })),
  ]);
  return { accepted:true, duplicate:false };
}

async function recordUniquePageSession(path: string, sessionId: string) {
  const day = isoDay(new Date());
  const expiration = retentionEpoch("basic");
  const sessionHash = hashId(`${day}:${path}:${sessionId}`).slice(0, 32);
  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{ pk:`ANALYTICS_SESSION#${day}`, sk:`${path}#${sessionHash}`, expiresAt:expiration },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return;
    throw error;
  }
  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`ANALYTICS#${day}`, sk:`PAGE#${path}` },
    UpdateExpression:"ADD uniques :one",
    ExpressionAttributeValues:{ ":one":1 },
  }));
}

export async function recordPageActivity(input: PageActivityInput) {
  const now = new Date();
  const timestamp = now.toISOString();
  const expiration = retentionEpoch("enhanced", now.getTime());
  const visitorHash = hashId(input.visitorId);
  const visitHash = hashId(input.visitId);
  const eventHash = hashId(input.eventId).slice(0, 16);
  const visitorPk = `VISITOR#${visitorHash}`;
  const visitSk = `VISIT#${visitHash}`;
  const visitIndexPk = `ANALYTICS_VISITS#${isoDay(now)}`;
  const visitIndexSk = `${timestamp}#${visitHash}`;

  let visit = await docClient.send(new GetCommand({ TableName:PORTFOLIO_TABLE, Key:{ pk:visitorPk, sk:visitSk }, ConsistentRead:true }));
  let created = false;
  let createdVisitNumber: number | null = null;

  if (!visit.Item) {
    try {
      await docClient.send(new PutCommand({
        TableName:PORTFOLIO_TABLE,
        Item:{
          pk:visitorPk,
          sk:visitSk,
          visitorId:visitorHash.slice(0, 12),
          visitId:visitHash.slice(0, 12),
          visitNumber:0,
          startedAt:timestamp,
          lastActivityAt:timestamp,
          firstPath:input.path,
          lastPath:input.path,
          pageViews:0,
          location:input.context.location,
          device:input.context.device,
          viewport:input.context.viewport,
          source:input.source,
          indexPk:visitIndexPk,
          indexSk:visitIndexSk,
          expiresAt:expiration,
        },
        ConditionExpression:"attribute_not_exists(pk)",
      }));
      created = true;
    } catch (error) {
      if (!isConditionalFailure(error)) throw error;
    }
  }

  if (created) {
    const profile = await docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:visitorPk, sk:"PROFILE" },
      UpdateExpression:"SET visitorId = :visitorId, firstSeenAt = if_not_exists(firstSeenAt, :now), lastSeenAt = :now, #location = :location, device = :device, viewport = :viewport, audienceSegment = if_not_exists(audienceSegment, :segment), expiresAt = :expires ADD visitCount :one",
      ExpressionAttributeNames:{ "#location":"location" },
      ExpressionAttributeValues:{
        ":visitorId":visitorHash.slice(0, 12),
        ":now":timestamp,
        ":location":input.context.location,
        ":device":input.context.device,
        ":viewport":input.context.viewport,
        ":segment":"unclassified",
        ":expires":expiration,
        ":one":1,
      },
      ReturnValues:"ALL_NEW",
    }));
    const visitNumber = Number(profile.Attributes?.visitCount ?? 1);
    createdVisitNumber = Number.isFinite(visitNumber) && visitNumber > 0 ? Math.floor(visitNumber) : 1;
    await docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:visitorPk, sk:visitSk },
      UpdateExpression:"SET visitNumber = :visitNumber",
      ExpressionAttributeValues:{ ":visitNumber":createdVisitNumber },
    }));
  } else if (!visit.Item) {
    visit = await docClient.send(new GetCommand({ TableName:PORTFOLIO_TABLE, Key:{ pk:visitorPk, sk:visitSk }, ConsistentRead:true }));
  }

  const storedVisit = visit.Item;
  const indexPk = created ? visitIndexPk : String(storedVisit?.indexPk ?? visitIndexPk);
  const indexSk = created ? visitIndexSk : String(storedVisit?.indexSk ?? visitIndexSk);
  const startedAt = created ? timestamp : String(storedVisit?.startedAt ?? timestamp);
  const storedVisitNumber = createdVisitNumber ?? Number(storedVisit?.visitNumber ?? 1);
  const visitNumber = Number.isFinite(storedVisitNumber) && storedVisitNumber > 0 ? Math.floor(storedVisitNumber) : 1;

  try {
    await docClient.send(new PutCommand({
      TableName:PORTFOLIO_TABLE,
      Item:{ pk:visitorPk, sk:`VISIT#${visitHash}#EVENT#${timestamp}#${eventHash}`, path:input.path, occurredAt:timestamp, eventId:eventHash, expiresAt:expiration },
      ConditionExpression:"attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (isConditionalFailure(error)) return { accepted:true, duplicate:true };
    throw error;
  }

  await Promise.all([
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:visitorPk, sk:visitSk },
      UpdateExpression:"SET lastActivityAt = :now, lastPath = :path, expiresAt = :expires ADD pageViews :one",
      ExpressionAttributeValues:{ ":now":timestamp, ":path":input.path, ":expires":expiration, ":one":1 },
    })),
    docClient.send(new UpdateCommand({
      TableName:PORTFOLIO_TABLE,
      Key:{ pk:indexPk, sk:indexSk },
      UpdateExpression:"SET visitorPk = if_not_exists(visitorPk, :visitorPk), visitorId = if_not_exists(visitorId, :visitorId), visitId = if_not_exists(visitId, :visitId), visitNumber = :visitNumber, startedAt = if_not_exists(startedAt, :startedAt), lastActivityAt = :now, firstPath = if_not_exists(firstPath, :path), lastPath = :path, #location = if_not_exists(#location, :location), device = if_not_exists(device, :device), viewport = if_not_exists(viewport, :viewport), #source = if_not_exists(#source, :source), expiresAt = :expires ADD pageViews :one",
      ExpressionAttributeNames:{ "#location":"location", "#source":"source" },
      ExpressionAttributeValues:{
        ":visitorPk":visitorPk,
        ":visitorId":visitorHash.slice(0, 12),
        ":visitId":visitHash.slice(0, 12),
        ":visitNumber":visitNumber,
        ":startedAt":startedAt,
        ":now":timestamp,
        ":path":input.path,
        ":location":input.context.location,
        ":device":input.context.device,
        ":viewport":input.context.viewport,
        ":source":input.source,
        ":expires":expiration,
        ":one":1,
      },
    })),
  ]);
  return { accepted:true, duplicate:false };
}

export async function setVisitorAudienceSegment(visitorKey: string, segment: AudienceSegment) {
  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`VISITOR#${visitorKey}`, sk:"PROFILE" },
    UpdateExpression:"SET audienceSegment = :segment, classifiedAt = :now",
    ConditionExpression:"attribute_exists(pk)",
    ExpressionAttributeValues:{ ":segment":segment, ":now":new Date().toISOString() },
  }));
  return { visitorKey, segment };
}

type BreakdownValue = { label:string; count:number; engagementMs:number; engagedViews:number };

function addBreakdown(map: Map<string, BreakdownValue>, label: string, views: number, engagementMs: number, engagedViews: number) {
  const current = map.get(label) ?? { label, count:0, engagementMs:0, engagedViews:0 };
  current.count += views;
  current.engagementMs += engagementMs;
  current.engagedViews += engagedViews;
  map.set(label, current);
}

function finishBreakdown(map: Map<string, BreakdownValue>) {
  return [...map.values()].map((item) => ({
    label:item.label,
    count:item.count,
    averageEngagementMs:item.engagedViews ? Math.round(item.engagementMs / item.engagedViews) : 0,
  })).sort((left, right) => right.count - left.count);
}

export async function getTrafficReport(days = 30) {
  const dates = Array.from({ length:days }, (_, index) => isoDay(new Date(Date.now() - (days - 1 - index) * DAY_MS)));
  const [analyticsResponses, visitResponses] = await Promise.all([
    Promise.all(dates.map((day) => docClient.send(new QueryCommand({ TableName:PORTFOLIO_TABLE, KeyConditionExpression:"pk = :pk", ExpressionAttributeValues:{ ":pk":`ANALYTICS#${day}` } })))),
    Promise.all(dates.map((day) => docClient.send(new QueryCommand({ TableName:PORTFOLIO_TABLE, KeyConditionExpression:"pk = :pk", ExpressionAttributeValues:{ ":pk":`ANALYTICS_VISITS#${day}` } })))),
  ]);

  const daily = analyticsResponses.map((response, index) => {
    const pageItems = (response.Items ?? []).filter((item) => String(item.sk).startsWith("PAGE#"));
    const geoItems = (response.Items ?? []).filter((item) => String(item.sk).startsWith("GEO#"));
    const chatSummary = (response.Items ?? []).find((item) => String(item.sk) === "CHAT#SUMMARY");
    const pages = pageItems.map((item) => ({
      path:String(item.path),
      views:Number(item.views ?? 0),
      uniques:Number(item.uniques ?? 0),
      engagementMs:Number(item.engagementMs ?? 0),
      engagedViews:Number(item.engagedViews ?? 0),
    }));
    const visits = visitResponses[index].Count ?? visitResponses[index].Items?.length ?? 0;
    return {
      day:dates[index],
      views:pages.reduce((sum, page) => sum + page.views, 0),
      uniques:pages.reduce((sum, page) => sum + page.uniques, 0),
      engagementMs:pages.reduce((sum, page) => sum + page.engagementMs, 0),
      engagedViews:pages.reduce((sum, page) => sum + page.engagedViews, 0),
      visits,
      mandatoryVisits:geoItems.reduce((sum, item) => sum + Number(item.visits ?? 0), 0),
      mandatoryVisitors:geoItems.reduce((sum, item) => sum + Number(item.visitors ?? 0), 0),
      chatOpens:Number(chatSummary?.opens ?? 0),
      chatSessions:Number(chatSummary?.sessions ?? 0),
      chatRequests:Number(chatSummary?.requests ?? 0),
      pages,
    };
  });

  const byPath = new Map<string, { path:string; views:number; uniques:number; engagementMs:number; engagedViews:number }>();
  daily.flatMap((entry) => entry.pages).forEach((page) => {
    const current = byPath.get(page.path) ?? { path:page.path, views:0, uniques:0, engagementMs:0, engagedViews:0 };
    current.views += page.views;
    current.uniques += page.uniques;
    current.engagementMs += page.engagementMs;
    current.engagedViews += page.engagedViews;
    byPath.set(page.path, current);
  });

  const devices = new Map<string, BreakdownValue>();
  const operatingSystems = new Map<string, BreakdownValue>();
  const browsers = new Map<string, BreakdownValue>();
  const viewports = new Map<string, BreakdownValue>();
  const locations = new Map<string, BreakdownValue>();
  const mandatoryLocations = new Map<string, BreakdownValue>();
  const mandatoryRegions = new Map<string, BreakdownValue>();
  const regions = new Map<string, BreakdownValue>();
  const sources = new Map<string, BreakdownValue>();
  const featureEvents = new Map<string, BreakdownValue>();
  analyticsResponses.flatMap((response) => response.Items ?? []).filter((item) => String(item.sk).startsWith("GEO#")).forEach((item) => {
    const visits = Number(item.visits ?? 0);
    const location = item.location as AnalyticsLocation | undefined;
    addBreakdown(mandatoryLocations, location?.countryCode ?? location?.country ?? "Unknown", visits, 0, 0);
    const region = location?.region ?? location?.regionCode;
    if (region) addBreakdown(mandatoryRegions, `${location?.countryCode ?? location?.country ?? "Unknown"} · ${region}`, visits, 0, 0);
  });
  analyticsResponses.flatMap((response) => response.Items ?? []).filter((item) => String(item.sk).startsWith("CONTEXT#")).forEach((item) => {
    const views = Number(item.views ?? 0);
    const engagementMs = Number(item.engagementMs ?? 0);
    const engagedViews = Number(item.engagedViews ?? 0);
    const context = item as { location?:AnalyticsContext["location"]; device?:AnalyticsContext["device"]; viewport?:string; source?:TrafficSource|null };
    addBreakdown(devices, context.device?.type ?? "Unknown", views, engagementMs, engagedViews);
    addBreakdown(operatingSystems, context.device?.os ?? "Unknown", views, engagementMs, engagedViews);
    addBreakdown(browsers, context.device?.browser ?? "Unknown", views, engagementMs, engagedViews);
    addBreakdown(viewports, context.viewport ?? "Unknown", views, engagementMs, engagedViews);
    addBreakdown(locations, context.location?.countryCode ?? "Unknown", views, engagementMs, engagedViews);
    if (context.location?.region) addBreakdown(regions, `${context.location.countryCode ?? "Unknown"} · ${context.location.region}`, views, engagementMs, engagedViews);
    addBreakdown(sources, context.source?.category ?? "Basic measurement", views, engagementMs, engagedViews);
  });
  analyticsResponses.flatMap((response) => response.Items ?? []).filter((item) => String(item.sk).startsWith("FEATURE#")).forEach((item) => {
    addBreakdown(featureEvents, `${String(item.eventName ?? "event")} · ${String(item.feature ?? "unknown")}`, Number(item.count ?? 0), 0, 0);
  });

  const chatActions = new Map<string, BreakdownValue>();
  const chatRetrievalModes = new Map<string, BreakdownValue>();
  const chatDevices = new Map<string, BreakdownValue>();
  const chatLocations = new Map<string, BreakdownValue>();
  const chatRegions = new Map<string, BreakdownValue>();
  const chatModels = new Map<string, { label:string; requests:number; inputTokens:number; outputTokens:number; totalTokens:number }>();
  let chatOpens = 0;
  let chatSessions = 0;
  let chatRequests = 0;
  let chatSuccessfulRequests = 0;
  let chatFailedRequests = 0;
  let chatDurationMs = 0;
  let chatInputTokens = 0;
  let chatOutputTokens = 0;
  let chatTotalTokens = 0;
  let chatCachedTokens = 0;
  let chatFallbackRequests = 0;
  analyticsResponses.flatMap((response) => response.Items ?? []).forEach((item) => {
    const sk = String(item.sk);
    if (sk === "CHAT#SUMMARY") {
      chatOpens += Number(item.opens ?? 0);
      chatSessions += Number(item.sessions ?? 0);
      chatRequests += Number(item.requests ?? 0);
      chatSuccessfulRequests += Number(item.successfulRequests ?? 0);
      chatFailedRequests += Number(item.failedRequests ?? 0);
      chatDurationMs += Number(item.durationMs ?? 0);
      chatInputTokens += Number(item.inputTokens ?? 0);
      chatOutputTokens += Number(item.outputTokens ?? 0);
      chatTotalTokens += Number(item.totalTokens ?? 0);
      chatCachedTokens += Number(item.cachedTokens ?? 0);
      chatFallbackRequests += Number(item.fallbackRequests ?? 0);
    } else if (sk.startsWith("CHAT_ACTION#")) {
      addBreakdown(chatActions, String(item.actionType ?? "Unknown"), Number(item.count ?? 0), 0, 0);
    } else if (sk.startsWith("CHAT_RETRIEVAL#")) {
      addBreakdown(chatRetrievalModes, String(item.retrievalMode ?? "Unknown"), Number(item.count ?? 0), 0, 0);
    } else if (sk.startsWith("CHAT_CONTEXT#")) {
      const context = item as { location?:AnalyticsLocation; device?:AnalyticsContext["device"] };
      const requests = Number(item.requests ?? 0);
      addBreakdown(chatDevices, context.device?.type ?? "Unknown", requests, 0, 0);
      addBreakdown(chatLocations, context.location?.countryCode ?? context.location?.country ?? "Unknown", requests, 0, 0);
      const region = context.location?.region ?? context.location?.regionCode;
      if (region) addBreakdown(chatRegions, `${context.location?.countryCode ?? context.location?.country ?? "Unknown"} · ${region}`, requests, 0, 0);
    } else if (sk.startsWith("CHAT_MODEL#")) {
      const label = String(item.model ?? "Unknown");
      const current = chatModels.get(label) ?? { label, requests:0, inputTokens:0, outputTokens:0, totalTokens:0 };
      current.requests += Number(item.requests ?? 0);
      current.inputTokens += Number(item.inputTokens ?? 0);
      current.outputTokens += Number(item.outputTokens ?? 0);
      current.totalTokens += Number(item.totalTokens ?? 0);
      chatModels.set(label, current);
    }
  });

  const allIndexedVisits = visitResponses.flatMap((response) => response.Items ?? []).sort((left, right) => String(right.startedAt).localeCompare(String(left.startedAt)));
  const indexedVisits = allIndexedVisits.slice(0, 100);
  const visitorPks = [...new Set(indexedVisits.map((visit) => String(visit.visitorPk ?? "")).filter(Boolean))];
  const profileResponse = visitorPks.length ? await docClient.send(new BatchGetCommand({
    RequestItems:{ [PORTFOLIO_TABLE]:{ Keys:visitorPks.map((pk) => ({ pk, sk:"PROFILE" })) } },
  })) : null;
  const profiles = new Map((profileResponse?.Responses?.[PORTFOLIO_TABLE] ?? []).map((profile) => [String(profile.pk), profile]));

  const visits = await Promise.all(indexedVisits.map(async (visit) => {
    const visitorId = String(visit.visitorId ?? "unknown");
    const visitId = String(visit.visitId ?? "unknown");
    const indexSk = String(visit.sk ?? "");
    const fullVisitHash = indexSk.slice(indexSk.indexOf("#") + 1);
    const visitorPk = visit.visitorPk ? String(visit.visitorPk) : null;
    let activities: { path:string; occurredAt:string }[] = [];
    if (visitorPk && fullVisitHash) {
      const response = await docClient.send(new QueryCommand({
        TableName:PORTFOLIO_TABLE,
        KeyConditionExpression:"pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues:{ ":pk":visitorPk, ":prefix":`VISIT#${fullVisitHash}#EVENT#` },
      }));
      activities = (response.Items ?? []).map((item) => ({ path:String(item.path), occurredAt:String(item.occurredAt) }));
    }
    const profile = visitorPk ? profiles.get(visitorPk) : undefined;
    return {
      id:`${visitorId}:${visitId}`,
      visitorId,
      visitorKey:visitorPk?.replace(/^VISITOR#/, "") ?? "",
      visitId,
      visitNumber:Number(visit.visitNumber ?? 1),
      startedAt:String(visit.startedAt),
      lastActivityAt:String(visit.lastActivityAt ?? visit.startedAt),
      pageViews:Number(visit.pageViews ?? activities.length),
      firstPath:String(visit.firstPath ?? activities[0]?.path ?? "/"),
      lastPath:String(visit.lastPath ?? activities.at(-1)?.path ?? "/"),
      location:visit.location as AnalyticsContext["location"] | undefined,
      device:visit.device as AnalyticsContext["device"] | undefined,
      viewport:String(visit.viewport ?? "Unknown"),
      source:visit.source as TrafficSource | null | undefined,
      audienceSegment:(profile?.audienceSegment ?? "unclassified") as AudienceSegment,
      activities,
    };
  }));

  const visitorIds = new Set(allIndexedVisits.map((visit) => String(visit.visitorId ?? "unknown")));
  const totalViews = daily.reduce((sum, entry) => sum + entry.views, 0);
  const totalEngagementMs = daily.reduce((sum, entry) => sum + entry.engagementMs, 0);
  const totalEngagedViews = daily.reduce((sum, entry) => sum + entry.engagedViews, 0);
  const journeyViews = allIndexedVisits.reduce((sum, visit) => sum + Number(visit.pageViews ?? 0), 0);
  return {
    daily:daily.map(({ pages:unused, ...entry }) => { void unused; return entry; }),
    pages:[...byPath.values()].map((page) => ({
      ...page,
      averageEngagementMs:page.engagedViews ? Math.round(page.engagementMs / page.engagedViews) : 0,
    })).sort((left, right) => right.views - left.views),
    visits,
    breakdowns:{
      devices:finishBreakdown(devices),
      operatingSystems:finishBreakdown(operatingSystems),
      browsers:finishBreakdown(browsers),
      viewports:finishBreakdown(viewports),
      locations:finishBreakdown(mandatoryLocations.size ? mandatoryLocations : locations),
      regions:finishBreakdown(mandatoryRegions.size ? mandatoryRegions : regions),
      sources:finishBreakdown(sources),
      events:finishBreakdown(featureEvents),
    },
    chat:{
      opens:chatOpens,
      sessions:chatSessions,
      requests:chatRequests,
      successfulRequests:chatSuccessfulRequests,
      failedRequests:chatFailedRequests,
      successRate:chatRequests ? Math.round(chatSuccessfulRequests / chatRequests * 100) : 0,
      averageLatencyMs:chatRequests ? Math.round(chatDurationMs / chatRequests) : 0,
      inputTokens:chatInputTokens,
      outputTokens:chatOutputTokens,
      totalTokens:chatTotalTokens,
      cachedTokens:chatCachedTokens,
      fallbackRequests:chatFallbackRequests,
      fallbackRate:chatRequests ? Math.round(chatFallbackRequests / chatRequests * 100) : 0,
      actions:finishBreakdown(chatActions),
      retrievalModes:finishBreakdown(chatRetrievalModes),
      devices:finishBreakdown(chatDevices),
      locations:finishBreakdown(chatLocations),
      regions:finishBreakdown(chatRegions),
      models:[...chatModels.values()].sort((left, right) => right.requests - left.requests),
    },
    totals:{
      mandatoryVisits:daily.reduce((sum, entry) => sum + entry.mandatoryVisits, 0),
      mandatoryVisitors:daily.reduce((sum, entry) => sum + entry.mandatoryVisitors, 0),
      views:totalViews,
      uniques:daily.reduce((sum, entry) => sum + entry.uniques, 0),
      visitors:visitorIds.size,
      visits:allIndexedVisits.length,
      returningVisits:allIndexedVisits.filter((visit) => Number(visit.visitNumber ?? 1) > 1).length,
      averageEngagementMs:totalEngagedViews ? Math.round(totalEngagementMs / totalEngagedViews) : 0,
      journeyCoverage:totalViews ? Math.min(100, Math.round(journeyViews / totalViews * 100)) : 0,
    },
  };
}
