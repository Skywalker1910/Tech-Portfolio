"use client";

import { motion, type Easing } from "framer-motion";
import Link from "next/link";
import { Activity, Bot, BookOpen, Database, FlaskConical, GitBranch, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

const fadeUp = (delay = 0) => ({ initial:{ opacity:0, y:20 }, whileInView:{ opacity:1, y:0 }, viewport:{ once:true }, transition:{ duration:0.5, ease:"easeOut" as Easing, delay } });

const statusItems = [
  { icon:ShieldCheck, title:"Portfolio experience", status:"Live", tone:"emerald", description:"About, projects, experience, education, skills, socials, contact, resume, navigation previews, and light/dark presentation are available." },
  { icon:Bot, title:"BB-8 portfolio co-pilot", status:"Beta", tone:"orange", description:"BB-8 answers portfolio questions, cites relevant pages, navigates in place, offers the resume, and can prepare a contact draft for visitor review." },
  { icon:Database, title:"Hybrid RAG", status:"Operational", tone:"violet", description:"Semantic retrieval uses OpenAI embeddings and Amazon S3 Vectors when configured, with a deterministic keyword fallback if the vector service is unavailable." },
  { icon:Activity, title:"First-party traffic insights", status:"Limited", tone:"sky", description:"The primary site records anonymous path-level counters for the private owner dashboard. It does not use geolocation, fingerprints, advertising IDs, or third-party analytics SDKs." },
  { icon:GitBranch, title:"GitHub Pages mirror", status:"Static", tone:"slate", description:"The mirror provides public portfolio pages for restricted networks. Chat, contact submission, live content, admin tools, and analytics require the primary SSR deployment." },
];

const tones:Record<string,{dot:string;badge:string;icon:string}> = {
  emerald:{dot:"bg-emerald-500",badge:"border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",icon:"text-emerald-500"},
  orange:{dot:"bg-orange-500",badge:"border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400",icon:"text-orange-500"},
  violet:{dot:"bg-violet-500",badge:"border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",icon:"text-violet-500"},
  sky:{dot:"bg-sky-500",badge:"border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400",icon:"text-sky-500"},
  slate:{dot:"bg-slate-400",badge:"border-[var(--border)] bg-[var(--tag-bg)] text-[var(--muted)]",icon:"text-[var(--muted)]"},
};

const roadmap = [
  { icon:BookOpen, title:"Technical writing", description:"Long-form engineering notes, research summaries, and practical ML/AI articles." },
  { icon:FlaskConical, title:"Interactive ML demonstrations", description:"Browser-accessible demonstrations for selected machine-learning and computer-vision projects." },
  { icon:Sparkles, title:"Deeper project case studies", description:"Dedicated architecture, experiment, evaluation, and outcome pages for flagship work." },
];

export default function NoticePage() {
  return <div className="container-max mx-auto max-w-4xl py-12 md:py-20">
    <motion.header {...fadeUp()} className="mb-14">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500">Product status & disclosures</p>
      <h1 className="text-4xl font-bold text-[var(--text)] md:text-5xl">Notice</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">A current, plain-language view of what this portfolio provides, what remains experimental, and the limitations visitors should understand.</p>
      <p className="mt-3 text-xs text-[var(--sub-muted)]">Last updated: August 14, 2026</p>
    </motion.header>

    <motion.section {...fadeUp(0.05)} className="mb-14" aria-labelledby="status-heading">
      <div className="mb-6 flex items-center gap-3"><span className="h-px flex-1 bg-[var(--border)]"/><h2 id="status-heading" className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--sub-muted)]">Current status</h2><span className="h-px flex-1 bg-[var(--border)]"/></div>
      <div className="grid gap-4 md:grid-cols-2">
        {statusItems.map((item,index)=>{const Icon=item.icon;const tone=tones[item.tone];return <motion.article key={item.title} {...fadeUp(0.06+index*0.04)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--tag-bg)]"><Icon size={17} className={tone.icon}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-[var(--text)]">{item.title}</h3><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tone.badge}`}><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${tone.dot}`}/>{item.status}</span></div><p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{item.description}</p></div></div>
        </motion.article>})}
      </div>
    </motion.section>

    <motion.section {...fadeUp(0.1)} className="mb-14" aria-labelledby="disclosures-heading">
      <div className="mb-6 flex items-center gap-3"><span className="h-px flex-1 bg-[var(--border)]"/><h2 id="disclosures-heading" className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--sub-muted)]">Important disclosures</h2><span className="h-px flex-1 bg-[var(--border)]"/></div>
      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm leading-relaxed text-[var(--muted)]">
        <p><strong className="font-semibold text-[var(--text)]">AI-generated responses.</strong> BB-8 is designed to stay grounded in verified portfolio information, but generated answers can still be incomplete or mistaken. Confirm hiring, availability, research, or other consequential details directly with Aditya.</p>
        <p><strong className="font-semibold text-[var(--text)]">No autonomous outreach.</strong> BB-8 can prepare a contact-form draft only from details a visitor supplies. It cannot submit, email, or send anything on the visitor&apos;s behalf.</p>
        <p><strong className="font-semibold text-[var(--text)]">Live content.</strong> Projects and experience can be updated through a private Command Center. Recently published edits may temporarily differ from BB-8&apos;s semantic index until the owner runs the next deliberate reindex.</p>
        <p><strong className="font-semibold text-[var(--text)]">Availability.</strong> This is a personal portfolio and engineering showcase, not a guaranteed commercial service. Third-party API limits, maintenance, or deployment issues may temporarily reduce individual features.</p>
      </div>
    </motion.section>

    <motion.section {...fadeUp(0.15)} className="mb-14" aria-labelledby="roadmap-heading">
      <div className="mb-6 flex items-center gap-3"><span className="h-px flex-1 bg-[var(--border)]"/><h2 id="roadmap-heading" className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--sub-muted)]">Roadmap</h2><span className="h-px flex-1 bg-[var(--border)]"/></div>
      <div className="space-y-3">{roadmap.map(({icon:Icon,title,description})=><div key={title} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"><Icon size={16} className="mt-0.5 shrink-0 text-orange-500"/><div><h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{description}</p></div></div>)}</div>
    </motion.section>

    <motion.div {...fadeUp(0.2)} className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm text-[var(--muted)]"><TriangleAlert size={17} className="mt-0.5 shrink-0 text-amber-500"/><p>Data-handling details are maintained separately in the <Link href="/privacy" className="font-semibold text-[var(--text)] underline decoration-orange-500/50 underline-offset-4">Privacy Policy</Link>. Questions or corrections can be sent to <a href="mailto:aditya.more@outlook.in" className="font-semibold text-[var(--text)] underline decoration-orange-500/50 underline-offset-4">aditya.more@outlook.in</a>.</p></motion.div>
  </div>;
}
