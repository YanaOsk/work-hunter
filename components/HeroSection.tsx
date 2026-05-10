"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CountUp from "./CountUp";

interface Props {
  onChoose: (mode: AppMode) => void;
}

/* Mini floating preview cards — purely decorative product showcase */
function FloatingJobCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="linear-card p-3.5 w-56 select-none pointer-events-none"
      style={{ animation: `floatUp 5s ease-in-out ${delay}s infinite` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white text-xs font-semibold leading-tight">Senior Product Manager</p>
          <p className="text-white/40 text-[10px] mt-0.5">monday.com · Tel Aviv</p>
        </div>
        <span className="flex-shrink-0 text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
          92%
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Agile", "B2B", "SaaS"].map((tag) => (
          <span key={tag} className="text-[9px] text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-full px-1.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function FloatingInsightCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="linear-card p-3.5 w-52 select-none pointer-events-none"
      style={{ animation: `floatUp 6s ease-in-out ${delay}s infinite` }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(94,106,210,0.15)" }}>
          <svg style={{ color: "#5E6AD2", width: "11px", height: "11px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-white/60 text-[10px] font-medium uppercase tracking-wide">AI Insight</p>
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Skills match", pct: 88, color: "#5E6AD2" },
          { label: "Market fit", pct: 74, color: "#4ADE80" },
        ].map(({ label, pct, color }) => (
          <div key={label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-white/40 text-[9px]">{label}</span>
              <span className="text-[9px] font-semibold" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-0.5 rounded-full bg-white/[0.06]">
              <div className="h-0.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingScoutCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="linear-card p-3 w-44 select-none pointer-events-none"
      style={{ animation: `floatUp 4.5s ease-in-out ${delay}s infinite` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <p className="text-white/50 text-[9px] uppercase tracking-wide font-medium">Scout Active</p>
      </div>
      <p className="text-white text-sm font-bold leading-none">
        <CountUp to={47} duration={1600} suffix="+" />
      </p>
      <p className="text-white/35 text-[9px] mt-0.5">jobs matched for you</p>
    </div>
  );
}

export default function HeroSection({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center px-4 pt-12 pb-16 md:py-28">
      {/* Radial focus glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_50%_18%,rgba(94,106,210,0.11),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-28 bg-gradient-to-b from-purple-400/25 to-transparent" />
      </div>

      {/* Text + CTAs */}
      <div className="relative z-10 max-w-4xl mx-auto text-center w-full animate-hero-in">
        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 text-xs text-white/55 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          {he ? "מופעל על ידי AI · אוצר הזדמנויות קריירה" : "AI-powered · Career opportunity scout"}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.08] mb-6 md:mb-7 tracking-[-0.04em]">
          <span className="bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-transparent">
            {tx.heroTitle}
          </span>
        </h1>

        <p className="text-white/48 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12 tracking-[-0.01em]" style={{ color: "rgba(255,255,255,0.48)" }}>
          {tx.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 md:mb-16">
          <button
            onClick={() => onChoose("advisor")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-[-0.01em]"
            style={{
              background: "#5E6AD2",
              boxShadow: "0 0 0 1px rgba(94,106,210,0.3), 0 4px 20px rgba(94,106,210,0.28)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
            onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
          >
            {tx.heroPrimaryCta}
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => onChoose("jobs")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.10] hover:border-white/[0.20] text-white/80 hover:text-white font-medium px-8 py-3.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-[-0.01em]"
          >
            {tx.heroSecondaryCta}
          </button>
        </div>

        {/* Stats — CountUp on scroll */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5 md:gap-x-16 mb-16">
          {[
            { value: 2400, suffix: "+", label: he ? "משתמשים" : "Users" },
            { value: 4.8, suffix: "★", label: he ? "דירוג ממוצע" : "Avg rating", decimals: 1 },
            { value: 50,   suffix: "+", label: he ? "תחומי עיסוק" : "Fields" },
            { value: 100,  suffix: "%", label: he ? "בעברית" : "In Hebrew" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-white font-semibold text-xl md:text-2xl leading-none tracking-[-0.03em]">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} duration={1400} />
              </span>
              <span className="text-white/32 text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.32)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating product preview cards ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto hidden md:flex items-end justify-center gap-4 px-4" aria-hidden>
        <div style={{ transform: "rotate(-2deg) translateY(4px)" }}>
          <FloatingInsightCard delay={0.4} />
        </div>
        <div style={{ transform: "translateY(-8px)" }}>
          <FloatingJobCard delay={0} />
        </div>
        <div style={{ transform: "rotate(2deg) translateY(6px)" }}>
          <FloatingScoutCard delay={0.8} />
        </div>
      </div>
    </section>
  );
}
