"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, GitFork, BookMarked, Users, UserCheck, ExternalLink } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 rounded bg-zinc-800" />
            <div className="h-2.5 w-48 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-zinc-800" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 rounded-2xl border border-zinc-700/50 bg-zinc-900/60 overflow-hidden"
    >
      {/* Profile header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800">
        <Image
          src={data.avatar}
          alt={data.name ?? data.login}
          width={40}
          height={40}
          className="rounded-full ring-2 ring-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">{data.name ?? data.login}</p>
          <p className="text-[11px] text-zinc-500 font-mono truncate">@{data.login}</p>
        </div>
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded-full transition-colors"
        >
          View <ExternalLink size={9} />
        </a>
      </div>

      {/* Bio */}
      {data.bio && (
        <p className="px-4 pt-3 pb-1 text-[12px] text-zinc-400 leading-relaxed">
          {data.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-zinc-800 mx-4 mt-3 rounded-xl overflow-hidden text-center">
        {[
          { Icon: BookMarked, value: data.publicRepos, label: "Repos" },
          { Icon: Users,      value: data.followers,   label: "Followers" },
          { Icon: UserCheck,  value: data.following,   label: "Following" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="bg-zinc-900/80 py-2.5 flex flex-col items-center gap-0.5">
            <Icon size={12} className="text-zinc-500" />
            <span className="text-sm font-bold text-white">{value.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Top repos */}
      {data.topRepos.length > 0 && (
        <div className="px-4 pt-4 pb-4 space-y-2">
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-zinc-600 mb-2">
            Top Repositories
          </p>
          {data.topRepos.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 p-3 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-zinc-200 group-hover:text-white truncate transition-colors">
                  {repo.name}
                </p>
                {repo.description && (
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: LANG_COLORS[repo.language] ?? "#888" }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                      <Star size={9} /> {repo.stars}
                    </span>
                  )}
                  {repo.forks > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                      <GitFork size={9} /> {repo.forks}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink size={11} className="text-zinc-700 group-hover:text-zinc-400 shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
