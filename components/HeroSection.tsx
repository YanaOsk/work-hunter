"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import LogoMark from "./LogoMark";

interface Props {
  onChoose: (mode: AppMode) => void;
}

export default function HeroSection({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute top-1/4 start-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse [animation-duration:6s]" />
        <div className="absolute bottom-1/4 end-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse [animation-duration:8s] [animation-delay:1s]" />
      </div>

      <div className="max-w-4xl text-center relative z-10">
        <div className="flex justify-center mb-8 animate-hero-in [animation-delay:0ms] animate-float">
          <LogoMark size="lg" animate />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.15] mb-6 tracking-tight animate-hero-in [animation-delay:100ms]">
          {tx.heroTitle}
        </h1>

        <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 animate-hero-in [animation-delay:250ms]">
          {tx.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 animate-hero-in [animation-delay:400ms]">
          <button
            onClick={() => onChoose("advisor")}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 group"
          >
            {tx.heroPrimaryCta}
          </button>
          <button
            onClick={() => onChoose("jobs")}
            className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {tx.heroSecondaryCta}
          </button>
        </div>

        <p className="text-white/40 text-xs md:text-sm animate-hero-in [animation-delay:600ms]">
          {tx.trustBar}
        </p>
      </div>
    </section>
  );
}
