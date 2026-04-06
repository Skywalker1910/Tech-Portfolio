"use client";
import { useMemo, useState, useEffect, type ComponentType } from "react";
import Link from "next/link";
import { FlaskConical, ExternalLink, FolderOpen, Brain, ShieldAlert, Languages, Eye, BookOpen, Phone, Workflow, TestTube2, Cpu, Bot, Swords, Car, Star, ClipboardList, Shield, Database, Layers, GitBranch, Search, X, ChevronDown, SlidersHorizontal, MessageSquare, Zap, CheckCircle2 } from "lucide-react";
import { SiGithub, SiPython, SiTensorflow, SiOpencv, SiJupyter, SiCoursera, SiSelenium, SiPytorch, SiOpenai, SiScikitlearn, SiPandas, SiNumpy, SiDocker, SiPostman, SiNasa, SiFastapi, SiReact } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

const TAG_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  "Python":                   SiPython,
  "TensorFlow":               SiTensorflow,
  "OpenCV":                   SiOpencv,
  "nbgrader":                 SiJupyter,
  "Jupyter":                  SiJupyter,
  "Coursera":                 SiCoursera,
  "Test Automation":          SiSelenium,
  "Deep Learning":            SiPytorch,
  "PyTorch":                  SiPytorch,
  "GPT-4":                    SiOpenai,
  "GPT":                      SiOpenai,
  "scikit-learn":             SiScikitlearn,
  "pandas":                   SiPandas,
  "NumPy":                    SiNumpy,
  "Docker":                   SiDocker,
  "Postman":                  SiPostman,
  "NASA":                     SiNasa,
  "Machine Learning":         Brain,
  "ML Pipeline":              Brain,
  "AI Security":              ShieldAlert,
  "NLP":                      Languages,
  "Computer Vision":          Eye,
  "Curriculum Design":        BookOpen,
  "Curriculum Development":   BookOpen,
  "Telecom":                  Phone,
  "Telecommunications":       Phone,
  "Agile":                    Workflow,
  "Automation":               Workflow,
  "QA":                       TestTube2,
  "Testing":                  TestTube2,
  "Computer Engineering":     Cpu,
  "Cross-Platform":           Cpu,
  "LLM":                      Bot,
  "AI Agents":                Bot,
  "Transformers":             Bot,
  "Adversarial AI":           Swords,
  "Adversarial ML":           Swords,
  "Data Poisoning":           Swords,
  "AV Safety":                Car,
  "Autonomous Vehicles":      Car,
  "Recommender Systems":      Star,
  "Evaluation":               ClipboardList,
  "Security":                 Shield,
  "Grading Framework":        ClipboardList,
  "SQL":                      Database,
  "PostgreSQL":               Database,
  "Education":                BookOpen,
  "Research":                 Layers,
  "Global Collaboration":     GitBranch,
  "Flask":                    FlaskConical,
  "Data Analysis":            Layers,
  "Air Quality":              Workflow,
  "OCR":                      Eye,
  "Tesseract":                Eye,
  "Pygame":                   Cpu,
  "RAG":                      MessageSquare,
  "Embeddings":               Zap,
  "Vector DB":                Database,
  "FastAPI":                  SiFastapi,
  "React":                    SiReact,
};

type Project = { 
  title: string; 
  blurb: string; 
  description: string;
  highlights?: string[];
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
    title: "Adversarial Attacks – Experimentation & Case Study",
    period: "2024",
    context: "AI Security Research · Clemson University",
    bullets: [
      "Studied data poisoning, adversarial patches, and evasion attacks on computer vision models.",
      "Conducted experiments on monocular depth estimation (MDE) systems in autonomous vehicles.",
      "Analyzed impact on scene understanding, perception, and depth estimation pipelines.",
      "Evaluated attack transferability across models and threat settings.",
    ],
    tags: ["Computer Vision", "Adversarial ML", "Deep Learning", "Python", "AI Security"],
    accent: "violet",
  },
  {
    num: "02",
    title: "LLM Defense Evaluation Framework",
    period: "Sept 2024 – Dec 2024",
    context: "AI Security Research · Clemson University",
    bullets: [
      "Designed automated testing pipelines for probing LLM responses.",
      "Evaluated token-level patterns, semantic behavior, and refusal mechanisms.",
      "Measured latency, response consistency, and attack success rates.",
      "Benchmarked multiple LLMs under diverse jailbreak strategies.",
    ],
    tags: ["LLM", "Python", "Evaluation", "AI Security", "Adversarial AI"],
    accent: "orange",
  },
];

