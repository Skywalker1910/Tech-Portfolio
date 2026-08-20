# Pull Requests and Release Checks

Changes reach production through a pull request into `main`. Direct pushes to `main` should be disabled with a GitHub branch protection rule because AWS Amplify deploys that branch automatically.

## Standard workflow

1. Create a focused branch and make the change.
2. Confirm the change is ready for the repository quality gate.
3. Push the branch and open a pull request with `main` as the base.
4. Complete the repository pull-request template and review the full diff.
5. Wait for the `Quality gate` check to pass.
6. Squash-merge the pull request after review and required checks pass.
7. Monitor the production Amplify deployment and verify the affected application flows after release.

The CI workflow intentionally uses deterministic keyword RAG retrieval and does not receive AWS or OpenAI secrets. This makes pull requests safe to validate, including pull requests from forks. Semantic retrieval is verified as a controlled operational check when changes affect embeddings, S3 Vectors, retrieval thresholds, or the indexed corpus.

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
- Require approvals. I use one approval when another reviewer is available and may leave this disabled when I am the only reviewer.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass and select `Quality gate` after it has run at least once.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Block force pushes and branch deletion.
- Apply the rule to administrators if production should never bypass review.

Do not require AWS/OpenAI integration checks on every pull request: those checks need secrets, can incur cost, and should run only as controlled operator verification when the affected service changes.

The repository currently deploys only `main` through Amplify. A feature branch or pull request passing GitHub checks does not create an application preview unless an Amplify preview branch is configured separately.

## After merge

Watch the Amplify build until deployment completes, then smoke-test the landing page, navigation, BB-8, contact form, and any changed admin flow. If the release is unhealthy, revert the merge commit rather than rewriting `main` history.
