"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppState, AppMode, UserProfile } from "@/lib/types";
import { saveProfile } from "@/lib/profiles";
import { DEFAULT_ADVISOR_ID, getOrCreateAdvisorState } from "@/lib/advisorState";
import { consumeAutoStart } from "@/lib/autoStart";
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  // Read module-level queued start (set by in-app links) before first render to avoid flash.
  // Falls back to URL ?start= param for external/direct navigation.
  const [pendingAutoMode, setPendingAutoMode] = useState<AppMode | null>(() => {
    const queued = consumeAutoStart();
    if (queued) return queued;
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("start") as AppMode | null;
      if (p === "jobs" || p === "advisor") return p;
    }
    return null;
  });

  // Clean up URL param if present
  useEffect(() => {
    if (window.location.search) window.history.replaceState({}, "", "/");
  }, []);

  // Restore jobs mode only on browser refresh (not in-app navigation)
  useEffect(() => {
    if (status === "authenticated" && mode === null && !pendingAutoMode) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") {
        const saved = sessionStorage.getItem("wh_mode");
        if (saved === "jobs") setMode("jobs");
      }
    }
  }, [status, mode, pendingAutoMode]);

  // Fetch subscription status once authenticated
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d?.plan && d.plan !== "free") setIsSubscribed(true); })
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (pendingAutoMode && status !== "loading" && mode === null) {
      handleModeChoice(pendingAutoMode);
      setPendingAutoMode(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoMode, status]);

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
    sessionStorage.setItem("wh_mode", chosen);
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

    let jobs: import("@/lib/types").JobResult[] = [];
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
      jobs = data.jobs || [];
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

    // Save conversation regardless of search outcome — server checks auth
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: convMessages, searchContext: context, jobs }),
    }).catch(() => {});
  };

  const handleReset = () => {
    setState(initialState);
    setDemoMode(false);
    setMode(null);
    sessionStorage.removeItem("wh_mode");
  };

  if (mode === null) {
    if (pendingAutoMode) {
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />;
    }
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
          isSubscribed={isSubscribed}
          onReset={handleReset}
        />
      );
  }
}
