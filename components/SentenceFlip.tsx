"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function SentenceFlip({
  lines,
  interval = 2500,
}: {
  lines: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % lines.length), interval);
    return () => clearInterval(id);
  }, [lines.length, interval]);

  useEffect(() => {
    if (!measureRef.current) return;
    setHeight(measureRef.current.offsetHeight);
    const handler = () => {
      if (measureRef.current) setHeight(measureRef.current.offsetHeight);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: height || "auto", minHeight: "1.5em" }}
    >
      <div
        ref={measureRef}
        aria-hidden
        className="invisible absolute text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold py-1"
      >
        {longest}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, filter: "blur(8px)", y: 14 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, filter: "blur(8px)", y: -14 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-violet-300 py-1"
          style={{ textShadow: "0 0 12px #a78bfa, 0 0 28px #7c3aed" }}
        >
          {lines[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
