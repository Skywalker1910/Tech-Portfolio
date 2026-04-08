import { useEffect, useRef, useState } from "react";
import "../public/bb8-chat-droid.css";

/**
 * BB8DroidAssistantButton
 * - Floating, animated, interactive BB-8 inspired AI assistant button
 * - Features: idle/peek/full/rolling states, cursor tracking, click to open chat
 * - Dark theme, neon glow, accessible, responsive
 */
export default function BB8DroidAssistantButton({ onClick }: { onClick: () => void }) {
  const [state, setState] = useState<"idle"|"peek"|"full"|"rolling">("idle");
  const [show, setShow] = useState(true);
  const [headAngle, setHeadAngle] = useState(0); // degrees
  const [rolling, setRolling] = useState(false);
  const droidRef = useRef<HTMLDivElement>(null);
  const rollingTimeout = useRef<NodeJS.Timeout|null>(null);
  const peekTimeout = useRef<NodeJS.Timeout|null>(null);
  const mouseThrottle = useRef(0);

  // Cursor tracking (desktop only)
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (window.innerWidth < 640) return; // disable on mobile
      if (Date.now() - mouseThrottle.current < 24) return;
      mouseThrottle.current = Date.now();
      const droid = droidRef.current;
      if (!droid) return;
      const rect = droid.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Clamp angle for realism
      const angle = Math.max(-40, Math.min(40, Math.atan2(dy, dx) * 180 / Math.PI));
      setHeadAngle(angle);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Idle/peek/full/rolling state machine
  useEffect(() => {
    let active = true;
    function schedulePeek() {
      if (!active) return;
      setState("idle");
      peekTimeout.current = setTimeout(() => {
        setState("peek");
        setTimeout(() => setState("idle"), 1800 + Math.random() * 1200);
        schedulePeek();
      }, 10000 + Math.random() * 15000);
    }
    schedulePeek();
    return () => { active = false; if (peekTimeout.current) clearTimeout(peekTimeout.current); };
  }, []);

  // Rolling animation (rare event)
  useEffect(() => {
    let active = true;
    function scheduleRoll() {
      if (!active) return;
      rollingTimeout.current = setTimeout(() => {
        setRolling(true);
        setState("rolling");
        setTimeout(() => {
          setRolling(false);
          setState("idle");
          scheduleRoll();
        }, 3200);
      }, 30000 + Math.random() * 30000);
    }
    scheduleRoll();
    return () => { active = false; if (rollingTimeout.current) clearTimeout(rollingTimeout.current); };
  }, []);

  // On hover: full appearance
  function handleMouseEnter() {
    if (window.innerWidth < 640) return;
    setState("full");
  }
  function handleMouseLeave() {
    if (window.innerWidth < 640) return;
    setState("idle");
  }

  // On click: open chat, bounce
  function handleClick() {
    setState("full");
    onClick();
    // Optional: add bounce/press effect
    if (droidRef.current) {
      droidRef.current.classList.add("bb8-press");
      setTimeout(() => droidRef.current?.classList.remove("bb8-press"), 300);
    }
  }

  // Responsive: hide on mobile if needed
  // (Optional: always show, but disable cursor tracking)

  // State-based styles
  let droidClass = "bb8-toggle bb8-chat-droid";
  if (state === "peek") droidClass += " bb8-peek";
  if (state === "full") droidClass += " bb8-full";
  if (rolling) droidClass += " bb8-rolling";

  return (
    <div
      ref={droidRef}
      className={droidClass}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 100,
        cursor: "pointer",
        filter: "drop-shadow(0 0 16px #a78bfa88)",
        transition: "filter 0.3s"
      }}
      tabIndex={0}
      role="button"
      aria-label="Open AI Assistant Chat"
      title="Talk to R2D2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* BB8 Droid Structure (from Uiverse.io) */}
      <input type="checkbox" className="bb8-toggle__checkbox" tabIndex={-1} readOnly checked={false} />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="gomrassen" />
          <div className="hermes" />
          <div className="chenini" />
          <div className="tatto-1" />
          <div className="tatto-2" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
        </div>
        <div className="bb8">
          <div className="bb8__head-container" style={{ transform: `rotate(${headAngle}deg)` }}>
            <div className="bb8__antenna" />
            <div className="bb8__antenna" />
            <div className="bb8__head" />
          </div>
          <div className="bb8__body" />
        </div>
        <div className="bb8__shadow" />
      </div>
      {/* Tooltip */}
      <span className="sr-only">Talk to R2D2</span>
    </div>
  );
}
