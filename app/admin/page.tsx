"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { ltrSpan } from "@/lib/rtl";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AnalyticsData {
  totalPageviews: number;
  totalSessions: number;
  todaySessions: number;
  weekSessions: number;
  topPages: { path: string; views: number; visitors: number }[];
  topCountries: { country: string; countryCode: string; visitors: number }[];
  israelCities: { city: string; visitors: number }[];
  topEvents: { event: string; label: string; count: number }[];
  dailyStats: { date: string; visitors: number; views: number }[];
  topReferrers: { _id: string; count: number }[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
      <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-4xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const FLAG: Record<string, string> = {
  IL: "🇮🇱", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", CA: "🇨🇦",
  AU: "🇦🇺", NL: "🇳🇱", PL: "🇵🇱", RU: "🇷🇺", IN: "🇮🇳", BR: "🇧🇷",
  MX: "🇲🇽", ES: "🇪🇸", IT: "🇮🇹", TR: "🇹🇷", UA: "🇺🇦", SG: "🇸🇬",
};

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("he-IL", { weekday: "short", day: "numeric" });
}

// ─── Analytics tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-sm">
        {error || "No data"}
      </div>
    );
  }

  const maxDailyVisitors = Math.max(...data.dailyStats.map((d) => d.visitors), 1);
  const maxPageViews = Math.max(...data.topPages.map((p) => p.views), 1);
  const maxCountry = Math.max(...data.topCountries.map((c) => c.visitors), 1);
  const maxCity = Math.max(...data.israelCities.map((c) => c.visitors), 1);
  const maxEvent = Math.max(...data.topEvents.map((e) => e.count), 1);

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visitors" value={data.totalSessions} sub="unique sessions" accent="text-purple-300" />
        <StatCard label="Today" value={data.todaySessions} sub="unique visitors" />
        <StatCard label="This Week" value={data.weekSessions} sub="unique visitors" />
        <StatCard label="Total Pageviews" value={data.totalPageviews} />
      </div>

      {/* Daily chart */}
      {data.dailyStats.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">ביקורים — 7 ימים אחרונים</h3>
          <div className="flex items-end gap-2 h-28">
            {data.dailyStats.map((day) => {
              const pct = maxDailyVisitors > 0 ? (day.visitors / maxDailyVisitors) * 100 : 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  <span className="text-white/50 text-[10px]">{day.visitors}</span>
                  <div className="w-full bg-white/10 rounded-t-sm" style={{ height: `${Math.max(pct, 4)}%` }}>
                    <div className="w-full h-full bg-purple-500 rounded-t-sm opacity-80" />
                  </div>
                  <span className="text-white/30 text-[9px] truncate w-full text-center">{dayLabel(day.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        {/* Top pages */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">עמודים פופולריים</h3>
          <div className="space-y-3">
            {data.topPages.map((p) => (
              <div key={p.path}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/70 text-xs font-mono truncate max-w-[60%]">{p.path || "/"}</span>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-white/40 text-[11px]">{p.visitors} visitors</span>
                    <span className="text-white text-xs font-semibold w-10 text-right">{p.views}</span>
                  </div>
                </div>
                <Bar value={p.views} max={maxPageViews} color="bg-purple-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Top events / interactions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">אינטראקציות — לחיצות על כפתורים</h3>
          {data.topEvents.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">עוד אין נתונים — יצטברו עם הזמן</p>
          ) : (
            <div className="space-y-3">
              {data.topEvents.map((ev, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="min-w-0">
                      <span className="text-white/70 text-xs block truncate">{ev.label || ev.event}</span>
                      {ev.label && ev.event !== "button_click" && (
                        <span className="text-white/30 text-[10px]">{ev.event}</span>
                      )}
                    </div>
                    <span className="text-white text-xs font-semibold flex-shrink-0">{ev.count}</span>
                  </div>
                  <Bar value={ev.count} max={maxEvent} color="bg-sky-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">🌍 מדינות</h3>
          {data.topCountries.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">עוד אין נתוני מיקום</p>
          ) : (
            <div className="space-y-3">
              {data.topCountries.map((c) => (
                <div key={c.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs flex items-center gap-1.5">
                      <span>{FLAG[c.countryCode] ?? "🏳️"}</span>
                      {c.country}
                    </span>
                    <span className="text-white text-xs font-semibold">{c.visitors}</span>
                  </div>
                  <Bar value={c.visitors} max={maxCountry} color="bg-emerald-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Israel cities */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">🇮🇱 ערים בישראל</h3>
          {data.israelCities.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">עוד אין ביקורים מישראל</p>
          ) : (
            <div className="space-y-3">
              {data.israelCities.map((c) => (
                <div key={c.city}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">{c.city}</span>
                    <span className="text-white text-xs font-semibold">{c.visitors}</span>
                  </div>
                  <Bar value={c.visitors} max={maxCity} color="bg-amber-400" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Referrers */}
      {data.topReferrers.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">מקורות תנועה (referrers)</h3>
          <div className="space-y-2">
            {data.topReferrers.map((r) => (
              <div key={r._id} className="flex items-center justify-between text-sm">
                <span className="text-white/60 text-xs truncate max-w-[80%] font-mono">{r._id}</span>
                <span className="text-white/80 text-xs font-semibold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (r) => {
        const text = await r.text();
        try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
        catch { throw new Error(`HTTP ${r.status} — non-JSON response`); }
      })
      .then(({ ok, status, data }) => {
        if (!ok) { setError(`${status}: ${data.error ?? "Forbidden"}`); return; }
        if (Array.isArray(data)) setUsers(data);
        else setError(data.error ?? "Unexpected response");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Network error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => users.filter((u) =>
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length} sub="email sign-ups" />
        <StatCard label="Joined Today" value={joinedToday} />
        <StatCard label="This Week" value={joinedWeek} />
        <StatCard label="Filtered" value={filtered.length} sub={search ? `"${search}"` : "all"} />
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-300 text-sm space-y-1">
          {error.includes("MONGODB_URI") ? (
            <>
              <p className="font-semibold">מסד נתונים לא מוגדר</p>
              <p className="text-rose-300/70">הוסיפי <code className="bg-rose-500/20 px-1 rounded">MONGODB_URI</code> ל-.env.local.</p>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
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

        {loading ? (
          <div className="px-5 py-12 text-center text-white/30 text-sm">טוען...</div>
        ) : filtered.length === 0 ? (
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
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 text-white/25">{idx + 1}</td>
                  <td className="px-5 py-3.5 font-medium text-white">{user.name}</td>
                  <td className="px-5 py-3.5 text-white/50">{ltrSpan(user.email)}</td>
                  <td className="px-5 py-3.5 text-white/40">
                    {new Date(user.createdAt).toLocaleDateString("he-IL", { day: "2-digit", month: "short", year: "numeric" })}
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
                        <button onClick={() => setConfirmId(null)} className="text-white/40 hover:text-white text-xs px-2 py-1.5 transition">
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
  );
}

// ─── Main admin page ──────────────────────────────────────────────────────────

type Tab = "users" | "analytics";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("analytics");

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) router.replace("/auth/signin");
  }, [status, isAdmin, router]);

  if (status === "loading" || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-white/30 text-xs mt-0.5">Work Hunter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/40 text-sm hidden sm:block">{session.user?.email ? ltrSpan(session.user.email) : null}</span>
            <ThemeToggle />
            <a href="/" className="text-white/30 hover:text-white/70 text-sm transition px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              בית
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-white/30 hover:text-rose-400 text-sm transition px-3 py-1.5 rounded-lg hover:bg-rose-500/10 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              התנתק
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mt-5 flex items-center gap-1">
          {([
            { id: "analytics", label: "📊 טראפיק ואנליטיקס" },
            { id: "users", label: "👥 משתמשים" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                tab === t.id
                  ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === "analytics" ? <AnalyticsTab /> : <UsersTab />}
      </div>
    </div>
  );
}
