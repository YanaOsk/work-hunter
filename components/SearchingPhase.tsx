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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #0D0B1E, #0f0d2a 50%, #0D0B1E)" }}>
      <div className="text-center max-w-md px-4">

        {/* Scanning animation orb */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          {/* Mint ping rings */}
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-mint-ping" />
          <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-mint-ping" style={{ animationDelay: "0.5s" }} />

          {/* Scan line container */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-b from-purple-900/60 to-purple-950/80 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {/* Scanning beam */}
            <div
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{ left: 0, right: 0 }}
            />
            {/* Scan glow layer */}
            <div
              className="absolute inset-x-0 h-6 bg-gradient-to-b from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 animate-scan-line"
              style={{ left: 0, right: 0, animationDelay: "0s" }}
            />

            {/* Center icon */}
            <svg className="w-9 h-9 text-purple-300 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M16.5 16.5l3.5 3.5" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">{tx.searchingTitle}</h2>
        <p className="text-emerald-400/80 mb-8 text-sm">{tx.searchingSubtitle}</p>

        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                i <= step
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-white/[0.03] border border-white/[0.08] opacity-40"
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <span className={`text-sm ${i <= step ? "text-white" : "text-white/50"}`}>{s.text}</span>
              {i < step && (
                <svg className="w-4 h-4 text-emerald-400 ms-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {i === step && <div className="ms-auto w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
