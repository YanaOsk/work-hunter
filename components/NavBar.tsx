"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import LogoMark from "./LogoMark";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

export default function NavBar({ hasPaidPlan = false, plan = "free", planReady = false }: { hasPaidPlan?: boolean; plan?: string; planReady?: boolean }) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = status !== "loading" && session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const isAuthenticated = status === "authenticated";

  const links = [
    ...(!isAuthenticated ? [{ href: "/#how-it-works", label: tx.navHowItWorks }] : []),
    { href: "/cv-builder", label: tx.navCvBuilder },
    { href: "/reviews", label: tx.navReviews },
    ...(isAuthenticated ? [{ href: "/tracker", label: tx.navTracker }] : []),
  ];

  return (
    <nav className="backdrop-blur-2xl border-b border-white/[0.08]" style={{ background: "rgba(12,12,13,0.72)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a
            href={isAuthenticated ? "/profile" : "/"}
            className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition"
          >
            <LogoMark size="sm" />
            <span className="text-white font-semibold tracking-tight">
              Work Hunter
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/70 hover:text-white text-sm transition"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 hover:border-purple-500/40 px-2.5 py-1.5 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Admin
            </Link>
          )}
          <AuthButton plan={plan} />
          {isAuthenticated && (
            <Link
              href="/settings"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/8 border border-transparent hover:border-white/10 transition"
              aria-label={lang === "he" ? "הגדרות" : "Settings"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          )}
          {isAuthenticated && !hasPaidPlan && (
            <Link
              href="/pricing"
              className="hidden sm:inline-flex items-center gap-1.5 text-white text-sm font-semibold px-3.5 py-1.5 rounded-lg transition"
              style={{
                background: "#5E6AD2",
                boxShadow: "0 0 0 1px rgba(94,106,210,0.4), 0 2px 12px rgba(94,106,210,0.25)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
              onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
            >
              Upgrade
            </Link>
          )}
          {!isAuthenticated && planReady && (
            <Link
              href="/advisor?profileId=default-advisor"
              className="hidden sm:inline-flex text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
              style={{
                background: "#5E6AD2",
                boxShadow: "0 0 0 1px rgba(94,106,210,0.4), 0 2px 12px rgba(94,106,210,0.25)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
              onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
            >
              {tx.navStartFree}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/70 hover:text-white p-2"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"} backdrop-blur-2xl border-t border-white/[0.06]`} style={{ background: "rgba(12,12,13,0.96)" }}>
        <div className="px-4 py-3 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/80 hover:text-white py-3 text-sm border-b border-white/5 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-purple-400 py-3 text-sm border-b border-white/5 flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Admin
            </Link>
          )}
          {planReady && !hasPaidPlan && (
            <Link
              href="/advisor?profileId=default-advisor"
              onClick={() => setMobileOpen(false)}
              className="mt-2 text-white font-semibold py-3 rounded-lg transition text-center text-sm"
              style={{ background: "#5E6AD2" }}
            >
              {tx.navStartFree}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
