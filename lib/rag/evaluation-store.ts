import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "@/lib/dynamodb";
import { storedEvaluationReport, type AdminEvaluationReport } from "./admin-evaluation";

const lockKey={pk:"STATUS",sk:"RAG_EVALUATION"};
export function evaluationClaimCommand(requestId:string,now=Date.now()) {
  return new TransactWriteCommand({ TransactItems:[
    { Put:{TableName:PORTFOLIO_TABLE,Item:{pk:"EVALUATION_REQUEST",sk:requestId,expiresAt:Math.floor(now/1000)+7*86400},
      ConditionExpression:"attribute_not_exists(pk)"} },
    { Update:{TableName:PORTFOLIO_TABLE,Key:lockKey,
      UpdateExpression:"SET requestId=:id, leaseUntil=:lease, nextAllowedAt=:cooldown, #state=:running",
      ConditionExpression:"(attribute_not_exists(leaseUntil) OR leaseUntil < :now) AND (attribute_not_exists(nextAllowedAt) OR nextAllowedAt < :now)",
      ExpressionAttributeNames:{"#state":"state"},ExpressionAttributeValues:{":id":requestId,":lease":now+120000,":cooldown":now+60000,":now":now,":running":"running"} } },
  ] });
}
export async function claimEvaluation(requestId:string) {
  await docClient.send(evaluationClaimCommand(requestId),{abortSignal:AbortSignal.timeout(5000)});
}
export async function getEvaluationStatus() {
  const {Item}=await docClient.send(new GetCommand({TableName:PORTFOLIO_TABLE,Key:lockKey,ConsistentRead:true}));
  return Item ?? null;
}
export async function finishEvaluation(requestId:string,report:AdminEvaluationReport) {
  // Strip undefined fields before DocumentClient marshalling (client defaults).
  const clean=JSON.parse(JSON.stringify(storedEvaluationReport(report)));
  await docClient.send(new TransactWriteCommand({TransactItems:[{Update:{TableName:PORTFOLIO_TABLE,Key:lockKey,
    UpdateExpression:"SET #state=:state, report=:report, leaseUntil=:zero",
    ConditionExpression:"requestId=:id",ExpressionAttributeNames:{"#state":"state"},
    ExpressionAttributeValues:{":state":report.state,":report":clean,":zero":0,":id":requestId}}}]}));
}
