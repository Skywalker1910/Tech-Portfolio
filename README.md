# Tech Portfolio — Aditya More

A personal portfolio web application built to go beyond the limitations of a one-page resume. This project serves as a living showcase of my skills, projects, and professional journey, presented through an interactive and polished interface.

Live (primary): [adityamore.dev](https://adityamore.dev)
Live (GitHub Pages mirror): [skywalker1910.github.io/Tech-Portfolio](https://skywalker1910.github.io/Tech-Portfolio)

---

## About This Project

The core idea behind this web application is to create a single, centralized source that accurately represents who I am as a software and AI/ML engineer. A traditional resume is constrained to one page and cannot adequately capture the depth of projects, research, and skills that define a modern engineering career. This portfolio is the answer to that problem.

The goals of this project are:

- **Showcase work in depth** — Projects, research, and experience presented with full context, not just a bullet point.
- **Provide an interactive experience** — Visitors can explore skills, timelines, and projects in an engaging interface rather than reading a static document.
- **Consolidate everything in one place** — Work history, education, projects, skills, and contact information all accessible under one roof.
- **Stand out in a competitive job market** — Demonstrate not just what I have built, but how I think about building software.
- **Practice industry-grade software development** — This project is developed following standard SDLC practices: version control, branching, issue tracking, code review discipline, CI/CD pipelines, and production-grade deployment.

---

## Features

### Interactive Interface
- Animated particle field background with real-time mouse interaction (GPU-optimized canvas rendering)
- Interstellar background mode as an alternate visual theme
- BB-8 inspired AI assistant droid — an animated, stateful floating button that opens an AI-powered chat interface
- Custom cursor with interactive states
- Dark and light theme toggle with persistent user preference

### Content Sections
- Home — Introduction with animated sentence flip, scroll-driven animations, and a summary of skills and highlights
- Projects — Full project gallery with tag-based filtering and categorization
- Experience — Professional timeline with detailed role descriptions
- Education — Academic background and certifications
- Skills — Categorized technical skill set
- Socials — Links and contact channels
- Contact — Contact form backed by AWS DynamoDB

### Technical Highlights
- Server-side API routes for the contact form and GitHub data fetching
- Interactive 3D globe visualization using the `cobe` library
- GitHub profile integration via a live API proxy
- Responsive, mobile-first layout
- Accessibility considerations including skip-to-content links and reduced-motion support
- SEO-ready with Open Graph metadata and a generated sitemap

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| UI Icons | Lucide React, React Icons |
| Globe | Cobe |
| Backend (contact) | AWS DynamoDB via AWS SDK v3 |
| Fonts | Inter, Space Grotesk (Google Fonts) |
| Build Tool | Turbopack |

---

## Deployment Architecture

This project is deployed across two environments to maximize availability.

### Primary — AWS (adityamore.dev)
- **AWS Amplify** handles CI/CD, build, and hosting. Every push to the `main` branch triggers an automatic production deployment.
- **AWS Route 53** manages the DNS for the custom `adityamore.dev` domain.
- The application runs as a full Next.js server with API routes, image optimization, and server-side rendering enabled.

### Mirror — GitHub Pages (skywalker1910.github.io/Tech-Portfolio)
- A fully static export of the application is deployed to GitHub Pages via the `gh-pages` branch.
- This mirror exists specifically for users on restricted networks — such as university campuses — where `.dev` TLD domains may be blocked at the DNS level.
- The static build is produced with `npm run build:ghpages` which sets `NEXT_PUBLIC_GITHUB_PAGES=true`, enabling the static export configuration in `next.config.ts` (base path, asset prefix, static image handling).
- Deployment to GitHub Pages is done via `npm run deploy` using the `gh-pages` package.

---

## Using This as a Template

This repository is open source under the MIT License. If you would like to use it as the foundation for your own portfolio, you are welcome to do so.

### Steps to get started

1. **Fork or clone** this repository.

2. **Update personal data** — Replace all personal content with your own:
   - `app/layout.tsx` — Update the `metadata` object (title, description, Open Graph fields).
   - `data/contacts.json` — Update contact links and social handles.
   - `app/page.tsx` — Update the home page content, timeline data, and skill tags.
   - `app/projects/page.tsx` — Replace with your own project entries.
   - `app/experience/page.tsx` and `app/education/page.tsx` — Add your own work and academic history.

3. **Replace assets** — Swap out any images or public assets in the `public/` directory with your own.

4. **Configure deployment**:
   - For AWS Amplify: connect the repository in the Amplify console and set your environment variables there.
   - For GitHub Pages: update the `homepage` field in `package.json` and the `basePath`/`assetPrefix` values in `next.config.ts` to match your GitHub username and repository name.

5. **Set up environment variables** — If you want the contact form to work, provision a DynamoDB table and add a `.env.local` file at the root with `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `DYNAMODB_TABLE_NAME`. Do not commit this file. If you do not need a contact form, you can remove the `/api/contact` route and the `EnvelopeCard`/`Contact` components.

6. **Remove or update the license attribution** — You may keep or modify the `LICENSE` file. Attribution is appreciated but not required.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Documentation

Developer notes, known issues, and planned features are tracked in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
