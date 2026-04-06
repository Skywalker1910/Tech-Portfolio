import { Mail, FileText, MessageSquare } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Aditya More",
  description: "Get in touch with Aditya More — AI & ML Engineer.",
};

const contacts = [
  {
    icon: <Mail size={22} />,
    label: "Email",
    value: "aditya.more@outlook.in",
    href: "mailto:aditya.more@outlook.in",
    accent: "hover:border-orange-400",
    iconColor: "text-orange-400",
  },
  {
    icon: <FaLinkedin size={22} />,
    label: "LinkedIn",
    value: "linkedin.com/in/more-aditya",
    href: "https://www.linkedin.com/in/more-aditya",
    accent: "hover:border-blue-400",
    iconColor: "text-blue-400",
  },
  {
    icon: <FaGithub size={22} />,
    label: "GitHub",
    value: "@Skywalker1910",
    href: "https://github.com/Skywalker1910",
    accent: "hover:border-zinc-400",
    iconColor: "text-zinc-300",
  },
  {
    icon: <FileText size={22} />,
    label: "Resume",
    value: "Download / View PDF",
    href: "/resume.pdf",
    accent: "hover:border-violet-400",
    iconColor: "text-violet-400",
  },
];

export default function Contact() {
  return (
    <section className="container-max py-16 relative z-[1]">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} className="text-orange-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Contact</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Get in Touch</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          I&apos;m actively looking for AI Engineer, ML Engineer, and Data Scientist roles.
          Feel free to reach out — I&apos;d love to connect!
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("mailto") ? undefined : "_blank"}
            rel={c.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            className={`flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all ${c.accent}`}
          >
            <span className={`shrink-0 ${c.iconColor}`}>{c.icon}</span>
            <div>
              <p className="font-semibold text-sm">{c.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5 break-all">{c.value}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
