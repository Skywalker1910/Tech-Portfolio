"use client";

import { Mail } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram, FaDiscord, FaFacebook } from "react-icons/fa";
import type { ReactNode } from "react";

const socials: {
  icon: ReactNode;
  label: string;
  handle: string;
  href: string;
  color: string;
  glow: string;
}[] = [
  {
    icon: <FaGithub size={56} />,
    label: "GitHub",
    handle: "@Skywalker1910",
    href: "https://github.com/Skywalker1910",
    color: "#e5e7eb",
    glow: "rgba(229,231,235,0.25)",
  },
  {
    icon: <FaLinkedin size={56} />,
    label: "LinkedIn",
    handle: "Aditya More",
    href: "https://www.linkedin.com/in/more-aditya",
    color: "#0a66c2",
    glow: "rgba(10,102,194,0.35)",
  },
  {
    icon: <Mail size={56} />,
    label: "Email",
    handle: "aditya.more@outlook.in",
    href: "mailto:aditya.more@outlook.in",
    color: "#f97316",
    glow: "rgba(249,115,22,0.35)",
  },
  {
    icon: <FaInstagram size={56} />,
    label: "Instagram",
    handle: "_aditya.more_",
    href: "https://www.instagram.com/_aditya.more_",
    color: "#e1306c",
    glow: "rgba(225,48,108,0.35)",
  },
  {
    icon: <FaDiscord size={56} />,
    label: "Discord",
    handle: "adityamore",
    href: "https://discord.com",
    color: "#5865f2",
    glow: "rgba(88,101,242,0.35)",
  },
  {
    icon: <FaFacebook size={56} />,
    label: "Facebook",
    handle: "Aditya More",
    href: "https://www.facebook.com",
    color: "#1877f2",
    glow: "rgba(24,119,242,0.35)",
  },
];

export default function Socials() {
  return (
    <section className="container-max py-16 relative z-[1]">
      <h1 className="text-3xl font-bold mb-2">Socials</h1>
      <p className="text-zinc-400 mb-10">Connect with me across the web.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target={s.href.startsWith("mailto") ? undefined : "_blank"}
            rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            className="group relative flex flex-col items-center justify-between p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 overflow-hidden transition-all duration-300"
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = s.color;
              el.style.boxShadow = `0 0 28px ${s.glow}, 0 0 8px ${s.glow}`;
              el.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "";
              el.style.boxShadow = "";
              el.style.transform = "";
            }}
          >
            {/* Top colored accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: s.color }}
            />

            {/* Platform title */}
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: s.color }}
            >
              {s.label}
            </p>

            {/* Center icon */}
            <span
              className="my-6 transition-transform duration-300 group-hover:scale-110"
              style={{ color: s.color }}
            >
              {s.icon}
            </span>

            {/* Username */}
            <p className="text-xs text-zinc-400 text-center break-all group-hover:text-zinc-200 transition-colors duration-300">
              {s.handle}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