const ALL: Project[] = [
  // ⭐ Featured Projects
  {
    title: "AI-Powered Portfolio Assistant (RAG-based System)",
    blurb: "LLM-powered assistant using RAG to enable interactive exploration of my projects and experience.",
    description: "Built an AI-powered portfolio assistant using LLMs and Retrieval-Augmented Generation (RAG) to enable users to interactively explore my projects, experience, and technical work. Designed RAG pipeline for retrieving structured portfolio data. Integrated LLM APIs for context-aware responses. Implemented semantic search using embeddings and built real-time chat interface for user interaction.",
    highlights: [
      "Designed RAG pipeline for retrieving structured portfolio data",
      "Integrated LLM APIs for context-aware responses",
      "Implemented semantic search using embeddings",
      "Built real-time chat interface for user interaction",
      "Optimized response latency and quality",
    ],
    tags: ["LLM", "RAG", "NLP", "Embeddings", "Vector DB", "Python", "FastAPI", "React"],
    year: 2025,
    status: "in-progress",
    featured: true,
  },
  {
    title: "Personalized Movie Recommendation System",
    blurb: "End-to-end recommendation engine using collaborative filtering, matrix factorization, and neural methods.",
    description: "Built an end-to-end recommendation system using multi-source datasets (MovieLens, TMDB, IMDb) with collaborative filtering, content-based models, matrix factorization (FunkSVD), and neural methods. Processed 26M+ ratings across 270K users and 45K movies. Implemented FunkSVD achieving ~21% improvement over baseline (RMSE 0.76). Designed ETL pipelines and optimized sparse matrix computations for scalable recommendations.",
    highlights: [
      "Processed 26M+ ratings across 270K users and 45K movies",
      "Implemented FunkSVD achieving ~21% improvement over baseline (RMSE 0.76)",
      "Designed ETL pipelines for multi-source data integration",
      "Optimized sparse matrix computations for scalability",
    ],
    tags: ["Python", "scikit-learn", "PyTorch", "Flask", "PostgreSQL", "Docker", "Recommender Systems"],
    year: 2024,
    status: "completed",
    featured: true,
  },
  {
    title: "Skynet – AQI Prediction System",
    blurb: "ML pipeline to forecast Air Quality Index using NASA TEMPO, OpenAQ, weather, and traffic data.",
    description: "Built an end-to-end ML pipeline to forecast Air Quality Index (AQI) using multi-source data including NASA TEMPO, OpenAQ, weather, and traffic APIs. Designed data ingestion and preprocessing pipelines to integrate environmental datasets. Engineered features from environmental and traffic data to model temporal and spatial AQI patterns.",
    highlights: [
      "Integrated NASA TEMPO, OpenAQ, weather, and traffic APIs",
      "Designed data ingestion and preprocessing pipelines",
      "Engineered features from environmental and traffic datasets",
      "Modeled temporal and spatial AQI patterns",
    ],
    tags: ["Python", "scikit-learn", "pandas", "NumPy", "ML Pipeline", "Air Quality"],
    year: 2025,
    status: "completed",
    featured: true,
  },
  {
    title: "R2D2 – Experimental Transformer-based LLM",
    blurb: "Building transformer architectures from scratch to understand LLM internals and training dynamics.",
    description: "Experimental project focused on building transformer architectures from scratch to understand LLM internals and training dynamics. Implementing tokenization, embeddings, and attention mechanisms. Training small-scale transformer models and exploring LLM behavior and optimization techniques.",
    highlights: [
      "Implementing tokenization, embeddings, and attention mechanisms",
      "Training small-scale transformer models",
      "Exploring LLM behavior and optimization techniques",
      "Understanding transformer internals from first principles",
    ],
    tags: ["Python", "PyTorch", "Transformers", "NLP"],
    year: 2025,
    status: "in-progress",
    featured: true,
  },
  {
    title: "NeuralLog – Intelligent Activity Tracking System",
    blurb: "Personal ML system to track daily activities, analyze behavior patterns, and generate insights.",
    description: "Personal ML system to track daily activities, analyze behavior patterns, and generate productivity insights. Tracks user data across tasks, routines, and habits. Applies ML models for behavioral analysis and generates personalized insights to improve productivity.",
    highlights: [
      "Tracks user data across tasks, routines, and habits",
      "Applies ML models for behavioral pattern analysis",
      "Generates personalized productivity insights",
    ],
    tags: ["Python", "Machine Learning", "Data Analysis"],
    year: 2025,
    status: "completed",
    featured: true,
  },
  // 🧪 Additional Projects
  {
    title: "Automatic License Plate Recognition (ALPR)",
    blurb: "Computer vision system for vehicle license plate detection and text extraction.",
    description: "Developed a computer vision system for vehicle license plate detection and text extraction using OpenCV and Tesseract OCR. Implemented image preprocessing techniques including noise reduction, edge detection, and perspective correction to improve recognition accuracy.",
    highlights: [
      "Built plate detection using OpenCV contour analysis",
      "Integrated Tesseract OCR for character recognition",
      "Implemented noise reduction and edge detection preprocessing",
    ],
    tags: ["OpenCV", "Tesseract", "Python", "OCR"],
    year: 2021,
    status: "completed",
    github: "https://github.com/Skywalker1910/License-Plate-Detection",
  },
  {
    title: "COVID-19 Safeguard System",
    blurb: "Real-time monitoring system using computer vision for safety compliance.",
    description: "Real-time monitoring system using computer vision for safety compliance. Built with TensorFlow and OpenCV to detect face mask compliance and social distancing violations. Processes live video feeds with alert mechanisms for facility managers.",
    highlights: [
      "Built face mask detection using TensorFlow",
      "Implemented social distancing violation detection",
      "Processes live video feeds with real-time alerts",
    ],
    tags: ["Computer Vision", "TensorFlow", "OpenCV"],
    year: 2021,
    status: "completed",
    github: "https://github.com/Skywalker1910/Covid-19-Safeguard",
  },
  {
    title: "Alien Invasion",
    blurb: "2D arcade-style game built while learning Python fundamentals.",
    description: "2D arcade-style game built while learning Python fundamentals using Pygame. Classic space shooter gameplay with player controls, enemy waves, and scoring system. A fun project to practice game development concepts.",
    highlights: [
      "Classic space shooter gameplay mechanics",
      "Player controls and enemy wave system",
      "Score tracking and game state management",
    ],
    tags: ["Python", "Pygame"],
    year: 2020,
    status: "completed",
  },
];

