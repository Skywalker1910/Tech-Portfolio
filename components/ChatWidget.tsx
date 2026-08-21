"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Bot, Sparkles, ExternalLink, ChevronDown, ArrowLeft, BookOpen, Download, Route, FilePenLine } from "lucide-react";
import AiInput from "./AiInput";
import BB8ChatDroid from "./BB8ChatDroid";
import { CONTACT_DRAFT_KEY, isBB8Action, type BB8Action } from "@/lib/bb8-actions";
import {
  BB8_CHAT_SESSION_KEY,
  browserPrivacySignal,
  getOrCreateAnalyticsIdentity,
  optionalAnalyticsAllowed,
  readAnalyticsPreference,
} from "@/lib/client-analytics";

type Role = "user" | "assistant";
type Model = "openai" | "bb8";
interface ChatSource { title: string; section: string; href: string }
interface Message { role: Role; text: string; sources?: ChatSource[]; action?: BB8Action }

const FULL_CHAT_URL =
  process.env.NEXT_PUBLIC_FULL_CHAT_URL ?? "/chat";
const CHAT_SESSION_KEY = "bb8-tech-portfolio-chat";
function getOrCreateChatUsageSessionId() {
  try {
    const stored = window.sessionStorage.getItem(BB8_CHAT_SESSION_KEY);
    if (stored) return stored;
    const sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(BB8_CHAT_SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return crypto.randomUUID();
  }
}

function chatTelemetryContext() {
  const preference = readAnalyticsPreference(localStorage);
  const privacySignal = browserPrivacySignal(navigator as Navigator & { globalPrivacyControl?:boolean });
  if (!optionalAnalyticsAllowed(preference, privacySignal)) return null;
  const identity = getOrCreateAnalyticsIdentity({ sessionStorage, localStorage, preference, privacySignal });
  return {
    visitorId:identity.visitorId,
    sessionId:identity.sessionId,
    chatSessionId:getOrCreateChatUsageSessionId(),
    tier:preference === "enhanced" ? "enhanced" : "basic",
  } as const;
}

function chatClientHints() {
  return {
    platform:navigator.platform.slice(0, 40),
    touchPoints:Math.min(20, Math.max(0, navigator.maxTouchPoints || 0)),
    viewportWidth:Math.max(0, Math.round(window.innerWidth)),
  };
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const message = value as { role?: unknown; text?: unknown; sources?: unknown; action?: unknown };
  const validSources = message.sources === undefined || (
    Array.isArray(message.sources) && message.sources.every((source) => {
      if (!source || typeof source !== "object") return false;
      const candidate = source as { title?: unknown; section?: unknown; href?: unknown };
      return typeof candidate.title === "string" &&
        typeof candidate.section === "string" &&
        typeof candidate.href === "string" &&
        candidate.href.startsWith("/");
    })
  );
  return (message.role === "user" || message.role === "assistant") &&
    typeof message.text === "string" && validSources &&
    (message.action === undefined || isBB8Action(message.action));
}

function InlineMessageText({ text }: { text: string }) {
  return <>
    {text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={index} className="font-semibold text-[var(--text)]">{part.slice(2, -2)}</strong>
        : <span key={index}>{part}</span>
    )}
  </>;
}

function FormattedMessage({ text }: { text: string }) {
  return <>
    {text.split("\n").map((line, index) => {
      const bullet = line.match(/^\s*[-•]\s+(.*)$/);
      if (bullet) {
        return (
          <span key={index} className="flex gap-1.5 py-0.5">
            <span aria-hidden="true" className="shrink-0 text-[var(--hero-accent)]">•</span>
            <span><InlineMessageText text={bullet[1]} /></span>
          </span>
        );
      }
      if (!line.trim()) return <span key={index} className="block h-2" aria-hidden="true" />;
      return <span key={index} className="block"><InlineMessageText text={line} /></span>;
    })}
  </>;
}

interface ChatWidgetProps {
  hideButton?: boolean;
  fullPage?: boolean;
}

