"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppState, AppMode, UserProfile } from "@/lib/types";
import { saveProfile } from "@/lib/profiles";
import { DEFAULT_ADVISOR_ID, getOrCreateAdvisorState } from "@/lib/advisorState";
import HomeLanding from "@/components/HomeLanding";
import UploadPhase from "@/components/UploadPhase";
import InterviewPhase from "@/components/InterviewPhase";
import SearchingPhase from "@/components/SearchingPhase";
import ResultsPhase from "@/components/ResultsPhase";

const initialState: AppState = {
  phase: "upload",
  userProfile: null,
  chatMessages: [],
  jobResults: [],
  isLoading: false,
  error: null,
};

const emptyProfile: UserProfile = {
  rawText: "",
  parsedData: {},
  missingFields: [],
  clarifyingQuestions: [],
};

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [mode, setMode] = useState<AppMode | null>(null);
  const [state, setState] = useState<AppState>(initialState);
  const [demoMode, setDemoMode] = useState(false);

  const handleModeChoice = (chosen: AppMode) => {
    if (status !== "authenticated") {
      router.push("/auth/signin");
      return;
    }
    if (chosen === "advisor") {
      getOrCreateAdvisorState(DEFAULT_ADVISOR_ID, emptyProfile);
      router.push(`/advisor?profileId=${DEFAULT_ADVISOR_ID}`);
      return;
    }
    setMode(chosen);
  };

  const handleUploadComplete = (profile: UserProfile) => {
    setState((s) => ({ ...s, phase: "interview", userProfile: profile }));
  };

  const handleInterviewComplete = async (
    context: string,
    convMessages: Array<{ role: "user" | "assistant"; content: string }>
  ) => {
    if (state.userProfile) saveProfile(state.userProfile);
    setState((s) => ({ ...s, phase: "searching" }));

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: state.userProfile,
          chatContext: context,
        }),
      });

      const data = await res.json();
      const jobs = data.jobs || [];

      if (status === "authenticated") {
        fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: convMessages, searchContext: context, jobs }),
        }).catch(() => {});
      }

      setDemoMode(data.demoMode || false);
      setState((s) => ({ ...s, phase: "results", jobResults: jobs }));
    } catch {
      setState((s) => ({
        ...s,
        phase: "results",
        jobResults: [],
        error: "Search failed. Check your API keys.",
      }));
    }
  };

  const handleReset = () => {
    setState(initialState);
    setDemoMode(false);
    setMode(null);
  };

  if (mode === null) {
    return <HomeLanding onChoose={handleModeChoice} />;
  }

  switch (state.phase) {
    case "upload":
      return <UploadPhase onComplete={handleUploadComplete} />;
    case "interview":
      return (
        <InterviewPhase
          userProfile={state.userProfile!}
          onComplete={(ctx, msgs) => handleInterviewComplete(ctx, msgs)}
          onBack={() => setState((s) => ({ ...s, phase: "upload", userProfile: null }))}
        />
      );
    case "searching":
      return <SearchingPhase />;
    case "results":
      return (
        <ResultsPhase
          jobs={state.jobResults}
          userProfile={state.userProfile!}
          demoMode={demoMode}
          isSubscribed={false}
          onReset={handleReset}
        />
      );
  }
}
