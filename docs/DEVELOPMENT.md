# Developer Notes — Tech Portfolio

This document tracks known issues, active investigations, and ideas for future development. It is intended as a running log for the project maintainer and any contributors.

---

## Known Issues

### GitHub Pages Static Export
- Server-side API routes (`/api/contact`, `/api/github`) are not available in the GitHub Pages static build. The contact form and GitHub data fetching are silently disabled on the Pages mirror. A client-side fallback or static data file should be considered to gracefully handle this gap rather than silently failing.
- The `next/image` component requires `unoptimized: true` in the static export configuration. This means images on the GitHub Pages mirror are not optimized and may affect load performance on slower connections.

### Environment-Dependent Behavior
- The `NEXT_PUBLIC_GITHUB_PAGES` environment variable controls which build configuration is used. If this variable is accidentally set in a non-Pages environment, the build will produce a static export instead of a server build. This should be guarded more explicitly.

### Metadata Base URL
- `metadataBase` in `app/layout.tsx` currently points to the GitHub repository URL rather than the live domain. This can affect how Open Graph previews are resolved. It should be updated to `https://adityamore.dev`.

### Amplify Infrastructure Notes
- The `AmplifySSRLoggingRole` is the actual execution role for Amplify's managed SSR compute (despite the misleading name). Any AWS service the SSR runtime needs to access (DynamoDB, SSM, etc.) requires permissions on this role.
- Amplify reserves the `AWS_` env var prefix. Custom credentials must use a different prefix (e.g. `APP_AWS_*`) and be passed explicitly to the SDK client.
- Amplify delivers env vars to the SSR runtime via SSM Parameter Store. The execution role must have `ssm:GetParametersByPath` on `arn:aws:ssm:*:*:parameter/amplify/{appId}/*` or env vars will silently fail to inject at runtime.

---

## Admin Control Panel

The admin control panel lives at `/admin/*` and is excluded from public navigation, sitemaps, and search engine indexing. It is accessible only to the site owner via a shared-secret key.

### Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Login page — validates key against `ADMIN_KEY` via `/api/admin/verify` |
| `/admin` | Command Center landing — tile grid linking to each panel |
| `/admin/messages` | Contact messages monitor — full CRUD with filtering, tagging, and read tracking |

### Authentication
- Key is entered on the login page, verified against `process.env.ADMIN_KEY` via a lightweight `GET /api/admin/verify` endpoint (no DynamoDB call).
- On success, the key is persisted in `sessionStorage` under `dashboard-admin-key` and sent as the `x-admin-key` header on every subsequent admin API request.
- `ConditionalLayout` (`components/ConditionalLayout.tsx`) suppresses the public Navbar, Footer, and ChatWidget for all routes matching `/admin/*`.
- Admin routes set `robots: { index: false, follow: false }` in their metadata.

### API Changes for Admin
- `GET /api/contact` — protected by `x-admin-key`; returns full message list including `read` and `senderType` fields.
- `DELETE /api/contact` — protected; removes a message by `id`.
- `PATCH /api/contact` — protected; updates `read` (boolean) and/or `senderType` (`"recruiter" | "visitor" | "friend" | "test" | null`) on a message. Uses expression alias `#rd` for the DynamoDB reserved word `read`.
- `POST /api/contact` — public; unchanged, but now stores `read: false` and `senderType: null` on every new submission.

### DynamoDB Schema Addition
All new contact messages include two new fields:
```json
{ "read": false, "senderType": null }
```
Older items missing these fields are backfilled in-memory when fetched by the messages page (not written back to DynamoDB).

