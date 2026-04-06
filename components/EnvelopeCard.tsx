"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

const W = 220;
const FLAP_H = 72;   // height of flap triangle
const BODY_H = 132;  // envelope body height

export default function EnvelopeCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative cursor-pointer select-none"
      style={{ width: W, height: FLAP_H + BODY_H, perspective: "900px" }}
    >
      {/* ── ENVELOPE BODY (z-1) ── */}
      <div
        className="absolute left-0 right-0 rounded-b-xl border border-orange-500/25"
        style={{
          top: FLAP_H - 1, // overlap 1px to hide seam
          height: BODY_H,
          background: "#0f0f14",
          zIndex: 1,
        }}
      >
        {/* V-crease lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${BODY_H}`} preserveAspectRatio="none">
          <line x1="0" y1={BODY_H} x2={W / 2} y2={BODY_H / 2} stroke="rgba(249,115,22,0.12)" strokeWidth="1.5" />
          <line x1={W} y1={BODY_H} x2={W / 2} y2={BODY_H / 2} stroke="rgba(249,115,22,0.12)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ── LETTER (z-2) — fades in inside the body after flap opens ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.3, delay: 0.28, ease: "easeOut" }}
            className="absolute left-2.5 right-2.5 rounded-lg flex flex-col px-3 pt-2.5 pb-2"
            style={{
              top: FLAP_H + 6,
              height: BODY_H - 14,
              background: "#f5ede0",
              zIndex: 2,
            }}
          >
            {/* Ruled lines */}
            <div className="space-y-[5px] mb-2.5">
              {[78, 55, 68, 45].map((w, i) => (
                <div key={i} className="h-px bg-orange-300/50" style={{ width: `${w}%` }} />
              ))}
            </div>
            {/* Message */}
            <p className="text-[8px] text-zinc-600 leading-[1.7] flex-1">
              "My inbox is surprisingly warm<br />
              (unlike prod at 2 AM).<br />
              Drop me a line — I reply<br />
              faster than my models train."
            </p>
            {/* Signature */}
            <div className="border-t border-orange-200/60 pt-1.5 flex items-center justify-between">
              <span className="text-[7.5px] text-orange-500 font-bold italic">— Aditya More</span>
              <span className="text-[7px] text-zinc-400">👋 Looking forward!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLAP (z-10) — rotates back to reveal letter ── */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          top: 0,
          height: FLAP_H,
          transformOrigin: "top center",
          zIndex: 10,
        }}
        animate={{ rotateX: open ? -170 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${FLAP_H}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={`0,0 ${W},0 ${W / 2},${FLAP_H}`}
            fill="#0f0f14"
            stroke="rgba(249,115,22,0.28)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>

      {/* ── TOP BORDER of body (z-11, always on top of flap seam) ── */}
      <div
        className="absolute left-0 right-0 border-t border-l border-r border-orange-500/25 rounded-t-none"
        style={{ top: FLAP_H - 1, height: 2, zIndex: 11 }}
      />

      {/* ── WAXSEAL + label (z-20, fade out when open) ── */}
      <motion.div
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.5 : 1 }}
        transition={{ duration: 0.18 }}
        className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-orange-500/40 bg-orange-500/10 flex items-center justify-center"
        style={{ bottom: 14, zIndex: 20 }}
      >
        <Mail size={13} className="text-orange-400" />
      </motion.div>

      <motion.p
        animate={{ opacity: open ? 0 : 0.7 }}
        transition={{ duration: 0.15 }}
        className="absolute left-3 font-mono text-zinc-500 pointer-events-none"
        style={{ bottom: 16, fontSize: "7.5px", zIndex: 20 }}
      >
        <span className="text-zinc-400">To:</span> aditya.more@outlook.in
      </motion.p>

      {/* ── Ambient glow ── */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.12), transparent 70%)",
          opacity: open ? 1 : 0.5,
        }}
      />
    </div>
  );
}

