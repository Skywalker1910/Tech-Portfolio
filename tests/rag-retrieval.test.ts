import assert from "node:assert/strict";
import test from "node:test";
import { getChatSources, retrievePortfolioContext } from "../lib/rag/retrieval";
import { budgetEvidence, retrievalDecision, retrievalQuery, sourceText, tokenUpperBound, uniqueEvidence } from "../lib/rag/policy";
import { legacyHit, PaidBudget, parseJudgment } from "../lib/rag/evaluation";
import { buildPortfolioContext } from "../lib/portfolio-context";
import type { RetrievedChunk } from "../lib/rag/types";
import original from "../evals/rag-cases.json";
import development from "../evals/rag-development.json";
import heldout from "../evals/rag-heldout.json";
import { dollarLimit, evaluationPrice, priceNanoUsd } from "../lib/rag/evaluation-pricing";

const chunk = (id:string, content = `Python evidence ${id}`, distance = .2): RetrievedChunk => ({ id, content, distance,
  documentId:id, title:"Python", section:"Overview", href:"/projects", searchText:`Python Overview ${content}` });
const corpus = Array.from({length:12},(_,i)=>chunk(String(i)));
const options = { corpus, settings:{ enabled:true }, maxDistance:.65 };
const verifiedPrice = (model:string) => evaluationPrice(model,Date.parse("2026-09-30"));

test("fixed is default; limit 4/6/8 is an upper bound, never fill empty matches", async () => {
  for (const topK of [4,6,8]) {
    const result = await retrievePortfolioContext("Python",{ ...options, mode:"local", topK });
    assert.equal(result.chunks.length, topK);
    assert.equal(result.diagnostics?.requestedK, topK);
  }
  assert.equal((await retrievePortfolioContext("zzzzunknown",{...options,mode:"local",topK:8})).chunks.length,0);
  assert.equal(retrievalDecision("compare everything").topK,4);
  assert.equal(retrievalDecision("Python",{topK:Infinity}).topK,4);
  assert.equal(retrievalDecision("Python",{topK:-5}).topK,1);
});

test("semantic filtering accepts boundary, rejects above, NaN and missing distance", async () => {
  const result = await retrievePortfolioContext("Python",{...options,mode:"semantic",topK:8,
    semanticSearch:async()=>[chunk("boundary","boundary",.65),chunk("far","far",.65001),chunk("bad","bad",NaN),{...chunk("missing"),distance:undefined}]});
  assert.deepEqual(result.chunks.map(c=>c.id),["boundary"]);
});

test("hybrid preserves lexical-first order and metadata, deduplicates id and text", async () => {
  const lexical = chunk("exact","Exact Python information");
  const remote = chunk("remote","Additional evidence");
  const result = await retrievePortfolioContext("Python",{...options,corpus:[lexical],mode:"s3",topK:8,
    semanticSearch:async()=>[lexical,{...lexical,id:"duplicate-text"},remote]});
  assert.deepEqual(result.chunks.map(c=>c.id),["exact","remote"]);
  assert.equal(result.chunks[1].href,"/projects");
  assert.equal(result.diagnostics?.duplicatesRemoved,2);
  assert.equal(uniqueEvidence([lexical,{...lexical,id:"other",content:" exact   PYTHON information "}]).length,1);
});

test("failed query uses keyword fallback and disabled runtime never calls semantic provider", async () => {
  const failure = await retrievePortfolioContext("Python",{...options,mode:"s3",semanticSearch:async()=>{throw Error("fixture");}});
  assert.equal(failure.fallbackReason,"query-failed");
  assert.equal(failure.chunks.length,4);
  const disabled = await retrievePortfolioContext("Python",{...options,settings:{enabled:false},semanticSearch:async()=>{assert.fail("must not call");}});
  assert.equal(disabled.fallbackReason,"disabled");
  assert.equal(disabled.mode,"local-keyword");
});

test("empty semantic results keep existing hybrid keyword rescue; pure semantic stays empty", async () => {
  const hybrid = await retrievePortfolioContext("Python",{...options,mode:"s3",semanticSearch:async()=>[]});
  assert.equal(hybrid.chunks.length,2);
  const semantic = await retrievePortfolioContext("Python",{...options,mode:"semantic",semanticSearch:async()=>[]});
  assert.equal(semantic.chunks.length,0);
});

