"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./BB8ChatDroid.module.css";

type BB8ChatDroidProps = {
  open: boolean;
  onClick: () => void;
};

const GREETINGS = ["Hi!", "Hello!", "Need help?", "Ask me!"];
const TRAVEL_DURATION = 5_200;

export function BB8DroidVisual() {
  return (
    <span className={styles.container} aria-hidden="true">
      <span className={styles.droid}>
        <span className={styles.headContainer}>
          <span className={styles.antenna} />
          <span className={styles.antenna} />
          <span className={styles.headShell}>
            <span className={styles.headDome} />
            <span className={styles.headBand} />
            <span className={styles.headLowerBand} />
            <span className={styles.headEye} />
            <span className={styles.headSensor} />
          </span>
        </span>
        <span className={styles.body}>
          <span className={styles.bodyPattern} />
        </span>
      </span>
      <span className={styles.shadow} />
    </span>
  );
}

const BB8ChatDroid = forwardRef<HTMLButtonElement, BB8ChatDroidProps>(
  function BB8ChatDroid({ open, onClick }, ref) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const greetingIndexRef = useRef(0);
    const [side, setSide] = useState<"left" | "right">("right");
    const [moving, setMoving] = useState(false);
    const [greeting, setGreeting] = useState<string | null>(null);
    useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    useEffect(() => {
      if (window.matchMedia("(pointer: coarse)").matches) return;

      let frame = 0;

      function followCursor(event: PointerEvent) {
        if (event.pointerType === "touch") return;
        cancelAnimationFrame(frame);

        frame = requestAnimationFrame(() => {
          const button = buttonRef.current;
          if (!button) return;

          const rect = button.getBoundingClientRect();
          const headX = rect.left + rect.width / 2;
          const headY = rect.top + rect.height * 0.25;
          const dx = event.clientX - headX;
          const dy = event.clientY - headY;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          const directionX = dx / distance;
          const directionY = dy / distance;
          const yawRange = window.innerWidth * 0.35;
          const headYaw = Math.max(-90, Math.min(90, (dx / yawRange) * 90));
          const yawRadians = (headYaw * Math.PI) / 180;
          const sensorYaw = Math.max(-90, Math.min(90, headYaw + 28));
          const sensorRadians = (sensorYaw * Math.PI) / 180;
          const antennaShift = Math.sin(yawRadians) * 0.42;
          const headShiftX = directionX * 0.32;
          const headShiftY = directionY * 0.13 + Math.abs(directionX) * 0.035;

          button.style.setProperty("--head-x", `${headShiftX}em`);
          button.style.setProperty("--head-y", `${headShiftY}em`);
          button.style.setProperty("--eye-y", `${directionY * 0.18}em`);
          button.style.setProperty("--sensor-y", `${directionY * 0.12}em`);
          button.style.setProperty(
            "--eye-surface-x",
            `${Math.sin(yawRadians) * 0.82}em`,
          );
          button.style.setProperty(
            "--eye-surface-scale",
            `${Math.max(0.24, Math.abs(Math.cos(yawRadians)))}`,
          );
          button.style.setProperty(
            "--sensor-surface-x",
            `${Math.sin(sensorRadians) * 0.82}em`,
          );
          button.style.setProperty(
            "--sensor-surface-scale",
            `${Math.max(0.2, Math.abs(Math.cos(sensorRadians)))}`,
          );
          button.style.setProperty(
            "--antenna-one-x",
            `${antennaShift + 0.22}em`,
          );
          button.style.setProperty(
            "--antenna-two-x",
            `${antennaShift}em`,
          );
        });
      }

      window.addEventListener("pointermove", followCursor, { passive: true });
      return () => {
        window.removeEventListener("pointermove", followCursor);
        cancelAnimationFrame(frame);
      };
    }, []);

    useEffect(() => {
      if (open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      let travelTimer = 0;
      let settleTimer = 0;
      let disposed = false;

      function scheduleTrip() {
        const idleDelay = 9_000 + Math.random() * 7_000;
        travelTimer = window.setTimeout(() => {
          if (disposed) return;

          setMoving(true);
          setSide((current) => (current === "right" ? "left" : "right"));

          settleTimer = window.setTimeout(() => {
            if (disposed) return;
            setMoving(false);
            scheduleTrip();
          }, TRAVEL_DURATION);
        }, idleDelay);
      }

      scheduleTrip();
      return () => {
        disposed = true;
        window.clearTimeout(travelTimer);
        window.clearTimeout(settleTimer);
      };
    }, [open]);

    function showGreeting() {
      setGreeting((current) => {
        if (current) return current;
        const nextGreeting = GREETINGS[greetingIndexRef.current % GREETINGS.length];
        greetingIndexRef.current += 1;
        return nextGreeting;
      });
    }

    function handleClick() {
      setMoving(false);
      onClick();
    }

    return (
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-label={open ? "Close BB-8 chat" : "Open BB-8 chat"}
        aria-expanded={open}
        title={open ? "Close BB-8" : "Talk to BB-8"}
        onClick={handleClick}
        onPointerEnter={showGreeting}
        onPointerLeave={() => setGreeting(null)}
        onFocus={showGreeting}
        onBlur={() => setGreeting(null)}
        data-side={side}
        data-moving={moving}
      >
        {greeting && (
          <span className={styles.greeting} aria-hidden="true">
            {greeting}
          </span>
        )}
        <BB8DroidVisual />
      </button>
    );
  },
);

export default BB8ChatDroid;
