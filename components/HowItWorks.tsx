"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const steps = [
    {
      title: tx.howStep1,
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      color: "emerald",
    },
    {
      title: tx.howStep2,
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      color: "purple",
    },
    {
      title: tx.howStep3,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "blue",
    },
    {
      title: tx.howStep5,
      icon: "M3 7h18M3 12h18M3 17h18",
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-300" },
    purple: { bg: "bg-purple-500/15", text: "text-purple-300" },
    blue: { bg: "bg-blue-500/15", text: "text-blue-300" },
    sky: { bg: "bg-sky-500/15", text: "text-sky-300" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-300" },
  };

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {tx.howItWorksTitle}
          </h2>
          <p className="text-white/60 text-sm sm:text-base md:text-lg">{tx.howItWorksSubtitle}</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-7 start-[12%] end-[12%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-purple-500/30 to-amber-500/20" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {steps.map((s, i) => {
              const c = colorMap[s.color];
              return (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div
                    className={`relative z-10 w-14 h-14 rounded-full ${c.bg} backdrop-blur-sm border border-white/10 flex items-center justify-center mb-3`}
                  >
                    <svg
                      className={`w-6 h-6 ${c.text}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={s.icon}
                      />
                    </svg>
                  </div>
                  <div className="text-white/40 text-xs font-mono mb-1">{i + 1}</div>
                  <h3 className="text-white text-sm md:text-base font-semibold leading-snug">
                    {s.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
