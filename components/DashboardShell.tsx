"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  MessageSquare,
  LogOut,
  Shield,
  Clock,
  Wrench,
  Briefcase,
  FolderKanban,
  LayoutDashboard,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  exact?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

function pageTitle(pathname: string | null) {
  if (!pathname) return "Command Center";
  if (pathname === "/admin") return "Home";
  const seg = pathname.split("/").filter(Boolean).pop() ?? "";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin",
        label: "Home",
        icon: <LayoutDashboard size={15} />,
        exact: true,
      },
    ],
  },
  {
    title: "Monitor",
    items: [
      {
        href: "/admin/messages",
        label: "Messages",
        icon: <MessageSquare size={15} />,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        href: "/admin/projects",
        label: "Projects",
        icon: <FolderKanban size={15} />,
        disabled: true,
      },
      {
        href: "/admin/experience",
        label: "Experience",
        icon: <Briefcase size={15} />,
        disabled: true,
      },
      {
        href: "/admin/timeline",
        label: "Timeline",
        icon: <Clock size={15} />,
        disabled: true,
      },
      {
        href: "/admin/skills",
        label: "Skills",
        icon: <Wrench size={15} />,
        disabled: true,
      },
    ],
  },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("dashboard-admin-key");
    } catch {}
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
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
            <div className="text-sm font-semibold text-white truncate">Admin</div>
            <div className="text-xs text-zinc-500">Command Center</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-2 pb-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.disabled
                    ? false
                    : item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname?.startsWith(item.href + "/");

                  if (item.disabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-600 cursor-not-allowed select-none"
                        title="Coming soon"
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">
                          soon
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      <span className={isActive ? "text-violet-400" : ""}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: sign out */}
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

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 flex-shrink-0 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm flex items-center px-6 gap-2">
          <span className="text-xs text-zinc-600">Command Center</span>
          <span className="text-xs text-zinc-700">/</span>
          <span className="text-xs text-zinc-300 font-medium">{pageTitle(pathname)}</span>
        </header>
        {/* Page content */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          {children}
        </div>
      </div>
    </div>
  );
}
