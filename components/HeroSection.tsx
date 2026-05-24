"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CountUp from "./CountUp";
import HeroVisual from "./HeroVisual";

interface Props {
  onChoose: (mode: AppMode) => void;
}


export default function HeroSection({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="relative min-h-[88vh] flex items-center px-4 md:px-6 py-16 md:py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div
          className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
          dir={he ? "rtl" : "ltr"}
        >
          {/* ── Left: Text ── */}
          <div className="animate-hero-in">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-white leading-[1.1] tracking-[-0.03em] mb-5">
              {tx.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              {tx.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => onChoose("advisor")}
                className="inline-flex items-center justify-center gap-2 text-white text-on-color font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
                style={{ background: "#5E6AD2", boxShadow: "0 4px 20px rgba(94,106,210,0.30)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
                onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
              >
                {tx.heroPrimaryCta}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={he ? "M11 17l-5-5m0 0l5-5m-5 5h12" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                </svg>
              </button>
              <button
                onClick={() => onChoose("jobs")}
                className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm border text-white/75 hover:text-white border-white/[0.12] hover:border-white/[0.22] bg-white/[0.04] hover:bg-white/[0.08]"
              >
                {tx.heroSecondaryCta}
              </button>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
              {[
                { value: 2400, suffix: "+", label: he ? "משתמשים" : "users" },
                { value: 4.8, suffix: "★", label: he ? "דירוג" : "rating", decimals: 1 },
                { value: 100, suffix: "%", label: he ? "בעברית" : "in Hebrew" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-white font-bold text-lg leading-none tracking-tight">
                    <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} duration={1400} />
                  </span>
                  <span className="text-white/35 text-[11px] mt-0.5 uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product visual ── */}
          <div className="hidden md:flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
