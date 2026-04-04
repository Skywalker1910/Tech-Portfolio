"use client";

import { useState, useEffect } from "react";
import BackgroundFX from "./BackgroundFX";
import InterstellarBG from "./InterstellarBG";

export default function BackgroundManager() {
  const [bg, setBg] = useState("neural");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bg-mode");
      if (saved && ["neural", "interstellar"].includes(saved)) setBg(saved);
    } catch {}
    const handler = (e: Event) => setBg((e as CustomEvent).detail);
    window.addEventListener("bg-change", handler);
    return () => window.removeEventListener("bg-change", handler);
  }, []);

  if (bg === "interstellar") return <InterstellarBG />;
  return <BackgroundFX />;
}
