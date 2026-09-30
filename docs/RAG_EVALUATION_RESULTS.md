# My retrieval comparisons and live smoke test — September 30, 2026

I measured my bundled corpus of 43 chunks, SHA-256 `82767dc603c3160d1513023d187a22ede90563c349849eae30771ad58467be0f`, using the same questions, lexical scorer, distance setting 0.65 (not exercised offline), deduplication, and 12,000-source-token upper-bound budget for every policy. I made no AWS or OpenAI calls. The results below are **evidence coverage**, not measured answer quality.

My original regression baseline remains **83/83 Hit@3**. The additional development questions expose limitations that this older suite did not measure.

| Policy | Development Hit@3 | Development hit at request limit | Held-out Hit@3 | Held-out hit at request limit | Mean retained chunks (dev / test) |
|---|---|---|---|---|---|
| Fixed 4 | 90/92 (97.8%) | 91/92 (98.9%) | 5/8 (62.5%) | 5/8 (62.5%) | 3.63 / 3.33 |
| Fixed 6 | 90/92 (97.8%) | 91/92 (98.9%) | 5/8 (62.5%) | 6/8 (75.0%) | 5.13 / 4.83 |
| Fixed 8 | 90/92 (97.8%) | 91/92 (98.9%) | 5/8 (62.5%) | 7/8 (87.5%) | 6.53 / 6.08 |
| Adaptive, max 8 | 90/92 (97.8%) | 91/92 (98.9%) | 5/8 (62.5%) | 7/8 (87.5%) | 3.64 / 3.83 |

The development denominator excludes 3 unanswerable/ambiguous cases from 95 total. The held-out denominator excludes 4 from 12 total. My harness also exercises the disabled-runtime fallback on the same snapshot; its coverage matches keyword mode exactly, so it is not an independent semantic result.

## Category results

| Development category | Answerable cases | Hit@3 | Hit at 4 | Hit at 6 | Hit at 8 | Adaptive |
|---|---:|---|---|---|---|---|
| Career | 7 | 7/7 | 7/7 | 7/7 | 7/7 | 7/7 |
| Experience | 13 | 13/13 | 13/13 | 13/13 | 13/13 | 13/13 |
| Education | 9 | 9/9 | 9/9 | 9/9 | 9/9 | 9/9 |
| Projects | 42 | 42/42 | 42/42 | 42/42 | 42/42 | 42/42 |
| Skills | 6 | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 |
| Contact | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| Social | 3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| New paraphrases | 2 | 2/2 | 2/2 | 2/2 | 2/2 | 2/2 |
| New ambiguity | 1 (+1 unresolved) | 1/1 | 1/1 | 1/1 | 1/1 | 1/1 |
| New comparisons | 2 | 1/2 | 2/2 | 2/2 | 2/2 | 2/2 |
| New summaries | 2 | 1/2 | 1/2 | 1/2 | 1/2 | 1/2 |
| New follow-ups | 2 | 2/2 | 2/2 | 2/2 | 2/2 | 2/2 |
| Missing evidence | 0 (+2 absent-fact cases) | N/A | N/A | N/A | N/A | Not answer-evaluated |

| Held-out category | Answerable cases | Hit@3 | Hit at 4 | Hit at 6 | Hit at 8 | Adaptive |
|---|---:|---|---|---|---|---|
| Paraphrases | 2 | 1/2 | 1/2 | 1/2 | 1/2 | 1/2 |
| Comparisons | 2 | 1/2 | 1/2 | 1/2 | 2/2 | 2/2 |
| Summaries | 2 | 1/2 | 1/2 | 2/2 | 2/2 | 2/2 |
| Follow-ups | 2 | 2/2 | 2/2 | 2/2 | 2/2 | 2/2 |
| Ambiguous without antecedent | 0 (+2 unresolved cases) | N/A | N/A | N/A | N/A | Not answer-evaluated |
| Missing evidence | 0 (+2 absent-fact cases) | N/A | N/A | N/A | N/A | Not answer-evaluated |

## Other measurements and limits

Development mean evidence-fragment coverage was 99.28% at 4 and 99.64% at 6/8/adaptive. Held-out coverage was 77.08%, 83.33%, 87.50%, and 87.50% respectively. Multi-route coverage is a separate field; an any-route hit can pass with incomplete multi-page evidence.

There were no exact duplicates removed or context-budget drops on these snapshot runs. Mean score-qualified lexical candidate counts were 16.98 (development) and 9.42 (held-out), before caps; mean pairwise retained-content redundancy is recorded per row/category. Many candidates have weak lexical overlap, so increased coverage is not proof that all extra chunks are useful.

Single-pass keyword timings were roughly 0.5–0.7 ms mean and 1.0–1.3 ms P95 for the four policies. I do not interpret small timing differences as speed improvements; ordering, warm-up, and machine noise dominate these measurements. My local JSON reports retain exact values, selected source IDs/routes, coverage, counts, redundancy, and review placeholders under `artifacts/rag/`.

