"use client";

import { useEffect, useRef } from "react";

const MAGNETIC_RADIUS = 80; // px — distance at which pull activates
const MAGNETIC_STRENGTH = 0.35; // 0–1, how much it snaps toward the target

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ring = ringRef.current!;
    const dot  = dotRef.current!;

    let mx = -300, my = -300;
    let rx = -300, ry = -300;
    let raf = 0;

    document.documentElement.style.cursor = "none";

    function onMove(e: MouseEvent) { mx = e.clientX; my = e.clientY; }

    function getNearestMagnetic(): { cx: number; cy: number; dist: number } | null {
      const targets = document.querySelectorAll<HTMLElement>(
        "a, button, [role='button'], input, textarea, select"
      );
      let best: { cx: number; cy: number; dist: number } | null = null;
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist < MAGNETIC_RADIUS && (!best || dist < best.dist)) {
          best = { cx, cy, dist };
        }
      });
      return best;
    }

    function tick() {
      // dot always snaps to real cursor
      dot.style.left = `${mx}px`;
      dot.style.top  = `${my}px`;

      const target = getNearestMagnetic();

      if (target) {
        // pull ring toward element center
        const tx = mx + (target.cx - mx) * MAGNETIC_STRENGTH * (1 - target.dist / MAGNETIC_RADIUS);
        const ty = my + (target.cy - my) * MAGNETIC_STRENGTH * (1 - target.dist / MAGNETIC_RADIUS);
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;

        const pull = 1 - target.dist / MAGNETIC_RADIUS; // 0→1 as it gets closer
        const scale = 1 + pull * 0.7;
        ring.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ring.style.borderColor = `rgba(167,139,250,${0.5 + pull * 0.5})`;
        ring.style.boxShadow = `0 0 ${8 + pull * 16}px rgba(139,92,246,${0.3 + pull * 0.5})`;
        ring.style.background = `rgba(139,92,246,${pull * 0.12})`;
      } else {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.transform = "translate(-50%, -50%) scale(1)";
        ring.style.borderColor = "rgba(139,92,246,0.55)";
        ring.style.boxShadow = "0 0 8px rgba(139,92,246,0.25)";
        ring.style.background = "transparent";
      }

      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;

      raf = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Lagging magnetic ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[9998] rounded-full border will-change-transform"
        style={{
          width: 36, height: 36,
          borderWidth: "1.5px",
          borderColor: "rgba(139,92,246,0.55)",
          boxShadow: "0 0 8px rgba(139,92,246,0.25)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, width 0.2s ease, height 0.2s ease",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Sharp snapping dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[9999] w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          background: "rgba(167,139,250,1)",
          boxShadow: "0 0 6px rgba(139,92,246,1)",
        }}
      />
    </>
  );
}
