"use client";

import { useEffect, useState } from "react";
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
  const freeformIntro = advisorState.userProfile.parsedData?.additionalNotes || advisorState.userProfile.rawText || "";
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
      body: JSON.stringify({
        userProfile: advisorState.userProfile,
        answers: updated,
        lang,
        freeformIntro: freeformIntro.trim() || undefined,
      }),
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

  if (loading) return <LoadingScreen tx={tx} />;

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
    <div style={{ background: "var(--background)" }} className="min-h-screen p-4 md:p-6">
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

type TxAll = typeof import("@/lib/i18n").t["he"] | typeof import("@/lib/i18n").t["en"];
function LoadingScreen({ tx }: { tx: TxAll }) {
  const [step, setStep] = useState(0);

  const STEPS = [
    { icon: "🧠", text: tx.diagnosisStep1 },
    { icon: "🗺️", text: tx.diagnosisStep2 },
    { icon: "✨", text: tx.diagnosisStep3 },
    { icon: "🎯", text: tx.diagnosisStep4 },
  ];

  useEffect(() => {
    const timings = [3000, 6000, 10000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Progress beam */}
      <div className="relative h-[2px] overflow-hidden bg-white/[0.04]">
        <div
          className="absolute top-0 h-full rounded-full animate-progress-beam"
          style={{
            width: "180px",
            background: "linear-gradient(90deg, transparent, #9333ea, #a855f7, transparent)",
            boxShadow: "0 0 12px rgba(147,51,234,0.6), 0 0 6px rgba(168,85,247,0.4)",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-6">

          {/* Animated orb */}
          <div className="flex justify-center mb-10">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-full border border-purple-500/20 animate-mint-ping"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-0 rounded-full border border-purple-400/15 animate-mint-ping"
                style={{ animationDelay: "0.7s", animationDuration: "2s" }}
              />

              <div className="relative w-20 h-20 rounded-2xl linear-card overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-x-0 h-[1.5px] animate-scan-line"
                  style={{
                    background: "linear-gradient(90deg, transparent, #9333ea, #c084fc, transparent)",
                    boxShadow: "0 0 10px rgba(147,51,234,0.7), 0 0 5px rgba(192,132,252,0.5)",
                  }}
                />
                <div
                  className="absolute inset-x-0 h-10 animate-scan-line pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(147,51,234,0.06), transparent)",
                  }}
                />
                <svg
                  className="relative z-10 w-8 h-8"
                  style={{ color: "rgba(147,51,234,0.8)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white text-center mb-2 tracking-[-0.025em]">
            {tx.diagnosisLoadingTitle}
          </h2>
          <p className="text-white/40 text-sm text-center mb-8">{tx.diagnosisLoadingSubtitle}</p>

          {/* Steps */}
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
                {i < step ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === step ? (
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse bg-purple-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-white/10" />
                )}

                <span className="text-sm">{s.icon}</span>
                <span className={`text-sm tracking-[-0.01em] ${i <= step ? "text-white/80" : "text-white/30"}`}>
                  {s.text}
                </span>

                {i === step && (
                  <div className="ms-auto flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full animate-pulse bg-purple-500"
                        style={{ animationDelay: `${d * 0.2}s`, opacity: 0.7 }}
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
