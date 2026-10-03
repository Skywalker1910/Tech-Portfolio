import { PutCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "./dynamodb";
import { retentionEpoch } from "./analytics-policy";
import { ANALYTICS_CONSENT_VERSION } from "./client-analytics";

export function promptReviewAllowed(version:unknown, tier:unknown, privacySignal=false) {
  return !privacySignal && version===ANALYTICS_CONSENT_VERSION && (tier==="basic" || tier==="enhanced");
}

export function redactReviewPrompt(value:string) {
  return value.slice(0,1000)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[email removed]")
    .replace(/https?:\/\/[^\s]+/gi,"[link removed]")
    .replace(/\b(?:sk-|ghp_|github_pat_|AKIA)[A-Za-z0-9_-]{12,}\b/g,"[credential removed]")
    .replace(/(?:\+?\d[\d ().-]{7,}\d)/g,"[number removed]");
}

export function buildPromptReviewRecord(input:{prompt:string;successful:boolean;model:string;retrievalMode:string|null;retrievalFallback:boolean}, now=Date.now(), id=crypto.randomUUID()) {
  const occurredAt=new Date(now).toISOString();
  return {
    pk:`CHAT_REVIEW#${occurredAt.slice(0,10)}`, sk:`${occurredAt}#${id}`,
    prompt:redactReviewPrompt(input.prompt), occurredAt,
    successful:input.successful, model:input.model.slice(0,80),
    retrievalMode:input.retrievalMode, retrievalFallback:input.retrievalFallback,
    consentVersion:ANALYTICS_CONSENT_VERSION, status:"new",
    expiresAt:retentionEpoch("bb8",now),
  };
}

export async function recordPromptForReview(input:Parameters<typeof buildPromptReviewRecord>[0]) {
  await docClient.send(new PutCommand({TableName:PORTFOLIO_TABLE,Item:buildPromptReviewRecord(input)}));
}

export function validReviewDay(day:string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const time=Date.parse(day);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,10)===day;
}
export function validReviewId(day:string,id:string) {
  return validReviewDay(day) && id.startsWith(`${day}T`) && /^\d{4}-\d{2}-\d{2}T[0-9:.]+Z#[0-9a-f-]{36}$/.test(id);
}

export async function listPromptReviews(day:string, cursor?:string|null) {
  const result=await docClient.send(new QueryCommand({
    TableName:PORTFOLIO_TABLE,KeyConditionExpression:"pk = :pk",
    ExpressionAttributeValues:{":pk":`CHAT_REVIEW#${day}`},
    ScanIndexForward:false,Limit:50,
    ...(cursor ? {ExclusiveStartKey:{pk:`CHAT_REVIEW#${day}`,sk:cursor}} : {}),
  }));
  return {items:(result.Items ?? []).filter(item=>Number(item.expiresAt)>Date.now()/1000).map(({pk,sk,...item})=>{void pk;return {...item,id:sk};}),nextCursor:result.LastEvaluatedKey?.sk ?? null};
}
export async function changePromptReview(day:string,id:string,action:"review"|"delete") {
  const Key={pk:`CHAT_REVIEW#${day}`,sk:id};
  if(action==="delete") await docClient.send(new DeleteCommand({TableName:PORTFOLIO_TABLE,Key}));
  else await docClient.send(new UpdateCommand({TableName:PORTFOLIO_TABLE,Key,
    UpdateExpression:"SET #status = :status, reviewedAt = :now",ConditionExpression:"attribute_exists(pk)",
    ExpressionAttributeNames:{"#status":"status"},ExpressionAttributeValues:{":status":"reviewed",":now":new Date().toISOString()},
  }));
}
