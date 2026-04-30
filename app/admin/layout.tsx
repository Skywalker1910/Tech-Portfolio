import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";

export const metadata = {
  title: "Admin — Command Center",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
