"use client";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  color?: "violet" | "teal" | "gray";
};

export default function Badge({ children, color = "gray" }: Props) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const colorClass =
    color === "violet"
      ? "bg-violet-600/10 text-violet-400 ring-1 ring-inset ring-violet-600/20"
      : color === "teal"
      ? "bg-teal-600/10 text-teal-400 ring-1 ring-inset ring-teal-600/20"
      : "bg-slate-700/10 text-slate-300 ring-1 ring-inset ring-slate-700/20";

  return <span className={`${base} ${colorClass}`}>{children}</span>;
}
