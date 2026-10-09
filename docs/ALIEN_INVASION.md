# Alien Invasion arcade integration

The portfolio builds the Python/Pygame game directly from
https://github.com/Skywalker1910/alien-invasion.git using Pygbag 0.9.3.
Python source and assets are maintained only in that repository. The portfolio
keeps the browser host, leaderboard API, build script, and generated metadata.

`games/alien-invasion.source.json` selects the published branch. It currently
uses `feature/story-leaderboard-bb8`, which contains the 3.2.0 story, leaderboard,
20-character names, and strict origin bridge. Upstream `main` still contains an
older 3.0 game; do not switch to it until the newer game branch is merged.
Override the branch/tag/commit at build time with `ALIEN_GAME_REF` or `--ref`.

## Local preview

```powershell
python -m venv .venv-game
./.venv-game/Scripts/python.exe -m pip install -r games/requirements.txt
npm run game:build
npm run dev
```

Open http://localhost:3000/games/alien-invasion. The navbar links to the arcade hub, Alien Invasion, and football in that order
before the theme toggle. The landing page has a compact play link and a game card
beside the BB-8 banner; the footer has an orange arcade link aligned to the right.
The /games hub shows playable and upcoming games with readiness tags. Football's reserved route says coming soon.

The arcade initially shows a game preview beside the public leaderboard (stacked
on phones). Play game loads a large modal with margins on all four edges. A
ResizeObserver fits the 3:2 iframe inside the available stage without stretching,
including after resizing or rotating a phone. Closing unloads the runtime, restores
page scrolling and focus, and preserves completed scores for publication. The host implements the updated
source/type event contract, movement in four directions, fire, weapon switching,
shockwave, pause/resume, briefing skip, expanded game window and close/unload. The Python
simulation and all gameplay remain Python-native. Read
the upstream `docs/HOST_INTEGRATION.md` for the upstream bridge contract.

The default loader fetches its Python/WASM runtime from the versioned pygame-web
CDN. First load needs a connection to that origin. The game package is roughly
250 KB compressed; the separately downloaded runtime is larger. Runtime
self-hosting and production CSP validation remain release checks. A nonfatal
missing BrowserFS warning was observed while the game loaded and ran successfully.

## Scores and name review

The Python game saves local scores in localStorage in the browser and SQLite on
desktop. Those are separate from the optional public leaderboard. After a run,
the host offers public publication with a gaming name and selected country.
Names have a 20-character limit. Countries and flag files come from the game's
bundled country list; countries are self-selected, not inferred from location.

The server validates a signed run ticket and completion fields, then calls
OpenAI Moderation and a strict-schema Responses classifier. Flagged names are
fully masked with asterisks before public storage; moderation failure prevents
publication. No raw candidate handle is stored in the public table or logs.
The form discloses OpenAI processing and asks for explicit publication consent.

Run tickets and plausible timing do not verify gameplay: scores are visibly
unverified community submissions until server replay verification is added.

## API and storage

- POST /api/arcade/runs registers an observed run and returns a signed ticket.
- GET /api/arcade/leaderboard returns configuration status and top 10 entries.
- POST /api/arcade/leaderboard validates and moderates a consented submission,
  then atomically saves a score and duplicate-submission marker.
- Public storage is a dedicated DynamoDB table with string pk/sk and expiresAt
  TTL. Table creation, role permissions, and cloud configuration are pending.
- No AWS resources or public test scores were created in this session.

See [database handoff](ARCADE_DB_HANDOFF.md) for the exact schema, configuration,
role permissions, upstream Python changes, and release validation instructions.

## Builds and verification

Build staging copies only runtime files and excludes caches. Generated player
files under public/games/alien-invasion and public/arcade/flags are ignored;
regenerate them after source changes. Amplify and CI now install the pinned
Python dependencies and build the game before building Next.js. These build
configuration changes have been tested locally, not deployed on Amplify yet.

Run npm run arcade:test, npm run lint, npm run typecheck, and npm run build.
Optional browser checks require locally installed Edge and Playwright:

```powershell
./.venv-game/Scripts/python.exe -m pip install playwright==1.58.0
./.venv-game/Scripts/python.exe scripts/smoke-alien-game.py
```

The in-app browser connection was unavailable; local browser checks used
headless Edge. Screenshots go to ignored artifacts/game-qa.

Live OpenAI moderation was checked with synthetic handles: an ordinary name
remained readable and an offensive name was fully masked. This Windows
environment required NODE_USE_SYSTEM_CA=1 for its local certificate trust;
do not disable TLS verification. Cloud database writes remain untested until
the dedicated table and runtime settings are configured.

## Updating the game without copying files

Push compatible game changes to the selected upstream branch, then redeploy the
portfolio in Amplify. Every build performs a fresh shallow Git fetch; it never
silently falls back to an older snapshot. The build prints the resolved commit
and publishes `/games/alien-invasion/source.json` with the exact commit/version.
It stages only main.py, invasion/, and assets/; deleted source/assets do not linger
in the generated bundle. The host's game version and countries are synchronized
at build time, including version-specific public score boards.

For local unpublished game changes:

```powershell
npm run game:build -- --source E:/Projects/alien_invasion
```

For a reproducible release or rollback:

```powershell
npm run game:build -- --ref 51baed9a7cd867f0afd2bb20a1700f7283e652c3
```

Amplify can use the same `ALIEN_GAME_REF` environment variable. Set it to `main`
after merging the newer game branch there, or pin a tag/commit for release control.
Compatible content/gameplay/version changes need no portfolio source edits.
Changes to the bridge protocol, runtime dependencies, or canvas proportions
still require integration review.

## Automatically redeploy after upstream changes

A push to the game repo does not automatically rebuild this separate Amplify app.
To automate it:

1. In the portfolio's Amplify Hosting console, open Hosting → Build settings →
   Incoming webhooks. Create a webhook targeting the portfolio's `main` branch.
2. Save its URL as the **game repo** Actions secret `AMPLIFY_WEBHOOK_URL`.
   Keep this URL private; it authorizes build triggers.
3. Have the game coding agent add the workflow below to the game repo. Trigger
   only the game branch selected by `ALIEN_GAME_REF` / source config. After the
   game branch merges, set Amplify `ALIEN_GAME_REF=main` and change the trigger
   below to `main`. Run the game's tests before calling the webhook.

```yaml
name: Redeploy portfolio arcade
on:
  push:
    branches: [feature/story-leaderboard-bb8]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: portfolio-arcade-deploy
  cancel-in-progress: true
jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger portfolio build
        env:
          AMPLIFY_WEBHOOK_URL: ${{ secrets.AMPLIFY_WEBHOOK_URL }}
        run: |
          test -n "$AMPLIFY_WEBHOOK_URL"
          curl --fail --silent --show-error --retry 2 --request POST "$AMPLIFY_WEBHOOK_URL" > /dev/null
```

The webhook and game-repo workflow are not provisioned by this portfolio PR.
Visitors continue downloading the compiled package from the portfolio's domain;
GitHub is fetched only by the build, not by each visitor.
