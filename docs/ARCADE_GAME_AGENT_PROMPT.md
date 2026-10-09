# Coding-agent task: finish one-step in-game public score saving

Work in `E:/Projects/alien_invasion` (`Skywalker1910/alien-invasion`) on a separate
branch from current main. Keep Python/Pygame native. The portfolio fetches the
latest **main** during each build; do not copy game files into the portfolio.
Read this task and upstream `docs/HOST_INTEGRATION.md` before changing the bridge.

## Scope and verified current state (2026-10-09)

**Implement the Python in-game public-score form and acknowledgement handling.**
Read this entire document. This is the remaining feature task, rather than another
webhook setup task. Reuse the existing automation and backend.

Already completed and independently checked:

- Game PR #2 is merged. Current game main includes 20-character names and strict
  parent source/origin checks. Preserve these.
- Game PR #3 is **merged**, not waiting for merge. It adds the tested, path-filtered
  `.github/workflows/redeploy-portfolio.yml` and README deployment notes.
  Its main push workflow run 37993989793 succeeded.
- Amplify `ALIEN_GAME_REF=main` is set at the app level. The portfolio source config
  on main also now selects main, so removal of the override cannot restore the
  deleted branch.
- The incoming webhook and game repo `AMPLIFY_WEBHOOK_URL` secret are already set
  up. Reuse them; keep the URL private.
- Portfolio PR #26 is merged. It removes the duplicate external form, implements
  the event/acknowledgement contract below, refreshes public rankings, and fixes
  Amplify production-origin validation. Its job #52 completed SUCCEED at
  21:41:07 UTC; an invalid canonical POST returned 400, confirming the fix is live.
- Production game provenance showed ref main, commit a6e2110e9351cba438a7998219bf5328dfeea4ce,
  version 3.2.0. The public leaderboard GET returned configured:true with no entries.
- Game main still emits plain `score_saved`; it has no `score_submit`, `host_config`,
  or `score_publication` handling in app.py. This is the code this task must add.

The full investigation and build timeline are in
`docs/ARCADE_DEPLOYMENT_INCIDENT.md` in the portfolio repository.

## User-facing result

After game over, show one in-game form for gaming name and country. Use at most
20 ASCII characters (letters, digits, spaces, underscore, dot, hyphen). Fictional
names are welcome. Preserve the country-code/flag association. No second form or
save/publish button should appear outside the game.

When the portfolio host has public scores enabled, label the action **Save &
publish**. Before the action, explain that the gaming name goes to OpenAI for an
appropriateness check and the reviewed/masked name, country flag, and score become
public for up to 180 days. Make choosing this action the explicit public opt-in;
provide a Skip / keep local option. Never treat legacy local-only saving as consent.

On desktop or without a compatible host, keep SQLite/localStorage saves, use
**Save locally**, and label the local leaderboard accurately. Never show public
success solely because a local file or localStorage write succeeded.

## Exact host bridge contract (portfolio implementation is ready)

All game-to-host events are delivered through the existing origin-pinned bridge:
`parent.postMessage({source:"alien-invasion", ...event}, parentOrigin)`.
All host commands have `{target:"alien-invasion",type,...}`. Preserve BOTH direct
parent source and exact origin checks. Never use wildcard target origins.

1. Continue emitting `ready`, `run_started`, `game_over`, and `run_abandoned`.
   `run_started` has `run_id`, `seed`, and `version`; `game_over` supplies the same
   identifiers plus score, level, wave, kills, ticks, and duration. The host
   registers a signed run ticket at run start and awaits it if submission races.
2. Handle the host command `host_config`:
   - `publicLeaderboard`: boolean
   - `nameMax`: 20
   - `publicationDisclosure`: user-facing text described above
   It is sent on ready and again when configuration arrives. Allow updates;
   do not assume it must arrive before the first game frame.
3. On explicit **Save & publish**, emit this event ONCE for the completed run:

```json
{
  "type": "score_submit",
  "run_id": "123-2",
  "name": "NovaPilot",
  "country": "in",
  "publish": true
}
```

   `123-2` is an example: use the actual completed run ID. Send the lowercase
   bundled country code. Do not invent a ticket or re-send edited score telemetry.
   The host also accepts `score_saved` with `publish:true` for compatibility, but
   prefer `score_submit`. Plain legacy `score_saved` is device-local only.
4. Disable repeated submission while pending. Handle the host command
   `score_publication`, correlated to `run_id`:

```json
{
  "target": "alien-invasion",
  "type": "score_publication",
  "run_id": "123-2",
  "status": "saved",
  "message": "Score saved as NovaPilot.",
  "name": "NovaPilot",
  "country": "in",
  "score": 1200,
  "masked": false,
  "retryable": false
}
```

   Status is `saving`, `saved`, or `error`. `message` is always present; reviewed
   name/country/score/masked fields are optional. Show **Saved publicly** only on
   `saved`; display the returned reviewed or fully masked name. Do not strip the
   asterisks from a returned masked name. Some saved acknowledgements only say the
   round was already saved, with no name fields; handle this gracefully.
   On `error`, show the message and offer an in-game Retry if `retryable:true`,
   using the same run ID and saved inputs. Never start a new run to retry the old
   score, never emit another `run_started` to obtain a fresh ticket for the same
   result, and ignore stale acknowledgements for another run.
