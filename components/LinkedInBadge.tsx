"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

export default function LinkedInBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl"
    >
      <a
        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-sky-500/35 hover:shadow-sm"
        href="https://www.linkedin.com/in/more-aditya"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400"><FaLinkedin size={19}/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--text)]">Aditya More</span><span className="block text-xs text-[var(--muted)]">View my LinkedIn profile</span></span>
        <ExternalLink size={14} className="text-[var(--sub-muted)]"/>
      </a>
    </motion.div>
  );
}
