"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SentenceFlip from "../components/SentenceFlip";
import { ShieldCheck, GraduationCap, Briefcase, ArrowRight, Brain, Eye, ShieldAlert, Languages, BookOpen, Phone, Workflow, Cpu, TestTube2, Bot, Swords, Car, Star, ClipboardList, Shield, FlaskConical } from "lucide-react";
import { SiPython, SiTensorflow, SiOpencv, SiJupyter, SiCoursera, SiSelenium, SiPytorch, SiOpenai, SiScikitlearn, SiPandas, SiNumpy, SiDocker, SiPostgresql, SiGit, SiPostman, SiFastapi, SiMysql, SiCplusplus, SiPlotly } from "react-icons/si";
import Link from "next/link";
import BB8Banner from "../components/BB8Banner";
import type { ExperienceContent, ProjectContent } from "@/lib/content/types";

// ─── Tag icon map ────────────────────────────────────────────────────────────
const TAG_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  // Brand / library icons (Simple Icons)
  "Python":                  SiPython,
  "TensorFlow":              SiTensorflow,
  "OpenCV":                  SiOpencv,
  "nbgrader":                SiJupyter,
  "Coursera":                SiCoursera,
  "Test Automation":         SiSelenium,
  "Deep Learning":           SiPytorch,
  "PyTorch":                 SiPytorch,
  "GPT-4":                   SiOpenai,
  "scikit-learn":            SiScikitlearn,
  "pandas":                  SiPandas,
  "NumPy":                   SiNumpy,
  "Docker":                  SiDocker,
  "PostgreSQL":              SiPostgresql,
  // Conceptual / domain icons (Lucide)
  "Machine Learning":        Brain,
  "ML Pipeline":             Brain,
  "AI Security":             ShieldAlert,
  "NLP":                     Languages,
  "Computer Vision":         Eye,
  "Curriculum Design":       BookOpen,
  "Telecom":                 Phone,
  "Agile":                   Workflow,
  "Air Quality":             Workflow,
  "QA":                      TestTube2,
  "Computer Engineering":    Cpu,
  "LLM":                     Bot,
  "LLM Agents":              Bot,
  "Generative AI":           Bot,
  "Multi-Agent Systems":     Bot,
  "Human Behavior Simulation": Brain,
  "Transformers":            Bot,
  "Adversarial AI":          Swords,
  "Adversarial ML":          Swords,
  "AV Safety":               Car,
  "Recommender Systems":     Star,
  "AI Agents":               Bot,
  "Evaluation":              ClipboardList,
  "Security":                Shield,
  "Flask":                   FlaskConical,
};

