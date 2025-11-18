"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function NavLink({ href, children }:{href:string; children:React.ReactNode}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`px-2 py-1 rounded ${active ? "text-white bg-slate-800" : "hover:text-indigo-400"}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // This runs only on the client — safe to access document/localStorage here.
    try {
      const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
      if (saved && ['dark', 'light'].includes(saved)) {
        setTheme(saved);
        applyTheme(saved);
      } else {
        // Default to dark mode when no preference is saved
        setTheme('dark');
        applyTheme('dark');
      }
    } catch {
      // if any access fails, default to dark
      setTheme('dark');
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: string) => {
    try {
      // Remove all theme classes
      document.documentElement.classList.remove('dark', 'light');
      
      // Apply new theme
      if (newTheme !== 'light') {
        document.documentElement.classList.add(newTheme);
      }
      
      // Save to localStorage
      localStorage.setItem("theme", newTheme);
    } catch {
      // ignore if document/localStorage aren't available
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 rounded-full bg-slate-800/90 text-white hover:bg-slate-700/90 transition-colors border border-slate-600/50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-900/70 text-slate-200 border-b border-slate-800">
      <div className="container-max py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">Aditya • Tech Portfolio</Link>
        <nav className="hidden md:flex gap-3 text-sm">
          <NavLink href="/education">Education</NavLink>
          <NavLink href="/experience">Experience</NavLink>
          <NavLink href="/skills">Skills</NavLink>
          <NavLink href="/projects">Projects</NavLink>
          <NavLink href="/academics">Academics</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="md:hidden rounded-full px-3 py-1.5 border" onClick={()=>setOpen(o=>!o)}>Menu</button>
        </div>
      </div>
      {open && (
          <div className="md:hidden border-t border-slate-800">
          <div className="container-max py-3 flex flex-col gap-2 text-sm">
            <NavLink href="/education">Education</NavLink>
            <NavLink href="/experience">Experience</NavLink>
            <NavLink href="/skills">Skills</NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavLink href="/academics">Academics</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
