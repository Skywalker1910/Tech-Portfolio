import { createHash } from "node:crypto";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "@/lib/dynamodb";

const DAY_MS = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export function sanitizeTrackedPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0].replace(/\/+$/, "") || "/";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api") || path.length > 120) return null;
  return path;
}

export async function recordPageView(path: string, sessionId: string) {
  const day = isoDay(new Date());
  const expiresAt = Math.floor((Date.now() + 400 * DAY_MS) / 1000);
  const sessionHash = createHash("sha256").update(`${day}:${path}:${sessionId}`).digest("hex").slice(0, 32);
  let unique = false;
  try {
    await docClient.send(new PutCommand({ TableName:PORTFOLIO_TABLE, Item:{ pk:`ANALYTICS_SESSION#${day}`, sk:`${path}#${sessionHash}`, expiresAt }, ConditionExpression:"attribute_not_exists(pk)" }));
    unique = true;
  } catch (error) {
    if (!(error instanceof Error && error.name === "ConditionalCheckFailedException")) throw error;
  }
  await docClient.send(new UpdateCommand({
    TableName:PORTFOLIO_TABLE,
    Key:{ pk:`ANALYTICS#${day}`, sk:`PAGE#${path}` },
    UpdateExpression:`SET #path = :path, #day = :day, updatedAt = :now, expiresAt = :expires ADD #views :one${unique ? ", #uniques :one" : ""}`,
    ExpressionAttributeNames:{ "#path":"path", "#day":"day", "#views":"views", ...(unique ? { "#uniques":"uniques" } : {}) },
    ExpressionAttributeValues:{ ":path":path, ":day":day, ":now":new Date().toISOString(), ":expires":expiresAt, ":one":1 },
  }));
}

export async function getTrafficReport(days = 30) {
  const dates = Array.from({ length:days }, (_, i) => isoDay(new Date(Date.now() - (days - 1 - i) * DAY_MS)));
  const responses = await Promise.all(dates.map((day) => docClient.send(new QueryCommand({ TableName:PORTFOLIO_TABLE, KeyConditionExpression:"pk = :pk", ExpressionAttributeValues:{ ":pk":`ANALYTICS#${day}` } }))));
  const daily = responses.map((response, index) => {
    const pages = (response.Items ?? []).map((item) => ({ path:String(item.path), views:Number(item.views ?? 0), uniques:Number(item.uniques ?? 0) }));
    return { day:dates[index], views:pages.reduce((sum, p) => sum + p.views, 0), uniques:pages.reduce((sum, p) => sum + p.uniques, 0), pages };
  });
  const byPath = new Map<string, { path:string; views:number; uniques:number }>();
  daily.flatMap((d) => d.pages).forEach((page) => { const current = byPath.get(page.path) ?? { path:page.path, views:0, uniques:0 }; current.views += page.views; current.uniques += page.uniques; byPath.set(page.path, current); });
  return { daily, pages:[...byPath.values()].sort((a,b) => b.views - a.views), totals:{ views:daily.reduce((s,d) => s + d.views,0), uniques:daily.reduce((s,d) => s + d.uniques,0) } };
}