The offline comparisons above do not measure live semantic behavior or generated answers. Automated answer scores and formal human rubric review remain unset. The held-out sample is only eight answerable questions, and this initial report does not provide statistical confidence of a production gain.

## Subsequently approved production-index smoke test

The historical reserved-cost measurements below predate the cache-write surcharge safeguard. Current runs reserve generation input at $2.50/M rather than $2/M, so new reservation ceilings can be higher for the same input. These reported historical values are not recomputed invoices or promises of the current guard's ceiling.

I ran one explicitly approved smoke test against my production AWS corpus and S3 vector index using the local evaluator, not the deployed browser/chat endpoint. The complete index metadata matched the frozen 56-chunk corpus both before and after the test. Its corpus SHA-256 was `00db4dc46529ee151f5f85be241ea758fe68b66c1a6ea553e22f0e72e1550ce2`, so this is **not the same corpus snapshot** as my earlier offline comparison.

I selected `test-followup-teaching`: the previous question establishes my Applied Data Science teaching at Clemson, and the follow-up asks which tool automated grading. Fixed 4 / 0.65 hybrid retrieval found the expected `nbgrader` evidence; independent Hit@3 and hit at 4 both passed. Six qualifying merge candidates yielded four retained chunks with two duplicates removed. Retrieval took 717 ms; retrieval plus answer generation took 2.66 seconds. My configured generation model produced a completed answer identifying nbgrader, using 1,177 input and 49 output tokens.

The shared $0.05 whole-run guard covered two embedding requests and one answer request. Its conservative reserved cost upper bound was **$0.023964**. Generation's standard-rate estimate from reported usage was **$0.002942**, excluding embeddings, AWS reads, taxes, and any cache discount. The reservation is a pessimistic guard, not the final invoice. Paid judging was not run. My local artifact is `artifacts/rag/comparison-heldout-live-runtime-k4.json`.

An initial attempt failed at AWS TLS certificate validation before any OpenAI call (reserved OpenAI cost zero). I retried using Node's system certificate trust store, with TLS verification still enabled. Neither attempt changed production settings, data, index contents, or deployments. This successful single question is an integration smoke test, not a 4/6/8 quality comparison or a reason to promote adaptive retrieval.

## Subsequently approved live held-out retrieval matrix

I also ran all 12 held-out cases against the same 56-chunk production snapshot, with full pre/post index metadata verification. I compared every fixed limit and adaptive policy across keyword, pure semantic, and actual hybrid modes. This completed run made 96 embedding requests, **no generation or judge requests**, and reserved an OpenAI cost upper bound of **$0.000617** against a $0.005 run cap. Together with the smoke test, my two successful runs reserved less than $0.025. The artifact is `artifacts/rag/comparison-heldout-adaptive-live.json`.

| Live mode | Independent Hit@3 | Hit at 4 | Hit at 6 | Hit at 8 | Adaptive hit |
|---|---|---|---|---|---|
| Keyword on frozen published corpus | 3/8 | 4/8 | 4/8 | 4/8 | 4/8 |
| Pure semantic | 3/8 | 5/8 | 6/8 | 6/8 | 6/8 |
| Runtime hybrid | 4/8 | 5/8 | 6/8 | 6/8 | 6/8 |

The four absent-fact/ambiguous cases remain in the run but not the positive-hit denominator; I did not evaluate their generated refusals. My actual hybrid category results were:

| Category | Hit at 4 | Hit at 6 | Hit at 8 | Adaptive |
|---|---|---|---|---|
| Paraphrase | 2/2 | 2/2 | 2/2 | 2/2 |
| Comparison | 1/2 | 1/2 | 1/2 | 1/2 |
| Summary | 1/2 | 2/2 | 2/2 | 2/2 |
| Follow-up | 1/2 | 1/2 | 1/2 | 1/2 |

Mean retained hybrid chunks were 3.42 at fixed 4, 4.50 at fixed 6, 5.08 at fixed 8, and 3.83 for adaptive. Fixed hybrid mean retrieval latency was 449, 519, and 460 ms respectively; P95 was 579, 1,095, and 754 ms. Adaptive reused already measured query/k results in this run: its approximately 1 ms mean is a **cached harness measurement**, not a production latency gain. All cached rows are labelled in the artifact.

My live result provides no evidence that 8 improves retrieval coverage over 6 on this small set; the extra coverage at 6 over 4 came from one summary. Adaptive matched 6/8 while retaining fewer chunks. I still retain fixed 4/0.65 pending comparative generated-answer and refusal review. The published 56-chunk corpus differs from the offline 43-chunk corpus, so differences between those tables are not a like-for-like regression or quality comparison.

My recommendation is to **retain fixed 4 / 0.65**. Adaptive shows a useful offline coverage/cost hypothesis worth an approved balanced answer-evaluation pilot. It is not ready for production promotion based on these results alone. My [evaluation protocol](RAG_EVALUATION.md) defines the rubric, paid-run boundaries, limitations, and promotion checks.
