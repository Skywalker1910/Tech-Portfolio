"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrafficTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    let sessionId = sessionStorage.getItem("portfolio-analytics-session");
    if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem("portfolio-analytics-session", sessionId); }
    const seenKey = `portfolio-view:${pathname}`;
    if (sessionStorage.getItem(seenKey)) return;
    sessionStorage.setItem(seenKey, "1");
    fetch("/api/analytics", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ path:pathname, sessionId }), keepalive:true }).catch(() => {});
  }, [pathname]);
  return null;
}
