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
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl">
      <div className="flex gap-3 rounded-2xl border border-amber-700/40 bg-zinc-950/90 backdrop-blur-md shadow-2xl shadow-black/50 px-4 py-4">
        {/* Icon */}
        <span className="shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 border border-amber-600/30">
          <Info size={13} className="text-amber-400" />
        </span>

        {/* Text block */}
        <div className="flex-1 space-y-1.5">
          <p className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
            Static Deployment &mdash; GitHub Pages
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            You&apos;re viewing a static version of this web app deployed via GitHub Pages.
            Several dynamic features are <span className="text-zinc-200 font-medium">not available</span> in
            this build, including the <span className="text-zinc-200 font-medium">contact form</span>,{" "}
            <span className="text-zinc-200 font-medium">AI assistant</span>, and other
            server-side functionality.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            For the full experience &mdash; including all features and the latest updates &mdash; please visit the
            production site:
          </p>
          <a
            href="https://adityamore.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            adityamore.dev
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Close */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="shrink-0 self-start flex items-center justify-center w-6 h-6 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/8 transition-all"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
