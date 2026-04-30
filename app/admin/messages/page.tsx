"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Search,
  Trash2,
  Mail,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Inbox,
  SortAsc,
  SortDesc,
  Loader2,
} from "lucide-react";

type Message = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAt: string;
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function isThisWeek(iso: string) {
  return new Date(iso) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className={`bg-zinc-900 border ${accent} rounded-xl px-5 py-4`}>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

// ─── Message card ─────────────────────────────────────────────────────────────

function MessageCard({
  msg,
  onDelete,
}: {
  msg: Message;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-reset confirm state after 3 s if user doesn't click again
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete(msg.id);
  };

  const isLong = msg.message.length > 150;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-semibold text-violet-300">
            {getInitials(msg.firstName, msg.lastName)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row: name + date + delete */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-medium text-white">
                {msg.firstName} {msg.lastName}
              </p>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Mail size={11} />
                {msg.email}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(msg.submittedAt)}
              </span>

              <button
                onClick={handleDelete}
                disabled={deleting}
                title={confirmDelete ? "Click again to confirm deletion" : "Delete message"}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                  confirmDelete
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                } disabled:opacity-50`}
              >
                {deleting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Trash2 size={12} />
                )}
                {confirmDelete && <span>Confirm?</span>}
              </button>
            </div>
          </div>

          {/* Message body */}
          <div className="mt-2">
            <p
              className={`text-sm text-zinc-300 leading-relaxed ${
                !expanded ? "line-clamp-2" : ""
              }`}
            >
              {msg.message}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-1.5 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> Show more
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "error" | "unauth">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [refreshing, setRefreshing] = useState(false);

  // Retrieve admin key from sessionStorage on mount
  useEffect(() => {
    try {
      const key = sessionStorage.getItem("dashboard-admin-key");
      if (!key) {
        setPageStatus("unauth");
        router.replace("/admin/login");
      } else {
        setAdminKey(key);
      }
    } catch {
      setPageStatus("unauth");
      router.replace("/admin/login");
    }
  }, [router]);

  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      if (!adminKey) return;
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setPageStatus("loading");
      }

      try {
        const res = await fetch("/api/contact", {
          headers: { "x-admin-key": adminKey },
        });

        if (res.status === 401) {
          setPageStatus("unauth");
router.replace("/admin/login");
          return;
        }

        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const data: Message[] = await res.json();
        setMessages(data);
        setPageStatus("ready");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setPageStatus("error");
      } finally {
        setRefreshing(false);
      }
    },
    [adminKey, router]
  );

  useEffect(() => {
    if (adminKey) fetchMessages();
  }, [adminKey, fetchMessages]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!adminKey) return;
      try {
        const res = await fetch("/api/contact", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Delete failed");
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete message");
      }
    },
    [adminKey]
  );

  // Derived lists
  const filtered = messages
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const diff =
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

  const todayCount = messages.filter((m) => isToday(m.submittedAt)).length;
  const weekCount = messages.filter((m) => isThisWeek(m.submittedAt)).length;

  if (pageStatus === "unauth") return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageSquare size={19} className="text-violet-400" />
            Messages
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Contact form submissions</p>
        </div>

        <button
          onClick={() => fetchMessages(true)}
          disabled={pageStatus === "loading" || refreshing}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {pageStatus === "ready" && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Total Messages"
            value={messages.length}
            accent="border-zinc-800"
          />
          <StatCard
            label="Today"
            value={todayCount}
            accent="border-violet-800/40"
          />
          <StatCard
            label="This Week"
            value={weekCount}
            accent="border-violet-800/40"
          />
        </div>
      )}

      {/* Search + Sort */}
      {pageStatus === "ready" && (
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or message…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>

          <button
            onClick={() =>
              setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))
            }
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
          >
            {sortOrder === "newest" ? (
              <SortDesc size={14} />
            ) : (
              <SortAsc size={14} />
            )}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {pageStatus === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-[88px]"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {pageStatus === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} />
          {errorMsg || "Failed to load messages."}
        </div>
      )}

      {/* Empty state */}
      {pageStatus === "ready" && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Inbox size={38} className="mb-3 opacity-40" />
          <p className="text-sm">
            {search ? "No messages match your search." : "No messages yet."}
          </p>
        </div>
      )}

      {/* Message list */}
      {pageStatus === "ready" && filtered.length > 0 && (
        <>
          <p className="text-xs text-zinc-600 mb-3">
            {filtered.length} {filtered.length === 1 ? "message" : "messages"}
            {search && ` matching "${search}"`}
          </p>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((msg) => (
                <MessageCard key={msg.id} msg={msg} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
