"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FolderKanban,
  Briefcase,
  Clock,
  Wrench,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Activity,
} from "lucide-react";

type Tile = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  available: boolean;
};

const tiles: Tile[] = [
  {
    href: "/admin/messages",
    label: "Messages",
    description: "Read and manage contact form submissions.",
    icon: <MessageSquare size={22} />,
    accent: "hover:border-orange-500/40 hover:shadow-orange-500/10",
    iconBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    available: true,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Add, update, or remove portfolio projects.",
    icon: <FolderKanban size={22} />,
    accent: "hover:border-sky-500/40 hover:shadow-sky-500/10",
    iconBg: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    available: true,
  },
  {
    href: "/admin/experience",
    label: "Experience",
    description: "Edit work history and job descriptions.",
    icon: <Briefcase size={22} />,
    accent: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    available: true,
  },
  {
    href: "/admin/rag",
    label: "RAG Control",
    description: "Tune retrieval, inspect vector health, and sync BB-8 knowledge.",
    icon: <BrainCircuit size={22} />,
    accent: "hover:border-violet-500/40 hover:shadow-violet-500/10",
    iconBg: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    available: true,
  },
  {
    href: "/admin/traffic",
    label: "Traffic",
    description: "Monitor anonymous page views and popular routes.",
    icon: <Activity size={22} />,
    accent: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
    iconBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    available: true,
  },
  {
    href: "/admin/timeline",
    label: "Timeline",
    description: "Manage career and education milestones.",
    icon: <Clock size={22} />,
    accent: "hover:border-amber-500/40 hover:shadow-amber-500/10",
    iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    available: false,
  },
  {
    href: "/admin/skills",
    label: "Skills",
    description: "Add or remove skills from your skillset.",
    icon: <Wrench size={22} />,
    accent: "hover:border-rose-500/40 hover:shadow-rose-500/10",
    iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    available: false,
  },
];

export default function AdminHome() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session").then((response) => response.ok ? setReady(true) : router.replace("/admin/login")).catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!ready) return null;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      className="mb-12 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10">
            <ShieldCheck size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sub-muted)]">Command Center</p>
            <h1 className="text-xl font-semibold leading-none text-[var(--text)]">
              {greeting}, Aditya
            </h1>
          </div>
        </div>
        <p className="ml-0.5 mt-4 text-sm text-[var(--muted)]">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Section label */}
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--sub-muted)]">
        Control Panels
      </p>

      {/* Tile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((tile, i) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`group relative flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-200 ${
                tile.available
                  ? `cursor-pointer ${tile.accent} hover:shadow-xl hover:-translate-y-0.5`
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {/* Coming soon badge */}
              {!tile.available && (
                <span className="absolute right-3.5 top-3.5 rounded-full border border-[var(--border)] bg-[var(--tag-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--sub-muted)]">
                  Soon
                </span>
              )}

              {/* Icon */}
              <div
                className={`h-11 w-11 rounded-xl border flex items-center justify-center ${tile.iconBg}`}
              >
                {tile.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-[var(--text)]">{tile.label}</p>
                <p className="text-xs leading-relaxed text-[var(--muted)]">{tile.description}</p>
              </div>

              {/* Arrow — only on available */}
              {tile.available && (
                <div className="flex items-center gap-1 text-xs text-[var(--muted)] transition-colors group-hover:text-orange-500">
                  Open
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </motion.div>
          );

          return tile.available ? (
            <Link key={tile.href} href={tile.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={tile.href}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
