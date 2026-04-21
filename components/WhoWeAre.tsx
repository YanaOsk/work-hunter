"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function WhoWeAre() {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
      <div className="max-w-3xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="text-purple-300 text-sm font-medium mb-2 tracking-wide uppercase">
          Work Hunter
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {tx.whoWeAreTitle}
        </h1>

        <div className="space-y-3 text-white/80 text-base md:text-lg leading-relaxed mb-8">
          <p>{tx.whoWeAreLine1}</p>
          <p>{tx.whoWeAreLine2}</p>
          <p className="text-white/90 font-medium">{tx.whoWeAreLine3}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge>{tx.whoWeAreBadgeAllFields}</Badge>
          <Badge>{tx.whoWeAreBadgeHebrew}</Badge>
          <Badge>{tx.whoWeAreBadgePrivate}</Badge>
        </div>

        <div className="mt-12 text-white/30 text-xs animate-bounce">↓</div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-white/80 text-xs md:text-sm">
      {children}
    </span>
  );
}
