# Public arcade database handoff

Work in a feature branch in `E:/Projects/Tech-Portfolio`. The portfolio
now builds the browser game from its authoritative GitHub repo and contains
the player and server-side leaderboard
code. Cloud resources have not been created or changed in this session.

Read `lib/arcade/repository.ts`, `runs.ts`, `moderation.ts`, `submission.ts`, and
`app/api/arcade/*/route.ts` before changing the storage contract. Keep credentials
and public-score writes on the server. Never put AWS/OpenAI keys in the Python
game, its WebAssembly bundle, or `NEXT_PUBLIC_*` variables.

## Database configuration

Create a **dedicated DynamoDB table** in the app's existing AWS region, with:

- Partition key `pk` (String).
- Sort key `sk` (String).
- On-demand capacity; no secondary index required by this implementation.
- TTL enabled on `expiresAt` (Number, Unix seconds).
- Appropriate backup/recovery settings for the public score history.

Set `DYNAMODB_ARCADE_TABLE` to its exact name. Choose the name explicitly, for
example `portfolio-arcade`; the code deliberately has no fallback to the content
or contact tables. The portfolio uses the existing Amplify compute role and
`APP_AWS_REGION`. Keep explicit long-lived credentials unset in production.

Grant only the necessary table access to the existing Amplify compute role:
`dynamodb:Query` for the leaderboard, and the underlying `dynamodb:PutItem`
permissions required for its transactional writes, scoped to the new table ARN.
Use AWS's transaction IAM guidance rather than inventing a
`dynamodb:TransactWriteItems` policy action. Verify the actual operation succeeds
under the role. Scope any future maintenance/delete permissions separately.

Storage contract:

| Record | pk | sk | Purpose |
|---|---|---|---|
| Submission marker | `RUN#<server ticket UUID>` | `RESULT` | Conditional insertion prevents replay; stores the reviewed entry for duplicate retry acknowledgements |
| Public score | `BOARD#alien-invasion#<built game version>` | `<999999999-score padded to 9 digits>#<server ISO date>#<UUID>` | Ascending Query returns highest score first, oldest tie first |

Both records are inserted atomically and expire after 180 days. Reads filter
expired entries even before DynamoDB's asynchronous TTL cleanup. Public results
return only id, reviewed name, country, score, level, createdAt, masked status,
and verification status. Run telemetry remains server-side.

## Runtime configuration

Set these server-only values in Amplify and the local test environment:

```text
DYNAMODB_ARCADE_TABLE=<dedicated table name>
ARCADE_RUN_SECRET=<at least 32 cryptographically random characters>
ARCADE_ALLOWED_ORIGINS=https://www.adityamore.dev,https://adityamore.dev
OPENAI_API_KEY=<existing server-side project key>
OPENAI_USERNAME_MODEL=gpt-4o-mini
APP_AWS_REGION=<existing application region>
```

`ARCADE_RUN_SECRET` must be stable across Amplify execution instances and distinct
from the admin login secret. Do not rotate it during active tests: rotation
invalidates outstanding run tickets. Never print it or commit `.env.local`.

On this Windows development environment, Node needed `NODE_USE_SYSTEM_CA=1` to
trust the local certificate chain. Set it for the local terminal before starting
the preview or running live OpenAI checks. Do not disable TLS verification.
With the system trust enabled, synthetic ordinary and offensive usernames passed
the live acceptance/masking check. No public database writes were made.

The existing `amplify.yml` now forwards `ARCADE_`, `DYNAMODB_`, and `OPENAI_`
settings into the SSR environment. It also installs the pinned Python build
dependencies and runs `npm run game:build`. CI does the same. Validate this on
an Amplify preview before merging; no preview deployment has been performed yet.

## Username guardrail — preserve the server boundary

- `NAME_MAX` is 20 in the portfolio and the authoritative upstream game.
- Names are NFKC-normalized, trimmed, limited to ASCII letters/digits/spaces/
  underscore/dot/hyphen, then checked server-side.
- OpenAI Moderation plus a strict JSON-schema Responses classifier must both
  accept the handle. The latter covers profanity and inappropriate gaming names
  beyond the general moderation categories.
- If flagged, the **whole handle** becomes same-length `*` characters. The score
  may still be published. No raw candidate is stored in the public DB or logs.
- Timeout, refusal, invalid provider output, or missing credentials means **no
  write**. Never fall back to an unchecked name.
- Do not trust client `masked` or `approved` flags. Only `reviewName()` output
  may reach `saveScore()` via `publishScore()`.
- Public publication requires explicit in-game Save & publish intent; playing and local saves do not
  publish or invoke OpenAI. The in-game form must disclose the OpenAI name review.

## Python repository follow-up

The game repo main branch now has 20-character names and strict bridge parent
source/origin checks. Preserve these upstream. The portfolio fetches main.
The portfolio no longer keeps a Python source copy.

Keep SQLite for desktop and localStorage for device-local browser scores.
Neither is the public leaderboard. Continue emitting `run_started`, `game_over`,
`score_saved`, and `run_abandoned`. Do not automatically publish plain local-only `score_saved`;
the portfolio server owns name review and publication after explicit in-game
Save & publish intent. See ARCADE_GAME_AGENT_PROMPT.md for the bridge contract.

Do not introduce a second Python API or SQLite file into Amplify's temporary
SSR filesystem. Additional hosting is unnecessary for the current design.

## Verification before enabling publication

1. Run `npm run arcade:test`, lint, typecheck, the Python build, and the production
   build. Exercise the browser player on desktop and mobile layouts.
2. Test against an isolated table. A reviewed ordinary handle retains its name
   and flag; an inappropriate handle becomes all stars; a 21-character name and
   invalid country are rejected before provider calls or writes.
3. Force OpenAI failure: verify **zero records** were written. Test bad signatures,
   expired tickets, timing mismatches, and duplicate ticket submissions.
4. Inspect stored items and logs for absence of raw rejected names. Confirm
   highest-first sorting, stable ties, and expired-record filtering.
5. Confirm SSR can read all settings under the actual Amplify compute role.
6. Validate the versioned Pygbag CDN under production CSP. Consider self-hosting
   runtime assets if removing that external availability dependency is desired.
7. Add distributed abuse protection/rate limiting before broader exposure. The
   current short-lived limiter is per execution instance and cannot enforce a
   global request budget by itself.

Signed tickets bind results to registered runs and prevent duplicate publication
of one ticket. They **do not prove a score is legitimate**: the game and events
run on the user's device. The UI explicitly labels scores as unverified community
submissions. Replay verification needs an input log and server simulation; it is
not implemented. Do not claim anti-cheat verification or use names as identities.

Reference documentation:

- [DynamoDB transaction IAM and condition semantics](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html)
- [DynamoDB Query ordering](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.KeyConditionExpressions.html)
- [OpenAI moderation](https://developers.openai.com/api/docs/guides/moderation)
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

The game source is now fetched during builds. See ALIEN_INVASION.md for the
selected upstream branch and automated rebuild webhook setup. Game version and
country metadata are synchronized automatically; no Python copies are maintained
in the portfolio.
