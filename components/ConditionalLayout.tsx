"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import GhPagesBanner from "./GhPagesBanner";

const isGhPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
      {isGhPages && <GhPagesBanner />}
      <ChatWidget hideButton />
    </>
  );
}
