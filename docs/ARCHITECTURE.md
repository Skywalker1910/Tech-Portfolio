# System Architecture

## Overview

My portfolio is a Next.js 16 application deployed primarily as an AWS Amplify SSR application. It combines public portfolio pages, BB-8’s retrieval-augmented chat, a private Command Center I operate, two DynamoDB tables, Amazon S3 Vectors, first-party analytics, and selected external APIs.

```mermaid
flowchart LR
    Visitor([Visitor])
    Admin([Me / Admin])
    GitHubRepo[(GitHub repository)]

    subgraph AWS[AWS]
      R53[Route 53]
      Amplify[AWS Amplify\nCI/CD + Next.js SSR]
      Contacts[(DynamoDB\nportfolio-contacts)]
      Operations[(DynamoDB\nportfolio-content)]
      Vectors[(Amazon S3 Vectors\nportfolio-knowledge)]
    end

    subgraph NextApp[Next.js application]
      Public[Public pages]
      Chat[/api/chat]
      ContentAPI[/api/content/*]
      ContactAPI[/api/contact]
      AnalyticsAPI[/api/analytics]
      AdminUI[Admin Command Center]
      AdminAPI[/api/admin/*]
      GitHubAPI[/api/github]
    end

    OpenAI[OpenAI API\nresponses + embeddings]
    GitHub[GitHub REST API]
    Mirror[GitHub Pages\nstatic mirror]

    Visitor --> R53 --> Amplify --> Public
    Public --> ContentAPI --> Operations
    Public --> AnalyticsAPI --> Operations
    Visitor --> Chat --> Vectors
    Chat --> OpenAI
    Visitor --> ContactAPI --> Contacts
    Public --> GitHubAPI --> GitHub

    Admin --> AdminUI --> AdminAPI
    AdminAPI --> Contacts
    AdminAPI --> Operations
    AdminAPI --> Vectors
    AdminAPI --> OpenAI

    GitHubRepo -->|push main| Amplify
    GitHubRepo -. manual static deployment .-> Mirror
```

## Application boundaries

```mermaid
flowchart TB
    subgraph Browser
      Navbar[Navigation previews]
      Pages[Public React pages]
      BB8[BB-8 overlay / full chat]
      Tracker[TrafficTracker]
      Session[(sessionStorage)]
      Local[(localStorage\nprivacy tier + optional visitor ID)]
    end

    subgraph NextServer[Next.js server runtime]
      PublicRoutes[Public APIs]
      ProtectedRoutes[Protected admin APIs]
      Repository[Content repository]
      Retriever[Hybrid RAG retriever]
      Indexer[RAG indexer]
      Auth[Signed-session verification]
    end

    Pages --> PublicRoutes
    BB8 --> PublicRoutes
    Tracker --> PublicRoutes
    BB8 <--> Session
    Tracker <--> Local
    Tracker <--> Session
    ProtectedRoutes --> Auth
    PublicRoutes --> Repository
    ProtectedRoutes --> Repository
    PublicRoutes --> Retriever
    ProtectedRoutes --> Indexer
```

Client components handle animation and interaction. Server route handlers validate untrusted input, keep credentials private, access AWS services, and call external APIs. Admin data mutations are never performed directly from the browser against AWS.

## Component architecture references

This document describes how the complete application fits together. Detailed subsystem configuration and flows are maintained separately:

| Subsystem | Detailed reference |
|---|---|
| AWS delivery, compute role, DynamoDB, S3 Vectors, DNS | [AWS Infrastructure](AWS_INFRASTRUCTURE.md) |
| Corpus, chunking, indexing, hybrid retrieval, generation, tools | [BB-8 RAG System](RAG.md) |
| Analytics tiers, attributes, traffic sources, engagement, dashboard | [Visitor Analytics](ANALYTICS.md) |
| Project and experience models, publishing, fallback, RAG sync | [Live Content System](CONTENT_SYSTEM.md) |
| Authentication, secrets, validation, privacy, limitations | [Security Model](SECURITY.md) |

