# Pull Requests and Release Checks

Changes reach production through a pull request into `main`. Direct pushes to `main` should be disabled with a GitHub branch protection rule because AWS Amplify deploys that branch automatically.

## Standard workflow

1. Create a focused branch and make the change.
2. Run `npm run check` locally.
3. Push the branch and open a pull request with `main` as the base.
4. Complete the repository pull-request template and review the full diff.
5. Wait for the `Quality gate` check to pass.
6. Test the relevant application flows in an Amplify preview when the change depends on AWS, OpenAI, browser behavior, or responsive layout.
7. Squash-merge the pull request and monitor the production Amplify deployment.

The CI workflow intentionally uses local RAG retrieval and does not receive AWS or OpenAI secrets. This makes pull requests safe to validate, including pull requests from forks. Run `npm run rag:evaluate:s3` separately when changes affect embeddings, S3 Vectors, retrieval thresholds, or the indexed corpus.

## Review checklist

Review the pull request by feature area and confirm:

- The change matches the stated scope and does not include local files or unrelated edits.
- `.env.local`, credentials, tokens, production data, and deployment logs are absent.
- API routes validate input, preserve authorization boundaries, and return safe errors.
- Public content has a resilient fallback when AWS, OpenAI, or GitHub is unavailable.
- UI changes work at mobile and desktop widths, in light and dark themes, and by keyboard.
- Contact, analytics, admin, or chat changes remain consistent with `/privacy` and `/notice`.
- Content or RAG changes document whether production needs a seed, migration, or reindex.
- The rollback path is understood before merging a data or infrastructure change.

## Required automated check

`.github/workflows/ci.yml` runs on pull requests targeting `main` and on pushes to `main` or `staging/review`. Its required check name is:

```text
Quality gate
```

It installs the lockfile, runs ESLint, checks TypeScript, evaluates the no-cost local RAG retriever, and builds the production Next.js application.

## Recommended `main` protection

In GitHub, open **Settings → Branches → Add branch protection rule**, use the branch pattern `main`, and enable:

- Require a pull request before merging.
- Require approvals. Use one approval when another reviewer is available; a solo-maintainer repository may leave this disabled.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass and select `Quality gate` after it has run at least once.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Block force pushes and branch deletion.
- Apply the rule to administrators if production should never bypass review.

Do not require AWS/OpenAI integration checks on every pull request: those checks need secrets, can incur cost, and should instead run in a controlled staging environment.

## After merge

Watch the Amplify build until deployment completes, then smoke-test the landing page, navigation, BB-8, contact form, and any changed admin flow. If the release is unhealthy, revert the merge commit rather than rewriting `main` history.
