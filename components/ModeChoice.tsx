"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onChoose: (mode: AppMode) => void;
}

export default function ModeChoice({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{tx.appName}</h1>
          <p className="text-purple-300 text-lg">{tx.chooseMode}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <button
            onClick={() => onChoose("jobs")}
            className="group text-start bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 rounded-3xl p-8 transition-all"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/20 mb-4 group-hover:bg-purple-600 transition">
              <svg className="w-6 h-6 text-purple-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{tx.modeJobsTitle}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{tx.modeJobsDesc}</p>
          </button>

          <button
            onClick={() => onChoose("advisor")}
            className="group text-start bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 rounded-3xl p-8 transition-all"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600/20 mb-4 group-hover:bg-emerald-600 transition">
              <svg className="w-6 h-6 text-emerald-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{tx.modeAdvisorTitle}</h2>
            <p className="text-white/60 text-sm leading-relaxed">{tx.modeAdvisorDesc}</p>
          </button>
        </div>

        <div className="mt-10 text-center text-white/40 text-xs animate-bounce">
          ↓
        </div>
      </div>
    </div>
  );
}
