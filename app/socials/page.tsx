"use client";

import { motion } from "framer-motion";
import { Mail, Globe, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram, FaDiscord, FaFacebook } from "react-icons/fa";
import type { ComponentType } from "react";
import GitHubPreview from "../../components/GitHubPreview";
import LinkedInBadge from "../../components/LinkedInBadge";
import EnvelopeCard from "../../components/EnvelopeCard";

type Social = {
  Icon: ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  label: string;
  category: string;
  handle: string;
  desc: string;
  href: string;
  tags: string[];
  color: string;
  glow: string;
  gradient: string;
  accentText: string;
};

const socials: Social[] = [
  {
    Icon: FaGithub,
    label: "GitHub",
    category: "Code & Open Source",
    handle: "@Skywalker1910",
    desc: "Where my code lives. Source repositories, personal projects, open-source contributions, and everything I've built — public and in-progress.",
    tags: ["Open Source", "Repositories", "Projects", "Version Control"],
    href: "https://github.com/Skywalker1910",
    color: "#e5e7eb",
    glow: "rgba(229,231,235,0.15)",
    gradient: "from-zinc-800 via-zinc-700/60 to-zinc-800",
    accentText: "text-zinc-200",
  },
  {
    Icon: FaLinkedin,
    label: "LinkedIn",
    category: "Professional Network",
    handle: "more-aditya",
    desc: "Professional profile with full work history, education, endorsements, and career updates. Best place to connect professionally or recruit.",
    tags: ["Career", "Networking", "Experience", "Open to Work"],
    href: "https://www.linkedin.com/in/more-aditya",
    color: "#0a66c2",
    glow: "rgba(10,102,194,0.25)",
    gradient: "from-blue-700 via-sky-600/60 to-blue-700",
    accentText: "text-blue-300",
  },
  {
    Icon: Mail,
    label: "Email",
    category: "Direct Contact",
    handle: "aditya.more@outlook.in",
    desc: "Fastest way to reach me directly — for job opportunities, project collaborations, research discussions, or just a hello.",
    tags: ["Work Inquiries", "Collaboration", "Direct"],
    href: "mailto:aditya.more@outlook.in",
    color: "#f97316",
    glow: "rgba(249,115,22,0.22)",
    gradient: "from-orange-700 via-amber-600/50 to-orange-700",
    accentText: "text-orange-300",
  },
  {
    Icon: FaInstagram,
    label: "Instagram",
    category: "Personal",
    handle: "@_aditya.more_",
    desc: "A more personal side — travels, moments, and life outside the terminal. Occasional behind-the-scenes from projects too.",
    tags: ["Life", "Travel", "Personal"],
    href: "https://www.instagram.com/_aditya.more_",
    color: "#e1306c",
    glow: "rgba(225,48,108,0.22)",
    gradient: "from-rose-700 via-pink-600/50 to-rose-700",
    accentText: "text-rose-300",
  },
  {
    Icon: FaDiscord,
    label: "Discord",
    category: "Community",
    handle: "adityamore",
    desc: "Find me in communities around AI, machine learning, dev, and gaming. Happy to chat, collaborate, or nerd out about tech.",
    tags: ["AI / ML", "Dev", "Gaming", "Community"],
    href: "https://discord.com",
    color: "#5865f2",
    glow: "rgba(88,101,242,0.22)",
    gradient: "from-indigo-700 via-violet-600/50 to-indigo-700",
    accentText: "text-indigo-300",
  },
  {
    Icon: FaFacebook,
    label: "Facebook",
    category: "Social",
    handle: "Aditya More",
    desc: "Staying in touch with friends, family, and occasionally sharing updates. Less active but reachable.",
    tags: ["Friends & Family", "Updates"],
    href: "https://www.facebook.com",
    color: "#1877f2",
    glow: "rgba(24,119,242,0.22)",
    gradient: "from-blue-700 via-blue-600/50 to-blue-700",
    accentText: "text-blue-300",
  },
];

export default function Socials() {
  return (
    <section className="container-max py-12 relative z-[1]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 mb-3">
          <Globe size={15} className="text-sky-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Connect Online</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Socials</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          Reach out or follow along — across code, career, and everything in between.
        </p>
      </motion.div>

      {/* Row list */}
      <div className="space-y-0">
        {socials.map((s, i) => (
          <motion.article
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
            className="group border-b border-zinc-800/70 first:border-t py-8 flex flex-col md:flex-row gap-6 md:gap-10 transition-colors hover:bg-zinc-900/30 px-2 -mx-2 rounded-lg"
          >
            {/* Left — large brand icon (replaces number) */}
            <div className="shrink-0 flex items-start pt-1">
              <s.Icon
                size={52}
                style={{ color: s.color }}
                className="opacity-25 group-hover:opacity-70 transition-opacity duration-300"
              />
            </div>

            {/* Center — main content */}
            <div className="flex-1 min-w-0">
              {/* Category badge + handle row */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase border border-zinc-700/70 bg-zinc-800/60 text-zinc-400 px-2 py-0.5 rounded">
                  {s.category}
                </span>
                <span className="text-[11px] font-mono text-zinc-600">{s.handle}</span>
              </div>

              {/* Platform name */}
              <h2
                className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug group-hover:opacity-90 transition-colors"
              >
                {s.label}
              </h2>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed mb-5 max-w-xl">
                {s.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* GitHub live preview */}
              {s.label === "GitHub" && <GitHubPreview />}

              {/* CTA link */}
              <a
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.accentText} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                onClick={(e) => e.stopPropagation()}
              >
                {s.href.startsWith("mailto") ? "Send a message" : `Visit ${s.label}`}
                <ArrowUpRight size={12} />
              </a>
            </div>

            {/* Right — gradient visual panel (hidden for GitHub; LinkedIn badge; gradient box for others) */}
            {s.label !== "GitHub" && (
              s.label === "LinkedIn" ? (
                <div className="hidden md:flex shrink-0 self-center items-center justify-center">
                  <LinkedInBadge />
                </div>
              ) : s.label === "Email" ? (
                <div className="hidden md:flex shrink-0 self-center items-center justify-center">
                  <EnvelopeCard />
                </div>
              ) : (
                <div
                  className="hidden md:block shrink-0 w-48 h-32 rounded-xl overflow-hidden relative self-center"
                  style={{ boxShadow: `0 0 32px ${s.glow}` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-80`} />
                  {/* Animated glow blob */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl opacity-40"
                    style={{ background: s.color }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.2, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                  />
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <s.Icon size={36} style={{ color: s.color }} className="opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
                  </div>
                </div>
              )
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}
