"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("שגיאה — נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--background)" }} className="min-h-screen flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-5">
            <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">שכחתי סיסמה</h1>
          <p className="text-white/50 text-sm mt-2">נשלח לכם קישור לאיפוס הסיסמה</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm shadow-2xl shadow-black/30">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-semibold">המייל נשלח!</p>
              <p className="text-white/50 text-sm leading-relaxed">
                אם הכתובת <span className="text-purple-300">{email}</span> רשומה במערכת, ישלח אליה קישור לאיפוס הסיסמה תוך מספר דקות.
              </p>
              <p className="text-white/30 text-xs">תוקף הקישור: שעה אחת</p>
              <Link href="/auth/signin" className="inline-block text-purple-400 hover:text-purple-300 text-sm transition mt-2">
                חזור להתחברות ←
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="כתובת מייל"
                required
                dir="ltr"
                className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm transition"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                שלח קישור לאיפוס
              </button>
              <div className="text-center">
                <Link href="/auth/signin" className="text-white/40 hover:text-white/70 text-sm transition">
                  חזור להתחברות
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
