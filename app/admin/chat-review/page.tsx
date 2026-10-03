"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, Trash2, RefreshCw } from "lucide-react";
type Review={id:string;prompt:string;occurredAt:string;successful:boolean;model:string;retrievalMode:string|null;retrievalFallback:boolean;status:string};
export default function PromptReviewPage(){
  const [day,setDay]=useState(new Date().toISOString().slice(0,10));
  const [items,setItems]=useState<Review[]>([]);const [cursor,setCursor]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const load=useCallback(async(next?:string|null)=>{
    setLoading(true);setError("");
    try{
      const response=await fetch(`/api/admin/chat-review?day=${day}${next?`&cursor=${encodeURIComponent(next)}`:""}`,{cache:"no-store"});
      const body=await response.json();if(!response.ok)throw new Error(body.error ?? "Could not load reviews.");
      setItems(previous=>next?[...previous,...body.items]:body.items);setCursor(body.nextCursor);
    }catch(e){setError(e instanceof Error?e.message:"Could not load reviews.");}finally{setLoading(false);}
  },[day]);
  useEffect(()=>{void load();},[load]);
  async function change(item:Review,action:"review"|"delete"){
    setLoading(true);setError("");
    try{
      const response=await fetch("/api/admin/chat-review",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({day,id:item.id,action})});
      if(!response.ok)throw new Error("Could not update review.");
      setItems(previous=>action==="delete"?previous.filter(row=>row.id!==item.id):previous.map(row=>row.id===item.id?{...row,status:"reviewed"}:row));
    }catch(e){setError(e instanceof Error?e.message:"Could not update review.");}finally{setLoading(false);}
  }
  return <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-10">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[var(--muted)]">BB-8 learning</p><h1 className="mt-2 text-3xl font-semibold">Prompt review</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">Review consented questions for missing knowledge, confusing answers, and retrieval failures. Update verified portfolio content in RAG Control after review. Visitor submissions never enter the knowledge base automatically.</p></div><div className="flex gap-2"><input type="date" aria-label="Review date (UTC)" value={day} max={new Date().toISOString().slice(0,10)} disabled={loading} onChange={e=>{if(e.target.value)setDay(e.target.value);}} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-sm"/><button disabled={loading} onClick={()=>void load()} aria-label="Refresh prompts" className="rounded-xl border border-[var(--border)] p-3"><RefreshCw size={16}/></button></div></div>
    <p className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs leading-relaxed text-[var(--muted)]">Basic/Enhanced consent only · latest prompt only · common contact details redacted · 90-day default retention · no responses, visitor IDs, or location attached. Redaction is imperfect; delete any sensitive submission before using it. Dates use UTC.</p>
    {error&&<p role="alert" className="mb-4 text-sm text-red-500">{error}</p>}
    {!items.length&&!loading&&!error&&<p className="py-12 text-center text-sm text-[var(--muted)]">No retained prompts for this date.</p>}
    <div className="space-y-3">{items.map(item=><article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="mb-3 flex flex-wrap gap-2 text-[10px] text-[var(--muted)]"><time>{new Date(item.occurredAt).toLocaleTimeString()}</time><span>{item.model}</span><span>{item.successful?"Response delivered":"Request failed"}</span><span>{item.retrievalMode ?? "Retrieval unavailable"}{item.retrievalFallback?" · fallback":""}</span><span>{item.status}</span></div><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{item.prompt}</p><div className="mt-4 flex gap-2"><button disabled={loading||item.status==="reviewed"} onClick={()=>void change(item,"review")} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs disabled:opacity-40"><Check size={13}/>Mark reviewed</button><button disabled={loading} onClick={()=>void change(item,"delete")} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-red-500"><Trash2 size={13}/>Delete</button></div></article>)}</div>
    {loading&&<p role="status" className="mt-4 text-sm text-[var(--muted)]">Loading…</p>}
    {cursor&&<button disabled={loading} onClick={()=>void load(cursor)} className="mt-5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm">Load more</button>}
  </div>;
}
