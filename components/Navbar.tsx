"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun, Moon, Home, Briefcase, Layers, Zap, Mail,
  GraduationCap, Globe, FileText, Info, Shield, ArrowUpRight,
} from "lucide-react";
import CareerStatus from "./CareerStatus";

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
  preview: {
    icon: React.ElementType;
    title: string;
    description: string;
    tags: string[];
  };
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "About", preview: { icon: Home, title: "About Aditya", description: "An introduction to Aditya, his career journey, core skills, and featured ML/AI work.", tags: ["Introduction", "Career Timeline", "Featured Work"] } },
  { href: "/experience", label: "Experience", preview: { icon: Briefcase, title: "Work & Research", description: "Graduate research at Clemson, internships, and teaching assistant roles.", tags: ["Clemson Research", "Internships", "TA"] } },
  { href: "/projects", label: "Projects", preview: { icon: Layers, title: "ML/AI Projects", description: "Movie recommendation (26M ratings), NASA air quality pipeline, adversarial ML.", tags: ["PyTorch", "scikit-learn", "OpenCV"] } },
  { href: "/skills", label: "Skills", preview: { icon: Zap, title: "Technical Skills", description: "Python, deep learning, NLP, data engineering, and MLOps toolchain.", tags: ["Python", "PyTorch", "Docker"] } },
  { href: "/contact", label: "Contact", preview: { icon: Mail, title: "Get in Touch", description: "Available for ML/AI and Data Science roles — reach out directly.", tags: ["Open to Work", "Form", "Email"] } },
  { href: "/education", label: "Education", preview: { icon: GraduationCap, title: "Academic Background", description: "MS Computer Science at Clemson (2025) and BE from DYPCET.", tags: ["Clemson MS", "DYPCET BE"] } },
  { href: "/socials", label: "Socials", preview: { icon: Globe, title: "Find Me Online", description: "GitHub repos, LinkedIn profile, and other professional networks.", tags: ["GitHub", "LinkedIn"] } },
  { href: "/resume.pdf", label: "Resume ↗", external: true, preview: { icon: FileText, title: "Download Resume", description: "A concise overview of Aditya's experience, education, projects, and technical strengths.", tags: ["Experience", "Education", "PDF Download"] } },
  { href: "/notice", label: "Notice", preview: { icon: Info, title: "Product Notice", description: "Current feature status, AI limitations, deployment behavior, and the public roadmap.", tags: ["Live Status", "AI Disclosures", "Roadmap"] } },
  { href: "/privacy", label: "Privacy", preview: { icon: Shield, title: "Privacy Policy", description: "How anonymous traffic, contact submissions, BB-8 prompts, and browser-session data are handled.", tags: ["Anonymous Analytics", "Contact Data", "BB-8"] } },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Every full app launch starts in light mode; the toggle lasts for this visit.
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
      style={{ color: "var(--navbar-muted)" }}
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}



export default function Navbar() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [careerOpen, setCareerOpen] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const careerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const showPreview = useCallback((href: string) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setActiveKey(href);
  }, []);

  const hidePreview = useCallback(() => {
    hideTimeout.current = setTimeout(() => setActiveKey(null), 120);
  }, []);

  const keepPreview = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveKey(null);
    setCareerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (careerRef.current && !careerRef.current.contains(e.target as Node)) setCareerOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); }, []);

  const activeItem = NAV_ITEMS.find(i => i.href === activeKey);

  return (
    <>
      {/* Theme-aware navbar: white in light mode, dark in dark mode */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-11 backdrop-blur-xl"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--navbar-border)",
        }}
      >
        {/* Full-width: name at extreme left, Open to Work at extreme right */}
        <div className="w-full px-5 md:px-8 h-full flex items-center gap-4">

          {/* Wordmark — extreme left */}
          <Link
            href="/"
            className="text-[13px] font-semibold whitespace-nowrap shrink-0 transition-opacity hover:opacity-70"
            style={{ color: "var(--navbar-text)" }}
          >
            Aditya More
          </Link>

          {/* Desktop nav — centered, all links flat */}
          <nav className="hidden md:flex items-center flex-1 justify-center">
            <div className="relative flex items-center" onMouseLeave={hidePreview}>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <div
                    key={item.href}
                    onMouseEnter={() => showPreview(item.href)}
                  >
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-[12px] whitespace-nowrap transition-opacity hover:opacity-100"
                        style={{ color: isActive ? "var(--navbar-text)" : "var(--navbar-muted)", fontWeight: isActive ? 600 : 400 }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className="px-2 py-1 text-[12px] whitespace-nowrap transition-opacity hover:opacity-100"
                        style={{ color: isActive ? "var(--navbar-text)" : "var(--navbar-muted)", fontWeight: isActive ? 600 : 400 }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <AnimatePresence mode="wait">
                {activeKey && activeItem && (
                  <motion.div
                    key={activeKey}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute left-0 top-[calc(100%+12px)] z-50 w-full min-w-[620px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-5 shadow-2xl backdrop-blur-2xl"
                    style={{ boxShadow: "0 24px 70px color-mix(in srgb, var(--text) 17%, transparent)" }}
                    onMouseEnter={keepPreview}
                    onMouseLeave={hidePreview}
                  >
                    <div className="grid grid-cols-[1.15fr_1fr] gap-6">
                      <div className="flex min-w-0 flex-col justify-between border-r border-[var(--border)] pr-6">
                        <div>
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--tag-bg)] text-[var(--text)]">
                            <activeItem.preview.icon size={17} />
                          </div>
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--sub-muted)]">
                            Page preview
                          </p>
                          <p className="text-xl font-semibold text-[var(--text)]">{activeItem.preview.title}</p>
                          <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
                            {activeItem.preview.description}
                          </p>
                        </div>
                        {activeItem.external ? (
                          <a href={activeItem.href} target="_blank" rel="noopener noreferrer" className="cta-primary mt-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold">
                            Open page <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <Link href={activeItem.href} className="cta-primary mt-5 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold">
                            Open page <ArrowUpRight size={12} />
                          </Link>
                        )}
                      </div>

                      <div>
                        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--sub-muted)]">Inside this page</p>
                        <div className="space-y-2">
                          {activeItem.preview.tags.map((tag, index) => (
                            <div key={tag} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 px-3 py-2.5">
                              <span className="font-mono text-[10px] text-[var(--sub-muted)]">0{index + 1}</span>
                              <span className="text-xs font-medium text-[var(--text)]">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right: theme toggle + Open to Work — extreme right */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto" ref={careerRef}>
            <ThemeToggle />
            <button
              onClick={() => setCareerOpen(o => !o)}
              className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full hover:bg-emerald-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
              Open to Work
            </button>
            <AnimatePresence>
              {careerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1 right-8 w-[400px]"
                >
                  <CareerStatus />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden items-center justify-center h-8 w-8 ml-auto transition-opacity hover:opacity-70"
            style={{ color: "var(--navbar-muted)" }}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="flex flex-col gap-[5px] items-center justify-center w-4">
              <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </span>
          </button>
        </div>

        {/* Mobile menu — always dark as an overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden bg-[#0d1117]/98 backdrop-blur-xl border-b border-white/10 flex flex-col"
            >
              {NAV_ITEMS.map(item =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 text-[14px] text-white/60 hover:text-white border-b border-white/5 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-6 py-3.5 text-[14px] text-white/60 hover:text-white border-b border-white/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="h-11" />
    </>
  );
}
