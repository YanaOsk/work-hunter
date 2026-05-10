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
    <div className="min-h-screen flex flex-col" style={{ background: "#0C0C0D" }}>
      {/* Linear-style progress beam at the very top */}
      <div className="relative h-[2px] overflow-hidden bg-white/[0.04]">
        <div
          className="absolute top-0 h-full rounded-full animate-progress-beam"
          style={{
            width: "180px",
            background: "linear-gradient(90deg, transparent, #5E6AD2, #4ADE80, transparent)",
            boxShadow: "0 0 12px rgba(94,106,210,0.6), 0 0 6px rgba(74,222,128,0.4)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6">

          {/* Icon + scanning orb */}
          <div className="flex justify-center mb-10">
            <div className="relative w-20 h-20">
              {/* Outer ring pings */}
              <div
                className="absolute inset-0 rounded-full border border-[#5E6AD2]/20 animate-mint-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-0 rounded-full border border-[#4ADE80]/15 animate-mint-ping"
                style={{ animationDelay: "0.7s", animationDuration: "2s" }}
              />

              {/* Card shell */}
              <div className="relative w-20 h-20 rounded-2xl linear-card overflow-hidden flex items-center justify-center">
                {/* Scan beam */}
                <div
                  className="absolute inset-x-0 h-[1.5px] animate-scan-line"
                  style={{
                    background: "linear-gradient(90deg, transparent, #5E6AD2, #4ADE80, transparent)",
                    boxShadow: "0 0 10px rgba(94,106,210,0.7), 0 0 5px rgba(74,222,128,0.5)",
                  }}
                />
                {/* Scan glow */}
                <div
                  className="absolute inset-x-0 h-10 animate-scan-line pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(94,106,210,0.06), transparent)",
                    animationDelay: "0s",
                  }}
                />

                {/* Search icon */}
                <svg
                  className="relative z-10 w-8 h-8"
                  style={{ color: "rgba(94,106,210,0.7)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M16.5 16.5l3.5 3.5" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white text-center mb-2 tracking-[-0.025em]">
            {tx.searchingTitle}
          </h2>
          <p className="text-white/40 text-sm text-center mb-8">{tx.searchingSubtitle}</p>

          {/* Step indicators — Linear sync-style */}
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                  i < step
                    ? "opacity-50"
                    : i === step
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "opacity-20"
                }`}
              >
                {/* Status indicator */}
                {i < step ? (
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: "#4ADE80" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === step ? (
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse"
                    style={{ background: "#5E6AD2" }}
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-white/10" />
                )}

                <span className="text-sm">{s.icon}</span>
                <span
                  className={`text-sm tracking-[-0.01em] ${i <= step ? "text-white/80" : "text-white/30"}`}
                >
                  {s.text}
                </span>

                {/* Active: pulsing dot on right */}
                {i === step && (
                  <div className="ms-auto flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full animate-pulse"
                        style={{
                          background: "#5E6AD2",
                          animationDelay: `${d * 0.2}s`,
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
