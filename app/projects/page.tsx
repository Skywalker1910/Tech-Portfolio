"use client";
import { useMemo, useState, useEffect, useRef, type ComponentType } from "react";
import { FlaskConical, ExternalLink, FolderOpen, Brain, ShieldAlert, Languages, Eye, BookOpen, Phone, Workflow, TestTube2, Cpu, Bot, Swords, Car, Star, ClipboardList, Shield, Database, Layers, GitBranch, Search, X, ChevronDown, SlidersHorizontal, MessageSquare, Zap, CheckCircle2 } from "lucide-react";
import { SiGithub, SiHuggingface, SiPython, SiTensorflow, SiOpencv, SiJupyter, SiCoursera, SiSelenium, SiPytorch, SiOpenai, SiScikitlearn, SiPandas, SiNumpy, SiDocker, SiPostman, SiNasa, SiFastapi, SiReact } from "react-icons/si";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { trackBasicAnalyticsEvent } from "@/lib/client-analytics";

const projectFeature = (title:string) => `project:${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "unknown"}`;

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
  "Amazon S3 Vectors":        Database,
  "OpenAI API":               SiOpenai,
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
  huggingface?: string;
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
    title: "LLM Jailbreak Defense Evaluation",
    period: "Spring 2025",
    context: "CPSC 8570 Security Research · Clemson University",
    bullets: [
      "Replicated and extended the MASTERKEY jailbreak framework for black-box model evaluation.",
      "Built a 13-category prompt dataset from public sources and custom augmentations.",
      "Automated query-success, refusal, exception, timeout, latency, and token-use analysis.",
      "Benchmarked multiple commercial LLMs without requiring internal model access.",
    ],
    tags: ["LLM", "Python", "Evaluation", "AI Security", "Adversarial AI"],
    github: "https://github.com/Skywalker1910/Evaluating-Defense-Mechanisms-Jailbreak-LLMs",
    accent: "orange",
  },
];

