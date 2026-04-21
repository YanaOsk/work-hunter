"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onStart: () => void;
  onExit: () => void;
}

export default function PreJourneyIntro({ onStart, onExit }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const stages = [
    { num: 1, title: tx.preIntroStage1, desc: tx.preIntroStage1Desc, color: "emerald" },
    { num: 2, title: tx.preIntroStage2, desc: tx.preIntroStage2Desc, color: "purple" },
    { num: 3, title: tx.preIntroStage3, desc: tx.preIntroStage3Desc, color: "blue" },
    { num: 4, title: tx.preIntroStage4, desc: tx.preIntroStage4Desc, color: "sky" },
    { num: 5, title: tx.preIntroStage5, desc: tx.preIntroStage5Desc, color: "amber" },
  ];

  const colorMap: Record<string, { dot: string; num: string }> = {
    emerald: { dot: "bg-emerald-500/20", num: "text-emerald-300" },
    purple: { dot: "bg-purple-500/20", num: "text-purple-300" },
    blue: { dot: "bg-blue-500/20", num: "text-blue-300" },
    sky: { dot: "bg-sky-500/20", num: "text-sky-300" },
    amber: { dot: "bg-amber-500/20", num: "text-amber-300" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onExit} className="text-white/50 hover:text-white text-sm mb-6">
          ← {tx.newSearch}
        </button>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{tx.preIntroTitle}</h1>
            <p className="text-white/75 leading-relaxed">{tx.preIntroLead}</p>
          </div>

          <div className="space-y-4">
            {stages.map((s) => {
              const c = colorMap[s.color];
              return (
                <div key={s.num} className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${c.dot}`}
                  >
                    <span className={`font-bold ${c.num}`}>{s.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-4">
            <p className="text-white/80 text-sm leading-relaxed">{tx.preIntroAfter}</p>
          </div>

          <button
            onClick={onStart}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 rounded-xl transition text-lg"
          >
            {tx.preIntroStart} →
          </button>
        </div>
      </div>
    </div>
  );
}
