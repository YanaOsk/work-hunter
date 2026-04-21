"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdvisorStage,
  AdvisorState,
  CVReview,
  DiagnosisResult,
  DirectionResult,
  LifePath,
  LinkedInProfile,
  MockInterview,
  SearchStrategy,
  UserProfile,
} from "@/lib/types";
import {
  advanceStage,
  clearAdvisorState,
  getAdvisorState,
  saveAdvisorState,
} from "@/lib/advisorState";
import JourneyMap from "./JourneyMap";
import DiagnosisTool from "./DiagnosisTool";
import DirectionTool from "./DirectionTool";
import CVReviewTool from "./CVReviewTool";
import LinkedInTool from "./LinkedInTool";
import StrategyTool from "./StrategyTool";
import MockInterviewTool from "./MockInterviewTool";
import SummaryView from "./SummaryView";
import AdvisorChat from "./AdvisorChat";
import PreJourneyIntro from "./PreJourneyIntro";
import SelfIntro from "./SelfIntro";

type StageView = Exclude<AdvisorStage, "done">;
type View = "map" | "chat" | "summary" | "interview" | StageView;

export default function AdvisorPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const profileId = params.get("profileId");
  const [advisorState, setAdvisorState] = useState<AdvisorState | null>(null);
  const [view, setView] = useState<View>("map");

  useEffect(() => {
    if (!profileId) {
      router.replace("/");
      return;
    }
    const state = getAdvisorState(profileId);
    if (!state) {
      router.replace("/");
      return;
    }
    setAdvisorState(state);
    if (state.currentStage === "done") setView("summary");
  }, [profileId, router]);

  if (!advisorState || !profileId) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  const persist = (next: AdvisorState) => {
    setAdvisorState(next);
    saveAdvisorState(profileId, next);
  };

  const backToMap = () => setView("map");
  const backToSummary = () => setView("summary");

  const handleExit = () => {
    clearAdvisorState(profileId);
    router.push("/");
  };

  // Atomic: apply patch AND advance stage in one state update to avoid stale-closure stomping.
  const completeAndAdvance = (patch: Partial<AdvisorState>) => {
    const next = advanceStage(advisorState.currentStage);
    const updated: AdvisorState = { ...advisorState, ...patch, currentStage: next };
    persist(updated);
    if (next === "done") setView("summary");
    else setView("map");
  };

  const onDiagnosis = (r: DiagnosisResult) => completeAndAdvance({ diagnosis: r });
  const onDirection = (r: DirectionResult, path: LifePath) =>
    completeAndAdvance({ direction: r, chosenPath: path });
  const onCV = (r: CVReview) => completeAndAdvance({ cvReview: r });
  const onCVSkip = () => completeAndAdvance({ cvSkipped: true });
  const onLinkedin = (r: LinkedInProfile) => completeAndAdvance({ linkedin: r });
  const onLinkedinSkip = () => completeAndAdvance({ linkedinSkipped: true });
  const onStrategy = (r: SearchStrategy) => completeAndAdvance({ strategy: r });
  const onInterview = (r: MockInterview) => persist({ ...advisorState, mockInterview: r });

  if (!advisorState.introDismissed) {
    return (
      <PreJourneyIntro
        onStart={() => persist({ ...advisorState, introDismissed: true })}
        onExit={handleExit}
      />
    );
  }

  if (!advisorState.selfIntroCompleted) {
    return (
      <SelfIntro
        advisorState={advisorState}
        onBack={handleExit}
        onComplete={(profile: UserProfile) =>
          persist({ ...advisorState, userProfile: profile, selfIntroCompleted: true })
        }
      />
    );
  }

  if (view === "chat") {
    return <AdvisorChat advisorState={advisorState} onBack={backToMap} onUpdate={persist} />;
  }

  if (view === "summary") {
    return (
      <SummaryView
        advisorState={advisorState}
        onBack={backToMap}
        onOpenInterview={() => setView("interview")}
        onExit={handleExit}
      />
    );
  }

  if (view === "interview") {
    return (
      <MockInterviewTool
        advisorState={advisorState}
        onBack={backToSummary}
        onUpdate={onInterview}
      />
    );
  }

  if (view === "diagnosis") {
    return <DiagnosisTool advisorState={advisorState} onBack={backToMap} onComplete={onDiagnosis} />;
  }

  if (view === "direction") {
    return (
      <DirectionTool
        advisorState={advisorState}
        onBack={backToMap}
        onComplete={onDirection}
      />
    );
  }

  if (view === "cv") {
    return (
      <CVReviewTool
        advisorState={advisorState}
        onBack={backToMap}
        onComplete={onCV}
        onSkip={onCVSkip}
      />
    );
  }

  if (view === "linkedin") {
    return (
      <LinkedInTool
        advisorState={advisorState}
        onBack={backToMap}
        onComplete={onLinkedin}
        onSkip={onLinkedinSkip}
      />
    );
  }

  if (view === "strategy") {
    return (
      <StrategyTool advisorState={advisorState} onBack={backToMap} onComplete={onStrategy} />
    );
  }

  return (
    <JourneyMap
      advisorState={advisorState}
      onStartStage={(s) => setView(s as StageView)}
      onOpenChat={() => setView("chat")}
      onOpenSummary={() => setView("summary")}
      onOpenInterview={() => setView("interview")}
      onExit={handleExit}
    />
  );
}
