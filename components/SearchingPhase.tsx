"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function SearchingPhase() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [step, setStep] = useState(0);

  const STEPS = [
    { icon: "🔍", text: tx.step1 },
    { icon: "🌐", text: tx.step2 },
    { icon: "🤖", text: tx.step3 },
    { icon: "✨", text: tx.step4 },
  ];

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#5e6ad2] animate-spin" />
          <div className="absolute inset-[6px] rounded-full bg-[#5e6ad2]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#818cf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-2">{tx.searchingTitle}</h2>
        <p className="text-white/40 text-sm mb-8">{tx.searchingSubtitle}</p>

        <div className="space-y-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-[6px] transition-all duration-300 text-sm ${
                i <= step
                  ? "bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-white/80"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/25"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <span>{s.text}</span>
              {i < step && (
                <svg className="w-3.5 h-3.5 text-emerald-400 ms-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {i === step && (
                <div className="ms-auto w-1.5 h-1.5 rounded-full bg-[#5e6ad2] animate-linear-pulse flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
