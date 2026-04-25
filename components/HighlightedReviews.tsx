"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { REVIEWS } from "@/lib/reviews";

export default function HighlightedReviews() {
  const { lang } = useLanguage();
  const tx = t[lang];

  // Pick 3 diverse reviews from different fields
  const featured = [REVIEWS[0], REVIEWS[5], REVIEWS[4]];

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-6 md:mb-10 leading-tight">
          {tx.reviewsHomeTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {featured.map((r) => {
            const name = lang === "he" ? r.nameHe : r.nameEn;
            const city = lang === "he" ? r.cityHe : r.cityEn;
            const title = lang === "he" ? r.titleHe : r.titleEn;
            const body = lang === "he" ? r.bodyHe : r.bodyEn;
            const field = tx[r.fieldKey];
            const initials = name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2);
            const colors = [
              "bg-purple-600",
              "bg-emerald-600",
              "bg-blue-600",
              "bg-rose-600",
              "bg-amber-600",
              "bg-sky-600",
            ];
            const color = colors[parseInt(r.id) % colors.length];

            return (
              <div
                key={r.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-semibold flex-shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm">{name}</h4>
                    <p className="text-white/50 text-xs">
                      {r.age} · {city} · {field}
                    </p>
                  </div>
                  <div className="text-amber-400 text-sm flex-shrink-0">{"★".repeat(r.rating)}</div>
                </div>

                <h3 className="font-semibold text-white text-sm md:text-base mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-4">{body}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-medium"
          >
            {tx.reviewsHomeMore}
          </Link>
        </div>
      </div>
    </section>
  );
}
