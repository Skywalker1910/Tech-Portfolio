import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArcadeIcon, AlienIcon, SoccerIcon } from "@/components/ArcadeIcons";

export const metadata: Metadata = {
  title: "Portfolio Arcade | Aditya More",
  description: "Take a play break with Alien Invasion and upcoming football games in my portfolio arcade.",
};

export default function ArcadePage() {
  return <div className="container-max py-12">
    <div className="my-8">
      <ArcadeIcon className="mb-4 h-10 w-10 text-[var(--hero-accent)]"/>
      <h1 className="text-3xl font-bold sm:text-4xl">Portfolio arcade</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Take a break. Pick a game and jump in.</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <Link href="/games/alien-invasion" className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-colors hover:border-[var(--hero-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hero-accent)]">
        <AlienIcon className="h-12 w-12 text-[var(--hero-accent)]"/>
        <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Ready</span><span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">Browser playable</span></div>
        <h2 className="mt-2 text-2xl font-bold">Alien Invasion</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Defend the galaxy against alien fleets and bosses. Collect upgrades and challenge the leaderboard.</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Play Alien Invasion <ArrowRight size={16}/></span>
      </Link>
      <Link href="/games/football" className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-colors hover:border-[var(--hero-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--hero-accent)]">
        <SoccerIcon className="h-12 w-12 text-[var(--hero-accent)]"/>
        <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-400">Under development</span><span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">Coming soon</span></div>
        <h2 className="mt-2 text-2xl font-bold">Football</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">The FIFA World Cup 2026 game is joining the arcade. Stay tuned for kick-off.</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">See what’s next <ArrowRight size={16}/></span>
      </Link>
    </div>
  </div>;
}
