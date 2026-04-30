"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { MessageSquare, LogOut, Shield } from "lucide-react";

const navLinks = [
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: <MessageSquare size={16} />,
  },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("dashboard-admin-key");
    } catch {}
    router.push("/dashboard/login");
  };

  // Login page: render children without the sidebar chrome
  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-zinc-800 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Shield size={15} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">Portfolio Admin</div>
            <div className="text-xs text-zinc-500">Control Dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-2 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Monitor
          </p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span className={isActive ? "text-violet-400" : ""}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
