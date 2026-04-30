"use client";

import { useState } from "react";
import { AdvisorState, DiagnosisAnswer, DiagnosisResult } from "@/lib/types";
import { DIAGNOSIS_QUESTIONS_HE, DIAGNOSIS_QUESTIONS_EN } from "@/lib/advisorPrompts";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import StageIntro from "./StageIntro";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onComplete: (result: DiagnosisResult) => void;
}

export default function DiagnosisTool({ advisorState, onBack, onComplete }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const questions = lang === "he" ? DIAGNOSIS_QUESTIONS_HE : DIAGNOSIS_QUESTIONS_EN;

  const [phase, setPhase] = useState<"intro" | "quiz">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswer[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const q = questions[currentIdx];
  const hasOptions = !!q.options && q.options.length > 0;

  const toggleOption = (opt: string) => {
    setSelected((s) => {
      const ns = new Set(s);
      if (ns.has(opt)) ns.delete(opt);
      else ns.add(opt);
      return ns;
    });
  };

  const buildAnswer = (): string => {
    if (hasOptions) {
      const parts: string[] = [...selected];
      if (otherChecked && otherText.trim()) parts.push(otherText.trim());
      return parts.join(" · ");
    }
    return textAnswer.trim();
  };

  const canProceed = hasOptions
    ? selected.size > 0 || (otherChecked && otherText.trim().length > 0)
    : textAnswer.trim().length > 0;

  const resetInput = () => {
    setTextAnswer("");
    setSelected(new Set());
    setOtherChecked(false);
    setOtherText("");
  };

  const callDiagnosisApi = async (updated: DiagnosisAnswer[]) => {
    const res = await fetch("/api/advisor/diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userProfile: advisorState.userProfile, answers: updated, lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data as DiagnosisResult;
  };

  const handleNext = async () => {
    if (!canProceed) return;
    const finalAnswer = buildAnswer();
    const updated = [...answers, { questionId: q.id, question: q.question, answer: finalAnswer }];
    setAnswers(updated);
    resetInput();

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await callDiagnosisApi(updated);
      onComplete(data);
    } catch {
      try {
        const data = await callDiagnosisApi(updated);
        onComplete(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    }
  };

  if (loading) return <LoadingScreen label={tx.diagnosisAnalyzing} />;

  if (phase === "intro") {
    return (
      <StageIntro
        title={tx.toolDiagnosis}
        intro={tx.introDiagnosis}
        actionLabel={tx.startStage}
        onBack={onBack}
        onAction={() => setPhase("quiz")}
      />
    );
  }

  const progress = tx.diagnosisProgress
    .replace("{current}", String(currentIdx + 1))
    .replace("{total}", String(questions.length));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
          {tx.backToAdvisor}
        </button>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 md:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg md:text-xl font-bold text-white">{tx.toolDiagnosis}</h1>
              <span className="text-purple-300 text-sm">{progress}</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-white text-base md:text-lg leading-relaxed">{q.question}</p>

          {hasOptions ? (
            <div className="space-y-2">
              {q.options!.map((opt) => {
                const checked = selected.has(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-start gap-3 p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "bg-purple-500/15 border-purple-500/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(opt)}
                      className="mt-1 w-4 h-4 rounded accent-purple-500 flex-shrink-0"
                    />
                    <span className="text-white/90 text-sm md:text-base leading-relaxed">{opt}</span>
                  </label>
                );
              })}

              <label
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border cursor-pointer transition-all ${
                  otherChecked
                    ? "bg-purple-500/15 border-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={otherChecked}
                  onChange={() => setOtherChecked((v) => !v)}
                  className="w-4 h-4 rounded accent-purple-500 flex-shrink-0"
                />
                <span className="text-white/80 text-sm md:text-base flex-shrink-0">
                  {tx.diagnosisOther}:
                </span>
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => {
                    setOtherText(e.target.value);
                    if (e.target.value) setOtherChecked(true);
                  }}
                  placeholder={tx.diagnosisOtherPlaceholder}
                  className="flex-1 bg-transparent border-b border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 text-sm md:text-base"
                />
              </label>
            </div>
          ) : (
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleNext();
              }}
              rows={4}
              autoFocus
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              placeholder={tx.typeAnswer}
            />
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 space-y-2">
              <p className="text-red-300 text-sm font-medium">
                {lang === "he"
                  ? "משהו השתבש בניתוח. נסו שוב — אם זה קורה שוב, קצרו מעט את התשובות."
                  : "Something went wrong during analysis. Try again — if it keeps failing, shorten your answers a bit."}
              </p>
              <button
                onClick={() => { setError(""); handleNext(); }}
                className="text-sm text-red-300 underline underline-offset-2 hover:text-red-200"
              >
                {lang === "he" ? "נסה שוב" : "Try again"}
              </button>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
          >
            {currentIdx < questions.length - 1 ? tx.diagnosisNext : tx.diagnosisSubmit}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center p-6">
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
