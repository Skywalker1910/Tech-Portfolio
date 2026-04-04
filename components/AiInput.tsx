"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, LoaderCircle } from "lucide-react";
import React, { useRef, useEffect, useState, DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

type ActionButtonProps = {
  className?: string;
  children?: React.ReactNode;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        "p-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm rounded-lg",
        className
      )}
    >
      {children}
    </button>
  )
);
ActionButton.displayName = "ActionButton";

const Placeholder = ({ placeholder }: { placeholder: string }) => (
  <div className="flex items-center justify-start gap-0 flex-wrap">
    {placeholder.split("").map((char, i) => {
      if (char === " ") return <span key={i} className="w-1" />;
      return (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.01, type: "spring" }}
          className="text-white/50 font-extralight text-sm"
        >
          {char}
        </motion.span>
      );
    })}
  </div>
);

type AiInputProps = {
  width?: string;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
  rows?: number;
  mainColor?: string;
  backgroundColor?: string;
  onSubmit?: (value: string) => void | Promise<void>;
  animationStyle?: "orbit" | "pulse";
};

export default function AiInput({
  width = "100%",
  className,
  placeholder = "Ask about my work...",
  style,
  mainColor = "#7c3aed",
  backgroundColor = "#09090b",
  rows = 1,
  onSubmit,
  animationStyle = "orbit",
}: AiInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clipPath, setClipPath] = useState("");

  const leftBlob = useAnimationControls();
  const rightBlob = useAnimationControls();

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: r.width, height: r.height });
    });
    obs.observe(containerRef.current);
    const r = containerRef.current.getBoundingClientRect();
    setContainerSize({ width: r.width, height: r.height });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width: w, height: h } = containerSize;
    setClipPath(
      `polygon(evenodd, 86.5px 78.5px, 78.5px 86.5px, 78.5px 100%, 0% 100%, 0% 0%, 100% 0%, 100% 100%, 78.5px 100%, 78.5px ${73.5 + h}px, 86.5px ${82 + h}px, ${73.5 + w}px ${82 + h}px, ${82 + w}px ${73.5 + h}px, ${82 + w}px 86.5px, ${73.5 + w}px 78.5px)`
    );
  }, [containerSize]);

  const startAnimation = async () => {
    leftBlob.stop();
    rightBlob.stop();
    await Promise.all([
      leftBlob.start({ opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }),
      rightBlob.start({ opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }),
    ]);
    await Promise.all([
      leftBlob.start({ top: animationStyle === "orbit" ? "0%" : "50%", left: animationStyle === "orbit" ? "50%" : "0%", translateY: "-50%", translateX: "-50%", transition: { duration: 0.2, ease: "linear" } }),
      rightBlob.start({ top: animationStyle === "orbit" ? "100%" : "50%", left: animationStyle === "orbit" ? "50%" : "0%", translateY: "-50%", translateX: "-50%", transition: { duration: 0.2, ease: "linear" } }),
    ]);
  };

  const thinkingAnimation = () =>
    Promise.all([
      leftBlob.start({
        left: animationStyle === "orbit" ? ["50%", "100%", "100%", "0%", "0%", "50%"] : ["0%", "0%", "100%", "100%"],
        top: animationStyle === "orbit" ? ["0%", "0%", "100%", "100%", "0%", "0%"] : ["50%", "0%", "0%", "50%"],
        width: animationStyle === "orbit" ? "80px" : ["80px", "80px", "150px", "20px"],
        transition: { repeat: Infinity, repeatType: "loop", duration: animationStyle === "orbit" ? 1 : 0.8, ease: "linear" },
      }),
      rightBlob.start({
        left: animationStyle === "orbit" ? ["50%", "0%", "0%", "100%", "100%", "50%"] : ["0%", "0%", "100%", "100%"],
        top: animationStyle === "orbit" ? ["100%", "100%", "0%", "0%", "100%", "100%"] : ["50%", "100%", "100%", "50%"],
        width: animationStyle === "orbit" ? "80px" : ["80px", "80px", "150px", "20px"],
        transition: { repeat: Infinity, repeatType: "loop", duration: animationStyle === "orbit" ? 1 : 0.8, ease: "linear" },
      }),
    ]);

  const exitAnimation = async () => {
    await Promise.all([
      leftBlob.start({ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }),
      rightBlob.start({ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }),
    ]);
    leftBlob.stop();
    rightBlob.stop();
    await Promise.all([
      leftBlob.set({ top: "0%", left: "0%", translateY: "-50%", translateX: "-40%" }),
      rightBlob.set({ top: "100%", left: "100%", translateY: "-50%", translateX: "-60%" }),
    ]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    textareaRef.current?.blur();
    const temp = value;
    setValue("");
    setIsLoading(true);
    await startAnimation();
    thinkingAnimation();
    try {
      await onSubmit?.(temp);
    } catch {}
    await exitAnimation();
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  };

  return (
    <div style={{ width }} className="relative flex items-center justify-center">
      <span
        style={{ clipPath, backgroundColor: `${backgroundColor}a5` }}
        className="absolute inset-[-80px] z-[1]"
      />
      <motion.span
        initial={{ top: animationStyle === "orbit" ? "0%" : "50%", left: "0%", translateY: "-50%", translateX: "-40%", height: "80px", width: "80px" }}
        animate={leftBlob}
        style={{ background: `radial-gradient(ellipse, color-mix(in srgb, ${mainColor}, 30% white), transparent 50%)` }}
        className="inline-block absolute opacity-0 z-[0]"
      />
      <motion.span
        initial={{ top: animationStyle === "orbit" ? "100%" : "50%", left: animationStyle === "orbit" ? "100%" : "0%", translateY: "-50%", translateX: "-60%", height: "80px", width: "80px" }}
        animate={rightBlob}
        style={{ background: `radial-gradient(ellipse, color-mix(in srgb, ${mainColor}, 30% white), transparent 50%)` }}
        className="inline-block absolute opacity-0 z-[0]"
      />

      <div
        ref={containerRef}
        style={{ width }}
        className={cn(
          "border border-white/10 hover:border-white/20 focus-within:border-violet-500/40",
          "rounded-xl relative z-20 transition-all duration-200",
          isLoading && "!border-transparent",
          "bg-zinc-950"
        )}
      >
        {!value && (
          <div className="absolute inset-0 px-3 py-2.5 pointer-events-none">
            <Placeholder placeholder={placeholder} />
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); textareaRef.current?.focus(); }}
          style={{ resize: "none", ...style }}
          rows={rows}
          className={cn("w-full px-3 py-2.5 text-white/80 bg-transparent outline-none text-sm", className)}
        />
        <div className="flex items-center justify-end p-1.5 gap-1">
          <ActionButton
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            style={{ backgroundColor: mainColor }}
            className="text-white rounded-lg"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {isLoading ? (
                <motion.span key="loading" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                  <LoaderCircle size={15} className="animate-spin" />
                </motion.span>
              ) : (
                <motion.span key="arrow" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                  <ArrowUp size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
