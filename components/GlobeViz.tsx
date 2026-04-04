"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// ─── Location registry ────────────────────────────────────────────────────────
const CLEMSON:  [number, number] = [34.68, -82.84]; // Clemson, SC, USA
const PUNE:     [number, number] = [18.52,  73.86]; // Pune, Maharashtra, India
const KOLHAPUR: [number, number] = [16.70,  74.24]; // Kolhapur, Maharashtra, India

export const TIMELINE_LOCATIONS: { lat: number; lng: number; label: string }[] = [
  { lat: 34.68, lng: -82.84, label: "Clemson, SC"    }, // 0 – M.S. CS
  { lat: 34.68, lng: -82.84, label: "Clemson, SC"    }, // 1 – School of Computing
  { lat: 18.52, lng:  73.86, label: "Pune, India"    }, // 2 – Amdocs
  { lat: 16.70, lng:  74.24, label: "Kolhapur, India"}, // 3 – D.Y. Patil
];

// When globe is at right edge (1/4 off-screen), offset phi so the active marker
// lands in the center of the visible 75% portion rather than the geometric center.
const PHI_OFFSET = 0.42; // radians — tuned empirically

// ─── Marker config ─────────────────────────────────────────────────────────────
type MarkerList = { location: [number, number]; size: number; color?: [number, number, number] }[];

function getMarkers(idx: number): MarkerList {
  // "Pin" style: active = small bright dot + tight ring arcs (crosshair callout)
  // inactive = tiny dim dot, default = small mid dot
  const ACTIVE:   [number, number, number] = [1.00, 1.00, 1.00]; // white-hot center
  const INACTIVE: [number, number, number] = [0.32, 0.20, 0.58];
  const DEFAULT:  [number, number, number] = [0.70, 0.42, 1.00];

  if (idx === 0 || idx === 1) return [
    { location: CLEMSON,  size: 0.07, color: ACTIVE   },
    { location: PUNE,     size: 0.03, color: INACTIVE },
    { location: KOLHAPUR, size: 0.03, color: INACTIVE },
  ];
  if (idx === 2) return [
    { location: CLEMSON,  size: 0.03, color: INACTIVE },
    { location: PUNE,     size: 0.07, color: ACTIVE   },
    { location: KOLHAPUR, size: 0.03, color: INACTIVE },
  ];
  if (idx === 3) return [
    { location: CLEMSON,  size: 0.03, color: INACTIVE },
    { location: PUNE,     size: 0.03, color: INACTIVE },
    { location: KOLHAPUR, size: 0.07, color: ACTIVE   },
  ];
  return [
    { location: CLEMSON,  size: 0.05, color: DEFAULT },
    { location: PUNE,     size: 0.05, color: DEFAULT },
    { location: KOLHAPUR, size: 0.05, color: DEFAULT },
  ];
}

// ─── Arc config ───────────────────────────────────────────────────────────────
type ArcList = { from: [number, number]; to: [number, number]; color?: [number, number, number] }[];

function getArcs(idx: number): ArcList {
  // Career journey arcs — always shown
  const ARC_COLOR: [number, number, number] = [0.55, 0.28, 0.90];
  const LEG1: ArcList[0] = { from: KOLHAPUR, to: PUNE,    color: ARC_COLOR }; // undergrad → job
  const LEG2: ArcList[0] = { from: PUNE,     to: CLEMSON, color: ARC_COLOR }; // India → USA

  // Tighter crosshair ring for the active location (pin callout)
  const RING: [number, number, number] = [0.88, 0.52, 1.00];
  const R  = 1.2;
  const RL = 1.6;

  if (idx === 0 || idx === 1) return [
    LEG1, LEG2,
    { from: [CLEMSON[0] - R,  CLEMSON[1]     ] as [number,number], to: [CLEMSON[0] + R,  CLEMSON[1]     ] as [number,number], color: RING },
    { from: [CLEMSON[0],      CLEMSON[1] - RL] as [number,number], to: [CLEMSON[0],      CLEMSON[1] + RL] as [number,number], color: RING },
  ];
  if (idx === 2) return [
    LEG1, LEG2,
    { from: [PUNE[0] - R, PUNE[1]     ] as [number,number], to: [PUNE[0] + R, PUNE[1]     ] as [number,number], color: RING },
    { from: [PUNE[0],     PUNE[1] - RL] as [number,number], to: [PUNE[0],     PUNE[1] + RL] as [number,number], color: RING },
  ];
  if (idx === 3) return [
    LEG1, LEG2,
    { from: [KOLHAPUR[0] - R, KOLHAPUR[1]     ] as [number,number], to: [KOLHAPUR[0] + R, KOLHAPUR[1]     ] as [number,number], color: RING },
    { from: [KOLHAPUR[0],     KOLHAPUR[1] - RL] as [number,number], to: [KOLHAPUR[0],     KOLHAPUR[1] + RL] as [number,number], color: RING },
  ];
  return [LEG1, LEG2];
}

