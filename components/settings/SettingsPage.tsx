"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
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
  const { lang } = useLanguage();
  const he = lang === "he";
  const router = useRouter();
  const { status } = useSession();

  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState<boolean | null>(null);

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
  }, [status]);

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
