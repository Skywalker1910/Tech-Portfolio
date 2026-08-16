"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Briefcase, MapPin, CheckCircle2, GraduationCap, Code2, Bot, Users, Brain, BookOpen, FlaskConical, Activity } from "lucide-react";
import { SiPython, SiJupyter, SiScikitlearn, SiPandas, SiNumpy, SiPostman, SiSelenium } from "react-icons/si";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { ExperienceContent } from "@/lib/content/types";

type Tag = { label: string; Icon: ComponentType<{ size?: number; className?: string }> };

type Role = {
  title: string;
  dept: string;
  subdept: string;
  org: string;
  location: string;
  period: string;
  type: string;
  logo: string;
  logoSize?: number;
  logoFilter?: string;
  gradient: string;
  orb1: string;
  orb2: string;
  border: string;
  glow: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  tag: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  summary?: ReactNode;
  researchAreas?: string;
  bulletHeading?: string;
  tagHeading?: string;
  bullets: string[];
  tags: Tag[];
};

const roles: Role[] = [
  {
    title: "Volunteer Researcher – LLM Agents & Human Behavior",
    dept: "LLM Agents & Human Behavior",
    subdept: "School of Computing",
    org: "Clemson University",
    location: "Clemson, SC / Remote",
    period: "May 2026 – Present",
    type: "Volunteer Research",
    logo: "/soc-logo.png",
    logoSize: 150,
    gradient: "from-orange-950 via-amber-900/40 to-stone-950",
    orb1: "bg-orange-500",
    orb2: "bg-amber-400",
    border: "border-orange-500/20",
    glow: "hover:shadow-orange-500/15",
    accent: "text-orange-400",
    accentBg: "bg-orange-500/10",
    accentBorder: "border-orange-500/20",
    tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    Icon: Bot,
    researchAreas: "Large Language Models · LLM Agents · Multi-Agent Systems · Generative AI · Human Behavior Simulation · AI Evaluation",
    summary: (
      <>
        Conducting research under <strong className="font-semibold text-[var(--text)]">Dr. Long Cheng</strong> investigating whether Large Language Model agents can realistically simulate human behavior and how their behavioral fidelity can be systematically evaluated.
      </>
    ),
    bulletHeading: "Research & Contributions",
    tagHeading: "Technologies & Research Tools",
    bullets: [
      "Conducting a comprehensive literature review of LLM-based human behavior simulation, autonomous agents, multi-agent systems, and AI-generated synthetic populations.",
      "Investigating AgentSociety, YuLan-OneSim, Generative Agents, and MiroFish for large-scale social and behavioral simulation.",
      "Developing a taxonomy of human behavior for evaluating LLM agents across decision-making, social interaction, cooperation, trust, and other behavioral dimensions.",
      "Designing and reproducing behavioral experiments such as Trust Games and Dictator Games to compare LLM-agent decisions against established human behavioral data.",
      "Exploring evaluation methods and benchmarks for quantifying behavioral realism, consistency, and human-agent similarity.",
      "Building toward a research survey on the strengths and limitations of LLM agents for simulating human behavior, including their potential role in early-stage studies.",
    ],
    tags: [
      { label: "Python", Icon: SiPython },
      { label: "Large Language Models", Icon: Bot },
      { label: "Multi-Agent Systems", Icon: Users },
      { label: "AgentSociety", Icon: Users },
      { label: "YuLan-OneSim", Icon: Bot },
      { label: "Generative Agents", Icon: Brain },
      { label: "MiroFish", Icon: Bot },
      { label: "Literature Review", Icon: BookOpen },
      { label: "Experimental Design", Icon: FlaskConical },
      { label: "Behavioral Evaluation", Icon: Activity },
    ],
  },
  {
    title: "Graduate Student Hourly",
    dept: "Data Science",
    subdept: "School of Computing",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    period: "Aug 2024 – Dec 2025",
    type: "Research & Teaching",
    logo: "/soc-logo.png",
    logoSize: 150,
    gradient: "from-violet-950 via-purple-900/40 to-indigo-950",
    orb1: "bg-violet-500",
    orb2: "bg-indigo-400",
    border: "border-violet-500/20",
    glow: "hover:shadow-violet-500/15",
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/20",
    tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    Icon: GraduationCap,
    bullets: [
      "Designed and developed Jupyter Notebook-based labs and assignments for a graduate-level Applied Data Science course",
      "Built automated grading pipelines using nbgrader reducing manual effort",
      "Developed hands-on exercises covering data preprocessing, outlier detection (IQR, Z-score), model selection, cross-validation, feature selection, and PCA",
      "Implemented automated validation and testing logic to ensure consistent evaluation of student submissions",
      "Supported students through weekly office hours, debugging ML workflows and help clarifying core concepts",
      "Collaborated with faculty on curriculum design and course deployment on Coursera",
      "Debugged and resolved autograder and grading pipeline issues via Salesforce tickets, implementing fixes, validating outputs, and deploying updated notebook versions",
    ],
    tags: [
      { label: "Python", Icon: SiPython },
      { label: "Jupyter", Icon: SiJupyter },
      { label: "scikit-learn", Icon: SiScikitlearn },
      { label: "Pandas", Icon: SiPandas },
      { label: "NumPy", Icon: SiNumpy },
    ],
  },
  {
    title: "Software Test Engineer",
    dept: "Software Engineering & QA",
    subdept: "Telecom Systems",
    org: "Amdocs",
    location: "Pune, India",
    period: "Oct 2021 – Dec 2022",
    type: "Software Engineering",
    logo: "/amdocs-logo.png",
    logoSize: 135,
    gradient: "from-teal-950 via-emerald-900/40 to-cyan-950",
    orb1: "bg-teal-500",
    orb2: "bg-emerald-400",
    border: "border-teal-500/20",
    glow: "hover:shadow-teal-500/15",
    accent: "text-teal-400",
    accentBg: "bg-teal-500/10",
    accentBorder: "border-teal-500/20",
    tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",
    Icon: Code2,
    bullets: [
      "Performed end-to-end, regression, and API testing for enterprise-scale telecom systems serving AT&T",
      "Designed test cases and validation strategies for new feature releases based on product requirements and stakeholder discussions",
      "Automated test workflows using Postman and proprietary tools, improving testing efficiency and coverage",
      "Collaborated with cross-functional global teams (US & India) in Agile environments to ensure smooth release cycles",
      "Participated in feature planning, requirement analysis, and system validation across multiple production releases",
    ],
    tags: [
      { label: "Postman", Icon: SiPostman },
      { label: "Selenium", Icon: SiSelenium },
    ],
  },
];

