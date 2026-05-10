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
    { value: "4.8★", label: he ? "דירוג ממוצע" : "Avg rating" },
    { value: "50+", label: he ? "תחומי עיסוק" : "Fields" },
    { value: "100%", label: he ? "בעברית" : "In Hebrew" },
  ];

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center px-4 pt-12 pb-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center w-full">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] mb-6 md:mb-7 tracking-tight text-white animate-hero-in">
          {tx.heroTitle}
        </h1>

        <p className="text-white/50 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12 animate-hero-in" style={{ animationDelay: "0.08s" }}>
          {tx.heroSubtitle}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14 md:mb-20 animate-hero-in" style={{ animationDelay: "0.14s" }}>
          <button
            onClick={() => onChoose("advisor")}
            className="w-full sm:w-auto bg-[#5e6ad2] hover:bg-[#6d79e8] text-white font-medium px-8 py-3 rounded-[6px] transition-colors duration-150 text-sm"
          >
            {tx.heroPrimaryCta}
          </button>
          <button
            onClick={() => onChoose("jobs")}
            className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/[0.12] hover:border-white/20 text-white/80 hover:text-white font-medium px-8 py-3 rounded-[6px] transition-all duration-150 text-sm"
          >
            {tx.heroSecondaryCta}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 md:gap-x-16 animate-hero-in" style={{ animationDelay: "0.2s" }}>
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-white font-semibold text-xl md:text-2xl leading-none">{s.value}</span>
              <span className="text-white/35 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
