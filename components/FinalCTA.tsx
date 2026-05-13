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
        <div className="relative overflow-hidden linear-card p-8 sm:p-12 md:p-16 text-center">
          {/* Aurora glow inside card */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(94,106,210,0.08),transparent)]" />
          <div className="pointer-events-none absolute -bottom-16 -start-16 w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(94,106,210,0.06)" }} />
          <div className="pointer-events-none absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(74,222,128,0.05)" }} />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              {tx.finalCtaTitle}
            </h2>
            <p className="text-white/60 text-sm sm:text-base md:text-lg mb-9 md:mb-11 leading-relaxed max-w-xl mx-auto">
              {tx.finalCtaSubtitle}
            </p>
            <button
              onClick={() => onChoose("advisor")}
              className="inline-flex items-center gap-2 bg-[#5E6AD2] hover:bg-[#6D79DB] text-white font-semibold px-6 py-3.5 sm:px-9 sm:py-4 md:px-14 rounded-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.97] text-sm md:text-base tracking-[-0.01em]" style={{ boxShadow: "0 4px 24px rgba(94,106,210,0.30)" }}
            >
              {tx.finalCtaButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
