"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, ChevronDown, Sparkles, Orbit } from "lucide-react";

function BackgroundToggle() {
  const [bg, setBg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bg-mode");
      setBg(saved && ["neural", "interstellar"].includes(saved) ? saved : "neural");
    } catch {
      setBg("neural");
    }
  }, []);

  const BG_ORDER = ["neural", "interstellar"] as const;

  const toggle = () => {
    const idx = BG_ORDER.indexOf((bg ?? "neural") as typeof BG_ORDER[number]);
    const next = BG_ORDER[(idx + 1) % BG_ORDER.length];
    setBg(next);
    try {
      localStorage.setItem("bg-mode", next);
      window.dispatchEvent(new CustomEvent("bg-change", { detail: next }));
    } catch {}
  };

  const icons: Record<string, React.ReactNode> = {
    neural: <Sparkles size={16} />,
    interstellar: <Orbit size={16} />,
  };

  const resolved = bg ?? "neural";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle background animation"
      className="flex items-center justify-center h-8 w-8 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={resolved}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center"
        >
          {icons[resolved]}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
        active ? "bg-white text-black" : "text-zinc-300 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const t = saved && ["dark", "light"].includes(saved) ? saved : "dark";
      setTheme(t);
      applyTheme(t);
    } catch {
      setTheme("dark");
    }
  }, []);

  const applyTheme = (t: string) => {
    try {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(t);
      localStorage.setItem("theme", t);
    } catch {}
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const resolved = theme ?? "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center h-8 w-8 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={resolved}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center"
        >
          {resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

const MORE_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/skills", label: "Skills" },
  { href: "/socials", label: "Socials" },
  { href: "/contact", label: "Contact" },
  { href: "/resume.pdf", label: "Resume ↗", external: true },
  { href: "/notice", label: "Notice" },
  { href: "/privacy", label: "Privacy" },
];

export default function Navbar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const allMobileLinks: { href: string; label: string; external?: boolean }[] = [
    { href: "/", label: "Home" },
    { href: "/education", label: "Education" },
    { href: "/experience", label: "Experience" },
    { href: "/projects", label: "Projects" },
    ...MORE_LINKS,
  ];

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* Top-left wordmark */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-50 hidden md:flex items-center font-semibold text-sm text-zinc-200 hover:text-white tracking-tight whitespace-nowrap transition-colors"
      >
        Aditya More&nbsp;<span className="text-zinc-500">•</span>&nbsp;Tech Portfolio
      </Link>

      {/* Top-right open to work badge */}
      <div className="fixed top-5 right-5 z-50 hidden md:flex items-center">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          Open to Work
        </span>
      </div>

      {/* Floating pill navbar */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-auto">
        <nav className="flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-zinc-900/85 backdrop-blur-md border border-zinc-800 shadow-2xl shadow-black/60 text-sm">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/education">Education</NavLink>
          <NavLink href="/experience">Experience</NavLink>
          <NavLink href="/projects">Projects</NavLink>

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                moreOpen ? "text-white bg-zinc-700" : "text-zinc-300 hover:text-white"
              }`}
            >
              More
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 min-w-[130px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden"
                >
                  {MORE_LINKS.map((l) =>
                    l.external ? (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm transition-colors"
                      >
                        {l.label}
                      </Link>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-zinc-700 mx-1.5" />

          <BackgroundToggle />
          <ThemeToggle />
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="mt-2 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
            >
              {allMobileLinks.map((l) =>
                l.external ? (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="px-5 py-3 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile hamburger — visible only on small screens, outside the pill */}
      <button
        className="fixed top-5 right-5 z-50 flex md:hidden items-center justify-center h-9 w-9 rounded-full bg-zinc-900/85 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className="flex flex-col gap-[5px] items-center justify-center w-4">
          <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
          <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-px w-full bg-current transition-all ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
        </span>
      </button>
    </>
  );
}
