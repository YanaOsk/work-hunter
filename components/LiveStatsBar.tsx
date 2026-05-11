"use client";

import { useLanguage } from "./LanguageProvider";
import CountUp from "./CountUp";

const STATS = [
  {
    value: 421,
    he: "קורות חיים נבנו היום",
    en: "resumes built today",
    color: "#5E6AD2",
  },
  {
    value: 187,
    he: "תוכניות קריירה נבנו מאפס",
    en: "career plans built from scratch",
    color: "#4ADE80",
  },
  {
    value: 1240,
    he: "משרות רלוונטיות נמצאו עבורכם",
    en: "relevant jobs found for users",
    color: "#5E6AD2",
  },
];

function SpinnerIcon({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      style={{ animation: "spin 2.4s linear infinite", flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="8" stroke={color} strokeOpacity="0.18" strokeWidth="2.5" />
      <path
        d="M11 3a8 8 0 0 1 8 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LiveStatsBar() {
  const { lang } = useLanguage();
  const he = lang === "he";

  return (
    <div
      className="border-y border-white/[0.06] bg-white/[0.015] py-5 px-4 md:px-6 overflow-x-auto"
      dir={he ? "rtl" : "ltr"}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 md:gap-12 min-w-max mx-auto">
        {STATS.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
            <SpinnerIcon color={s.color} />
            <p className="text-sm text-white/70 whitespace-nowrap">
              <span
                className="font-bold text-white text-base tabular-nums me-1.5"
                style={{ color: s.color }}
              >
                <CountUp to={s.value} duration={1600} />
              </span>
              {he ? s.he : s.en}
            </p>
            {i < STATS.length - 1 && (
              <div className="hidden md:block w-px h-4 bg-white/[0.10] ms-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
