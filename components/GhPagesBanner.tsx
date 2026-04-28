"use client";

import { useState } from "react";
import { ExternalLink, X, Info } from "lucide-react";

/**
 * Floating dismissible toast shown only in the GitHub Pages static build
 * (NEXT_PUBLIC_GITHUB_PAGES=true). Fixed to the bottom of the viewport.
 */
export default function GhPagesBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl">
      <div className="flex items-center gap-3 rounded-2xl border border-amber-700/40 bg-zinc-950/90 backdrop-blur-md shadow-2xl shadow-black/50 px-4 py-3">
        {/* Icon */}
        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 border border-amber-600/30">
          <Info size={13} className="text-amber-400" />
        </span>

        {/* Text */}
        <p className="flex-1 text-xs text-zinc-300 leading-relaxed">
          Static mirror &mdash; contact form &amp; AI assistant unavailable.{" "}
          <a
            href="https://adityamore.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            Visit adityamore.dev
            <ExternalLink size={10} className="ml-0.5" />
          </a>{" "}
          for the full experience.
        </p>

        {/* Close */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-all"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
