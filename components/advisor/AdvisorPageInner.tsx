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
import MockInterviewTool from "./MockInterviewTool";
import SummaryView from "./SummaryView";
import SummaryGate, { UnlockPlan } from "./SummaryGate";
import AdvisorChat from "./AdvisorChat";
import PreJourneyIntro from "./PreJourneyIntro";
import SelfIntro from "./SelfIntro";
import AdvisorHomeButton from "./AdvisorHomeButton";

type StageView = Exclude<AdvisorStage, "done" | "strategy">;
type View = "map" | "chat" | "summary" | "interview" | StageView;

function mergeIntoProfile(
  profile: UserProfile,
  patch: {
    targetRoles?: string[];
    skills?: string[];
    additionalNotes?: string;
    workPreference?: UserProfile["parsedData"]["workPreference"];
    careerChangeInterest?: boolean;
  }
): UserProfile {
  const existing = profile.parsedData;
  const merged = { ...existing };
  if (patch.targetRoles?.length) {
    merged.targetRoles = [...new Set([...(existing.targetRoles ?? []), ...patch.targetRoles])];
  }
  if (patch.skills?.length) {
    merged.skills = [...new Set([...(existing.skills ?? []), ...patch.skills])];
  }
  if (patch.additionalNotes) {
    merged.additionalNotes = [existing.additionalNotes, patch.additionalNotes]
      .filter(Boolean).join("\n\n");
  }
  if (patch.workPreference && !existing.workPreference) {
    merged.workPreference = patch.workPreference;
  }
  if (patch.careerChangeInterest !== undefined && existing.careerChangeInterest === undefined) {
    merged.careerChangeInterest = patch.careerChangeInterest;
  }
  return { ...profile, parsedData: merged };
}

function normalizeStage(stage: AdvisorStage): AdvisorStage {
  // Migrate users who completed the old "strategy" stage → treat as "done"
  if (stage === "strategy") return "done";
  return stage;
}

export default function AdvisorPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session } = useSession();
  const guestProfileId = params.get("profileId");
  const [advisorState, setAdvisorState] = useState<AdvisorState | null>(null);
  const [view, setView] = useState<View>(() => (params.get("view") as View) ?? "map");

  const setViewAndUrl = (v: View) => {
    setView(v);
    const url = new URL(window.location.href);
    if (v === "map") url.searchParams.delete("view");
    else url.searchParams.set("view", v);
    window.history.replaceState({}, "", url.toString());
  };

  const profileId = session?.user?.id ?? guestProfileId;

  useEffect(() => {
    if (!profileId) {
      router.replace("/");
      return;
    }
    if (session?.user?.id && guestProfileId && guestProfileId !== session.user.id) {
      migrateGuestToUser(guestProfileId, session.user.id);
    }

    const emptyProfile: UserProfile = { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] };
    const localState = getAdvisorState(profileId);

    if (localState) {
      const normalized = { ...localState, currentStage: normalizeStage(localState.currentStage) };
      setAdvisorState(normalized);
      if (normalized.currentStage === "done") setViewAndUrl("summary");
      return;
    }

    if (session?.user?.email) {
      fetch("/api/user-meta")
        .then((r) => r.json())
        .then((meta) => {
          if (meta?.advisorState) {
            try {
              const serverState = JSON.parse(meta.advisorState) as AdvisorState;
              const normalized = { ...serverState, currentStage: normalizeStage(serverState.currentStage) };
              saveAdvisorState(profileId, normalized);
              setAdvisorState(normalized);
              if (normalized.currentStage === "done") setView("summary");
              return;
            } catch { /* fall through */ }
          }
          const fresh = createInitialAdvisorState(emptyProfile);
          saveAdvisorState(profileId, fresh);
          setAdvisorState(fresh);
        })
        .catch(() => {
          const fresh = createInitialAdvisorState(emptyProfile);
          saveAdvisorState(profileId, fresh);
          setAdvisorState(fresh);
        });
    } else {
      const fresh = createInitialAdvisorState(emptyProfile);
      saveAdvisorState(profileId, fresh);
      setAdvisorState(fresh);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, session?.user?.id, guestProfileId]);

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
          advisorState: JSON.stringify(next),
        }),
      }).catch(() => {});
    }
  };

  const backToMap = () => setViewAndUrl("map");
  const backToSummary = () => setViewAndUrl("summary");

  const handleExit = () => {
    clearAdvisorState(profileId);
    router.push("/");
  };

  const completeAndAdvance = (patch: Partial<AdvisorState>) => {
    const next = advanceStage(advisorState.currentStage);
    const updated: AdvisorState = { ...advisorState, ...patch, currentStage: next };
    persist(updated);
    if (next === "done") setViewAndUrl("summary");
    else setViewAndUrl("map");
  };

  const onDiagnosis = (r: DiagnosisResult) => {
    const enriched = mergeIntoProfile(advisorState.userProfile, {
      targetRoles: r.topRoles,
      skills: r.strengths,
      additionalNotes: [
        r.topMessage ?? r.summary,
        r.mbtiType && `סוג אישיות: ${r.mbtiType}`,
        r.hollandCode && `Holland: ${r.hollandCode}`,
        r.workEnvironmentFit?.length && `סביבת עבודה מתאימה: ${r.workEnvironmentFit.join(", ")}`,
      ].filter(Boolean).join(" | "),
    });
    completeAndAdvance({ diagnosis: r, userProfile: enriched });
  };

  const onDirection = (r: DirectionResult, path: LifePath) => {
    const chosenOption = r.options.find((o) => o.path === path);
    const enriched = mergeIntoProfile(advisorState.userProfile, {
      careerChangeInterest: path !== "employee",
      additionalNotes: [
        `נתיב נבחר: ${path}`,
        r.rationale,
        chosenOption?.firstSteps?.length
          ? `צעדים ראשונים: ${chosenOption.firstSteps.slice(0, 3).join(" | ")}`
          : undefined,
      ].filter(Boolean).join("\n"),
    });
    completeAndAdvance({ direction: r, chosenPath: path, userProfile: enriched });
  };

  const onCV = (r: CVReview) => completeAndAdvance({ cvReview: r });
  const onCVSkip = () => completeAndAdvance({ cvSkipped: true });
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
        onOpenInterview={() => setViewAndUrl("interview")}
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

  return wrap(
    <JourneyMap
      advisorState={advisorState}
      onStartStage={(s) => setViewAndUrl(s as StageView)}
      onOpenChat={() => setViewAndUrl("chat")}
      onOpenSummary={() => setViewAndUrl("summary")}
      onOpenInterview={() => setViewAndUrl("interview")}
      onExit={handleExit}
    />
  );
}
