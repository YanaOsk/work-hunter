"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AdvisorStage,
  AdvisorState,
  CVReview,
  DiagnosisResult,
  DirectionResult,
  LifePath,
  MockInterview,
  SearchStrategy,
  STAGE_ORDER,
  UserProfile,
} from "@/lib/types";
import {
  advanceStage,
  clearAdvisorState,
  createInitialAdvisorState,
  getAdvisorState,
  migrateGuestToUser,
  saveAdvisorState,
} from "@/lib/advisorState";
import JourneyMap from "./JourneyMap";
import DiagnosisTool from "./DiagnosisTool";
import DirectionTool from "./DirectionTool";
import CVReviewTool from "./CVReviewTool";
import StrategyTool from "./StrategyTool";
import MockInterviewTool from "./MockInterviewTool";
import SummaryView from "./SummaryView";
import SummaryGate, { UnlockPlan } from "./SummaryGate";
import AdvisorChat from "./AdvisorChat";
import PreJourneyIntro from "./PreJourneyIntro";
import SelfIntro from "./SelfIntro";
import AdvisorHomeButton from "./AdvisorHomeButton";

type StageView = Exclude<AdvisorStage, "done">;
type View = "map" | "chat" | "summary" | "interview" | StageView;

export default function AdvisorPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const guestProfileId = params.get("profileId");
  const [advisorState, setAdvisorState] = useState<AdvisorState | null>(null);
  const [view, setView] = useState<View>("map");

  // Use Google user ID when logged in, otherwise fall back to URL profileId
  const profileId = session?.user?.id ?? guestProfileId;

  useEffect(() => {
    if (!profileId) {
      router.replace("/");
      return;
    }
    // If user is logged in, migrate any guest session into their account
    if (session?.user?.id && guestProfileId && guestProfileId !== session.user.id) {
      migrateGuestToUser(guestProfileId, session.user.id);
    }
    const emptyProfile: UserProfile = { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] };
    let state = getAdvisorState(profileId);
    if (!state) {
      state = createInitialAdvisorState(emptyProfile);
      saveAdvisorState(profileId, state);
    }
    setAdvisorState(state);
    if (state.currentStage === "done") setView("summary");
  }, [profileId, session, guestProfileId, router]);

  // Sync isPremium with real subscription so paywall respects purchased plan
  useEffect(() => {
    if (!session?.user?.email || !profileId) return;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => {
        if (d?.plan && d.plan !== "free") {
          setAdvisorState((prev) => {
            if (!prev || prev.isPremium) return prev;
            const updated = { ...prev, isPremium: true };
            saveAdvisorState(profileId, updated);
            return updated;
          });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, profileId]);

  if (!advisorState || !profileId) {
    return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />;
  }

  const persist = (next: AdvisorState) => {
    setAdvisorState(next);
    saveAdvisorState(profileId, next);
    if (session?.user?.email) {
      const completedCount =
        next.currentStage === "done"
          ? STAGE_ORDER.length
          : STAGE_ORDER.indexOf(next.currentStage as AdvisorStage);
      fetch("/api/user-meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorCurrentStage: next.currentStage,
          advisorCompletedCount: completedCount,
        }),
      }).catch(() => {});
    }
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
  const onStrategy = (r: SearchStrategy) => completeAndAdvance({ strategy: r });
  const onInterview = (r: MockInterview) => persist({ ...advisorState, mockInterview: r });

  const onUnlock = (_plan: UnlockPlan) => {
    persist({ ...advisorState, isPremium: true });
  };

  const wrap = (content: React.ReactNode) => (
    <>
      {content}
      <AdvisorHomeButton />
    </>
  );

  if (!advisorState.introDismissed) {
    return wrap(
      <PreJourneyIntro
        onStart={() => persist({ ...advisorState, introDismissed: true })}
        onExit={handleExit}
      />
    );
  }

  if (!advisorState.selfIntroCompleted) {
    return wrap(
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
    return wrap(<AdvisorChat advisorState={advisorState} onBack={backToMap} onUpdate={persist} />);
  }

  if (view === "summary") {
    if (!advisorState.isPremium) {
      return wrap(<SummaryGate onUnlock={onUnlock} onBack={backToMap} />);
    }
    return wrap(
      <SummaryView
        advisorState={advisorState}
        onBack={backToMap}
        onOpenInterview={() => setView("interview")}
        onExit={handleExit}
      />
    );
  }

  if (view === "interview") {
    return wrap(
      <MockInterviewTool
        advisorState={advisorState}
        onBack={backToSummary}
        onUpdate={onInterview}
      />
    );
  }

  if (view === "diagnosis") {
    return wrap(<DiagnosisTool advisorState={advisorState} onBack={backToMap} onComplete={onDiagnosis} />);
  }

  if (view === "direction") {
    return wrap(
      <DirectionTool
        advisorState={advisorState}
        onBack={backToMap}
        onComplete={onDirection}
      />
    );
  }

  if (view === "cv") {
    return wrap(
      <CVReviewTool
        advisorState={advisorState}
        onBack={backToMap}
        onComplete={onCV}
        onSkip={onCVSkip}
      />
    );
  }

  if (view === "strategy") {
    return wrap(<StrategyTool advisorState={advisorState} onBack={backToMap} onComplete={onStrategy} />);
  }

  return wrap(
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
