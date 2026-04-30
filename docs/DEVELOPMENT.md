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

---

## Contributing

If you are using this repository as a template and discover a bug or have a suggestion that would benefit the template broadly, feel free to open an issue or submit a pull request. All contributions are welcome.

Please see the [LICENSE](../LICENSE) file before contributing.
