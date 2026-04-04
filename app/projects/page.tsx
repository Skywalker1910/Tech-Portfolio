"use client";
import { useMemo, useState } from "react";
import Badge from "../../components/Badge";
import GitHubFlipButton from "../../components/GitHubFlipButton";
import Link from "next/link";
import { FlaskConical, ExternalLink } from "lucide-react";

type Project = { 
  title: string; 
  blurb: string; 
  description: string;
  tags: string[]; 
  year: number; 
  link?: string;
  github?: string;
  demo?: string;
  status: "completed" | "in-progress" | "planned";
  featured?: boolean;
};

type CaseStudy = {
  num: string;
  title: string;
  period: string;
  context: string;
  bullets: string[];
  tags: string[];
  github?: string;
  accent: string; // tailwind color name
};

const CASE_STUDIES: CaseStudy[] = [
  {
    num: "01",
    title: "Skynet – AQI Prediction System",
    period: "Sept 2025 – Nov 2025",
    context: "2025 NASA Space Apps Challenge",
    bullets: [
      "Built an end-to-end ML pipeline to forecast Air Quality Index (AQI) levels using multi-source data from NASA TEMPO, OpenAQ, weather, and traffic APIs.",
      "Developed data ingestion and preprocessing workflows to integrate environmental, meteorological, and traffic datasets and engineer predictive features.",
      "Trained ML models to capture temporal and spatial patterns impacting air quality across urban regions.",
    ],
    tags: ["Python", "scikit-learn", "pandas", "NumPy", "ML Pipeline", "NASA", "Air Quality"],
    accent: "teal",
  },
  {
    num: "02",
    title: "Adversarial Attacks – Experimentation & Case Study",
    period: "2024",
    context: "AI Security Research · Clemson University",
    bullets: [
      "Studied and experimented with adversarial attack techniques including data poisoning, adversarial patches, and evasion attacks on computer vision models.",
      "Conducted experiments on autonomous vehicle monocular depth estimation (MDE) systems, probing vulnerabilities in scene understanding, object perception, and depth estimation pipelines.",
      "Analysed attack transferability and model robustness across multiple architectures under white-box and black-box threat models.",
    ],
    tags: ["Computer Vision", "Adversarial ML", "Data Poisoning", "Python", "Deep Learning", "AV Safety"],
    accent: "violet",
  },
  {
    num: "03",
    title: "LLM Defense Evaluation Framework",
    period: "Sept 2024 – Dec 2024",
    context: "AI Security Research · Clemson University",
    bullets: [
      "Built a Python-based evaluation framework to systematically probe and benchmark LLM defense mechanisms against adversarial prompts.",
      "Measured model behaviour across token-level patterns, semantic analysis, response latency, refusal rates, and adversarial attack success rates.",
      "Instrumented GPT-3.5 and GPT-4 endpoints with automated test harnesses to quantify safety-guardrail effectiveness under diverse jailbreak strategies.",
    ],
    tags: ["LLM", "Python", "Evaluation", "Security", "Adversarial AI", "GPT"],
    accent: "orange",
  },
];

