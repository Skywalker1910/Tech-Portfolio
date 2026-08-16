# Portfolio Command Center

The private `/admin` area manages live portfolio content, BB-8 retrieval, messages, and anonymous traffic metrics.

## One-time AWS setup

Set `DYNAMODB_PORTFOLIO_TABLE=portfolio-content` in `.env.local`, then run:

```powershell
npm run content:setup
npm run content:seed
```

The first command creates one on-demand DynamoDB table with `pk` (partition key) and `sk` (sort key), then enables TTL on `expiresAt`. The second copies the bundled project and experience records into the table. These scripts are idempotent, but seeding again overwrites the matching default IDs.

Add `DYNAMODB_PORTFOLIO_TABLE`, `ADMIN_SESSION_SECRET`, and the existing RAG variables to the Amplify environment before deploying. Use a long random value for `ADMIN_SESSION_SECRET`; `ADMIN_KEY` remains the password entered at login.

The Amplify compute role needs read/write access to the portfolio table. Scope the resource to your table ARN:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:DeleteItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query"
  ],
  "Resource": "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/portfolio-content"
}
```

The local setup identity additionally needs `dynamodb:CreateTable`, `dynamodb:DescribeTable`, and `dynamodb:UpdateTimeToLive`.

## Content publishing

- Projects and experience can be drafts or published.
- Published records replace bundled fallback content on the public Projects, Experience, and About pages.
- Project `featured` controls the About-page project section.
- Experience `showOnTimeline` controls the About-page timeline.
- Content saves do not automatically call OpenAI. After a batch of edits, use **RAG Control → Reindex published content** once. This prevents unnecessary embedding calls while editing.
- If DynamoDB is missing or unavailable, public pages and local BB-8 retrieval continue using bundled defaults.

## Authentication

The admin key is exchanged for an eight-hour, signed `HttpOnly`, `SameSite=Strict` cookie. The raw key is not stored in browser storage. Login attempts are rate-limited in each server instance. The legacy `x-admin-key` header remains accepted for local scripts and backward compatibility.

For a single-owner portfolio this is intentionally lightweight. Move to Cognito or another identity provider before adding multiple administrators or granular permissions.

## Traffic analytics

`TrafficTracker` records one view per public path per browser tab session. The server stores daily path counters and a one-way hash used only for daily deduplication. It does not store IP addresses, user agents, referrers, or chat messages. Analytics and deduplication records expire after approximately 400 days through DynamoDB TTL.
