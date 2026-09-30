# My BB-8 retrieval evaluation

## Decision and boundaries

I retain **fixed retrieval, maximum 4 chunks, distance cutoff 0.65** as my recommended baseline. Adaptive mode is implemented but not enabled by this work. Increasing a request's chunk limit changes the amount of retrieved evidence, **not the knowledge in my corpus**. Changing retrieval settings does not require reindexing; changing published knowledge or embedding compatibility does.

My initial comparison used only offline keyword retrieval and regression checks. Following explicit approval, I ran one read-only production-index smoke test with two embedding requests and one generated answer under a $0.05 total OpenAI model-cost cap, then a held-out live retrieval matrix with 96 embedding requests under a smaller $0.005 cap. I have not run paid judging, changed production settings, reindexed, or deployed. My measured [results](RAG_EVALUATION_RESULTS.md) separate the corpus snapshots and modes; retrieval coverage and a single answer do not establish an answer-quality gain.

## Baseline audit

Before this change, my runtime query joined the latest two user turns (not assistant turns), loaded runtime overrides from DynamoDB, and rebuilt the current published corpus for lexical retrieval. Explicit `local` evaluation instead used only the bundled `data/portfolio-knowledge.json` corpus. These are distinct corpus builders: my current offline snapshot contains 43 chunks; a live published index can contain more.

My lexical scorer removes stop words, expands portfolio synonyms, weights term rarity, weights title/section hits three times content hits, and rewards exact phrases. Only scores at least 1 qualify; this is a lexical relevance floor, not a calibrated confidence probability.

My semantic query embeds the question using my configured embedding model/dimensions and requests at most `topK` S3 Vectors neighbors with metadata. The previous filter discarded numeric distances above the cutoff but let missing/non-finite distances through. I now require a finite distance at or below the cutoff, plus usable source metadata.

My production path is **hybrid**, not pure semantic: up to two lexical matches precede semantic matches, followed by stable deduplication and the final chunk cap. Previously only chunk IDs were deduplicated, and prompt assembly had no independent source-token budget. I now deduplicate IDs and normalized exact content, preserving the first source's metadata and order. I keep distinct partially overlapping chunks; redundancy is measured separately. Disabled semantics, missing configuration, and service failure retain my keyword fallback. An empty successful semantic query retains the existing hybrid lexical rescue; it is not reported as a service failure.

The previous code-level no-setting distance default was 0.60, whereas my documented deployment baseline and example configuration were 0.65. I aligned the code fallback to 0.65; existing DynamoDB/environment overrides are still honored. No production override was saved.

## What my existing Hit@3 actually means

I preserve my original 83 cases in `evals/rag-cases.json` unchanged. The legacy evaluator explicitly requests three chunks. A question passes when:

1. **Any** retrieved chunk's route appears in `expectedRoutes`.
2. **Every** `expectedTerms` fragment occurs, case-insensitively, somewhere in the concatenated `searchText` of the three chunks. No expected terms means this second condition passes.

Terms may occur in titles/sections, not just body text, and may come from different chunks or routes. Multiple expected routes are alternatives in this metric, not an all-routes requirement. A substring match does not verify the meaning, timing, correctness, or completeness of a generated answer. It is not precision, recall, a groundedness score, or a human review.

The legacy `--s3` mode uses my hybrid path and can fall back. It now prints actual mode/fallback per row rather than presenting fallback as successful semantic retrieval. It requires explicit paid approval and supports a non-calling dry run. I prefer my new budgeted comparison harness for operational comparisons.

## Dataset and separation

| Dataset | Cases | Role |
|---|---:|---|
| Original regression set | 83 | Existing development/regression coverage; retained byte-for-byte |
| Additional development set | 12 | Paraphrases, ambiguity, comparisons, summaries, follow-ups, absent facts |
| Held-out test set | 12 | Separate IDs/questions, same categories, first reporting pass after defining the heuristic |

My development run includes the original 83 plus 12 new cases (95 total, 92 answerable). My held-out run includes 12 cases (8 answerable). Unanswerable and unresolved ambiguous questions are excluded from positive-evidence Hit denominators, retained in row/category counts, and assessed for refusal/clarification in answer evaluation. I never treat retrieving zero chunks as proof of appropriate refusal.

I use the development set for tuning. I do not tune against the held-out results reported here. Once I repeatedly inspect or tune against a held-out set, I must create a new independently written held-out set. These small, hand-authored sets are not representative of all visitor language. My legacy suite has already informed corpus development, so its perfect score is especially weak evidence of generalization.

Evaluation cases are imported only by evaluation scripts and tests. They never feed my knowledge builder, indexing pipeline, production prompts, or visitor telemetry.

## Comparison harness

