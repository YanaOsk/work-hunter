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
    return "done";
  }
  const currentIdx = STAGE_ORDER.indexOf(state.currentStage);
  const stageIdx = STAGE_ORDER.indexOf(stage);
  if (stageIdx < currentIdx) {
    if (stage === "cv" && state.cvSkipped) return "skipped";
    return "done";
  }
  if (stageIdx === currentIdx) return "current";
  return "locked";
}

type TxKey = keyof typeof t.he;

const STAGE_CONFIG: Record<
  Exclude<AdvisorStage, "done">,
  {
    titleKey: TxKey;
    descKey: TxKey;
    icon: string;
    color: { ring: string; icon: string; badge: string; card: string; glow: string; num: string };
    duration: string;
  }
> = {
  diagnosis: {
    titleKey: "toolDiagnosis",
    descKey: "toolDiagnosisDesc",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: {
      ring: "ring-purple-500 shadow-purple-500/30",
      icon: "text-purple-300 bg-purple-500/20",
      badge: "bg-purple-500/20 text-purple-300",
      card: "border-purple-500/30 bg-purple-500/5",
      glow: "from-purple-600/20",
      num: "text-purple-400",
    },
    duration: "~8 min",
  },
  direction: {
    titleKey: "toolDirection",
    descKey: "toolDirectionDesc",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    color: {
      ring: "ring-emerald-500 shadow-emerald-500/30",
      icon: "text-emerald-300 bg-emerald-500/20",
      badge: "bg-emerald-500/20 text-emerald-300",
      card: "border-emerald-500/30 bg-emerald-500/5",
      glow: "from-emerald-600/20",
      num: "text-emerald-400",
    },
    duration: "~10 min",
  },
  cv: {
    titleKey: "toolCv",
    descKey: "toolCvDesc",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    color: {
      ring: "ring-blue-500 shadow-blue-500/30",
      icon: "text-blue-300 bg-blue-500/20",
      badge: "bg-blue-500/20 text-blue-300",
      card: "border-blue-500/30 bg-blue-500/5",
      glow: "from-blue-600/20",
      num: "text-blue-400",
    },
    duration: "~12 min",
  },
  strategy: {
    titleKey: "toolStrategy",
    descKey: "toolStrategyDesc",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    color: {
      ring: "ring-amber-500 shadow-amber-500/30",
      icon: "text-amber-300 bg-amber-500/20",
      badge: "bg-amber-500/20 text-amber-300",
      card: "border-amber-500/30 bg-amber-500/5",
      glow: "from-amber-600/20",
      num: "text-amber-400",
    },
    duration: "~15 min",
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

  const completedCount = STAGE_ORDER.filter((s) => {
    const status = getStageStatus(s, advisorState);
    return status === "done" || status === "skipped";
  }).length;
  const progressPct = isDone ? 100 : Math.round((completedCount / STAGE_ORDER.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onExit} className="text-white/40 hover:text-white text-sm transition">
            {tx.newSearch}
          </button>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {tx.advisorChatTitle}
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-300/70 text-sm mb-1">
            {name ? `${tx.journeyTitle} · ${name}` : tx.journeyTitle}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">
            {tx.journeyIntro}
          </h1>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-sm font-semibold tabular-nums ${isDone ? "text-emerald-400" : "text-white/60"}`}>
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Stage cards */}
        <div className="space-y-3 mb-8">
          {STAGE_ORDER.map((stage, i) => {
            const status = getStageStatus(stage, advisorState);
            const cfg = STAGE_CONFIG[stage as Exclude<AdvisorStage, "done">];
            const isCurrent = status === "current";
            const isDoneSt = status === "done";
            const isSkipped = status === "skipped";
            const isLocked = status === "locked";
            const isClickable = isCurrent;

            return (
              <div key={stage} className="relative">
                <button
                  onClick={() => isClickable && onStartStage(stage)}
                  disabled={!isClickable}
                  className={`w-full text-start rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCurrent
                      ? `${cfg.color.card} shadow-lg ${cfg.color.ring} ring-1 hover:scale-[1.01] cursor-pointer`
                      : isDoneSt
                      ? "bg-white/[0.04] border-white/10 opacity-70"
                      : isSkipped
                      ? "bg-white/[0.02] border-white/5 opacity-50"
                      : "bg-white/[0.02] border-white/5 opacity-35 cursor-not-allowed"
                  }`}
                >
                  {/* Gradient top edge for current */}
                  {isCurrent && (
                    <div className={`absolute top-0 start-0 end-0 h-0.5 bg-gradient-to-r ${cfg.color.glow} to-transparent`} />
                  )}

                  <div className="p-5 flex items-start gap-4">
                    {/* Step number / status icon */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isCurrent ? cfg.color.icon + " ring-1 ring-white/10"
                      : isDoneSt ? "bg-emerald-500/15"
                      : isSkipped ? "bg-slate-700/30"
                      : "bg-white/5"
                    }`}>
                      {isDoneSt ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isSkipped ? (
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      ) : isLocked ? (
                        <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${cfg.color.icon.split(" ")[0]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.color.icon.includes("text-") ? cfg.color.icon.split(" ")[0] : cfg.color.icon} />
                        </svg>
                      )}
                      {isCurrent && (
                        <svg className={`w-5 h-5 ${cfg.color.icon.split(" ")[0]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          isDoneSt ? "text-emerald-400" : isLocked || isSkipped ? "text-white/20" : cfg.color.num
                        }`}>
                          {tx.stepNumber.replace("{n}", String(i + 1))}
                        </span>
                        {isDoneSt && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                            ✓ {tx.stageDone}
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
                            {tx.stageSkipped}
                          </span>
                        )}
                        {isLocked && (
                          <span className="text-[10px] bg-white/5 text-white/20 px-2 py-0.5 rounded-full">
                            {tx.stageLocked}
                          </span>
                        )}
                        {isCurrent && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color.badge}`}>
                            {tx.stageCurrent}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-white/30 ms-auto">{cfg.duration}</span>
                        )}
                      </div>

                      <h3 className={`font-bold text-base mb-1 leading-snug ${
                        isLocked ? "text-white/30" : isDoneSt ? "text-white/60" : "text-white"
                      }`}>
                        {tx[cfg.titleKey]}
                      </h3>

                      <p className={`text-sm leading-relaxed ${
                        isLocked ? "text-white/15" : isDoneSt ? "text-white/30" : isSkipped ? "text-white/25" : "text-white/55"
                      }`}>
                        {isSkipped ? tx.skippedForNow : tx[cfg.descKey]}
                      </p>

                      {isCurrent && (
                        <div className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${cfg.color.icon.split(" ")[0]}`}>
                          {tx.startStage}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Animated ring for current stage */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none">
                      <div className={`absolute inset-0 rounded-2xl ring-1 ${cfg.color.ring} opacity-40 animate-pulse`} />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Done state */}
        {isDone && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-600/15 via-purple-600/10 to-emerald-600/15 border border-emerald-500/25 rounded-3xl p-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{tx.allDone}</h2>
              <p className="text-white/50 text-sm mb-5">{tx.summarySubtitle}</p>
              <button
                onClick={onOpenSummary}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold px-7 py-3 rounded-xl transition shadow-lg shadow-purple-500/20"
              >
                {tx.viewSummary}
              </button>
            </div>

            <div className="bg-rose-600/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm mb-1">{tx.bonusInterview}</h3>
                <p className="text-white/50 text-xs mb-3 leading-relaxed">{tx.bonusInterviewDesc}</p>
                <button
                  onClick={onOpenInterview}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  {tx.openInterview}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
