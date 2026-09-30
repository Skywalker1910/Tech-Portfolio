"use client";
import { useState } from "react";
import type { AdminEvaluationReport } from "@/lib/rag/admin-evaluation";

type Plan={available:boolean;prices:Array<{model:string;inputPerMillion?:number;reservationInputPerMillion?:number;outputPerMillion?:number;verifiedAt?:string;source?:string}>};
export default function RagEvaluationPanel({disabled,onBusy}:{disabled:boolean;onBusy:(busy:boolean)=>void}) {
  const [preset,setPreset]=useState("retrieval");const [caseId,setCaseId]=useState("dev-followup-movie");
  const [plan,setPlan]=useState<Plan|null>(null);const [approved,setApproved]=useState(false);const [busy,setBusy]=useState(false);
  const [report,setReport]=useState<AdminEvaluationReport|null>(null);const [message,setMessage]=useState("");
  async function request(action:string) {
    setBusy(true);onBusy(true);setMessage("");
    try {
      const response=await fetch("/api/admin/rag/evaluation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        action,preset,caseId,approved,budgetUsd:.05,priceRevision:JSON.stringify(plan?.prices),requestId:crypto.randomUUID()})});
      if(response.status===401){location.assign("/admin/login");return;}
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      if(data.plan){setPlan(data.plan);setApproved(false);setReport(null);}if(data.report)setReport(data.report);
    }catch(error){setMessage(error instanceof Error?error.message:"Request failed. Check last-run status before retrying.");}
    finally{setBusy(false);onBusy(false);}
  }
  async function status() {
    try {const response=await fetch("/api/admin/rag/evaluation",{cache:"no-store"});const data=await response.json();
      if(!response.ok)throw new Error(data.error);
      setReport(data.status?.report ?? null);setMessage(data.status?.state==="running"?"Last run is running or interrupted. No automatic retry; its lock lasts two minutes.":"Loaded last stored report (synthetic answer text is not stored).");
    }catch{setMessage("Could not load evaluation status.");}
  }
  return <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
    <h2 className="font-semibold">Evaluate published knowledge</h2>
    <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Run after deliberately updating the index. This reads published content and vectors; it does not reindex or change retrieval settings. Each approved run reserves at most $0.05 in OpenAI API charges. AWS reads/writes and taxes are separate.</p>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <select aria-label="Evaluation preset" disabled={busy||disabled} value={preset} onChange={e=>{setPreset(e.target.value);setPlan(null);setApproved(false);}} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm">
        <option value="retrieval">Retrieval comparison (3 development questions)</option><option value="answers">Answer comparison (1 development question)</option>
      </select>
      {preset==="answers"&&<select aria-label="Synthetic question" value={caseId} disabled={busy||disabled} onChange={e=>{setCaseId(e.target.value);setPlan(null);setApproved(false);}} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm">
        <option value="dev-followup-movie">Follow-up: movie demo</option><option value="dev-career">Career summary</option><option value="dev-paraphrase-movies">Movie architecture paraphrase</option><option value="dev-missing-salary">Missing salary: refusal</option><option value="dev-ambiguous-it">Ambiguous: clarification</option>
      </select>}
      <button disabled={busy||disabled} onClick={()=>void request("dry-run")} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50">Preview (no API calls)</button>
      <button disabled={busy||disabled} onClick={()=>void status()} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-50">Last-run status</button>
    </div>
    {plan&&<div className="mt-4 space-y-3 text-xs">
      <p>Fixed 4 / 6 / 8 and adaptive; independent Hit@3; distance 0.65; source budget 12,000 conservative token units. At most 12 paid calls and 20 seconds. Semantic results are reused across modes/policies: cached timings are not production latency measurements. Answer runs may end before all policies fit the cap; no paid judge is run.</p>
      {plan.prices.map(price=><p key={price.model}>{price.model}: ${price.inputPerMillion ?? "unverified"} input / ${price.outputPerMillion ?? "unverified"} output per million tokens. {price.reservationInputPerMillion&&<>Reservation input ceiling: ${price.reservationInputPerMillion} (cache-write surcharge included). </>}Verified {price.verifiedAt ?? "never"}. {price.source&&<a className="text-orange-500 underline" href={price.source} target="_blank" rel="noreferrer">Official rates</a>}</p>)}
      {!plan.available&&<p className="text-orange-500">Paid execution disabled: check API configuration and refresh rate verification (expires after seven days).</p>}
      <label className="flex gap-2"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)} className="accent-orange-500"/> I approve one paid run with an OpenAI reservation cap of $0.05. A partial/failed run can still cost money.</label>
      <button disabled={!approved||!plan.available||busy||disabled} onClick={()=>void request("run")} className="cta-primary rounded-lg px-4 py-2 text-sm disabled:opacity-50">{busy?"Evaluating…":"Run approved test (≤ $0.05)"}</button>
    </div>}
    {message&&<p role="status" className="mt-4 text-sm text-orange-500">{message}</p>}
    {report&&<div className="mt-5 text-xs">
      <p className="font-semibold">{report.state} · {report.paidCalls} paid requests · ${report.reservedMaximumUsd.toFixed(6)} reserved upper bound · {(report.elapsedMs/1000).toFixed(1)}s</p>
      <p className="mt-2 text-[var(--muted)]">{report.corpusChunks} published chunks · pre/post index verification: {report.indexVerified?"passed":"not completed"}. {report.stopReason}</p>
      <p className="mt-2">Human review not recorded. Review each answer for factual accuracy, groundedness, completeness, relevance and appropriate refusal (0–2 each). Hit is evidence matching, not answer quality. No visitor conversations are used.</p>
      <div className="mt-3 overflow-x-auto"><table className="w-full text-left"><thead><tr>{["Fixture / mode","Policy","Hit@3 / at K","Kept / candidates","Duplicates","Coverage","Retrieval"].map(h=><th className="border-b border-[var(--border)] p-2" key={h}>{h}</th>)}</tr></thead>
        <tbody>{report.rows.map((row,i)=><tr key={i}><td className="p-2">{row.caseId}<br/>{row.mode}</td><td className="p-2">{row.policy}</td><td className="p-2">{row.independentHitAt3===null?"N/A":String(row.independentHitAt3)} / {row.hit===null?"N/A":String(row.hit)}</td><td className="p-2">{row.sourceIds.length} / {row.qualifyingCount}</td><td className="p-2">{row.duplicatesRemoved}</td><td className="p-2">{row.termCoverage===null?"N/A":`${Math.round(row.termCoverage*100)}%`}</td><td className="p-2">{Math.round(row.retrievalMs)}ms {row.semanticRequestReused&&"(cached)"}</td></tr>)}</tbody></table></div>
      {report.rows.filter(row=>row.answer?.text).map((row,i)=><div key={i} className="mt-4 rounded-lg border border-[var(--border)] p-3"><p className="font-semibold">{row.caseId} · {row.policy} · {row.answer!.completed?"completed":"truncated/incomplete"} · {row.answer!.inputTokens ?? "?"} input / {row.answer!.outputTokens ?? "?"} output tokens · {Math.round(row.answer!.latencyMs)}ms</p><p className="mt-2 whitespace-pre-wrap leading-relaxed">{row.answer!.text}</p></div>)}
    </div>}
  </section>;
}
