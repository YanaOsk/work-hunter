"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

const PLAN_IDS: Record<string, string> = {
  free: "free",
  weekly: "weekly",
  popular: "one-time",
  pro: "pro",
};

export default function PlansSection() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const router = useRouter();

  const plans = [
    {
      name: tx.planFreeName,
      price: tx.planFreePrice,
      tagline: tx.planFreeTagline,
      features: [tx.planFree1, tx.planFree2, tx.planFree3, tx.planFree4],
      cta: tx.planFreeCta,
      variant: "free" as const,
    },
    {
      name: tx.planWeeklyName,
      badge: tx.planWeeklyBadge,
      price: tx.planWeeklyPrice,
      per: tx.planWeeklyPer,
      tagline: tx.planWeeklyTagline,
      features: [tx.planWeekly1, tx.planWeekly2, tx.planWeekly3, tx.planWeekly4, tx.planWeekly5],
      cta: tx.planWeeklyCta,
      variant: "weekly" as const,
    },
    {
      name: tx.planOneTimeName,
      badge: tx.planOneTimeBadge,
      oldPrice: tx.planOneTimeOld,
      price: tx.planOneTimePrice,
      tagline: tx.planOneTimeTagline,
      features: [
        tx.planOneTime1,
        tx.planOneTime2,
        tx.planOneTime3,
        tx.planOneTime4,
        tx.planOneTime5,
        tx.planOneTime6,
        tx.planOneTime7,
        tx.planOneTime8,
      ],
      cta: tx.planOneTimeCta,
      variant: "popular" as const,
    },
    {
      name: tx.planProName,
      badge: tx.planProBadge,
      oldPrice: tx.planProOld,
      price: tx.planProPrice,
      per: tx.planProPer,
      tagline: tx.planProTagline,
      features: [tx.planPro1, tx.planPro2, tx.planPro3, tx.planPro4, tx.planPro5, tx.planPro6],
      cta: tx.planProCta,
      variant: "pro" as const,
    },
  ];

  const variantClasses: Record<string, { wrap: string; accent: string; cta: string; check: string }> = {
    free: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-white",
      cta: "bg-white/10 hover:bg-white/15 border border-white/20 text-white",
      check: "text-white/50",
    },
    weekly: {
      wrap: "bg-white/5 border-sky-500/20",
      accent: "text-sky-300",
      cta: "bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold",
      check: "text-sky-400",
    },
    popular: {
      wrap:
        "bg-gradient-to-br from-purple-600/20 via-white/5 to-emerald-600/20 border-purple-500/50 shadow-2xl shadow-purple-500/20 lg:-translate-y-2 lg:scale-[1.02]",
      accent: "text-purple-300",
      cta: "bg-purple-600 hover:bg-purple-500 text-white",
      check: "text-purple-400",
    },
    pro: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-amber-300",
      cta: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold",
      check: "text-amber-400",
    },
  };

  return (
    <section id="plans" className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{tx.landingPlansTitle}</h2>
          <p className="text-white/60">{tx.landingPlansSubtitle}</p>
        </div>

        <div className="mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-8 text-center max-w-2xl">
          <p className="text-white/75 text-xs sm:text-sm md:text-base leading-relaxed">
            {tx.pricingComparisonLine}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {plans.map((p, i) => {
            const c = variantClasses[p.variant];
            return (
              <div
                key={i}
                className={`relative rounded-3xl p-6 backdrop-blur-sm border transition-all ${c.wrap}`}
              >
                {p.badge && (
                  <div
                    className={`absolute -top-3 start-6 text-xs font-bold px-3 py-1 rounded-full ${
                      p.variant === "popular"
                        ? "bg-gradient-to-r from-purple-500 to-emerald-500 text-white"
                        : p.variant === "weekly"
                        ? "bg-sky-500 text-slate-900"
                        : "bg-amber-500 text-slate-900"
                    }`}
                  >
                    {p.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${c.accent}`}>{p.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    {p.oldPrice && <span className="text-white/40 line-through text-lg">{p.oldPrice}</span>}
                    <span className="text-4xl font-bold text-white">{p.price}</span>
                    {p.per && <span className="text-white/50 text-sm">{p.per}</span>}
                  </div>
                  <p className="text-white/60 text-sm">{p.tagline}</p>
                </div>

                <button
                  onClick={() => router.push(`/checkout?plan=${PLAN_IDS[p.variant]}`)}
                  className={`w-full py-3 rounded-xl font-semibold transition mb-6 ${c.cta}`}
                >
                  {p.cta}
                </button>

                <ul className="space-y-2.5">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex gap-2 text-sm">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.check}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/85 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-medium"
          >
            {tx.landingSeeAll}
          </Link>
        </div>

      </div>
    </section>
  );
}
