"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, AlertTriangle, Clock, FlaskConical, Globe, ShieldCheck, Sparkles, Wrench, Zap } from "lucide-react";

import { Easing } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as Easing, delay },
});

const STATUS_ITEMS = [
  {
    label: "Portfolio Site",
    status: "Live",
    color: "emerald",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    desc: "The core portfolio — pages, projects, timeline, skills — is live and fully functional.",
  },
  {
    label: "R2D2 — AI Assistant",
    status: "In Progress",
    color: "yellow",
    dot: "bg-yellow-400",
    badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    desc: "The AI assistant (R2D2) is currently under active development. Responses may be incomplete, inaccurate, or unavailable at times.",
  },
  {
    label: "Blog / Writing",
    status: "Planned",
    color: "zinc",
    dot: "bg-zinc-500",
    badge: "bg-zinc-700/40 border-zinc-600/30 text-zinc-400",
    desc: "A dedicated writing/blog section is planned for future releases.",
  },
  {
    label: "Interactive ML Demos",
    status: "Planned",
    color: "zinc",
    dot: "bg-zinc-500",
    badge: "bg-zinc-700/40 border-zinc-600/30 text-zinc-400",
    desc: "Live in-browser demonstrations of selected ML models and pipelines.",
  },
  {
    label: "Visitor Analytics Dashboard",
    status: "Planned",
    color: "zinc",
    dot: "bg-zinc-500",
    badge: "bg-zinc-700/40 border-zinc-600/30 text-zinc-400",
    desc: "An interactive dashboard tracking visitor data (city/country, page activity, engagement) — powering a live globe visualization and ML-driven UX insights. See the Privacy Policy for full details.",
  },
];

const FUTURE_FEATURES = [
  {
    icon: Sparkles,
    title: "Enhanced R2D2 AI (RAG-powered)",
    desc: "R2D2 will be upgraded with a Retrieval-Augmented Generation (RAG) pipeline, enabling accurate, context-aware answers about my projects, experience, and publications — grounded in real data.",
    tag: "AI / LLM",
    color: "violet",
  },
  {
    icon: FlaskConical,
    title: "Interactive ML Project Demos",
    desc: "Select projects will be available as live, in-browser demos — including the AQI prediction system, movie recommender, and computer vision experiments.",
    tag: "ML / Frontend",
    color: "teal",
  },
  {
    icon: Zap,
    title: "Real-Time GitHub Activity Feed",
    desc: "A live feed of recent GitHub commits, repositories, and contribution activity — integrated directly into the portfolio.",
    tag: "Integrations",
    color: "orange",
  },
  {
    icon: Wrench,
    title: "Blog & Technical Writing",
    desc: "A writing section for deep-dives into ML techniques, research notes, and engineering learnings from my projects.",
    tag: "Content",
    color: "blue",
  },
  {
    icon: Clock,
    title: "Project Case Studies",
    desc: "Detailed case study pages for flagship projects with architecture diagrams, results, and interactive visualizations.",
    tag: "Projects",
    color: "pink",
  },
  {
    icon: Globe,
    title: "Visitor Analytics & Globe Dashboard",
    desc: "An interactive dashboard showing real-time visitor data — city/country-level geolocation powering a live globe, plus page activity metrics and engagement analytics. As a data scientist, I plan to use this data to improve UX and build a publicly visible insights board.",
    tag: "Data / Analytics",
    color: "teal",
  },
  {
    icon: Activity,
    title: "ML-Driven Engagement Insights",
    desc: "Visitor engagement patterns (pages visited, time spent, navigation flows) will feed ML analysis to surface trends, optimize content, and personalize the portfolio experience over time.",
    tag: "ML / Data Science",
    color: "orange",
  },
];

const colorMap: Record<string, { tag: string; icon: string }> = {
  violet: { tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20", icon: "text-violet-400" },
  teal:   { tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",   icon: "text-teal-400"   },
  orange: { tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20", icon: "text-orange-400" },
  blue:   { tag: "bg-blue-500/10 text-blue-300 border border-blue-500/20",     icon: "text-blue-400"   },
  pink:   { tag: "bg-pink-500/10 text-pink-300 border border-pink-500/20",     icon: "text-pink-400"   },
};

export default function NoticePage() {
  return (
    <div className="container-max py-12 md:py-20 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div {...fadeUp()} className="mb-14">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-3">Site Status & Notices</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Notice</h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
          This page tracks the current status of this portfolio, features in development, and important disclosures about content and tooling.
        </p>
      </motion.div>

      {/* ── Current Status ───────────────────────────── */}
      <motion.section {...fadeUp(0.05)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">Current Status</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-4">
          {STATUS_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.05 + i * 0.05)}
              className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800/70 bg-zinc-900/50"
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.dot} ring-4 ring-zinc-900`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Future Features ──────────────────────────── */}
      <motion.section {...fadeUp(0.1)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">In Development</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-5">
          {FUTURE_FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.05)}
                className="flex gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 group hover:border-zinc-700 transition-colors"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center group-hover:border-zinc-600 transition-colors">
                  <Icon size={16} className={c.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-white">{f.title}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.tag}`}>{f.tag}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Disclosures ──────────────────────────────── */}
      <motion.section {...fadeUp(0.15)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">Disclosures</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-5 text-sm text-zinc-400 leading-relaxed">
          <div className="flex gap-3">
            <ShieldCheck size={16} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">AI Assistant (R2D2)</span> — This feature uses a large language model (LLM) to answer questions about my portfolio. Responses are generated automatically and may contain errors or outdated information. Always verify important details directly with me.
            </p>
          </div>
          <div className="flex gap-3">
            <AlertTriangle size={16} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">Data & Privacy</span> — No personal data is currently collected or stored. A future release will introduce a visitor analytics system (geolocation at city/country level, page activity, engagement patterns) to power an interactive globe and data dashboard. Collection will be transparent and minimal. See the{" "}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">Privacy Policy</Link>{" "}
              for full details.
            </p>
          </div>
          <div className="flex gap-3">
            <Sparkles size={16} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">Work in Progress</span> — This portfolio is actively developed. Features, content, and design may change without prior notice. Last updated: April 2026.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Footer note */}
      <motion.div {...fadeUp(0.2)} className="border-t border-zinc-800 pt-8 text-xs text-zinc-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span>Questions? <a href="mailto:aditya.more@outlook.in" className="text-zinc-400 hover:text-white transition-colors">aditya.more@outlook.in</a></span>
        <Link href="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">← Back to Portfolio</Link>
      </motion.div>
    </div>
  );
}
