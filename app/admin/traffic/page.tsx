"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Eye, Gauge, Laptop, Loader2, MapPin, MonitorSmartphone, RefreshCw, Repeat2, Route, Search, Users } from "lucide-react";

type AudienceSegment = "unclassified"|"recruiter"|"hiring-manager"|"technical-peer"|"student"|"general";
type ActivityEntry = { path:string; occurredAt:string };
type Visit = {
  id:string;
  visitorId:string;
  visitorKey:string;
  visitId:string;
  visitNumber:number;
  startedAt:string;
  lastActivityAt:string;
  pageViews:number;
  firstPath:string;
  lastPath:string;
  location?:{ countryCode:string|null; region:string|null };
  device?:{ type:string; os:string; browser:string };
  viewport:string;
  source?:{ category:string; host:string|null }|null;
  audienceSegment:AudienceSegment;
  activities:ActivityEntry[];
};
type Breakdown = { label:string; count:number; averageEngagementMs:number };
type PageMetric = { path:string; views:number; uniques:number; averageEngagementMs:number };
type Report = {
  daily:{ day:string; views:number; uniques:number; visits:number; engagementMs:number; engagedViews:number }[];
  pages:PageMetric[];
  visits:Visit[];
  breakdowns:{ devices:Breakdown[]; operatingSystems:Breakdown[]; browsers:Breakdown[]; viewports:Breakdown[]; locations:Breakdown[]; regions:Breakdown[]; sources:Breakdown[] };
  totals:{ views:number; uniques:number; visitors:number; visits:number; returningVisits:number; averageEngagementMs:number; journeyCoverage:number };
};

const segmentOptions:{ value:AudienceSegment; label:string }[] = [
  { value:"unclassified", label:"Unclassified" },
  { value:"recruiter", label:"Recruiter" },
  { value:"hiring-manager", label:"Hiring manager" },
  { value:"technical-peer", label:"Technical peer" },
  { value:"student", label:"Student" },
  { value:"general", label:"General visitor" },
];

function formatDuration(milliseconds: number) {
  if (!milliseconds) return "—";
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, { weekday:"short", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"2-digit", second:"2-digit", timeZoneName:"short" }).format(date);
}

function countryName(code: string | null | undefined) {
  if (!code || code === "Unknown") return "Location unavailable";
  try { return new Intl.DisplayNames(["en"], { type:"region" }).of(code) ?? code; }
  catch { return code; }
}

function Stat({ label, value, detail, icon:Icon }:{ label:string; value:string|number; detail:string; icon:typeof Eye }) {
  return <article className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><span className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-orange-500/5"/><Icon size={17} className="text-orange-500"/><p className="mt-5 text-3xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs font-medium text-[var(--text)]">{label}</p><p className="mt-1 text-[10px] text-[var(--sub-muted)]">{detail}</p></article>;
}

function Insight({ label, value, detail, icon:Icon }:{ label:string; value:string; detail:string; icon:typeof Laptop }) {
  return <div className="flex items-start gap-3 rounded-xl bg-[var(--tag-bg)] p-4"><div className="mt-0.5 rounded-lg bg-orange-500/10 p-2 text-orange-500"><Icon size={14}/></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sub-muted)]">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{detail}</p></div></div>;
}

function BreakdownCard({ title, items, icon:Icon, formatLabel=(value)=>value }:{ title:string; items:Breakdown[]; icon:typeof Laptop; formatLabel?:(value:string)=>string }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center gap-2"><Icon size={15} className="text-orange-500"/><h2 className="text-sm font-semibold">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.slice(0,6).map((item)=><div key={item.label}><div className="flex items-center justify-between gap-4 text-xs"><span className="min-w-0 truncate text-[var(--muted)]">{formatLabel(item.label)}</span><span className="flex shrink-0 items-center gap-2"><span className="font-semibold tabular-nums">{item.count}</span><span className="w-9 text-right text-[10px] text-[var(--sub-muted)]">{formatDuration(item.averageEngagementMs)}</span></span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--tag-bg)]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{width:`${Math.max(5,item.count/max*100)}%`}}/></div></div>) : <p className="py-6 text-center text-xs text-[var(--muted)]">No measurements yet.</p>}</div></section>;
}

