"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onClose: () => void;
  hiddenCount?: number;
  trigger?: "jobs" | "cv";
  returnTo?: string;
}

export default function SubscriptionModal({ onClose, hiddenCount, trigger = "jobs", returnTo }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const go = (planId: string) => {
    onClose();
    const dest = returnTo
      ? `/checkout?plan=${planId}&returnTo=${encodeURIComponent(returnTo)}`
      : `/checkout?plan=${planId}`;
    router.push(dest);
  };

  const headline =
    trigger === "cv"
      ? lang === "he"
        ? "הורדת קורות חיים מחייבת מנוי"
        : "CV download requires a subscription"
      : hiddenCount
        ? lang === "he"
          ? `פתח עוד ${hiddenCount} משרות שמחכות לך`
          : `Unlock ${hiddenCount} more jobs waiting for you`
        : tx.paywallCta;

  const subheading =
    trigger === "cv"
      ? lang === "he"
        ? "בניית קורות החיים חינמית — הורדה מחייבת מנוי"
        : "Building is free — downloading requires a plan"
      : lang === "he"
        ? "הצטרף לאלפי מחפשי עבודה שמצאו את תפקידם הבא"
        : "Join thousands who found their next role";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl"
        dir={lang === "he" ? "rtl" : "ltr"}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-white/40 hover:text-white transition"
          aria-label="סגור"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-white font-bold text-lg text-center mb-1">{headline}</h2>
        <p className="text-white/50 text-sm text-center mb-4">{subheading}</p>

        <div className="flex justify-center mb-5">
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium px-4 py-1.5 rounded-full">
            {tx.paywallDiscount}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Weekly */}
          <div className="bg-white/5 border border-sky-500/20 rounded-2xl p-3 flex flex-col">
            <p className="text-sky-300 text-xs font-semibold mb-1">{tx.planWeeklyName}</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-white text-xl font-bold leading-none">{tx.planWeeklyPrice}</span>
              <span className="text-white/40 text-[10px] ms-1">{tx.planWeeklyPer}</span>
            </div>
            <p className="text-white/50 text-[10px] leading-snug mb-3 flex-1">{tx.planWeeklyTagline}</p>
            <button
              onClick={() => go("weekly")}
              className="w-full py-2 text-xs rounded-xl font-semibold bg-sky-500 hover:bg-sky-400 text-slate-900 transition"
            >
              {tx.planWeeklyCta}
            </button>
          </div>

          {/* Monthly */}
          <div className="bg-white/5 border border-teal-500/20 rounded-2xl p-3 flex flex-col">
            <p className="text-teal-300 text-xs font-semibold mb-1">{tx.planMonthlyName}</p>
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-white text-xl font-bold leading-none">{tx.planMonthlyPrice}</span>
              <span className="text-white/40 text-[10px] ms-1">{tx.planMonthlyPer}</span>
            </div>
            <p className="text-white/50 text-[10px] leading-snug mb-3 flex-1">{tx.planMonthlyTagline}</p>
            <button
              onClick={() => go("monthly")}
              className="w-full py-2 text-xs rounded-xl font-semibold bg-teal-500 hover:bg-teal-400 text-slate-900 transition"
            >
              {tx.planMonthlyCta}
            </button>
          </div>

          {/* Quarterly */}
          <div className="bg-gradient-to-br from-purple-600/20 via-white/5 to-emerald-600/20 border border-purple-500/50 rounded-2xl p-3 flex flex-col relative">
            <div className="absolute -top-2.5 start-2 bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {tx.planQuarterlyBadge}
            </div>
            <p className="text-purple-300 text-xs font-semibold mb-1">{tx.planQuarterlyName}</p>
            <div className="flex items-baseline gap-0.5 mb-0.5">
              <span className="text-white text-xl font-bold leading-none">{tx.planQuarterlyPrice}</span>
            </div>
            <p className="text-emerald-400 text-[10px] font-semibold mb-1">{tx.planQuarterlySubPrice}</p>
            <p className="text-white/50 text-[10px] leading-snug mb-3 flex-1">{tx.planQuarterlyTagline}</p>
            <button
              onClick={() => go("quarterly")}
              className="w-full py-2 text-xs rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white transition"
            >
              {tx.planQuarterlyCta}
            </button>
          </div>

          {/* Annual */}
          <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-3 flex flex-col">
            <p className="text-amber-300 text-xs font-semibold mb-1">{tx.planAnnualName}</p>
            <div className="flex items-baseline gap-0.5 mb-0.5">
              <span className="text-white text-xl font-bold leading-none">{tx.planAnnualPrice}</span>
            </div>
            <p className="text-emerald-400 text-[10px] font-semibold mb-1">{tx.planAnnualSubPrice}</p>
            <p className="text-white/50 text-[10px] leading-snug mb-3 flex-1">{tx.planAnnualTagline}</p>
            <button
              onClick={() => go("annual")}
              className="w-full py-2 text-xs rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition"
            >
              {tx.planAnnualCta}
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs">
          {lang === "he" ? "ביטול בכל עת · ללא כרטיס אשראי לניסיון" : "Cancel anytime · No card required for trial"}
        </p>
      </div>
    </div>
  );
}
