"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function PricingPage() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [toast, setToast] = useState<string | null>(null);

  const showDemoToast = () => {
    setToast(tx.pricingDemoBtn);
    setTimeout(() => setToast(null), 2600);
  };

  const freeFeatures = [tx.planFree1, tx.planFree2, tx.planFree3, tx.planFree4];
  const weeklyFeatures = [
    tx.planWeekly1,
    tx.planWeekly2,
    tx.planWeekly3,
    tx.planWeekly4,
    tx.planWeekly5,
  ];
  const oneTimeFeatures = [
    tx.planOneTime1,
    tx.planOneTime2,
    tx.planOneTime3,
    tx.planOneTime4,
    tx.planOneTime5,
    tx.planOneTime6,
    tx.planOneTime7,
    tx.planOneTime8,
  ];
  const proFeatures = [tx.planPro1, tx.planPro2, tx.planPro3, tx.planPro4, tx.planPro5, tx.planPro6];

  const faqs = [
    { q: tx.faq1Q, a: tx.faq1A },
    { q: tx.faq2Q, a: tx.faq2A },
    { q: tx.faq3Q, a: tx.faq3A },
    { q: tx.faq4Q, a: tx.faq4A },
    { q: tx.faq5Q, a: tx.faq5A },
    { q: tx.faq6Q, a: tx.faq6A },
    { q: tx.faq7Q, a: tx.faq7A },
    { q: tx.faq8Q, a: tx.faq8A },
    { q: tx.faq9Q, a: tx.faq9A },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-6xl mx-auto p-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-white/50 hover:text-white text-sm">
            ← {tx.newSearch}
          </Link>
          <div className="text-white/40 text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {tx.pricingDemoNote}
          </div>
        </div>

        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tx.pricingTitle}</h1>
          <p className="text-white/70 text-lg leading-relaxed">{tx.pricingSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <PlanCard
            name={tx.planFreeName}
            price={tx.planFreePrice}
            tagline={tx.planFreeTagline}
            features={freeFeatures}
            cta={tx.planFreeCta}
            onCtaClick={showDemoToast}
            variant="free"
          />
          <PlanCard
            name={tx.planWeeklyName}
            badge={tx.planWeeklyBadge}
            price={tx.planWeeklyPrice}
            per={tx.planWeeklyPer}
            tagline={tx.planWeeklyTagline}
            features={weeklyFeatures}
            cta={tx.planWeeklyCta}
            onCtaClick={showDemoToast}
            variant="weekly"
          />
          <PlanCard
            name={tx.planOneTimeName}
            badge={tx.planOneTimeBadge}
            oldPrice={tx.planOneTimeOld}
            price={tx.planOneTimePrice}
            tagline={tx.planOneTimeTagline}
            features={oneTimeFeatures}
            cta={tx.planOneTimeCta}
            onCtaClick={showDemoToast}
            variant="popular"
          />
          <PlanCard
            name={tx.planProName}
            badge={tx.planProBadge}
            oldPrice={tx.planProOld}
            price={tx.planProPrice}
            per={tx.planProPer}
            tagline={tx.planProTagline}
            features={proFeatures}
            cta={tx.planProCta}
            onCtaClick={showDemoToast}
            variant="pro"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          <TrustCard icon="users" title={tx.trustUsers} desc={tx.trustUsersDesc} />
          <TrustCard icon="star" title={tx.trustRating} desc={tx.trustRatingDesc} />
          <TrustCard icon="shield" title={tx.trustSecure} desc={tx.trustSecureDesc} />
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-5 text-center">{tx.faqTitle}</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl z-50 animate-[fade_0.2s]">
          {toast}
        </div>
      )}
    </div>
  );
}

interface PlanProps {
  name: string;
  badge?: string;
  oldPrice?: string;
  price: string;
  per?: string;
  tagline: string;
  features: string[];
  cta: string;
  onCtaClick: () => void;
  variant: "free" | "weekly" | "popular" | "pro";
}

function PlanCard({
  name,
  badge,
  oldPrice,
  price,
  per,
  tagline,
  features,
  cta,
  onCtaClick,
  variant,
}: PlanProps) {
  const variantClasses = {
    free: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-white",
      cta: "bg-white/10 hover:bg-white/15 border border-white/20 text-white",
    },
    weekly: {
      wrap: "bg-white/5 border-sky-500/20",
      accent: "text-sky-300",
      cta: "bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold",
    },
    popular: {
      wrap:
        "bg-gradient-to-br from-purple-600/20 via-white/5 to-emerald-600/20 border-purple-500/50 shadow-2xl shadow-purple-500/20 lg:-translate-y-2 lg:scale-[1.02]",
      accent: "text-purple-300",
      cta: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    pro: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-amber-300",
      cta: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold",
    },
  }[variant];

  return (
    <div
      className={`relative rounded-3xl p-6 backdrop-blur-sm border transition-all ${variantClasses.wrap}`}
    >
      {badge && (
        <div
          className={`absolute -top-3 start-6 text-xs font-bold px-3 py-1 rounded-full ${
            variant === "popular"
              ? "bg-gradient-to-r from-purple-500 to-emerald-500 text-white"
              : variant === "weekly"
              ? "bg-sky-500 text-slate-900"
              : "bg-amber-500 text-slate-900"
          }`}
        >
          {badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-2 ${variantClasses.accent}`}>{name}</h3>
        <div className="flex items-baseline gap-2 mb-1">
          {oldPrice && (
            <span className="text-white/40 line-through text-lg">{oldPrice}</span>
          )}
          <span className="text-4xl font-bold text-white">{price}</span>
          {per && <span className="text-white/50 text-sm">{per}</span>}
        </div>
        <p className="text-white/60 text-sm">{tagline}</p>
      </div>

      <button
        onClick={onCtaClick}
        className={`w-full py-3 rounded-xl font-semibold transition mb-6 ${variantClasses.cta}`}
      >
        {cta}
      </button>

      <ul className="space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                variant === "free"
                  ? "text-white/50"
                  : variant === "weekly"
                  ? "text-sky-400"
                  : variant === "popular"
                  ? "text-purple-400"
                  : "text-amber-400"
              }`}
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
}

function TrustCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const paths: Record<string, string> = {
    users:
      "M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a3 3 0 013-3h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
    star:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    shield:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  };
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
      <svg
        className="w-8 h-8 text-purple-300 mx-auto mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={paths[icon]} />
      </svg>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-white/60 text-sm">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-start bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition"
    >
      <div className="flex items-center justify-between">
        <span className="text-white font-medium">{q}</span>
        <svg
          className={`w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && <p className="text-white/70 text-sm mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}
