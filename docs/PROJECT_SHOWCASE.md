# Project showcase

My About page and Projects cards show **captured deployed interfaces**, not animated illustrations pretending to be my products. Captures are local, compressed WebP assets, so visiting my portfolio does not embed or repeatedly load third-party application pages. A click explicitly opens the linked live app.

## Capture manifest — September 30, 2026

| Project | Captured screen | Motion |
|---|---|---|
| BB8 Co-Pilot x Tech Portfolio | Public About page with chat shell open; no prompt submitted | Real scrolling frames |
| Movie Recommendation Engine | Public product landing page | Real scrolling frames |
| Neural Log | Public sign-in; dashboard requires authentication | Still image |
| BB-8 Transformer | Public CPU playground; no inference request | Real scrolling frames |
| FIFA platform / agents | Public URL returned Railway Not Found | No substitute or fake dashboard |
| Research / other projects | No verified hosted interface | Explicit implementation/research state |

The loops are short sequences of actual screenshot frames, not full interactive screen recordings or a promise of current live availability. Public screens can change after capture. I keep capture date, source URL and caption in `lib/project-presentation.ts`; assets live in `public/project-previews/`. Neural Log's authentication screen is deliberately labelled instead of implying its private dashboard was captured. To showcase authenticated workflows later, I need reviewed, sanitized demo recordings without personal account data.

Only exact, allowlisted HTTPS roots receive a known capture. Unknown projects/changed routes do not borrow another application's media. The reusable preview component is shared by the About rows, project grid and expanded project details. Animated media activates only while visible, switches back to the poster offscreen, has a pause control, and respects reduced-motion preferences. Images lazy-load; motion files currently remain below 200 KB each. I use still posters for reduced motion and accessible text when a capture fails.

## Technical narrative and evidence

I separate **implementation**, **measured evaluation**, and **limitations** for every project. Structured `technicalDetails`, `evaluation` and `limitations` fields live in my source-controlled project catalog and survive content validation. About keeps a short one-to-two-sentence introduction alongside each capture; the dedicated Projects page shows technical summaries and metrics, and the expanded project view includes the full methodology and constraints. Numbering stays consistent when I filter the catalog and appears outside card captures, so it never obscures the application preview. Both pages use the same bundled catalog rather than divergent hardcoded lists.

Existing DynamoDB records continue to control their titles, summaries, publication state and links. When new technical fields are absent, the presentation layer adds verified catalog supplements by project ID or exact repository match; explicitly authored empty arrays remain empty. It does not overwrite the admin's prose or mutate the database on page load. After I deliberately publish source-controlled content, the new fields become persisted content. The live knowledge assembler includes technical, evaluation and limitation sections when those fields are published; refreshing their vectors still requires deliberate reindexing. No production data is changed by this documentation/UI update.

### Selected source-backed results

- **Movie recommender:** [research methodology](https://github.com/Skywalker1910/Movies-Recommendation-Engine/blob/main/documents/README.md) specifies temporal partitions, a 45,433-title catalog and qualifying-user versus ranking protocols. FunkSVD RMSE/MAE 0.7600/0.5627 applies to 200 qualifying users; user-mean SVD has better NDCG@10 (0.1123 versus 0.0851). TF-IDF Precision@10 0.699 uses a genre-overlap proxy on 100 seeds, not human relevance judgments. [NeuMF v2](https://github.com/Skywalker1910/Movies-Recommendation-Engine/blob/main/scripts/RETRAINING_ANALYSIS.md) reports validation RMSE 0.8543 as a separate experiment, not a measured deployment result.
- **Transformer:** [training results](https://github.com/Skywalker1910/BB-8/blob/main/docs/training_results.md) scope character-model perplexity to tokenizer/stride. The [grounded pilot](https://github.com/Skywalker1910/BB-8/blob/main/docs/grounded_results_v005.md) passed content-plus-citation checks on 16/72 answerable cases despite validation perplexity 1.0262; it was not promoted. The public playground serves the small Shakespeare character model, not that LoRA adapter or my portfolio co-pilot.
- **Portfolio RAG:** [my evaluation report](RAG_EVALUATION_RESULTS.md) distinguishes legacy lexical evidence Hit@3, live held-out retrieval coverage and generated-answer quality. Counts and scores are dated snapshots, not dynamic production accuracy claims.
- **Neural Log / FIFA:** activity aggregations, XP ledgers, result-based scoring and agent metadata are product/data-engineering capabilities. I do not invent predictive accuracy or calibrated confidence figures.
- **Skynet:** the source's LightGBM implementation specifies chronological validation, MAE and saved feature metadata; scaffolds and an unverified numerical MAE are explicitly distinguished from complete evaluated forecasts.

The capture script only reads public pages through a fresh browser session; it never logs in, submits forms or invokes inference. Its raw browser profiles/captures are ignored and are not release assets. Regression tests check capture allowlisting, compressed animated frames, technical-data validation, scoped metrics and preservation of admin content. No API keys, visitor data, private activity screens or chat transcripts are included.
