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
    title: "Researcher - LLM Agents and Human Behavior",
    dept: "LLM Agents & Human Behavior",
    subdept: "School of Computing",
    org: "Clemson University",
    location: "Clemson, SC / Remote",
    period: "Apr 2026 – Present",
    type: "Research",
    logo: "/soc-logo.png",
    logoSize: 150,
    Icon: Bot,
    researchAreas: "Large Language Models · LLM Agents · Multi-Agent Systems · Generative AI · Human Behavior Simulation · AI Evaluation",
    summary: (
      <>
        Conducting research under <strong className="font-semibold text-[var(--text)]">Dr. Long Cheng</strong> on whether societies of Large Language Model agents can realistically simulate human behavior and support early-stage behavioral studies.
      </>
    ),
    bulletHeading: "Research & Contributions",
    tagHeading: "Technologies & Research Tools",
    bullets: [
      "Researching whether societies of LLM agents can substitute for human participants in behavioral pilot studies.",
      "Reproducing published behavioral experiments and designing new studies with AgentSociety, YuLan-OneSim, Generative Agents, and related multi-agent frameworks.",
      "Developing a taxonomy and metrics for behavioral realism, consistency, and human alignment across decision-making and social scenarios.",
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
    title: "Graduate Teaching Assistant",
    dept: "Applied Data Science",
    subdept: "School of Computing",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    period: "Aug 2024 – Dec 2025",
    type: "Teaching",
    logo: "/soc-logo.png",
    logoSize: 150,
    Icon: GraduationCap,
    bullets: [
      "Designed Jupyter labs and assignments covering data preprocessing, supervised learning, unsupervised learning, model evaluation, and visualization",
      "Built automated grading pipelines with Python and nbgrader to improve scoring consistency and reduce manual effort",
      "Maintained live course infrastructure and resolved notebook and autograder issues",
      "Explained machine-learning concepts and debugged student code during office hours",
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
    dept: "Software Quality Engineering",
    subdept: "Telecom Systems",
    org: "Amdocs",
    location: "Pune, India",
    period: "Oct 2021 – Dec 2022",
    type: "Software Engineering & QA",
    logo: "/amdocs-logo.png",
    logoSize: 135,
    Icon: Code2,
    bullets: [
      "Performed end-to-end, regression, and integration testing for enterprise telecom systems supporting AT&T",
      "Designed test cases and validation strategies for new feature releases based on product requirements and stakeholder discussions",
      "Ran functional, UI, and API release tests with Selenium and Postman",
      "Collaborated with cross-functional global teams (US & India) in Agile environments to ensure smooth release cycles",
      "Participated in feature planning, requirement analysis, and system validation across multiple production releases",
    ],
    tags: [
      { label: "Postman", Icon: SiPostman },
      { label: "Selenium", Icon: SiSelenium },
    ],
  },
];

function roleFromContent(item: ExperienceContent): Role {
  const Icon = item.title.toLowerCase().includes("research") ? Bot : item.organization.toLowerCase().includes("clemson") ? GraduationCap : Code2;
  const iconForTag = (label:string) => label.toLowerCase().includes("python") ? SiPython : label.toLowerCase().includes("jupyter") ? SiJupyter : label.toLowerCase().includes("postman") ? SiPostman : label.toLowerCase().includes("selenium") ? SiSelenium : Bot;
  return { title:item.title, dept:item.department, subdept:item.subdepartment ?? "", org:item.organization, location:item.location, period:item.period, type:item.type, logo:item.logo ?? "/soc-logo.png", logoSize:item.organization === "Amdocs" ? 135 : 150, Icon, summary:item.summary, researchAreas:item.researchAreas, bulletHeading:item.bulletHeading, tagHeading:item.tagHeading, bullets:item.bullets, tags:item.tags.map((label) => ({ label, Icon:iconForTag(label) })) };
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
          <Briefcase size={15} className="text-[var(--muted)]" />
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
            className={`group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
          >
            {/* Neutral title panel */}
            <div className="relative min-h-28 overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
              {/* Header content */}
              <div className="relative z-10 flex min-h-28 flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                <Image
                  src={r.logo}
                  alt={r.org}
                  width={r.logoSize ?? 90}
                  height={r.logoSize ?? 90}
                  className={r.logo === "/soc-logo.png"
                    ? "h-auto w-40 shrink-0 object-contain object-left sm:w-[180px]"
                    : "h-10 w-auto max-w-[140px] shrink-0 object-contain object-left sm:h-auto"}
                  style={r.logoFilter ? { filter: r.logoFilter } : undefined}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[var(--text)] leading-tight">{r.title}</h2>
                  <p className={`text-sm font-semibold text-[var(--muted)]`}>{r.org}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-[var(--sub-muted)] shrink-0" />
                    <span className="text-[10px] text-[var(--sub-muted)]">{r.location}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[10px] text-[var(--muted)] backdrop-blur-sm sm:ml-auto">
                  {r.period}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4 pt-5 sm:p-6 sm:pt-5">
              {/* Type + dept badge row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`bg-[var(--tag-bg)] text-[var(--muted)] text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-[var(--border)]`}
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
                    <CheckCircle2 size={13} className={`text-[var(--muted)] shrink-0 mt-0.5`} />
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
                    className={`border border-[var(--border)] bg-[var(--tag-bg)] text-[var(--muted)] text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5`}
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
