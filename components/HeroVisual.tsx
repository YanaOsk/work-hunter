"use client";

import Image from "next/image";

export default function HeroVisual() {
  return (
    <div
      className="relative w-full max-w-[480px] mx-auto select-none pointer-events-none"
      style={{ height: "520px" }}
    >
      {/* ── Concentric arcs — top right ── */}
      <div
        className="absolute pointer-events-none"
        style={{ top: "-20px", right: "-18px", width: "320px", height: "320px" }}
        aria-hidden
      >
        <div className="absolute inset-0 rounded-full border border-[#5E6AD2]/[0.11]" />
        <div className="absolute rounded-full border border-[#5E6AD2]/[0.14]" style={{ inset: "42px" }} />
        <div
          className="absolute rounded-full"
          style={{
            inset: "84px",
            background: "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── CV Document card ── */}
      <div
        className="absolute bg-white rounded-2xl overflow-hidden z-10 animate-hero-in"
        style={{
          left: "6px",
          top: "48px",
          width: "256px",
          height: "396px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {/* Name & title */}
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-[17px] font-bold leading-tight" style={{ color: "#5E6AD2" }} dir="rtl">
            מיה כהן
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5" dir="rtl">מנהלת מוצר בכירה</p>
        </div>

        {/* Bio */}
        <div className="px-5 pb-3">
          <p className="text-[8.5px] text-gray-500 leading-relaxed" dir="rtl">
            מנהלת מוצר בעלת ניסיון של 7 שנים בפיתוח מוצרים דיגיטליים.
            מתמחה בניהול אסטרטגי ושיתוף פעולה עם צוותי פיתוח ועיצוב.
            ניסיון מוכח בהובלת פרויקטים מהרעיון ועד השקה.
          </p>
        </div>

        <div className="mx-5 border-t border-gray-100" />

        {/* Employment History */}
        <div className="px-5 pt-3">
          <h4
            className="text-[9.5px] font-bold mb-2.5"
            style={{ color: "#5E6AD2" }}
            dir="rtl"
          >
            היסטוריית תעסוקה
          </h4>

          <div dir="rtl" className="mb-3">
            <p className="text-[9px] font-semibold text-gray-700">Walla! — תל אביב</p>
            <p className="text-[8px] text-gray-400 mb-1">ינואר 2021 — היום</p>
            <ul className="space-y-0.5">
              {["ניהול מפת דרכים ואסטרטגיית מוצר", "שיתוף פעולה עם צוותים רב-תחומיים"].map((item) => (
                <li key={item} className="text-[8px] text-gray-500 flex items-start gap-1 justify-end">
                  {item}
                  <span className="mt-0.5 text-[#5E6AD2] flex-shrink-0">•</span>
                </li>
              ))}
            </ul>
          </div>

          <div dir="rtl">
            <p className="text-[9px] font-semibold text-gray-700">Monday.com — תל אביב</p>
            <p className="text-[8px] text-gray-400 mb-1">מרץ 2018 — דצמבר 2020</p>
            <ul className="space-y-0.5">
              <li className="text-[8px] text-gray-500 flex items-start gap-1 justify-end">
                פיתוח פיצ'רים חדשים ושיפור חוויית משתמש
                <span className="mt-0.5 text-[#5E6AD2] flex-shrink-0">•</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── Woman photo ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ top: "18px", right: "55px", animationDelay: "0.1s" }}
      >
        <div
          className="w-[132px] h-[132px] rounded-full overflow-hidden"
          style={{
            border: "4px solid white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=264&h=264&fit=crop&crop=faces&auto=format&q=80"
            alt="מחפשת עבודה"
            width={132}
            height={132}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>

      {/* ── Floating: Resume Score ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ top: "34%", left: "0%", animationDelay: "0.15s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: "#4ADE80" }}
          >
            81%
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight" dir="rtl">
              ציון קורות חיים
            </p>
            <p className="text-[10px] text-gray-400 leading-tight" dir="rtl">
              מצוין · ATS מוכן
            </p>
          </div>
        </div>
      </div>

      {/* ── Floating: ATS badge ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ top: "43%", right: "0%", animationDelay: "0.25s" }}
      >
        <div
          className="rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-md"
          style={{ background: "#5E6AD2" }}
        >
          <svg
            className="w-3.5 h-3.5 text-white/80 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-white text-[11px] font-semibold whitespace-nowrap" dir="rtl">
            ATS מושלם
          </p>
        </div>
      </div>

      {/* ── Floating: Skills ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ bottom: "22%", right: "0%", animationDelay: "0.35s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-3.5 border border-black/[0.06] min-w-[160px]">
          <p
            className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1"
            dir="rtl"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            כישורים
          </p>
          <div className="space-y-1.5">
            {["ניהול", "חשיבה אנליטית", "מנהיגות"].map((skill) => (
              <div
                key={skill}
                className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700 text-right"
              >
                {skill}
              </div>
            ))}
            <button
              className="text-[10px] text-[#5E6AD2] font-semibold pt-0.5 w-full text-right"
              style={{ pointerEvents: "none" }}
            >
              + הוסף כישור
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating: AI Coach ── */}
      <div
        className="absolute z-20 animate-hero-in"
        style={{ bottom: "8%", left: "2%", right: "18%", animationDelay: "0.45s" }}
      >
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: "conic-gradient(#5E6AD2, #4ADE80, #5E6AD2)" }}
          >
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
          <p className="text-[11px] text-gray-400 flex-1 text-right" dir="rtl">
            שאל/י את יועץ ה-AI...
          </p>
        </div>
      </div>
    </div>
  );
}
