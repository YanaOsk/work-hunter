"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import LogoMark from "./LogoMark";
import AuthButton from "./AuthButton";

export default function NavBar() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/#how-it-works", label: tx.navHowItWorks },
    { href: "/cv-builder", label: tx.navCvBuilder },
    { href: "/pricing", label: tx.navPricing },
    { href: "/reviews", label: tx.navReviews },
  ];

  return (
    <nav className="sticky top-[32px] md:top-[36px] z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4">
        <a
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition"
        >
          <LogoMark size="sm" />
          <span className="text-white font-semibold hidden sm:block tracking-tight">
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

        <div className="flex items-center gap-2">
          <AuthButton />
          <Link
            href="/advisor?profileId=default-advisor"
            className="hidden sm:inline-flex bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            {tx.navStartFree}
          </Link>
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

      {mobileOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/5">
          <div className="px-4 py-3 flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 hover:text-white py-2.5 text-sm"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/advisor?profileId=default-advisor"
              onClick={() => setMobileOpen(false)}
              className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-lg transition text-center"
            >
              {tx.navStartFree}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
