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
        <div className="relative overflow-hidden rounded-[10px] bg-white/[0.04] border border-white/[0.1] p-8 sm:p-12 md:p-16 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            {tx.finalCtaTitle}
          </h2>
          <p className="text-white/40 text-sm sm:text-base mb-9 md:mb-11 leading-relaxed max-w-xl mx-auto">
            {tx.finalCtaSubtitle}
          </p>
          <button
            onClick={() => onChoose("advisor")}
            className="bg-[#5e6ad2] hover:bg-[#6d79e8] text-white font-medium px-8 py-3 rounded-[6px] transition-colors duration-150 text-sm"
          >
            {tx.finalCtaButton}
          </button>
        </div>
      </div>
    </section>
  );
}
