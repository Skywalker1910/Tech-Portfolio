"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArcadeIcon, AlienIcon, SoccerIcon } from "./ArcadeIcons";

export default function ArcadeNav() {
  const pathname = usePathname();
  const style = "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--tag-bg)] hover:text-[var(--hero-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
  return <div className="flex shrink-0 items-center gap-1 text-[var(--navbar-muted)]" aria-label="Arcade games">
    <Link href="/games" title="Portfolio arcade" aria-label="Portfolio arcade" aria-current={pathname === "/games" ? "page" : undefined} className={style}><ArcadeIcon className="h-[18px] w-[18px]"/></Link>
    <Link href="/games/alien-invasion" title="Play Alien Invasion" aria-label="Play Alien Invasion" aria-current={pathname === "/games/alien-invasion" ? "page" : undefined} className={style}><AlienIcon className="h-[18px] w-[18px]"/></Link>
    <Link href="/games/football" title="Football arcade — coming soon" aria-label="Football arcade — coming soon" aria-current={pathname === "/games/football" ? "page" : undefined} className={style}><SoccerIcon className="h-[18px] w-[18px]"/></Link>
  </div>;
}
