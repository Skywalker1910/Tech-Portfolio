"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ShieldCheck, X } from "lucide-react";
import {
  browserPrivacySignal,
  clearOptionalAnalyticsStorage,
  ANALYTICS_VISITOR_KEY,
  enhancedAnalyticsAllowed,
  getOrCreateAnalyticsIdentity,
  getOrCreateEnhancedVisitId,
  markAnalyticsIdentityReported,
  optionalAnalyticsAllowed,
  readAnalyticsPreference,
  writeAnalyticsPreference,
  type AnalyticsPreference,
} from "@/lib/client-analytics";

export const ANALYTICS_PREFERENCES_EVENT = "portfolio:analytics-preferences";

type ActivePage = { eventId:string; startedAt:number; reported:boolean };

function clientHints() {
  return {
    platform:navigator.platform.slice(0, 40),
    touchPoints:Math.min(20, Math.max(0, navigator.maxTouchPoints || 0)),
    viewportWidth:Math.max(0, Math.round(window.innerWidth)),
  };
}

function trafficSource() {
  if (!document.referrer) return { category:"direct", host:null } as const;
  try {
    const host = new URL(document.referrer).hostname.toLowerCase().slice(0, 120);
    if (host === location.hostname) return { category:"internal", host } as const;
    if (/(^|\.)(google|bing|yahoo|duckduckgo)\./.test(host)) return { category:"search", host } as const;
    if (/(^|\.)linkedin\./.test(host)) return { category:"professional_network", host } as const;
    if (/(^|\.)github\./.test(host)) return { category:"github", host } as const;
    if (/(^|\.)(facebook|instagram|x|twitter|reddit)\./.test(host)) return { category:"social", host } as const;
    return { category:"referral", host } as const;
  } catch {
    return { category:"other", host:null } as const;
  }
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const activePage = useRef<ActivePage|null>(null);
  const enhancedEnabledRef = useRef(false);
  const [preference, setPreference] = useState<AnalyticsPreference|null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const privacySignal = typeof navigator !== "undefined" && browserPrivacySignal(navigator as Navigator & { globalPrivacyControl?:boolean });
  const basicEnabled = ready && optionalAnalyticsAllowed(preference, privacySignal);
  const enhancedEnabled = ready && enhancedAnalyticsAllowed(preference, privacySignal);

  useEffect(() => {
    const storedPreference = readAnalyticsPreference(localStorage);
    if (storedPreference) writeAnalyticsPreference(localStorage, storedPreference);
    if (browserPrivacySignal(navigator as Navigator & { globalPrivacyControl?:boolean })) {
      clearOptionalAnalyticsStorage(localStorage, sessionStorage, Boolean(localStorage.getItem(ANALYTICS_VISITOR_KEY)));
    }
    setPreference(storedPreference);
    setReady(true);
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, openPreferences);
  }, []);

  useEffect(() => {
    if (!ready || pathname?.startsWith("/admin")) return;
    const identity = getOrCreateAnalyticsIdentity({ sessionStorage, localStorage, preference, privacySignal });
    if (identity.reported) return;
    fetch("/api/analytics", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ eventType:"visitor_session_started", eventId:crypto.randomUUID(), visitorId:identity.visitorId, sessionId:identity.sessionId }),
      keepalive:true,
    }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.accepted === true) markAnalyticsIdentityReported(sessionStorage, identity);
    }).catch(() => {});
  }, [pathname, preference, privacySignal, ready]);

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
    const identity = getOrCreateAnalyticsIdentity({ sessionStorage, localStorage, preference, privacySignal, now });
    const journey = enhancedEnabledRef.current ? { visitId:getOrCreateEnhancedVisitId(sessionStorage, now), source:trafficSource() } : {};
    fetch("/api/analytics", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ eventType:"page_view", path:pathname, eventId, visitorId:identity.visitorId, sessionId:identity.sessionId, client:clientHints(), ...journey }),
      keepalive:true,
    }).catch(() => {});
    return () => reportEngagement();
  }, [basicEnabled, pathname, preference, privacySignal, reportEngagement]);

  const choose = useCallback((choice: AnalyticsPreference) => {
    if (choice !== "enhanced") {
      const hadPersistentIdentity = preference === "enhanced" || Boolean(localStorage.getItem(ANALYTICS_VISITOR_KEY));
      clearOptionalAnalyticsStorage(localStorage, sessionStorage, hadPersistentIdentity);
    }
    writeAnalyticsPreference(localStorage, choice);
    setPreference(choice);
    window.dispatchEvent(new Event("portfolio:analytics-consent-changed"));
    setPreferencesOpen(false);
  }, [preference]);

  if (!ready || pathname?.startsWith("/admin")) return null;
  const showChoice = preference === null || preferencesOpen;
  if (!showChoice) return null;

  return (
    <aside className="fixed bottom-3 left-1/2 z-[120] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:p-3.5" aria-label="Privacy and analytics preferences" role="dialog" aria-modal="false">
      {preferencesOpen && <button onClick={() => setPreferencesOpen(false)} className="absolute right-2 top-2 rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text)]" aria-label="Close analytics preferences"><X size={14}/></button>}
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><BarChart3 size={15}/></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[var(--text)]">Privacy &amp; analytics</h2>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">Essential anonymous visitor/session IDs and country/region measurement are always on; raw IP addresses are not stored. Basic adds page and device metrics. Enhanced adds return visits and journeys.</p>
          {privacySignal && <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck size={11} className="shrink-0"/>Your browser privacy signal keeps optional analytics off.</p>}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-0 sm:pl-11">
        <button disabled={privacySignal} onClick={() => choose("enhanced")} className="rounded-lg bg-black px-3 py-1.5 text-[10px] font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black">Allow enhanced</button>
        <button disabled={privacySignal} onClick={() => choose("basic")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text)] transition hover:bg-[var(--tag-bg)] disabled:opacity-40">Basic only</button>
        <button onClick={() => choose("essential")} className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-[var(--muted)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text)]">Mandatory only</button>
        <Link href="/privacy" className="ml-auto px-2 py-1.5 text-[10px] font-medium text-[var(--muted)] underline decoration-orange-500/50 underline-offset-4">Details</Link>
      </div>
    </aside>
  );
}
