"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Sparkles } from "lucide-react";
import { BB8DroidVisual } from "./BB8ChatDroid";
import styles from "./BB8ChatDroid.module.css";

export default function BB8Banner() {
  const openChat = () => window.dispatchEvent(new CustomEvent("openChatWidget"));

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="container-max relative z-[10] pb-10 md:pb-16"
      aria-labelledby="bb8-banner-title"
    >
      <div className="relative flex min-h-44 items-center overflow-hidden rounded-[1.75rem] border border-orange-500/25 bg-[var(--surface)] px-5 py-7 shadow-[0_24px_70px_rgba(249,115,22,0.11)] sm:px-8 md:pl-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_50%,rgba(249,115,22,0.22),transparent_30%),linear-gradient(110deg,transparent_45%,rgba(249,115,22,0.05))]" />
        <div className="absolute -left-2 bottom-0 hidden md:block">
          <div className={styles.bannerVisual}><BB8DroidVisual /></div>
        </div>

        <div className="relative flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:block">
            <div className="md:hidden">
              <div className={styles.bannerVisual}><BB8DroidVisual /></div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600 dark:text-orange-400">
                <Sparkles size={12} /> Portfolio co-pilot
              </p>
              <h2 id="bb8-banner-title" className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
                Explore the portfolio with BB-8
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                Ask about Aditya&apos;s projects, experience, skills, or availability. BB-8 can guide you to the right page, prepare a contact draft, and surface the resume.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openChat}
            className="cta-primary group inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full px-5 py-2.5 text-sm font-semibold md:self-center"
          >
            <Bot size={16} /> Talk to BB-8
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
