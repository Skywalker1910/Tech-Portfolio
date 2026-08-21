import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, PORTFOLIO_TABLE } from "../lib/dynamodb";

async function main() {
  let cursor:Record<string, unknown>|undefined;
  let inspected = 0;
  let updated = 0;
  do {
    const page = await docClient.send(new ScanCommand({ TableName:PORTFOLIO_TABLE, ExclusiveStartKey:cursor }));
    for (const item of page.Items ?? []) {
      inspected += 1;
      const remove:string[] = [];
      const names:Record<string, string> = { "#location":"location", "#city":"city", "#context":"context" };
      const location = item.location as { city?:unknown }|undefined;
      const context = item.context as { location?:{ city?:unknown } }|undefined;
      if (location && Object.prototype.hasOwnProperty.call(location, "city")) remove.push("#location.#city");
      if (context?.location && Object.prototype.hasOwnProperty.call(context.location, "city")) remove.push("#context.#location.#city");
      if (!remove.length || typeof item.pk !== "string" || typeof item.sk !== "string") continue;
      await docClient.send(new UpdateCommand({
        TableName:PORTFOLIO_TABLE,
        Key:{ pk:item.pk, sk:item.sk },
        UpdateExpression:`REMOVE ${remove.join(", ")}`,
        ExpressionAttributeNames:names,
      }));
      updated += 1;
    }
    cursor = page.LastEvaluatedKey as Record<string, unknown>|undefined;
  } while (cursor);
  console.log(`Inspected ${inspected} records and removed stored city fields from ${updated} records.`);
}

main().catch((error) => {
  console.error("City-field purge failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