## BB-8 request flow

```mermaid
sequenceDiagram
    participant V as Visitor
    participant UI as BB-8 UI
    participant API as /api/chat
    participant R as Hybrid retriever
    participant S3 as S3 Vectors
    participant OAI as OpenAI

    V->>UI: Ask a portfolio question
    UI->>API: Latest six messages
    API->>R: Latest two user messages as query
    alt Semantic RAG enabled
      R->>OAI: Create query embedding
      R->>S3: Query nearest vectors
      S3-->>R: Relevant verified chunks
      R->>R: Merge keyword matches
    else Disabled or unavailable
      R->>R: Local keyword retrieval
    end
    R-->>API: Context + source routes
    API->>OAI: Instructions, context, conversation, tools
    OAI-->>API: Answer and optional action
    API-->>UI: Answer, sources, validated action
    UI-->>V: Render reply and action button
```

The server limits message count and total characters, validates tool arguments, and never allows BB-8 to submit the contact form. Navigation and form-prefill actions execute in the visitor’s browser after validation.

## Content publishing and RAG synchronization

```mermaid
sequenceDiagram
    participant A as Admin
    participant C as Command Center
    participant API as Admin content API
    participant D as portfolio-content
    participant I as RAG indexer
    participant O as OpenAI embeddings
    participant V as S3 Vectors

    A->>C: Edit and publish content
    C->>API: Validated content record
    API->>D: PutItem
    D-->>API: Saved
    API-->>C: Public content is live
    A->>C: Reindex after edit batch
    C->>I: Reindex action
    I->>D: Read published content
    I->>O: Embed current chunks
    I->>V: Upsert current vectors
    I->>V: Remove stale vectors
    I->>D: Save operational status
    I-->>C: Chunk and cleanup counts
```

Content publishing and vector indexing are deliberately separate. This lets an administrator make several edits and pay for one embedding pass rather than embedding every intermediate draft.

## DynamoDB design

Two tables separate public messages from portfolio operations.

### `portfolio-contacts`

Primary key: `id`.

Stores visitor-provided first name, last name, email, message, submission time, read state, and optional sender classification.

### `portfolio-content`

Composite primary key: `pk` and `sk`.

| Partition key pattern | Sort key pattern | Purpose |
|---|---|---|
| `CONTENT#PROJECTS` | `ITEM#<id>` | Project records |
| `CONTENT#EXPERIENCE` | `ITEM#<id>` | Experience records |
| `SETTINGS` | `RAG` | Safe runtime retrieval settings |
| `STATUS` | `RAG` | Last index-operation status |
| `OP_EVENT#<eventHash>` | `SUMMARY` | Isolated basic page-view event and optional engagement duration |
| `ANALYTICS#YYYY-MM-DD` | `PAGE#<path>` | Daily page views, engagement, and enhanced-session totals |
| `ANALYTICS#YYYY-MM-DD` | `CONTEXT#<hash>` | Daily coarse device, viewport, location, and source aggregates |
| `ANALYTICS_SESSION#YYYY-MM-DD` | `<path>#<hash>` | Pseudonymous daily visit-session deduplication records |
| `ANALYTICS_VISITS#YYYY-MM-DD` | `<startedAt>#<visitHash>` | Recent-visit index for the admin dashboard |
| `VISITOR#<visitorHash>` | `PROFILE` | Pseudonymous first/last-seen time, visit counter, and optional audience segment I assign |
| `VISITOR#<visitorHash>` | `VISIT#<visitHash>` | Numbered visit summary, coarse context, and timestamps |
| `VISITOR#<visitorHash>` | `VISIT#<visitHash>#EVENT#<time>#<event>` | Timestamped public-page activity |

Analytics items include `expiresAt`, which is managed by DynamoDB TTL with a 365-day retention target. Browser-generated UUIDs are SHA-256 hashed before storage. CloudFront derives the country code from the request IP; the application stores only the country code and an optional region header, never the IP address, coordinates, postal code, or device fingerprint.

