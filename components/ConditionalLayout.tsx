"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import GhPagesBanner from "./GhPagesBanner";
import TrafficTracker from "./TrafficTracker";

const isGhPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/admin");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {!isGhPages && <TrafficTracker />}
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      {isGhPages && <GhPagesBanner />}
      {pathname !== "/chat" && <ChatWidget />}
    </>
  );
}
