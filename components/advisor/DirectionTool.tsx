"use client";

import { useState } from "react";
import { AdvisorState, DirectionResult, LifePath } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import StageIntro from "./StageIntro";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onComplete: (result: DirectionResult, path: LifePath) => void;
}

export default function DirectionTool({ advisorState, onBack, onComplete }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const [phase, setPhase] = useState<"intro" | "input">("intro");
  const [userGoal, setUserGoal] = useState("");
  const [selected, setSelected] = useState<LifePath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/advisor/direction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState.userProfile,
          diagnosis: advisorState.diagnosis,
          userGoal: userGoal.trim(),
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onComplete(data as DirectionResult, selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen label={tx.directionAnalyzing} />;

  if (phase === "intro") {
    return (
      <StageIntro
        title={tx.toolDirection}
        intro={tx.introDirection}
        actionLabel={tx.startStage}
        onBack={onBack}
        onAction={() => setPhase("input")}
      />
    );
  }

  const options: { key: LifePath; label: string; desc: string; color: string }[] = [
    {
      key: "employee",
      label: tx.pathEmployee,
      desc: lang === "he" ? "משרה יציבה, שכר, צוות" : "Stable role, salary, team",
      color: "emerald",
    },
    {
      key: "entrepreneur",
      label: tx.pathEntrepreneur,
      desc: lang === "he" ? "עסק משלך, חופש, סיכון" : "Your own business, freedom, risk",
      color: "purple",
    },
    {
      key: "studies",
      label: tx.pathStudies,
      desc: lang === "he" ? "לימודים, הסבה מקצועית" : "Studies, career pivot",
      color: "blue",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/50", text: "text-emerald-300" },
    purple: { bg: "bg-purple-500/15", border: "border-purple-500/50", text: "text-purple-300" },
    blue: { bg: "bg-blue-500/15", border: "border-blue-500/50", text: "text-blue-300" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
          ← {tx.backToAdvisor}
        </button>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 md:p-8 space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-white">{tx.toolDirection}</h1>
          <p className="text-white/70 leading-relaxed">{tx.directionIntro}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {options.map((opt) => {
              const c = colorMap[opt.color];
              const isSel = selected === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelected(opt.key)}
                  className={`text-start rounded-2xl p-4 border transition-all ${
                    isSel ? `${c.bg} ${c.border}` : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className={`font-semibold mb-1 ${isSel ? c.text : "text-white"}`}>
                    {opt.label}
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10">
            <label className="block text-white font-medium mb-1">{tx.directionOtherLabel}</label>
            <p className="text-white/50 text-xs mb-3">{tx.directionOtherHelp}</p>
            <textarea
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              placeholder={tx.typeAnswer}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!selected}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
          >
            {tx.directionSubmit}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center">
        <svg className="animate-spin w-10 h-10 text-purple-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-white/70">{label}</p>
      </div>
    </div>
  );
}
