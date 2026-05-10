"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

const FEATURES = [
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    titleKey: "toolDiagnosis" as const,
    descKey: "toolDiagnosisDesc" as const,
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    titleKey: "toolDirection" as const,
    descKey: "toolDirectionDesc" as const,
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    titleKey: "toolCv" as const,
    descKey: "toolCvDesc" as const,
  },
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    titleKey: "toolLinkedin" as const,
    descKey: "toolLinkedinDesc" as const,
  },
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    titleKey: "toolStrategy" as const,
    descKey: "toolStrategyDesc" as const,
  },
  {
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    titleKey: "toolInterview" as const,
    descKey: "toolInterviewDesc" as const,
  },
];

export default function FeaturesGrid() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {he ? "כל הכלים. מקום אחד." : "All the tools. One place."}
          </h2>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {he
              ? "מהאבחון הראשוני ועד הראיון המדומה — כל שלב בדרך לעבודה הבאה שלכם"
              : "From initial diagnosis to mock interview — every step of your job search journey"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.14] rounded-[8px] p-5 transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-[6px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/15 flex items-center justify-center mb-4">
                <svg className="w-4.5 h-4.5 text-[#818cf8]" style={{ width: "1.125rem", height: "1.125rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-1.5 text-sm">{tx[f.titleKey]}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{tx[f.descKey]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