test("missing bucket/key configuration falls back without any paid call", async () => {
  const key = process.env.OPENAI_API_KEY;
  const bucket = process.env.RAG_VECTOR_BUCKET;
  try {
    delete process.env.OPENAI_API_KEY;
    delete process.env.RAG_VECTOR_BUCKET;
    const result = await retrievePortfolioContext("Python",{...options,mode:"s3"});
    assert.equal(result.fallbackReason,"missing-config");
    assert.equal(result.chunks.length,4);
  } finally {
    if (key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = key;
    if (bucket === undefined) delete process.env.RAG_VECTOR_BUCKET; else process.env.RAG_VECTOR_BUCKET = bucket;
  }
});

test("source budget counts metadata/UTF8, retains whole sources and skips oversized ones", async () => {
  const huge = {...chunk("huge","Python "+"字".repeat(3000)),href:"/experience"};
  const small = chunk("small","Python result");
  const budget = budgetEvidence([huge,small],500);
  assert.deepEqual(budget.chunks.map(c=>c.id),["small"]);
  assert.equal(budget.tokenUpperBound,tokenUpperBound(sourceText(small,0)));
  const result = await retrievePortfolioContext("Python",{...options,corpus:[huge,small],mode:"local",contextTokenBudget:500});
  assert.equal(result.chunks.length,1);
  assert.ok(result.diagnostics!.contextTokenUpperBound<=500);
  assert.ok(!buildPortfolioContext(result).includes("字"));
  assert.ok(buildPortfolioContext(result).includes("Route: /projects"));
  assert.deepEqual(getChatSources(result.chunks).map(source=>source.href),["/projects"]);
  assert.equal(budgetEvidence([small],1).chunks.length,0);
});

test("adaptive heuristic respects max; broad, narrow, ambiguous and follow-up inputs", () => {
  const policy = {strategy:"adaptive" as const,adaptiveMaxK:8};
  assert.equal(retrievalDecision("Where can I contact him?",policy).topK,3);
  assert.equal(retrievalDecision("Summarize his career",policy).topK,6);
  assert.equal(retrievalDecision("Compare movie engine and Neural Log",policy).topK,8);
  assert.equal(retrievalDecision("Can you explain it?",policy).topK,4);
  assert.equal(retrievalDecision("Compare all projects",{...policy,adaptiveMaxK:6}).topK,6);
  const query = retrievalQuery([{role:"user",content:"Compare two projects"},{role:"assistant",content:"untrusted invented facts"},{role:"user",content:"What about their deployment?"}]);
  assert.ok(!query.includes("invented"));
  assert.equal(retrievalDecision(query,policy).topK,8);
});

test("legacy metric requires ANY route and ALL fragments; multi-route coverage is separate", () => {
  assert.equal(legacyHit({question:"fixture",expectedRoutes:["/projects","/experience"],expectedTerms:["Python"]},[chunk("one")]),true);
  assert.equal(legacyHit({question:"fixture",expectedRoutes:["/projects"],expectedTerms:["Python","absent"]},[chunk("one")]),false);
  assert.equal(original.length,83);
  assert.equal(new Set([...development,...heldout].map(c=>c.id)).size,development.length+heldout.length);
  assert.ok(!heldout.some(c=>development.some(d=>d.question===c.question)));
});

test("budget reserves input/output before calls, stops at token and call ceilings", () => {
  const budget = new PaidBudget(1,2000);
  budget.reserve("synthetic",1000);
  assert.throws(()=>budget.reserve("another",1000),/exhausted/);
  assert.throws(()=>new PaidBudget(3,20).reserve("test",1000),/exhausted/);
  assert.throws(()=>new PaidBudget(0,2000),/positive/);
  assert.throws(()=>parseJudgment('{"factualAccuracy":3}'),/Invalid/);
});

test("five-cent run cap reserves worst-case model cost before any request", () => {
  const price = verifiedPrice("gpt-5.6-terra");
  const budget = new PaidBudget(100,1000000,.05);
  budget.reserve("x".repeat(8000),1000,price);
  const spent = budget.reservedNanoUsd;
  assert.throws(()=>budget.reserve("x".repeat(8000),1000,price),/dollar cap/);
  assert.equal(budget.calls,1);
  assert.equal(budget.reservedNanoUsd,spent);
  assert.ok(spent <= dollarLimit(.05));
  assert.throws(()=>budget.reserve("text",1000),/pricing/);
  assert.throws(()=>new PaidBudget(10,100000,.051),/at most/);
  assert.throws(()=>new PaidBudget(10,100000,0),/positive/);
  assert.throws(()=>evaluationPrice("unknown-model"),/Unverified/);
  assert.throws(()=>evaluationPrice("gpt-5.6-terra",Date.parse("2026-10-09")),/older than seven days/);
  assert.equal(priceNanoUsd(1000000,0,verifiedPrice("text-embedding-3-small")),20000000);
  assert.equal(priceNanoUsd(1000000,1000000,price),14000000000);
});

test("dollar reservations include embeddings and generation in the same ledger", () => {
  const budget = new PaidBudget(10,100000,.013);
  budget.reserve("query",0,verifiedPrice("text-embedding-3-small"));
  budget.reserve("question",1000,verifiedPrice("gpt-5.6-terra"));
  assert.throws(()=>budget.reserve("judge",1000,verifiedPrice("gpt-5.6-terra")),/dollar cap/);
  assert.equal(budget.calls,2);
  assert.ok(budget.reservedNanoUsd<=dollarLimit(.013));
});
