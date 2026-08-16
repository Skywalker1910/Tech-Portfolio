"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Target, MapPin, ShieldCheck, Rocket, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const items = [
  {
    icon: GraduationCap,
    text: "M.S. Computer Science — Clemson University\n(Dec 2025)",
  },
  {
    icon: Briefcase,
    text: "Experience: Data Science (Graduate Student Hourly @ Clemson)",
  },
  {
    icon: Target,
    text: "Open to Roles: AI Engineer • ML Engineer • Data Scientist",
    highlight: true,
  },
  {
    icon: MapPin,
    text: "United States (Willing to relocate anywhere within the United States)",
  },
  {
    icon: ShieldCheck,
    text: "Work Authorization: OPT (No sponsorship required immediately)",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function CareerStatus() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 backdrop-blur-xl shadow-2xl"
      style={{ boxShadow: "0 24px 70px color-mix(in srgb, var(--text) 16%, transparent), inset 0 1px rgba(255,255,255,.18)" }}
    >
      <motion.h2
        variants={item}
        className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text)]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
          <Rocket size={16} className="text-orange-500" />
        </span>
        Open to Work
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Available
        </span>
      </motion.h2>

      <div className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 p-2">
        {items.map(({ icon: Icon, text, highlight }, i) => (
          <motion.div
            key={i}
            variants={item}
            className="group flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-[var(--surface)]"
          >
            <Icon
              size={20}
              className="mt-0.5 shrink-0 text-orange-500 transition-colors group-hover:text-orange-400"
            />
            <span className="text-xs leading-relaxed text-[var(--muted)] whitespace-pre-line">
              {highlight ? (
                <>
                  Open to Roles:{" "}
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-300">
                    AI Engineer • ML Engineer • Data Scientist
                  </span>
                </>
              ) : (
                text
              )}
            </span>
          </motion.div>
        ))}
      </div>

      <Link
        href="/contact"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--hero-accent)] transition-opacity hover:opacity-75"
      >
        Discuss an opportunity <ArrowUpRight size={13} />
      </Link>
    </motion.div>
  );
}
