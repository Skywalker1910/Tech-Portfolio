"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/arcade/policy";
import type { LeaderboardEntry } from "@/lib/arcade/repository";
import type { CompletedRun } from "@/lib/arcade/runs";

export type FinishedRun = CompletedRun & { gameRunId:string; seed:number; version:string; ticket:string };
const basePath = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Tech-Portfolio" : "";
const countryNames = new Map(COUNTRIES.map(country => [country.code,country.name]));

export default function ArcadeLeaderboard({ refreshKey, onConfigured }:{ refreshKey:number; onConfigured:(configured:boolean)=>void }) {
  const [entries,setEntries] = useState<LeaderboardEntry[]>([]);
  const [configured,setConfigured] = useState(false);
  const [message,setMessage] = useState("");
  useEffect(() => {
    let live=true;
    if (basePath) { onConfigured(false); return; }
    fetch("/api/arcade/leaderboard").then(async response => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (live) { setMessage(""); setConfigured(data.configured === true); onConfigured(data.configured === true); setEntries(Array.isArray(data.entries)?data.entries:[]); }
    }).catch(() => { if (live) setMessage("Public rankings are temporarily unavailable."); });
    return () => { live=false; };
  },[onConfigured,refreshKey]);

  return <section aria-labelledby="leaderboard-title" className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="leaderboard-title" className="text-xl font-semibold">Public leaderboard</h2><span className="text-xs text-[var(--muted)]">Alien Invasion · Top 10</span></div>
    <p className="mt-2 text-xs text-[var(--muted)]">Gaming names and chosen country flags. Scores are community submissions, without replay verification.</p>
    {!configured && !message && <p className="mt-4 text-sm text-[var(--muted)]">Public rankings are coming soon. The leaderboard inside the game saves scores on this device.</p>}
    {configured && entries.length===0 && <p className="mt-4 text-sm text-[var(--muted)]">No public scores yet. Fly the first mission.</p>}
    {configured && entries.length>0 && <ol className="mt-4 divide-y divide-[var(--border)]">{entries.map((entry,index) => <li key={entry.id} className="flex items-center gap-3 py-3 text-sm"><span className="w-6 text-[var(--muted)]">{index+1}</span><Image src={`${basePath}/arcade/flags/${entry.country}.png`} alt={countryNames.get(entry.country) || entry.country} title={countryNames.get(entry.country)} width={24} height={16} className="h-4 w-6 object-contain" unoptimized/><span className="min-w-0 flex-1 truncate font-medium">{entry.name}</span><span className="font-mono">{entry.score.toLocaleString()}</span></li>)}</ol>}
    {message && <p role="status" className="mt-3 text-sm text-[var(--muted)]">{message}</p>}
  </section>;
}