### Environment Variables
| Variable | Purpose |
|---|---|
| `ADMIN_KEY` | Secret key for admin panel auth (previously `CONTACT_ADMIN_KEY`) |
| `APP_AWS_ACCESS_KEY_ID` | AWS IAM access key — `APP_AWS_*` prefix required because Amplify reserves `AWS_*` |
| `APP_AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `DYNAMODB_CONTACTS_TABLE` | DynamoDB table name (default: `portfolio-contacts`) |

### Planned Admin Panels (not yet built)
The sidebar and tile landing page already include placeholder entries for these panels. To activate one: set `disabled: false` in both `DashboardShell.tsx` and `app/admin/page.tsx`, then create the corresponding `app/admin/<section>/page.tsx`.
- `/admin/projects` — Add, update, and remove portfolio projects
- `/admin/experience` — Edit work history entries
- `/admin/timeline` — Manage career and education milestones
- `/admin/skills` — Add and remove skills from the skillset

---

## Future Ideas and Features in Development

### Content and Sections
- **Blog / Writing section** — A dedicated section for technical write-ups, research notes, or long-form posts. This would further extend the "beyond a resume" goal of the project and demonstrate written communication skills.
- **Certifications section** — A visual display of completed certifications with badges, issue dates, and verification links.
- **Testimonials / Recommendations section** — Quotes or references from colleagues, professors, or managers to add social proof.
- **Publications / Research section** — Dedicated display for academic papers, preprints, or research contributions with abstracts and links.

### Interactive Features
- **AI assistant improvements** — The BB-8 droid assistant currently opens a chat interface. Future work includes expanding the assistant's knowledge base to accurately answer questions about the portfolio content, and potentially integrating a retrieval-augmented generation (RAG) pipeline over project and experience data.
- **Project detail pages** — Each project in the gallery currently shows a summary. Individual project pages with deeper write-ups, architecture diagrams, and demo links would add significant value.
- **Search across the site** — A global search feature that indexes skills, projects, and experience content.
- **Visitor analytics dashboard** — A simple, privacy-respecting page view counter or heatmap to understand which sections visitors engage with most.

### Technical Improvements
- **End-to-end testing** — Add Playwright or Cypress tests covering critical user flows: contact form submission, project filtering, and navigation.
- **Performance audit** — Run Lighthouse CI on every PR to catch performance regressions early.
- **Storybook or component catalog** — Document and visually test components like `Badge`, `Timeline`, `OrbitalDivider`, and `SentenceFlip` in isolation.
- **RSS feed** — If a blog section is added, generate an RSS feed from the content.
- **Improved mobile navigation** — The dock-style navigation works well on desktop. A more refined mobile navigation pattern (bottom sheet or slide-over) could improve the mobile experience.

### Deployment and Infrastructure
- **Preview deployments** — Configure AWS Amplify to spin up preview environments for pull requests, enabling visual review before merging.
- **CDN cache headers** — Review and tighten cache-control headers for static assets to improve repeat-visit performance.
- **Error monitoring** — Integrate a lightweight error tracking tool (e.g., Sentry) to surface runtime errors in the production environment.
- **Contact form spam protection** — Add a CAPTCHA or honeypot field to the contact form to reduce bot submissions to DynamoDB.
- **Admin panel role-based auth** — The current shared-secret model is sufficient for a single-owner tool. If multi-user access is ever needed, replace with AWS Cognito or a similar identity provider.

### GitHub Pages Mirror
- **Automated sync** — Currently the GitHub Pages deployment is manual (`npm run deploy`). Automate it via a GitHub Actions workflow that triggers on every push to `main` after the Amplify deployment succeeds.
- **Feature parity indicators** — Add a visible banner or note on the Pages mirror that links users to the full version on `adityamore.dev` for features that require the server (contact form, live GitHub data).

---

## Notes on SDLC Practices

This project is intentionally developed following standard software development practices to serve as a demonstration of professional engineering habits:

- All features are developed on separate branches and merged via pull requests.
- Commit messages follow conventional commit conventions where possible.
- The `Deployment-3-logs/` directory contains build and deploy logs from production releases for traceability.
- Environment configuration is separated from source code and managed via `.env.local` locally and via Amplify environment variables in production.
- The admin control panel was developed on the `feature/admin-dashboard` branch and merged to `main` for production deployment.

---

## Contributing

If you are using this repository as a template and discover a bug or have a suggestion that would benefit the template broadly, feel free to open an issue or submit a pull request. All contributions are welcome.

Please see the [LICENSE](../LICENSE) file before contributing.
