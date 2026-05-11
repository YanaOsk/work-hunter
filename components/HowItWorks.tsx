"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function HowItWorks() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  const steps = he
    ? [
        {
          num: "01",
          title: "ספרו לנו עליכם",
          desc: "מעלים קורות חיים או עונים על כמה שאלות קצרות. זה לוקח פחות מ-5 דקות.",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          accent: "#5E6AD2",
        },
        {
          num: "02",
          title: "ה-AI מנתח ומאתר",
          desc: "היועץ שלנו מבין את הפרופיל שלכם ומוצא משרות רלוונטיות עם ניתוח התאמה לכל אחת.",
          icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
          accent: "#4ADE80",
        },
        {
          num: "03",
          title: "יוצאים לדרך",
          desc: "מקבלים תוכנית עבודה ברורה — קורות חיים, אסטרטגיה, ותפקידים שמחכים לכם.",
          icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
          accent: "#5E6AD2",
        },
      ]
    : [
        {
          num: "01",
          title: "Tell us about you",
          desc: "Upload your CV or answer a few quick questions. Takes under 5 minutes.",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          accent: "#5E6AD2",
        },
        {
          num: "02",
          title: "AI matches & analyzes",
          desc: "Our advisor understands your profile and finds relevant jobs with a fit score for each.",
          icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
          accent: "#4ADE80",
        },
        {
          num: "03",
          title: "Get to work",
          desc: "You get a clear action plan — polished CV, search strategy, and roles ready to apply for.",
          icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
          accent: "#5E6AD2",
        },
      ];

  return (
    <section className="py-14 md:py-20 px-4 md:px-6" id="how-it-works">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12" dir={he ? "rtl" : "ltr"}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-[-0.03em]">
            {tx.howItWorksTitle}
          </h2>
          <p className="text-white/45 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {tx.howItWorksSubtitle}
          </p>
        </div>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="relative" dir={he ? "rtl" : "ltr"}>
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-9 start-[calc(16.66%+18px)] end-[calc(16.66%+18px)] h-px bg-white/[0.07]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center md:items-center text-center relative">
                {/* Circle number */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 relative z-10 border-2 text-sm font-bold transition-all duration-300"
                  style={{
                    background: i === 1 ? s.accent : "transparent",
                    borderColor: s.accent,
                    color: i === 1 ? "#0C0C0D" : s.accent,
                  }}
                >
                  {s.num}
                </div>

                <h3 className="text-white font-semibold text-base mb-2 tracking-[-0.01em]">
                  {s.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-[200px]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
