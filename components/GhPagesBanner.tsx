import { ExternalLink } from "lucide-react";

/**
 * Shown only in the GitHub Pages static build (NEXT_PUBLIC_GITHUB_PAGES=true).
 * Alerts visitors that some dynamic features are unavailable and links to the
 * full production site at adityamore.dev.
 */
export default function GhPagesBanner() {
  return (
    <div className="w-full bg-amber-950/60 border-b border-amber-700/40 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-300 z-50">
      <span>
        You&apos;re viewing a static mirror. Some features (contact form, AI
        assistant) require the full site.
      </span>
      <a
        href="https://adityamore.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-amber-100 transition-colors"
      >
        Visit adityamore.dev
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