const ALL: Project[] = [
  // ⭐ Featured Projects
  {
    title: "BB8 Co-Pilot x Tech Portfolio",
    blurb: "A live, source-grounded portfolio assistant that retrieves verified evidence before answering visitors.",
    description: "Built the AI co-pilot for this portfolio with OpenAI Responses and Embeddings, Amazon S3 Vectors, and a persistent Next.js chat overlay. BB-8 retrieves only relevant, verified portfolio evidence, cites the matching pages, supports navigation and contact workflows, and falls back to deterministic local retrieval when vector search is unavailable.",
    highlights: [
      "Designed section-aware chunking over a verified structured knowledge corpus",
      "Implemented OpenAI embedding generation and Amazon S3 Vectors semantic search",
      "Grounded Responses API prompts with only the top matching portfolio chunks",
      "Added source-page links, persistent overlay navigation, and graceful local fallback",
      "Built retrieval evaluation, usage telemetry, and privacy-aware first-party analytics",
      "Deployed the SSR application through AWS Amplify with DynamoDB-backed content and administration",
    ],
    tags: ["LLM", "RAG", "OpenAI API", "Embeddings", "Amazon S3 Vectors", "Next.js", "TypeScript", "React", "AWS"],
    year: 2026,
    status: "in-progress",
    featured: true,
    github: "https://github.com/Skywalker1910/Tech-Portfolio",
    demo: "https://www.adityamore.dev",
  },
  {
    title: "Neural Log — Personal Activity & Progress System",
    blurb: "A live multi-workspace tracker with an auditable XP ledger, analytics, AI weekly reviews, and long-term progress tools.",
    description: "Built a production activity system for training, nutrition, learning, habits, and daily routines. Flask serves a React and TypeScript application from one origin, SQLite is the authoritative store, and Docker Compose with Caddy runs the service on AWS Lightsail.",
    highlights: [
      "Created eight evidence-based attributes backed by an auditable XP transaction ledger",
      "Built training, nutrition, learning, habits, goals, streaks, records, and calendar analytics",
      "Added private AI weekly reviews, illustrated personal libraries, and accessibility-focused mobile workflows",
      "Implemented admin-managed invite codes, isolated administration, privacy-aware leaderboards, SQL migrations, and verified backups",
      "Deployed Flask/Gunicorn, React, SQLite, Docker Compose, and Caddy on AWS Lightsail",
    ],
    tags: ["Python", "Flask", "React", "TypeScript", "SQLite", "Docker", "AWS", "Data Analysis"],
    year: 2026,
    status: "in-progress",
    featured: true,
    github: "https://github.com/Skywalker1910/Neural-Log",
    demo: "https://neurallog.adityamore.dev",
  },
  {
    title: "Movie Recommendation Engine",
    blurb: "A live hybrid recommender spanning reproducible ML experiments, a Flask API, a React client, and AWS deployment.",
    description: "Expanded a Clemson course project into a production application combining FunkSVD, NeuMF, TF-IDF content similarity, and Bayesian popularity over MovieLens, TMDB, and IMDb data. The system includes personalized onboarding, watch history, live TMDB enrichment, Hugging Face model artifacts, an isolated admin dashboard, and automated CI/CD to AWS EC2.",
    highlights: [
      "Processed 26M+ ratings across 270K users and 45K movies",
      "Achieved RMSE 0.7600 with FunkSVD, about 21% better than the baseline",
      "Improved NeuMF validation RMSE from 1.0725 to 0.8543 while reducing parameters from 26.3M to 13.1M",
      "Combined collaborative, neural, content, and popularity signals for coverage-aware ranking",
      "Moved versioned model artifacts to Hugging Face with automatic download when absent",
      "Deployed Flask, React, Docker, nginx, gunicorn, SSL, and GitHub Actions on AWS EC2",
    ],
    tags: ["Python", "scikit-learn", "PyTorch", "Flask", "React", "SQLite", "Docker", "AWS", "Hugging Face", "Recommender Systems"],
    year: 2024,
    status: "completed",
    featured: true,
    github: "https://github.com/Skywalker1910/Movies-Recommendation-Engine",
    demo: "https://movies.adityamore.dev",
    huggingface: "https://huggingface.co/Skywalker1910/movie-rec-models",
  },
  {
    title: "BB-8: Transformer Language Model",
    blurb: "An 11-experiment LLM engineering study from a 112K-parameter character model through Qwen LoRA and grounded retrieval.",
    description: "This separate LLM engineering study does not serve the live portfolio assistant. It builds a decoder-only GPT-style Transformer in PyTorch from first principles, then extends the work into Qwen2.5 LoRA fine-tuning and grounded retrieval with its own tokenizers, training and evaluation loops, decoding strategies, experiment tracking, and CPU Lambda deployment path.",
    highlights: [
      "Implemented embeddings, causal multi-head attention, Pre-LN decoder blocks, and language-model heads from first principles",
      "Ran 11 documented experiments from 112K parameters to Qwen2.5-0.5B LoRA fine-tuning",
      "Built an 80-case, five-configuration chat suite that exposed a prompt-format mismatch and 29% training-example truncation",
      "Used an 88-case grounded-QA benchmark and 80% promotion gate to reject a perplexity-1.03 model that passed only 22% of content and citation checks",
      "Added dataset hashing, commit pinning, versioned configs, a model registry, Hugging Face artifacts, and AWS deployment",
    ],
    tags: ["Python", "PyTorch", "Transformers", "NLP", "LoRA", "BPE", "Hugging Face", "AWS Lambda"],
    year: 2026,
    status: "in-progress",
    featured: true,
    github: "https://github.com/Skywalker1910/BB-8",
    demo: "https://chat.adityamore.dev/",
    huggingface: "https://huggingface.co/Skywalker1910/BB8",
  },
  {
    title: "FIFA World Cup 2026 Prediction Platform",
    blurb: "A live regional prediction platform with player accounts, public leaderboards, tournament views, and a private command center.",
    description: "Built a compact full-stack World Cup prediction system on a dependency-free Node HTTP server and SQLite. One deployment serves distinct US and India scoring experiences, authenticated players and AI agents, public profiles, fixture and bracket views, administrative operations, and optional score synchronization.",
    highlights: [
      "Designed two regional scoring systems and role-scoped access from one SQLite-backed deployment",
      "Implemented prediction locking, score forecasts, public picks, profiles, leaderboards, and tournament progression",
      "Built a private command center for accounts, results, prediction records, settings, ledgers, and audit history",
      "Added dedicated AI agent accounts with reasoning, confidence, provider, model, and accuracy metadata",
      "Deployed the containerized service on Railway with persistent storage and production operations documentation",
    ],
    tags: ["JavaScript", "Node.js", "SQLite", "Docker", "Railway", "AI Agents", "API Integration"],
    year: 2026,
    status: "in-progress",
    featured: true,
    github: "https://github.com/Skywalker1910/FIFA-World-Cup-2026",
    demo: "https://game.adityamore.dev",
  },
  {
    title: "FIFA 2026 AI Prediction Agents",
    blurb: "Scheduled LLM agents authenticate as players, reason over eligible fixtures, and submit structured predictions to the live game.",
    description: "Built a companion Node service that reads live fixture context, validates eligibility, requests structured predictions from an OpenAI model, and submits picks with scores, rationale, confidence, and model metadata through the prediction platform API. GitHub Actions can run the agent on a schedule, with dry-run controls and provider scaffolds for Claude and Gemini.",
    highlights: [
      "Implemented API-based login, fixture retrieval, prediction submission, logout, and transient-lock retries",
      "Enforced structured output, valid teams and match IDs, lock windows, and conservative score forecasts",
      "Captured model, response ID, token usage, reasoning, confidence, and request metadata",
      "Added dry-run, due-window, next-match, and update-existing execution modes",
      "Automated scheduled runs with GitHub Actions and provider-specific adapters",
    ],
    tags: ["JavaScript", "Node.js", "OpenAI API", "AI Agents", "Structured Outputs", "GitHub Actions"],
    year: 2026,
    status: "in-progress",
    github: "https://github.com/Skywalker1910/FIFA-World-Cup-2026-AI-Agents",
    demo: "https://game.adityamore.dev",
  },
  {
    title: "Skynet — AQI Prediction System",
    blurb: "An ML pipeline that forecasts Air Quality Index from NASA TEMPO, OpenAQ, weather, and traffic data.",
    description: "Built an end-to-end machine-learning pipeline for the 2025 NASA Space Apps Challenge, integrating environmental, meteorological, and traffic sources to model temporal and spatial AQI patterns.",
    highlights: [
      "Integrated NASA TEMPO, OpenAQ, weather, and traffic APIs",
      "Designed ingestion, preprocessing, and feature-engineering pipelines",
      "Modeled temporal and spatial patterns that influence air quality",
    ],
    tags: ["Python", "scikit-learn", "pandas", "NumPy", "ML Pipeline", "Air Quality"],
    year: 2025,
    status: "completed",
  },
  {
    title: "LLM Jailbreak Defense Evaluation",
    blurb: "A black-box evaluation framework for jailbreak attempts, refusal behavior, latency, token use, and model failure modes.",
    description: "Replicated and extended the MASTERKEY approach for a Clemson security research project. The modular pipeline executes a multi-category jailbreak dataset against commercial LLMs, calculates query success rates, and categorizes timeouts, exceptions, and model refusals without internal model access.",
    highlights: [
      "Built a 13-category dataset from public jailbreak sources and custom augmentations",
      "Automated prompt execution, result logging, query-success evaluation, and category-level analysis",
      "Tracked latency, token usage, response refusals, exceptions, and timeout failure modes",
      "Evaluated multiple OpenAI model families through a reproducible black-box workflow",
    ],
    tags: ["Python", "LLM", "AI Security", "Adversarial ML", "Evaluation", "OpenAI API"],
    year: 2025,
    status: "completed",
    github: "https://github.com/Skywalker1910/Evaluating-Defense-Mechanisms-Jailbreak-LLMs",
  },
  {
    title: "Deep Learning Coursework — CPSC 8430",
    blurb: "A four-repository implementation series covering video captioning, spoken question answering, and generative adversarial networks.",
    description: "Completed a graduate deep-learning implementation series in PyTorch spanning attention-based Seq2Seq video captioning, BERT question answering over noisy speech transcripts, and DCGAN, WGAN, and ACGAN image-generation experiments.",
    highlights: [
      "Built an encoder-decoder video-captioning model with attention and BLEU evaluation",
      "Fine-tuned BERT-Base on Spoken-SQuAD with document stride, mixed precision, gradient checkpointing, and accumulation",
      "Reached 63.5% F1 and 40.1% exact match on the Spoken-SQuAD assignment evaluation",
      "Implemented DCGAN, WGAN, and ACGAN variants and compared generation quality with FID and Inception Score",
    ],
    tags: ["Python", "PyTorch", "Deep Learning", "BERT", "Transformers", "GANs", "Computer Vision", "NLP"],
    year: 2024,
    status: "completed",
    github: "https://github.com/Skywalker1910/CPSC-8430-Deep-Learning",
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
  const [projects, setProjects] = useState<Project[]>(ALL);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [showFeatured, setShowFeatured] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    fetch("/api/content/projects").then((response) => response.ok ? response.json() : Promise.reject()).then((items) => {
      if (Array.isArray(items) && items.length) setProjects(items);
    }).catch(() => {});
  }, []);

  const tags = useMemo(() => Array.from(new Set(projects.flatMap(p => p.tags))).sort(), [projects]);
  const statuses = useMemo(() => Array.from(new Set(projects.map(p => p.status))), [projects]);
  
  const filtered = projects.filter(p => {
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
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--muted)]">Work &amp; Projects</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)]">Projects</h1>
        <p className="mt-3 text-[var(--muted)] max-w-lg text-sm leading-relaxed">
          A collection of my work in machine learning, security research, and educational tools.
        </p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] card-elevated backdrop-blur-sm overflow-hidden"
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]/80">
          <Search size={14} className="text-[var(--muted)] shrink-0" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, tags, descriptions…"
            className="flex-1 bg-transparent text-sm text-[var(--tag-text)] placeholder:text-[var(--sub-muted)] outline-none caret-violet-400"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-[var(--muted)] hover:text-[var(--tag-text)] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <SlidersHorizontal size={11} className="text-[var(--sub-muted)] shrink-0" />

          {/* Tag filter */}
          <div className="relative">
            <select
              value={tag || ""}
              onChange={e => setTag(e.target.value || undefined)}
              className={`appearance-none text-[11px] font-medium pl-3 pr-6 py-1.5 rounded-full border transition-colors cursor-pointer bg-[var(--surface)] outline-none ${
                tag
                  ? "border-violet-500/50 text-violet-300 bg-violet-500/10"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--tag-text)]"
              }`}
            >
              <option value="">All Technologies</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status || ""}
              onChange={e => setStatus(e.target.value || undefined)}
              className={`appearance-none text-[11px] font-medium pl-3 pr-6 py-1.5 rounded-full border transition-colors cursor-pointer bg-[var(--surface)] outline-none ${
                status
                  ? "border-teal-500/50 text-teal-300 bg-teal-500/10"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--tag-text)]"
              }`}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
            </select>
            <ChevronDown size={9} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]" />
          </div>

          {/* Featured toggle */}
          <button
            onClick={() => setShowFeatured(v => !v)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
              showFeatured
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--tag-text)] hover:border-[var(--border)]"
            }`}
          >
            <Star size={10} />
            Featured
          </button>

          {/* Result count */}
          <span className="ml-auto text-[11px] font-mono text-[var(--sub-muted)]">
            {filtered.length}&thinsp;/&thinsp;{ALL.length} projects
          </span>

          {/* Clear all */}
          {(q || tag || status || showFeatured) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--tag-text)] transition-colors px-2 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--border)]"
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
          <ProjectFancyCard key={i} project={p} index={i} onClick={() => { trackBasicAnalyticsEvent("project_opened", { page:"/projects", feature:projectFeature(p.title) }); setSelectedProject(p); }} />
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
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[var(--muted)]">
            Research & Experimentation
          </p>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">
          Experimentation &amp; Case Studies
        </h2>
        <p className="text-sm text-[var(--muted)] max-w-xl mb-10 leading-relaxed">
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
    <article className={`group border-b border-[var(--border)] first:border-t py-8 flex flex-col md:flex-row gap-6 md:gap-10 transition-colors`}>
      {/* Number */}
      <span className={`text-6xl md:text-7xl font-black leading-none font-mono select-none shrink-0 ${a.num} group-hover:opacity-60 transition-opacity`}>
        {cs.num}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Context + period */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className={`text-[10px] font-bold tracking-[0.25em] uppercase border border-[var(--border)]/70 bg-[var(--tag-bg)] text-[var(--muted)] px-2 py-0.5 rounded`}>
            {cs.context}
          </span>
          <span className="text-[11px] font-mono text-[var(--sub-muted)]">{cs.period}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] mb-4 leading-snug group-hover:text-[var(--tag-text)] transition-colors">
          {cs.title}
        </h3>

        {/* Bullets */}
        <ul className="space-y-2 mb-5">
          {cs.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--muted)] leading-relaxed">
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
            className={`inline-flex items-center gap-1.5 mt-4 text-xs ${a.badge} hover:text-[var(--text)] transition-colors`}
          >
            View on GitHub <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(previewRef);
  const reduceMotion = useReducedMotion();
  const title = project.title.toLowerCase();
  const animate = inView && !reduceMotion;

  if (title.includes("movie recommendation")) {
    return <div ref={previewRef} className="absolute inset-x-8 bottom-4 top-9 flex items-end gap-3" aria-hidden="true">
      {[58, 82, 68, 94, 76].map((height, index) => <motion.div key={height} className="relative flex-1 rounded-t-md border border-white/15 bg-white/10"
        style={{ height:`${height}%` }}
        animate={animate ? { y:[0, -5, 0], opacity:[0.65, 1, 0.65] } : { y:0, opacity:0.85 }}
        transition={{ duration:2.8, repeat:animate ? Infinity : 0, delay:index * 0.18, ease:"easeInOut" }}>
        <div className="absolute inset-x-1 bottom-2 h-1 rounded-full bg-violet-300/60" />
      </motion.div>)}
      <motion.div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"
        animate={animate ? { scaleX:[0.35, 1, 0.35], opacity:[0.25, 0.9, 0.25] } : { scaleX:1, opacity:0.6 }}
        transition={{ duration:3.4, repeat:animate ? Infinity : 0, ease:"easeInOut" }} />
    </div>;
  }

  if (title.includes("co-pilot")) {
    return <div ref={previewRef} className="absolute inset-x-7 bottom-4 top-10" aria-hidden="true">
      <motion.div className="absolute left-0 top-0 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[9px] text-white/70"
        animate={animate ? { x:[0, 5, 0], opacity:[0.6, 1, 0.6] } : { x:0, opacity:1 }}
        transition={{ duration:3, repeat:animate ? Infinity : 0, ease:"easeInOut" }}>Ask about my work</motion.div>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1.5">
        {[0, 1, 2].map((index) => <motion.span key={index} className="h-2 w-2 rounded-full bg-orange-300"
          animate={animate ? { scale:[0.6, 1.25, 0.6], opacity:[0.35, 1, 0.35] } : { scale:1, opacity:0.75 }}
          transition={{ duration:1.6, repeat:animate ? Infinity : 0, delay:index * 0.2 }} />)}
      </div>
      <motion.div className="absolute bottom-0 right-0 w-3/5 rounded-lg border border-orange-300/30 bg-orange-300/10 px-3 py-2 text-[9px] text-orange-100"
        animate={animate ? { y:[3, 0, 3], opacity:[0.55, 1, 0.55] } : { y:0, opacity:1 }}
        transition={{ duration:3, repeat:animate ? Infinity : 0, delay:0.8, ease:"easeInOut" }}>Grounded answer + sources</motion.div>
    </div>;
  }

  if (title.includes("transformer")) {
    return <div ref={previewRef} className="absolute inset-x-8 bottom-5 top-10 flex items-center justify-between" aria-hidden="true">
      {['B', 'B', '-', '8'].map((token, index) => <motion.div key={`${token}-${index}`} className="grid h-8 w-8 place-items-center rounded-md border border-orange-300/30 bg-black/25 font-mono text-xs text-orange-100"
        animate={animate ? { x:[-4, 5, -4], rotateY:[0, 180, 360], opacity:[0.45, 1, 0.45] } : { x:0, rotateY:0, opacity:1 }}
        transition={{ duration:3.6, repeat:animate ? Infinity : 0, delay:index * 0.22, ease:"easeInOut" }}>{token}</motion.div>)}
      <motion.div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-orange-400/10 via-orange-200/80 to-orange-400/10"
        animate={animate ? { scaleX:[0.2, 1, 0.2] } : { scaleX:1 }}
        transition={{ duration:2.4, repeat:animate ? Infinity : 0 }} />
    </div>;
  }

  if (title.includes("neural log")) {
    return <div ref={previewRef} className="absolute inset-x-8 bottom-4 top-9 flex items-center gap-5" aria-hidden="true">
      <motion.div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-[6px] border-teal-300/20 border-t-teal-300 text-[10px] font-bold text-teal-100"
        animate={animate ? { rotate:[0, 360] } : { rotate:0 }}
        transition={{ duration:7, repeat:animate ? Infinity : 0, ease:"linear" }}>XP</motion.div>
      <div className="flex flex-1 flex-col gap-2.5">{[82, 63, 91].map((width, index) => <div key={width} className="h-2 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-200" style={{ width:`${width}%`, transformOrigin:"left" }} animate={animate ? { scaleX:[0.45, 1, 0.45] } : { scaleX:1 }} transition={{ duration:3.2, repeat:animate ? Infinity : 0, delay:index * 0.3 }} /></div>)}</div>
    </div>;
  }

  if (title.includes("fifa")) {
    return <div ref={previewRef} className="absolute inset-x-8 bottom-4 top-9 grid place-items-center" aria-hidden="true">
      <motion.div className="w-full rounded-xl border border-emerald-300/20 bg-black/25 p-3 shadow-lg"
        animate={animate ? { y:[2, -3, 2], boxShadow:["0 0 0 rgba(52,211,153,0)", "0 0 24px rgba(52,211,153,.2)", "0 0 0 rgba(52,211,153,0)"] } : { y:0, boxShadow:"0 0 0 rgba(52,211,153,0)" }}
        transition={{ duration:3.2, repeat:animate ? Infinity : 0, ease:"easeInOut" }}>
        <div className="flex items-center justify-between text-[9px] font-bold tracking-[.18em] text-white/55"><span>TEAM A</span><span className="text-base text-white">2 : 1</span><span>TEAM B</span></div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full bg-emerald-300" animate={animate ? { width:["28%", "78%", "28%"] } : { width:"64%" }} transition={{ duration:3.8, repeat:animate ? Infinity : 0, ease:"easeInOut" }} /></div>
      </motion.div>
    </div>;
  }

  return <div ref={previewRef} className="absolute inset-x-8 bottom-4 top-10 rounded-lg border border-white/10 bg-black/20 p-3" aria-hidden="true">
    {[72, 90, 58].map((width, index) => <motion.div key={width} className="mb-2 h-1.5 rounded-full bg-white/30" style={{ width:`${width}%` }} animate={animate ? { opacity:[0.25, 0.8, 0.25], x:[0, 5, 0] } : { opacity:0.75, x:0 }} transition={{ duration:2.6, repeat:animate ? Infinity : 0, delay:index * 0.28 }} />)}
    <motion.div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" animate={animate ? { scaleX:[0.2, 1, 0.2] } : { scaleX:1 }} transition={{ duration:3, repeat:animate ? Infinity : 0 }} />
  </div>;
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
      className={`group relative rounded-2xl border ${a.border} bg-[var(--surface)] overflow-hidden flex flex-col shadow-lg hover:shadow-xl ${a.glow} card-elevated transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      {/* ── Gradient preview header ── */}
      <div className="relative h-36 overflow-hidden shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${a.bg}`} />
        <ProjectPreview project={project} />
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
        <h3 className="text-base font-bold text-[var(--text)] leading-snug mb-2 group-hover:text-[var(--text)] transition-colors">
          {project.title}
        </h3>
        <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 flex-1">
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
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--muted)] border border-[var(--border)]">
              +{project.tags.length - 5}
            </span>
          )}
        </div>

        {/* Footer links */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-3 border-t border-[var(--border)]">
          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"github" } }); }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${a.badge} hover:text-[var(--text)] transition-colors`}
            >
              <SiGithub size={14} /> GitHub
            </a>
          ) : (
            <a
              href="https://github.com/Skywalker1910"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"github" } }); }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${a.badge} opacity-50 hover:opacity-100 hover:text-[var(--text)] transition-all`}
            >
              <SiGithub size={14} /> GitHub
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackBasicAnalyticsEvent("demo_started", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"demo" } }); }}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Live app <ExternalLink size={10} />
            </a>
          )}
          {project.huggingface && (
            <a href={project.huggingface} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"huggingface" } }); }}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              <SiHuggingface size={11} /> Models
            </a>
          )}
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"other" } }); }}
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">
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
  type AccentKey = "violet" | "teal" | "orange" | "pink" | "sky" | "emerald";

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
        <div className={`relative h-full bg-[var(--surface)] rounded-2xl border ${a.border} shadow-2xl card-elevated ${a.glow} flex flex-col overflow-hidden`}>
          {/* ── Gradient header ── */}
          <div className="relative h-40 md:h-44 overflow-hidden shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${a.bg}`} />
            <ProjectPreview project={project} />
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
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-[var(--text)] hover:bg-black/60 transition-all"
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
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-3 leading-tight">
              {project.title}
            </h2>
            
            {/* Description */}
            <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed mb-6">
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
                      className="flex items-start gap-2.5 text-sm text-[var(--tag-text)] leading-relaxed"
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
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border)]">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"github" } })}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--tag-bg)] border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--tag-bg)] transition-colors`}
                >
                  <SiGithub size={16} /> View on GitHub
                </a>
              ) : (
                <a
                  href="https://github.com/Skywalker1910"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"github" } })}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--tag-bg)] border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--tag-bg)] transition-colors`}
                >
                  <SiGithub size={16} /> GitHub Profile
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBasicAnalyticsEvent("demo_started", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"demo" } })}
                  className={`inline-flex items-center gap-1.5 text-sm ${a.badge} hover:text-[var(--text)] transition-colors`}
                >
                  Live application <ExternalLink size={12} />
                </a>
              )}
              {project.huggingface && (
                <a
                  href={project.huggingface}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"huggingface" } })}
                  className={`inline-flex items-center gap-1.5 text-sm ${a.badge} hover:text-[var(--text)] transition-colors`}
                >
                  <SiHuggingface size={15} /> Hugging Face
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackBasicAnalyticsEvent("external_link_clicked", { page:"/projects", feature:projectFeature(project.title), metadata:{ targetCategory:"other" } })}
                  className={`inline-flex items-center gap-1.5 text-sm ${a.badge} hover:text-[var(--text)] transition-colors`}
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
