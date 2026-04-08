"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bot, Sparkles } from "lucide-react";
import AiInput from "./AiInput";

export default function ChatWidget({ hideButton }: { hideButton?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listen for custom event to open chat widget from other components
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("openChatWidget", handleOpen);
    return () => window.removeEventListener("openChatWidget", handleOpen);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  async function send(q: string) {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await r.json();
      setMsgs((m) => [...m, { role: "assistant", text: data.answer ?? "Sorry, I couldn't find that." }]);
    } catch (_e: unknown) {
      setMsgs((m) => [...m, { role: "assistant", text: "Error calling AI endpoint." }]);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] flex flex-col rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{ height: 440 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-zinc-900/60">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30">
                <Bot size={14} className="text-violet-400" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white leading-none">Portfolio AI</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Ask me about Aditya&apos;s work</p>
              </div>
              <button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent("closeChatWidget")); }}
                className="w-6 h-6 flex items-center justify-center rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin">
              {msgs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">
                  <Sparkles size={22} className="text-violet-400 opacity-60" />
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ask about projects, experience, skills, or anything else on this portfolio.
                  </p>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/8 border border-yellow-500/20 text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 animate-pulse" />
                    <p className="text-[10px] text-yellow-300/80 leading-snug">
                      This feature is still{" "}
                      <span className="font-semibold text-yellow-300">work in progress</span>.
                      {" "}Check the{" "}
                      <a href="/notice" className="underline underline-offset-2 text-yellow-300 hover:text-yellow-200 transition-colors">Notice page</a>
                      {" "}for more details.
                    </p>
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span
                    className={`inline-block px-3 py-2 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                      m.role === "user"
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-zinc-800/80 text-zinc-200 border border-white/5 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/8">
              <AiInput
                onSubmit={send}
                placeholder="Ask about projects, skills..."
                mainColor="#7c3aed"
                backgroundColor="#09090b"
                animationStyle="orbit"
                rows={1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic trigger button */}
      {!hideButton && <button
        onClick={() => setOpen((o) => !o)}
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950 border border-violet-500/40 text-violet-300 shadow-lg shadow-violet-900/30 hover:border-violet-400/70 hover:shadow-violet-700/40 hover:text-white transition-all duration-300"
      >
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-full bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
        <AnimatePresence mode="popLayout" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }} className="relative z-10 flex items-center gap-2">
              <X size={15} />
              <span className="text-xs font-medium tracking-wide">Close</span>
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }} className="relative z-10 flex items-center gap-2">
              <Bot size={15} />
              <span className="text-xs font-medium tracking-wide">Ask AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>}
    </div>
  );
}
