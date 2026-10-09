"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { COUNTRIES, NAME_MAX } from "@/lib/arcade/policy";
import type { LeaderboardEntry } from "@/lib/arcade/repository";
import type { CompletedRun } from "@/lib/arcade/runs";

export type FinishedRun = CompletedRun & { gameRunId:string; seed:number; version:string; ticket:string };
const basePath = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Tech-Portfolio" : "";
const countryNames = new Map(COUNTRIES.map(country => [country.code,country.name]));

export default function ArcadeLeaderboard({ completed, suggested, onConfigured }:{ completed:FinishedRun|null; suggested:{name:string; country:string}|null; onConfigured:(configured:boolean)=>void }) {
  const [entries,setEntries] = useState<LeaderboardEntry[]>([]);
  const [configured,setConfigured] = useState(false);
  const [name,setName] = useState("");
  const [country,setCountry] = useState("");
  const [consent,setConsent] = useState(false);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [saved,setSaved] = useState(false);
  useEffect(() => {
    let live=true;
    if (basePath) { onConfigured(false); return; }
    fetch("/api/arcade/leaderboard").then(async response => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (live) { setConfigured(data.configured === true); onConfigured(data.configured === true); setEntries(Array.isArray(data.entries)?data.entries:[]); }
    }).catch(() => { if (live) setMessage("Public rankings are temporarily unavailable."); });
    return () => { live=false; };
  },[onConfigured]);
  useEffect(() => { setSaved(false); setConsent(false); setMessage(""); },[completed?.gameRunId]);
  useEffect(() => { if (suggested) { setName(suggested.name.slice(0,NAME_MAX)); setCountry(suggested.country); } },[suggested]);

  async function publish(event:FormEvent) {
    event.preventDefault();
    if (!completed || !consent || busy || saved) return;
    setBusy(true); setMessage("Checking your gaming name…");
    try {
      const response = await fetch("/api/arcade/leaderboard", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...completed,name,country,publish:true}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to publish. Please try again.");
      setSaved(true);
      setMessage(data.entry.masked ? `Score published. Your public name was masked as ${data.entry.name}.` : `Score published as ${data.entry.name}.`);
      const refreshed = await fetch("/api/arcade/leaderboard");
      if (refreshed.ok) { const next=await refreshed.json(); setEntries(next.entries ?? []); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to publish. Please try again."); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby="leaderboard-title" className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="leaderboard-title" className="text-xl font-semibold">Public leaderboard</h2><span className="text-xs text-[var(--muted)]">Alien Invasion · Top 10</span></div>
    <p className="mt-2 text-xs text-[var(--muted)]">Gaming names and chosen country flags. Scores are community submissions, without replay verification.</p>
    {!configured && <p className="mt-4 text-sm text-[var(--muted)]">Public rankings are coming soon. The leaderboard inside the game saves scores on this device.</p>}
    {configured && entries.length===0 && <p className="mt-4 text-sm text-[var(--muted)]">No public scores yet. Fly the first mission.</p>}
    {configured && entries.length>0 && <ol className="mt-4 divide-y divide-[var(--border)]">{entries.map((entry,index) => <li key={entry.id} className="flex items-center gap-3 py-3 text-sm"><span className="w-6 text-[var(--muted)]">{index+1}</span><Image src={`${basePath}/arcade/flags/${entry.country}.png`} alt={countryNames.get(entry.country) || entry.country} title={countryNames.get(entry.country)} width={24} height={16} className="h-4 w-6 object-contain" unoptimized/><span className="min-w-0 flex-1 truncate font-medium">{entry.name}</span><span className="font-mono">{entry.score.toLocaleString()}</span></li>)}</ol>}
    {configured && completed && completed.score>0 && <form onSubmit={publish} className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
      <p className="text-sm font-semibold">Publish your score: {completed.score.toLocaleString()}</p>
      {!completed.ticket && <p className="text-xs text-[var(--muted)]">This round could not register for public scoring. Start another round to try again.</p>}
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Gaming name<input aria-label="Gaming name" required maxLength={NAME_MAX} pattern="[A-Za-z0-9 _\.\-]+" value={name} onChange={event=>setName(event.target.value)} autoComplete="off" className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"/><span className="mt-1 block text-xs text-[var(--muted)]">{name.length}/{NAME_MAX} · Fictional names welcome</span></label><label className="text-sm">Country<select aria-label="Country" required value={country} onChange={event=>setCountry(event.target.value)} className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"><option value="">Choose a country</option>{COUNTRIES.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label></div>
      <p className="text-xs leading-relaxed text-[var(--muted)]">Your gaming name is sent to OpenAI for an appropriateness check. Inappropriate names are masked before storage. If the check is unavailable, the score is not published.</p>
      <label className="flex items-start gap-2 text-xs text-[var(--muted)]"><input type="checkbox" required checked={consent} onChange={event=>setConsent(event.target.checked)} className="mt-0.5"/>Publish my reviewed gaming name, selected country flag, score, and level on the public leaderboard for up to 180 days.</label>
      <button type="submit" disabled={!completed.ticket || !consent || busy || saved} className="cta-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">{saved?"Published":busy?"Checking and publishing…":"Publish score"}</button>
    </form>}
    {message && <p role="status" className="mt-3 text-sm text-[var(--muted)]">{message}</p>}
  </section>;
}
