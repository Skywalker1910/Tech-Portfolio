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
    accent: "hover:border-violet-500/40 hover:shadow-violet-500/10",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    available: true,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Add, update, or remove portfolio projects.",
    icon: <FolderKanban size={22} />,
    accent: "hover:border-sky-500/40 hover:shadow-sky-500/10",
    iconBg: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    available: false,
  },
  {
    href: "/admin/experience",
    label: "Experience",
    description: "Edit work history and job descriptions.",
    icon: <Briefcase size={22} />,
    accent: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    available: false,
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
    try {
      const key = sessionStorage.getItem("dashboard-admin-key");
      if (!key) router.replace("/admin/login");
      else setReady(true);
    } catch {
      router.replace("/admin/login");
    }
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
        className="mb-10"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 leading-none mb-0.5">Command Center</p>
            <h1 className="text-lg font-semibold text-white leading-none">
              {greeting}, Aditya
            </h1>
          </div>
        </div>
        <p className="text-sm text-zinc-500 ml-0.5">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Section label */}
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
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
              className={`group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 shadow-lg ${
                tile.available
                  ? `cursor-pointer ${tile.accent} hover:shadow-xl hover:-translate-y-0.5`
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {/* Coming soon badge */}
              {!tile.available && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-semibold bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-700">
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
                <p className="text-sm font-semibold text-white mb-1">{tile.label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{tile.description}</p>
              </div>

              {/* Arrow — only on available */}
              {tile.available && (
                <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-violet-400 transition-colors">
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