`scripts/compare-rag.ts` freezes one corpus per run and records its SHA-256, chunk count, timestamp, settings, rows, and category summaries. It compares fixed maxima 4, 6, and 8 at **the same 0.65 threshold and 12,000-source-token upper-bound budget**. `--adaptive` adds a fourth policy; it does not replace the fixed comparisons.

| Mode | Evidence source | What I can infer |
|---|---|---|
| `keyword` offline | Bundled static corpus | Deterministic lexical coverage only |
| `runtime-disabled` offline | Same frozen corpus, actual disabled-runtime fallback path | Fallback integration; not a hybrid or semantic benchmark |
| `keyword` live | Frozen current published corpus | Lexical behavior on the live corpus snapshot |
| `semantic` live | S3 Vectors only | Qualifying semantic neighbors, no lexical rescue |
| `runtime` live | Actual lexical-first hybrid implementation | Runtime merge/filter/fallback behavior under controlled settings |

Before and after an approved live run, I read the full vector index metadata and verify its IDs, content, title, section, route, document ID, and embedding model against the frozen current corpus. Drift, fallback, missing vectors, or service failures make the run incomplete, not a successful semantic result. I do not repair/reindex during evaluation. S3 does not provide an atomic snapshot across these queries; I must avoid concurrent publishing/reindexing. Metadata equality does not independently prove embedding quality or model/dimension correctness.

My harness makes an independent k=3 request per question/mode for Hit@3; it does not silently redefine Hit@3 as a prefix of a larger approximate-neighbor request. The distinct `hitAtK` applies the same route/fragment predicate to the selected, deduplicated, budgeted request evidence at k=4, 6, 8, or the adaptive request limit. It is not labelled Hit@3.

Metrics include:

- Mean and P95 retrieval latency, actual mode, fallback reason, chosen request limit, returned chunk count, and budget drops.
- Qualifying candidate count before deduplication/capping: all score-qualified lexical candidates in keyword fallback; filtered returned semantic neighbors in pure semantic; up to two lexical plus filtered neighbors in hybrid. Counts are not equivalent across these modes and are not total index neighbors within the threshold.
- IDs/exact normalized-content duplicates removed. Mean pairwise word-set Jaccard similarity of retained content (`redundancy`) measures overlap, not factual redundancy or irrelevance.
- Fraction of required evidence fragments found and fraction of expected routes represented. Both are separately reported from the existing any-route/all-terms hit predicate.
- Category denominators, positive-only hits, negative/ambiguous rows, and review status.

Live fixed modes make independent embedding/query requests, so semantic and runtime latency are not cached-path comparisons. Adaptive may reuse the identical query/k within its own mode: rows mark `cachedSemantic` and preserve original `semanticSearchMs`. I must separate cached rows for latency conclusions. Timings exclude frozen-corpus acquisition, full-index verification, and browser/network rendering. Single-pass sub-millisecond local timings are noisy, not production latency forecasts.

My operator commands (not application setup instructions) are:

```text
npm run rag:compare -- --adaptive
npm run rag:compare -- --split=heldout --adaptive
npm run rag:compare -- --split=legacy
npm run rag:compare -- --live --answers --judge --adaptive --dry-run
```

Reports are local, ignored artifacts under `artifacts/rag/`. Each split/adaptive filename is overwritten on rerun, so I archive reviewed runs separately. Dry run prints a plan and makes no AWS or OpenAI calls, even if live/answer flags and credentials are present. Its corpus hash refers to bundled knowledge; it cannot attest a live snapshot.

## Opt-in generated-answer evaluation

I use the configured `OPENAI_CHAT_MODEL`, the production grounding/identity instructions, and synthetic conversation fixtures for answer comparison. `--answers` opts in to generation; `--judge` additionally opts in to automated model grading. Without `--judge`, I retain a manual review template with unset dimension scores. No answer quality scores are fabricated for offline retrieval runs.

Every paid comparison run requires `--approve-paid`, positive `--max-calls=N`, and positive `--max-tokens=N`. My additional `--budget-usd` guard defaults to $0.05 and rejects values above $0.05. The cap applies to the **whole run**, not each question, policy, or request. All three ceilings cover OpenAI embedding, generation, and judge calls together. Before each call I reserve a conservative UTF-8 byte-level input-token upper bound, 256 framing tokens, and the maximum output budget (1,000 for each generation/judge). I multiply those reservations by the verified standard model rates, round up to integer nanodollars, and refuse a request before sending it if any ceiling would be exceeded. Reservations are not refunded; missing usage or a failed call is not treated as free. OpenAI retries are disabled and generation explicitly uses the standard/default service tier. A partial run is explicitly incomplete. AWS read-only metadata/query requests, other application traffic, taxes, and subsequent provider pricing changes are outside this local model-cost guard; it is not an account-wide billing limit. AWS metadata pagination remains capped at 20 pages per verification pass.

