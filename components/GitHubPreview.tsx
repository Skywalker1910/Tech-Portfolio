"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Star, GitFork, BookMarked, Users, UserCheck, ExternalLink, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type Repo = {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
};

type GitHubData = {
  login: string;
  name: string;
  bio: string | null;
  avatar: string;
  followers: number;
  following: number;
  publicRepos: number;
  profileUrl: string;
  topRepos: Repo[];
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export default function GitHubPreview() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadGitHubData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/github", { cache: "no-store" });
      if (!response.ok) throw new Error(`GitHub proxy returned ${response.status}`);
      const payload = await response.json() as GitHubData;
      if (!payload.login || !Array.isArray(payload.topRepos)) throw new Error("Invalid GitHub response");
      setData(payload);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGitHubData(); }, [loadGitHubData]);

  if (loading) {
    return (
      <div className="mt-6 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[var(--tag-bg)]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 rounded bg-[var(--tag-bg)]" />
            <div className="h-2.5 w-48 rounded bg-[var(--tag-bg)]" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-[var(--tag-bg)]" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-[var(--tag-bg)]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)] shadow-sm">
        <AlertCircle size={14} className="shrink-0 text-[var(--sub-muted)]" />
        <span className="mr-auto">GitHub statistics are temporarily unavailable.</span>
        <button type="button" onClick={() => void loadGitHubData()} className="font-semibold text-[var(--text)] underline-offset-4 hover:underline">
          Retry
        </button>
        <a href="https://github.com/Skywalker1910" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--text)] underline-offset-4 hover:underline">
          View GitHub
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
    >
      {/* Profile header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4">
        <Image
          src={data.avatar}
          alt={data.name ?? data.login}
          width={40}
          height={40}
          className="rounded-full ring-2 ring-[var(--border)]"
        />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-[var(--text)]">{data.name ?? data.login}</p>
          <p className="truncate font-mono text-[11px] text-[var(--sub-muted)]">@{data.login}</p>
        </div>
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-primary inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
        >
          View <ExternalLink size={9} />
        </a>
      </div>

      {/* Bio */}
      {data.bio && (
        <p className="px-4 pb-1 pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
          {data.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] text-center">
        {[
          { Icon: BookMarked, value: data.publicRepos, label: "Repos" },
          { Icon: Users,      value: data.followers,   label: "Followers" },
          { Icon: UserCheck,  value: data.following,   label: "Following" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 bg-[var(--bg)]/70 py-2.5">
            <Icon size={12} className="text-[var(--muted)]" />
            <span className="text-sm font-bold text-[var(--text)]">{value.toLocaleString()}</span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--sub-muted)]">{label}</span>
          </div>
        ))}
      </div>

      {/* Top repos */}
      {data.topRepos.length > 0 && (
        <div className="px-4 pt-4 pb-4 space-y-2">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--sub-muted)]">
            Top Repositories
          </p>
          {data.topRepos.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 p-3 transition-all hover:border-[var(--muted)] hover:bg-[var(--tag-bg)]"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-[12px] font-semibold text-[var(--text)] transition-colors">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="mt-0.5 truncate text-[10px] text-[var(--sub-muted)]">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: LANG_COLORS[repo.language] ?? "#888" }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--muted)]">
                      <Star size={9} /> {repo.stars}
                    </span>
                  )}
                  {repo.forks > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--muted)]">
                      <GitFork size={9} /> {repo.forks}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink size={11} className="mt-0.5 shrink-0 text-[var(--sub-muted)] transition-colors group-hover:text-[var(--text)]" />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
