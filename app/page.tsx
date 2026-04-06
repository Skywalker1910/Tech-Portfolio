"use client";

import { useRef, useEffect, type ComponentType } from "react";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";
import SentenceFlip from "../components/SentenceFlip";
import CareerStatus from "../components/CareerStatus";
import OrbitalDivider from "../components/OrbitalDivider";
import { ShieldCheck, GraduationCap, Briefcase, ChevronDown, ArrowUpRight, ArrowRight, Brain, Eye, ShieldAlert, Languages, BookOpen, Phone, Workflow, Cpu, TestTube2, Bot, Swords, Car, Star, ClipboardList, Shield, Database, FlaskConical } from "lucide-react";
import { SiPython, SiTensorflow, SiOpencv, SiJupyter, SiCoursera, SiSelenium, SiPytorch, SiOpenai, SiScikitlearn, SiPandas, SiNumpy, SiDocker, SiPostgresql } from "react-icons/si";
import Link from "next/link";

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
const colorMap = {
  violet: {
    dot: "bg-violet-500",
    ring: "ring-violet-500/30",
    tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    bullet: "bg-violet-400",
    label: "text-violet-400",
  },
  teal: {
    dot: "bg-teal-500",
    ring: "ring-teal-500/30",
    tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",
    bullet: "bg-teal-400",
    label: "text-teal-400",
  },
  orange: {
    dot: "bg-orange-500",
    ring: "ring-orange-500/30",
    tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    bullet: "bg-orange-400",
    label: "text-orange-400",
  },
  blue: {
    dot: "bg-blue-500",
    ring: "ring-blue-500/30",
    tag: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    bullet: "bg-blue-400",
    label: "text-blue-400",
  },
  purple: {
    dot: "bg-purple-500",
    ring: "ring-purple-500/30",
    tag: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    bullet: "bg-purple-400",
    label: "text-purple-400",
  },
  pink: {
    dot: "bg-pink-400",
    ring: "ring-pink-400/30",
    tag: "bg-pink-400/10 text-pink-300 border border-pink-400/20",
    bullet: "bg-pink-300",
    label: "text-pink-300",
  },
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
  logo: { type: "image"; src: string; size?: number; filter?: string } | { type: "initials"; text: string; bg: string; fg: string };
}[] = [
  {
    period: "Aug 2024 – Dec 2025",
    title: "M.S. Computer Science",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    type: "Education",
    color: "orange",
    tags: ["Machine Learning", "AI Security", "NLP", "Computer Vision"],
    logo: { type: "image", src: "/clemson-university-logo.png", size: 110 },
    bullets: [
      "Specialized in ML, adversarial AI, and data-driven systems.",
      "Replicated MASTERKEY jailbreak attacks on GPT models with custom evaluation metrics for model defenses.",
      "Implemented adversarial patches against self-driving car depth estimation systems.",
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
      "Designed and automated lab & homework assignments for a graduate Applied Data Science course.",
      "Built grading pipelines using nbgrader, reducing manual effort by 60%.",
      "Supported 40+ students through office hours and course material development.",
    ],
  },
  {
    period: "Oct 2021 – Jul 2023",
    title: "Software Test Engineer",
    org: "Amdocs",
    location: "Pune, India",
    type: "Work",
    color: "pink",
    tags: ["Test Automation", "Telecom", "Agile", "QA"],
    logo: { type: "image", src: "/amdocs-logo.png" },
    bullets: [
      "Executed functional and regression testing for telecom billing and OSS/BSS systems.",
      "Automated test cases using scripting tools, improving test coverage by 35%.",
      "Collaborated in Agile sprints across cross-functional global teams.",
    ],
  },
  {
    period: "Jul 2017 – Jul 2021",
    title: "B.E. Computer Engineering",
    org: "D.Y. Patil College of Engineering",
    location: "Kolhapur, India",
    type: "Education",
    color: "blue",
    tags: ["Computer Engineering", "Python", "OpenCV", "TensorFlow"],
    logo: { type: "image", src: "/dypcet-logo.png", size: 200, filter: "brightness(0) invert(1)" },
    bullets: [
      "Graduated with Bachelor of Engineering in Computer Engineering.",
      "Built a Covid-19 Safeguard System using OpenCV & TensorFlow for real-time surveillance.",
      "Active member of coding club; built ML projects during final year.",
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
function TimelineItem({
  item,
  index,
  onVisible,
}: {
  item: (typeof timelineItems)[0];
  index: number;
  onVisible?: () => void;
}) {
  const c = colorMap[item.color];
  const Icon = item.type === "Education" ? GraduationCap : Briefcase;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — fire onVisible when item occupies the center band
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !onVisible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onVisible();
      },
      { threshold: 0.35 },   // item is >35% visible → considered "active"
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut", delay: index * 0.05 }}
      className="relative grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-10 group"
    >
      {/* ── Left: date + location + logo ── */}
      <div className="md:text-right md:pt-1 md:pr-5 flex md:flex-col gap-3 md:gap-1 items-center md:items-end">
        <span className="text-[13px] font-mono text-zinc-400 whitespace-nowrap">
          {item.period}
        </span>
        <span className="text-[13px] text-zinc-400 whitespace-nowrap">{item.location}</span>
        {/* Logo — desktop only, sits below location */}
        <div className="hidden md:flex justify-end mt-2">
          {item.logo.type === "image" ? (
            <Image
              src={item.logo.src}
              alt={item.org}
              width={item.logo.size ?? 160}
              height={item.logo.size ?? 160}
              className="rounded opacity-100 hover:scale-105 transition-all duration-200 object-contain"
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
        className={`absolute left-0 md:left-[240px] top-1.5 w-3 h-3 rounded-full -translate-x-[6px] md:translate-x-[calc(-50%-0.5px)] ${c.dot} ring-4 ring-zinc-950 group-hover:ring-8 group-hover:${c.ring} transition-all duration-300 z-10`}
      />

      {/* ── Right: content ── */}
      <div className="pl-6 md:pl-0">
        {/* org + type badge — logo shown inline on mobile */}
        <div className="flex items-center gap-2 mb-1.5">
          {/* Mobile logo */}
          <span className="md:hidden">
            {item.logo.type === "image" ? (
              <Image
                src={item.logo.src}
                alt={item.org}
                width={100}
                height={100}
                className="rounded opacity-100 object-contain"
                style={item.logo.filter ? { filter: item.logo.filter } : undefined}
              />
            ) : (
              <span
                className="inline-flex items-center justify-center w-[100px] h-[100px] rounded text-sm font-bold"
                style={{ background: item.logo.bg, color: item.logo.fg }}
              >
                {item.logo.text}
              </span>
            )}
          </span>
          <Icon size={14} className="text-zinc-500 shrink-0" />
          <span className={`text-[11px] font-semibold uppercase tracking-widest ${c.label}`}>
            {item.org}
          </span>
        </div>

        {/* title */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
          {item.title}
        </h3>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((tag) => {
            const TagIcon = TAG_ICONS[tag];
            return (
              <span key={tag} className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full ${c.tag}`}>
                {TagIcon && <TagIcon size={10} />}
                {tag}
              </span>
            );
          })}
        </div>

        {/* bullets */}
        <ul className="space-y-2">
          {item.bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm text-zinc-400 leading-relaxed">
              <span className={`mt-2 w-1 h-1 rounded-full shrink-0 ${c.bullet} opacity-70`} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  // Hero transforms: scale down + drift left on scroll
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.72]);
  const heroX = useTransform(scrollYProgress, [0, 0.4], ["0%", "-22%"]);

  // Career card: fade + slide in from right + brighten
  const cardOpacity = useTransform(scrollYProgress, [0.06, 0.09, 0.38], [0, 0.9, 1]);
  const cardX = useTransform(scrollYProgress, [0.06, 0.38], [80, 0]);
  const cardBrightness = useTransform(scrollYProgress, [0.06, 0.33, 0.38], [0.3, 2.0, 1.0]);
  const cardFilter = useTransform(cardBrightness, (v) => `brightness(${v}) saturate(${0.4 + v * 0.8})`);

  // Scroll hint arrow: fades out early
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <div>
      {/* ═══════════════════════════════════════════
          STICKY HERO  (220 vh scroll container)
      ═══════════════════════════════════════════ */}
      <div ref={scrollRef} style={{ height: "130vh" }}>
        <div className="sticky top-24 h-[calc(100vh-6rem)] flex flex-col justify-center overflow-hidden relative z-[10]">
          <div className="container-max w-full">
            <div className="relative flex items-center justify-center">

              {/* ── Hero copy: full-width centered initially, drifts left on scroll ── */}
              <motion.div
                style={{
                  scale: heroScale,
                  x: heroX,
                  transformOrigin: "center center",
                }}
                className="w-full text-center"
              >
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight whitespace-nowrap">
                  Hi, I&apos;m{" "}
                  <span className="text-orange-400">Aditya More</span>
                </h1>

                <div className="mt-2 inline-block text-left">
                  <SentenceFlip
                    lines={[
                      "AI / ML Systems",
                      "Data Science Practitioner",
                      "Building ML Systems & Data-Driven Projects",
                      "Python \u2022 Machine Learning \u2022 Deep Learning \u2022 MLOps",
                      "Open to Full-Time Roles",
                    ]}
                    interval={2500}
                  />
                </div>

                <p className="mt-0.5 text-xl text-slate-300 max-w-2xl leading-relaxed mx-auto text-center">
                  Experienced in building machine learning systems, data-driven models, and
                  AI solutions across the full ML pipeline — from data preprocessing and
                  model development to evaluation and deployment.
                </p>

                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <Link
                    href="/projects"
                    className="rounded-full px-5 py-2.5 bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                  >
                    View Projects
                  </Link>
                  <Link
                    href="/experience"
                    className="rounded-full px-5 py-2.5 border border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    Experience
                  </Link>
                  <a
                    href="mailto:aditya.more@outlook.in"
                    className="rounded-full px-5 py-2.5 bg-orange-600 text-white hover:bg-orange-500 transition-colors"
                  >
                    Get in Touch
                  </a>
                </div>

                <p className="mt-3 text-sm text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-slate-400 shrink-0" />
                  <span>
                    <strong>Work Authorization:</strong> Authorized to work in the United States
                  </span>
                </p>
              </motion.div>

              {/* ── Career status card: absolute right, fades in as hero drifts left ── */}
              <motion.div
                style={{ opacity: cardOpacity, x: cardX, filter: cardFilter }}
                className="absolute right-0 top-[50%] -translate-y-1/2 hidden md:block w-[440px] pointer-events-none"
              >
                <div className="pointer-events-auto">
                  <CareerStatus />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Orbital ring divider — fills the lower hero gap with a galactic arc */}
          <OrbitalDivider />

          {/* Scroll hint */}
          <motion.div
            style={{ opacity: arrowOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-600"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase">scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MY STORY — REVERSE TIMELINE
      ═══════════════════════════════════════════ */}
      <section className="container-max py-10 md:py-16 relative z-[10]">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-3">
            My Story
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">The Journey</h2>
          <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
            From engineering college in Pune to cutting-edge ML research in the United States —
            here&apos;s how it unfolded.
          </p>
        </motion.div>

        {/* Entries */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-0 md:left-[240px] top-0 bottom-0 w-px bg-gradient-to-b from-zinc-700 via-zinc-800 to-transparent md:-translate-x-[0.5px]" />

          <div className="space-y-16 md:space-y-20">
            {timelineItems.map((item, i) => (
              <TimelineItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <Link
            href="/experience"
            className="rounded-full px-6 py-3 bg-zinc-900 border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          >
            Full Experience →
          </Link>
          <Link
            href="/projects"
            className="rounded-full px-6 py-3 bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors"
          >
            See My Projects →
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED WORK — CURATED PROJECTS
      ═══════════════════════════════════════════ */}
      <section className="container-max py-16 md:py-24 relative z-[10]">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-600 mb-3">
            Featured Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Curated work</h2>
          <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
            A selection of projects spanning AI security, computer vision, and machine learning systems.
          </p>
        </motion.div>

        {/* Project rows */}
        <div>
          {featuredProjects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
              className="group border-b border-zinc-800/60 py-8 first:border-t flex flex-col md:flex-row gap-6 md:gap-10 items-stretch"
            >
              {/* Number */}
              <span className="text-6xl md:text-8xl font-black text-zinc-800/70 group-hover:text-zinc-700 transition-colors shrink-0 leading-none font-mono select-none">
                {project.num}
              </span>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500 border border-zinc-700/70 px-2 py-0.5 rounded">
                    {project.type}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600">{project.year}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-violet-200 transition-colors duration-300 mb-3 leading-snug">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4 max-w-lg">
                  {project.blurb}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => {
                    const TagIcon = TAG_ICONS[tag];
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                      >
                        {TagIcon && <TagIcon size={9} />}
                        {tag}
                      </span>
                    );
                  })}
                </div>
                <Link
                  href={project.href}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors w-fit"
                >
                  View project <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Animated preview */}
              <div className="md:w-60 lg:w-72 h-44 md:h-auto rounded-2xl overflow-hidden shrink-0 relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.preview.bg}`} />
                {/* Orb 1 */}
                <motion.div
                  className={`absolute top-5 left-8 w-28 h-28 rounded-full ${project.preview.orb1} blur-3xl opacity-50`}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.3, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Orb 2 */}
                <motion.div
                  className={`absolute bottom-5 right-8 w-20 h-20 rounded-full ${project.preview.orb2} blur-2xl opacity-40`}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.25, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                />
                {/* Subtle grid overlay */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                {/* Hover link overlay */}
                <Link
                  href={project.href}
                  className="absolute inset-0 flex items-end justify-end p-3 group/preview"
                  tabIndex={-1}
                  aria-hidden
                >
                  <span className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-white/80 font-medium opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1">
                    View <ArrowUpRight size={10} />
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-4 select-none"
          >
            {/* Glitch-coloured spaced label */}
            <span
              className="text-xs md:text-sm font-bold tracking-[0.35em] uppercase"
              style={{
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #a78bfa 35%, #f472b6 65%, #fb923c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              See More Projects
            </span>

            {/* Circle arrow button */}
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 group-hover:bg-zinc-700 group-hover:border-zinc-500 transition-all duration-200">
              <ArrowRight size={15} className="text-white group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
