"use client";

import { AdvisorStage, AdvisorState, STAGE_ORDER } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  advisorState: AdvisorState;
  onStartStage: (stage: AdvisorStage) => void;
  onOpenChat: () => void;
  onOpenSummary: () => void;
  onOpenInterview: () => void;
  onExit: () => void;
}

type StageStatus = "done" | "skipped" | "current" | "locked";

function getStageStatus(stage: AdvisorStage, state: AdvisorState): StageStatus {
  if (state.currentStage === "done") {
    if (stage === "cv" && state.cvSkipped) return "skipped";
    if (stage === "linkedin" && state.linkedinSkipped) return "skipped";
    return "done";
  }
  const currentIdx = STAGE_ORDER.indexOf(state.currentStage);
  const stageIdx = STAGE_ORDER.indexOf(stage);
  if (stageIdx < currentIdx) {
    if (stage === "cv" && state.cvSkipped) return "skipped";
    if (stage === "linkedin" && state.linkedinSkipped) return "skipped";
    return "done";
  }
  if (stageIdx === currentIdx) return "current";
  return "locked";
}

type TxKey = keyof typeof t.he;

const STAGE_META: Record<
  Exclude<AdvisorStage, "done">,
  { titleKey: TxKey; descKey: TxKey; icon: string }
> = {
  diagnosis: {
    titleKey: "toolDiagnosis",
    descKey: "toolDiagnosisDesc",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  direction: {
    titleKey: "toolDirection",
    descKey: "toolDirectionDesc",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  cv: {
    titleKey: "toolCv",
    descKey: "toolCvDesc",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  linkedin: {
    titleKey: "toolLinkedin",
    descKey: "toolLinkedinDesc",
    icon: "M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a3 3 0 013-3h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
  },
  strategy: {
    titleKey: "toolStrategy",
    descKey: "toolStrategyDesc",
    icon: "M3 7h18M3 12h18M3 17h18",
  },
};

export default function JourneyMap({
  advisorState,
  onStartStage,
  onOpenChat,
  onOpenSummary,
  onOpenInterview,
  onExit,
}: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const name = advisorState.userProfile.parsedData?.name || "";
  const isDone = advisorState.currentStage === "done";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={onExit} className="text-white/50 hover:text-white text-sm mb-4">
              ← {tx.newSearch}
            </button>
            <h1 className="text-3xl font-bold text-white">{tx.journeyTitle}</h1>
            {name && <p className="text-purple-300 mt-1">{name}</p>}
          </div>
          <button
            onClick={onOpenChat}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {tx.advisorChatTitle}
          </button>
        </div>

        <p className="text-white/70 leading-relaxed mb-10 max-w-2xl">{tx.journeyIntro}</p>

        <div className="relative">
          <div className="absolute start-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500/50 via-white/10 to-white/5" />

          <div className="space-y-4">
            {STAGE_ORDER.map((stage, i) => {
              const status = getStageStatus(stage, advisorState);
              const meta = STAGE_META[stage as Exclude<AdvisorStage, "done">];
              const isCurrent = status === "current";
              const isStageDone = status === "done";
              const isSkipped = status === "skipped";
              const isLocked = status === "locked";

              return (
                <div key={stage} className="relative flex items-start gap-5">
                  <div
                    className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/40"
                        : isStageDone
                        ? "bg-emerald-600/40 border-emerald-500/40"
                        : isSkipped
                        ? "bg-slate-700/40 border-slate-600/40"
                        : "bg-slate-800 border-white/10"
                    }`}
                  >
                    {isStageDone ? (
                      <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isSkipped ? (
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <svg
                        className={`w-5 h-5 ${isCurrent ? "text-white" : "text-white/40"}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={meta.icon} />
                      </svg>
                    )}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full bg-purple-500/40 animate-ping" />
                    )}
                  </div>

                  <button
                    onClick={() => !isLocked && !isStageDone && !isSkipped && onStartStage(stage)}
                    disabled={isLocked || isStageDone || isSkipped}
                    className={`flex-1 text-start rounded-2xl p-5 border transition-all ${
                      isCurrent
                        ? "bg-white/10 border-purple-500/40 hover:bg-white/15 cursor-pointer"
                        : isStageDone
                        ? "bg-white/[0.03] border-white/5 opacity-50 cursor-default"
                        : isSkipped
                        ? "bg-white/[0.03] border-white/5 opacity-40 cursor-default"
                        : "bg-white/[0.02] border-white/5 opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-white/40">
                        {tx.stepNumber.replace("{n}", String(i + 1))}
                      </div>
                      <StatusBadge status={status} tx={tx} />
                    </div>
                    <h3
                      className={`text-base font-semibold mb-1 ${
                        isLocked ? "text-white/50" : "text-white"
                      }`}
                    >
                      {tx[meta.titleKey]}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {isSkipped ? tx.skippedForNow : tx[meta.descKey]}
                    </p>
                    {isCurrent && (
                      <div className="mt-3 inline-flex items-center gap-1 text-purple-300 text-sm font-medium">
                        {tx.startStage}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={lang === "he" ? "M11 17l-5-5m0 0l5-5m-5 5h12" : "M13 7l5 5m0 0l-5 5m5-5H6"}
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {isDone && (
          <>
            <div className="mt-10 bg-gradient-to-br from-emerald-600/20 to-purple-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-3xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-3">
                <svg className="w-7 h-7 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-lg font-semibold mb-4">{tx.allDone}</p>
              <button
                onClick={onOpenSummary}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                {tx.viewSummary} →
              </button>
            </div>

            <div className="mt-5 bg-gradient-to-br from-rose-600/15 to-amber-600/15 backdrop-blur-sm border border-rose-500/20 rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/20 flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{tx.bonusInterview}</h3>
                  <p className="text-white/60 text-sm mb-3">{tx.bonusInterviewDesc}</p>
                  <button
                    onClick={onOpenInterview}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                  >
                    {tx.openInterview}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  tx,
}: {
  status: StageStatus;
  tx: { stageLocked: string; stageCurrent: string; stageDone: string; stageSkipped: string };
}) {
  if (status === "current") {
    return (
      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
        {tx.stageCurrent}
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
        ✓ {tx.stageDone}
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full">
        {tx.stageSkipped}
      </span>
    );
  }
  return (
    <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">
      {tx.stageLocked}
    </span>
  );
}
