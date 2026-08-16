import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "@/lib/dynamodb";
import { defaultsFor } from "./defaults";
import type { ContentKind, PortfolioContent, RagRuntimeSettings } from "./types";

const contentPk = (kind: ContentKind) => `CONTENT#${kind.toUpperCase()}`;
const itemSk = (id: string) => `ITEM#${id}`;

export function isMissingPortfolioTable(error: unknown) {
  return error instanceof Error && (error.name === "ResourceNotFoundException" || error.message.includes("Requested resource not found"));
}

export async function listContent(kind: ContentKind, includeDrafts = false): Promise<PortfolioContent[]> {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": contentPk(kind) },
    }));
    const records = (result.Items ?? []).map((item) => {
      const clean = { ...item };
      delete clean.pk;
      delete clean.sk;
      return clean as PortfolioContent;
    });
    const source = records.length ? records : defaultsFor(kind);
    return source.filter((item) => includeDrafts || item.published).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    if (!isMissingPortfolioTable(error)) console.error(`[content] Could not read ${kind}; using bundled defaults.`, error);
    return [...defaultsFor(kind)].filter((item) => includeDrafts || item.published);
  }
}

export async function saveContent(kind: ContentKind, item: PortfolioContent) {
  const now = new Date().toISOString();
  const record = { ...item, updatedAt: now, createdAt: item.createdAt ?? now };
  await docClient.send(new PutCommand({ TableName: PORTFOLIO_TABLE, Item: { pk: contentPk(kind), sk: itemSk(item.id), ...record } }));
  return record;
}

export async function deleteContent(kind: ContentKind, id: string) {
  await docClient.send(new DeleteCommand({ TableName: PORTFOLIO_TABLE, Key: { pk: contentPk(kind), sk: itemSk(id) } }));
}

export async function getRagRuntimeSettings(): Promise<RagRuntimeSettings | null> {
  try {
    const result = await docClient.send(new GetCommand({ TableName: PORTFOLIO_TABLE, Key: { pk:"SETTINGS", sk:"RAG" } }));
    if (!result.Item) return null;
    return { enabled:Boolean(result.Item.enabled), topK:Number(result.Item.topK), maxDistance:Number(result.Item.maxDistance), updatedAt:result.Item.updatedAt };
  } catch (error) {
    if (!isMissingPortfolioTable(error)) console.error("[rag] Could not read runtime settings.", error);
    return null;
  }
}

export async function saveRagRuntimeSettings(settings: RagRuntimeSettings) {
  const record = { ...settings, pk:"SETTINGS", sk:"RAG", updatedAt:new Date().toISOString() };
  await docClient.send(new PutCommand({ TableName: PORTFOLIO_TABLE, Item:record }));
  return record;
}

export async function getRagStatus() {
  try { return (await docClient.send(new GetCommand({ TableName:PORTFOLIO_TABLE, Key:{ pk:"STATUS", sk:"RAG" } }))).Item ?? null; }
  catch (error) { if (!isMissingPortfolioTable(error)) console.error("[rag] Could not read status.", error); return null; }
}

export async function saveRagStatus(status: Record<string, unknown>) {
  await docClient.send(new PutCommand({ TableName:PORTFOLIO_TABLE, Item:{ pk:"STATUS", sk:"RAG", ...status, updatedAt:new Date().toISOString() } }));
}