function VisitCard({ visit, updating, onSegmentChange }:{ visit:Visit; updating:boolean; onSegmentChange:(visit:Visit, segment:AudienceSegment)=>void }) {
  const location = [visit.location?.region, countryName(visit.location?.countryCode)].filter((part) => part && part !== "Location unavailable").join(", ") || "Location unavailable";
  const device = visit.device ? `${visit.device.type} · ${visit.device.os} · ${visit.device.browser}` : "Device unavailable";
  return <details className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 open:shadow-sm">
    <summary className="cursor-pointer list-none"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Visit #{visit.visitNumber}</span><span className="font-mono text-xs text-[var(--muted)]">Visitor {visit.visitorId}</span></div><p className="mt-2 text-sm font-semibold">{formatTimestamp(visit.startedAt)}</p></div><div className="flex items-center gap-4 text-xs text-[var(--muted)]"><span className="flex items-center gap-1.5"><Route size={13}/>{visit.pageViews} page{visit.pageViews === 1 ? "" : "s"}</span><span className="rounded-full border border-[var(--border)] px-2 py-1 group-open:bg-[var(--tag-bg)]">Details</span></div></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]"><span className="flex items-center gap-1.5"><MapPin size={13}/>{location}</span><span className="flex items-center gap-1.5"><MonitorSmartphone size={13}/>{device}</span><span>{visit.viewport}</span><span>{visit.source?.category ?? "Source unavailable"}</span></div></summary>
    <div className="mt-5 grid gap-5 border-t border-[var(--border)] pt-4 lg:grid-cols-[1fr_15rem]"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sub-muted)]">Page timeline</p><ol>{visit.activities.length ? visit.activities.map((entry,index)=><li key={`${entry.occurredAt}-${entry.path}-${index}`} className="relative flex gap-3 pb-4 last:pb-0"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500 ring-4 ring-orange-500/10"/><span className="absolute bottom-0 left-[3px] top-3 w-px bg-[var(--border)] last:hidden"/><div className="min-w-0 flex-1"><p className="break-all text-sm font-medium">{entry.path}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-[var(--muted)]"><Clock3 size={10}/>{formatTimestamp(entry.occurredAt)}</p></div></li>) : <p className="text-xs text-[var(--muted)]">Detailed page events are unavailable for this visit.</p>}</ol></div><aside className="rounded-xl bg-[var(--tag-bg)] p-4"><label className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sub-muted)]" htmlFor={`segment-${visit.id}`}>Audience classification</label><select id={`segment-${visit.id}`} value={visit.audienceSegment} disabled={updating || !visit.visitorKey} onChange={(event)=>onSegmentChange(visit,event.target.value as AudienceSegment)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs disabled:opacity-50">{segmentOptions.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select><p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">Manual only. Location and device data never assign this automatically.</p></aside></div>
  </details>;
}

