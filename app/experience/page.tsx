"use client";
import { motion } from "framer-motion";
import { Briefcase, MapPin, CheckCircle2, GraduationCap, Code2 } from "lucide-react";
import { SiPython, SiJupyter, SiScikitlearn, SiPandas, SiNumpy, SiPostman, SiSelenium } from "react-icons/si";
import type { ComponentType } from "react";

type Tag = { label: string; Icon: ComponentType<{ size?: number; className?: string }> };

type Role = {
  title: string;
  dept: string;
  subdept: string;
  org: string;
  location: string;
  period: string;
  type: string;
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
  bullets: string[];
  tags: Tag[];
};

const roles: Role[] = [
  {
    title: "Graduate Student Hourly",
    dept: "Data Science",
    subdept: "School of Computing",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    period: "Aug 2024 – Dec 2025",
    type: "Research & Teaching",
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
      "Designed and developed automated lab and homework assignments for a graduate-level Applied Data Science course",
      "Built Jupyter Notebook-based assignments using Python and nbgrader, serving 200+ students across the grading pipeline",
      "Developed exercises covering data preprocessing, outlier detection (IQR, Z-score), model selection, cross-validation, feature selection, and PCA",
      "Implemented automated testing logic to validate student submissions and streamline end-to-end evaluation",
      "Conducted 2 weekly office hours and managed course-related tickets to support students with technical and conceptual queries",
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
      "Conducted comprehensive end-to-end testing for AT&T telecom systems across web, video, and retail platforms",
      "Automated regression and functional test suites using Postman and Amdocs proprietary tools, improving team efficiency",
      "Collaborated with a 25-member global team across US & India to ensure seamless system integration and release quality",
      "Ensured quality assurance for mission-critical telecommunications infrastructure serving millions of customers",
      "Gained deep experience in large-scale enterprise testing methodologies and cross-cultural team collaboration",
    ],
    tags: [
      { label: "Postman", Icon: SiPostman },
      { label: "Selenium", Icon: SiSelenium },
    ],
  },
];

export default function Experience() {
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
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Career & Experience</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Professional Experience</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          From telecom QA in Pune to AI research at Clemson — a journey across roles, technologies, and continents.
        </p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col gap-8">
        {roles.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.12 }}
            className={`group relative rounded-2xl border ${r.border} bg-zinc-900/70 overflow-hidden shadow-lg hover:shadow-xl ${r.glow} transition-all duration-300 hover:-translate-y-0.5`}
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
                <div
                  className={`w-11 h-11 rounded-xl bg-black/40 border ${r.accentBorder} backdrop-blur-sm flex items-center justify-center shrink-0`}
                >
                  <r.Icon size={20} className={r.accent} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">{r.title}</h2>
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
                <span className="text-[11px] text-zinc-600">
                  {r.dept} · {r.subdept}
                </span>
              </div>

              {/* Bullets */}
              <ul className="space-y-2.5 mb-5">
                {r.bullets.map((b, j) => (
                  <motion.li
                    key={j}
                    className="flex items-start gap-2.5 text-sm text-zinc-400 leading-snug"
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
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-800">
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
