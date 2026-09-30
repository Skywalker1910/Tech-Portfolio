import assert from "node:assert/strict";
import test from "node:test";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { runAdminEvaluation, storedEvaluationReport } from "../lib/rag/admin-evaluation";
import { evaluationClaimCommand } from "../lib/rag/evaluation-store";
import { POST, GET } from "../app/api/admin/rag/evaluation/route";
import { buildPortfolioChunks } from "../lib/rag/knowledge";
import { EVALUATION_PRICING } from "../lib/rag/evaluation-pricing";

const corpus=buildPortfolioChunks();
const fixtureClient = new OpenAI({apiKey:"synthetic-test-key",maxRetries:0});

test("admin endpoints require authentication, reject unapproved/cross-origin paid runs",async()=>{
  const prior=process.env.ADMIN_KEY; process.env.ADMIN_KEY="synthetic-admin-key";
  try {
    assert.equal((await GET(new NextRequest("http://localhost/api/admin/rag/evaluation"))).status,401);
    const send=(body:unknown,origin?:string)=>POST(new NextRequest("http://localhost/api/admin/rag/evaluation",{method:"POST",headers:{"x-admin-key":"synthetic-admin-key","Content-Type":"application/json",...(origin?{origin}: {})},body:JSON.stringify(body)}));
    assert.equal((await send({action:"run",preset:"retrieval",approved:false})).status,400);
    assert.equal((await send({action:"dry-run",preset:"retrieval"},"https://attacker.invalid")).status,403);
    assert.equal((await send({action:"dry-run",preset:"unknown"})).status,400);
    const dry=await send({action:"dry-run",preset:"answers"}); assert.equal(dry.status,200);
    const {plan}=await dry.json();assert.equal(plan.budgetUsd,.05);assert.equal(plan.dryRun,true);
    assert.deepEqual(plan.topK,[4,6,8]);assert.equal(plan.independentHitK,3);
  } finally { if(prior===undefined)delete process.env.ADMIN_KEY;else process.env.ADMIN_KEY=prior; }
});

test("distributed claim atomically guards global lease, cooldown and request replay",()=>{
  const command=evaluationClaimCommand("fixture",1000000);
  const operations=command.input.TransactItems!;
  assert.equal(operations.length,2);
  assert.equal(operations[0].Put?.ConditionExpression,"attribute_not_exists(pk)");
  assert.match(operations[1].Update!.ConditionExpression!,/leaseUntil < :now/);
  assert.match(operations[1].Update!.ConditionExpression!,/nextAllowedAt < :now/);
  assert.equal(operations[1].Update!.ExpressionAttributeValues![":lease"],1120000);
});

test("live retrieval comparison verifies frozen index twice and labels cached reuse",async()=>{
  let verified=0;let searches=0;
  const report=await runAdminEvaluation("retrieval","dev-followup-movie",{client:fixtureClient,pricingNow:Date.parse("2026-09-30"),
    corpus:async()=>corpus,verify:async()=>{verified++;},search:async(_q,k)=>{searches++;return corpus.slice(0,k).map(c=>({...c,distance:.2}));}});
  assert.equal(report.state,"complete");assert.equal(report.indexVerified,true);assert.equal(verified,2);
  assert.equal(searches,12);assert.equal(report.paidCalls,12);assert.equal(report.rows.length,36);
  assert.equal(report.rows.filter(r=>r.mode==="runtime-hybrid").every(r=>r.semanticRequestReused),true);
  assert.equal(report.rows.filter(r=>r.policy==="4").every(r=>r.requestedK===4),true);
  assert.ok(report.reservedMaximumUsd<=.05);
});

test("index drift prevents any paid request",async()=>{
  let searches=0;
  const report=await runAdminEvaluation("retrieval","dev-career",{client:fixtureClient,pricingNow:Date.parse("2026-09-30"),corpus:async()=>corpus,
    verify:async()=>{throw new Error("Index/corpus drift: synthetic");},search:async()=>{searches++;return [];}});
  assert.equal(report.state,"incomplete");assert.equal(report.paidCalls,0);assert.equal(searches,0);
  assert.match(report.stopReason!,/index differ/);
});

test("answer evaluation bounds spending and stores no answer text or provider errors",async()=>{
  let calls=0;
  const client={responses:{create:async()=>{calls++;return {output_text:"synthetic private answer",status:"completed",usage:{input_tokens:100,output_tokens:20}};}}} as unknown as OpenAI;
  const report=await runAdminEvaluation("answers","dev-followup-movie",{client,pricingNow:Date.parse("2026-09-30"),corpus:async()=>corpus,
    verify:async()=>{},search:async(_q,k)=>corpus.slice(0,k).map(c=>({...c,distance:.2}))});
  assert.ok(calls>=1);assert.ok(report.reservedMaximumUsd<=.05);assert.ok(report.rows.some(r=>r.answer));
  const stored=JSON.stringify(storedEvaluationReport(report));
  assert.ok(!stored.includes("synthetic private answer"));assert.ok(!stored.includes("instructions"));
  assert.ok(!stored.includes("synthetic-test-key"));
});

test("registered generation reservation covers the published cache-write surcharge",()=>{
  assert.equal(EVALUATION_PRICING["gpt-5.6-terra"].reservationInputPerMillion,2.5);
});
