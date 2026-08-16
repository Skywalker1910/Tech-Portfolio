"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShieldCheck, X } from "lucide-react";

export const ANALYTICS_PREFERENCES_EVENT = "portfolio:analytics-preferences";

const ENHANCED_CONSENT_KEY = "portfolio-analytics-consent";
const BASIC_OPT_OUT_KEY = "portfolio-analytics-basic-opt-out";
const VISITOR_KEY = "portfolio-analytics-visitor";
const VISIT_KEY = "portfolio-analytics-visit";
const VISIT_TIMEOUT_MS = 30 * 60 * 1000;

type EnhancedConsent = "accepted" | "declined" | null;
type VisitState = { id:string; lastActivityAt:number };
type ActivePage = { eventId:string; startedAt:number; reported:boolean };

function readEnhancedConsent(): EnhancedConsent {
  const value = localStorage.getItem(ENHANCED_CONSENT_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

function clearJourneyStorage() {
  localStorage.removeItem(VISITOR_KEY);
  sessionStorage.removeItem(VISIT_KEY);
  sessionStorage.removeItem("portfolio-analytics-session");
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith("portfolio-view:")) sessionStorage.removeItem(key);
  }
}

function getOrCreateVisitorId() {
  const stored = localStorage.getItem(VISITOR_KEY);
  if (stored) return stored;
  const visitorId = crypto.randomUUID();
  localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

function getOrCreateVisit(now: number): VisitState {
  const stored = sessionStorage.getItem(VISIT_KEY);
  if (stored) {
    try {
      const visit = JSON.parse(stored) as Partial<VisitState>;
      if (typeof visit.id === "string" && typeof visit.lastActivityAt === "number" && now - visit.lastActivityAt < VISIT_TIMEOUT_MS) {
        const activeVisit = { id:visit.id, lastActivityAt:now };
        sessionStorage.setItem(VISIT_KEY, JSON.stringify(activeVisit));
        return activeVisit;
      }
    } catch {
      // A malformed or outdated value is replaced below.
    }
  }
  const visit = { id:crypto.randomUUID(), lastActivityAt:now };
  sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  return visit;
}

function clientHints() {
  return {
    platform:navigator.platform.slice(0, 40),
    touchPoints:Math.min(20, Math.max(0, navigator.maxTouchPoints || 0)),
    viewportWidth:Math.max(0, Math.round(window.innerWidth)),
  };
}

function trafficSource() {
  if (!document.referrer) return { category:"Direct", host:null } as const;
  try {
    const host = new URL(document.referrer).hostname.toLowerCase().slice(0, 120);
    if (host === location.hostname) return { category:"Internal", host } as const;
    if (/(^|\.)(google|bing|yahoo|duckduckgo)\./.test(host)) return { category:"Search", host } as const;
    if (/(^|\.)(linkedin|github|facebook|instagram|x|twitter|reddit)\./.test(host)) return { category:"Social", host } as const;
    return { category:"Referral", host } as const;
  } catch {
    return { category:"Referral", host:null } as const;
  }
}

function hasPrivacySignal() {
  const navigatorWithGpc = navigator as Navigator & { globalPrivacyControl?:boolean };
  return navigator.doNotTrack === "1" || navigatorWithGpc.globalPrivacyControl === true;
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const activePage = useRef<ActivePage|null>(null);
  const enhancedEnabledRef = useRef(false);
  const [enhancedConsent, setEnhancedConsent] = useState<EnhancedConsent>(null);
  const [basicOptOut, setBasicOptOut] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const privacySignal = typeof navigator !== "undefined" && hasPrivacySignal();
  const basicEnabled = ready && !privacySignal && !basicOptOut;
  const enhancedEnabled = basicEnabled && enhancedConsent === "accepted";

  useEffect(() => {
    setEnhancedConsent(readEnhancedConsent());
    setBasicOptOut(localStorage.getItem(BASIC_OPT_OUT_KEY) === "true");
    setReady(true);
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
  }, []);

  const reportEngagement = useCallback((preferBeacon = false) => {
    const page = activePage.current;
    if (!page || page.reported) return;
    page.reported = true;
    const durationMs = Math.min(7_200_000, Math.max(0, Date.now() - page.startedAt));
    if (durationMs < 1_000) return;
    const body = JSON.stringify({ eventType:"engagement", eventId:page.eventId, durationMs });
    if (preferBeacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type:"application/json" }));
      return;
    }
    fetch("/api/analytics", { method:"POST", headers:{ "Content-Type":"application/json" }, body, keepalive:true }).catch(() => {});
  }, []);

  useEffect(() => {
    const finishPage = () => reportEngagement(true);
    const handleVisibility = () => { if (document.visibilityState === "hidden") finishPage(); };
    window.addEventListener("pagehide", finishPage);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", finishPage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reportEngagement]);

  useEffect(() => {
    enhancedEnabledRef.current = enhancedEnabled;
  }, [enhancedEnabled]);

  useEffect(() => {
    reportEngagement();
    if (!pathname || pathname.startsWith("/admin") || !basicEnabled) {
      activePage.current = null;
      return;
    }
    const now = Date.now();
    const eventId = crypto.randomUUID();
    activePage.current = { eventId, startedAt:now, reported:false };
    const journey = enhancedEnabledRef.current ? { visitorId:getOrCreateVisitorId(), visitId:getOrCreateVisit(now).id, source:trafficSource() } : {};
    fetch("/api/analytics", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ eventType:"page_view", path:pathname, eventId, client:clientHints(), ...journey }),
      keepalive:true,
    }).catch(() => {});
    return () => reportEngagement();
  }, [basicEnabled, pathname, reportEngagement]);

  const choose = useCallback((choice: "enhanced"|"basic"|"disabled") => {
    if (choice === "enhanced") {
      localStorage.removeItem(BASIC_OPT_OUT_KEY);
      localStorage.setItem(ENHANCED_CONSENT_KEY, "accepted");
      setBasicOptOut(false);
      setEnhancedConsent("accepted");
    } else if (choice === "basic") {
      localStorage.removeItem(BASIC_OPT_OUT_KEY);
      localStorage.setItem(ENHANCED_CONSENT_KEY, "declined");
      clearJourneyStorage();
      setBasicOptOut(false);
      setEnhancedConsent("declined");
    } else {
      localStorage.setItem(BASIC_OPT_OUT_KEY, "true");
      localStorage.setItem(ENHANCED_CONSENT_KEY, "declined");
      clearJourneyStorage();
      setBasicOptOut(true);
      setEnhancedConsent("declined");
    }
    setPreferencesOpen(false);
  }, []);

  if (!ready || pathname?.startsWith("/admin")) return null;
  const showChoice = enhancedConsent === null || preferencesOpen;
  if (!showChoice) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:inset-x-auto sm:left-5 sm:mx-0" aria-label="Analytics preferences" role="dialog" aria-modal="false">
      {preferencesOpen && <button onClick={() => setPreferencesOpen(false)} className="absolute right-3 top-3 rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text)]" aria-label="Close analytics preferences"><X size={16}/></button>}
      <div className="flex gap-4 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><BarChart3 size={18}/></div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Analytics choices</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">Basic, cookieless site measurement records the page, engagement time, broad device/viewport category, and coarse country/region to improve this portfolio. It does not create a persistent visitor identity. Enhanced analytics additionally remembers a random browser ID, numbered visits, page journeys, and traffic-source category.</p>
          {privacySignal && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck size={13}/> Your browser privacy signal is enabled, so all analytics remains off.</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button disabled={privacySignal} onClick={() => choose("enhanced")} className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black">Allow enhanced</button>
            <button disabled={privacySignal} onClick={() => choose("basic")} className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[var(--tag-bg)] disabled:opacity-40">Use basic only</button>
            <button onClick={() => choose("disabled")} className="rounded-full px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]">Disable all</button>
            <Link href="/privacy" className="px-2 py-2 text-xs font-medium text-[var(--muted)] underline decoration-orange-500/50 underline-offset-4">Privacy details</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