5. Preserve inputs during retries. If the user begins another run or closes the
   game while pending, do not invent a success or attach an old acknowledgement
   to the new run. The host's completed request can finish and refresh rankings.
6. Public scores of zero are supported. Keep local scores working independently.
   The host blocks duplicate writes and refreshes its public leaderboard on saved
   acknowledgements; there is no external name/country publication form.

Keep AWS/OpenAI credentials and all public DynamoDB writes on the portfolio
server. No boto3, direct DynamoDB calls, OpenAI calls, or extra API server belong
in the Python browser game. The server validates tickets/name/country/timing,
reviews names, and saves only reviewed handles. Client results remain unverified
community submissions; do not claim anti-cheat verification.

## Production integration checks

The read API is configured. Configuration alone does not prove a public write
succeeds. The original own-origin 403 bug is fixed by portfolio PR #26, which is
merged. Verify the current production deployment includes it: use an invalid JSON
body `{}` against the canonical www POST endpoint, without creating a score. It
should return a validation error (400), rather than the old origin rejection (403).
If it still returns 403, inspect the currently deployed portfolio commit and
Amplify job status before changing the Python game or database permissions.

Verify Amplify runtime settings without printing secrets:

- `ARCADE_ALLOWED_ORIGINS=https://www.adityamore.dev,https://adityamore.dev`
- `DYNAMODB_ARCADE_TABLE` names the dedicated table, in `APP_AWS_REGION`.
- `ARCADE_RUN_SECRET` has at least 32 characters and is stable across instances.
- Existing server-only `OPENAI_API_KEY`; optional `OPENAI_USERNAME_MODEL`.
- `ALIEN_GAME_REF` must be unset or `main`; remove any old feature-branch override.

The existing build spec forwards `ARCADE_`, `DYNAMODB_`, and `OPENAI_` into SSR.
The table uses String `pk`/`sk`, TTL `expiresAt`, and per-game-version board keys.
Verify the actual runtime role has Query and the PutItem permissions used by
transactional writes on this table. A successful GET proves reads, not writes.
See `docs/ARCADE_DB_HANDOFF.md` in the portfolio for exact schema and IAM guidance.
Use the canonical www URL for checks: the bare domain currently redirects with
302, which can turn a diagnostic POST into a GET. Do not log raw names/tickets.

## Existing automatic deployment: reuse and verify

The game repo's `.github/workflows/redeploy-portfolio.yml` is already merged via
PR #3. Keep this workflow and existing `AMPLIFY_WEBHOOK_URL` secret:

- main pushes that touch main.py, invasion/**, assets/**, requirements.txt, or the
  workflow run tests and then trigger the portfolio's main Amplify webhook.
- Pull requests run tests only; redeploy is skipped.
- README-only changes do not redeploy.
- workflow_dispatch supports a manual test-and-redeploy run.

The remaining Python edits touch invasion/**, so merging them to main will trigger
this workflow automatically. Confirm both test and redeploy jobs succeed, then
follow the resulting Amplify job through BUILD, DEPLOY, and VERIFY. A successful
webhook HTTP response starts a build; it does not prove that build deployed.

The portfolio rebuild fetches current game main, generates the browser package,
synchronizes version/country metadata, and serves visitors from its own domain.
Visitors do not fetch GitHub. No portfolio source commit is needed for compatible
game updates. Bridge protocol, dependency, or canvas-aspect changes require review.

### Credential migration remains a separate owner decision

Read-only inspection confirmed an Amplify compute role is attached and the
app-level long-lived APP_AWS_ACCESS_KEY_ID / APP_AWS_SECRET_ACCESS_KEY settings
are still present. The portfolio SDK explicitly prefers those configured keys,
so the attached role is not evidence that runtime operations use it.

Keep this game feature task scoped to the score flow. Report credential mode
without displaying values. Coordinate removal of long-lived keys separately with
the owner after verifying the role supports all existing portfolio AWS operations,
not just leaderboard reads/writes. No credential settings were changed by this
handoff or investigation.

## Acceptance tests and shipping order

Add meaningful Python tests for explicit public intent, local-only fallback,
20-character validation, correct flag codes, pending/saved/error handling, retry,
duplicate clicks, zero scores, stale acknowledgements, and unchanged origin checks.
Run all upstream pytest tests and build the browser game. Verify the actual
in-game form in a portfolio localhost iframe, with fixture-only APIs first.

Check: saving once sends one public request; ordinary handles retain names;
rejected handles show stars; provider/storage errors show a retry and no false
success; refreshed public rankings show the chosen country's flag. The host's
`scripts/smoke-arcade-public.py` covers the new bridge with fixtures; finish the
real Python UI test because the fixture does not enter the new native form.

Portfolio PR #26 is merged and its Amplify job #52 has succeeded. Re-check current
production health after your local tests, then open a **new game PR**
from your game feature branch to main; PR #3 was only the completed webhook task.
Its PR tests must pass and redeploy must remain skipped until merge.

After the user merges the new game PR, the existing main-push workflow should
trigger a portfolio build automatically. Verify every Amplify phase succeeds and
source.json reports the expected game main commit/version. Check the real in-game
form, returned acknowledgement, and refreshed country flag in a local fixture
first, then an authorized real user score in production. Do not add synthetic
handles to the public production board without explicit authorization.

Your final response must identify the game code changes, tests, new game PR URL,
workflow run, latest deployment state, and remaining integration issues. Do not
report public scoring complete merely because the webhook or local saving works.