export default function TrafficPage() {
  const [report, setReport] = useState<Report|null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingVisitor, setUpdatingVisitor] = useState("");
  const [days, setDays] = useState(30);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/admin/analytics?days=${days}`, { cache:"no-store" });
    if (response.status === 401) return location.assign("/admin/login");
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error ?? "Could not load traffic.");
    else setReport(body);
    setLoading(false);
  }, [days]);
  useEffect(() => { void load(); }, [load]);
  const max = useMemo(() => Math.max(1, ...(report?.daily.map((entry) => entry.views) ?? [1])), [report]);
  const topDevice = report?.breakdowns.devices[0];
  const topLocation = report?.breakdowns.locations[0];
  const topEngagedPage = report?.pages.slice().sort((left,right)=>right.averageEngagementMs-left.averageEngagementMs)[0];

  const updateSegment = useCallback(async (visit:Visit, segment:AudienceSegment) => {
    setUpdatingVisitor(visit.visitorId);
    const response = await fetch("/api/admin/analytics", { method:"PATCH", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ visitorKey:visit.visitorKey, segment }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error ?? "Could not classify visitor.");
    else setReport((current)=>current ? { ...current, visits:current.visits.map((entry)=>entry.visitorId === visit.visitorId ? { ...entry, audienceSegment:segment } : entry) } : current);
    setUpdatingVisitor("");
  }, []);

  return <div className="mx-auto max-w-7xl p-6 md:p-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-orange-500">Experience intelligence</p><h1 className="mt-2 text-3xl font-semibold">Visitor analytics</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">Cookieless UX measurement for every non-opted-out visit, with optional pseudonymous journeys. Compare device, viewport, geography, source, and engaged time without storing raw IP addresses or precise location.</p></div><div className="flex gap-2"><select value={days} onChange={(event)=>setDays(Number(event.target.value))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select><button onClick={()=>void load()} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5" aria-label="Refresh analytics"><RefreshCw size={15}/></button></div></div>
    {loading ? <div className="flex items-center gap-2 py-20 text-sm text-[var(--muted)]"><Loader2 className="animate-spin" size={16}/> Loading analytics…</div> : error && !report ? <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-600">{error}</div> : report && <>
      {error && <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-600">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Page views" value={report.totals.views} detail="Basic + enhanced measurement" icon={Eye}/><Stat label="Average engaged time" value={formatDuration(report.totals.averageEngagementMs)} detail="Average across measured page views" icon={Clock3}/><Stat label="Returning visits" value={report.totals.returningVisits} detail={`${report.totals.visits} enhanced visits total`} icon={Repeat2}/><Stat label="Journey coverage" value={`${report.totals.journeyCoverage}%`} detail={`${report.totals.visitors} consented browsers`} icon={Gauge}/></div>
      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">What the data suggests</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Directional insights; wait for a meaningful sample before making design decisions.</p></div><Activity size={16} className="text-orange-500"/></div><div className="mt-4 grid gap-3 md:grid-cols-3"><Insight label="Most-used device" value={topDevice?.label ?? "No data"} detail={topDevice ? `${topDevice.count} views · ${formatDuration(topDevice.averageEngagementMs)} average` : "Waiting for measurements"} icon={Laptop}/><Insight label="Top country" value={topLocation ? countryName(topLocation.label) : "No data"} detail={topLocation ? `${topLocation.count} views · ${formatDuration(topLocation.averageEngagementMs)} average` : "Waiting for measurements"} icon={MapPin}/><Insight label="Most engaged page" value={topEngagedPage?.path ?? "No data"} detail={topEngagedPage ? `${formatDuration(topEngagedPage.averageEngagementMs)} average · ${topEngagedPage.views} views` : "Waiting for measurements"} icon={Route}/></div></section>
      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Daily activity</h2><span className="text-[10px] text-[var(--sub-muted)]">Hover for views and engagement</span></div><div className="mt-6 flex h-44 items-end gap-1">{report.daily.map((entry)=><div key={entry.day} className="group relative flex h-full flex-1 items-end"><div className="min-h-1 w-full rounded-t bg-gradient-to-t from-orange-600 to-amber-400 transition group-hover:opacity-80" style={{height:`${Math.max(3,entry.views/max*100)}%`}}/><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white group-hover:block">{entry.day}: {entry.views} views · {formatDuration(entry.engagedViews ? entry.engagementMs/entry.engagedViews : 0)} avg</span></div>)}</div></section>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><BreakdownCard title="Device category" items={report.breakdowns.devices} icon={Laptop}/><BreakdownCard title="Viewport / layout" items={report.breakdowns.viewports} icon={MonitorSmartphone}/><BreakdownCard title="Country" items={report.breakdowns.locations} icon={MapPin} formatLabel={countryName}/><BreakdownCard title="Operating system" items={report.breakdowns.operatingSystems} icon={Activity}/><BreakdownCard title="Browser" items={report.breakdowns.browsers} icon={Search}/><BreakdownCard title="Traffic source" items={report.breakdowns.sources} icon={Route}/></div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"><div className="border-b border-[var(--border)] p-5"><h2 className="text-sm font-semibold">Page performance</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Use views and engaged time together; high traffic with low time can indicate a UX or content mismatch.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-xs"><thead className="bg-[var(--tag-bg)] text-[10px] uppercase tracking-wider text-[var(--sub-muted)]"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Enhanced sessions</th><th className="px-5 py-3 text-right">Avg. engaged</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{report.pages.length ? report.pages.map((page)=><tr key={page.path}><td className="px-5 py-3 font-medium">{page.path}</td><td className="px-5 py-3 text-right tabular-nums">{page.views}</td><td className="px-5 py-3 text-right tabular-nums text-[var(--muted)]">{page.uniques}</td><td className="px-5 py-3 text-right font-semibold tabular-nums">{formatDuration(page.averageEngagementMs)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-10 text-center text-[var(--muted)]">Traffic will appear after visitors browse the site.</td></tr>}</tbody></table></div></section>
      <section className="mt-7"><div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-sm font-semibold">Consented visitor journeys</h2><p className="mt-1 text-xs text-[var(--muted)]">Returning-browser history and audience labels appear only for enhanced analytics.</p></div><span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Users size={13}/>{report.totals.visitors} browsers · newest 100 visits</span></div><div className="space-y-3">{report.visits.length ? report.visits.map((visit)=><VisitCard key={visit.id} visit={visit} updating={updatingVisitor === visit.visitorId} onSegmentChange={(entry,segment)=>void updateSegment(entry,segment)}/>) : <div className="rounded-2xl border border-dashed border-[var(--border)] py-12 text-center text-sm text-[var(--muted)]">No enhanced visitor journeys in this period.</div>}</div></section>
    </>}
  </div>;
}
