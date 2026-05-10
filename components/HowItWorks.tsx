"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  const steps = [
    {
      num: "01",
      title: tx.howStep1,
      desc: tx.toolDiagnosisDesc,
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      accent: "#5E6AD2",
    },
    {
      num: "02",
      title: tx.howStep2,
      desc: tx.toolDirectionDesc,
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      accent: "#4ADE80",
    },
    {
      num: "03",
      title: tx.howStep3,
      desc: tx.toolCvDesc,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      accent: "#5E6AD2",
    },
    {
      num: "04",
      title: tx.howStep5,
      desc: tx.toolStrategyDesc,
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      accent: "#4ADE80",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-10 md:mb-14" dir={he ? "rtl" : "ltr"}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-mono font-semibold text-white/20 tracking-widest tabular-nums">2.0</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
              {he ? "תהליך" : "PROCESS"}
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-[-0.03em]">
            {tx.howItWorksTitle}
          </h2>
          <p className="text-white/45 text-sm sm:text-base max-w-lg leading-relaxed">
            {tx.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={i} className="group relative linear-card p-5 md:p-6 overflow-hidden" style={{ animation: `staggerIn 0.5s ease both`, animationDelay: `${i * 100}ms` }}>
              {/* Step number — faint watermark */}
              <span
                className="absolute top-4 end-4 text-5xl font-bold leading-none select-none"
                style={{ color: s.accent + "0D" }}
              >
                {s.num}
              </span>

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: s.accent + "15", border: `1px solid ${s.accent}22` }}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  style={{ color: s.accent, width: "18px", height: "18px" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>

              {/* Step label */}
              <p className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1.5" style={{ color: s.accent + "90" }}>
                {he ? "שלב" : "Step"} {s.num}
              </p>

              <h3 className="text-white font-semibold text-sm mb-2 tracking-[-0.01em] leading-snug">
                {s.title}
              </h3>
              <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>

              {/* Connector line on desktop — not last item */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-[42px] start-full w-3 h-px opacity-20"
                  style={{ background: s.accent }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
