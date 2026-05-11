"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { renderMixedText } from "@/lib/rtl";

const PLAN_IDS: Record<string, string> = {
  weekly: "weekly",
  monthly: "monthly",
  popular: "quarterly",
  annual: "annual",
};

export default function PlansSection() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";
  const router = useRouter();

  const plans = [
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
      name: tx.planMonthlyName,
      badge: tx.planMonthlyBadge,
      price: tx.planMonthlyPrice,
      per: tx.planMonthlyPer,
      tagline: tx.planMonthlyTagline,
      features: [tx.planMonthly1, tx.planMonthly2, tx.planMonthly3, tx.planMonthly4, tx.planMonthly5],
      cta: tx.planMonthlyCta,
      variant: "monthly" as const,
    },
    {
      name: tx.planQuarterlyName,
      badge: tx.planQuarterlyBadge,
      price: tx.planQuarterlyPrice,
      per: tx.planQuarterlyPer,
      subPrice: tx.planQuarterlySubPrice,
      tagline: tx.planQuarterlyTagline,
      features: [tx.planQuarterly1, tx.planQuarterly2, tx.planQuarterly3, tx.planQuarterly4, tx.planQuarterly5],
      cta: tx.planQuarterlyCta,
      variant: "popular" as const,
    },
    {
      name: tx.planAnnualName,
      badge: tx.planAnnualBadge,
      price: tx.planAnnualPrice,
      per: tx.planAnnualPer,
      subPrice: tx.planAnnualSubPrice,
      tagline: tx.planAnnualTagline,
      features: [tx.planAnnual1, tx.planAnnual2, tx.planAnnual3, tx.planAnnual4, tx.planAnnual5],
      cta: tx.planAnnualCta,
      variant: "annual" as const,
    },
  ];

  const variantClasses: Record<string, { wrap: string; accent: string; cta: string; check: string; badge: string }> = {
    weekly: {
      wrap: "bg-white/5 border-sky-500/20",
      accent: "text-sky-300",
      cta: "bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold",
      check: "text-sky-400",
      badge: "bg-sky-500 text-slate-900",
    },
    monthly: {
      wrap: "bg-white/5 border-teal-500/20",
      accent: "text-teal-300",
      cta: "bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold",
      check: "text-teal-400",
      badge: "bg-teal-500 text-slate-900",
    },
    popular: {
      wrap: "bg-gradient-to-br from-purple-600/20 via-white/5 to-emerald-600/20 border-purple-500/50 shadow-2xl shadow-purple-500/20 lg:-translate-y-2 lg:scale-[1.02]",
      accent: "text-purple-300",
      cta: "bg-purple-600 hover:bg-purple-500 text-white",
      check: "text-purple-400",
      badge: "bg-gradient-to-r from-purple-500 to-emerald-500 text-white",
    },
    annual: {
      wrap: "bg-white/5 border-amber-500/20",
      accent: "text-amber-300",
      cta: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold",
      check: "text-amber-400",
      badge: "bg-amber-500 text-slate-900",
    },
  };

  return (
    <section id="plans" className="py-10 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{tx.landingPlansTitle}</h2>
          <p className="text-white/60">{tx.landingPlansSubtitle}</p>
        </div>

        <div className="mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-8 text-center max-w-2xl">
          <p className="text-white/75 text-xs sm:text-sm md:text-base leading-relaxed">
            {tx.pricingComparisonLine}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {plans.map((p, i) => {
            const c = variantClasses[p.variant];
            return (
              <div
                key={i}
                className={`relative rounded-3xl p-5 backdrop-blur-sm border transition-all ${c.wrap}`}
              >
                {p.badge && (
                  <div className={`absolute -top-3 start-6 text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>
                    {p.badge}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={`text-base font-semibold mb-2 ${c.accent}`}>{p.name}</h3>
                  <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-3xl font-bold text-white">{p.price}</span>
                    {p.per && <span className="text-white/50 text-xs">{p.per}</span>}
                  </div>
                  {p.subPrice && (
                    <p className="text-emerald-400 text-xs font-semibold mb-1">{p.subPrice}</p>
                  )}
                  <p className="text-white/55 text-xs">{p.tagline}</p>
                </div>

                <button
                  onClick={() => router.push(`/checkout?plan=${PLAN_IDS[p.variant]}`)}
                  className={`w-full py-2.5 px-2 rounded-xl font-semibold transition mb-5 text-sm truncate active:scale-[0.97] ${c.cta}`}
                >
                  {p.cta}
                </button>

                <ul className="space-y-2">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-1.5 text-xs">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.check}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/80 leading-snug">{renderMixedText(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Free CTA */}
        <div className="flex flex-col items-center gap-3 mt-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 blur-md opacity-40 animate-pulse pointer-events-none" />
            <button
              onClick={() => router.push("/?start=jobs")}
              className="relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-900/30"
            >
              {he ? "התחילו עכשיו בחינם" : "Start for Free Now"}
            </button>
          </div>
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
