import { CreateTableCommand, DescribeTableCommand, DynamoDBClient, UpdateTimeToLiveCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { PORTFOLIO_TABLE } from "../lib/dynamodb";

const region = process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const credentials = process.env.APP_AWS_ACCESS_KEY_ID && process.env.APP_AWS_SECRET_ACCESS_KEY ? { accessKeyId:process.env.APP_AWS_ACCESS_KEY_ID, secretAccessKey:process.env.APP_AWS_SECRET_ACCESS_KEY } : undefined;
const client = new DynamoDBClient({ region, credentials });

async function main() {
  try { await client.send(new DescribeTableCommand({ TableName:PORTFOLIO_TABLE })); console.log(`Table ${PORTFOLIO_TABLE} already exists.`); }
  catch (error) {
    if (!(error instanceof Error && error.name === "ResourceNotFoundException")) throw error;
    await client.send(new CreateTableCommand({ TableName:PORTFOLIO_TABLE, BillingMode:"PAY_PER_REQUEST", AttributeDefinitions:[{ AttributeName:"pk", AttributeType:"S" },{ AttributeName:"sk", AttributeType:"S" }], KeySchema:[{ AttributeName:"pk", KeyType:"HASH" },{ AttributeName:"sk", KeyType:"RANGE" }] }));
    await waitUntilTableExists({ client, maxWaitTime:120 }, { TableName:PORTFOLIO_TABLE });
    console.log(`Created ${PORTFOLIO_TABLE}.`);
  }
  try { await client.send(new UpdateTimeToLiveCommand({ TableName:PORTFOLIO_TABLE, TimeToLiveSpecification:{ AttributeName:"expiresAt", Enabled:true } })); console.log("Enabled analytics TTL."); }
  catch (error) { console.warn("TTL may already be enabled:", error instanceof Error ? error.message : error); }
}
main().catch((error) => { console.error("Content table setup failed:", error); process.exitCode = 1; }).finally(() => client.destroy());
