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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="relative w-24 h-24 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-20" />
          <div className="absolute inset-2 rounded-full bg-purple-500 animate-pulse opacity-40" />
          <div className="relative w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">{tx.searchingTitle}</h2>
        <p className="text-purple-300 mb-8">{tx.searchingSubtitle}</p>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
              i <= step ? "bg-purple-500/20 border border-purple-500/40" : "bg-white/5 border border-white/10 opacity-40"
            }`}>
              <span className="text-xl">{s.icon}</span>
              <span className={`text-sm ${i <= step ? "text-white" : "text-white/50"}`}>{s.text}</span>
              {i < step && (
                <svg className="w-4 h-4 text-green-400 ms-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {i === step && <div className="ms-auto w-3 h-3 rounded-full bg-purple-400 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