export default function Projects() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedProject]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="container-max py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen size={15} className="text-violet-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Work &amp; Projects</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Projects</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          A collection of my work in machine learning, security research, and educational tools.
        </p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/80">
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, tags, descriptions…"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none caret-violet-400"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SlidersHorizontal size={11} className="text-zinc-600 shrink-0" />

          {/* Tag filter */}
          <div className="relative">
            <select
              value={tag || ""}
              onChange={e => setTag(e.target.value || undefined)}
              className={`appearance-none text-[11px] font-medium pl-3 pr-6 py-1.5 rounded-full border transition-colors cursor-pointer bg-zinc-900 outline-none ${
                tag
                  ? "border-violet-500/50 text-violet-300 bg-violet-500/10"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              <option value="">All Technologies</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status || ""}
              onChange={e => setStatus(e.target.value || undefined)}
              className={`appearance-none text-[11px] font-medium pl-3 pr-6 py-1.5 rounded-full border transition-colors cursor-pointer bg-zinc-900 outline-none ${
                status
                  ? "border-teal-500/50 text-teal-300 bg-teal-500/10"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
            </select>
            <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
          </div>

          {/* Featured toggle */}
          <button
            onClick={() => setShowFeatured(v => !v)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
              showFeatured
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <Star size={10} />
            Featured
          </button>

          {/* Result count */}
          <span className="ml-auto text-[11px] font-mono text-zinc-600">
            {filtered.length}&thinsp;/&thinsp;{ALL.length} projects
          </span>

          {/* Clear all */}
          {(q || tag || status || showFeatured) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1.5 rounded-full border border-zinc-700/60 hover:border-zinc-600"
            >
              <X size={10} />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <ProjectFancyCard key={i} project={p} index={i} onClick={() => setSelectedProject(p)} />
        ))}
      </div>

      {/* Expanded Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

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

function ProjectFancyCard({ project, index, onClick }: { project: Project; index: number; onClick?: () => void }) {
  const accentCycle = ["violet", "teal", "orange", "pink", "sky", "emerald"] as const;
  type AccentKey = typeof accentCycle[number];

  const deriveAccent = (): AccentKey => {
    const t = project.tags.join(" ").toLowerCase();
    if (t.includes("security") || t.includes("llm") || t.includes("gpt")) return "orange";
    if (t.includes("computer vision") || t.includes("opencv")) return "teal";
    if (t.includes("education") || t.includes("coursera")) return "sky";
    if (t.includes("testing") || t.includes("automation")) return "emerald";
    if (t.includes("recommendation") || t.includes("ml")) return "violet";
    return accentCycle[index % accentCycle.length];
  };
  const accent = deriveAccent();

  const accentMap: Record<AccentKey, {
    bg: string; orb1: string; orb2: string;
    border: string; glow: string;
    tag: string; badge: string; numText: string;
  }> = {
    violet:  { bg: "from-violet-950 via-purple-900/50 to-indigo-950",  orb1: "bg-violet-500",  orb2: "bg-indigo-400",  border: "border-violet-500/20", glow: "hover:shadow-violet-500/20",  tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20",  badge: "text-violet-400",  numText: "text-violet-400/20" },
    teal:    { bg: "from-teal-950 via-cyan-900/50 to-emerald-950",     orb1: "bg-teal-400",    orb2: "bg-cyan-400",    border: "border-teal-500/20",   glow: "hover:shadow-teal-500/20",   tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",     badge: "text-teal-400",    numText: "text-teal-400/20" },
    orange:  { bg: "from-orange-950 via-amber-900/50 to-red-950",      orb1: "bg-orange-400", orb2: "bg-amber-300",  border: "border-orange-500/20", glow: "hover:shadow-orange-500/20", tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20", badge: "text-orange-400", numText: "text-orange-400/20" },
    pink:    { bg: "from-pink-950 via-rose-900/50 to-purple-950",      orb1: "bg-pink-400",   orb2: "bg-rose-400",   border: "border-pink-500/20",   glow: "hover:shadow-pink-500/20",   tag: "bg-pink-500/10 text-pink-300 border border-pink-500/20",     badge: "text-pink-400",   numText: "text-pink-400/20" },
    sky:     { bg: "from-sky-950 via-blue-900/50 to-cyan-950",         orb1: "bg-sky-400",    orb2: "bg-blue-400",   border: "border-sky-500/20",    glow: "hover:shadow-sky-500/20",    tag: "bg-sky-500/10 text-sky-300 border border-sky-500/20",        badge: "text-sky-400",    numText: "text-sky-400/20" },
    emerald: { bg: "from-emerald-950 via-green-900/50 to-teal-950",    orb1: "bg-emerald-400",orb2: "bg-green-400",  border: "border-emerald-500/20",glow: "hover:shadow-emerald-500/20",tag: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",badge: "text-emerald-400",numText: "text-emerald-400/20" },
  };
  const a = accentMap[accent];
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: (index % 3) * 0.07 }}
      onClick={onClick}
      className={`group relative rounded-2xl border ${a.border} bg-zinc-900/70 overflow-hidden flex flex-col shadow-lg hover:shadow-xl ${a.glow} transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      {/* ── Gradient preview header ── */}
      <div className="relative h-36 overflow-hidden shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${a.bg}`} />
        {/* Orb 1 */}
        <motion.div
          className={`absolute top-3 left-6 w-24 h-24 rounded-full ${a.orb1} blur-3xl opacity-50`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
        />
        {/* Orb 2 */}
        <motion.div
          className={`absolute bottom-2 right-6 w-16 h-16 rounded-full ${a.orb2} blur-2xl opacity-40`}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 + 1 }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Number watermark */}
        <span className={`absolute bottom-2 right-4 text-7xl font-black font-mono leading-none select-none ${a.numText} group-hover:opacity-40 transition-opacity`}>
          {num}
        </span>
        {/* Status + featured badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-black/40 backdrop-blur-sm text-white/70 border border-white/10 px-2 py-0.5 rounded-full">
            {project.status === "in-progress" ? "In Progress" : project.status === "planned" ? "Planned" : "Completed"}
          </span>
          {project.featured && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase bg-violet-500/30 backdrop-blur-sm text-violet-200 border border-violet-400/30 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
        {/* Year */}
        <span className="absolute top-3 right-3 text-[10px] font-mono text-white/40">{project.year}</span>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-zinc-100 transition-colors">
          {project.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4 flex-1">
          {project.blurb}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 5).map((t) => {
            const TagIcon = TAG_ICONS[t];
            return (
              <span key={t} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${a.tag}`}>
                {TagIcon && <TagIcon size={10} />}
                {t}
              </span>
            );
          })}
          {project.tags.length > 5 && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700/50">
              +{project.tags.length - 5}
            </span>
          )}
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/60">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${a.badge} hover:text-white transition-colors`}
            >
              <SiGithub size={14} /> GitHub
            </a>
          ) : (
            <a
              href="https://github.com/Skywalker1910"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${a.badge} opacity-50 hover:opacity-100 hover:text-white transition-all`}
            >
              <SiGithub size={14} /> GitHub
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors ml-auto">
              Demo <ExternalLink size={10} />
            </a>
          )}
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors ml-auto">
              View <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ─── Expanded Project Modal ─────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const accentCycle = ["violet", "teal", "orange", "pink", "sky", "emerald"] as const;
  type AccentKey = typeof accentCycle[number];

  const deriveAccent = (): AccentKey => {
    const t = project.tags.join(" ").toLowerCase();
    if (t.includes("security") || t.includes("llm") || t.includes("gpt")) return "orange";
    if (t.includes("computer vision") || t.includes("opencv")) return "teal";
    if (t.includes("education") || t.includes("coursera")) return "sky";
    if (t.includes("testing") || t.includes("automation")) return "emerald";
    if (t.includes("recommendation") || t.includes("ml")) return "violet";
    return "violet";
  };
  const accent = deriveAccent();

  const accentMap: Record<AccentKey, {
    bg: string; orb1: string; orb2: string;
    border: string; glow: string;
    tag: string; badge: string; highlight: string;
  }> = {
    violet:  { bg: "from-violet-950 via-purple-900/50 to-indigo-950",  orb1: "bg-violet-500",  orb2: "bg-indigo-400",  border: "border-violet-500/30", glow: "shadow-violet-500/20",  tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20",  badge: "text-violet-400",  highlight: "text-violet-400" },
    teal:    { bg: "from-teal-950 via-cyan-900/50 to-emerald-950",     orb1: "bg-teal-400",    orb2: "bg-cyan-400",    border: "border-teal-500/30",   glow: "shadow-teal-500/20",   tag: "bg-teal-500/10 text-teal-300 border border-teal-500/20",     badge: "text-teal-400",    highlight: "text-teal-400" },
    orange:  { bg: "from-orange-950 via-amber-900/50 to-red-950",      orb1: "bg-orange-400", orb2: "bg-amber-300",  border: "border-orange-500/30", glow: "shadow-orange-500/20", tag: "bg-orange-500/10 text-orange-300 border border-orange-500/20", badge: "text-orange-400", highlight: "text-orange-400" },
    pink:    { bg: "from-pink-950 via-rose-900/50 to-purple-950",      orb1: "bg-pink-400",   orb2: "bg-rose-400",   border: "border-pink-500/30",   glow: "shadow-pink-500/20",   tag: "bg-pink-500/10 text-pink-300 border border-pink-500/20",     badge: "text-pink-400",   highlight: "text-pink-400" },
    sky:     { bg: "from-sky-950 via-blue-900/50 to-cyan-950",         orb1: "bg-sky-400",    orb2: "bg-blue-400",   border: "border-sky-500/30",    glow: "shadow-sky-500/20",    tag: "bg-sky-500/10 text-sky-300 border border-sky-500/20",        badge: "text-sky-400",    highlight: "text-sky-400" },
    emerald: { bg: "from-emerald-950 via-green-900/50 to-teal-950",    orb1: "bg-emerald-400",orb2: "bg-green-400",  border: "border-emerald-500/30",glow: "shadow-emerald-500/20",tag: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",badge: "text-emerald-400",highlight: "text-emerald-400" },
  };
  const a = accentMap[accent];

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] md:w-full md:max-w-2xl md:max-h-[85vh] overflow-hidden"
      >
        <div className={`relative h-full bg-zinc-900 rounded-2xl border ${a.border} shadow-2xl ${a.glow} flex flex-col overflow-hidden`}>
          {/* ── Gradient header ── */}
          <div className="relative h-40 md:h-44 overflow-hidden shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${a.bg}`} />
            {/* Orbs */}
            <motion.div
              className={`absolute top-4 left-8 w-32 h-32 rounded-full ${a.orb1} blur-3xl opacity-50`}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-4 right-8 w-24 h-24 rounded-full ${a.orb2} blur-2xl opacity-40`}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.2, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
            >
              <X size={16} />
            </button>
            {/* Status + featured badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-black/40 backdrop-blur-sm text-white/70 border border-white/10 px-2.5 py-1 rounded-full">
                {project.status === "in-progress" ? "In Progress" : project.status === "planned" ? "Planned" : "Completed"}
              </span>
              {project.featured && (
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-violet-500/30 backdrop-blur-sm text-violet-200 border border-violet-400/30 px-2.5 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
            {/* Year */}
            <span className="absolute bottom-4 right-4 text-sm font-mono text-white/50">{project.year}</span>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              {project.title}
            </h2>
            
            {/* Description */}
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-xs font-bold tracking-[0.2em] uppercase ${a.highlight} mb-3`}>
                  Highlights
                </h3>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed"
                    >
                      <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${a.highlight}`} />
                      {h}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            <div className="mb-6">
              <h3 className={`text-xs font-bold tracking-[0.2em] uppercase ${a.highlight} mb-3`}>
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t, i) => {
                  const TagIcon = TAG_ICONS[t];
                  return (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.03 }}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full ${a.tag}`}
                    >
                      {TagIcon && <TagIcon size={11} />}
                      {t}
                    </motion.span>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/60">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-sm font-medium text-white hover:bg-zinc-700 transition-colors`}
                >
                  <SiGithub size={16} /> View on GitHub
                </a>
              ) : (
                <a
                  href="https://github.com/Skywalker1910"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-800 border border-zinc-700/50 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors`}
                >
                  <SiGithub size={16} /> GitHub Profile
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm ${a.badge} hover:text-white transition-colors`}
                >
                  Demo <ExternalLink size={12} />
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-sm ${a.badge} hover:text-white transition-colors`}
                >
                  View <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
