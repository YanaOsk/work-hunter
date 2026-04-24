"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import LogoMark from "./LogoMark";

export default function SiteFooter() {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <footer className="border-t border-white/5 py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <span className="text-white/80 font-semibold tracking-tight">Work Hunter</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link href="/pricing" className="text-white/60 hover:text-white transition">
            {tx.pricingLink}
          </Link>
          <span className="text-white/30 cursor-default">{tx.footerBlog}</span>
          <span className="text-white/30 cursor-default">{tx.footerPrivacy}</span>
          <span className="text-white/30 cursor-default">{tx.footerTerms}</span>
          <span className="text-white/30 cursor-default">{tx.footerContact}</span>
        </nav>
      </div>

      <p className="text-white/30 text-xs text-center mt-8">{tx.footerRights}</p>
    </footer>
  );
}