const ALL: Project[] = [
  {
    title: "Movie Recommendation System",
    blurb: "AI-powered movie recommendation engine built using AI-assisted tools and autonomous agents.",
    description: "Developed a movie recommendation system leveraging AI-assisted tools and agents to build and evaluate the recommendation pipeline. Explored collaborative filtering and content-based filtering techniques to surface personalized movie suggestions. Used AI agents to accelerate data exploration, feature engineering, and model iteration. Demonstrates practical application of LLM-assisted software development in building end-to-end ML systems.",
    tags: ["Recommendation Systems", "Machine Learning", "AI Agents", "Python"],
    year: 2025,
    status: "completed",
    featured: true,
  },
  { 
    title: "MASTERKEY Jailbreak Replication", 
    blurb: "Advanced security research on Large Language Model vulnerabilities and defense mechanisms.", 
    description: "Reproduced and analyzed jailbreak attempts on GPT-3.5, GPT-4, and GPT-4.5 as part of graduate security coursework. Built comprehensive evaluation metrics to measure model defenses against various attack vectors. Developed automated testing frameworks to assess the robustness of safety guardrails. Analyzed the effectiveness of different jailbreak techniques and documented defense strategies. This research contributes to understanding LLM security vulnerabilities in real-world applications.",
    tags: ["LLM", "Security", "GPT", "Evaluation", "Research"], 
    year: 2025,
    status: "completed",
    featured: true,
  },
  { 
    title: "AdvRM Adversarial Patches", 
    blurb: "Research project on adversarial attacks against autonomous vehicle perception systems.", 
    description: "Implemented sophisticated adversarial patches designed to mislead self-driving car depth estimation systems as part of graduate security coursework. Developed physical and digital attack methods that can fool computer vision models used in autonomous vehicles. Studied the impact of these attacks on safety-critical systems and evaluated existing defense mechanisms. The research highlights vulnerabilities in current AV perception pipelines and proposes mitigation strategies for real-world deployment.",
    tags: ["Computer Vision", "Adversarial ML", "Autonomous Vehicles", "Deep Learning", "Security"], 
    year: 2024,
    status: "completed",
    featured: true,
  },
  { 
    title: "Covid-19 Safeguard System", 
    blurb: "Real-time surveillance system for pandemic safety compliance monitoring.", 
    description: "Led a 5-member team to develop a comprehensive real-time surveillance system that detects face mask compliance and social distancing violations during the COVID-19 pandemic. Built using TensorFlow for deep learning models and OpenCV for computer vision processing. The system processes live video feeds to identify individuals not wearing masks and monitors social distancing protocols. Implemented alert mechanisms and dashboard reporting for facility managers. Successfully deployed in multiple locations to ensure public health compliance.",
    tags: ["Computer Vision", "TensorFlow", "OpenCV", "Team Leadership", "Public Health"], 
    year: 2021,
    status: "completed",
    featured: true,
    github: "https://github.com/Skywalker1910/Covid-19-Safeguard",
  },
  {
    title: "License Plate Detection (ANPR)",
    blurb: "Automatic Number Plate Recognition system for vehicle identification.",
    description: "Developed a comprehensive ANPR (Automatic Number Plate Recognition) system using OpenCV and Pytesseract for optical character recognition. The system processes images and video streams to automatically detect, extract, and recognize license plate numbers from vehicles. Implemented image preprocessing techniques including noise reduction, edge detection, and perspective correction to improve accuracy. Built a user-friendly interface for batch processing and real-time detection. The system achieved high accuracy rates across various lighting conditions and plate formats.",
    tags: ["Computer Vision", "OpenCV", "OCR", "Pytesseract", "Image Processing"],
    year: 2021,
    status: "completed",
    github: "https://github.com/Skywalker1910/License-Plate-Detection",
  },
  {
    title: "Coursera Online Degree Platform Development",
    blurb: "Comprehensive educational technology infrastructure for online data science curriculum.",
    description: "Led the design and development of lab and homework assignments for students enrolled in Clemson University's online degree program on Coursera platform. Built source assignment notebooks with comprehensive test cases using asserts for automated validation. Implemented nbgrader tool to automate the grading process of Jupyter notebooks, ensuring consistent and efficient evaluation. Maintained live coursework material for Spring 2025 semester, continuously resolving bugs in grader logic and notebook functionality. Conducted regular office hours to address student technical issues and programming challenges.",
    tags: ["Education", "Coursera", "nbgrader", "Jupyter", "Curriculum Development"],
    year: 2024,
    status: "completed",
    featured: true,
  },
  {
    title: "CPSC 6300 Automated Grading Framework",
    blurb: "Cross-platform automated grading solution for in-person graduate data science courses.",
    description: "Currently developing a comprehensive automated grading framework for CPSC 6300 (Applied Data Science), an in-person graduate-level class at Clemson University. This project aims to expand the grading framework beyond online courses to create a cross-platform solution. The framework builds upon the experience gained from the Coursera platform development, incorporating lessons learned and best practices for scalable educational technology infrastructure.",
    tags: ["Education", "Automation", "Python", "Grading Framework", "Cross-Platform"],
    year: 2025,
    status: "in-progress",
    github: "https://github.com/Skywalker1910/cpsc6300-autograder",
  },
  {
    title: "AT&T Telecom Testing Automation",
    blurb: "Large-scale test automation for telecommunications infrastructure.",
    description: "Conducted comprehensive end-to-end testing for AT&T telecom systems across web, video, and retail platforms during tenure at Amdocs. Automated regression and functional test suites using Postman and proprietary Amdocs tools, significantly improving testing efficiency and coverage. Collaborated with a 25-member global team distributed across US and India to deliver seamless system integration. Ensured quality assurance for mission-critical telecommunications infrastructure serving millions of customers.",
    tags: ["Testing", "Automation", "Postman", "Telecommunications", "Global Collaboration"],
    year: 2022,
    status: "completed",
  },
];

const STATUS_COLORS = {
  completed: "teal",
  "in-progress": "violet", 
  planned: "gray"
} as const;

