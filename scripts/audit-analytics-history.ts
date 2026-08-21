import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "../lib/dynamodb";

type AnalyticsInventory = {
  records:number;
  active:number;
  expiredAwaitingTtl:number;
  earliestDay:string|null;
  latestDay:string|null;
};

type VisitAttributeCoverage = {
  visitorReference:number;
  visitorPartitionKey:number;
  visitNumber:number;
  pageViews:number;
  location:number;
  country:number;
  region:number;
  legacyCity:number;
  device:number;
  viewport:number;
  source:number;
};

function emptyInventory():AnalyticsInventory {
  return { records:0, active:0, expiredAwaitingTtl:0, earliestDay:null, latestDay:null };
}

function addRecord(inventory:AnalyticsInventory, day:string|null, expiresAt:unknown, now:number) {
  inventory.records += 1;
  if (typeof expiresAt === "number" && expiresAt <= now) inventory.expiredAwaitingTtl += 1;
  else inventory.active += 1;
  if (!day) return;
  if (!inventory.earliestDay || day < inventory.earliestDay) inventory.earliestDay = day;
  if (!inventory.latestDay || day > inventory.latestDay) inventory.latestDay = day;
}

function dayFromValue(value:unknown) {
  if (typeof value !== "string") return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? null;
}

function increment(map:Map<string, number>, label:string, count:number) {
  map.set(label, (map.get(label) ?? 0) + count);
}

function sortedCounts(map:Map<string, number>) {
  return [...map.entries()].map(([country, count]) => ({ country, count })).sort((left, right) => right.count - left.count);
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const inventory = {
    enhancedVisitIndexes:emptyInventory(),
    enhancedVisitSummaries:emptyInventory(),
    enhancedVisitorProfiles:emptyInventory(),
    enhancedPageEvents:emptyInventory(),
    mandatoryVisitEvents:emptyInventory(),
    dailyAggregates:emptyInventory(),
  };
  const enhancedVisitAttributeCoverage:VisitAttributeCoverage = {
    visitorReference:0,
    visitorPartitionKey:0,
    visitNumber:0,
    pageViews:0,
    location:0,
    country:0,
    region:0,
    legacyCity:0,
    device:0,
    viewport:0,
    source:0,
  };
  const countryCoverage = {
    mandatoryVisits:new Map<string, number>(),
    enhancedVisits:new Map<string, number>(),
    legacyContextViews:new Map<string, number>(),
  };
  let cursor:Record<string, unknown>|undefined;

  do {
    const page = await docClient.send(new ScanCommand({
      TableName:PORTFOLIO_TABLE,
      ExclusiveStartKey:cursor,
    }));

    for (const item of page.Items ?? []) {
      const pk = String(item.pk ?? "");
      const sk = String(item.sk ?? "");
      if (pk.startsWith("ANALYTICS_VISITS#")) {
        addRecord(inventory.enhancedVisitIndexes, dayFromValue(pk), item.expiresAt, now);
        const location = item.location as { country?:unknown; countryCode?:unknown; region?:unknown; regionCode?:unknown; city?:unknown }|undefined;
        if (item.visitorId) enhancedVisitAttributeCoverage.visitorReference += 1;
        if (item.visitorPk) enhancedVisitAttributeCoverage.visitorPartitionKey += 1;
        if (typeof item.visitNumber === "number") enhancedVisitAttributeCoverage.visitNumber += 1;
        if (typeof item.pageViews === "number") enhancedVisitAttributeCoverage.pageViews += 1;
        if (location) enhancedVisitAttributeCoverage.location += 1;
        if (location?.country || location?.countryCode) enhancedVisitAttributeCoverage.country += 1;
        if (location?.region || location?.regionCode) enhancedVisitAttributeCoverage.region += 1;
        if (location && Object.prototype.hasOwnProperty.call(location, "city")) enhancedVisitAttributeCoverage.legacyCity += 1;
        if (item.device) enhancedVisitAttributeCoverage.device += 1;
        if (item.viewport) enhancedVisitAttributeCoverage.viewport += 1;
        if (item.source) enhancedVisitAttributeCoverage.source += 1;
        increment(countryCoverage.enhancedVisits, String(location?.countryCode ?? location?.country ?? "Unknown"), 1);
      } else if (pk.startsWith("VISITOR#") && sk === "PROFILE") {
        addRecord(inventory.enhancedVisitorProfiles, dayFromValue(item.startedAt), item.expiresAt, now);
      } else if (pk.startsWith("VISITOR#") && sk.startsWith("VISIT#") && sk.includes("#EVENT#")) {
        addRecord(inventory.enhancedPageEvents, dayFromValue(item.occurredAt), item.expiresAt, now);
      } else if (pk.startsWith("VISITOR#") && sk.startsWith("VISIT#")) {
        addRecord(inventory.enhancedVisitSummaries, dayFromValue(item.startedAt), item.expiresAt, now);
      } else if (pk.startsWith("MANDATORY_EVENT#")) {
        addRecord(inventory.mandatoryVisitEvents, dayFromValue(item.occurredAt), item.expiresAt, now);
      } else if (pk.startsWith("ANALYTICS#")) {
        addRecord(inventory.dailyAggregates, dayFromValue(pk), item.expiresAt, now);
        const location = item.location as { country?:unknown; countryCode?:unknown }|undefined;
        const country = String(location?.countryCode ?? location?.country ?? "Unknown");
        if (sk.startsWith("GEO#")) increment(countryCoverage.mandatoryVisits, country, Number(item.visits ?? 0));
        if (sk.startsWith("CONTEXT#")) increment(countryCoverage.legacyContextViews, country, Number(item.views ?? 0));
      }
    }
    cursor = page.LastEvaluatedKey as Record<string, unknown>|undefined;
  } while (cursor);

  console.log(JSON.stringify({
    table:PORTFOLIO_TABLE,
    generatedAt:new Date().toISOString(),
    inventory,
    enhancedVisitAttributeCoverage,
    countryCoverage:{
      mandatoryVisits:sortedCounts(countryCoverage.mandatoryVisits),
      enhancedVisits:sortedCounts(countryCoverage.enhancedVisits),
      legacyContextViews:sortedCounts(countryCoverage.legacyContextViews),
    },
  }, null, 2));
}

main().catch((error) => {
  console.error("Analytics history audit failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
