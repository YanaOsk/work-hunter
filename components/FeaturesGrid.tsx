"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

const FEATURES = [
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    titleKey: "toolDiagnosis" as const,
    descKey: "toolDiagnosisDesc" as const,
    color: "purple",
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    titleKey: "toolDirection" as const,
    descKey: "toolDirectionDesc" as const,
    color: "emerald",
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    titleKey: "toolCv" as const,
    descKey: "toolCvDesc" as const,
    color: "blue",
  },
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    titleKey: "toolLinkedin" as const,
    descKey: "toolLinkedinDesc" as const,
    color: "sky",
  },
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    titleKey: "toolStrategy" as const,
    descKey: "toolStrategyDesc" as const,
    color: "amber",
  },
  {
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    titleKey: "toolInterview" as const,
    descKey: "toolInterviewDesc" as const,
    color: "rose",
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  purple: { bg: "bg-purple-500/10",  icon: "text-purple-400",  border: "border-purple-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
  blue:   { bg: "bg-blue-500/10",    icon: "text-blue-400",    border: "border-blue-500/20" },
  sky:    { bg: "bg-sky-500/10",     icon: "text-sky-400",     border: "border-sky-500/20" },
  amber:  { bg: "bg-amber-500/10",   icon: "text-amber-400",   border: "border-amber-500/20" },
  rose:   { bg: "bg-rose-500/10",    icon: "text-rose-400",    border: "border-rose-500/20" },
};

export default function FeaturesGrid() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {he ? "כל הכלים. מקום אחד." : "All the tools. One place."}
          </h2>
          <p className="text-white/55 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {he
              ? "מהאבחון הראשוני ועד הראיון המדומה — כל שלב בדרך לעבודה הבאה שלך"
              : "From initial diagnosis to mock interview — every step of your job search journey"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((f, i) => {
            const c = COLOR_MAP[f.color];
            return (
              <div
                key={i}
                className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1.5 text-base">{tx[f.titleKey]}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{tx[f.descKey]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