My pricing registry is `lib/rag/evaluation-pricing.ts`, verified September 30, 2026: [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra) costs $2 per million input and $12 per million output tokens; [text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small) costs $0.02 per million input tokens. I assume no cache discount. Unknown model IDs and pricing verifications older than seven days fail closed until I check and update official prices; I do not silently substitute a model. Reported generation usage also produces a standard-rate cost estimate, separate from the pessimistic reserved upper bound and the final provider invoice. Legacy `rag:evaluate:s3` now shares the dollar guard with a maximum of 83 calls and 100,000 reserved tokens.

My approved single-answer smoke-test invocation is below. `--case`, `--mode`, and `--policy` select a small target instead of spending the cap on an incomplete full matrix. To inspect its plan without any service calls, I append `--dry-run`:

```text
npm run rag:compare -- --live --answers --split=heldout --case=test-followup-teaching --mode=runtime --policy=4 --budget-usd=0.05 --max-calls=3 --max-tokens=40000 --approve-paid
```

The `--live` flag queries my production AWS data/index from the local evaluator; this does not deploy evaluation code, call the deployed browser/chat endpoint, change my runtime settings, or reindex. My live artifact suffix includes the environment/mode/policy, preserving earlier offline reports. On a machine whose Node trust configuration needs the Windows system certificates, I use `node --use-system-ca --env-file-if-exists=.env.local --import tsx scripts/compare-rag.ts` with the same flags. I never disable TLS verification.

I can omit `--answers` to run a larger retrieval-only sweep under the same dollar cap. Adding `--judge` spends the shared budget on a second generation per answer and may stop a five-cent pilot early. A meaningful quality comparison needs matched questions, several categories, and complete policy results; a single smoke test is not that comparison. I do not enable adaptive production retrieval based on this pilot. The cap is renewed per explicit invocation, not per visitor or automatic scheduled job; no paid CI or automatic recurring evaluation is enabled.

My answer rubric is versioned in `lib/rag/evaluation.ts`. Each dimension uses 0 (failed), 1 (partial), 2 (satisfied):

| Dimension | Full-score criterion |
|---|---|
| Factual accuracy | Verifiable claims agree with supplied evidence; no invented dates, metrics, or facts |
| Groundedness | Portfolio claims can be traced to supplied source content |
| Completeness | All requested aspects that evidence supports are covered |
| Relevance | The response addresses the question and the correct follow-up referent |
| Appropriate refusal | Missing/ambiguous facts are acknowledged without unnecessary refusal of supported facts |

Automated judge output is schema/range-validated, marked **unverified model judgment**, and aggregated by category. An automated judge can be biased, fooled, or wrong; it is not a substitute for my human review. My manual template has the same five fields plus status; I should review answers blind to k and compare matched cases, including every absent-fact/ambiguity case. I record generated/judge input/output tokens when returned, completion status, each call latency, and answer end-to-end latency. Incomplete generations must not be considered complete answers.

This harness evaluates text answers, not UI tool calls, tool-follow-up responses, navigation effects, refusal safety at production scale, or real visitor sessions. It uses the production generation model/settings but does not simulate the full browser or contact tools. Those remain separate integration/human checks.

