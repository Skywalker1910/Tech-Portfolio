# Developer Notes

## Development model

The repository supports two targets:

1. AWS Amplify runs the full Next.js SSR application, route handlers, live content, contact storage, BB-8, and analytics.
2. GitHub Pages serves an optional static mirror. It cannot execute route handlers, so server-backed features display fallbacks or notices.

Run `npm run dev` for local development and `npm run build` before deployment. Use `npm run build:ghpages` only when validating the static mirror.

## Source-of-truth boundaries

- Stable profile facts, education, skills, contact details, and source-controlled case studies remain in application files and `data/portfolio-knowledge.json`.
- Projects and experience use DynamoDB as their live source after the operations table is seeded.
- `lib/content/defaults.ts` is the resilience fallback and initial seed source.
- RAG indexing combines stable knowledge with the currently published project and experience records.
- Content publication does not automatically embed every change; reindex once after an edit batch.

## Expected fallback behavior

| Missing dependency | Expected behavior |
|---|---|
| `portfolio-content` table | Public content and local retrieval use bundled defaults |
| OpenAI key | BB-8 returns a configuration/service error |
| S3 Vector configuration | BB-8 uses deterministic local retrieval |
| GitHub token | Public GitHub requests use the lower anonymous API allowance |
| GitHub API | GitHub cards display an unavailable state |
| Static GitHub Pages build | API-backed features are disabled or point visitors to the primary site |

Fallbacks must never block rendering or navigation.

## Admin development

Admin pages live below `/admin`; public chrome and BB-8 are suppressed by `ConditionalLayout`. API authorization is the security boundary—never rely on a hidden link or client redirect.

Authentication flow:

1. `POST /api/admin/session` validates `ADMIN_KEY` using constant-time comparison.
2. The server issues an eight-hour signed cookie.
3. Protected route handlers call `isValidAdminRequest`.
4. `DELETE /api/admin/session` clears the cookie.

The legacy `x-admin-key` header exists for local automation and compatibility. New browser code should use the cookie session.

## Environment delivery on Amplify

Amplify’s runtime environment delivery previously caused missing-variable failures. `amplify.yml` therefore writes only allow-listed prefixes and names to `.env.production` during the build:

```yaml
- env | grep -e ADMIN_KEY -e ADMIN_SESSION_SECRET -e APP_AWS_ -e DYNAMODB_ -e GITHUB_TOKEN -e OPENAI_ -e RAG_ >> .env.production || true
- env | grep -e NEXT_PUBLIC_ >> .env.production || true
```

`.env.production` and `.env.local` must remain ignored. Never add a secret to a `NEXT_PUBLIC_` variable.

## Verification checklist

Before committing a feature that touches server behavior:

```powershell
npm run check
```

The same lint, TypeScript, local RAG, and production-build steps run as the GitHub Actions `Quality gate` for every pull request into `main`. See [Pull Requests and Release Checks](PULL_REQUESTS.md) for branch protection and release verification.

Also verify proportionate user flows:

- Public navigation and both themes.
- BB-8 overlay persistence across route changes.
- Project/experience fallback and live content states.
- Admin login, logout, and unauthorized API responses.
- Draft, publish, edit, and delete behavior without exposing unpublished records.
- Contact draft review and explicit visitor submission.
- Notice and Privacy statements after any data-flow change.

The GitHub API route is rendered dynamically, cached at the CDN for one hour, and can serve stale data for 24 hours while revalidating, so temporary GitHub or local certificate failures do not block a production build. An expired configured token is retried against the public API, and the client exposes retry and direct-profile actions when the upstream request still cannot be completed. Set `GITHUB_TOKEN` in Amplify for the higher authenticated API allowance.

## Documentation maintenance

Update documentation in the same change whenever behavior moves between “planned” and “implemented.”

- Feature behavior: `docs/FEATURES.md`
- Architecture or data flow: `docs/ARCHITECTURE.md`
- Endpoint contract: `docs/API.md`
- Admin/AWS operations: `docs/COMMAND_CENTER.md`
- Retrieval or indexing: `docs/RAG.md`
- Public data handling and analytics consent: `/privacy` and `/notice`

## Local analytics behavior

The analytics panel appears on the primary Next.js build. Basic cookieless measurement begins unless the visitor selects **Disable all**; **Allow enhanced** adds persistent browser/visit identifiers and journey/source data. Local requests do not have CloudFront location headers, so the dashboard correctly shows location as unavailable. Device classification still uses the request user agent plus coarse touch/platform/viewport hints. Use **Analytics choices** in the footer to switch tiers while testing.
- Historical incident: `docs/CHANGELOG.md`

The README should remain an accurate entry point and link to the focused document rather than duplicating every implementation detail.

## Roadmap

- Blog and technical writing.
- Interactive ML demonstrations.
- Project-detail routes and richer case studies.
- Automated end-to-end tests and Lighthouse CI.
- Preview deployments for pull requests.
- Error monitoring and contact-form spam protection.
- Cognito or equivalent if administration expands beyond one owner.
