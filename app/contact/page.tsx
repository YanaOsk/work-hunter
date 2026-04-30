"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";

export default function ContactPage() {
  const { lang } = useLanguage();
  const he = lang === "he";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setError(he ? "שגיאה בשליחה, נסי שוב" : "Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-10 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {he ? "חזרה" : "Back"}
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {he ? "צור קשר" : "Contact Us"}
          </h1>
          <p className="text-white/50 text-base leading-relaxed">
            {he
              ? "נשמח לשמוע ממך — שאלה, הצעה או כל בעיה שנתקלת בה."
              : "We'd love to hear from you — a question, suggestion, or any issue you've encountered."}
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-600/15 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-300 font-semibold text-lg mb-1">
              {he ? "הפנייה נשלחה!" : "Message sent!"}
            </p>
            <p className="text-white/50 text-sm">
              {he ? "נחזור אליך בהקדם האפשרי." : "We'll get back to you as soon as possible."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir={he ? "rtl" : "ltr"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  {he ? "שם מלא" : "Full name"} *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={he ? "ישראל ישראלי" : "Jane Smith"}
                  className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">
                  {he ? "כתובת מייל" : "Email address"} *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                {he ? "נושא" : "Subject"}
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={he ? "על מה תרצה לדבר?" : "What's this about?"}
                className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1.5">
                {he ? "הודעה" : "Message"} *
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder={he ? "כתוב כאן את הפנייה שלך..." : "Write your message here..."}
                className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none text-sm transition resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading
                ? (he ? "שולח..." : "Sending...")
                : (he ? "שלח פנייה" : "Send message")}
            </button>
          </form>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
