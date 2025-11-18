"use client";
import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{role:"user"|"assistant"; text:string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMsgs(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const data = await r.json();
      setMsgs(m => [...m, { role: "assistant", text: data.answer ?? "Sorry, I couldn't find that." }]);
    } catch (e:any) {
      setMsgs(m => [...m, { role: "assistant", text: "Error calling AI endpoint." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-[320px] h-[420px] card flex flex-col overflow-hidden bg-slate-900/90 border-slate-800">
          <div className="px-3 py-2 border-b border-slate-800 font-medium text-slate-200">Ask about my work</div>
          <div className="flex-1 p-3 overflow-auto space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className={`inline-block px-3 py-2 rounded-2xl ${m.role === "user" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                  {m.text}
                </span>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400">Thinking…</div>}
          </div>
          <div className="p-2 border-t border-slate-800 flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-200" placeholder="Ask about projects, education…" value={input} onChange={e => setInput(e.target.value)} />
            <button onClick={send} className="px-3 py-2 rounded-xl border border-slate-700 text-slate-200">Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} className="rounded-full px-4 py-2 bg-violet-600 text-white shadow-lg">
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}
