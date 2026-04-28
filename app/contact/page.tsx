"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

const contacts = [
  {
    icon: <Mail size={20} />,
    label: "Email",
    value: "aditya.more@outlook.in",
    href: "mailto:aditya.more@outlook.in",
    accent: "hover:border-orange-500/50",
    iconColor: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: <FaLinkedin size={20} />,
    label: "LinkedIn",
    value: "linkedin.com/in/more-aditya",
    href: "https://www.linkedin.com/in/more-aditya",
    accent: "hover:border-blue-500/50",
    iconColor: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputCls =
    "w-full bg-zinc-900/60 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";

  return (
    <section className="container-max py-16 relative z-[1]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} className="text-orange-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Contact</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Get in Touch</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          I&apos;m actively looking for AI Engineer, ML Engineer, and Data Scientist roles.
          Have an opportunity or just want to say hi? Drop me a message!
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? (
            <div className="rounded-2xl border border-amber-700/40 bg-amber-950/30 p-6 space-y-3">
              <p className="text-amber-300 text-sm font-semibold">
                Contact form unavailable in this version
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                This is a static mirror hosted on GitHub Pages. The contact form
                requires a backend that isn&apos;t available here. Please use the
                direct links on the right, or visit the full site to send a
                message.
              </p>
              <a
                href="https://adityamore.dev/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors"
              >
                Open contact form on adityamore.dev →
              </a>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-zinc-400 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="John"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-zinc-400 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Doe"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className={inputCls}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-medium text-zinc-400 mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Hi Aditya, I wanted to reach out about..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 size={16} />
                  Message Sent!
                </>
              ) : (
                <>
                  Send Message
                  <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Status messages */}
            {status === "success" && (
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Thanks for reaching out! I&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-400">
                {errorMsg}
              </p>
            )}
          </form>
          )}
        </motion.div>

        {/* Sidebar - quick contact links */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Or reach out directly
          </p>
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("mailto") ? undefined : "_blank"}
              rel={c.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all ${c.accent}`}
            >
              <span className={`shrink-0 w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.iconColor}`}>
                {c.icon}
              </span>
              <div>
                <p className="font-semibold text-sm text-white">{c.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{c.value}</p>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
