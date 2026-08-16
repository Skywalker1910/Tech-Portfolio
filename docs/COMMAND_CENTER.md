# Portfolio Command Center

The private `/admin` area manages live portfolio content, BB-8 retrieval, messages, and tiered first-party visitor analytics.

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

`TrafficTracker` uses two clearly separated measurement tiers:

- **Basic measurement** is enabled by default but can be disabled at any time. It is cookieless and sends the route, an isolated one-time event UUID, page engagement duration, viewport bucket, broad device/OS/browser category, and coarse country/region supplied by the edge. It does not create a persistent visitor identity or route history.
- **Enhanced journeys** require an affirmative choice. They add a random visitor UUID in `localStorage`, a visit UUID in `sessionStorage`, visit numbering, page sequences, and a broad source category/referrer host. A visit rolls over after 30 minutes of inactivity.

Both tiers stop when the visitor disables analytics or the browser exposes Do Not Track or Global Privacy Control. The server hashes every browser-generated identifier before writing it to DynamoDB.

The Traffic dashboard includes:

- Page views, average engaged time, returning visits, and enhanced-journey coverage.
- Daily traffic plus device, viewport/layout, country/region, operating-system, browser, and traffic-source breakdowns.
- Page-performance metrics with view count, enhanced sessions, and average engaged time.
- Recent pseudonymous enhanced journeys with visit numbers, local-time display, coarse context, source, and expandable page timelines.
- Owner-controlled audience classification. Labels such as recruiter or hiring manager are manual annotations and are never inferred from location, device, or browsing behavior.

AWS Amplify's managed SSR cache forwards `CloudFront-Viewer-Country`. Region is shown only when a compatible edge header is available. The application never persists the source IP, city, coordinates, postal code, detailed device model, form data, keystrokes, or BB-8 messages as analytics. New records expire after approximately 365 days through DynamoDB TTL.

The existing compute-role policy is sufficient: journey analytics uses the same `GetItem`, `PutItem`, `UpdateItem`, and `Query` permissions on `portfolio-content`. No new table or third-party analytics account is required.
