"use client";

import { useEffect, useRef } from "react";

/**
 * Cinematic Interstellar-inspired background.
 * A slow, continuous journey through deep space toward Gargantua.
 * Features: parallax star layers, drifting planets, distant nebulae,
 * and Gargantua with its accretion disk at the horizon.
 * Mouse gently shifts the camera. Respects reduced motion.
 */
export default function InterstellarBG() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });
  const stop = useRef<() => void>(() => {});

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    let w = 0, h = 0, raf = 0, time = 0;
    const isMobile = window.innerWidth < 640;

    /* ── Stars ── */
    // Three parallax layers: far (slow), mid, near (fast)
    const LAYER_COUNT = 3;
    const STAR_COUNTS = reduce || isMobile ? [80, 40, 15] : [200, 100, 35];
    const LAYER_SPEEDS = [0.06, 0.15, 0.35]; // px/frame drift
    const LAYER_SIZES  = [0.6, 1.1, 1.8];

    type Star = { x: number; y: number; brightness: number; twinklePhase: number; r: number; g: number; b: number };
    const starLayers: Star[][] = [[], [], []];

    function makeStar(): Star {
      const temp = Math.random();
      // Realistic star colors: blue-white, white, yellow, orange-red
      let r: number, g: number, b: number;
      if (temp < 0.15)      { r = 155; g = 175; b = 255; } // blue
      else if (temp < 0.45) { r = 220; g = 225; b = 255; } // blue-white
      else if (temp < 0.7)  { r = 255; g = 250; b = 240; } // white
      else if (temp < 0.85) { r = 255; g = 220; b = 150; } // yellow
      else                  { r = 255; g = 180; b = 120; } // orange
      return {
        x: Math.random(),
        y: Math.random(),
        brightness: 0.3 + Math.random() * 0.7,
        twinklePhase: Math.random() * Math.PI * 2,
        r, g, b,
      };
    }

    /* ── Planets & celestial bodies ── */
    type CelestialBody = {
      x: number; y: number; radius: number; speed: number;
      color1: string; color2: string; ringColor?: string; hasRing: boolean;
      phase: number;
    };
    const bodies: CelestialBody[] = [];
    const MAX_BODIES = isMobile ? 2 : 4;

    const BODY_PALETTES = [
      { c1: "#8B4513", c2: "#D2691E", ring: "rgba(210,180,140,0.25)" }, // brown/desert planet
      { c1: "#2F4F6F", c2: "#6B8EA3" },                                 // blue ice planet
      { c1: "#704030", c2: "#C08060", ring: "rgba(200,170,130,0.2)" },  // Mars-like
      { c1: "#3A3A5C", c2: "#7070A0" },                                 // dark purple gas giant
      { c1: "#556B2F", c2: "#8FBC8F" },                                 // green world
    ];

    function spawnBody() {
      const pal = BODY_PALETTES[Math.floor(Math.random() * BODY_PALETTES.length)];
      const r = 8 + Math.random() * 22;
      bodies.push({
        x: -r * 2 - Math.random() * 100,  // start off-screen left
        y: 0.15 + Math.random() * 0.7,     // vertical band
        radius: r,
        speed: 0.08 + Math.random() * 0.12,
        color1: pal.c1,
        color2: pal.c2,
        ringColor: pal.ring,
        hasRing: !!pal.ring && Math.random() > 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    /* ── Nebula dust clouds ── */
    type Nebula = { x: number; y: number; rx: number; ry: number; r: number; g: number; b: number; opacity: number; drift: number };
    const nebulae: Nebula[] = [];

    function initNebulae() {
      nebulae.length = 0;
      const count = isMobile ? 2 : 4;
      for (let i = 0; i < count; i++) {
        const hue = Math.random();
        let r: number, g: number, b: number;
        if (hue < 0.33)      { r = 80; g = 40; b = 120; }   // purple
        else if (hue < 0.66) { r = 30; g = 60; b = 100; }   // deep blue
        else                 { r = 100; g = 50; b = 30; }    // warm orange dust
        nebulae.push({
          x: Math.random(), y: Math.random(),
          rx: 0.1 + Math.random() * 0.15,
          ry: 0.06 + Math.random() * 0.1,
          r, g, b,
          opacity: 0.015 + Math.random() * 0.025,
          drift: 0.02 + Math.random() * 0.03,
        });
      }
    }

    /* ── Resize ── */
    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      for (let l = 0; l < LAYER_COUNT; l++) {
        starLayers[l] = [];
        for (let i = 0; i < STAR_COUNTS[l]; i++) {
          starLayers[l].push(makeStar());
        }
      }
      bodies.length = 0;
      for (let i = 0; i < MAX_BODIES; i++) {
        spawnBody();
        // Spread initial positions across the screen
        bodies[i].x = Math.random() * (w + 200) - 100;
      }
      initNebulae();
    }

    /* ── Draw ── */
    function draw() {
      time += 0.008;

      // Smooth mouse interpolation
      mouse.current.tx += (mouse.current.x - mouse.current.tx) * 0.02;
      mouse.current.ty += (mouse.current.y - mouse.current.ty) * 0.02;
      const camX = (mouse.current.tx - 0.5) * 20;
      const camY = (mouse.current.ty - 0.5) * 12;

      // Deep space background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // ── Nebula clouds ──
      for (const n of nebulae) {
        n.x += n.drift * 0.001;
        if (n.x > 1.3) n.x = -0.3;
        const nx = n.x * w + camX * 0.3;
        const ny = n.y * h + camY * 0.3;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(w, h) * n.rx);
        grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.opacity})`);
        grad.addColorStop(0.6, `rgba(${n.r},${n.g},${n.b},${n.opacity * 0.3})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Gargantua (black hole at the far horizon) ──
      const gx = w * 0.78 + camX * 0.15;
      const gy = h * 0.38 + camY * 0.15;
      const bhRadius = Math.min(w, h) * 0.06;

      // Outer accretion glow
      const accretionOuter = ctx.createRadialGradient(gx, gy, bhRadius * 0.8, gx, gy, bhRadius * 6);
      accretionOuter.addColorStop(0, "rgba(255,160,40,0.06)");
      accretionOuter.addColorStop(0.3, "rgba(200,100,20,0.03)");
      accretionOuter.addColorStop(0.6, "rgba(100,60,150,0.015)");
      accretionOuter.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = accretionOuter;
      ctx.fillRect(0, 0, w, h);

      // Accretion disk — tilted ellipse
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(-0.15);
      // Multiple thin rings
      for (let i = 0; i < 5; i++) {
        const rr = bhRadius * (1.8 + i * 0.7);
        const ry = rr * 0.18;
        const ringAlpha = 0.08 - i * 0.012;
        const pulse = 1 + Math.sin(time * 0.5 + i) * 0.15;
        ctx.beginPath();
        ctx.ellipse(0, 0, rr * pulse, ry * pulse, 0, 0, Math.PI * 2);
        const orangeVal = Math.max(0, 200 - i * 30);
        ctx.strokeStyle = `rgba(255,${orangeVal},40,${Math.max(0, ringAlpha)})`;
        ctx.lineWidth = 1.2 - i * 0.15;
        ctx.stroke();
      }
      ctx.restore();

      // Event horizon (black sphere)
      ctx.beginPath();
      ctx.arc(gx, gy, bhRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#000000";
      ctx.fill();

      // Photon ring — thin bright ring at event horizon edge
      ctx.beginPath();
      ctx.arc(gx, gy, bhRadius * 1.05, 0, Math.PI * 2);
      const photonPulse = 0.15 + Math.sin(time * 0.8) * 0.05;
      ctx.strokeStyle = `rgba(255,200,100,${photonPulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Star layers (parallax) ──
      for (let l = 0; l < LAYER_COUNT; l++) {
        const speed = LAYER_SPEEDS[l];
        const size = LAYER_SIZES[l];
        const parallaxMul = 0.3 + l * 0.35;

        for (const s of starLayers[l]) {
          // Slow horizontal drift (moving toward Gargantua)
          s.x += speed * 0.0003;
          if (s.x > 1.05) { s.x = -0.05; s.y = Math.random(); }

          const sx = s.x * w + camX * parallaxMul;
          const sy = s.y * h + camY * parallaxMul;

          // Skip if off screen
          if (sx < -5 || sx > w + 5 || sy < -5 || sy > h + 5) continue;

          // Twinkle
          const twinkle = 0.6 + 0.4 * Math.sin(time * 1.5 + s.twinklePhase);
          const alpha = s.brightness * twinkle;

          // Glow for brighter / nearer stars
          if (l >= 1 && s.brightness > 0.7) {
            const glowR = size * 3;
            const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
            glow.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.15})`);
            glow.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = glow;
            ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
          }

          ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size * (0.6 + s.brightness * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Planets / celestial bodies drifting by ──
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        b.x += b.speed;

        // Remove and respawn when off-screen right
        if (b.x > w + b.radius * 4) {
          bodies.splice(i, 1);
          spawnBody();
          continue;
        }

        const bx = b.x + camX * 0.5;
        const by = b.y * h + camY * 0.5 + Math.sin(time * 0.3 + b.phase) * 8;

        // Planet shadow gradient (half-lit)
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        const pGrad = ctx.createLinearGradient(bx - b.radius, by, bx + b.radius, by);
        pGrad.addColorStop(0, b.color2);
        pGrad.addColorStop(0.55, b.color1);
        pGrad.addColorStop(1, "#0a0a0a");
        ctx.fillStyle = pGrad;
        ctx.fill();

        // Atmospheric glow
        ctx.beginPath();
        ctx.arc(bx, by, b.radius * 1.15, 0, Math.PI * 2);
        const atmoGrad = ctx.createRadialGradient(bx, by, b.radius * 0.9, bx, by, b.radius * 1.15);
        atmoGrad.addColorStop(0, "rgba(100,150,255,0)");
        atmoGrad.addColorStop(1, "rgba(100,150,255,0.06)");
        ctx.fillStyle = atmoGrad;
        ctx.fill();

        // Ring (Saturn-like)
        if (b.hasRing && b.ringColor) {
          ctx.beginPath();
          ctx.ellipse(bx, by, b.radius * 2.2, b.radius * 0.3, -0.2, 0, Math.PI * 2);
          ctx.strokeStyle = b.ringColor;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Second ring
          ctx.beginPath();
          ctx.ellipse(bx, by, b.radius * 1.8, b.radius * 0.22, -0.2, 0, Math.PI * 2);
          ctx.strokeStyle = b.ringColor.replace("0.2", "0.12").replace("0.25", "0.15");
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Gentle dust particles (foreground) ──
      if (!reduce) {
        for (let i = 0; i < 12; i++) {
          const dx = ((time * 15 + i * 137.5) % (w + 40)) - 20;
          const dy = ((i * 223.7 + Math.sin(time + i) * 30) % h);
          const dAlpha = 0.04 + Math.sin(time * 0.7 + i * 2) * 0.02;
          ctx.fillStyle = `rgba(200,180,140,${dAlpha})`;
          ctx.beginPath();
          ctx.arc(dx, dy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    }

    function onVisibilityChange() {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", onVisibilityChange);

    resize();
    init();
    raf = requestAnimationFrame(draw);

    stop.current = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      ro.disconnect();
    };

    return () => stop.current();
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="w-full h-full opacity-90" />
    </div>
  );
}
