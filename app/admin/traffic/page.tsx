"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Bot, Clock3, Eye, Gauge, Laptop, Loader2, MapPin, MonitorSmartphone, RefreshCw, Repeat2, Route, Search, Users, Zap } from "lucide-react";

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
  location?:{ countryCode:string|null; country:string|null; region:string|null; regionCode:string|null };
  device?:{ type:string; os:string; browser:string };
  viewport:string;
  source?:{ category:string; host:string|null }|null;
  audienceSegment:AudienceSegment;
  activities:ActivityEntry[];
};
type Breakdown = { label:string; count:number; averageEngagementMs:number };
type CountryCoverage = { label:string; reachVisits:number; consentedViews:number; averageEngagementMs:number };
type PageMetric = { path:string; views:number; uniques:number; averageEngagementMs:number };
type Report = {
  daily:{ day:string; views:number; uniques:number; visits:number; mandatoryVisits:number; mandatoryVisitors:number; chatOpens:number; chatSessions:number; chatRequests:number; engagementMs:number; engagedViews:number }[];
  pages:PageMetric[];
  visits:Visit[];
  breakdowns:{ devices:Breakdown[]; operatingSystems:Breakdown[]; browsers:Breakdown[]; viewports:Breakdown[]; locations:Breakdown[]; regions:Breakdown[]; locationViews:Breakdown[]; regionViews:Breakdown[]; sources:Breakdown[]; events:Breakdown[] };
  chat:{ opens:number; sessions:number; requests:number; successfulRequests:number; failedRequests:number; successRate:number; averageLatencyMs:number; inputTokens:number; outputTokens:number; totalTokens:number; cachedTokens:number; fallbackRequests:number; fallbackRate:number; actions:Breakdown[]; retrievalModes:Breakdown[]; devices:Breakdown[]; locations:Breakdown[]; regions:Breakdown[]; models:Array<{label:string;requests:number;inputTokens:number;outputTokens:number;totalTokens:number}> };
  totals:{ mandatoryVisits:number; mandatoryVisitors:number; views:number; uniques:number; visitors:number; visits:number; returningVisits:number; averageEngagementMs:number; journeyCoverage:number };
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

function BreakdownCard({ title, items, icon:Icon, formatLabel=(value)=>value, showEngagement=true }:{ title:string; items:Breakdown[]; icon:typeof Laptop; formatLabel?:(value:string)=>string; showEngagement?:boolean }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center gap-2"><Icon size={15} className="text-orange-500"/><h2 className="text-sm font-semibold">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.slice(0,6).map((item)=><div key={item.label}><div className="flex items-center justify-between gap-4 text-xs"><span className="min-w-0 truncate text-[var(--muted)]">{formatLabel(item.label)}</span><span className="flex shrink-0 items-center gap-2"><span className="font-semibold tabular-nums">{item.count}</span>{showEngagement && <span className="w-9 text-right text-[10px] text-[var(--sub-muted)]">{formatDuration(item.averageEngagementMs)}</span>}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--tag-bg)]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{width:`${Math.max(5,item.count/max*100)}%`}}/></div></div>) : <p className="py-6 text-center text-xs text-[var(--muted)]">No measurements yet.</p>}</div></section>;
}

function CountryCoverageCard({ items }:{ items:CountryCoverage[] }) {
  const max = Math.max(1, ...items.map((item) => Math.max(item.reachVisits, item.consentedViews)));
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center gap-2"><MapPin size={15} className="text-orange-500"/><h2 className="text-sm font-semibold">Geography · countries</h2></div><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Reach visits plus retained consented page-view context.</p><div className="mt-5 space-y-3">{items.length ? items.slice(0,8).map((item)=><div key={item.label}><div className="flex items-start justify-between gap-4 text-xs"><span className="min-w-0 truncate text-[var(--muted)]">{countryName(item.label)}</span><span className="shrink-0 text-right"><span className="font-semibold tabular-nums">{item.reachVisits ? `${item.reachVisits} visit${item.reachVisits === 1 ? "" : "s"}` : "—"}</span>{item.consentedViews > 0 && <span className="ml-2 text-[10px] text-[var(--sub-muted)]">{item.consentedViews} view{item.consentedViews === 1 ? "" : "s"}</span>}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--tag-bg)]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{width:`${Math.max(5,Math.max(item.reachVisits,item.consentedViews)/max*100)}%`}}/></div></div>) : <p className="py-6 text-center text-xs text-[var(--muted)]">No measurements yet.</p>}</div></section>;
}

function VisitCard({ visit, updating, onSegmentChange }:{ visit:Visit; updating:boolean; onSegmentChange:(visit:Visit, segment:AudienceSegment)=>void }) {
  const location = [visit.location?.region ?? visit.location?.regionCode, countryName(visit.location?.countryCode)].filter((part) => part && part !== "Location unavailable").join(", ") || "Location unavailable";
  const device = visit.device ? `${visit.device.type} · ${visit.device.os} · ${visit.device.browser}` : "Device unavailable";
  return <details id={`visitor-${visit.visitorId}`} className="group scroll-mt-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 open:shadow-sm">
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
  const [pageSort, setPageSort] = useState<"views"|"sessions"|"engagement">("views");
  const [journeySort, setJourneySort] = useState<"newest"|"oldest"|"pages">("newest");
  const [visitorQuery, setVisitorQuery] = useState("");
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
  useEffect(() => {
    const visitor = new URLSearchParams(window.location.search).get("visitor");
    if (visitor) setVisitorQuery(visitor.slice(0, 64));
  }, []);
  const max = useMemo(() => Math.max(1, ...(report?.daily.map((entry) => entry.mandatoryVisits) ?? [1])), [report]);
  const topDevice = report?.breakdowns.devices[0];
  const topLocation = report?.breakdowns.locations[0];
  const topEngagedPage = report?.pages.slice().sort((left,right)=>right.averageEngagementMs-left.averageEngagementMs)[0];
  const sortedPages = useMemo(() => report?.pages.slice().sort((left,right) => pageSort === "views" ? right.views-left.views : pageSort === "sessions" ? right.uniques-left.uniques : right.averageEngagementMs-left.averageEngagementMs) ?? [], [report, pageSort]);
  const countryCoverage = useMemo(() => {
    const countries = new Map<string, CountryCoverage>();
    (report?.breakdowns.locations ?? []).forEach((item) => countries.set(item.label, { label:item.label, reachVisits:item.count, consentedViews:0, averageEngagementMs:0 }));
    (report?.breakdowns.locationViews ?? []).forEach((item) => {
      const current = countries.get(item.label) ?? { label:item.label, reachVisits:0, consentedViews:0, averageEngagementMs:0 };
      countries.set(item.label, { ...current, consentedViews:item.count, averageEngagementMs:item.averageEngagementMs });
    });
    return [...countries.values()].sort((left,right) => Math.max(right.reachVisits,right.consentedViews)-Math.max(left.reachVisits,left.consentedViews));
  }, [report]);
  const visibleVisits = useMemo(() => {
    const query = visitorQuery.trim().toLowerCase();
    return (report?.visits ?? []).filter((visit) => !query || visit.visitorId.toLowerCase().includes(query) || visit.location?.region?.toLowerCase().includes(query) || visit.location?.regionCode?.toLowerCase().includes(query) || visit.location?.countryCode?.toLowerCase().includes(query)).sort((left,right) => journeySort === "pages" ? right.pageViews-left.pageViews : journeySort === "oldest" ? Date.parse(left.startedAt)-Date.parse(right.startedAt) : Date.parse(right.startedAt)-Date.parse(left.startedAt));
  }, [report, visitorQuery, journeySort]);

  const updateSegment = useCallback(async (visit:Visit, segment:AudienceSegment) => {
    setUpdatingVisitor(visit.visitorId);
    const response = await fetch("/api/admin/analytics", { method:"PATCH", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ visitorKey:visit.visitorKey, segment }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error ?? "Could not classify visitor.");
    else setReport((current)=>current ? { ...current, visits:current.visits.map((entry)=>entry.visitorId === visit.visitorId ? { ...entry, audienceSegment:segment } : entry) } : current);
    setUpdatingVisitor("");
  }, []);

  return <div className="mx-auto max-w-7xl p-6 md:p-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-orange-500">Experience intelligence</p><h1 className="mt-2 text-3xl font-semibold">Visitor analytics</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">Anonymous visitor/session IDs and country/region counts cover every public visit. Optional tiers add page, device, engagement, source, and pseudonymous journey analysis. City, raw IP addresses, exact coordinates, chat text, and form content are never stored as analytics.</p></div><div className="flex gap-2"><select value={days} onChange={(event)=>setDays(Number(event.target.value))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select><button onClick={()=>void load()} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5" aria-label="Refresh analytics"><RefreshCw size={15}/></button></div></div>
    {loading ? <div className="flex items-center gap-2 py-20 text-sm text-[var(--muted)]"><Loader2 className="animate-spin" size={16}/> Loading analytics…</div> : error && !report ? <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-600">{error}</div> : report && <>
      {error && <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-600">{error}</div>}
      <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-sm font-semibold">Traffic overview</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Reach, engagement, retention, and assistant adoption at a glance.</p></div><span className="text-[10px] text-[var(--muted)]">Last {days} days</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Reach · visitors" value={report.totals.mandatoryVisitors} detail={`${report.totals.mandatoryVisits} visits · ${countryCoverage.length} countries · ${report.breakdowns.regions.length} regions`} icon={MapPin}/><Stat label="Engagement · page views" value={report.totals.views} detail={`${formatDuration(report.totals.averageEngagementMs)} average engaged time`} icon={Eye}/><Stat label="Retention · returning visits" value={report.totals.returningVisits} detail={`${report.totals.visits} enhanced visits · ${report.totals.journeyCoverage}% journey coverage`} icon={Repeat2}/><Stat label="BB-8 · prompts" value={report.chat.requests} detail={`${report.chat.sessions} consented chat sessions · ${report.chat.successRate}% success`} icon={Bot}/></div></section>
      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">What the data suggests</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Directional insights; wait for a meaningful sample before making design decisions.</p></div><Activity size={16} className="text-orange-500"/></div><div className="mt-4 grid gap-3 md:grid-cols-3"><Insight label="Most-used device" value={topDevice?.label ?? "No data"} detail={topDevice ? `${topDevice.count} views · ${formatDuration(topDevice.averageEngagementMs)} average` : "Waiting for optional measurements"} icon={Laptop}/><Insight label="Top country" value={topLocation ? countryName(topLocation.label) : "No data"} detail={topLocation ? `${topLocation.count} mandatory visits` : "Waiting for measurements"} icon={MapPin}/><Insight label="Most engaged page" value={topEngagedPage?.path ?? "No data"} detail={topEngagedPage ? `${formatDuration(topEngagedPage.averageEngagementMs)} average · ${topEngagedPage.views} views` : "Waiting for optional measurements"} icon={Route}/></div></section>
      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Daily reach</h2><span className="text-[10px] text-[var(--sub-muted)]">Mandatory visits with optional page context</span></div><div className="mt-6 flex h-44 items-end gap-1">{report.daily.map((entry)=><div key={entry.day} className="group relative flex h-full flex-1 items-end"><div className="min-h-1 w-full rounded-t bg-gradient-to-t from-orange-600 to-amber-400 transition group-hover:opacity-80" style={{height:`${Math.max(3,entry.mandatoryVisits/max*100)}%`}}/><span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-[#f8fafc] shadow-lg group-hover:block">{entry.day}: {entry.mandatoryVisitors} visitors · {entry.mandatoryVisits} visits · {entry.views} consented views</span></div>)}</div></section>
      <section className="mt-5 rounded-2xl border border-orange-500/20 bg-[var(--surface)] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-500"><Bot size={17}/></div><div><h2 className="text-sm font-semibold">BB-8 performance</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Aggregated feature telemetry only; prompts and responses are not stored.</p></div></div><a href="/admin/ai-usage/openai" className="text-xs font-semibold text-orange-600 dark:text-orange-400">OpenAI provider dashboard →</a></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Insight label="Chat adoption" value={`${report.chat.sessions} sessions`} detail={`${report.chat.opens} opens · ${report.chat.requests} prompts`} icon={Bot}/><Insight label="Reliability" value={`${report.chat.successRate}% success`} detail={`${report.chat.successfulRequests} successful · ${report.chat.failedRequests} failed`} icon={Gauge}/><Insight label="Responsiveness" value={formatDuration(report.chat.averageLatencyMs)} detail={`${report.chat.fallbackRequests} fallbacks · ${report.chat.fallbackRate}% rate`} icon={Zap}/><Insight label="Token activity" value={report.chat.totalTokens.toLocaleString()} detail={`${report.chat.inputTokens.toLocaleString()} input · ${report.chat.outputTokens.toLocaleString()} output`} icon={Activity}/></div>{report.chat.actions.length > 0 && <div className="mt-5 flex flex-wrap gap-2"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sub-muted)]">Agent actions</span>{report.chat.actions.map((action)=><span key={action.label} className="rounded-full border border-[var(--border)] bg-[var(--tag-bg)] px-2.5 py-1 text-[10px] text-[var(--muted)]">{action.label}: {action.count}</span>)}</div>}</section>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><CountryCoverageCard items={countryCoverage}/><BreakdownCard title="Geography · regions / states" items={report.breakdowns.regions} icon={MapPin} showEngagement={false}/><BreakdownCard title="Experience · devices" items={report.breakdowns.devices} icon={Laptop}/><BreakdownCard title="Experience · viewports" items={report.breakdowns.viewports} icon={MonitorSmartphone}/><BreakdownCard title="Technology · operating systems" items={report.breakdowns.operatingSystems} icon={Activity}/><BreakdownCard title="Technology · browsers" items={report.breakdowns.browsers} icon={Search}/><BreakdownCard title="Acquisition · traffic sources" items={report.breakdowns.sources} icon={Route}/><BreakdownCard title="Product · consented feature events" items={report.breakdowns.events} icon={Gauge} showEngagement={false}/></div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] p-5"><div><h2 className="text-sm font-semibold">Page performance</h2><p className="mt-1 text-[10px] text-[var(--sub-muted)]">Compare reach and engaged time to identify high-value pages and UX friction.</p></div><label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sub-muted)]">Sort by <select value={pageSort} onChange={(event)=>setPageSort(event.target.value as typeof pageSort)} className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-[var(--text)]"><option value="views">Views</option><option value="sessions">Sessions</option><option value="engagement">Engaged time</option></select></label></div><div className="overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-xs"><thead className="bg-[var(--tag-bg)] text-[10px] uppercase tracking-wider text-[var(--sub-muted)]"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Enhanced sessions</th><th className="px-5 py-3 text-right">Avg. engaged</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{sortedPages.length ? sortedPages.map((page)=><tr key={page.path}><td className="px-5 py-3 font-medium">{page.path}</td><td className="px-5 py-3 text-right tabular-nums">{page.views}</td><td className="px-5 py-3 text-right tabular-nums text-[var(--muted)]">{page.uniques}</td><td className="px-5 py-3 text-right font-semibold tabular-nums">{formatDuration(page.averageEngagementMs)}</td></tr>) : <tr><td colSpan={4} className="px-5 py-10 text-center text-[var(--muted)]">Traffic will appear after visitors browse the site.</td></tr>}</tbody></table></div></section>
      <section className="mt-7"><div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-sm font-semibold">Consented visitor journeys</h2><p className="mt-1 text-xs text-[var(--muted)]">Retained Enhanced journeys include records created before the telemetry refactor. Search by visitor reference, region, or country.</p></div><span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><Users size={13}/>{visibleVisits.length} shown · {report.totals.visitors} browsers</span></div><div className="mb-4 flex flex-col gap-2 sm:flex-row"><label className="relative flex-1"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><span className="sr-only">Search visitor journeys</span><input value={visitorQuery} onChange={(event)=>setVisitorQuery(event.target.value)} placeholder="Search visitor ID, region, or country code" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-orange-500/50"/></label><select value={journeySort} onChange={(event)=>setJourneySort(event.target.value as typeof journeySort)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs"><option value="newest">Newest visits</option><option value="oldest">Oldest visits</option><option value="pages">Most page views</option></select></div><div className="space-y-3">{visibleVisits.length ? visibleVisits.map((visit)=><VisitCard key={visit.id} visit={visit} updating={updatingVisitor === visit.visitorId} onSegmentChange={(entry,segment)=>void updateSegment(entry,segment)}/>) : <div className="rounded-2xl border border-dashed border-[var(--border)] py-12 text-center text-sm text-[var(--muted)]">No visitor journeys match this filter.</div>}</div></section>
    </>}
  </div>;
}