const roleThemes: Record<ExperienceContent["accent"], Pick<Role, "gradient" | "orb1" | "orb2" | "border" | "glow" | "accent" | "accentBg" | "accentBorder" | "tag">> = {
  orange:{ gradient:"from-orange-950 via-amber-900/40 to-stone-950", orb1:"bg-orange-500", orb2:"bg-amber-400", border:"border-orange-500/20", glow:"hover:shadow-orange-500/15", accent:"text-orange-400", accentBg:"bg-orange-500/10", accentBorder:"border-orange-500/20", tag:"bg-orange-500/10 text-orange-300 border border-orange-500/20" },
  violet:{ gradient:"from-violet-950 via-purple-900/40 to-indigo-950", orb1:"bg-violet-500", orb2:"bg-indigo-400", border:"border-violet-500/20", glow:"hover:shadow-violet-500/15", accent:"text-violet-400", accentBg:"bg-violet-500/10", accentBorder:"border-violet-500/20", tag:"bg-violet-500/10 text-violet-300 border border-violet-500/20" },
  purple:{ gradient:"from-violet-950 via-purple-900/40 to-indigo-950", orb1:"bg-purple-500", orb2:"bg-violet-400", border:"border-purple-500/20", glow:"hover:shadow-purple-500/15", accent:"text-purple-400", accentBg:"bg-purple-500/10", accentBorder:"border-purple-500/20", tag:"bg-purple-500/10 text-purple-300 border border-purple-500/20" },
  teal:{ gradient:"from-teal-950 via-emerald-900/40 to-cyan-950", orb1:"bg-teal-500", orb2:"bg-emerald-400", border:"border-teal-500/20", glow:"hover:shadow-teal-500/15", accent:"text-teal-400", accentBg:"bg-teal-500/10", accentBorder:"border-teal-500/20", tag:"bg-teal-500/10 text-teal-300 border border-teal-500/20" },
  blue:{ gradient:"from-blue-950 via-sky-900/40 to-indigo-950", orb1:"bg-blue-500", orb2:"bg-sky-400", border:"border-blue-500/20", glow:"hover:shadow-blue-500/15", accent:"text-blue-400", accentBg:"bg-blue-500/10", accentBorder:"border-blue-500/20", tag:"bg-blue-500/10 text-blue-300 border border-blue-500/20" },
  pink:{ gradient:"from-pink-950 via-rose-900/40 to-purple-950", orb1:"bg-pink-500", orb2:"bg-rose-400", border:"border-pink-500/20", glow:"hover:shadow-pink-500/15", accent:"text-pink-400", accentBg:"bg-pink-500/10", accentBorder:"border-pink-500/20", tag:"bg-pink-500/10 text-pink-300 border border-pink-500/20" },
};

