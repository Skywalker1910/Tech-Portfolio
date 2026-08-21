"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2, Plus } from "lucide-react";
import { SiOpenai } from "react-icons/si";

type ProviderStatus = "loading" | "connected" | "setup" | "unavailable";

export default function ApiUsagePage() {
  const [status, setStatus] = useState<ProviderStatus>("loading");

  useEffect(() => {
    fetch("/api/admin/openai-usage?days=7", { cache:"no-store" })
      .then(async (response) => {
        if (response.status === 401) return location.assign("/admin/login");
        const body = await response.json();
        if (response.ok && body.configured !== false) setStatus("connected");
        else if (body.configured === false) setStatus("setup");
        else setStatus("unavailable");
      })
      .catch(() => setStatus("unavailable"));
  }, []);

  const statusView = status === "loading"
    ? <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]"><Loader2 size={12} className="animate-spin"/>Checking connection</span>
    : status === "connected"
      ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12}/>Connected</span>
      : status === "setup"
        ? <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"><CircleAlert size={12}/>Setup required</span>
        : <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"><CircleAlert size={12}/>Temporarily unavailable</span>;

  return <div className="mx-auto max-w-6xl p-6 md:p-10">
    <header className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-orange-500">Provider operations</p>
      <h1 className="mt-2 text-3xl font-semibold">API usage</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">Monitor requests, tokens, models, and costs by AI provider. Each provider has its own isolated dashboard and server-side credentials.</p>
    </header>

    <section aria-labelledby="providers-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div><h2 id="providers-heading" className="text-sm font-semibold">Providers</h2><p className="mt-1 text-xs text-[var(--muted)]">One active provider</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/admin/ai-usage/openai" className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black"><SiOpenai size={24} aria-hidden="true"/></div>
            {statusView}
          </div>
          <h3 className="mt-5 text-lg font-semibold">OpenAI</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">BB-8 generation and RAG embedding requests, token usage, models, and organization cost data.</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">Open dashboard <ArrowRight size={13} className="transition group-hover:translate-x-0.5"/></span>
        </Link>

        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/45 p-5 text-[var(--muted)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--tag-bg)]"><Plus size={20}/></div>
          <h3 className="mt-5 text-sm font-semibold text-[var(--text)]">Add another provider</h3>
          <p className="mt-1 text-xs leading-relaxed">Future AI services can be added here without mixing their credentials or usage data with OpenAI.</p>
        </div>
      </div>
    </section>
  </div>;
}
