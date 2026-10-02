"use client";
import { motion, useReducedMotion } from "framer-motion";
import { SiPython, SiPytorch, SiScikitlearn, SiHuggingface, SiPandas, SiNumpy, SiDocker, SiGithub, SiGithubactions } from "react-icons/si";
import { Cloud, BrainCircuit, BarChart3, Eye, Workflow, FlaskConical, Cpu, Code2, Settings2, Layers, MessageSquareCode, Database, ChartNoAxesColumn, Sparkles, ArrowUpRight } from "lucide-react";
import type { ComponentType } from "react";
import { RESUME_SKILL_CATEGORIES, RESUME_SKILLS_SOURCE } from "@/lib/resume-skills";

type SkillIcon = ComponentType<{size?:number;className?:string}>;
const categoryIcons:Record<string,SkillIcon>={programming:Code2,ml:BrainCircuit,data:BarChart3,tools:Settings2,areas:Layers};
const skillIcons:Record<string,SkillIcon>={
  Python:SiPython,SQL:Database,PyTorch:SiPytorch,"scikit-learn":SiScikitlearn,"Hugging Face Transformers":SiHuggingface,
  pandas:SiPandas,NumPy:SiNumpy,seaborn:FlaskConical,matplotlib:ChartNoAxesColumn,
  "AWS (EC2, S3, Lambda, Amplify, DynamoDB)":Cloud,Docker:SiDocker,"Git/GitHub":SiGithub,"GitHub Actions (CI/CD)":SiGithubactions,
  "Machine Learning":BrainCircuit,"Deep Learning":BrainCircuit,LLMs:MessageSquareCode,GenAI:Sparkles,RAG:Database,MLOps:Workflow,"Computer Vision":Eye,
};

export default function Skills() {
  const reducedMotion=useReducedMotion();
  return <div className="container-max py-12">
    <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.25em] text-[var(--muted)]"><Cpu size={15} aria-hidden="true"/> Technical proficiency</p>
        <h1 className="text-4xl font-bold text-[var(--text)] md:text-5xl">Skills &amp; Expertise</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">My current technical stack and core areas, aligned with the Skills section of my resume.</p>
      </div>
      <a href={encodeURI(RESUME_SKILLS_SOURCE)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--accent)]">View resume <ArrowUpRight size={13} aria-hidden="true"/></a>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      {RESUME_SKILL_CATEGORIES.map((category,index)=>{
        const CategoryIcon=categoryIcons[category.id];
        return <motion.section key={category.id} aria-labelledby={`skills-${category.id}`} data-skill-card
          initial={reducedMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.3,delay:reducedMotion?0:index*.04}}
          className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm ${category.id==="areas"?"md:col-span-2":""}`}>
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]"><CategoryIcon size={18} aria-hidden="true"/></span>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.18em] text-[var(--muted)]">{category.eyebrow}</p>
              <h2 id={`skills-${category.id}`} className="text-base font-semibold leading-snug text-[var(--text)]">{category.title}</h2>
            </div>
            <span aria-label={`${category.skills.length} skills`} className="shrink-0 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[11px] text-[var(--muted)]">{String(category.skills.length).padStart(2,"0")}</span>
          </div>
          <ul className="flex flex-wrap gap-2 p-5 sm:p-6">
            {category.skills.map(skill=>{
              const Icon=skillIcons[skill];
              return <li key={skill} data-skill-chip className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-medium leading-relaxed text-[var(--text)]"><Icon size={14} aria-hidden="true" className="shrink-0"/><span>{skill}</span></li>;
            })}
          </ul>
        </motion.section>;
      })}
    </div>
  </div>;
}
