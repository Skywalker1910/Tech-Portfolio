# API Reference

## Conventions

All application APIs return JSON and execute as dynamic Next.js route handlers unless explicitly replaced by the static GitHub Pages build. Public input is untrusted and validated before AWS or third-party access.

Protected routes accept either:

- A valid signed admin session cookie, or
- The legacy `x-admin-key` header for controlled automation.

Common error statuses are `400` for invalid input, `401` for missing/invalid admin authorization, `404` for unknown resource types, `429` for rate limits, `502` for an upstream AI failure, and `503` for unavailable configuration or infrastructure.

## Public endpoint map

| Method | Route | Purpose | Main dependency |
|---|---|---|---|
| `POST` | `/api/chat` | Grounded BB-8 response, sources, retrieval telemetry, and optional action | OpenAI, DynamoDB, S3 Vectors |
| `POST` | `/api/contact` | Validate and persist a contact message | Contacts DynamoDB table |
| `GET` | `/api/content/projects` | Published project records with fallback | Portfolio DynamoDB table |
| `GET` | `/api/content/experience` | Published experience records with fallback | Portfolio DynamoDB table |
| `POST` | `/api/analytics` | Basic page/engagement event and optional enhanced journey | Portfolio DynamoDB table |
| `GET` | `/api/github` | Cached GitHub profile and repository summary | GitHub REST API |

## `POST /api/chat`

### Request

The preferred contract is a `messages` array containing at most six alternating conversation messages:

```json
{
  "messages": [
    { "role": "user", "content": "Explain the portfolio's RAG system." }
  ]
}
```

The legacy `{ "message": "..." }` request remains accepted. The final message must be from the user.

Limits:

- Maximum six messages.
- Maximum 1,000 characters for each user message.
- Maximum 2,000 characters for each assistant message.
- Maximum 5,000 characters across the request history.
- 20 requests per source IP per process-local one-minute window.

### Response

```json
{
  "answer": "...",
  "action": null,
  "sources": [
    { "title": "Projects", "section": "Tech Portfolio", "href": "/projects" }
  ],
  "retrieval": {
    "mode": "s3-vectors",
    "matches": 4,
    "durationMs": 82,
    "fallback": false
  }
}
```

`action` can be a validated navigation, resume, or contact-draft action. It is never raw model tool output. The server uses only the two latest user messages for retrieval, sends at most the six-message window to generation, and sets `store: false` on OpenAI requests.

## `POST /api/contact`

### Request

```json
{
  "firstName": "Visitor",
  "lastName": "Name",
  "email": "visitor@example.com",
  "message": "Portfolio inquiry"
}
```

All fields are required and email syntax is validated. The server assigns the UUID, timestamp, unread state, and empty sender classification. Success returns `201`.

BB-8 can prepare this payload in the browser, but only the visitor can submit the endpoint.

## `GET /api/content/{kind}`

`kind` must be `projects` or `experience`. Responses contain only published records, sorted by `sortOrder`. If the table is missing, unavailable, or has no records for the kind, the repository returns bundled defaults.

## `POST /api/analytics`

### Basic page view

```json
{
  "eventType": "page_view",
  "path": "/projects",
  "eventId": "UUID",
  "client": {
    "platform": "browser platform",
    "touchPoints": 0,
    "viewportWidth": 1440
  }
}
```

### Enhanced page view

Enhanced consent adds valid `visitorId` and `visitId` UUIDs plus an allow-listed traffic source:

```json
{
  "eventType": "page_view",
  "path": "/projects",
  "eventId": "UUID",
  "visitorId": "UUID",
  "visitId": "UUID",
  "source": { "category": "Social", "host": "linkedin.com" },
  "client": { "viewportWidth": 390, "touchPoints": 5 }
}
```

### Engagement

```json
{
  "eventType": "engagement",
  "eventId": "same page event UUID",
  "durationMs": 42000
}
```

Validation and behavior:

- Event IDs must be UUIDs.
- Visitor and visit IDs must be supplied together.
- Traffic source is ignored unless enhanced IDs are valid.
- Duration is bounded from one second to two hours.
- Paths are query-free public routes and cannot begin with `/admin` or `/api`.
- Request bodies are capped at 4 KiB.
- Events are limited to 120 per source IP per process-local minute.
- Responses are non-cacheable and writes never block navigation.

See [Visitor Analytics](ANALYTICS.md) for storage and privacy semantics.

## `GET /api/github`

The route fetches the public GitHub user record and up to 100 repositories, removes forks, ranks by stars, and returns the top four repositories with profile totals.

- Runtime request timeout: eight seconds.
- CDN cache: one hour.
- Stale-while-revalidate window: 24 hours.
- A configured token is retried anonymously if GitHub returns `401` or `403`.
- Upstream failure returns a safe `503` without blocking the Socials page.

## Admin session endpoints

| Method | Route | Request/response |
|---|---|---|
| `POST` | `/api/admin/session` | Accepts `{ "key": "..." }`; returns `{ "authenticated": true }` and sets the signed cookie |
| `GET` | `/api/admin/session` | Returns session state; unauthenticated state uses `401` |
| `DELETE` | `/api/admin/session` | Clears the signed cookie |
| `GET` | `/api/admin/verify` | Backward-compatible protected verification |

Failed login attempts are limited to eight per source IP in a process-local ten-minute window.

## Protected contact operations

The same `/api/contact` route provides private message management:

| Method | Effect |
|---|---|
| `GET` | Scan and return contact submissions |
| `PATCH` | Update `read` and/or allow-listed `senderType` |
| `DELETE` | Delete the message matching `id` |

Allowed sender types are `recruiter`, `visitor`, `friend`, `test`, or `null`.

## Protected content operations

`/api/admin/content/{kind}` accepts `projects` or `experience`:

| Method | Effect |
|---|---|
| `GET` | Return drafts and published records |
| `PUT` | Validate and save a complete content record |
| `DELETE` | Delete the record matching request-body `id` |

Server validation bounds text, arrays, enums, numbers, IDs, and URLs. See [Live Content System](CONTENT_SYSTEM.md).

## Protected RAG operations

`/api/admin/rag` provides:

| Method | Effect |
|---|---|
| `GET` | Return effective settings, vector connection/count, model/dimensions, and last synchronization |
| `PATCH` | Save `enabled`, `topK`, and `maxDistance` runtime settings |
| `POST` | Accept `{ "action": "reindex" }` and synchronize the current corpus |

The reindex response includes chunk count, stale-vector removal count, model, dimensions, bucket, and index. Failures are written to the RAG status record and returned as `503`.

## Protected analytics operations

### `GET /api/admin/analytics?days=7|30|90`

Returns daily totals, page performance, coarse breakdowns, report totals, and up to 100 recent enhanced journeys. Values outside the supported range are bounded to 7–90 days, with a default of 30.

The response uses `Cache-Control: private, no-store`.

### `PATCH /api/admin/analytics`

```json
{
  "visitorKey": "64-character SHA-256 visitor key",
  "segment": "recruiter"
}
```

Allowed segments are `unclassified`, `recruiter`, `hiring-manager`, `technical-peer`, `student`, and `general`. The visitor profile must already exist. Classification is an action I perform manually and is never inferred by the API.

## Static-export behavior

The GitHub Pages build replaces API route modules with static stubs because a static host cannot execute Next.js route handlers. The public UI exposes feature-parity notices or primary-site links rather than presenting static output as a fully operational backend.
