import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamodb";
import { ArcadeError, GAME_VERSION, MAX_SCORE } from "./policy";
import type { NameReview } from "./moderation";
import type { RunTicket, CompletedRun } from "./runs";

export type LeaderboardEntry = { id:string; name:string; country:string; score:number; level:number; createdAt:string; masked:boolean; verification:"unverified" };
export function arcadeConfigured() { return Boolean(process.env.DYNAMODB_ARCADE_TABLE && process.env.ARCADE_RUN_SECRET && process.env.ARCADE_RUN_SECRET.length >= 32 && process.env.OPENAI_API_KEY); }
function table() {
  if (!arcadeConfigured()) throw new ArcadeError("Public scores are not configured yet.", 503);
  return process.env.DYNAMODB_ARCADE_TABLE!;
}
const board = `BOARD#alien-invasion#${GAME_VERSION}`;
export function scoreKey(score:number, date:string, id:string) { return `${String(MAX_SCORE-score).padStart(9,"0")}#${date}#${id}`; }
export function scoreRecords(ticket:RunTicket, run:CompletedRun, review:NameReview, country:string, now=Date.now()) {
  const createdAt = new Date(now).toISOString();
  const entry:LeaderboardEntry = { id:ticket.id, name:review.name, country, score:run.score, level:run.level, createdAt, masked:review.masked, verification:"unverified" };
  const expiresAt = Math.floor(now/1000)+180*86400;
  return {
    entry,
    marker:{ pk:`RUN#${ticket.id}`, sk:"RESULT", entry, expiresAt },
    result:{ pk:board, sk:scoreKey(run.score,createdAt,ticket.id), ...entry, ...run, seed:ticket.seed, gameRunId:ticket.gameRunId, version:ticket.version, policyVersion:review.policyVersion, expiresAt },
  };
}
export async function saveScore(ticket:RunTicket, run:CompletedRun, review:NameReview, country:string):Promise<LeaderboardEntry> {
  const records = scoreRecords(ticket,run,review,country);
  try {
    await docClient.send(new TransactWriteCommand({ TransactItems:[
      { Put:{ TableName:table(), Item:records.marker, ConditionExpression:"attribute_not_exists(pk)" } },
      { Put:{ TableName:table(), Item:records.result, ConditionExpression:"attribute_not_exists(pk)" } },
    ] }));
  } catch (error) {
    if (error && typeof error === "object" && "CancellationReasons" in error && Array.isArray(error.CancellationReasons) && error.CancellationReasons.some(reason => reason?.Code === "ConditionalCheckFailed")) {
      // Return the original reviewed entry after a lost response, even if the
      // player edited their name or country before retrying. Never echo inputs.
      try {
        const saved=await docClient.send(new QueryCommand({TableName:table(),KeyConditionExpression:"pk = :pk AND sk = :sk",ExpressionAttributeValues:{":pk":records.marker.pk,":sk":"RESULT"},ConsistentRead:true,Limit:1}));
        const marker=saved.Items?.[0];
        if(marker?.entry && marker.expiresAt>Math.floor(Date.now()/1000))return marker.entry as LeaderboardEntry;
      } catch {
        throw new ArcadeError("Public leaderboard storage is unavailable. Please try again.",503);
      }
      throw new ArcadeError("This run has already been published.",409);
    }
    throw new ArcadeError("Public leaderboard storage is unavailable. Please try again.",503);
  }
  return records.entry;
}
export async function topScores():Promise<LeaderboardEntry[]> {
  const entries:LeaderboardEntry[] = [];
  let cursor:Record<string,unknown>|undefined;
  for (let page=0; page<10 && entries.length<10; page++) {
    const result = await docClient.send(new QueryCommand({ TableName:table(), KeyConditionExpression:"pk = :pk", FilterExpression:"expiresAt > :now", ExpressionAttributeValues:{ ":pk":board, ":now":Math.floor(Date.now()/1000) }, Limit:50, ConsistentRead:true, ExclusiveStartKey:cursor }));
    for (const item of result.Items ?? []) entries.push({ id:item.id, name:item.name, country:item.country, score:item.score, level:item.level, createdAt:item.createdAt, masked:item.masked, verification:"unverified" });
    cursor = result.LastEvaluatedKey;
    if (!cursor) break;
  }
  return entries.slice(0,10);
}
