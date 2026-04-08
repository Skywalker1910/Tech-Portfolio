"use client";

import { motion, Easing } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Database, Globe, BarChart2, Lock, EyeOff, Sparkles } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as Easing, delay },
});

const CURRENT_PRACTICES = [
  { label: "No cookies or local storage tracking" },
  { label: "No personal identifiers collected or stored" },
  { label: "Chat interactions with R2D2 are not logged or retained" },
  { label: "No third-party analytics or advertising SDKs" },
];

const FUTURE_PLANS = [
  {
    icon: Globe,
    color: "teal",
    title: "High-Level Geolocation",
    desc: "City and country-level location inferred from your IP address — no precise GPS or street-level data, ever. This will power a live globe visualization showcasing where visitors come from around the world.",
  },
  {
    icon: BarChart2,
    color: "violet",
    title: "Page Activity & Engagement",
    desc: "Pages visited, time spent, navigation patterns, and most-visited sections will be tracked to understand how people engage with the portfolio. No form inputs, keystrokes, or sensitive content will be captured.",
  },
  {
    icon: Database,
    color: "blue",
    title: "Secure & Anonymized Storage",
    desc: "All collected data will be stored securely, anonymized where possible, and never sold or shared with third parties. Data will be used solely for portfolio analytics and UX improvement.",
  },
  {
    icon: Sparkles,
    color: "pink",
    title: "ML-Driven UX Analysis",
    desc: "As a data scientist and ML engineer, I plan to analyze visit patterns and engagement signals to continuously improve content, layout, and overall user experience — this portfolio is also a living data project.",
  },
];

const colorStyles: Record<string, { border: string; icon: string }> = {
  teal:   { border: "border-teal-500/20 bg-teal-500/5",     icon: "text-teal-400"   },
  violet: { border: "border-violet-500/20 bg-violet-500/5", icon: "text-violet-400" },
  blue:   { border: "border-blue-500/20 bg-blue-500/5",     icon: "text-blue-400"   },
  pink:   { border: "border-pink-500/20 bg-pink-500/5",     icon: "text-pink-400"   },
};

export default function PrivacyPage() {
  return (
    <div className="container-max py-12 md:py-20 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <motion.div {...fadeUp()} className="mb-14">
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-3">Transparency & Data</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
          A transparent overview of what data this portfolio currently collects, what is planned in a future release, and how your information will always be handled responsibly.
        </p>
        <p className="text-zinc-700 text-xs mt-3">Last updated: April 8, 2026</p>
      </motion.div>

      {/* ── Current Practices ── */}
      <motion.section {...fadeUp(0.05)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">Today</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="flex gap-4 p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
          <EyeOff size={16} className="text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">No tracking — as of now</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This portfolio does not currently collect, store, or track any personal data. No cookies are set, no analytics scripts are running, and no identifying information is retained from your visit.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {CURRENT_PRACTICES.map((item, i) => (
            <motion.div key={i} {...fadeUp(0.05 + i * 0.04)} className="flex items-center gap-3 text-xs text-zinc-400">
              <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Future Plans ── */}
      <motion.section {...fadeUp(0.1)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">Planned</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed mb-6">
          A future release will introduce an opt-in visitor analytics system. The goal is to build an interactive, data-driven dashboard — both as a professional showcase and as a data science project. The following is a full account of what will be collected and why.
        </p>

        <div className="space-y-4">
          {FUTURE_PLANS.map((item, i) => {
            const Icon = item.icon;
            const s = colorStyles[item.color];
            return (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.05)} className={`flex gap-4 p-4 rounded-xl border ${s.border}`}>
                <div className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
                  <Icon size={16} className={s.icon} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ── Your Rights ── */}
      <motion.section {...fadeUp(0.15)} className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-600">Your Rights</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="space-y-5 text-sm text-zinc-400 leading-relaxed">
          <div className="flex gap-3">
            <Lock size={15} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">Transparency before collection</span> — This Privacy Policy will be updated before any data collection begins. You will be clearly informed of what is collected, why, and how it is stored.
            </p>
          </div>
          <div className="flex gap-3">
            <ShieldAlert size={15} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">No selling or sharing</span> — Your data will never be sold, rented, or shared with advertisers or third-party platforms for commercial purposes.
            </p>
          </div>
          <div className="flex gap-3">
            <ShieldCheck size={15} className="text-zinc-600 mt-0.5 shrink-0" />
            <p>
              <span className="text-white font-semibold">Right to inquire</span> — You can ask about what data (if any) has been associated with your visit and request its removal. I will respond promptly.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <motion.div {...fadeUp(0.2)} className="border-t border-zinc-800 pt-8 text-xs text-zinc-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span>Questions? <a href="mailto:aditya.more@outlook.in" className="text-zinc-400 hover:text-white transition-colors">aditya.more@outlook.in</a></span>
        <Link href="/notice" className="text-zinc-600 hover:text-zinc-400 transition-colors">See also: Notice page →</Link>
      </motion.div>

    </div>
  );
}
