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
  Circle,
  CheckCircle2,
} from "lucide-react";

type SenderType = "recruiter" | "visitor" | "friend" | "test" | null;

type Message = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  submittedAt: string;
  read: boolean;
  senderType: SenderType;
};

// --- Sender type config ---

type SenderOption = {
  value: SenderType;
  label: string;
  color: string;
  dot: string;
};

const SENDER_OPTIONS: SenderOption[] = [
  { value: null,        label: "Untagged",  color: "text-zinc-500 border-zinc-700 bg-zinc-800/60",          dot: "bg-zinc-500" },
  { value: "recruiter", label: "Recruiter", color: "text-sky-400 border-sky-500/30 bg-sky-500/10",          dot: "bg-sky-400" },
  { value: "visitor",   label: "Visitor",   color: "text-violet-400 border-violet-500/30 bg-violet-500/10", dot: "bg-violet-400" },
  { value: "friend",    label: "Friend",    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", dot: "bg-emerald-400" },
  { value: "test",      label: "Test",      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",    dot: "bg-amber-400" },
];

function senderOption(type: SenderType) {
  return SENDER_OPTIONS.find((o) => o.value === type) ?? SENDER_OPTIONS[0];
}

// --- Helpers ---

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

// --- Stat card ---

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`bg-zinc-900 border ${accent} rounded-xl px-5 py-4`}>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

// --- Sender type picker ---

function SenderTypePicker({
  value,
  onChange,
}: {
  value: SenderType;
  onChange: (v: SenderType) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = senderOption(value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-colors ${current.color}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
        {current.label}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-36 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden"
          >
            {SENDER_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-zinc-800 ${
                  value === opt.value ? "text-white font-medium" : "text-zinc-400"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                {opt.label}
                {value === opt.value && (
                  <CheckCircle2 size={11} className="ml-auto text-violet-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Message card ---

function MessageCard({
  msg,
  adminKey,
  onDelete,
  onUpdate,
}: {
  msg: Message;
  adminKey: string;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Pick<Message, "read" | "senderType">>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingType, setUpdatingType] = useState(false);

  // Mark as read when expanded for the first time
  useEffect(() => {
    if (expanded && !msg.read) {
      patch({ read: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const patch = useCallback(
    async (fields: Partial<Pick<Message, "read" | "senderType">>) => {
      try {
        const res = await fetch("/api/contact", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
          body: JSON.stringify({ id: msg.id, ...fields }),
        });
        if (!res.ok) throw new Error("Update failed");
        onUpdate(msg.id, fields);
      } catch {
        // silently ignore
      }
    },
    [adminKey, msg.id, onUpdate]
  );

  const handleSenderChange = async (type: SenderType) => {
    setUpdatingType(true);
    onUpdate(msg.id, { senderType: type });
    await patch({ senderType: type });
    setUpdatingType(false);
  };

  const handleMarkRead = async () => {
    onUpdate(msg.id, { read: true });
    await patch({ read: true });
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete(msg.id);
  };

  const isLong = msg.message.length > 150;
  const isUnread = !msg.read;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-zinc-900 border rounded-xl p-4 transition-colors ${
        isUnread
          ? "border-violet-500/30 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {isUnread && (
        <span className="absolute left-0 top-4 bottom-4 w-[3px] bg-violet-500 rounded-full" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={`h-9 w-9 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isUnread ? "bg-violet-500/20 border-violet-500/30" : "bg-zinc-800 border-zinc-700"
          }`}
        >
          <span className={`text-xs font-semibold ${isUnread ? "text-violet-300" : "text-zinc-400"}`}>
            {getInitials(msg.firstName, msg.lastName)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <p className={`text-sm font-medium truncate ${isUnread ? "text-white" : "text-zinc-300"}`}>
                {msg.firstName} {msg.lastName}
              </p>
              {isUnread && (
                <Circle size={7} className="fill-violet-400 text-violet-400 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={updatingType ? "opacity-60 pointer-events-none" : ""}>
                <SenderTypePicker value={msg.senderType} onChange={handleSenderChange} />
              </div>

              {isUnread && (
                <button
                  onClick={handleMarkRead}
                  title="Mark as read"
                  className="text-xs px-2 py-1 rounded-lg border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
                >
                  <CheckCircle2 size={12} />
                </button>
              )}

              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(msg.submittedAt)}
              </span>

              <button
                onClick={handleDelete}
                disabled={deleting}
                title={confirmDelete ? "Click again to confirm" : "Delete"}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                  confirmDelete
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                } disabled:opacity-50`}
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {confirmDelete && <span>Confirm?</span>}
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
            <Mail size={11} />
            {msg.email}
          </p>

          <div className="mt-2.5">
            <p className={`text-sm text-zinc-300 leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
              {msg.message}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-1.5 transition-colors"
              >
                {expanded ? (
                  <><ChevronUp size={12} /> Show less</>
                ) : (
                  <><ChevronDown size={12} /> Show more</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Page ---

type FilterTab = "all" | "unread" | "recruiter" | "visitor" | "friend" | "test";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "unread",    label: "Unread" },
  { value: "recruiter", label: "Recruiters" },
  { value: "visitor",   label: "Visitors" },
  { value: "friend",    label: "Friends" },
  { value: "test",      label: "Tests" },
];

export default function MessagesPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "error" | "unauth">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = useState(false);

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
      if (isRefresh) setRefreshing(true);
      else setPageStatus("loading");

      try {
        const res = await fetch("/api/contact", {
          headers: { "x-admin-key": adminKey },
        });
        if (res.status === 401) { router.replace("/admin/login"); return; }
        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const data: Message[] = await res.json();
        setMessages(
          data.map((m) => ({
            ...m,
            read: m.read ?? false,
            senderType: m.senderType ?? null,
          }))
        );
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
          headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
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

  const handleUpdate = useCallback(
    (id: string, patch: Partial<Pick<Message, "read" | "senderType">>) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    []
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  const filtered = messages
    .filter((m) => {
      if (activeTab === "unread") return !m.read;
      if (activeTab !== "all") return m.senderType === activeTab;
      return true;
    })
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
      const diff = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

  const todayCount = messages.filter((m) => isToday(m.submittedAt)).length;
  const weekCount  = messages.filter((m) => isThisWeek(m.submittedAt)).length;

  if (pageStatus === "unauth") return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageSquare size={19} className="text-violet-400" />
            Messages
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-violet-500 text-white px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
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

      {pageStatus === "ready" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total"     value={messages.length} accent="border-zinc-800" />
          <StatCard label="Unread"    value={unreadCount}     accent={unreadCount > 0 ? "border-violet-500/30" : "border-zinc-800"} />
          <StatCard label="Today"     value={todayCount}      accent="border-zinc-800" />
          <StatCard label="This Week" value={weekCount}       accent="border-zinc-800" />
        </div>
      )}

      {pageStatus === "ready" && (
        <div className="flex gap-1 mb-5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"    ? messages.length :
              tab.value === "unread" ? unreadCount :
              messages.filter((m) => m.senderType === tab.value).length;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value ? "bg-violet-500/30 text-violet-300" : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {pageStatus === "ready" && (
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or message..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>
          <button
            onClick={() => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
          >
            {sortOrder === "newest" ? <SortDesc size={14} /> : <SortAsc size={14} />}
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      )}

      {pageStatus === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-[96px]" />
          ))}
        </div>
      )}

      {pageStatus === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={15} />
          {errorMsg || "Failed to load messages."}
        </div>
      )}

      {pageStatus === "ready" && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Inbox size={38} className="mb-3 opacity-40" />
          <p className="text-sm">
            {search ? "No messages match your search." : "No messages yet."}
          </p>
        </div>
      )}

      {pageStatus === "ready" && filtered.length > 0 && adminKey && (
        <>
          <p className="text-xs text-zinc-600 mb-3">
            {filtered.length} {filtered.length === 1 ? "message" : "messages"}
            {search && ` matching "${search}"`}
          </p>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((msg) => (
                <MessageCard
                  key={msg.id}
                  msg={msg}
                  adminKey={adminKey}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
