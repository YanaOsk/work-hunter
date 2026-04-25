"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PLANS, type PlanId, type Plan } from "@/lib/plans";
import { queueAutoStart } from "@/lib/autoStart";

type PayMethod = "card";

interface CardState {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
}

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  return "Visa";
}

export default function CheckoutPage({ planId }: { planId: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const plan: Plan | null = PLANS[planId as PlanId] ?? null;

  const method: PayMethod = "card";
  const [card, setCard] = useState<CardState>({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin");
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#0f0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0f0e1a] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-lg">מסלול לא נמצא</p>
        <button onClick={() => router.push("/pricing")} className="text-purple-400 hover:text-purple-300 transition">
          חזרה לתמחור
        </button>
      </div>
    );
  }

  const digits = card.number.replace(/\s/g, "");
  const cardValid =
    digits.length >= 13 && card.expiry.length === 5 && card.cvv.length >= 3 && card.name.trim().length > 0;

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = { planId };
      // Always save card details when paying by card
      if (method === "card" && digits.length >= 13) {
        body.saveCard = true;
        body.cardLast4 = digits.slice(-4);
        body.cardExpiry = card.expiry;
        body.cardBrand = detectBrand(card.number);
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `שגיאה (${res.status})`);
      }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "שגיאה לא צפויה");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f0e1a] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* Confirmation badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">הרכישה הושלמה!</h1>
          <p className="text-white/60 text-sm mb-1">
            מסלול <span className="text-purple-300 font-semibold">{plan.nameHe}</span> פעיל עכשיו
          </p>
          <p className="text-white/40 text-xs mb-10">מה תרצה/י לעשות עכשיו?</p>

          {/* Mode choice — same pattern as home page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Job search */}
            <button
              onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-3xl p-7 text-right transition-all duration-200 hover:shadow-xl hover:shadow-purple-900/30"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg mb-1">חיפוש עבודה</p>
              <p className="text-white/50 text-sm leading-relaxed">אמצא לך משרות מתאימות עכשיו לפי הפרופיל שלך</p>
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>

            {/* Career advisor */}
            <button
              onClick={() => router.push("/advisor?profileId=default-advisor")}
              className="group relative bg-gradient-to-br from-purple-600/20 via-white/5 to-violet-600/20 hover:from-purple-600/30 hover:to-violet-600/30 border border-purple-500/40 hover:border-purple-500/70 rounded-3xl p-7 text-right transition-all duration-200 hover:shadow-xl hover:shadow-purple-900/40"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg mb-1">ייעוץ תעסוקתי</p>
              <p className="text-white/50 text-sm leading-relaxed">אבחון אישיות, כיוון מקצועי, שיפור CV וראיון מדומה</p>
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </button>
          </div>

          <button
            onClick={() => router.push("/profile")}
            className="text-white/35 hover:text-white/60 text-sm transition"
          >
            לפרופיל שלי
          </button>
        </div>
      </div>
    );
  }

  const priceStr =
    plan.price === 0
      ? "חינם"
      : `${plan.displayPrice}${plan.per ? ` ${plan.per}` : ""}`;

  return (
    <div className="min-h-screen bg-[#0f0e1a] py-10 px-4" dir="rtl">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="text-white/40 hover:text-white/70 transition px-3 py-2 rounded-xl hover:bg-white/5 text-sm"
          >
            חזרה
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">תשלום מאובטח</h1>
            <p className="text-white/40 text-xs">Work Hunter</p>
          </div>
        </div>

        {/* Plan summary card */}
        <div className="bg-[#1a1730] border border-purple-500/25 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/45 text-xs uppercase tracking-wider mb-1">המסלול שנבחר</p>
              <p className="text-white font-bold text-lg">{plan.nameHe}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-300 font-bold text-2xl">{plan.displayPrice}</p>
              {plan.per && <p className="text-white/40 text-xs">{plan.per}</p>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap gap-x-4 gap-y-1">
            {plan.featuresHe.slice(0, 3).map((f) => (
              <p key={f} className="text-white/50 text-xs flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span>{f}
              </p>
            ))}
            {plan.featuresHe.length > 3 && (
              <p className="text-white/30 text-xs">+{plan.featuresHe.length - 3} נוספים</p>
            )}
          </div>
        </div>

        {/* Credit card form */}
        <div className="bg-[#1a1730] border border-white/8 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/8">
            <p className="text-white/50 text-xs uppercase tracking-wider">כרטיס אשראי</p>
          </div>

          <div className="p-5 space-y-4">
              <div>
                <label className="text-white/50 text-xs block mb-1.5">מספר כרטיס</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/60 transition"
                  />
                  {card.number && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-medium">
                      {detectBrand(card.number)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1.5">תוקף (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/60 transition"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1.5">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/60 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs block mb-1.5">שם בעל הכרטיס</label>
                <input
                  type="text"
                  placeholder="ישראל ישראלי"
                  value={card.name}
                  onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/60 transition"
                />
              </div>

              <div className="flex items-start gap-3 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-white/70 text-sm">הכרטיס נשמר לחידוש אוטומטי</p>
                  <p className="text-white/35 text-xs mt-0.5">4 ספרות אחרונות בלבד — לא מאוחסן מידע רגיש</p>
                </div>
              </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || (method === "card" && !cardValid)}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl transition shadow-lg shadow-purple-900/40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              מעבד...
            </span>
          ) : (
            `שלם ${priceStr}`
          )}
        </button>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-4 text-white/25 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            תשלום מאובטח
          </span>
          <span>·</span>
          <span>SSL מוצפן</span>
          <span>·</span>
          <span>PCI DSS</span>
        </div>
      </div>
    </div>
  );
}
