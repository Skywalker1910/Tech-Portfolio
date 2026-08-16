# API Reference

All APIs return JSON. Unless noted otherwise, handlers are dynamic Next.js route handlers and validate input before accessing AWS or third-party services.

## Public APIs

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Grounded BB-8 response with optional validated agent action and source routes |
| `POST` | `/api/contact` | Validate and store a contact submission |
| `GET` | `/api/content/projects` | Published projects, with bundled fallback |
| `GET` | `/api/content/experience` | Published experience, with bundled fallback |
| `POST` | `/api/analytics` | Record a basic page/engagement event and optional enhanced journey context |
| `GET` | `/api/github` | Cached public GitHub profile and repository summary |

`/api/chat` accepts either the legacy `message` string or a `messages` array. The current interface sends at most six alternating user/assistant messages. The response can include `answer`, `sources`, `retrieval`, and one validated action.

## Admin session

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/admin/session` | Exchange `{ key }` for a signed session cookie |
| `GET` | `/api/admin/session` | Check the current session |
| `DELETE` | `/api/admin/session` | Clear the current session |
| `GET` | `/api/admin/verify` | Backward-compatible protected verification endpoint |

## Protected administration APIs

These routes require a valid admin cookie or the legacy `x-admin-key` header.

| Methods | Route | Purpose |
|---|---|---|
| `GET`, `PATCH`, `DELETE` | `/api/contact` | Read, classify, mark, or delete contact submissions |
| `GET`, `PUT`, `DELETE` | `/api/admin/content/projects` | Project CRUD |
| `GET`, `PUT`, `DELETE` | `/api/admin/content/experience` | Experience CRUD |
| `GET`, `PATCH`, `POST` | `/api/admin/rag` | Read status, update safe runtime settings, or run `reindex` |
| `GET` | `/api/admin/analytics?days=7|30|90` | Aggregated UX report and recent enhanced journeys |
| `PATCH` | `/api/admin/analytics` | Apply a manual audience classification to a pseudonymous visitor profile |

## Validation and limits

- Chat: 20 requests per IP per in-memory one-minute window, at most six messages, at most 5,000 total characters.
- Admin login: eight failed attempts per IP per in-memory ten-minute window.
- Contact email is format-validated; all fields are required.
- Admin content is length-limited, array-limited, enum-checked, and accepts only application-relative or HTTPS URLs.
- Basic `page_view` analytics accepts a public path, event UUID, and coarse client hints. Optional valid visitor and visit UUIDs enable enhanced journey storage. `engagement` accepts the event UUID and a duration from one second to two hours. The server timestamps events, derives coarse country/region and device categories, and rejects `/admin` and `/api` paths.
- Audience classification accepts only a protected visitor key and the allow-listed values `unclassified`, `recruiter`, `hiring-manager`, `technical-peer`, `student`, or `general`; classification is never inferred automatically.
- Analytics requests are capped at 4 KiB and rate-limited in volatile server memory to protect DynamoDB from event floods; the IP used for rate limiting is not persisted.
- Contact-form drafts are never submitted by BB-8; only the visitor can send them.