// ─────────────────────────────────────────────────────────────────────────────
interface GlobeVizProps {
  activeIndex: number;
}

export default function GlobeViz({ activeIndex }: GlobeVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const phi    = useRef(1.45);
  const theta  = useRef(0.25);
  const tPhi   = useRef(1.45);
  const tTheta = useRef(0.25);

  const dragging    = useRef(false);
  const lastX       = useRef(0);
  const lastY       = useRef(0);
  const velX        = useRef(0);
  const velY        = useRef(0);
  const userActive  = useRef(false);
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRef  = useRef(activeIndex);
  const prevActive = useRef(-2);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    activeRef.current = activeIndex;
    if (!userActive.current && activeIndex >= 0 && activeIndex < TIMELINE_LOCATIONS.length) {
      const { lat, lng } = TIMELINE_LOCATIONS[activeIndex];
      tPhi.current   = (-lng * Math.PI) / 180 + PHI_OFFSET;
      tTheta.current = (lat  * Math.PI) / 180 * 0.36;
    }
  }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const globe = createGlobe(canvas, {
      devicePixelRatio:  2,
      width:             2600,
      height:            2600,
      phi:               phi.current,
      theta:             theta.current,
      dark:              1,
      diffuse:           1.55,
      mapSamples:        26000,
      mapBrightness:     6.8,
      baseColor:         [0.07, 0.05, 0.15],
      markerColor:       [0.68, 0.38, 1.00],
      glowColor:         [0.44, 0.20, 0.82],
      arcColor:          [0.58, 0.32, 0.92],
      arcWidth:          1.8,
      arcHeight:         0.20,
      markerElevation:   0.025,
      markers:           getMarkers(-1),
      arcs:              getArcs(-1),
    });

    const LERP   = 0.034;
    const DAMP   = 0.86;
    const MINVEL = 0.00008;

    const tick = () => {
      if (!dragging.current) {
        if (userActive.current) {
          velX.current *= DAMP;
          velY.current *= DAMP;
          tPhi.current   += velX.current;
          tTheta.current  = Math.max(-0.60, Math.min(0.60, tTheta.current + velY.current));
          if (Math.abs(velX.current) < MINVEL && Math.abs(velY.current) < MINVEL) {
            velX.current = velY.current = 0;
          }
        } else if (activeRef.current < 0) {
          tPhi.current += 0.0035;
        }

        phi.current   += (tPhi.current   - phi.current)   * LERP;
        theta.current += (tTheta.current - theta.current) * LERP;
      }

      const idx = activeRef.current;
      if (idx !== prevActive.current) {
        prevActive.current = idx;
        globe.update({ markers: getMarkers(idx), arcs: getArcs(idx) });
      }

      globe.update({ phi: phi.current, theta: theta.current });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const SENS = 0.0042;

    const scheduleReturn = () => {
      if (returnTimer.current) clearTimeout(returnTimer.current);
      returnTimer.current = setTimeout(() => {
        userActive.current = false;
        const idx = activeRef.current;
        if (idx >= 0 && idx < TIMELINE_LOCATIONS.length) {
          const { lat, lng } = TIMELINE_LOCATIONS[idx];
          tPhi.current   = (-lng * Math.PI) / 180 + PHI_OFFSET;
          tTheta.current = (lat  * Math.PI) / 180 * 0.36;
        }
      }, 2800);
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging.current    = true;
      userActive.current  = true;
      velX.current        = 0;
      velY.current        = 0;
      lastX.current       = e.clientX;
      lastY.current       = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      if (returnTimer.current) clearTimeout(returnTimer.current);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;

      velX.current = velX.current * 0.55 + (-dx * SENS) * 0.45;
      velY.current = velY.current * 0.55 + ( dy * SENS) * 0.45;

      tPhi.current   -= dx * SENS;
      phi.current     = tPhi.current;
      const nt        = tTheta.current + dy * SENS;
      tTheta.current  = Math.max(-0.60, Math.min(0.60, nt));
      theta.current   = tTheta.current;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
      scheduleReturn();
    };

    canvas.addEventListener("pointerdown",  onPointerDown);
    canvas.addEventListener("pointermove",  onPointerMove);
    canvas.addEventListener("pointerup",    onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    canvas.style.cursor = "grab";

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (returnTimer.current) clearTimeout(returnTimer.current);
      globe.destroy();
      canvas.removeEventListener("pointerdown",  onPointerDown);
      canvas.removeEventListener("pointermove",  onPointerMove);
      canvas.removeEventListener("pointerup",    onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 1300, height: 1300, touchAction: "none" }}
      className="opacity-85"
    />
  );
}
