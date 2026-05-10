"use client";

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

function ReviewCard({ review, lang }: { review: (typeof REVIEWS)[0]; lang: string }) {
  const name = lang === "he" ? review.nameHe : review.nameEn;
  const title = lang === "he" ? review.titleHe : review.titleEn;
  const body = lang === "he" ? review.bodyHe : review.bodyEn;
  const city = lang === "he" ? review.cityHe : review.cityEn;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const gradient = AVATAR_COLORS[parseInt(review.id) % AVATAR_COLORS.length];

  return (
    <div className="flex-shrink-0 w-80 linear-card p-5 mx-2 flex flex-col gap-3 select-none">
      {/* Stars */}
      <div className="flex gap-0.5">
        {"★".repeat(review.rating).split("").map((s, i) => (
          <span key={i} className="text-amber-400 text-xs">{s}</span>
        ))}
      </div>

      <p className="text-white/85 text-sm font-medium leading-snug tracking-[-0.01em] line-clamp-2">
        {title}
      </p>
      <p className="text-white/45 text-xs leading-relaxed line-clamp-3 flex-1">{body}</p>

      <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.06]">
        <div
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
        >
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

export default function ReviewMarquee() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const row1 = REVIEWS.slice(0, Math.ceil(REVIEWS.length / 2));
  const row2 = REVIEWS.slice(Math.ceil(REVIEWS.length / 2));

  return (
    <section className="py-14 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-10 md:mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
          {lang === "he" ? "ביקורות" : "TESTIMONIALS"}
        </p>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-[-0.03em]">
            {tx.reviewsHomeTitle}
          </h2>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-amber-400 text-base">★</span>
            <span className="text-white font-semibold text-sm">4.8</span>
            <span className="text-white/30 text-xs">/ 5</span>
          </div>
        </div>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="pause-on-hover relative mb-3">
        {/* Fade edges */}
        <div className="pointer-events-none absolute start-0 top-0 bottom-0 w-16 z-10" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
        <div className="pointer-events-none absolute end-0 top-0 bottom-0 w-16 z-10" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />

        <div className="flex animate-marquee">
          {[...row1, ...row1].map((r, i) => (
            <ReviewCard key={i} review={r} lang={lang} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right (reverse direction) */}
      {row2.length > 0 && (
        <div className="pause-on-hover relative">
          <div className="pointer-events-none absolute start-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#0C0C0D] to-transparent" />
          <div className="pointer-events-none absolute end-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#0C0C0D] to-transparent" />

          <div className="flex animate-marquee-rtl">
            {[...row2, ...row2].map((r, i) => (
              <ReviewCard key={i} review={r} lang={lang} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
