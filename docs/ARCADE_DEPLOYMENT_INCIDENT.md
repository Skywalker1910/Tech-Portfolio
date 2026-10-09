# Arcade upstream fetch failure: portfolio PR #25

Investigated on 2026-10-09 using GitHub PR/workflow records, read-only Amplify job
metadata and build logs, and production GET/invalid POST diagnostics. No cloud
settings, credentials, webhooks, IAM policies, or public score records were changed.

## Confirmed cause

Amplify job #50 built portfolio merge ce0ded5e4c4448d8d4bf74e82795fba6171dccf5
(PR #25). The committed source ref was feature/story-leaderboard-bb8. Game PR #2
merged and that feature branch was deleted before the job fetched it.

The build log contains this exact failure at 21:15:12.902 UTC:

```text
fatal: couldn't find remote ref feature/story-leaderboard-bb8
```

The git fetch exited with status 128; the Python build propagated that failure.
BUILD failed and DEPLOY/VERIFY were cancelled. This was an upstream-ref lifecycle
failure, not a Python compile, DynamoDB, moderation, or webhook failure. The build
correctly failed rather than silently packaging an old snapshot.

GitHub CI had passed on PR #25 while the feature branch still existed. CI success
could not guarantee a later fetch of a mutable branch that was then deleted.

## Timeline (UTC)

| Time | Event |
|---|---|
| 20:56:54 | PR #25 GitHub Quality gate completed successfully. |
| 21:12:20 | Portfolio PR #25 merged. |
| 21:12:22 | Amplify job #50 started for that merge. |
| 21:12:43 | Game PR #2 merged; its feature branch was subsequently deleted. |
| 21:15:12 | Job #50 failed to fetch the deleted branch. |
| 21:15:18 | Job #50 ended FAILED; deploy and verify were cancelled. |
| 21:31:42 | Game PR #3's main-push workflow run started; tests and webhook job succeeded. |
| 21:32:20 | Recovery job #51 started using the main source override. |
| 21:34:30 | Portfolio PR #26 merged with the source-config default main and score-flow/origin fixes. |
| 21:36:40 | Recovery job #51 completed SUCCEED; job #52 started for PR #26 merge 28cc1ba. |
| 21:41:07 | Job #52 completed SUCCEED in BUILD, DEPLOY, and VERIFY. |

At the initial read-only inspection, job #52 was still RUNNING. A subsequent
check confirmed SUCCEED in all phases at 21:41:07 UTC. A fresh deliberately
invalid POST returned 400 with "Confirm public score publication.", confirming
the origin fix is now live without creating a public score.

## Recovery and current integration state

- Amplify app d1p2z2pdfp9af0 (Tech-Portfolio), main branch, has ALIEN_GAME_REF=main.
- The committed games/alien-invasion.source.json on portfolio main also names main.
- Recovery job #51 succeeded in BUILD, DEPLOY, and VERIFY.
- Production source.json served ref main, game commit a6e2110e9351cba438a7998219bf5328dfeea4ce,
  version 3.2.0, confirming recovery from the deleted-branch build failure.
- Production leaderboard GET returned configured:true with no entries.
- At the same inspection, a deliberately invalid canonical www POST still returned
  the old own-origin 403, consistent with PR #26's job #52 not yet deployed.
  After job #52 completed, the same diagnostic returned 400 validation instead.
  Neither diagnostic could create a score or call OpenAI.
- Game PR #3 is merged and automation works. Game app.py still emits only local
  score_saved without explicit public intent or publication acknowledgements.
  The Python in-game score task remains necessary.
- Long-lived APP_AWS keys are present despite the attached compute role. Their
  removal is a separate owner decision; no credential changes were performed.

## Preventing recurrence

Use the long-lived game main branch, or an immutable commit/tag for a controlled
release, as the build source. Avoid shipping an integration ref that will be
removed after merging. Build provenance records the resolved game commit for
verification and rollback. Both the committed default and Amplify override now
select main. Existing webhook automation rebuilds the portfolio after tested game
changes reach main; confirm Amplify completion separately from webhook success.

The remaining game implementation is specified in ARCADE_GAME_AGENT_PROMPT.md.

Evidence: portfolio PRs #25/#26; game PRs #2/#3; game Actions run 37993989793;
Amplify main jobs #50/#51/#52; canonical production source.json and leaderboard API.
