"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Target, MapPin, ShieldCheck, Rocket } from "lucide-react";

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
      className="rounded-2xl border border-violet-400/80 bg-zinc-900 backdrop-blur-md shadow-2xl shadow-violet-500/40 p-5 ring-1 ring-inset ring-violet-300/20"
    >
      <motion.h2
        variants={item}
        className="text-xl font-bold mb-3 flex items-center gap-2 text-white"
      >
        <Rocket size={22} className="text-violet-300" /> Career Status
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Available
        </span>
      </motion.h2>

      <div className="space-y-2">
        {items.map(({ icon: Icon, text, highlight }, i) => (
          <motion.div
            key={i}
            variants={item}
            className="flex items-start gap-3 group"
          >
            <Icon
              size={20}
              className="mt-0.5 shrink-0 text-violet-300 group-hover:text-white transition-colors"
            />
            <span className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
              {highlight ? (
                <>
                  Open to Roles:{" "}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-200 text-xs font-medium border border-violet-400/40">
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
    </motion.div>
  );
}
