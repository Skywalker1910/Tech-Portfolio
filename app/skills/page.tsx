
"use client";
import { motion } from "framer-motion";
import {
  SiPython, SiPostgresql, SiCplusplus,
  SiPytorch, SiTensorflow, SiScikitlearn,
  SiPlotly, SiPandas, SiNumpy,
  SiGit, SiDocker, SiJupyter,
} from "react-icons/si";
import {
  Cloud, BrainCircuit, BarChart3, ShieldAlert, Eye, Workflow,
  FlaskConical, Cpu, Code2, Settings2, Layers, MessageSquareCode, Database,
} from "lucide-react";
import type { ComponentType } from "react";

type SkillEntry = {
  name: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
};

type Category = {
  title: string;
  eyebrow: string;
  CatIcon: ComponentType<{ size?: number; className?: string }>;
  gradient: string;
  orb1: string;
  orb2: string;
  border: string;
  glow: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  chipCls: string;
  skills: SkillEntry[];
};

const categories: Category[] = [
  {
    title: "Programming & Machine Learning",
    eyebrow: "Core Stack",
    CatIcon: Code2,
    gradient: "from-violet-950 via-purple-900/40 to-indigo-950",
    orb1: "bg-violet-500",
    orb2: "bg-indigo-400",
    border: "border-violet-500/20",
    glow: "hover:shadow-violet-500/15",
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/20",
    chipCls: "bg-violet-500/10 border-violet-500/20 text-violet-100 hover:bg-violet-500/20",
    skills: [
      { name: "Python",       Icon: SiPython,      color: "text-[#3776AB]" },
      { name: "C++",          Icon: SiCplusplus,   color: "text-[#00599C]" },
      { name: "SQL",          Icon: SiPostgresql,  color: "text-[#336791]" },
      { name: "scikit-learn", Icon: SiScikitlearn, color: "text-[#F7931E]" },
      { name: "PyTorch",      Icon: SiPytorch,     color: "text-[#EE4C2C]" },
      { name: "TensorFlow",   Icon: SiTensorflow,  color: "text-[#FF6F00]" },
    ],
  },
  {
    title: "Data Visualization & Analytics",
    eyebrow: "Analytics",
    CatIcon: BarChart3,
    gradient: "from-teal-950 via-emerald-900/40 to-cyan-950",
    orb1: "bg-teal-500",
    orb2: "bg-emerald-400",
    border: "border-teal-500/20",
    glow: "hover:shadow-teal-500/15",
    accent: "text-teal-400",
    accentBg: "bg-teal-500/10",
    accentBorder: "border-teal-500/20",
    chipCls: "bg-teal-500/10 border-teal-500/20 text-teal-100 hover:bg-teal-500/20",
    skills: [
      { name: "pandas",     Icon: SiPandas,     color: "text-[#8b5cf6]" },
      { name: "NumPy",      Icon: SiNumpy,      color: "text-[#4DABCF]" },
      { name: "matplotlib", Icon: SiPlotly,     color: "text-[#3F4F75]" },
      { name: "seaborn",    Icon: FlaskConical, color: "text-teal-400" },
    ],
  },
  {
    title: "Tools & Infrastructure",
    eyebrow: "Cloud & Dev Tools",
    CatIcon: Settings2,
    gradient: "from-sky-950 via-blue-900/40 to-cyan-950",
    orb1: "bg-sky-500",
    orb2: "bg-blue-400",
    border: "border-sky-500/20",
    glow: "hover:shadow-sky-500/15",
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
    accentBorder: "border-sky-500/20",
    chipCls: "bg-sky-500/10 border-sky-500/20 text-sky-100 hover:bg-sky-500/20",
    skills: [
      { name: "AWS",        Icon: Cloud,        color: "text-[#FF9900]" },
      { name: "Git",        Icon: SiGit,        color: "text-[#F05032]" },
      { name: "Docker",     Icon: SiDocker,     color: "text-[#2496ED]" },
      { name: "Jupyter",    Icon: SiJupyter,    color: "text-[#F37626]" },
    ],
  },
  {
    title: "Core Areas",
    eyebrow: "Domains",
    CatIcon: Layers,
    gradient: "from-orange-950 via-amber-900/30 to-rose-950",
    orb1: "bg-orange-500",
    orb2: "bg-amber-400",
    border: "border-orange-500/20",
    glow: "hover:shadow-orange-500/15",
    accent: "text-orange-400",
    accentBg: "bg-orange-500/10",
    accentBorder: "border-orange-500/20",
    chipCls: "bg-orange-500/10 border-orange-500/20 text-orange-100 hover:bg-orange-500/20",
    skills: [
      { name: "Machine Learning",  Icon: BrainCircuit,      color: "text-violet-400" },
      { name: "Deep Learning",     Icon: BrainCircuit,      color: "text-orange-400" },
      { name: "Computer Vision",   Icon: Eye,               color: "text-emerald-400" },
      { name: "LLMs",              Icon: MessageSquareCode, color: "text-sky-400" },
      { name: "MLOps",             Icon: Workflow,          color: "text-amber-400" },
      { name: "RAG Systems",       Icon: Database,          color: "text-teal-400" },
      { name: "Adversarial ML",    Icon: ShieldAlert,       color: "text-red-400" },
    ],
  },
];

export default function Skills() {
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
          <Cpu size={15} className="text-teal-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Technical Proficiency</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Skills &amp; Expertise</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          Technical skills developed through academic coursework, professional experience, and hands-on projects.
        </p>
      </motion.div>

      {/* Category cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.1 }}
            className={`group relative rounded-2xl border ${cat.border} bg-zinc-900/70 overflow-hidden shadow-lg hover:shadow-xl ${cat.glow} transition-all duration-300 hover:-translate-y-0.5`}
          >
            {/* Gradient header */}
            <div className={`relative h-20 overflow-hidden bg-gradient-to-br ${cat.gradient}`}>
              {/* Animated orbs */}
              <motion.div
                className={`absolute -top-4 right-12 w-24 h-24 rounded-full ${cat.orb1} blur-3xl opacity-30`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
              />
              <motion.div
                className={`absolute bottom-0 right-4 w-14 h-14 rounded-full ${cat.orb2} blur-2xl opacity-25`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.1, 0.25] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 + 1 }}
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
              <div className="relative z-10 h-full flex items-center px-5 gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-black/40 border ${cat.accentBorder} backdrop-blur-sm flex items-center justify-center shrink-0`}
                >
                  <cat.CatIcon size={16} className={cat.accent} />
                </div>
                <div>
                  <p className={`text-[9px] font-bold tracking-[0.3em] uppercase ${cat.accent} opacity-70`}>
                    {cat.eyebrow}
                  </p>
                  <h2 className="text-sm font-bold text-white leading-snug">{cat.title}</h2>
                </div>
                <span
                  className={`ml-auto text-[10px] font-mono ${cat.accent} ${cat.accentBg} border ${cat.accentBorder} px-2 py-0.5 rounded-full`}
                >
                  {cat.skills.length} skills
                </span>
              </div>
            </div>

            {/* Skill chips */}
            <div className="p-5 flex flex-wrap gap-2">
              {cat.skills.map((skill, j) => (
                <motion.span
                  key={skill.name}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-xl border transition-colors cursor-default ${cat.chipCls}`}
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + j * 0.04, duration: 0.25 }}
                >
                  <skill.Icon size={12} className={skill.color} />
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}