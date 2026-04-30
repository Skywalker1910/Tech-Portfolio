import type { ReactNode } from "react";
import DashboardShell from "@/components/DashboardShell";

export const metadata = {
  title: "Admin Dashboard — Portfolio",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
