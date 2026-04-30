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

  // Redirect if already authenticated
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("dashboard-admin-key");
      if (saved) router.replace("/dashboard/messages");
    } catch {}
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/verify", {
        headers: { "x-admin-key": key.trim() },
      });

      if (res.ok) {
        sessionStorage.setItem("dashboard-admin-key", key.trim());
        router.push("/dashboard/messages");
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
            <Shield size={26} className="text-violet-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Access</h1>
          <p className="text-sm text-zinc-500 mt-1 text-center">
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
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
            className="w-full py-3 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
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
