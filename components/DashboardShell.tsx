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
  BrainCircuit,
  Activity,
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
      { href: "/admin/traffic", label: "Traffic", icon: <Activity size={15} /> },
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
      },
      {
        href: "/admin/experience",
        label: "Experience",
        icon: <Briefcase size={15} />,
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
  {
    title: "Intelligence",
    items: [{ href: "/admin/rag", label: "RAG Control", icon: <BrainCircuit size={15} /> }],
  },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Sidebar */}
      <aside className="flex w-[4.5rem] flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:w-60">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10">
            <Shield size={16} className="text-orange-500" />
          </div>
          <div className="hidden min-w-0 md:block">
            <div className="truncate text-sm font-semibold text-[var(--text)]">Portfolio Admin</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--sub-muted)]">Command Center</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="hidden px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sub-muted)] md:block">
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
                        className="flex cursor-not-allowed select-none items-center justify-center rounded-xl px-3 py-2.5 text-sm text-[var(--sub-muted)] opacity-45 md:justify-between"
                        title="Coming soon"
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          <span className="hidden md:inline">{item.label}</span>
                        </span>
                        <span className="hidden rounded-full border border-[var(--border)] bg-[var(--tag-bg)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--sub-muted)] md:inline">
                          soon
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center justify-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-all md:justify-start ${
                        isActive
                          ? "border-orange-500/25 bg-orange-500/10 text-orange-600 shadow-sm dark:text-orange-300"
                          : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--tag-bg)] hover:text-[var(--text)]"
                      }`}
                    >
                      <span className={isActive ? "text-orange-500" : ""}>{item.icon}</span>
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: sign out */}
        <div className="border-t border-[var(--border)] px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 md:justify-start"
          >
            <LogOut size={15} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/80 px-5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sub-muted)]">Command Center</span>
          <span className="text-xs text-[var(--border)]">/</span>
          <span className="text-xs font-semibold text-[var(--text)]">{pageTitle(pathname)}</span>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg)]">
          {children}
        </main>
      </div>
    </div>
  );
}
