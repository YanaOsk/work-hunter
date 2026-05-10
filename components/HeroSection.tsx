"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onChoose: (mode: AppMode) => void;
}

export default function HeroSection({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  const stats = [
    { value: "2,400+", label: he ? "משתמשים" : "Users" },
    { value: "4.8★",   label: he ? "דירוג ממוצע" : "Avg rating" },
    { value: "50+",    label: he ? "תחומי עיסוק" : "Fields" },
    { value: "100%",   label: he ? "בעברית" : "In Hebrew" },
  ];

  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center justify-center px-4 pt-12 pb-20 md:py-32">
      {/* Radial focus glow behind headline */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(94,106,210,0.10),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-purple-400/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center w-full animate-hero-in">

        {/* Linear-style badge pill */}
        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 text-xs text-white/60 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {he ? "מופעל על ידי AI • אוצר הזדמנויות קריירה" : "AI-powered • Career opportunity scout"}
        </div>

        {/* Headline — Linear uses near-white with very tight tracking */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.08] mb-6 md:mb-7 tracking-[-0.04em]">
          <span className="bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
            {tx.heroTitle}
          </span>
        </h1>

        <p className="text-white/50 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12 tracking-[-0.01em]">
          {tx.heroSubtitle}
        </p>

        {/* CTA buttons — Linear style */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14 md:mb-20">
          <button
            onClick={() => onChoose("advisor")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5E6AD2] hover:bg-[#6D79DB] text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-[rgba(94,106,210,0.25)] hover:shadow-[rgba(94,106,210,0.40)] hover:scale-[1.02] active:scale-[0.98] text-sm tracking-[-0.01em]"
          >
            {tx.heroPrimaryCta}
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => onChoose("jobs")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] hover:border-white/[0.20] text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-[-0.01em]"
          >
            {tx.heroSecondaryCta}
          </button>
        </div>

        {/* Stats row — Linear minimal style */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-12">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-white font-semibold text-lg md:text-xl leading-none tracking-[-0.02em]">
                {s.value}
              </span>
              <span className="text-white/35 text-[11px] tracking-wide uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
