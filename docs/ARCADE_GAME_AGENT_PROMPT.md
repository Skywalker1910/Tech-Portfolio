# Coding-agent task: one-step in-game public scores and Amplify webhook

Work in `E:/Projects/alien_invasion` (`Skywalker1910/alien-invasion`) on a separate
branch from current main. Keep Python/Pygame native. The portfolio fetches the
latest **main** during each build; do not copy game files into the portfolio.
Read this task and upstream `docs/HOST_INTEGRATION.md` before changing the bridge.

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

The production leaderboard GET returned `configured:true` with an empty board.
A legitimate POST from `https://www.adityamore.dev` returned 403 because Amplify's
internal request URL failed the old origin comparison. The portfolio fix uses an
explicit allowlist and does not trust arbitrary forwarded host headers.

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

## Automatic deployment after game changes

Create an Amplify incoming webhook for the **portfolio app's main branch**, not
another game-hosting app. In Amplify Hosting → Build settings → Incoming webhooks,
create it and store its full URL as the **game repo** Actions secret
`AMPLIFY_WEBHOOK_URL`. Never commit the URL or print it.

Add `.github/workflows/redeploy-portfolio.yml` in the game repo:

```yaml
name: Redeploy portfolio arcade
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: portfolio-arcade-deploy
  cancel-in-progress: true
jobs:
  test-and-redeploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - name: Install game test dependencies
        run: python -m pip install -r requirements-dev.txt
      - name: Test game
        env:
          SDL_VIDEODRIVER: dummy
          SDL_AUDIODRIVER: dummy
        run: python -m pytest -q
      - name: Trigger portfolio build
        env:
          AMPLIFY_WEBHOOK_URL: ${{ secrets.AMPLIFY_WEBHOOK_URL }}
        run: |
          test -n "$AMPLIFY_WEBHOOK_URL"
          curl --fail --silent --show-error --retry 2 --request POST "$AMPLIFY_WEBHOOK_URL" > /dev/null
```

The portfolio rebuild fetches current game main, generates the browser package,
synchronizes version/country metadata, and serves visitors from its own domain.
Visitors do not fetch GitHub. No portfolio source commit is needed for compatible
game updates. Bridge protocol, dependency, or canvas-aspect changes require review.

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

Ship the portfolio origin/bridge fix first. Then merge the game form/ack changes
to game main and trigger an Amplify rebuild (the webhook can do this). Verify source.json reports the correct main
commit and game version. Check actual production API responses and an authorized
real user score. Do not publish synthetic test handles to the public production
board without explicit authorization. Include the webhook secret/configuration
steps that remain pending in your final handoff.
