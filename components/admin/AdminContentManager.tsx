"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit3, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import type { ContentKind, ExperienceContent, PortfolioContent, ProjectContent } from "@/lib/content/types";

const projectBlank:ProjectContent = { id:"", kind:"project", title:"", blurb:"", description:"", highlights:[], tags:[], year:new Date().getFullYear(), status:"planned", featured:false, published:false, sortOrder:0 };
const experienceBlank:ExperienceContent = { id:"", kind:"experience", title:"", organization:"", department:"", location:"", period:"", type:"", bullets:[], tags:[], accent:"orange", showOnTimeline:true, published:false, sortOrder:0 };
const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10";

function lines(value:string) { return value.split("\n").map((v) => v.trim()).filter(Boolean); }

export default function AdminContentManager({ kind }:{ kind:ContentKind }) {
  const [items, setItems] = useState<PortfolioContent[]>([]);
  const [editing, setEditing] = useState<PortfolioContent | null>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"saving"|"error">("loading");
  const [message, setMessage] = useState("");
  const title = kind === "projects" ? "Projects" : "Experience";
  const endpoint = `/api/admin/content/${kind}`;

  const load = useCallback(async () => { setStatus("loading"); const response = await fetch(endpoint); if (response.status === 401) return location.assign("/admin/login"); if (!response.ok) { setStatus("error"); setMessage("Could not load content."); return; } setItems(await response.json()); setStatus("ready"); }, [endpoint]);
  useEffect(() => { void load(); }, [load]);
  const sorted = useMemo(() => [...items].sort((a,b) => a.sortOrder - b.sortOrder), [items]);
  const update = (patch:Record<string, unknown>) => setEditing((current) => current ? ({ ...current, ...patch } as PortfolioContent) : current);

  const save = async () => {
    if (!editing) return; setStatus("saving"); setMessage("");
    const response = await fetch(endpoint, { method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(editing) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus("error"); setMessage(result.error ?? "Save failed."); return; }
    setEditing(null); setMessage("Saved. Public pages now read this content; reindex RAG when your edits are complete."); await load();
  };
  const remove = async (item:PortfolioContent) => {
    if (!confirm(`Delete “${item.title}”?`)) return;
    const response = await fetch(endpoint, { method:"DELETE", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ id:item.id }) });
    if (!response.ok) { setMessage("Delete failed."); return; } setItems((current) => current.filter((entry) => entry.id !== item.id));
  };

  return <div className="mx-auto max-w-6xl p-6 md:p-10">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-orange-500">Live content</p><h1 className="mt-2 text-3xl font-semibold">{title}</h1><p className="mt-2 text-sm text-[var(--muted)]">Create drafts, control ordering, and publish changes without editing source files.</p></div>
      <button onClick={() => setEditing({ ...(kind === "projects" ? projectBlank : experienceBlank), sortOrder:items.length })} className="cta-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Plus size={15}/> Add {kind === "projects" ? "project" : "role"}</button>
    </div>
    {message && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${status === "error" ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600"}`}>{message}</div>}
    {status === "loading" ? <div className="flex items-center gap-2 py-16 text-sm text-[var(--muted)]"><Loader2 className="animate-spin" size={16}/> Loading {title.toLowerCase()}…</div> : <div className="grid gap-3">
      {sorted.map((item) => <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <div className={`h-2.5 w-2.5 rounded-full ${item.published ? "bg-emerald-500" : "bg-amber-500"}`}/><div className="min-w-0 flex-1"><p className="truncate font-medium">{item.title}</p><p className="mt-1 text-xs text-[var(--muted)]">Order {item.sortOrder} · {item.published ? "Published" : "Draft"}{item.kind === "project" ? ` · ${item.year} · ${item.status}` : ` · ${item.period} · ${item.organization}`}</p></div>
        <button onClick={() => setEditing(item)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-orange-500" aria-label={`Edit ${item.title}`}><Edit3 size={15}/></button>
        <button onClick={() => void remove(item)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-red-500" aria-label={`Delete ${item.title}`}><Trash2 size={15}/></button>
      </div>)}
    </div>}

    {editing && <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"><div className="mx-auto my-4 max-w-3xl rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-6 py-4 backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-orange-500">Content editor</p><h2 className="font-semibold">{editing.title || `New ${kind === "projects" ? "project" : "role"}`}</h2></div><button onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-[var(--tag-bg)]"><X size={18}/></button></div>
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <label className="md:col-span-2 text-xs font-medium">Title *<input className={`${inputClass} mt-1.5`} value={editing.title} onChange={(e) => update({ title:e.target.value })}/></label>
        <label className="text-xs font-medium">Stable ID<input className={`${inputClass} mt-1.5`} value={editing.id} placeholder="Generated from title" onChange={(e) => update({ id:e.target.value })}/></label>
        <label className="text-xs font-medium">Sort order<input type="number" className={`${inputClass} mt-1.5`} value={editing.sortOrder} onChange={(e) => update({ sortOrder:Number(e.target.value) })}/></label>
        {editing.kind === "project" ? <>
          <label className="md:col-span-2 text-xs font-medium">Short summary<textarea className={`${inputClass} mt-1.5 min-h-20`} value={editing.blurb} onChange={(e) => update({ blurb:e.target.value })}/></label>
          <label className="md:col-span-2 text-xs font-medium">Full description<textarea className={`${inputClass} mt-1.5 min-h-28`} value={editing.description} onChange={(e) => update({ description:e.target.value })}/></label>
          <label className="text-xs font-medium">Year<input type="number" className={`${inputClass} mt-1.5`} value={editing.year} onChange={(e) => update({ year:Number(e.target.value) })}/></label>
          <label className="text-xs font-medium">Status<select className={`${inputClass} mt-1.5`} value={editing.status} onChange={(e) => update({ status:e.target.value })}><option value="completed">Completed</option><option value="in-progress">In progress</option><option value="planned">Planned</option></select></label>
          <label className="md:col-span-2 text-xs font-medium">Highlights — one per line<textarea className={`${inputClass} mt-1.5 min-h-28`} value={editing.highlights.join("\n")} onChange={(e) => update({ highlights:lines(e.target.value) })}/></label>
          <label className="md:col-span-2 text-xs font-medium">Tags — comma separated<input className={`${inputClass} mt-1.5`} value={editing.tags.join(", ")} onChange={(e) => update({ tags:e.target.value.split(",").map(v=>v.trim()).filter(Boolean) })}/></label>
          <label className="text-xs font-medium">GitHub URL<input className={`${inputClass} mt-1.5`} value={editing.github ?? ""} onChange={(e) => update({ github:e.target.value })}/></label><label className="text-xs font-medium">Demo URL<input className={`${inputClass} mt-1.5`} value={editing.demo ?? ""} onChange={(e) => update({ demo:e.target.value })}/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => update({ featured:e.target.checked })}/> Featured on About page</label>
        </> : <>
          <label className="text-xs font-medium">Organization *<input className={`${inputClass} mt-1.5`} value={editing.organization} onChange={(e) => update({ organization:e.target.value })}/></label><label className="text-xs font-medium">Period *<input className={`${inputClass} mt-1.5`} value={editing.period} onChange={(e) => update({ period:e.target.value })}/></label>
          <label className="text-xs font-medium">Department<input className={`${inputClass} mt-1.5`} value={editing.department} onChange={(e) => update({ department:e.target.value })}/></label><label className="text-xs font-medium">School / subdepartment<input className={`${inputClass} mt-1.5`} value={editing.subdepartment ?? ""} onChange={(e) => update({ subdepartment:e.target.value })}/></label>
          <label className="text-xs font-medium">Location<input className={`${inputClass} mt-1.5`} value={editing.location} onChange={(e) => update({ location:e.target.value })}/></label><label className="text-xs font-medium">Role type<input className={`${inputClass} mt-1.5`} value={editing.type} onChange={(e) => update({ type:e.target.value })}/></label>
          <label className="md:col-span-2 text-xs font-medium">Summary<textarea className={`${inputClass} mt-1.5 min-h-24`} value={editing.summary ?? ""} onChange={(e) => update({ summary:e.target.value })}/></label><label className="md:col-span-2 text-xs font-medium">Research areas<input className={`${inputClass} mt-1.5`} value={editing.researchAreas ?? ""} onChange={(e) => update({ researchAreas:e.target.value })}/></label>
          <label className="md:col-span-2 text-xs font-medium">Contributions — one per line<textarea className={`${inputClass} mt-1.5 min-h-36`} value={editing.bullets.join("\n")} onChange={(e) => update({ bullets:lines(e.target.value) })}/></label><label className="md:col-span-2 text-xs font-medium">Tags — comma separated<input className={`${inputClass} mt-1.5`} value={editing.tags.join(", ")} onChange={(e) => update({ tags:e.target.value.split(",").map(v=>v.trim()).filter(Boolean) })}/></label>
          <label className="text-xs font-medium">Logo path<input className={`${inputClass} mt-1.5`} value={editing.logo ?? ""} onChange={(e) => update({ logo:e.target.value })}/></label><label className="text-xs font-medium">Accent<select className={`${inputClass} mt-1.5`} value={editing.accent} onChange={(e) => update({ accent:e.target.value })}>{["orange","violet","teal","blue","pink","purple"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.showOnTimeline} onChange={(e) => update({ showOnTimeline:e.target.checked })}/> Show on About timeline</label>
        </>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={(e) => update({ published:e.target.checked })}/>{editing.published ? <Check size={14} className="text-emerald-500"/> : null} Published</label>
      </div>
      <div className="flex justify-end gap-3 border-t border-[var(--border)] px-6 py-4"><button onClick={() => setEditing(null)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Cancel</button><button onClick={() => void save()} disabled={status === "saving"} className="cta-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">{status === "saving" ? <Loader2 className="animate-spin" size={15}/> : <Save size={15}/>} Save</button></div>
    </div></div>}
  </div>;
}
