"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { PLANS } from "@/lib/plans";
import type { Subscription } from "@/lib/subscriptions";

const PLAN_META: Record<string, {
  nameHe: string; nameEn: string;
  borderCls: string; iconCls: string; checkCls: string; priceCls: string;
  glowFrom: string; glowTo: string; badgeCls: string;
}> = {
  weekly: {
    nameHe: "שבועי",      nameEn: "Weekly",
    borderCls: "border-sky-500/40",
    iconCls:   "text-sky-300",
    checkCls:  "text-sky-400",
    priceCls:  "text-sky-200",
    glowFrom:  "from-sky-600/20",
    glowTo:    "to-transparent",
    badgeCls:  "bg-sky-500/15 border-sky-500/30 text-sky-300",
  },
  quarterly: {
    nameHe: "3 חודשים",  nameEn: "3 Months",
    borderCls: "border-purple-500/50",
    iconCls:   "text-purple-300",
    checkCls:  "text-purple-400",
    priceCls:  "text-purple-200",
    glowFrom:  "from-purple-600/25",
    glowTo:    "to-transparent",
    badgeCls:  "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
  lifetime: {
    nameHe: "לצמיתות",   nameEn: "Lifetime",
    borderCls: "border-amber-500/40",
    iconCls:   "text-amber-300",
    checkCls:  "text-amber-400",
    priceCls:  "text-amber-200",
    glowFrom:  "from-amber-600/20",
    glowTo:    "to-transparent",
    badgeCls:  "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
};

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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
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

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription", { method: "PATCH" });
      if (res.ok) {
        setSub((prev) => prev ? { ...prev, savedCard: undefined } : prev);
        setConfirmCancel(false);
        showToast(
          he
            ? `המנוי בוטל — הגישה שלך פעילה עד ${sub?.expiryDate ? formatDate(sub.expiryDate, he) : "סוף התקופה"}`
            : `Cancelled — access active until ${sub?.expiryDate ? formatDate(sub.expiryDate, he) : "end of period"}`
        );
      }
    } catch {
      showToast(he ? "שגיאה — נסה שוב" : "Error — try again");
    } finally {
      setCancelling(false);
    }
  }

  const planMeta = sub ? (PLAN_META[sub.plan] ?? null) : null;
  const planData  = sub ? (PLANS[sub.plan as keyof typeof PLANS] ?? null) : null;

  return (
    <div
      dir={he ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">

        <Link href="/profile" className="text-white/50 hover:text-white text-sm mb-8 inline-block transition">
          {he ? "→ חזרה לפרופיל" : "← Back to profile"}
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
          <div className="rounded-3xl bg-white/5 border border-white/10 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">{he ? "אין מנוי פעיל" : "No active subscription"}</p>
            <p className="text-white/50 text-sm mb-6">{he ? "אתה כרגע בתוכנית החינמית" : "You're currently on the free plan"}</p>
            <Link href="/pricing" className="inline-flex bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition">
              {he ? "צפה במסלולים" : "View plans"}
            </Link>
          </div>
        )}

        {/* ── Active plan card ── */}
        {!loading && sub && planMeta && planData && (
          <div className={`rounded-3xl border ${planMeta.borderCls} overflow-hidden backdrop-blur-sm relative`}>

            {/* Directional glow — appears on the "start" side (right in Hebrew, left in English) */}
            <div className={`absolute inset-y-0 start-0 w-1/2 bg-gradient-to-e ${planMeta.glowFrom} ${planMeta.glowTo} opacity-40 pointer-events-none`} />

            {/* ── Two-column layout ── */}
            <div className="relative grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 [direction:inherit]">

              {/* ── Col 1 (start side): plan identity + price + status + card ── */}
              <div className="p-8 flex flex-col gap-6">

                {/* Plan name + icon */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 ${planMeta.iconCls}`}>
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-2xl font-black ${planMeta.iconCls}`}>
                      {he ? planMeta.nameHe : planMeta.nameEn}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">{he ? "פעיל" : "Active"}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-end gap-2">
                    <span className={`text-5xl font-black tracking-tight ${planMeta.priceCls}`}>
                      {planData.displayPrice}
                    </span>
                    {planData.per && (
                      <span className="text-white/40 text-base mb-1.5">{planData.per}</span>
                    )}
                  </div>
                  {sub.isLifetime && (
                    <p className="text-white/40 text-sm mt-1">{he ? "תשלום חד-פעמי" : "One-time payment"}</p>
                  )}
                </div>

                {/* Renewal / expiry / lifetime */}
                {(sub.isLifetime || sub.expiryDate) && (
                  <div>
                    {sub.isLifetime ? (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${planMeta.badgeCls}`}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {he ? "גישה לכל החיים" : "Lifetime access"}
                      </span>
                    ) : sub.expiryDate ? (
                      <div className="bg-white/5 rounded-2xl px-4 py-3">
                        <p className="text-white/40 text-xs mb-0.5">
                          {sub.savedCard
                            ? (he ? "מתחדש אוטומטית ב" : "Auto-renews on")
                            : (he ? "פעיל עד" : "Active until")}
                        </p>
                        <p className={`text-sm font-semibold ${sub.savedCard ? "text-white" : "text-amber-300"}`}>
                          {formatDate(sub.expiryDate, he)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Card info + cancel */}
                {!sub.isLifetime && (
                  <div className="mt-auto pt-2 border-t border-white/10">
                    {sub.savedCard ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-sm text-white/50">
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span>{sub.savedCard.brand} ****{sub.savedCard.last4}</span>
                          {sub.savedCard.expiry && (
                            <span className="text-white/30">{he ? "תוקף" : "exp"} {sub.savedCard.expiry}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setConfirmCancel(true)}
                          className="text-xs text-red-400/70 hover:text-red-300 transition shrink-0"
                        >
                          {he ? "בטל מנוי" : "Cancel"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-amber-400/80 text-sm">
                        {he
                          ? `המנוי בוטל — הגישה פעילה עד ${sub.expiryDate ? formatDate(sub.expiryDate, he) : "סוף התקופה"}`
                          : `Cancelled — access until ${sub.expiryDate ? formatDate(sub.expiryDate, he) : "end of period"}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Col 2 (end side): features ── */}
              <div className="p-8">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">
                  {he ? "מה כלול במנוי שלך" : "What's included"}
                </p>
                <ul className="space-y-4">
                  {planData.featuresHe.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 shrink-0 mt-0.5 ${planMeta.checkCls}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white/80 text-sm leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {confirmCancel && sub?.expiryDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl" dir={he ? "rtl" : "ltr"}>
            <h3 className="text-white font-semibold text-lg mb-2">
              {he ? "לבטל את המנוי?" : "Cancel subscription?"}
            </h3>
            <p className="text-white/60 text-sm mb-5">
              {he
                ? `המנוי לא יתחדש אוטומטית. הגישה שלך תישאר פעילה עד ${formatDate(sub.expiryDate, he)}.`
                : `Your subscription won't auto-renew. You keep full access until ${formatDate(sub.expiryDate, he)}.`}
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl z-50 text-sm text-center max-w-xs">
          {toast}
        </div>
      )}
    </div>
  );
}
