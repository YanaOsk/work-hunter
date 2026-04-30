"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { REVIEWS, Review } from "@/lib/reviews";
import SiteFooter from "./SiteFooter";

function shufflePick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export default function ReviewsPage() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const [displayed, setDisplayed] = useState<Review[]>(REVIEWS.slice(0, 10));

  useEffect(() => {
    setDisplayed(shufflePick(REVIEWS, 10));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-300 text-sm font-medium">
              {"★".repeat(5)} 4.8 / 5 · {REVIEWS.length * 24}+ reviews
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{tx.reviewsTitle}</h1>
          <p className="text-white/60 leading-relaxed">{tx.reviewsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((r) => (
            <ReviewCard key={r.id} review={r} lang={lang} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#plans"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {tx.landingPlansTitle}
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ReviewCard({ review, lang }: { review: Review; lang: "he" | "en" }) {
  const tx = t[lang];
  const name = lang === "he" ? review.nameHe : review.nameEn;
  const city = lang === "he" ? review.cityHe : review.cityEn;
  const title = lang === "he" ? review.titleHe : review.titleEn;
  const body = lang === "he" ? review.bodyHe : review.bodyEn;
  const timeText =
    review.timeKey === "reviewsTimeWeeks" || review.timeKey === "reviewsTimeMonths"
      ? tx[review.timeKey].replace("{n}", String(review.timeN || 2))
      : tx[review.timeKey];
  const field = tx[review.fieldKey];

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const colors = ["bg-purple-600", "bg-emerald-600", "bg-blue-600", "bg-rose-600", "bg-amber-600", "bg-sky-600"];
  const color = colors[parseInt(review.id) % colors.length];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm truncate">{name}</h4>
          <p className="text-white/50 text-xs">
            {review.age} · {city} · {field}
          </p>
        </div>
        <div className="text-amber-400 text-sm flex-shrink-0">
          {"★".repeat(review.rating)}
        </div>
      </div>

      <h3 className="font-semibold text-white mb-2 leading-snug">{title}</h3>
      <p className="text-white/75 text-sm leading-relaxed mb-3">{body}</p>
      <p className="text-white/40 text-xs">{timeText}</p>
    </div>
  );
}
