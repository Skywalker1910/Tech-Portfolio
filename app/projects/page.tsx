"use client";
import { useMemo, useState } from "react";
import Badge from "../../components/Badge";
import Link from "next/link";

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

const ALL: Project[] = [
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
    </div>
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

      {/* Links */}
      {(project.github || project.demo || project.link) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {project.github && (
            <a 
              href={project.github} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              GitHub
            </a>
          )}
          {project.demo && (
            <a 
              href={project.demo} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              Live Demo
            </a>
          )}
          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors"
            >
              View Project
            </a>
          )}
        </div>
      )}
    </article>
  );
}
