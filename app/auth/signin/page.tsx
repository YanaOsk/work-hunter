"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import WelcomeModal from "@/components/WelcomeModal";

type Tab = "signin" | "register";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function SignInContent() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [welcomeEmail, setWelcomeEmail] = useState("");

  const switchTab = (next: Tab) => {
    setTab(next);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(res.status === 409 ? tx.authEmailExists : data.error || tx.authInvalidCreds);
          setLoading(false);
          return;
        }
        const signInResult = await signIn("credentials", { email, password, redirect: false });
        if (signInResult?.error) {
          setError(tx.authInvalidCreds);
          setLoading(false);
          return;
        }
        setWelcomeName(name);
        setWelcomeEmail(email);
        setShowWelcome(true);
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError(tx.authInvalidCreds);
          setLoading(false);
          return;
        }
        window.location.href = "/profile";
      }
    } catch {
      setError(tx.authInvalidCreds);
      setLoading(false);
    }
  };

  // Greeting text: just the warm subtitle, no "ברוך השב" prefix
  const greeting =
    tab === "signin"
      ? lang === "he"
        ? "שמחים לראות אותך שוב!"
        : "Welcome back!"
      : lang === "he"
      ? "הצטרפות ל-Work Hunter"
      : "Join Work Hunter";

  if (showWelcome) {
    return <WelcomeModal userName={welcomeName} userEmail={welcomeEmail} />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-5">
            <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">{greeting}</h1>
          {tab === "register" && (
            <p className="text-white/50 text-sm mt-2">
              {lang === "he" ? "בנה את תוכנית הקריירה שלך" : "Build your career plan"}
            </p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm shadow-2xl shadow-black/30">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => switchTab("signin")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                tab === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              {tx.authSignInTab}
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-white/55 hover:text-white"
              }`}
            >
              {tx.authRegisterTab}
            </button>
          </div>

          {/* Google OAuth */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/auth/welcome" })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-5 py-3.5 rounded-xl transition shadow-sm"
          >
            <GoogleIcon />
            {tab === "signin" ? tx.signInGoogle : tx.signInGoogleRegister}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">{tx.authOrEmail}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tx.authNamePh}
                required
                autoComplete="name"
                className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm transition"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tx.authEmailPh}
              required
              autoComplete={tab === "register" ? "email" : "username"}
              className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "register" ? tx.authPasswordRegPh : tx.authPasswordPh}
              required
              minLength={6}
              autoComplete={tab === "register" ? "new-password" : "current-password"}
              className="w-full bg-white/5 border border-white/15 focus:border-purple-500 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm transition"
            />

            {error && <p className="text-red-400 text-sm px-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {tab === "signin" ? tx.authSignInBtn : tx.authRegisterBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <Suspense fallback={<div className="min-h-[80vh]" />}>
        <SignInContent />
      </Suspense>
    </div>
  );
}
