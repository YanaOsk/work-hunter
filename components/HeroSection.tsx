"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CountUp from "./CountUp";

interface Props {
  onChoose: (mode: AppMode) => void;
}

function HeroMockup({ he }: { he: boolean }) {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none pointer-events-none" dir="ltr">
      {/* Job match card */}
      <div className="linear-card p-5 mb-3 animate-hero-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white text-sm font-semibold">{he ? "מנהל מוצר בכיר" : "Senior Product Manager"}</p>
            <p className="text-white/40 text-[11px] mt-0.5">monday.com · Tel Aviv</p>
          </div>
          <span className="text-[11px] font-bold text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-full px-2.5 py-0.5 flex-shrink-0">
            94%
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: he ? "התאמת כישורים" : "Skills match", pct: 94, color: "#5E6AD2" },
            { label: he ? "ביקוש בשוק" : "Market demand", pct: 88, color: "#4ADE80" },
          ].map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-white/40 text-[10px]">{label}</span>
                <span className="text-[10px] font-semibold" style={{ color }}>{pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06]">
                <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI message card */}
      <div className="linear-card p-4 animate-hero-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(94,106,210,0.15)" }}>
            <svg style={{ color: "#5E6AD2", width: "12px", height: "12px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-wide">
            {he ? "יועץ קריירה AI" : "Career Advisor AI"}
          </p>
          <div className="ms-auto w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
        </div>
        <p className="text-white/65 text-xs leading-relaxed" dir={he ? "rtl" : "ltr"}>
          {he
            ? "\"על בסיס הניסיון שלך, זיהיתי 3 תפקידים עם התאמה מעל 90%...\""
            : "\"Based on your background, I found 3 roles with over 90% match...\""}
        </p>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-8 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(94,106,210,0.15)" }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(74,222,128,0.10)" }} />
      </div>
    </div>
  );
}

export default function HeroSection({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="relative min-h-[88vh] flex items-center px-4 md:px-6 py-16 md:py-20">
      <div className="max-w-6xl mx-auto w-full">
        <div
          className="grid md:grid-cols-2 gap-10 md:gap-16 items-center"
          dir={he ? "rtl" : "ltr"}
        >
          {/* ── Left: Text ── */}
          <div className="animate-hero-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1 mb-6 border"
              style={{ background: "rgba(94,106,210,0.10)", borderColor: "rgba(94,106,210,0.22)", color: "#5E6AD2" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-pulse" />
              {he ? "יועץ קריירה מבוסס AI · בעברית" : "AI Career Advisor · In Hebrew"}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-white leading-[1.1] tracking-[-0.03em] mb-5">
              {tx.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              {tx.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => onChoose("advisor")}
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
                style={{ background: "#5E6AD2", boxShadow: "0 4px 20px rgba(94,106,210,0.30)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
                onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
              >
                {tx.heroPrimaryCta}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={he ? "M11 17l-5-5m0 0l5-5m-5 5h12" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                </svg>
              </button>
              <button
                onClick={() => onChoose("jobs")}
                className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm border text-white/75 hover:text-white border-white/[0.12] hover:border-white/[0.22] bg-white/[0.04] hover:bg-white/[0.08]"
              >
                {tx.heroSecondaryCta}
              </button>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-6 md:gap-8">
              {[
                { value: 2400, suffix: "+", label: he ? "משתמשים" : "users" },
                { value: 4.8, suffix: "★", label: he ? "דירוג" : "rating", decimals: 1 },
                { value: 100, suffix: "%", label: he ? "בעברית" : "in Hebrew" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-white font-bold text-lg leading-none tracking-tight">
                    <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} duration={1400} />
                  </span>
                  <span className="text-white/35 text-[10px] mt-0.5 uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Product preview ── */}
          <div className="hidden md:flex justify-center">
            <HeroMockup he={he} />
          </div>
        </div>
      </div>
    </section>
  );
}
