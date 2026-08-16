"use client";

import { ANALYTICS_PREFERENCES_EVENT } from "./TrafficTracker";

export default function AnalyticsPreferencesButton() {
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === "true") return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT))}
      className="transition-colors hover:text-slate-400"
    >
      Analytics choices
    </button>
  );
}
