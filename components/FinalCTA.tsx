"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onChoose: (mode: AppMode) => void;
}

export default function FinalCTA({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <section className="py-16 md:py-28 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-fuchsia-600/10 to-pink-600/15 border border-purple-500/25 p-8 sm:p-12 md:p-16 text-center">
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(168,85,247,0.15),transparent)]" />
          <div className="pointer-events-none absolute -bottom-12 -start-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -top-12 -end-12 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              {tx.finalCtaTitle}
            </h2>
            <p className="text-white/60 text-sm sm:text-base md:text-lg mb-9 md:mb-11 leading-relaxed max-w-xl mx-auto">
              {tx.finalCtaSubtitle}
            </p>
            <button
              onClick={() => onChoose("advisor")}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold px-9 py-4 md:px-14 md:py-5 rounded-xl transition-all shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.04] active:scale-[0.97] text-base md:text-lg"
            >
              {tx.finalCtaButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
