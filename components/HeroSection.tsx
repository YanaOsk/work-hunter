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
    <section className="relative overflow-hidden min-h-[88vh] flex items-center justify-center px-4 pt-12 pb-20 md:py-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(120,40,200,0.22),transparent)]" />
        <div className="absolute top-1/3 -start-40 w-[500px] h-[500px] bg-purple-700/[0.09] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -end-40 w-[400px] h-[400px] bg-violet-600/[0.07] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.12] mb-6 md:mb-7 tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          {tx.heroTitle}
        </h1>

        <p className="text-white/60 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12">
          {tx.heroSubtitle}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-14 md:mb-20">
          <button
            onClick={() => onChoose("advisor")}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold px-9 py-4 rounded-xl transition-all shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.97] text-base"
          >
            {tx.heroPrimaryCta}
          </button>
          <button
            onClick={() => onChoose("jobs")}
            className="w-full sm:w-auto bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.13] hover:border-white/[0.28] text-white font-medium px-9 py-4 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] text-base"
          >
            {tx.heroSecondaryCta}
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5 md:gap-x-16">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-xl md:text-2xl leading-none">{s.value}</span>
              <span className="text-white/38 text-xs tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
