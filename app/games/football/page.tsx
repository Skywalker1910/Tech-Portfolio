import Link from "next/link";
import { SoccerIcon } from "@/components/ArcadeIcons";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Football Arcade | Aditya More" };
export default function FootballArcade() {
  return <div className="container-max py-16"><div className="max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"><SoccerIcon className="mb-5 h-12 w-12 text-[var(--hero-accent)]"/><p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Coming soon</p><h1 className="mt-3 text-3xl font-bold">Football arcade</h1><p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">FIFA World Cup 2026 is taking a break. Its spot in the arcade is reserved while I bring the game back.</p><Link href="/games/alien-invasion" className="cta-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold">Play Alien Invasion</Link><Link href="/" className="ml-4 text-sm text-[var(--muted)] hover:text-[var(--text)]">Back home</Link></div></div>;
}
