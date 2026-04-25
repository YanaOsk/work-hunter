"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import type { Subscription } from "@/lib/subscriptions";

const PLAN_META: Record<string, { nameHe: string; nameEn: string; cls: string; iconCls: string }> = {
  weekly:     { nameHe: "שבועי",        nameEn: "Weekly",       cls: "border-sky-500/40 bg-sky-500/10",      iconCls: "text-sky-300" },
  "one-time": { nameHe: "Career Boost", nameEn: "Career Boost", cls: "border-purple-500/50 bg-purple-500/10", iconCls: "text-purple-300" },
  full:       { nameHe: "מסע מלא",      nameEn: "Full Journey", cls: "border-purple-500/50 bg-purple-500/10", iconCls: "text-purple-300" },
  pro:        { nameHe: "Pro",           nameEn: "Pro",          cls: "border-amber-500/40 bg-amber-500/10",  iconCls: "text-amber-300" },
};

function timeAgo(iso: string, he: boolean): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return he ? "היום" : "Today";
  if (days === 1) return he ? "אתמול" : "Yesterday";
  if (days < 7) return he ? `לפני ${days} ימים` : `${days} days ago`;
  if (days < 30) return he ? `לפני ${Math.floor(days / 7)} שבועות` : `${Math.floor(days / 7)} weeks ago`;
  return he ? `לפני ${Math.floor(days / 30)} חודשים` : `${Math.floor(days / 30)} months ago`;
}

function formatDate(iso: string, he: boolean): string {
  return new Date(iso).toLocaleDateString(he ? "he-IL" : "en-US", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function SubscriptionPage() {
  const { lang } = useLanguage();
  const he = lang === "he";
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmRemoveCard, setConfirmRemoveCard] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/auth/signin"); return; }
    if (!session?.user) return;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d?.plan && d.plan !== "free") setSub(d as Subscription); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session?.user, status, router]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRemoveCard() {
    setRemovingCard(true);
    try {
      const res = await fetch("/api/subscription", { method: "PATCH" });
      if (res.ok) {
        setSub((prev) => prev ? { ...prev, savedCard: undefined } : prev);
        setConfirmRemoveCard(false);
        showToast(he ? "הכרטיס הוסר — המנוי לא יתחדש אוטומטית" : "Card removed — subscription won't auto-renew");
      }
    } catch {
      showToast(he ? "שגיאה — נסה שוב" : "Error — try again");
    } finally {
      setRemovingCard(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" });
      if (res.ok) {
        setSub(null);
        setConfirmCancel(false);
        showToast(he ? "המנוי בוטל בהצלחה" : "Subscription cancelled");
      }
    } catch {
      showToast(he ? "שגיאה — נסה שוב" : "Error — try again");
    } finally {
      setCancelling(false);
    }
  }

  const planMeta = sub ? (PLAN_META[sub.plan] ?? null) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Back */}
        <Link href="/profile" className="text-white/50 hover:text-white text-sm mb-8 inline-block transition">
          {he ? "חזרה לפרופיל" : "Back to profile"}
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">{he ? "המנוי שלי" : "My Subscription"}</h1>

        {/* Loading */}
        {(loading || status === "loading") && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* No paid plan */}
        {!loading && !sub && (
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">{he ? "אין מנוי פעיל" : "No active subscription"}</p>
            <p className="text-white/50 text-sm mb-6">{he ? "אתה כרגע בתוכנית החינמית" : "You're currently on the free plan"}</p>
            <Link
              href="/pricing"
              className="inline-flex bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              {he ? "צפה במסלולים" : "View plans"}
            </Link>
          </div>
        )}

        {/* Active plan card */}
        {!loading && sub && planMeta && (
          <div className={`rounded-3xl border p-8 ${planMeta.cls}`}>
            <div className="flex items-center gap-4 mb-7">
              <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center ${planMeta.iconCls}`}>
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className={`text-2xl font-bold ${planMeta.iconCls}`}>
                  {he ? planMeta.nameHe : planMeta.nameEn}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-400 text-sm font-medium">{he ? "פעיל" : "Active"}</span>
                  </div>
                  {sub.isLifetime && (
                    <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
                      {he ? "גישה לכל החיים" : "Lifetime"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8 border-t border-white/10 pt-6">
              {sub.purchasedAt && (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {he ? `נרכש ${timeAgo(sub.purchasedAt, he)}` : `Purchased ${timeAgo(sub.purchasedAt, he)}`}
                </div>
              )}
              {/* Renewal / Expiry info */}
              {sub.isLifetime ? (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-emerald-300">{he ? "לא פג תוקף — תשלום חד-פעמי" : "Never expires — one-time payment"}</span>
                </div>
              ) : sub.expiryDate ? (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {he
                    ? `מתחדש אוטומטית ב-${formatDate(sub.expiryDate, he)}`
                    : `Auto-renews on ${formatDate(sub.expiryDate, he)}`}
                </div>
              ) : null}
              {sub.savedCard ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {sub.savedCard.brand} ****{sub.savedCard.last4}
                    {sub.savedCard.expiry && (
                      <span className="text-white/30">· {he ? "תוקף" : "exp"} {sub.savedCard.expiry}</span>
                    )}
                  </div>
                  {!sub.isLifetime && (
                    <button
                      onClick={() => setConfirmRemoveCard(true)}
                      className="text-xs text-red-400/70 hover:text-red-300 transition shrink-0"
                    >
                      {he ? "הסר כרטיס" : "Remove card"}
                    </button>
                  )}
                </div>
              ) : !sub.isLifetime ? (
                <div className="flex items-center gap-3 text-sm text-amber-400/80">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{he ? "אין כרטיס שמור — המנוי לא יתחדש" : "No saved card — won't auto-renew"}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!sub.isLifetime && (
                <Link
                  href="/pricing"
                  className="flex-1 text-center py-2.5 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-medium transition"
                >
                  {he ? "שנה תוכנית" : "Change plan"}
                </Link>
              )}
              {!sub.isLifetime && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400/80 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/5 text-sm font-medium transition"
                >
                  {he ? "בטל חידוש אוטומטי" : "Cancel auto-renewal"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              {he ? "לבטל חידוש אוטומטי?" : "Cancel auto-renewal?"}
            </h3>
            <p className="text-white/60 text-sm mb-5">
              {he
                ? "החידוש האוטומטי יבוטל. תשמור על הגישה עד סוף תקופת המנוי הנוכחית."
                : "Auto-renewal will be cancelled. You keep access until the current period ends."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white text-sm transition"
              >
                {he ? "לא, השאר" : "Keep plan"}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {cancelling ? "..." : (he ? "כן, בטל" : "Yes, cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove card modal */}
      {confirmRemoveCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">
              {he ? "להסיר את הכרטיס?" : "Remove saved card?"}
            </h3>
            <p className="text-white/60 text-sm mb-5">
              {he
                ? "הכרטיס יוסר מהמערכת. המנוי יישאר פעיל עד סוף התקופה הנוכחית, אך לא יתחדש אוטומטית."
                : "The card will be removed. Your subscription stays active until the end of the current period, but won't auto-renew."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemoveCard(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white text-sm transition"
              >
                {he ? "ביטול" : "Cancel"}
              </button>
              <button
                onClick={handleRemoveCard}
                disabled={removingCard}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {removingCard ? "..." : (he ? "הסר כרטיס" : "Remove card")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