function roleFromContent(item: ExperienceContent): Role {
  const Icon = item.title.toLowerCase().includes("research") ? Bot : item.organization.toLowerCase().includes("clemson") ? GraduationCap : Code2;
  const iconForTag = (label:string) => label.toLowerCase().includes("python") ? SiPython : label.toLowerCase().includes("jupyter") ? SiJupyter : label.toLowerCase().includes("postman") ? SiPostman : label.toLowerCase().includes("selenium") ? SiSelenium : Bot;
  return { title:item.title, dept:item.department, subdept:item.subdepartment ?? "", org:item.organization, location:item.location, period:item.period, type:item.type, logo:item.logo ?? "/soc-logo.png", logoSize:item.organization === "Amdocs" ? 135 : 150, ...roleThemes[item.accent], Icon, summary:item.summary, researchAreas:item.researchAreas, bulletHeading:item.bulletHeading, tagHeading:item.tagHeading, bullets:item.bullets, tags:item.tags.map((label) => ({ label, Icon:iconForTag(label) })) };
}

export default function Experience() {
  const [displayRoles, setDisplayRoles] = useState<Role[]>(roles);
  useEffect(() => { fetch("/api/content/experience").then((r) => r.ok ? r.json() : Promise.reject()).then((items:ExperienceContent[]) => { if (Array.isArray(items) && items.length) setDisplayRoles(items.map(roleFromContent)); }).catch(() => {}); }, []);
  return (
    <div className="container-max py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={15} className="text-violet-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--muted)]">Career & Experience</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)]">Professional Experience</h1>
        <p className="mt-3 text-[var(--muted)] max-w-lg text-sm leading-relaxed">
          From enterprise software engineering to applied machine learning and AI systems — experience building, testing, and scaling real-world solutions.
        </p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col gap-8">
        {displayRoles.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.12 }}
            className={`group relative rounded-2xl border ${r.border} bg-[var(--surface)] overflow-hidden shadow-lg hover:shadow-xl ${r.glow} card-elevated transition-all duration-300 hover:-translate-y-0.5`}
          >
            {/* Gradient header */}
            <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${r.gradient}`}>
              {/* Animated orbs */}
              <motion.div
                className={`absolute top-2 right-16 w-28 h-28 rounded-full ${r.orb1} blur-3xl opacity-35`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0.2, 0.35] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
              />
              <motion.div
                className={`absolute bottom-0 right-4 w-16 h-16 rounded-full ${r.orb2} blur-2xl opacity-25`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.12, 0.25] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 + 1.2 }}
              />
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              {/* Header content */}
              <div className="relative z-10 h-full flex items-center px-6 gap-4">
                <Image
                  src={r.logo}
                  alt={r.org}
                  width={r.logoSize ?? 90}
                  height={r.logoSize ?? 90}
                  className="object-contain shrink-0"
                  style={r.logoFilter ? { filter: r.logoFilter } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[var(--text)] leading-tight">{r.title}</h2>
                  <p className={`text-sm font-semibold ${r.accent}`}>{r.org}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-white/40 shrink-0" />
                    <span className="text-[10px] text-white/40">{r.location}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-mono bg-black/40 backdrop-blur-sm text-white/55 px-2.5 py-1 rounded-full border border-white/10">
                  {r.period}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="p-6 pt-5">
              {/* Type + dept badge row */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`${r.accentBg} ${r.accent} text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${r.accentBorder}`}
                >
                  {r.type}
                </span>
                <span className="text-[11px] text-[var(--sub-muted)]">
                  {r.dept} · {r.subdept}
                </span>
              </div>

              {r.researchAreas && (
                <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sub-muted)]">Research Areas</p>
                  <p className="text-xs leading-relaxed text-[var(--muted)]">{r.researchAreas}</p>
                </div>
              )}

              {r.summary && (
                <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">{r.summary}</p>
              )}

              {r.bulletHeading && (
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text)]">{r.bulletHeading}</h3>
              )}

              {/* Bullets */}
              <ul className="space-y-2.5 mb-5">
                {r.bullets.map((b, j) => (
                  <motion.li
                    key={j}
                    className="flex items-start gap-2.5 text-sm text-[var(--muted)] leading-snug"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + j * 0.06 }}
                  >
                    <CheckCircle2 size={13} className={`${r.accent} shrink-0 mt-0.5`} />
                    {b}
                  </motion.li>
                ))}
              </ul>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)]">
                {r.tagHeading && (
                  <p className="mb-1 w-full text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sub-muted)]">{r.tagHeading}</p>
                )}
                {r.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`${r.tag} text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5`}
                  >
                    <tag.Icon size={10} />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