export default function Projects() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [showFeatured, setShowFeatured] = useState(false);
  
  const tags = useMemo(() => Array.from(new Set(ALL.flatMap(p => p.tags))).sort(), []);
  const statuses = useMemo(() => Array.from(new Set(ALL.map(p => p.status))), []);
  
  const filtered = ALL.filter(p => {
    const searchHit = !q || (p.title + p.blurb + p.description + p.tags.join(" ")).toLowerCase().includes(q.toLowerCase());
    const tagHit = !tag || p.tags.includes(tag);
    const statusHit = !status || p.status === status;
    const featuredHit = !showFeatured || p.featured;
    return searchHit && tagHit && statusHit && featuredHit;
  });

  const clearFilters = () => {
    setQ("");
    setTag(undefined);
    setStatus(undefined);
    setShowFeatured(false);
  };

  return (
    <div className="container-max py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Projects</h1>
        <p className="mt-2 text-slate-300 text-lg">
          A collection of my work in machine learning, security research, and educational tools.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 bg-slate-900/60 border-slate-800 mb-8">
        <div className="flex flex-wrap gap-3 items-center">
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects..." 
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 placeholder-slate-400 min-w-64"
          />
          
          <select 
            value={tag || ""} 
            onChange={e => setTag(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
          >
            <option value="">All technologies</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            value={status || ""} 
            onChange={e => setStatus(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
          >
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input 
              type="checkbox"
              checked={showFeatured}
              onChange={e => setShowFeatured(e.target.checked)}
              className="rounded border-slate-700"
            />
            Featured only
          </label>

          {(q || tag || status || showFeatured) && (
            <button 
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 underline"
            >
              Clear filters
            </button>
          )}
        </div>
        
        <div className="mt-3 text-sm text-slate-400">
          Showing {filtered.length} of {ALL.length} projects
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((p, i) => (
          <ProjectCard key={i} project={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No projects match your current filters.</p>
          <button 
            onClick={clearFilters}
            className="mt-2 text-violet-400 hover:text-violet-300 underline"
          >
            Clear filters to see all projects
          </button>
        </div>
      )}

      {/* ── Experimentation & Case Studies ── */}
      <div className="mt-20">
        <div className="flex items-center gap-3 mb-2">
          <FlaskConical size={18} className="text-violet-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">
            Research & Experimentation
          </p>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Experimentation &amp; Case Studies
        </h2>
        <p className="text-sm text-zinc-500 max-w-xl mb-10 leading-relaxed">
          Hands-on experiments, security research, and applied ML case studies — work that lives at the boundary of exploration and engineering.
        </p>

        <div className="space-y-0">
          {CASE_STUDIES.map((cs) => (
            <CaseStudyCard key={cs.num} cs={cs} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ cs }: { cs: CaseStudy }) {
  const accentMap: Record<string, { border: string; num: string; tag: string; bullet: string; badge: string }> = {
    teal:   { border: "border-teal-500/20 hover:border-teal-500/40",   num: "text-teal-500/30",   tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",   bullet: "bg-teal-400",   badge: "text-teal-400" },
    violet: { border: "border-violet-500/20 hover:border-violet-500/40", num: "text-violet-500/30", tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20", bullet: "bg-violet-400", badge: "text-violet-400" },
    orange: { border: "border-orange-500/20 hover:border-orange-500/40", num: "text-orange-500/30", tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20", bullet: "bg-orange-400", badge: "text-orange-400" },
  };
  const a = accentMap[cs.accent] ?? accentMap.violet;

  return (
    <article className={`group border-b border-zinc-800/60 first:border-t py-8 flex flex-col md:flex-row gap-6 md:gap-10 transition-colors`}>
      {/* Number */}
      <span className={`text-6xl md:text-7xl font-black leading-none font-mono select-none shrink-0 ${a.num} group-hover:opacity-60 transition-opacity`}>
        {cs.num}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Context + period */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`text-[10px] font-bold tracking-[0.25em] uppercase border border-zinc-700/70 bg-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded`}>
            {cs.context}
          </span>
          <span className="text-[11px] font-mono text-zinc-600">{cs.period}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug group-hover:text-zinc-200 transition-colors">
          {cs.title}
        </h3>

        {/* Bullets */}
        <ul className="space-y-2 mb-5">
          {cs.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400 leading-relaxed">
              <span className={`mt-2 w-1 h-1 rounded-full shrink-0 ${a.bullet} opacity-60`} />
              {b}
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {cs.tags.map((t) => (
            <span key={t} className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${a.tag}`}>
              {t}
            </span>
          ))}
        </div>

        {/* GitHub link if present */}
        {cs.github && (
          <a
            href={cs.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 mt-4 text-xs ${a.badge} hover:text-white transition-colors`}
          >
            View on GitHub <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <article className={`card p-6 bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-colors ${project.featured ? 'ring-1 ring-violet-500/20' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold leading-tight">{project.title}</h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-slate-400">{project.year}</span>
          {project.featured && (
            <Badge color="violet">Featured</Badge>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <Badge color={STATUS_COLORS[project.status]}>
          {project.status.replace('-', ' ')}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
        {expanded ? project.description : project.blurb}
      </p>

      {/* Expand/Collapse */}
      {project.description !== project.blurb && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-violet-400 hover:text-violet-300 mb-4 underline"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map(t => <Badge key={t}>{t}</Badge>)}
      </div>

      {/* GitHub Button */}
      <div className="pt-3 border-t border-slate-800 flex justify-center">
        <GitHubFlipButton
          href={project.github || "https://github.com/Skywalker1910"}
        />
      </div>
    </article>
  );
}
