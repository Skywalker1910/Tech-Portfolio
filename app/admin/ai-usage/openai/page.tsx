"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, CircleAlert, Coins, Database, ExternalLink, Gauge, Loader2, RefreshCw, Sparkles } from "lucide-react";

type Report = {
  configured:true;
  scope:{ type:"project"|"organization"; projectId:string|null };
  generatedAt:string;
  days:number;
  totals:{ requests:number; completionRequests:number; embeddingRequests:number; inputTokens:number; outputTokens:number; cachedInputTokens:number; totalTokens:number; costUsd:number };
  daily:Array<{ day:string; completionRequests:number; embeddingRequests:number; inputTokens:number; outputTokens:number; cachedInputTokens:number; costUsd:number }>;
  models:Array<{ model:string; type:"completion"|"embedding"; requests:number; inputTokens:number; outputTokens:number; totalTokens:number }>;
  costItems:Array<{ label:string; costUsd:number }>;
};

const integer = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", minimumFractionDigits:2, maximumFractionDigits:4 });

function Stat({ label, value, detail, icon:Icon }: { label:string; value:string; detail:string; icon:typeof Bot }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sub-muted)]">{label}</p><Icon size={15} className="text-orange-500"/></div><p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{detail}</p></div>;
}

export default function OpenAIUsagePage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report|null>(null);
  const [configured, setConfigured] = useState<boolean|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/openai-usage?days=${days}`, { cache:"no-store" });
      if (response.status === 401) return location.assign("/admin/login");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not load OpenAI usage.");
      if (body.configured === false) {
        setConfigured(false);
        setReport(null);
      } else {
        setConfigured(true);
        setReport(body as Report);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load OpenAI usage.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const maxRequests = Math.max(1, ...(report?.daily.map((entry) => entry.completionRequests + entry.embeddingRequests) ?? [1]));
  return <div className="mx-auto max-w-6xl p-6 md:p-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-orange-500">Model operations</p><h1 className="mt-2 text-3xl font-semibold">OpenAI usage</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">Server-only organization usage, token volume, embedding traffic, and cost data. Use a dedicated OpenAI project ID to isolate this portfolio from other API workloads.</p></div><div className="flex gap-2"><select value={days} onChange={(event)=>setDays(Number(event.target.value))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select><button onClick={()=>void load()} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5" aria-label="Refresh OpenAI usage"><RefreshCw size={15}/></button></div></div>

    {loading ? <div className="flex items-center gap-2 py-20 text-sm text-[var(--muted)]"><Loader2 className="animate-spin" size={16}/> Loading OpenAI usage…</div> : error ? <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-700 dark:text-amber-300"><CircleAlert size={17} className="mt-0.5 shrink-0"/><div><p className="font-semibold">Usage report unavailable</p><p className="mt-1 text-xs leading-relaxed">{error}</p></div></div> : configured === false ? <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><Bot size={20}/></div><div><h2 className="text-base font-semibold">Connect the OpenAI Usage API</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">Add a server-side <code className="rounded bg-[var(--tag-bg)] px-1.5 py-0.5 text-xs">OPENAI_ADMIN_KEY</code> in Amplify. Add <code className="rounded bg-[var(--tag-bg)] px-1.5 py-0.5 text-xs">OPENAI_PROJECT_ID</code> to limit this dashboard to the project used by BB-8. Never expose the Admin API key through a public environment variable.</p><a href="https://developers.openai.com/api/reference/python/resources/admin/subresources/organization/subresources/usage" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">Official Usage API reference <ExternalLink size={12}/></a></div></div></section> : report && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="API requests" value={integer.format(report.totals.requests)} detail={`${integer.format(report.totals.completionRequests)} generation · ${integer.format(report.totals.embeddingRequests)} embedding`} icon={Gauge}/><Stat label="Tokens" value={integer.format(report.totals.totalTokens)} detail={`${integer.format(report.totals.inputTokens)} input · ${integer.format(report.totals.outputTokens)} output`} icon={Sparkles}/><Stat label="Cached input" value={integer.format(report.totals.cachedInputTokens)} detail="Input tokens reported as served from cache" icon={Database}/><Stat label="OpenAI cost" value={usd.format(report.totals.costUsd)} detail={`${report.scope.type === "project" ? "Project-scoped" : "Organization-wide"} · official cost buckets`} icon={Coins}/></div>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold">Daily API activity</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Completion and embedding requests reported by OpenAI.</p></div><span className="text-[10px] text-[var(--muted)]">Updated {new Date(report.generatedAt).toLocaleString()}</span></div><div className="mt-6 flex h-44 items-end gap-1">{report.daily.map((entry)=>{const requests=entry.completionRequests+entry.embeddingRequests;return <div key={entry.day} className="group relative flex h-full flex-1 items-end"><div className="min-h-1 w-full rounded-t bg-gradient-to-t from-orange-600 to-amber-400 transition group-hover:opacity-80" style={{height:`${Math.max(3,requests/maxRequests*100)}%`}}/><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white group-hover:block">{entry.day}: {requests} requests · {usd.format(entry.costUsd)}</span></div>})}</div></section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]"><section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"><div className="border-b border-[var(--border)] p-5"><h2 className="text-sm font-semibold">Usage by model</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">The Admin API reports model-level usage when grouping is available.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-xs"><thead className="bg-[var(--tag-bg)] text-[10px] uppercase tracking-wider text-[var(--sub-muted)]"><tr><th className="px-5 py-3">Model</th><th className="px-5 py-3">Type</th><th className="px-5 py-3 text-right">Requests</th><th className="px-5 py-3 text-right">Tokens</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{report.models.length ? report.models.map((model)=><tr key={`${model.type}-${model.model}`}><td className="px-5 py-3 font-mono text-[11px]">{model.model}</td><td className="px-5 py-3 capitalize text-[var(--muted)]">{model.type}</td><td className="px-5 py-3 text-right tabular-nums">{integer.format(model.requests)}</td><td className="px-5 py-3 text-right tabular-nums">{integer.format(model.totalTokens)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-10 text-center text-[var(--muted)]">No model usage was reported in this period.</td></tr>}</tbody></table></div></section><section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="text-sm font-semibold">Cost categories</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Official organization cost line items.</p><div className="mt-4 space-y-3">{report.costItems.length ? report.costItems.map((item)=><div key={item.label} className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"><span className="min-w-0 truncate text-xs text-[var(--muted)]">{item.label}</span><span className="text-xs font-semibold tabular-nums">{usd.format(item.costUsd)}</span></div>) : <p className="py-8 text-center text-xs text-[var(--muted)]">No cost was reported in this period.</p>}</div></section></div>

      <div className="mt-5 flex gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4 text-xs leading-relaxed text-[var(--muted)]"><CircleAlert size={15} className="mt-0.5 shrink-0 text-sky-500"/><p>This page reads OpenAI&apos;s organization Usage and Costs APIs with a server-only Admin API key. It does not expose the key to the browser. OpenAI reporting can lag behind live BB-8 activity; the Traffic page contains the portfolio&apos;s own near-real-time BB-8 request and session counters.</p></div>
    </>}
  </div>;
}
