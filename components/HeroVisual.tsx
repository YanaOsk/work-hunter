"use client";

import Image from "next/image";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none pointer-events-none" style={{ height: "520px" }}>

      {/* ── Background concentric circles (like resume.io) ── */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="absolute w-[420px] h-[420px] rounded-full border border-[#5E6AD2]/[0.07]" />
        <div className="absolute w-[310px] h-[310px] rounded-full border border-[#5E6AD2]/[0.10]" />
        <div className="absolute w-[210px] h-[210px] rounded-full" style={{ background: "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* ── Woman photo ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] w-[190px] h-[190px] rounded-full overflow-hidden border-4 border-white shadow-xl z-10">
        <Image
          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=380&h=380&fit=crop&crop=faces&auto=format&q=80"
          alt="מחפשת עבודה"
          width={190}
          height={190}
          className="object-cover w-full h-full"
          priority
        />
      </div>

      {/* ── Floating card: Resume Score ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ top: "22%", left: "2%", animationDelay: "0.15s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: "#4ADE80" }}>
            91%
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight" dir="rtl">ציון קורות החיים</p>
            <p className="text-[10px] text-gray-400 leading-tight" dir="rtl">מצוין · ATS מוכן</p>
          </div>
        </div>
      </div>

      {/* ── Floating card: ATS badge ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ top: "30%", right: "0%", animationDelay: "0.25s" }}
      >
        <div className="rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-md"
          style={{ background: "#5E6AD2" }}>
          <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white text-[11px] font-semibold whitespace-nowrap" dir="rtl">ATS מושלם</p>
        </div>
      </div>

      {/* ── Floating card: Skills ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ bottom: "24%", right: "0%", animationDelay: "0.35s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-3.5 border border-black/[0.06] min-w-[160px]">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1" dir="rtl">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            כישורים
          </p>
          <div className="space-y-1.5">
            {["ניהול", "חשיבה אנליטית", "מנהיגות"].map((skill) => (
              <div key={skill} className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700 text-right">
                {skill}
              </div>
            ))}
            <button className="text-[10px] text-[#5E6AD2] font-semibold pt-0.5 w-full text-right" style={{ pointerEvents: "none" }}>
              + הוסף כישור
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating card: AI Coach input ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ bottom: "10%", left: "2%", right: "18%", animationDelay: "0.45s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: "conic-gradient(#5E6AD2, #4ADE80, #5E6AD2)" }}>
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
          <p className="text-[11px] text-gray-400 flex-1 text-right" dir="rtl">שאל/י את יועץ ה-AI...</p>
        </div>
      </div>

    </div>
  );
}
