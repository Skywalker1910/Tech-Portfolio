# Implemented Features

This document is the source-of-truth inventory for the portfolio’s shipped application features. Items described as optional require the corresponding environment variables or AWS resources.

## Public experience

- Responsive Next.js App Router interface with light-first theming, an optional dark theme for the current visit, reduced-motion support, keyboard focus states, and a skip link.
- Wide desktop navigation preview that summarizes each destination before navigation, plus a compact theme-aware mobile menu.
- About page with animated introduction, career/education timeline, featured projects, technology highlights, career status, and the BB-8 call-to-action banner.
- Filterable Projects gallery with search, technology and status filters, featured-only filtering, project details, source links, and case-study cards.
- Detailed Experience, Education, Skills, Socials, Contact, Notice, and Privacy pages, including mobile timeline layouts that preserve institution branding and content readability.
- Pointer-only custom cursor behavior so touch devices retain native mobile interaction.
- Live GitHub profile and repository summary through a cached server-side proxy with authenticated-to-public retry and unavailable-state actions.
- Static resume download at `/resume.pdf`.
- AWS Amplify SSR deployment and an optional GitHub Pages static mirror with graceful notices for server-only features.

## BB-8 portfolio co-pilot

- Animated BB-8 chat trigger whose body moves periodically and whose 3D head and eyes react to cursor position, with the chat presented as the RAG-Powered Co-Pilot.
- Persistent overlay chat that remains available while BB-8 navigates between portfolio pages.
- Full-page chat route at `/chat`.
- Friendly portfolio-specific system instructions that distinguish BB-8 from me.
- Short working context: the client and server send at most the latest six messages, while the visible transcript remains available for the browser session.
- Hybrid retrieval over verified portfolio knowledge:
  - OpenAI embeddings and Amazon S3 Vectors semantic retrieval when enabled.
  - Deterministic local keyword fallback if the vector service is disabled or unavailable.
  - Source-page links attached to grounded responses.
- Strict agent actions that can:
  - Navigate to a relevant portfolio page without closing chat.
  - Offer the resume as a direct download.
  - Prepare—but never submit—a contact-form draft from information explicitly provided by the visitor.
- RAG evaluation suite covering 27 representative questions, with Hit@3 and latency reporting.

## Live content system

- One serializable content model for projects and experience.
- Published content is served through public APIs and updates the Projects, Experience, and About pages.
- Project controls include draft/published state, ordering, status, tags, highlights, links, and featured placement.
- Experience controls include draft/published state, ordering, organization details, contributions, technologies, visual accent, and About-timeline placement.
- Bundled content remains available if DynamoDB has not been provisioned or is temporarily unavailable.
- Published live content is incorporated into BB-8’s current RAG corpus during indexing.

## Admin Command Center

- Private `/admin` interface with portfolio-consistent light and dark styling.
- Eight-hour signed `HttpOnly`, `SameSite=Strict` admin session; the raw admin key is not stored in browser storage.
- In-memory login-attempt rate limiting and legacy `x-admin-key` support for local automation.
- Dashboard sections for:
  - Contact messages: search, filtering, read state, sender classification, and deletion.
  - Projects: create, edit, order, publish, draft, and delete.
  - Experience: create, edit, order, publish, draft, and delete.
  - RAG Control: enable semantic retrieval, tune `topK` and maximum distance, inspect index status, and deliberately reindex published content.
  - Traffic: 7-, 30-, and 90-day summaries, engaged time, page performance, device/OS/browser/viewport/location/source breakdowns, numbered returning visits, manual audience labels, and timestamped page journeys.

## Data and privacy behavior

- Contact submissions are validated server-side and stored in the contacts DynamoDB table.
- Basic first-party measurement is cookieless and opt-out. It records page views, engagement duration, server time, coarse country/region, device/OS/browser, and viewport bucket without creating a persistent visitor identity.
- Enhanced analytics requires affirmative opt-in. A random browser ID supports pseudonymous returning-visitor and Visit #2/Visit #3 reporting; a 30-minute-inactivity visit ID groups timestamped page activity and a broad source category/referring hostname.
- Traffic sources are classified as Direct, Internal, Search, Social, or Referral from the browser referrer. Only the validated hostname is retained; complete URLs, query parameters, search terms, and UTM values are excluded.
- I can manually classify an enhanced profile as recruiter, hiring manager, technical peer, student, or general visitor. No attribute or behavior performs this classification automatically.
- The server does not store raw IP addresses, precise location, city, postal codes, device models, fingerprints, form fields, keystrokes, or chat messages as analytics.
- Both tiers honor Do Not Track and Global Privacy Control, can be disabled from the footer, and expire through DynamoDB TTL after approximately 365 days.
- The footer exposes persistent Analytics choices so visitors can change tiers after their initial selection.
- Chat transcripts and BB-8 contact drafts use browser `sessionStorage`; application servers do not persist chat transcripts.
- OpenAI requests use `store: false`.
- No advertising, cross-site tracking, or third-party analytics SDK is included.

## Reliability and deployment

- Server-only routes are forced dynamic where required.
- GitHub Pages builds replace API routes with static stubs and display feature-parity notices.
- RAG queries fall back locally on missing configuration or service failure.
- Public content falls back to bundled defaults when the operations table is unavailable.
- Environment variables are written to `.env.production` during Amplify builds for the SSR runtime.
- DynamoDB tables use on-demand billing; analytics deduplication data is automatically expired.

## Technical references

- [System Architecture](ARCHITECTURE.md)
- [AWS Infrastructure](AWS_INFRASTRUCTURE.md)
- [BB-8 RAG System](RAG.md)
- [Visitor Analytics](ANALYTICS.md)
- [Live Content System](CONTENT_SYSTEM.md)
- [Security Model](SECURITY.md)

## Not implemented

The following remain roadmap items and should not be presented as current functionality:

- Blog or long-form writing system.
- Public interactive ML model demos.
- Individual project-detail routes.
- Precise geographic analytics, device fingerprinting, advertising attribution, or cross-site behavioral profiling.
- Multi-user admin accounts or role-based access control.
- Automated visitor-message submission by BB-8.
