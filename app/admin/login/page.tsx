"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if the HttpOnly admin session is already valid.
  useEffect(() => {
    fetch("/api/admin/session").then((response) => { if (response.ok) router.replace("/admin"); }).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setStatus("error");
        setErrorMsg("Invalid admin key. Access denied.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Connection error. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(249,115,22,0.13),transparent_35%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10">
            <Shield size={26} className="text-orange-500" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Admin Access</h1>
          <p className="mt-1 text-center text-sm text-[var(--muted)]">
            Enter your admin key to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--sub-muted)] transition-all focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={!key.trim() || status === "loading"}
            className="cta-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verifying…
              </>
            ) : (
              "Access Dashboard"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
