import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  // In production (Amplify), credentials come from the attached IAM role automatically.
  // For local development, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local.
});

export const docClient = DynamoDBDocumentClient.from(client);

export const CONTACTS_TABLE = process.env.DYNAMODB_CONTACTS_TABLE ?? "portfolio-contacts";
