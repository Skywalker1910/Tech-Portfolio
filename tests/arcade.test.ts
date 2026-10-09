import { trustedArcadeOrigin } from "../lib/arcade/http";
import assert from "node:assert/strict";
import { test } from "node:test";
import { GAME_VERSION, validateName, validateCountry, validateRunIdentity } from "../lib/arcade/policy";
import { reviewResult } from "../lib/arcade/moderation";
import { issueRun, verifyRun, validateCompletedRun } from "../lib/arcade/runs";
import { scoreKey, scoreRecords, saveScore } from "../lib/arcade/repository";
import { publishScore } from "../lib/arcade/submission";

process.env.ARCADE_RUN_SECRET="test-secret-at-least-32-characters-long";
const identity={gameRunId:"123-1",seed:123,version:GAME_VERSION};
test("name limits reject long or invalid names and normalize safely",()=>{
  assert.equal(validateName("x".repeat(20)),"x".repeat(20));
  assert.throws(()=>validateName("x".repeat(21)));
  assert.throws(()=>validateName("<script>"));
  assert.throws(()=>validateName("A\u202eB"));
  assert.equal(validateName("  Nova   Pilot  "),"Nova Pilot");
  assert.equal(validateName("Ｎｏｖａ"),"Nova");
  assert.equal(validateCountry("IN"),"in");
  assert.throws(()=>validateCountry("../us"));
});
test("both name review checks must pass; rejected names are completely masked",()=>{
  assert.equal(reviewResult("Nova",false,'{"appropriate":true}').name,"Nova");
  assert.equal(reviewResult("test_handle",false,'{"appropriate":false}').name,"***********");
  assert.equal(reviewResult("Nova",true,'{"appropriate":true}').name,"****");
  assert.throws(()=>reviewResult("Nova",false,"not JSON"));
  assert.throws(()=>reviewResult("Nova",undefined,'{"appropriate":true}'));
  assert.throws(()=>reviewResult("Nova",false,'{"appropriate":"true"}'));
});
test("run tickets reject modification, expiry, version and timing mismatches",()=>{
  const now=Date.now();
  const token=issueRun(identity,now);
  const ticket=verifyRun(token,now);
  assert.equal(ticket.seed,123);
  assert.throws(()=>verifyRun(token.slice(0,-1)+"!",now));
  assert.throws(()=>verifyRun(token,now+4*60*60_000));
  assert.throws(()=>validateRunIdentity({...identity,version:"0.0.1"}));
  const body={...identity,score:100,level:1,wave:1,kills:2,ticks:1200,duration:20};
  assert.equal(validateCompletedRun(body,ticket,now+21_000).score,100);
  assert.equal(validateCompletedRun({...body,score:0},ticket,now+21_000).score,0);
  assert.throws(()=>validateCompletedRun({...body,seed:124},ticket,now+21_000));
  assert.throws(()=>validateCompletedRun(body,ticket,now));
  assert.throws(()=>validateCompletedRun({...body,score:NaN},ticket,now+21_000));
});
test("public score records contain only the reviewed handle and expire together",()=>{
  const now=Date.now();
  const ticket=verifyRun(issueRun(identity,now),now);
  const run={score:100,level:1,wave:1,kills:2,ticks:1200,duration:20};
  const review=reviewResult("unsafe_handle",false,'{"appropriate":false}');
  const records=scoreRecords(ticket,run,review,"in",now);
  assert.equal(records.result.name,"*************");
  assert(!JSON.stringify(records).includes("unsafe_handle"));
  assert.equal(records.marker.expiresAt,records.result.expiresAt);
  assert(scoreKey(200,"2026-01-01",ticket.id)<scoreKey(100,"2026-01-01",ticket.id));
  assert.equal(records.entry.verification,"unverified");
});
test("failed moderation prevents writes; rejected names reach storage only as masks",async()=>{
  const now=Date.now();
  const body={...identity,name:"test_handle",country:"in",publish:true,ticket:issueRun(identity,now-30_000),score:100,level:1,wave:1,kills:2,ticks:1200,duration:20};
  let writes=0;
  const save:typeof saveScore = async(ticket,run,review,country)=>{
    writes++;
    assert.equal(review.name,"***********");
    return scoreRecords(ticket,run,review,country).entry;
  };
  await assert.rejects(()=>publishScore(body,{reviewName:async()=>{throw new Error("provider unavailable");},saveScore:save}));
  assert.equal(writes,0);
  await publishScore(body,{reviewName:async(name)=>reviewResult(validateName(name),false,'{"appropriate":false}'),saveScore:save});
  assert.equal(writes,1);
  await assert.rejects(()=>publishScore({...body,name:"x".repeat(21)},{reviewName:async()=>{throw new Error("must not call");},saveScore:save}));
  assert.equal(writes,1);
});

test("production arcade writes trust explicit portfolio origins behind Amplify, not internal or forwarded hosts",()=>{
  assert(trustedArcadeOrigin("https://www.adityamore.dev","http://localhost:3000","production"));
  assert(!trustedArcadeOrigin("https://attacker.example","http://localhost:3000","production"));
  assert(!trustedArcadeOrigin("http://localhost:3000","http://localhost:3000","production"));
  assert(!trustedArcadeOrigin(null,"https://www.adityamore.dev","production"));
  assert(trustedArcadeOrigin("http://localhost:3000","http://localhost:3000","development"));
});
