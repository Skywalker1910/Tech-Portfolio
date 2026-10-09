import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AlienIcon } from "./ArcadeIcons";
import styles from "./ArcadeTeaser.module.css";

export default function ArcadeTeaser({ placement = "corner" }: { placement?: "corner" | "banner" }) {
  return <section aria-label="Portfolio arcade" className={placement === "corner" ? styles.corner : styles.banner}>
    <Link href="/games/alien-invasion" aria-label="Play Alien Invasion" className={styles.card}>
      <span aria-hidden="true" className={styles.pattern} />
      <span aria-hidden="true" className={styles.badge}><AlienIcon /></span>
      <div className={styles.content}>
        <span className={styles.eyebrow}>Portfolio arcade</span>
        <h2 className={styles.title}>Alien Invasion</h2>
        <p className={styles.description}>Take a break. Save the galaxy.</p>
        <span className={styles.play}>Play now <ArrowRight size={15} aria-hidden="true" /></span>
      </div>
    </Link>
  </section>;
}
