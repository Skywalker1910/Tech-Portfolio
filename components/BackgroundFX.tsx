"use client";

import { useEffect, useRef } from "react";

/**
 * Futuristic particle field with subtle connections that
 * reacts to cursor movement. GPU-friendly, mobile-aware,
 * and pauses when the tab is hidden. Respects reduced motion.
 */
export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0, has: false });
  const stop = useRef<() => void>(() => {});

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    let w = 0;
    let h = 0;
    let raf = 0;

    // particle count: fewer on small screens or when reduced motion
    const baseCount = (reduce || window.innerWidth < 640) ? 60 : 120;

    type P = { x: number; y: number; vx: number; vy: number };
    const parts: P[] = [];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles(count = baseCount) {
      parts.length = 0;
      for (let i = 0; i < count; i++) {
        parts.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.35, 0.35),
          vy: rand(-0.35, 0.35),
        });
      }
    }

    function draw() {
      // clear with a soft gradient glow
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(
        w * 0.8,
        h * 0.2,
        0,
        w * 0.8,
        h * 0.2,
        Math.max(w, h)
      );
      g.addColorStop(0, "rgba(109,40,217,0.10)"); // violet brand
      g.addColorStop(1, "rgba(20,184,166,0.05)"); // teal accent
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // update particles (light mouse attraction + damping)
      for (const p of parts) {
        if (mouse.current.has) {
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const d2 = Math.max(120, dx * dx + dy * dy);
          p.vx += (dx / d2) * 6.0;
          p.vy += (dy / d2) * 6.0;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
      }

      // draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i];
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110) {
            const alpha = 1 - dist / 110;
            ctx.strokeStyle = `rgba(109,40,217,${0.22 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (const p of parts) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    // mouse handlers
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.has = true;
    }
    function onMouseLeave() {
      mouse.current.has = false;
    }

    // pause when tab hidden to save battery/CPU
    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(draw);
      }
    }

    // observe size changes (responsive)
    const ro = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    ro.observe(canvas);

    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    initParticles();
    raf = requestAnimationFrame(draw);

    stop.current = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ro.disconnect();
    };

    return () => stop.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <canvas ref={canvasRef} className="w-full h-full opacity-90" />
    </div>
  );
}
