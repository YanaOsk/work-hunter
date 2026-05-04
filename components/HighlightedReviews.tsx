"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { REVIEWS } from "@/lib/reviews";

export default function HighlightedReviews() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const featured = [REVIEWS[0], REVIEWS[5], REVIEWS[4]];

  const AVATAR_COLORS = [
    "from-purple-600 to-fuchsia-600",
    "from-emerald-600 to-teal-600",
    "from-blue-600 to-sky-600",
    "from-rose-600 to-pink-600",
    "from-amber-600 to-orange-600",
    "from-sky-600 to-blue-600",
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {tx.reviewsHomeTitle}
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-amber-400 text-lg">{s}</span>
            ))}
            <span className="text-white/40 text-sm ms-2">4.8 / 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-8">
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
            const gradient = AVATAR_COLORS[parseInt(r.id) % AVATAR_COLORS.length];

            return (
              <div
                key={r.id}
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 md:p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {"★".repeat(r.rating).split("").map((s, i) => (
                    <span key={i} className="text-amber-400 text-sm">{s}</span>
                  ))}
                </div>

                <h3 className="font-semibold text-white text-sm md:text-base mb-2 leading-snug flex-1">
                  {title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed line-clamp-3 mb-5">{body}</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.07]">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{name}</p>
                    <p className="text-white/40 text-xs truncate">
                      {r.age} · {city} · {field}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
          >
            {tx.reviewsHomeMore}
          </Link>
        </div>
      </div>
    </section>
  );
}