## Visitor analytics flow

```mermaid
sequenceDiagram
    participant V as Visitor browser
    participant T as TrafficTracker
    participant A as /api/analytics
    participant D as portfolio-content
    participant C as Admin Command Center

    V->>T: Open a public page
    alt Disabled, Do Not Track, or Global Privacy Control
      T-->>V: No analytics request or identifier
    else Basic measurement (default, opt-out)
      T->>A: Path, one-time event UUID, viewport hints
      A->>A: Derive coarse country, device, OS, and browser
      A->>D: Isolated event, aggregate counters, engagement duration
      opt Visitor allows enhanced journeys
        T->>T: Create/reuse random visitor and visit IDs
        T->>A: Hashed-identifier inputs and broad traffic source
        A->>D: Numbered visit and timestamped page sequence
      end
      C->>D: Protected aggregate and journey queries
      D-->>C: UX metrics and optional visitor journeys
      C->>D: Optional manual audience classification
    end
```

Basic measurement is cookieless and does not create a persistent visitor identity. Enhanced measurement is opt-in and adds a random browser identifier, visit numbering, route sequences, and broad traffic-source categories. Audience classifications such as recruiter or technical peer are assigned manually in the Command Center; geography and device data never infer them automatically.

Enhanced traffic source uses the browser referrer and stores only an allow-listed category plus validated hostname. Complete URLs, query parameters, search terms, and UTM values are not retained. Basic events have no traffic-source field and appear as Basic measurement in dashboard source totals.

## Data ownership

| Data | Controller/source | Storage | Public exposure |
|---|---|---|---|
| Stable portfolio facts | Source-controlled knowledge | Repository bundle | Through pages and grounded chat |
| Live projects/experience | Me | `portfolio-content` | Published records only |
| Contact messages | Visitor submission | `portfolio-contacts` | Never public |
| RAG settings/status | Me / application | `portfolio-content` | Protected admin only |
| Vectorized chunks | Indexer | S3 Vectors | Returned only through grounded server retrieval |
| Basic analytics | First-party tracker | Aggregates in `portfolio-content` | Protected admin only |
| Enhanced journeys | Consenting browser | Pseudonymous records in `portfolio-content` | Protected admin only |
| Chat transcript | Visitor browser | Same-tab `sessionStorage` | Visible only in that browser tab |

## Authentication and trust boundaries

1. I submit `ADMIN_KEY` to `/api/admin/session`.
2. The server uses constant-time comparison and issues a signed eight-hour session cookie.
3. The cookie is `HttpOnly`, `SameSite=Strict`, and `Secure` in production.
4. Protected APIs validate the signature and expiration on every request.
5. All content fields, URLs, enums, IDs, arrays, and analytics paths are validated server-side.

This model is appropriate for my single-admin workflow. If I expand administration to multiple users, I should replace it with Cognito or another identity provider and role-based authorization.

## Failure behavior

| Failure | Behavior |
|---|---|
| Content table unavailable | Public pages and local retrieval use bundled defaults |
| S3 Vectors unavailable | BB-8 uses local keyword retrieval |
| OpenAI unavailable | Chat returns a temporary-service error; portfolio navigation still works normally |
| GitHub API unavailable | Social GitHub cards show their error/fallback state |
| Analytics table unavailable | Tracking is accepted as a no-op and never blocks navigation |
| GitHub Pages mirror | Server-only contact, chat, live content, and analytics features are unavailable or degraded by design |

## Deployment topology

- `main` pushes trigger the primary Amplify build.
- `amplify.yml` exposes the allow-listed server environment variables to Next.js through `.env.production`.
- Route 53 maps `adityamore.dev` to Amplify.
- The optional GitHub Pages deployment uses `NEXT_PUBLIC_GITHUB_PAGES=true`, static export settings, unoptimized images, and API-route stubs.
- No secrets are committed; `.env.local` and generated production environment files remain ignored.
