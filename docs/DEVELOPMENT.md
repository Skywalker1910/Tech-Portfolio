# Engineering and Runtime Notes

## Runtime targets

The repository produces two deliberately different delivery surfaces:

1. AWS Amplify hosts the complete Next.js SSR application, dynamic route handlers, live content, contact storage, BB-8, analytics, and the private Command Center.
2. GitHub Pages hosts an optional static continuity mirror. It cannot execute route handlers, so server-backed functionality is disabled, degraded, or redirected to the primary application.

The Amplify application is the only full production system. Static-export compatibility must never weaken or change dynamic production route behavior.

## Source-of-truth boundaries

| Data | Primary source | Fallback or secondary source |
|---|---|---|
| Stable profile facts | Source-controlled application data | None |
| Education and skills | Source-controlled page/knowledge data | None |
| Projects and experience | DynamoDB live content | `lib/content/defaults.ts` |
| BB-8 static knowledge | `data/portfolio-knowledge.json` | Same bundled corpus |
| BB-8 live knowledge | Published content repository | Bundled content defaults |
| RAG runtime settings/status | `portfolio-content` | Deployment-level defaults |
| Semantic chunks | S3 Vectors | Deterministic keyword retrieval |
| Contact messages | `portfolio-contacts` | No alternate storage |
| Visitor analytics | `portfolio-content` | No-op on failure |
| GitHub statistics | GitHub API through server cache | UI unavailable/retry state |

Features should preserve these boundaries. Presentation components should not silently introduce a second content source, and public browser code should not become an AWS data client.

## Resilience rules

- Public rendering and navigation must not depend on OpenAI, S3 Vectors, GitHub, or analytics availability.
- Public content reads fall back to bundled defaults when DynamoDB is unavailable or empty.
- Semantic retrieval failures fall back to deterministic local retrieval over current verified knowledge.
- Analytics failures are accepted as non-blocking no-ops.
- Contact failures are isolated to submission and inbox behavior.
- GitHub failures use stale caching where possible and expose retry/direct-profile actions.
- Protected API authorization is never replaced by a hidden route, client redirect, or omitted navigation link.

## Environment delivery

`amplify.yml` writes only allow-listed server and public variables into `.env.production` during the production build. This ensures managed SSR route handlers receive the same approved configuration used during compilation.

The allow list is intentionally explicit. Adding a new server dependency requires updating both the Amplify variable configuration and the build allow list. Secrets must not use `NEXT_PUBLIC_`.

AWS SDK clients prefer explicit `APP_AWS_*` credentials when present, then use the standard credential provider chain. Production is designed to rely on the Amplify compute role so long-lived credential variables can remain absent.

See [AWS Infrastructure](AWS_INFRASTRUCTURE.md) for resource and IAM details.

## Static-export boundary

When `NEXT_PUBLIC_GITHUB_PAGES=true`, `next.config.ts`:

- Selects static export output.
- Applies the `/Tech-Portfolio` base and asset paths.
- Enables trailing slashes.
- Disables server image optimization.
- Replaces API route modules with static stubs through `null-loader`.

The primary Amplify build does not enable these branches. Dynamic APIs remain `force-dynamic` where request-time execution is required.

## Content and RAG consistency

Publishing a project or experience record updates public reads immediately but does not automatically update the vector index. This intentional gap allows a batch of edits to produce one embedding/indexing operation.

During the gap:

- Public pages use the updated published record.
- Local retrieval builds from the updated repository.
- Semantic retrieval can still return the previous indexed version.

I close the gap through RAG Control after reviewing a content batch. The indexer upserts the current corpus and deletes stale keys.

## Admin boundary

Admin pages live below `/admin`, and `ConditionalLayout` removes public navigation and BB-8 from that surface. The actual trust boundary is server authorization:

- The login endpoint exchanges the admin key for a signed session.
- Protected routes validate the cookie or legacy admin header on every request.
- The raw admin key is not persisted in browser storage.
- Mutations pass through server validation before AWS access.

See [Security Model](SECURITY.md) and [Command Center](COMMAND_CENTER.md).

## Quality gate

GitHub Actions defines the production quality gate. It uses Node.js 20 and a locked dependency install, then executes:

1. ESLint.
2. TypeScript checking without emission.
3. The deterministic 27-question RAG evaluation.
4. A production Next.js build.

The CI environment deliberately disables semantic retrieval and does not receive AWS or OpenAI secrets. This keeps pull-request validation deterministic, low-cost, and safe for untrusted changes. Semantic retrieval verification is an operational check when the indexed corpus, embedding configuration, or distance threshold changes.

## Review invariants

Changes should preserve:

- Mobile and desktop layouts in light and dark themes.
- Keyboard access, focus visibility, reduced-motion behavior, and semantic controls.
- BB-8 overlay continuity during validated navigation.
- Explicit visitor review before contact submission.
- Published/draft isolation.
- Public fallback behavior during dependency failures.
- Alignment between analytics behavior and the public Privacy/Notice pages.
- Alignment between IAM permissions and actual SDK commands.

## Documentation ownership

| Change type | Required documentation |
|---|---|
| Cross-system architecture | `ARCHITECTURE.md` and README overview |
| AWS resource, role, or environment delivery | `AWS_INFRASTRUCTURE.md`, `SECURITY.md` |
| Retrieval, corpus, indexing, generation, tools | `RAG.md` |
| Analytics fields, consent, retention, dashboard | `ANALYTICS.md`, public Privacy/Notice |
| Project or experience model/publishing | `CONTENT_SYSTEM.md`, `COMMAND_CENTER.md` |
| Endpoint contract or limit | `API.md` |
| Shipped or removed feature | `FEATURES.md` |
| CI, review, deployment, rollback | `PULL_REQUESTS.md` |
| Production incident | `CHANGELOG.md` |

## Roadmap boundaries

The current architecture does not claim to provide a blog CMS, project-detail routing, public ML inference demos, multi-user administration, distributed rate limiting, automated security monitoring, or automated visitor classification. These remain future architectural decisions rather than partially implemented features.
