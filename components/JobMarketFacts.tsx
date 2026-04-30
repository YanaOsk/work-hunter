"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function JobMarketFacts() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const facts: Array<{ title: string; value: string; desc: string; color: string; icon: string }> = [
    {
      title: tx.fact1Title,
      value: tx.fact1Value,
      desc: tx.fact1Desc,
      color: "emerald",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
    },
    {
      title: tx.fact2Title,
      value: tx.fact2Value,
      desc: tx.fact2Desc,
      color: "blue",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    },
    {
      title: tx.fact3Title,
      value: tx.fact3Value,
      desc: tx.fact3Desc,
      color: "purple",
      icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    },
    {
      title: tx.fact4Title,
      value: tx.fact4Value,
      desc: tx.fact4Desc,
      color: "amber",
      icon: "M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a3 3 0 013-3h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: tx.fact5Title,
      value: tx.fact5Value,
      desc: tx.fact5Desc,
      color: "rose",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: tx.fact6Title,
      value: tx.fact6Value,
      desc: tx.fact6Desc,
      color: "sky",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: tx.fact7Title,
      value: tx.fact7Value,
      desc: tx.fact7Desc,
      color: "emerald",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    },
    {
      title: tx.fact8Title,
      value: tx.fact8Value,
      desc: tx.fact8Desc,
      color: "purple",
      icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; value: string }> = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-300", value: "text-emerald-400" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-300", value: "text-blue-400" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-300", value: "text-purple-400" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-300", value: "text-amber-400" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-300", value: "text-rose-400" },
    sky: { bg: "bg-sky-500/10", text: "text-sky-300", value: "text-sky-400" },
  };

  return (
    <section className="py-10 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{tx.factsTitle}</h2>
          <p className="text-white/60 text-sm md:text-base">{tx.factsSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {facts.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-5 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`inline-flex w-9 h-9 rounded-lg ${c.bg} items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                  </svg>
                </div>
                <div className={`text-base md:text-2xl font-bold ${c.value} mb-1`}>{f.value}</div>
                <div className="text-white text-xs font-semibold mb-1 leading-tight">{f.title}</div>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <p className="text-white/30 text-xs text-center">{tx.factsSource}</p>
      </div>
    </section>
  );
}
