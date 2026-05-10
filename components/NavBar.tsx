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
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-white/[0.07] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-11 md:h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity duration-150"
          >
            <LogoMark size="sm" />
            <span className="text-white font-semibold text-sm tracking-tight">
              Work Hunter
            </span>
          </a>

          <div className="hidden md:flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/50 hover:text-white/90 text-sm transition-colors duration-150"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/[0.08] px-2.5 py-1.5 rounded-[6px] transition-all duration-150"
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
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-[6px] text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/[0.08] transition-all duration-150"
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
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#5e6ad2] hover:bg-[#6d79e8] text-white text-xs font-medium px-3 py-1.5 rounded-[6px] transition-colors duration-150"
            >
              Upgrade
            </Link>
          )}
          {!isAuthenticated && planReady && (
            <Link
              href="/advisor?profileId=default-advisor"
              className="hidden sm:inline-flex bg-[#5e6ad2] hover:bg-[#6d79e8] text-white text-sm font-medium px-4 py-1.5 rounded-[6px] transition-colors duration-150"
            >
              {tx.navStartFree}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/50 hover:text-white/90 p-1.5 rounded-[6px] hover:bg-white/5 transition-all duration-150"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"} bg-slate-900/98 backdrop-blur-md border-t border-white/[0.07]`}>
        <div className="px-4 py-2 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/60 hover:text-white/90 py-3 text-sm border-b border-white/[0.06] last:border-0 transition-colors duration-150"
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="text-white/50 py-3 text-sm border-b border-white/[0.06] flex items-center gap-2"
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
              className="mt-3 mb-2 bg-[#5e6ad2] hover:bg-[#6d79e8] text-white font-medium py-2.5 rounded-[6px] transition-colors duration-150 text-center text-sm"
            >
              {tx.navStartFree}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
