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
    <section className="py-20 md:py-28 px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-purple-600/15 via-white/5 to-emerald-600/15 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            {tx.finalCtaTitle}
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-8 leading-relaxed">
            {tx.finalCtaSubtitle}
          </p>
          <button
            onClick={() => onChoose("advisor")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 md:px-10 py-4 rounded-xl transition shadow-lg shadow-purple-500/30 text-base md:text-lg"
          >
            {tx.finalCtaButton} →
          </button>
        </div>
      </div>
    </section>
  );
}
