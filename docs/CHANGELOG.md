# Issue & Fix Changelog

A running log of bugs, issues, and fixes for this project. Each entry records what was broken, what caused it, how it was fixed, and when.

---

## [2026-04-30] Contact form 500 in production — Amplify SSR runtime missing SSM and DynamoDB permissions

**Issue:** Contact form continued to return 500 in production on adityamore.dev even after the `force-static` fix. The error detail was `"Could not load credentials from any providers"` and all env vars showed `false` in the diagnostic check.

**Root cause (1) — Amplify env vars not reaching the SSR runtime:**
Amplify delivers environment variables to its managed SSR compute via SSM Parameter Store at deploy time. The build logs showed:
```
SSM params {"Path":"/amplify/d1p2z2pdfp9af0/main/","WithDecryption":true}
WARNING: !Failed to set up process.env.secrets
```
The `AmplifySSRLoggingRole` (the execution role for Amplify's managed SSR compute) had no SSM read permissions, so the secrets injection step failed silently on every deploy and no env vars reached the runtime.

**Root cause (2) — `AWS_` prefix reserved by Amplify:**
Amplify blocks custom environment variables that start with `AWS_`, preventing direct credential injection via that naming convention.

**Fix:**
1. Added an inline IAM policy (`AmplifySSRRuntimePermissions`) to `AmplifySSRLoggingRole-ef15eb65` with:
   - `ssm:GetParametersByPath`, `ssm:GetParameters`, `ssm:GetParameter` on `arn:aws:ssm:*:*:parameter/amplify/d1p2z2pdfp9af0/*`
   - `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Scan` on the `portfolio-contacts` table
2. Renamed credential env vars in Amplify Console to `APP_AWS_ACCESS_KEY_ID`, `APP_AWS_SECRET_ACCESS_KEY`, `APP_AWS_REGION` to work around the reserved prefix restriction.
3. Updated `lib/dynamodb.ts` to read `APP_AWS_*` env vars and pass credentials explicitly to the DynamoDB client when present.
4. Triggered a fresh Amplify redeploy to re-run the secrets injection step with the corrected role permissions.

**Verified:**
- All four env vars (`has_APP_AWS_ACCESS_KEY_ID`, `has_APP_AWS_SECRET_ACCESS_KEY`, `has_APP_AWS_REGION`, `has_DYNAMODB_CONTACTS_TABLE`) returned `true` in the diagnostic response after redeploy.
- Contact form submission returned `201 Created` in production.
- DynamoDB record confirmed present in the `portfolio-contacts` table.

**Commits:** `0454a73`, `9e958d8`, `db4d5fe`

---

## [2026-04-29] Contact form silently failing in production — force-static disables POST handler

**Issue:** Visitors on adityamore.dev were unable to submit the contact form. Every submission returned a 500 error and no records were written to DynamoDB.

**Root cause:** `export const dynamic = "force-static"` was set in `app/api/contact/route.ts` as part of the GitHub Pages static export work. This directive was never made conditional — it applied to the Amplify production build as well, causing Next.js to treat the route as a static page and never execute the POST handler at runtime.

**Fix:**
- Changed `export const dynamic` to the static literal `"force-dynamic"` in `app/api/contact/route.ts`.
- Added a `null-loader` webpack rule in `next.config.ts` that stubs out API route files only during the GitHub Pages build (`NEXT_PUBLIC_GITHUB_PAGES=true`), keeping the static export compiling cleanly.
- Removed inline `import("webpack")` type annotations from `next.config.ts` that caused a TypeScript build failure on Amplify.

**Verified:**
- `POST /api/contact` returned `201 Created` on local dev server.
- Test submission confirmed present in the `portfolio-contacts` DynamoDB table.
- `npm run build:ghpages` completed without errors.

**Branch:** `fix/contact-form`
**Commits:** `3d354c1`, `89166b9`, `0892aa0`, `0683ba2`

---
