"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const steps = [
    {
      num: "01",
      title: tx.howStep1,
      desc: tx.toolDiagnosisDesc,
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      num: "02",
      title: tx.howStep2,
      desc: tx.toolDirectionDesc,
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      color: "from-emerald-500 to-teal-500",
    },
    {
      num: "03",
      title: tx.howStep3,
      desc: tx.toolCvDesc,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "from-blue-500 to-sky-500",
    },
    {
      num: "04",
      title: tx.howStep5,
      desc: tx.toolStrategyDesc,
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {tx.howItWorksTitle}
          </h2>
          <p className="text-white/55 text-sm sm:text-base md:text-lg max-w-xl mx-auto">
            {tx.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative group">
              {/* Connecting line (desktop only, not last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 start-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0 -translate-y-0.5" style={{ width: "calc(100% - 56px)", left: "56px" }} />
              )}

              <div className="relative z-10 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 h-full">
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                    </svg>
                  </div>
                  <span className="text-white/20 text-2xl font-bold font-mono leading-none">{s.num}</span>
                </div>

                <h3 className="text-white font-semibold text-base mb-1.5">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