I use `store:false` and keep synthetic outputs/review artifacts local. Nothing is written to my traffic/OpenAI usage telemetry, and no API keys, system prompts, visitor conversations, or provider error request bodies are logged. This is not a claim of provider zero retention: I refer to [OpenAI's data controls](https://developers.openai.com/api/docs/guides/your-data). Output caps and reported usage follow the [Responses API](https://developers.openai.com/api/reference/typescript/resources/beta/subresources/responses/methods/create).

## Adaptive retrieval and source budget

I avoid a classifier/model call. A deterministic query heuristic uses the same latest-two-user-message query as fixed retrieval:

- Explicit comparisons/“across”/“all projects”: up to 8.
- Career summaries/overviews: up to 6.
- Short factual “when/where/GPA/email/URL/exact/how many” questions: up to 3, only if no broader rule matched.
- Other/ambiguous questions: my fixed limit (normally 4).

Every adaptive decision is capped by `adaptiveMaxK` (normally 8). Broad rules have precedence so a comparison mentioning “where” is not mistakenly treated as a narrow fact. Follow-ups keep the previous user question, which helps preserve the referent, but can retain a stale topic after a subject switch. I do not resolve references from assistant answers or claim robust conversational understanding from this heuristic. Ambiguous inputs still need the generation model to ask for clarification.

All policies retain finite-distance filtering, lexical qualification/fallback, stable lexical-first order, unique evidence, and source metadata. `topK` is a maximum, never a quota: I do not insert unqualified chunks to reach it.

My source context budget defaults to 12,000 conservative text-token upper-bound units, bounded to 1,000–32,000 in RAG Control. UTF-8 bytes are a conservative upper bound for byte-level BPE text tokens, **not** an exact tokenizer measurement or a characters/4 estimate. Source labels/title/section/routes and separators count. I keep whole sources and skip an oversized source rather than cutting its claims; smaller later sources may still fit. The prompt assembler applies the same safeguard. Citation metadata is derived from the evidence actually retained. Stable system policy, conversation, model framing, and output tokens have separate limits; this budget applies only to verified-source context.

## Command Center production evaluation

After publishing knowledge and deliberately reindexing, I can evaluate it directly in **Command Center → RAG Control → Evaluate published knowledge**. I do not need to connect to the host machine. I preview the plan first (no AWS/OpenAI access), select a retrieval comparison or one synthetic answer fixture, then explicitly approve a maximum $0.05 OpenAI reservation for that run. No evaluation starts automatically after reindexing or on page load.

My small retrieval preset uses three **development**, not held-out, questions (movie paraphrase, career summary, movie-demo follow-up). It compares 4, 6, 8 and adaptive using the same frozen published corpus, distance 0.65 and source budget 12,000. Keyword, pure semantic and hybrid modes are distinct. Hybrid follows my runtime merge/fallback algorithm, with evaluation settings held fixed rather than copying currently saved production controls. Independent retrieval at 3 preserves the original Hit@3 definition. Missing-evidence and ambiguous fixtures are available for answer/refusal review and report positive hit metrics as N/A.

I reuse a query's semantic results across modes/policies within this smoke test to reduce spend. Reused rows are marked `semanticRequestReused`; their latency must not be interpreted as production latency. The larger CLI evaluator remains available for uncached, split/category comparisons. The browser test is not a statistically meaningful full-suite quality score.

My answer preset uses the configured generation model, current source grounding policy and synthetic follow-up history; it does not call visitor chat endpoints or exercise navigation tools. I cap output at 500 tokens, including reasoning (smaller than normal chat's 1,000). I display completed/truncated status, token usage and latency and review factual accuracy, groundedness, completeness, relevance and appropriate refusal using the documented 0–2 rubric. No paid model judge runs in this panel; human review remains `not-reviewed` until performed externally. Four answer policies may **not** all fit one five-cent run; I retain partial results and do not claim they form a complete quality comparison.

The server reserves UTF-8 input-token upper bounds plus framing and maximum output **before** each paid request, without refunds, using verified model-specific rates. My generation reservation uses $2.50 per million input tokens to include the documented 1.25× cache-write surcharge, while reported standard-rate estimates use $2 input / $12 output. Unknown models or pricing verification older than seven days fail closed: I must review official rates and update the pricing registry/verification date before another paid run. A model price can change inside that verification window, so this guard is not a provider billing guarantee. AWS operations, taxes and unrelated visitor/API usage are outside this per-run cap. I disable OpenAI retries and share the budget between query embeddings and generation. Maximums: 12 paid attempts, 150,000 conservatively reserved tokens, 20 seconds.

My existing `portfolio-content` table holds a transactional global two-minute lease, one-minute start cooldown, request-ID replay guard and last report. Claims require a durable write to succeed before any paid call, preventing simultaneous Amplify instances or double-clicks from spending twice on one request. Replay markers use `expiresAt` for seven-day TTL where configured; without TTL they remain and continue blocking reuse. A timed-out process can leave a running/uncertain record: I inspect **Last-run status** and do not automatically retry. The requested Next.js duration is 30 seconds; hosting timeout behavior still needs deployed verification.

Index metadata is checked in full before and after a run against the frozen corpus; drift/incomplete verification prevents a successful-comparison claim. This is not an atomic snapshot of concurrent reindexing and does not validate embedding contents themselves. I do not reindex or publish during a test. Evaluation does not write vectors, modify knowledge, save retrieval controls or enable adaptive production mode.

Only source IDs, synthetic fixture IDs, settings-independent metrics, corpus hash, timestamps, budget and token/latency metadata are persisted. Synthetic generated text is shown transiently to my authenticated browser and stripped before DynamoDB storage; prompts, keys, provider error payloads and visitor conversations are not persisted or logged. The existing table's `GetItem`, `PutItem` and `UpdateItem` access supports these operations; no new table or infrastructure is created by this implementation. [DynamoDB transaction behavior](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html) and [verified OpenAI model rates](https://developers.openai.com/api/docs/models/gpt-5.6-terra) underpin these safeguards.

## Production promotion criteria

I will consider enabling adaptive mode only after a separately approved live semantic/hybrid comparison and generated-answer/human review show useful gains on broad questions without factuality, relevance, narrow-question, follow-up, or refusal regressions. I will check input-token growth and uncached latency, not only retrieval coverage. A larger chunk cap does not fix missing corpus facts or add knowledge. My current evidence supports further testing, not changing production defaults.
