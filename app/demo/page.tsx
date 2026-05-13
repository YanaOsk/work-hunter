"use client";

import { ShaderBackground } from "@/components/ui/hero-shader";
import HeroVisual from "@/components/HeroVisual";
import CountUp from "@/components/CountUp";
import Link from "next/link";

// ─── Stub sections to show the full page rhythm ───────────────────────────────

function StatsBar() {
  return (
    <div className="border-y border-white/[0.06] bg-white/[0.02] py-4 px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-2">
        {[
          { label: "משרות חיות", value: "48,200+" },
          { label: "מועמדים בוגרים", value: "2,400+" },
          { label: "ציון התאמה ממוצע", value: "91%" },
          { label: "זמן תגובה ממוצע", value: "< 3 ימים" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">{s.value}</span>
            <span className="text-white/40">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ label }: { label: string }) {
  return (
    <div className="border border-dashed border-white/10 rounded-2xl mx-auto max-w-4xl my-16 py-14 flex items-center justify-center">
      <span className="text-white/20 text-sm tracking-widest uppercase">{label}</span>
    </div>
  );
}

// ─── Demo page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0D0F1A" }}>

      {/* ── Banner ── */}
      <div className="sticky top-0 z-50 bg-[#5E6AD2]/90 backdrop-blur text-white text-center py-2 text-xs font-medium tracking-wide">
        🎨 עמוד דמו — כך ייראה דף הבית החדש &nbsp;·&nbsp;
        <Link href="/" className="underline underline-offset-2 opacity-80 hover:opacity-100">
          חזרה לאתר האמיתי
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════
          HERO — עטוף בשיידר
      ══════════════════════════════════════════════════ */}
      <ShaderBackground>
        <section className="relative min-h-[88vh] flex items-center px-4 md:px-6 py-16 md:py-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center" dir="rtl">

              {/* Text */}
              <div className="animate-hero-in">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 border border-white/10 text-xs text-white/70"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  יועץ קריירה AI · ישראלי · 100% בעברית
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-white leading-[1.1] tracking-[-0.03em] mb-5">
                  מצא את המשרה<br />
                  <span style={{ color: "#7B8CE0" }}>שמחכה לך</span>
                </h1>

                <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                  יועץ ה-AI שלנו מנתח את הפרופיל שלך, מתאים משרות, ומלווה אותך לאורך כל תהליך החיפוש — מקורות חיים ועד ראיון.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <button
                    className="inline-flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02]"
                    style={{ background: "#5E6AD2", boxShadow: "0 4px 20px rgba(94,106,210,0.35)" }}
                  >
                    התחל עם יועץ ה-AI
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 rounded-xl text-sm border text-white/75 hover:text-white border-white/[0.12] hover:border-white/[0.22] bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    חפש משרות
                  </button>
                </div>

                {/* Trust stats */}
                <div className="flex items-center gap-6 md:gap-8">
                  {[
                    { value: 2400, suffix: "+", label: "משתמשים" },
                    { value: 4.8, suffix: "★", label: "דירוג", decimals: 1 },
                    { value: 100, suffix: "%", label: "בעברית" },
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

              {/* Visual */}
              <div className="hidden md:flex justify-center">
                <HeroVisual />
              </div>
            </div>
          </div>
        </section>
      </ShaderBackground>

      {/* ── שאר הדף (placeholder) ── */}
      <div className="relative z-10 px-6">
        <StatsBar />
        <SectionBlock label="ServicesIntro — מה Work Hunter עושה" />
        <SectionBlock label="HowItWorks — איך זה עובד" />
        <SectionBlock label="ReviewCarousel — ביקורות משתמשים" />
        <SectionBlock label="FinalCTA — קריאה לפעולה סופית" />

        <div className="text-center py-16 text-white/20 text-xs tracking-widest uppercase border-t border-white/[0.05] mt-8">
          Footer
        </div>
      </div>
    </div>
  );
}
