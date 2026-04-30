import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
export { DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

// Amplify reserves the AWS_ prefix and cannot be overridden with custom env vars.
// Use APP_AWS_* names in Amplify environment variables so credentials can be
// supplied explicitly. Falls back to AWS_* for local development (.env.local).
const region =
  process.env.APP_AWS_REGION ??
  process.env.REGION ??
  "us-east-1";

const accessKeyId = process.env.APP_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.APP_AWS_SECRET_ACCESS_KEY;

const client = new DynamoDBClient({
  region,
  ...(accessKeyId && secretAccessKey
    ? { credentials: { accessKeyId, secretAccessKey } }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client);

export const CONTACTS_TABLE = process.env.DYNAMODB_CONTACTS_TABLE ?? "portfolio-contacts";
