import type { Metadata } from "next";
import Link from "next/link";
import ArcadePlayer from "@/components/ArcadePlayer";

export const metadata: Metadata = {
  title: "Play Alien Invasion | Aditya More",
  description: "Play my original Python and Pygame space shooter in your browser.",
};

export default function AlienInvasionPage() {
  return (
    <div className="container-max py-12">
      <Link href="/games" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">← Back to arcade</Link>
      <div className="mt-7 mb-7">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Portfolio arcade</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold">Alien Invasion</h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">Take the pilot seat. Defend against waves of aliens in my original Python space shooter.</p>
      </div>
      <ArcadePlayer />
    </div>
  );
}