export default function ChatWidget({ hideButton, fullPage = false }: ChatWidgetProps = {}) {
  const [open, setOpen] = useState(fullPage);
  const [model, setModel] = useState<Model>("openai");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [analyticsRevision, setAnalyticsRevision] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Preserve the conversation and open state if a route change remounts the widget.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(CHAT_SESSION_KEY);
      if (saved) {
        const session = JSON.parse(saved) as { open?: unknown; model?: unknown; msgs?: unknown };
        if (Array.isArray(session.msgs) && session.msgs.every(isMessage)) setMsgs(session.msgs);
        if (session.model === "openai" || session.model === "bb8") setModel(session.model);
        if (!fullPage && typeof session.open === "boolean") setOpen(session.open);
      }
    } catch {
      window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    } finally {
      setSessionReady(true);
    }
  }, [fullPage]);

  useEffect(() => {
    if (!sessionReady) return;
    window.sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify({
      open: fullPage || open,
      model,
      msgs,
    }));
  }, [fullPage, model, msgs, open, sessionReady]);

  useEffect(() => {
    const refreshAnalytics = () => setAnalyticsRevision((value) => value + 1);
    window.addEventListener("portfolio:analytics-consent-changed", refreshAnalytics);
    return () => window.removeEventListener("portfolio:analytics-consent-changed", refreshAnalytics);
  }, []);

  useEffect(() => {
    if (!sessionReady || !open) return;
    const telemetry = chatTelemetryContext();
    if (!telemetry) return;
    const marker = `${BB8_CHAT_SESSION_KEY}:opened:${telemetry.chatSessionId}`;
    try {
      if (window.sessionStorage.getItem(marker)) return;
      window.sessionStorage.setItem(marker, "true");
    } catch {
      // The event remains anonymous if browser storage is unavailable.
    }
    fetch("/api/analytics", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ eventType:"chat_open", eventId:crypto.randomUUID(), ...telemetry, client:chatClientHints() }),
      keepalive:true,
    }).catch(() => {});
  }, [analyticsRevision, open, sessionReady]);

  useEffect(() => {
    if (fullPage) return;
    const handleOpen = () => setOpen(true);
    window.addEventListener("openChatWidget", handleOpen);
    return () => window.removeEventListener("openChatWidget", handleOpen);
  }, [fullPage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  // Close model menu on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Click-away collapses the chat panel
  useEffect(() => {
    if (fullPage) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        open &&
        panelRef.current && !panelRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [fullPage, open]);

  async function send(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    if (model === "bb8") {
      setMsgs(m => [...m,
        { role: "user", text },
        { role: "assistant", text: "BB-8 Local is still training! Aditya is fine-tuning it on his personal research notes. It'll be available soon. Switch back to OpenAI to get answers right now." },
      ]);
      return;
    }
    const nextMsgs = [...msgs, { role: "user" as const, text }];
    // A compact three-turn window keeps replies focused while the full transcript remains visible.
    const conversation = nextMsgs.slice(-6);
    setMsgs(nextMsgs);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map(({ role, text: content }) => ({ role, content })),
          telemetry: chatTelemetryContext(),
          client: chatClientHints(),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMsgs(m => [...m, { role: "assistant", text: data.error ?? "Something went wrong." }]);
        return;
      }
      const answer: string = data.answer ?? "Sorry, I couldn't find that.";
      const action = isBB8Action(data.action) ? data.action : undefined;
      const sources = Array.isArray(data.sources)
        ? data.sources.filter((source: unknown): source is ChatSource => {
            if (!source || typeof source !== "object") return false;
            const candidate = source as { title?: unknown; section?: unknown; href?: unknown };
            return typeof candidate.title === "string" &&
              typeof candidate.section === "string" &&
              typeof candidate.href === "string" &&
              candidate.href.startsWith("/");
          })
        : [];
      setMsgs(m => [...m, {
        role: "assistant",
        text: answer,
        sources: sources.length > 0 ? sources : undefined,
        action,
      }]);
      if (action?.type === "contact_draft") {
        window.sessionStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(action.draft));
      }
      if (action && action.type !== "resume") setTimeout(() => {
        setOpen(true);
        if (action.href !== pathname) router.push(action.href);
      }, 900);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={fullPage
      ? "mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-5xl items-center px-4 py-6 sm:px-6 lg:px-8"
      : "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    }>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={fullPage ? { opacity: 0, y: 12 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className={fullPage
              ? "flex min-h-[34rem] w-full flex-col overflow-hidden rounded-[24px] backdrop-blur-2xl card-elevated"
              : "w-[min(390px,calc(100vw-2rem))] flex flex-col overflow-hidden rounded-[22px] backdrop-blur-2xl card-elevated"
            }
            style={{
              height: fullPage
                ? "min(760px, calc(100dvh - 8rem))"
                : "min(560px, calc(100dvh - 9rem))",
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--bg) 90%, var(--surface)))",
              border: "1px solid var(--border)",
              boxShadow:
                "0 24px 70px color-mix(in srgb, var(--text) 18%, transparent), var(--card-shadow)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--hero-accent) 12%, var(--surface)), var(--surface))",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-700/20 border border-orange-500/25">
                  <Bot size={15} className="text-orange-400" />
                </span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                  style={{ borderColor: "var(--surface)" }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text)] leading-none">BB-8</p>
                <p className="text-[10px] text-[var(--muted)] mt-1 truncate">RAG-Powered Co-Pilot</p>
              </div>

              {/* Open full chat link */}
              {!fullPage && (
                <a
                  href={FULL_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open full chat app"
                  className="flex items-center gap-1 text-[10px] text-[var(--muted)] hover:text-[var(--hero-accent)] transition-colors shrink-0"
                >
                  <ExternalLink size={11} />
                  <span className="hidden sm:inline">Full chat</span>
                </a>
              )}

              {/* Model selector — dropdown renders above panel, not clipped */}
              <div className="relative shrink-0" ref={modelMenuRef}>
                <button
                  onClick={() => setModelMenuOpen(o => !o)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-colors"
                  style={{
                    background: model === "bb8"
                      ? "color-mix(in srgb, #eab308 10%, var(--surface))"
                      : "var(--tag-bg)",
                    borderColor: model === "bb8" ? "rgba(234,179,8,0.35)" : "var(--tag-border)",
                    color: model === "bb8" ? "#ca8a04" : "var(--muted)",
                  }}
                >
                  {model === "openai" ? "OpenAI" : "BB-8 Local \u26a0"}
                  <ChevronDown size={9} className={`transition-transform duration-150 ${modelMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {modelMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1.5 w-[200px] rounded-xl overflow-hidden z-[60]"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 16px 40px color-mix(in srgb, var(--text) 18%, transparent)",
                      }}
                    >
                      <div className="px-3 py-2 border-b border-[var(--border)]">
                        <p className="text-[9px] uppercase tracking-widest text-[var(--sub-muted)]">Select model</p>
                      </div>
                      <button
                        onClick={() => { setModel("openai"); setModelMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-[var(--tag-bg)]"
                      >
                        <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${model === "openai" ? "bg-orange-400" : "bg-[var(--border)]"}`} />
                        <span>
                          <span className={`block text-[11px] font-semibold ${model === "openai" ? "text-orange-500" : "text-[var(--text)]"}`}>OpenAI</span>
                          <span className="block text-[10px] text-[var(--sub-muted)] mt-0.5">GPT-5.6 · Friendly &amp; complete</span>
                        </span>
                      </button>
                      <button
                        onClick={() => { setModel("bb8"); setModelMenuOpen(false); }}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-[var(--tag-bg)]"
                      >
                        <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${model === "bb8" ? "bg-yellow-400" : "bg-[var(--border)]"}`} />
                        <span>
                          <span className={`block text-[11px] font-semibold ${model === "bb8" ? "text-yellow-600 dark:text-yellow-400" : "text-[var(--text)]"}`}>BB-8 Local</span>
                          <span className="block text-[10px] text-[var(--sub-muted)] mt-0.5">Aditya&apos;s LLM · Coming soon</span>
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => {
                  if (fullPage) {
                    router.push("/");
                    return;
                  }
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("closeChatWidget"));
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--tag-bg)] transition-colors shrink-0"
                aria-label={fullPage ? "Back to portfolio" : "Close BB-8 chat"}
                title={fullPage ? "Back to portfolio" : "Close chat"}
              >
                {fullPage ? <ArrowLeft size={14} /> : <X size={14} />}
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} aria-live="polite" className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--bg)]/35">
              {msgs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))", border: "1px solid rgba(249,115,22,0.15)" }}>
                    <Sparkles size={20} className="text-orange-400/70" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)] mb-1">How can BB-8 help?</p>
                    <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                      Ask about Aditya&apos;s projects, skills, experience, or availability.
                    </p>
                  </div>
                  {/* Quick-prompt chips */}
                  <div className="flex flex-col gap-1.5 w-full">
                    {["What projects has Aditya built?", "Is Aditya open to work?", "Show me the skills page"].map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="w-full text-left text-[11px] px-3 py-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:-translate-y-0.5 transition-all"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  {model === "bb8" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full"
                      style={{ background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.18)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 animate-pulse" />
                      <p className="text-[10px] text-yellow-700 dark:text-yellow-300/80 leading-snug">BB-8 Local is in training — replies will be WIP notices.</p>
                    </div>
                  )}
                </div>
              )}

              {msgs.map((m, i) => (
                <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                      style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.2)" }}>
                      <Bot size={10} className="text-orange-400" />
                    </span>
                  )}
                  <div className="max-w-[78%]">
                    <div
                      className={`whitespace-pre-wrap break-words px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${m.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm text-[var(--tag-text)]"}`}
                      style={m.role === "user"
                        ? { background: "linear-gradient(135deg, #ea580c, #f97316)" }
                        : { background: "var(--surface)", border: "1px solid var(--border)" }
                      }
                    >
                      <FormattedMessage text={m.text} />
                    </div>
                    {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1" aria-label="Portfolio sources">
                        {m.sources.map((source) => (
                          <button
                            type="button"
                            key={`${source.href}-${source.section}`}
                            title={`Source: ${source.section}`}
                            onClick={() => {
                              setOpen(true);
                              if (source.href !== pathname) router.push(source.href);
                            }}
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--tag-border)] bg-[var(--tag-bg)] px-2 py-1 text-[9px] text-[var(--muted)] transition-colors hover:border-[var(--hero-accent)] hover:text-[var(--hero-accent)]"
                          >
                            <BookOpen size={9} className="shrink-0" />
                            <span className="truncate">{source.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {m.role === "assistant" && m.action && (
                      <div className="mt-2">
                        {m.action.type === "resume" ? (
                          <a
                            href={m.action.href}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-orange-600 transition-colors hover:bg-orange-500/20 dark:text-orange-300"
                          >
                            <Download size={11} /> {m.action.label}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (m.action?.type === "contact_draft") {
                                window.sessionStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(m.action.draft));
                              }
                              setOpen(true);
                              if (m.action && m.action.href !== pathname) router.push(m.action.href);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-orange-600 transition-colors hover:bg-orange-500/20 dark:text-orange-300"
                          >
                            {m.action.type === "contact_draft" ? <FilePenLine size={11} /> : <Route size={11} />}
                            {m.action.label}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.2)" }}>
                    <Bot size={10} className="text-orange-400" />
                  </span>
                  <span className="inline-flex gap-1 px-3 py-3 rounded-2xl rounded-bl-sm"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: `${i * 0.14}s` }} />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Full chat CTA */}
            {!fullPage && (
              <a
                href={FULL_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 text-[10px] text-[var(--sub-muted)] hover:text-[var(--hero-accent)] transition-colors shrink-0"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <ExternalLink size={10} />
                Open full-screen BB-8 chat
              </a>
            )}

            {/* Input — overflow-hidden clips the AiInput blob animation overflow */}
            <div className="px-3 pb-3 shrink-0 overflow-hidden rounded-b-2xl">
              <AiInput
                onSubmit={send}
                placeholder={model === "bb8" ? "BB-8 Local coming soon..." : "Ask BB-8 about Aditya..."}
                mainColor="var(--hero-accent)"
                backgroundColor="var(--surface)"
                animationStyle="orbit"
                rows={1}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standalone BB-8 chat trigger */}
      {!hideButton && (
        <BB8ChatDroid
          ref={triggerRef}
          onClick={() => setOpen(o => !o)}
          open={open}
        />
      )}
    </div>
  );
}
