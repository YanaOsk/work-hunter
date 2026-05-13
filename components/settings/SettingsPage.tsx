"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import SiteFooter from "@/components/SiteFooter";

interface SubData {
  plan: string;
  purchasedAt?: string;
  expiryDate?: string | null;
  savedCard?: { last4: string; expiry: string; brand: string };
  isLifetime?: boolean;
  isExpired?: boolean;
}

const PLAN_META: Record<string, { he: string; en: string; cls: string }> = {
  free:       { he: "חינמי",          en: "Free",         cls: "text-white/60 bg-white/10 border-white/20" },
  weekly:     { he: "שבועי",          en: "Weekly",        cls: "text-sky-300 bg-sky-500/20 border-sky-500/30" },
  monthly:    { he: "חודשי",          en: "Monthly",       cls: "text-teal-300 bg-teal-500/20 border-teal-500/30" },
  quarterly:  { he: "3 חודשים",      en: "3 Months",      cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
  annual:     { he: "שנתי",           en: "Annual",        cls: "text-amber-300 bg-amber-500/20 border-amber-500/30" },
  "one-time": { he: "קידום קריירה",   en: "Career Boost",  cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
  full:       { he: "מסע מלא",        en: "Full Journey",  cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
};

const CARD_BRANDS: Record<string, string> = {
  Visa: "💳",
  Mastercard: "💳",
  Amex: "💳",
  Default: "💳",
};

export default function SettingsPage() {
  const { lang, toggle } = useLanguage();
  const he = lang === "he";
  const router = useRouter();
  const { status } = useSession();

  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState<boolean | null>(null);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const searchParams = useSearchParams();

  // Change-password form state
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/settings");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Check if Google user (no password to change)
    fetch("/api/auth/change-password")
      .then((r) => r.json())
      .then((d) => setIsGoogleUser(!!d.isGoogleUser))
      .catch(() => setIsGoogleUser(false));

    // Check Google Calendar connection
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then((d) => setCalendarConnected(d.connected))
      .catch(() => setCalendarConnected(false));
  }, [status]);

  // Handle OAuth callback result
  useEffect(() => {
    const calParam = searchParams.get("calendar");
    if (calParam === "connected") {
      setCalendarConnected(true);
      showToast(he ? "יומן Google חובר בהצלחה!" : "Google Calendar connected!");
    } else if (calParam === "error") {
      showToast(he ? "שגיאה בחיבור היומן. נסה שוב." : "Error connecting calendar. Try again.");
    }
  }, [searchParams, he]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCancelPlan() {
    if (!window.confirm(he
      ? "לבטל את המנוי? הגישה תמשיך עד תאריך התפוגה."
      : "Cancel subscription? Access continues until expiry date.")) return;
    setCancellingPlan(true);
    try {
      await fetch("/api/subscription", { method: "DELETE" });
      setSub((prev) => prev ? { ...prev, plan: "free", savedCard: undefined } : { plan: "free" });
      showToast(he ? "המנוי בוטל" : "Subscription cancelled");
    } finally {
      setCancellingPlan(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (pwNew !== pwConfirm) {
      setPwError(he ? "הססמאות החדשות אינן תואמות" : "New passwords don't match");
      return;
    }
    if (pwNew.length < 8) {
      setPwError(he ? "הססמא חייבת להכיל לפחות 8 תווים" : "Password must be at least 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(he ? translatePwError(data.error) : data.error);
        return;
      }
      showToast(he ? "הססמא שונתה בהצלחה" : "Password changed successfully");
      setPwOpen(false);
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } finally {
      setPwLoading(false);
    }
  }

  function translatePwError(err: string): string {
    if (err === "Current password is incorrect") return "הססמא הנוכחית שגויה";
    if (err === "New password must differ from current") return "הססמא החדשה חייבת להיות שונה מהנוכחית";
    if (err === "New password must be at least 8 characters") return "הססמא חייבת להכיל לפחות 8 תווים";
    return "אירעה שגיאה, נסה שנית";
  }

  async function handleConnectCalendar() {
    setCalendarLoading(true);
    try {
      const res = await fetch("/api/calendar/connect");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCalendarLoading(false);
    }
  }

  async function handleDisconnectCalendar() {
    if (!window.confirm(he ? "לנתק את יומן Google?" : "Disconnect Google Calendar?")) return;
    setCalendarLoading(true);
    try {
      await fetch("/api/calendar/status", { method: "DELETE" });
      setCalendarConnected(false);
      showToast(he ? "היומן נותק" : "Calendar disconnected");
    } finally {
      setCalendarLoading(false);
    }
  }

  async function handleRemoveCard() {
    if (!window.confirm(he
      ? "להסיר את אמצעי התשלום? המנוי לא יתחדש אוטומטית בסוף התקופה."
      : "Remove payment method? Subscription won't auto-renew at end of period.")) return;
    setRemovingCard(true);
    try {
      await fetch("/api/subscription", { method: "PATCH" });
      setSub((prev) => prev ? { ...prev, savedCard: undefined } : prev);
      showToast(he ? "אמצעי התשלום הוסר" : "Payment method removed");
    } finally {
      setRemovingCard(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-6 h-6 border-2 border-purple-500/40 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  const planMeta = PLAN_META[sub?.plan ?? "free"] ?? PLAN_META["free"];
  const hasPlan = sub?.plan && sub.plan !== "free";
  const expiryStr = sub?.expiryDate
    ? new Date(sub.expiryDate).toLocaleDateString(he ? "he-IL" : "en-US", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="text-white/30 hover:text-white/70 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={he ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{he ? "הגדרות" : "Settings"}</h1>
          </div>
        </div>

        {/* Subscription card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-white font-semibold">{he ? "המנוי שלי" : "My Subscription"}</h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${planMeta.cls}`}>
                  {he ? planMeta.he : planMeta.en}
                </span>
                {hasPlan && !sub?.isLifetime && (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {he ? "פעיל" : "Active"}
                  </span>
                )}
                {sub?.isLifetime && (
                  <span className="text-amber-400/80 text-xs">{he ? "גישה לצמיתות ✓" : "Lifetime access ✓"}</span>
                )}
              </div>
              {expiryStr && !sub?.isLifetime && (
                <p className="text-white/40 text-sm">
                  {sub?.savedCard
                    ? (he ? `מתחדש אוטומטית ב-${expiryStr}` : `Auto-renews on ${expiryStr}`)
                    : (he ? `בתוקף עד ${expiryStr}` : `Valid until ${expiryStr}`)}
                </p>
              )}
              {sub?.isExpired && (
                <p className="text-rose-400 text-sm">{he ? "המנוי פג תוקף" : "Subscription expired"}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {!hasPlan || sub?.isExpired ? (
                <Link
                  href="/pricing"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
                >
                  {he ? "שדרג" : "Upgrade"}
                </Link>
              ) : !sub?.isLifetime ? (
                <button
                  onClick={handleCancelPlan}
                  disabled={cancellingPlan}
                  className="text-xs text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                >
                  {cancellingPlan ? "..." : (he ? "בטל מנוי" : "Cancel plan")}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Payment method card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-white font-semibold">{he ? "אמצעי תשלום" : "Payment Method"}</h2>
          </div>

          {sub?.savedCard ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-base">
                  {CARD_BRANDS[sub.savedCard.brand] ?? CARD_BRANDS.Default}
                </div>
                <div>
                  <p className="text-white text-sm font-medium" dir="ltr">
                    {sub.savedCard.brand} •••• {sub.savedCard.last4}
                  </p>
                  <p className="text-white/40 text-xs" dir="ltr">
                    {he ? "תוקף" : "Expires"} {sub.savedCard.expiry}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCard}
                disabled={removingCard}
                className="text-xs text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
              >
                {removingCard ? "..." : (he ? "הסר כרטיס" : "Remove card")}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-white/35 text-sm">
                {he ? "אין אמצעי תשלום שמור" : "No saved payment method"}
              </p>
              <p className="text-white/20 text-xs mt-1">
                {he ? "אמצעי תשלום יישמר בעת הרכישה הבאה" : "Payment method saved on next purchase"}
              </p>
            </div>
          )}
        </div>

        {/* Language toggle card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold">{he ? "שפה" : "Language"}</h2>
                <p className="text-white/35 text-xs mt-0.5">
                  {he ? "בחר את שפת הממשק" : "Choose interface language"}
                </p>
              </div>
            </div>

            {/* Segmented toggle */}
            <div className="relative flex items-center bg-white/[0.06] border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => lang !== "he" && toggle()}
                className="relative z-10 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: lang === "he" ? "#5E6AD2" : "transparent",
                  color: lang === "he" ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: lang === "he" ? "0 2px 8px rgba(94,106,210,0.35)" : "none",
                }}
              >
                עברית
              </button>
              <button
                onClick={() => lang !== "en" && toggle()}
                className="relative z-10 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: lang === "en" ? "#5E6AD2" : "transparent",
                  color: lang === "en" ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: lang === "en" ? "0 2px 8px rgba(94,106,210,0.35)" : "none",
                }}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Google Calendar card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#4285F4]/15 border border-[#4285F4]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">{he ? "יומן Google" : "Google Calendar"}</h2>
              <p className="text-white/35 text-xs mt-0.5">
                {he ? "הוסף ראיונות עבודה ישירות ליומן שלך" : "Add job interviews directly to your calendar"}
              </p>
            </div>
          </div>

          {calendarConnected === null ? (
            <div className="h-8 bg-white/5 rounded-lg animate-pulse w-32" />
          ) : calendarConnected ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">
                  {he ? "מחובר" : "Connected"}
                </span>
                <span className="text-white/30 text-xs">
                  {he ? "· יומן Google מחובר ופעיל" : "· Google Calendar is connected"}
                </span>
              </div>
              <button
                onClick={handleDisconnectCalendar}
                disabled={calendarLoading}
                className="text-xs text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
              >
                {calendarLoading ? "..." : (he ? "נתק" : "Disconnect")}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectCalendar}
              disabled={calendarLoading}
              className="flex items-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-[#4285F4]/40 px-4 py-2.5 rounded-xl transition disabled:opacity-50 text-sm font-medium text-white"
            >
              {calendarLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {he ? "חבר יומן Google" : "Connect Google Calendar"}
            </button>
          )}
        </div>

        {/* Change password card — credentials users only */}
        {isGoogleUser === false && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold">{he ? "שינוי ססמא" : "Change Password"}</h2>
                  {!pwOpen && (
                    <p className="text-white/35 text-xs mt-0.5">
                      {he ? "עדכן את ססמת הכניסה שלך" : "Update your login password"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setPwOpen((o) => !o); setPwError(null); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }}
                className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition"
              >
                {pwOpen ? (he ? "סגור" : "Close") : (he ? "שנה" : "Change")}
              </button>
            </div>

            {pwOpen && (
              <form onSubmit={handleChangePassword} className="mt-5 space-y-3" dir={he ? "rtl" : "ltr"}>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-white/50 text-xs mb-1">
                      {he ? "ססמא נוכחית" : "Current password"}
                    </label>
                    <input
                      type="password"
                      value={pwCurrent}
                      onChange={(e) => setPwCurrent(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition"
                      placeholder={he ? "הכנס ססמא נוכחית" : "Enter current password"}
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1">
                      {he ? "ססמא חדשה" : "New password"}
                    </label>
                    <input
                      type="password"
                      value={pwNew}
                      onChange={(e) => setPwNew(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition"
                      placeholder={he ? "לפחות 8 תווים" : "At least 8 characters"}
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1">
                      {he ? "אימות ססמא חדשה" : "Confirm new password"}
                    </label>
                    <input
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/8 transition"
                      placeholder={he ? "הכנס שוב את הססמא החדשה" : "Re-enter new password"}
                    />
                  </div>
                </div>

                {pwError && (
                  <p className="text-rose-400 text-sm">{pwError}</p>
                )}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
                >
                  {pwLoading ? "..." : (he ? "שמור ססמא" : "Save password")}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer note */}
        <p className="text-white/20 text-xs text-center leading-relaxed px-4">
          {he
            ? "אמצעי תשלום שמור מאפשר חידוש אוטומטי של המנוי. הסרתו תמנע חידוש אוטומטי — הגישה תמשיך עד תום התקופה הנוכחית."
            : "A saved payment method enables automatic subscription renewal. Removing it prevents auto-renewal — access continues until end of current period."}
        </p>
      </div>

      <SiteFooter />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 text-white px-5 py-3 rounded-xl shadow-2xl z-50 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
