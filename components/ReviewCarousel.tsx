"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { REVIEWS } from "@/lib/reviews";

const AVATAR_COLORS = [
  "from-purple-600 to-fuchsia-600",
  "from-emerald-600 to-teal-600",
  "from-blue-600 to-sky-600",
  "from-rose-600 to-pink-600",
  "from-amber-600 to-orange-600",
  "from-sky-600 to-cyan-600",
];

/* Pick 9 diverse reviews to feature */
const FEATURED_IDS = ["1", "2", "3", "5", "6", "8", "9", "10", "11"];
const featured = REVIEWS.filter((r) => FEATURED_IDS.includes(r.id)).slice(0, 9);
const CARDS_PER_SLIDE = 3; // desktop
const TOTAL_SLIDES = Math.ceil(featured.length / CARDS_PER_SLIDE);

function ReviewCard({ review, lang }: { review: (typeof REVIEWS)[0]; lang: string }) {
  const name    = lang === "he" ? review.nameHe : review.nameEn;
  const title   = lang === "he" ? review.titleHe : review.titleEn;
  const body    = lang === "he" ? review.bodyHe : review.bodyEn;
  const city    = lang === "he" ? review.cityHe : review.cityEn;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const gradient = AVATAR_COLORS[parseInt(review.id) % AVATAR_COLORS.length];

  return (
    <div className="linear-card p-5 flex flex-col h-full">
      <div className="flex gap-0.5 mb-3">
        {"★".repeat(review.rating).split("").map((s, i) => (
          <span key={i} className="text-amber-400 text-xs">{s}</span>
        ))}
      </div>
      <p className="text-white/85 text-sm font-semibold leading-snug mb-2 tracking-[-0.01em] line-clamp-2">
        {title}
      </p>
      <p className="text-white/45 text-xs leading-relaxed flex-1 line-clamp-4">{body}</p>
      <div className="flex items-center gap-2.5 pt-4 mt-4 border-t border-white/[0.06]">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white/80 text-xs font-medium truncate">{name}</p>
          <p className="text-white/35 text-[10px] truncate">{review.age} · {city}</p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewCarousel() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setSlide(idx);
    setTimeout(() => setAnimating(false), 400);
  }, [animating]);

  const next = useCallback(() => goTo((slide + 1) % TOTAL_SLIDES), [goTo, slide]);
  const prev = useCallback(() => goTo((slide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES), [goTo, slide]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  const slideCards = featured.slice(slide * CARDS_PER_SLIDE, slide * CARDS_PER_SLIDE + CARDS_PER_SLIDE);

  return (
    <section
      className="py-14 md:py-24 px-4 md:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 md:mb-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
              {lang === "he" ? "ביקורות" : "TESTIMONIALS"}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-[-0.03em]">
              {tx.reviewsHomeTitle}
            </h2>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-amber-400 text-base">★</span>
            <span className="text-white font-semibold text-sm">4.8</span>
            <span className="text-white/30 text-xs">/ 5</span>
          </div>
        </div>

        {/* Cards grid — fade in/out */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 transition-opacity duration-400"
          style={{ opacity: animating ? 0 : 1, transition: "opacity 0.35s ease" }}
        >
          {slideCards.map((r) => (
            <ReviewCard key={r.id} review={r} lang={lang} />
          ))}
          {/* Fill empty slots on desktop */}
          {slideCards.length < CARDS_PER_SLIDE &&
            Array.from({ length: CARDS_PER_SLIDE - slideCards.length }).map((_, i) => (
              <div key={`empty-${i}`} className="hidden lg:block" />
            ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === slide ? "20px" : "6px",
                  height: "6px",
                  background: i === slide ? "#5E6AD2" : "rgba(255,255,255,0.2)",
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