// ─── Timeline data ───────────────────────────────────────────────────────────
/* Single accent style — CSS vars drive both light and dark theme */
const colorMap = {
  violet: { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
  teal:   { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
  orange: { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
  blue:   { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
  purple: { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
  pink:   { dot: "bg-[var(--accent)]", ring: "ring-[var(--accent)]/20", tag: "bg-[var(--tag-bg)] text-[var(--tag-text)] border border-[var(--tag-border)]", bullet: "bg-[var(--sub-muted)]", label: "text-[var(--muted)]" },
} as const;

type ColorKey = keyof typeof colorMap;

const timelineItems: {
  period: string;
  title: string;
  org: string;
  location: string;
  type: string;
  color: ColorKey;
  tags: string[];
  bullets: string[];
  logo: { type: "image"; src: string; size?: number; filter?: string; darkOnly?: boolean } | { type: "initials"; text: string; bg: string; fg: string };
}[] = [
  {
    period: "May 2026 – Present",
    title: "Researcher - LLM Agents and Human Behavior",
    org: "Clemson University, School of Computing",
    location: "Clemson, SC / Remote",
    type: "Research",
    color: "orange",
    tags: ["LLM Agents", "Generative AI", "Multi-Agent Systems", "Human Behavior Simulation", "Python"],
    logo: { type: "image", src: "/soc-logo.png", size: 187 },
    bullets: [
      "Researching the capabilities and limitations of LLM-based agents in simulating human behavior under the supervision of Dr. Long Cheng.",
      "Evaluating multi-agent simulation frameworks and reproducing behavioral experiments to compare AI-agent behavior with human baselines.",
      "Developing a taxonomy and evaluation framework for measuring behavioral realism across social and decision-making scenarios.",
    ],
  },
  {
    period: "Jan 2024 – Dec 2025",
    title: "M.S. Computer Science",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    type: "Education",
    color: "orange",
    tags: ["Machine Learning", "AI Security", "NLP", "Computer Vision"],
    logo: { type: "image", src: "/clemson-university-logo.png", size: 110 },
    bullets: [
      "Developed advanced expertise in Data Science and Machine Learning.",
      "Completed coursework in Machine Learning, Deep Learning, Cloud Computing, Algorithm Design and Statistical Methods.",
      "Graduated with Master of Science in Computer Science.",
    ],
  },
  {
    period: "Aug 2024 – Dec 2025",
    title: "Graduate Student Hourly – Data Science",
    org: "Clemson University, School of Computing",
    location: "Clemson, SC, USA",
    type: "Work",
    color: "purple",
    tags: ["Python", "nbgrader", "Coursera", "Curriculum Design"],
    logo: { type: "image", src: "/soc-logo.png", size: 187 },
    bullets: [
      "Designed and automated Jupyter-based labs and assignments for graduate-level Data Science class.",
      "Built nbgrader pipelines, reducing manual grading effort.",
      "Supported students with ML workflows, debugging, and course guidance through office hours.",
    ],
  },
  {
    period: "Oct 2021 – Jul 2023",
    title: "Software Engineer",
    org: "Amdocs",
    location: "Pune, India",
    type: "Work",
    color: "pink",
    tags: ["Test Automation", "Telecom", "Agile", "QA"],
    logo: { type: "image", src: "/amdocs-logo.png" },
    bullets: [
      "Performed end-to-end and API testing for large-scale telecom systems (AT&T).",
      "Designed test strategies and validation workflows for production releases.",
      "Collaborated across global Agile teams (US & India).",
    ],
  },
  {
    period: "Jul 2017 – Jul 2021",
    title: "B.E. Computer Science and Engineering",
    org: "D.Y. Patil College of Engineering and Technology",
    location: "Kolhapur, India",
    type: "Education",
    color: "blue",
    tags: ["Computer Engineering", "Python", "OpenCV", "TensorFlow"],
    logo: { type: "image", src: "/dypcet-logo.png", size: 200, darkOnly: true },
    bullets: [
      "Built strong foundations in programming, data structures, algorithms, and system design.",
      "Graduated with Bachelor of Engineering in Computer Science.",
      "Led a 5-member team to develop computer vision systems for real-world applications.",
    ],
  },
];

// ─── Featured projects data ─────────────────────────────────────────────────
const featuredProjects = [
  {
    num: "01",
    type: "ML System",
    title: "Personalized Movie Recommendation System",
    year: "2024",
    tags: ["Recommender Systems", "PyTorch", "Flask", "PostgreSQL", "Docker"],
    blurb:
      "End-to-end recommendation engine processing 26M+ ratings with FunkSVD matrix factorization, achieving ~21% improvement over baseline (RMSE 0.76).",
    href: "/projects",
    preview: {
      bg: "from-violet-950 via-purple-900/60 to-indigo-950",
      orb1: "bg-violet-500",
      orb2: "bg-indigo-400",
    },
  },
  {
    num: "02",
    type: "ML Pipeline",
    title: "Skynet – AQI Prediction System",
    year: "2025",
    tags: ["ML Pipeline", "scikit-learn", "pandas", "NumPy", "Air Quality"],
    blurb:
      "Built an ML pipeline to forecast Air Quality Index using NASA TEMPO, OpenAQ, weather, and traffic data with temporal and spatial pattern modeling.",
    href: "/projects",
    preview: {
      bg: "from-teal-950 via-cyan-900/60 to-emerald-950",
      orb1: "bg-teal-400",
      orb2: "bg-cyan-400",
    },
  },
  {
    num: "03",
    type: "LLM Research",
    title: "R2D2 – Experimental Transformer-based LLM",
    year: "2025",
    tags: ["PyTorch", "Transformers", "NLP", "Deep Learning"],
    blurb:
      "Building transformer architectures from scratch to understand LLM internals — implementing tokenization, embeddings, and attention mechanisms.",
    href: "/projects",
    preview: {
      bg: "from-orange-950 via-amber-900/60 to-red-950",
      orb1: "bg-orange-400",
      orb2: "bg-amber-300",
    },
  },
];

// ─── Timeline item component ─────────────────────────────────────────────────
function TimelineItem({ item, index }: { item: (typeof timelineItems)[0]; index: number }) {
  const c = colorMap[item.color];
  const Icon = item.type === "Education" ? GraduationCap : Briefcase;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageLogo = item.logo.type === "image" ? item.logo : null;
  const isClemsonDegree = imageLogo?.src === "/clemson-university-logo.png";
  const isAmdocsRole = imageLogo?.src === "/amdocs-logo.png";
  const isDypcetDegree = imageLogo?.src === "/dypcet-logo.png";
  const usesSplitMobileHeader = isClemsonDegree || isAmdocsRole;

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut", delay: index * 0.05 }}
      className="relative grid grid-cols-1 gap-4 pl-8 md:grid-cols-[240px_1fr] md:gap-10 md:pl-0 group"
    >
      {/* ── Left: date + location + logo ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:flex-col md:items-end md:gap-1 md:pr-5 md:pt-1 md:text-right">
        <span className="text-[13px] font-mono text-[var(--muted)] whitespace-nowrap">
          {item.period}
        </span>
        <span className="text-[13px] text-[var(--muted)]">{item.location}</span>
        {/* Logo — desktop only, sits below location */}
        <div className="hidden md:flex justify-end mt-2">
          {item.logo.type === "image" ? (
            <Image
              src={item.logo.src}
              alt={item.org}
              width={item.logo.size ?? 160}
              height={item.logo.size ?? 160}
              className={`rounded opacity-100 hover:scale-105 transition-all duration-200 object-contain${item.logo.darkOnly ? " dypcet-logo" : ""}`}
              style={item.logo.filter ? { filter: item.logo.filter } : undefined}
              title={item.org}
            />
          ) : (
            <span
              className="inline-flex items-center justify-center w-40 h-40 rounded text-lg font-bold tracking-wide hover:scale-105 transition-transform duration-200"
              style={{ background: item.logo.bg, color: item.logo.fg }}
              title={item.org}
            >
              {item.logo.text}
            </span>
          )}
        </div>
      </div>

      {/* ── Dot on the line ── */}
      <div
        className={`absolute left-2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full md:left-[240px] md:translate-x-[calc(-50%-0.5px)] ${c.dot} ring-4 ring-[var(--dot-ring)] group-hover:ring-8 group-hover:${c.ring} transition-all duration-300 z-10`}
      />

      {/* ── Right: content ── */}
      <div>
        {/* org + type badge — logo shown inline on mobile */}
        <div className="mb-2 flex flex-col items-start gap-2 md:mb-1.5 md:flex-row md:items-center">
          {/* Mobile logo */}
          {!usesSplitMobileHeader && (
          <span className={`flex w-full items-center justify-start md:hidden ${isDypcetDegree ? "h-24" : "h-16"}`}>
            {item.logo.type === "image" ? (
              <Image
                src={item.logo.src}
                alt={item.org}
                width={isDypcetDegree ? 280 : 180}
                height={isDypcetDegree ? 96 : 64}
                className={`${isDypcetDegree ? "h-24 w-[min(78vw,280px)] object-cover object-[center_37%]" : "h-16 w-[min(52vw,180px)] object-contain object-left"} rounded opacity-100${item.logo.darkOnly ? " dypcet-logo" : ""}`}
                style={item.logo.filter ? { filter: item.logo.filter } : undefined}
              />
            ) : (
              <span
                className="inline-flex h-14 min-w-24 items-center justify-center rounded px-4 text-sm font-bold"
                style={{ background: item.logo.bg, color: item.logo.fg }}
              >
                {item.logo.text}
              </span>
            )}
          </span>
          )}
          <div className={`${usesSplitMobileHeader ? "hidden md:flex" : "flex"} min-w-0 items-start gap-2`}>
            <Icon size={14} className="mt-0.5 shrink-0 text-[var(--muted)]" />
            <span className={`min-w-0 break-words text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em] md:tracking-widest ${c.label}`}>
              {item.org}
            </span>
          </div>
        </div>

        {/* title */}
        {usesSplitMobileHeader && imageLogo ? (
          <>
            <div className={`mb-3 grid items-start gap-3 md:hidden ${isClemsonDegree ? "grid-cols-[minmax(0,1fr)_96px]" : "grid-cols-[minmax(0,1fr)_160px]"}`}>
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-snug text-[var(--text)] sm:text-xl">{item.title}</h3>
                <div className="mt-2 flex min-w-0 items-start gap-2">
                  <Icon size={14} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                  <span className={`min-w-0 break-words text-[10px] font-semibold uppercase leading-relaxed tracking-[0.1em] ${c.label}`}>
                    {item.org}
                  </span>
                </div>
                {isClemsonDegree && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag) => {
                      const TagIcon = TAG_ICONS[tag];
                      return (
                        <span key={tag} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${c.tag}`}>
                          {TagIcon && <TagIcon size={10} />}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <Image
                src={imageLogo.src}
                alt={item.org}
                width={isClemsonDegree ? 96 : 160}
                height={isClemsonDegree ? 96 : 64}
                className={`${isClemsonDegree ? "h-24 w-24" : "h-16 w-40"} justify-self-end object-contain object-right`}
                style={imageLogo.filter ? { filter: imageLogo.filter } : undefined}
              />
            </div>
            <h3 className="mb-3 hidden text-2xl font-bold leading-snug text-[var(--text)] md:block">{item.title}</h3>
          </>
        ) : (
          <h3 className="mb-3 text-lg font-bold leading-snug text-[var(--text)] sm:text-xl md:text-2xl">
            {item.title}
          </h3>
        )}

        {/* tags */}
        <div className={`mb-4 flex-wrap ${isClemsonDegree ? "hidden gap-1 md:flex" : "flex gap-1.5"}`}>
          {item.tags.map((tag) => {
            const TagIcon = TAG_ICONS[tag];
            return (
              <span key={tag} className={`inline-flex items-center gap-1 rounded-full py-0.5 ${isClemsonDegree ? "px-2 text-[10px] sm:px-2.5 sm:text-[11px]" : "px-2.5 text-[11px]"} ${c.tag}`}>
                {TagIcon && <TagIcon size={10} />}
                {tag}
              </span>
            );
          })}
        </div>

        {/* bullets */}
        <ul className="space-y-2">
          {item.bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-[var(--muted)] leading-relaxed">
              <span className={`mt-2 w-1 h-1 rounded-full shrink-0 ${c.bullet} opacity-70`} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Skills ribbon data (doubled in JSX for seamless loop) ──────────────────
const skillSnapshot = [
  { name: "Python",       Icon: SiPython },
  { name: "PyTorch",      Icon: SiPytorch },
  { name: "TensorFlow",   Icon: SiTensorflow },
  { name: "scikit-learn", Icon: SiScikitlearn },
  { name: "pandas",       Icon: SiPandas },
  { name: "NumPy",        Icon: SiNumpy },
  { name: "OpenCV",       Icon: SiOpencv },
  { name: "Docker",       Icon: SiDocker },
  { name: "PostgreSQL",   Icon: SiPostgresql },
  { name: "Git",          Icon: SiGit },
  { name: "Jupyter",      Icon: SiJupyter },
  { name: "FastAPI",      Icon: SiFastapi },
  { name: "SQL",          Icon: SiMysql },
  { name: "C++",          Icon: SiCplusplus },
  { name: "Plotly",       Icon: SiPlotly },
  { name: "Selenium",     Icon: SiSelenium },
  { name: "OpenAI API",   Icon: SiOpenai },
  { name: "Postman",      Icon: SiPostman },
];

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [homeTimeline, setHomeTimeline] = useState(timelineItems);
  const [homeProjects, setHomeProjects] = useState(featuredProjects);

  useEffect(() => {
    fetch("/api/content/experience").then((r) => r.ok ? r.json() : Promise.reject()).then((items:ExperienceContent[]) => {
      const work = items.filter((item) => item.showOnTimeline).map((item) => ({ period:item.period, title:item.title, org:`${item.organization}${item.subdepartment ? `, ${item.subdepartment}` : ""}`, location:item.location, type:item.type.toLowerCase().includes("research") ? "Research" : "Work", color:item.accent as ColorKey, tags:item.tags.slice(0, 5), logo:{ type:"image" as const, src:item.logo ?? "/soc-logo.png", size:item.organization === "Amdocs" ? undefined : 187 }, bullets:item.bullets.slice(0, 3) }));
      const education = timelineItems.filter((item) => item.type === "Education");
      if (work.length) setHomeTimeline([...work, ...education]);
    }).catch(() => {});
    fetch("/api/content/projects").then((r) => r.ok ? r.json() : Promise.reject()).then((items:ProjectContent[]) => {
      const palettes = [
        { bg:"from-violet-950 via-purple-900/60 to-indigo-950", orb1:"bg-violet-500", orb2:"bg-indigo-400" },
        { bg:"from-teal-950 via-cyan-900/60 to-emerald-950", orb1:"bg-teal-400", orb2:"bg-cyan-400" },
        { bg:"from-orange-950 via-amber-900/60 to-red-950", orb1:"bg-orange-400", orb2:"bg-amber-300" },
      ];
      const featured = items.filter((item) => item.featured).slice(0, 5).map((item, index) => ({ num:String(index + 1).padStart(2,"0"), type:item.status === "in-progress" ? "In progress" : "Project", title:item.title, year:String(item.year), tags:item.tags.slice(0, 5), blurb:item.blurb, href:"/projects", preview:palettes[index % palettes.length] }));
      if (featured.length) setHomeProjects(featured);
    }).catch(() => {});
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section ref={scrollRef} className="min-h-screen flex flex-col justify-center relative z-[10]">
        <div className="container-max w-full pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full text-center"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight text-[var(--text)]">
              Hi, I&apos;m{" "}
              <span className="text-[var(--hero-accent)]">Aditya More</span>
            </h1>

            {/* Rotating showcase — cycles through projects, skills, and identity */}
            <div className="mt-4 flex justify-center">
              <SentenceFlip
                lines={[
                  "MS Computer Science · Clemson University · 2025",
                  "Built a Movie Recommendation Engine · 26M+ Ratings · PyTorch",
                  "Air Quality Prediction Pipeline · NASA TEMPO · scikit-learn",
                  "LLM Research · Transformer Architecture from Scratch",
                  "AI Security · Adversarial ML · Computer Vision",
                  "Python · Deep Learning · NLP · Data Science",
                  "Open to AI / ML & Data Science Roles",
                ]}
                interval={2800}
                className="text-[var(--hero-accent)]"
              />
            </div>

            <p className="mt-5 text-base sm:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mx-auto px-2 sm:px-0">
              Graduate researcher and ML practitioner who builds end-to-end data science systems —
              from model development and experimentation to evaluation and deployment.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center sm:flex-row">
              {[
                { href: "/projects", label: "View Projects" },
                { href: "/experience", label: "Experience" },
                { href: "/contact", label: "Get in Touch" },
              ].map((cta, index) => (
                <div key={cta.href} className="flex items-center">
                  {index > 0 && <span className="mx-6 hidden h-8 w-px bg-[var(--border)] sm:block" aria-hidden="true" />}
                  <Link
                    href={cta.href}
                    className="group flex items-center gap-4 py-2 text-xs font-bold uppercase tracking-[0.28em]"
                  >
                    <span className="text-[var(--cta-bg)]">{cta.label}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--cta-bg)] bg-[var(--cta-bg)] text-[var(--cta-text)] shadow-sm transition-all group-hover:-translate-y-0.5">
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-[var(--sub-muted)] flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="shrink-0" />
              <span>Authorized to work in the United States</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SKILLS RIBBON
      ═══════════════════════════════════════════ */}
      <section className="py-8 relative z-[10] border-t border-[var(--border)] overflow-hidden">
        {/* Section label */}
        <p className="text-center text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--sub-muted)] mb-5">
          Core Skills
        </p>
        {/* Fade masks on left and right edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--bg), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
        />

        <div className="flex gap-3 skills-ticker" style={{ width: "max-content" }}>
          {/* Duplicate array for seamless infinite scroll */}
          {[...skillSnapshot, ...skillSnapshot].map(({ name, Icon }, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--tag-text)] text-sm whitespace-nowrap shrink-0 select-none"
            >
              <Icon size={14} className="text-[var(--muted)] shrink-0" />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CAREER TIMELINE
      ═══════════════════════════════════════════ */}
      <section className="container-max py-10 md:py-16 relative z-[10]">
        <div className="border-t border-[var(--border)] pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--sub-muted)] mb-3">
              My Story
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">Career Timeline</h2>
            <p className="mt-3 text-[var(--muted)] max-w-lg text-sm leading-relaxed">
              From early foundations in computer science to building modern AI and data science systems — focused on machine learning, data-driven solutions, and real-world application.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute bottom-0 left-2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--timeline-line)] via-[var(--border)] to-transparent md:left-[240px] md:-translate-x-[0.5px]" />
            <div className="space-y-16 md:space-y-20">
              {homeTimeline.map((item, i) => (
                <TimelineItem key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 flex flex-wrap gap-4"
          >
            <Link
              href="/experience"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Full Experience <ArrowRight size={14} />
            </Link>
            <span className="text-[var(--num-color)]">·</span>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              See My Projects <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PROJECTS
      ═══════════════════════════════════════════ */}
      <section className="container-max py-16 md:py-24 relative z-[10]">
        <div className="border-t border-[var(--border)] pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--sub-muted)] mb-3">
              Featured Work
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">Featured Projects</h2>
            <p className="mt-3 text-[var(--muted)] max-w-lg text-sm leading-relaxed">
              Selected projects spanning machine learning, GenAI, and computer vision — focused on real-world systems and experimentation.
            </p>
          </motion.div>

          <div>
            {homeProjects.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
                className="group border-b border-[var(--border)] py-8 first:border-t flex flex-col md:flex-row gap-6 md:gap-10 items-stretch"
              >
                <span className="text-5xl sm:text-6xl md:text-8xl font-black text-[var(--num-color)] group-hover:text-[var(--border)] transition-colors shrink-0 leading-none font-mono select-none">
                  {project.num}
                </span>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[var(--muted)] border border-[var(--border)] px-2 py-0.5 rounded">
                      {project.type}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--sub-muted)]">{project.year}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 mb-3 leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 max-w-lg">
                    {project.blurb}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => {
                      const TagIcon = TAG_ICONS[tag];
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                        >
                          {TagIcon && <TagIcon size={9} />}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent)] transition-colors w-fit"
                  >
                    View project <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Clean preview panel — no animated orbs */}
                <Link
                  href={project.href}
                  className="md:w-60 lg:w-72 h-44 md:h-auto rounded-xl overflow-hidden shrink-0 relative bg-[var(--surface)] border border-[var(--border)] hover:border-zinc-600 transition-colors flex items-center justify-center"
                  tabIndex={-1}
                >
                  <span className="text-[var(--sub-muted)] text-xs font-medium tracking-widest uppercase">
                    {project.type}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-12"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              See All Projects <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <BB8Banner />

      {/* ═══════════════════════════════════════════
          CONTACT CTA
      ═══════════════════════════════════════════ */}
      <section className="container-max py-16 md:py-24 relative z-[10]">
        <div className="border-t border-[var(--border)] pt-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--sub-muted)] mb-3">
              Get in Touch
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">Let&apos;s Connect</h2>
            <p className="text-[var(--muted)] text-sm md:text-base leading-relaxed mb-8 max-w-lg">
              Open to full-time AI/ML engineering and data science roles. Feel free to reach out directly or explore my work.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Contact Me <ArrowRight size={15} />
              </Link>
              <Link
                href="/projects"
                className="cta-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                View All Projects <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
