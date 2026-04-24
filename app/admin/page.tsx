"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
      <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-4xl font-bold text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else setError(data.error ?? "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const today = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const joinedToday = users.filter((u) => new Date(u.createdAt).toDateString() === today).length;
  const joinedWeek = users.filter((u) => new Date(u.createdAt) >= weekAgo).length;

  async function handleDelete(id: string) {
    setDeleting(id);
    setConfirmId(null);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleting(null);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">You must be signed in to access admin.</p>
          <a href="/auth/signin" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-500 transition">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <p className="text-white/60">Access denied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-slate-900/60 backdrop-blur-sm px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-white/35 text-xs mt-0.5">Work Hunter</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/40 text-sm">{session.user?.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={users.length} sub="email sign-ups" />
          <StatCard label="Joined Today" value={joinedToday} />
          <StatCard label="This Week" value={joinedWeek} />
          <StatCard label="Filtered" value={filtered.length} sub={search ? `"${search}"` : "all"} />
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between gap-4">
            <h2 className="text-white font-semibold text-sm">
              Registered Users <span className="text-white/30 font-normal ml-1">({filtered.length})</span>
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-purple-500 w-56 transition"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-white/30 text-sm">
              {search ? "No users match your search." : "No users yet."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 text-xs uppercase tracking-wide border-b border-white/6">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-white/25">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{user.name}</td>
                    <td className="px-5 py-3.5 text-white/55">{user.email}</td>
                    <td className="px-5 py-3.5 text-white/40">
                      {new Date(user.createdAt).toLocaleDateString("he-IL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {confirmId === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-white/40 text-xs">בטוח?</span>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={!!deleting}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {deleting === user.id ? "..." : "מחק"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-white/40 hover:text-white text-xs px-2 py-1.5 transition"
                          >
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(user.id)}
                          className="text-white/25 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-rose-500/10"
                          title="Delete user"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
