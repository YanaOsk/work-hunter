"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppState, AppMode, UserProfile, JobResult } from "@/lib/types";
import { saveProfile } from "@/lib/profiles";
import { DEFAULT_ADVISOR_ID, getOrCreateAdvisorState } from "@/lib/advisorState";
import { consumeAutoStart, consumeAdvisorScoutContext } from "@/lib/autoStart";
import HomeLanding from "@/components/HomeLanding";
import WelcomeModal from "@/components/WelcomeModal";
import UploadPhase from "@/components/UploadPhase";
import InterviewPhase from "@/components/InterviewPhase";
import SearchingPhase from "@/components/SearchingPhase";
import ResultsPhase from "@/components/ResultsPhase";
import { useLanguage } from "@/components/LanguageProvider";

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

async function readSearchStream(
  res: Response,
  onJob: (job: JobResult) => void,
  onDone: (demoMode: boolean) => void
) {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "job") onJob(data.job);
          else if (data.type === "done") onDone(data.demoMode ?? false);
        } catch {}
      }
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const [mode, setMode] = useState<AppMode | null>(null);
  const [state, setState] = useState<AppState>(initialState);
  const [showWelcome, setShowWelcome] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [resumeConv, setResumeConv] = useState<{
    id: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  } | null>(null);
  const scoutContextRef = useRef<{
    context: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    convId?: string;
  } | null>(null);
  const [pendingAutoMode, setPendingAutoMode] = useState<AppMode | null>(() => {
    const queued = consumeAutoStart();
    if (queued) return queued;
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("start") as AppMode | null;
      if (p === "jobs" || p === "advisor") return p;
    }
    return null;
  });

  useEffect(() => {
    if (!window.location.search) return;
    const params = new URLSearchParams(window.location.search);
    const continueId = params.get("continueConv");
    window.history.replaceState({}, "", "/");
    if (!continueId) return;
    fetch(`/api/conversations/${continueId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((conv) => {
        if (!conv || conv.error || !Array.isArray(conv.messages)) return;
        setResumeConv({ id: conv.id, messages: conv.messages });
        setState((s) => ({ ...s, phase: "interview", userProfile: emptyProfile }));
        setMode("jobs");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === "authenticated" && mode === null && !pendingAutoMode) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav?.type === "reload") {
        const saved = sessionStorage.getItem("wh_mode");
        if (saved === "jobs") {
          const email = session?.user?.email;
          if (email && !localStorage.getItem(`wh_welcomed_${email}`)) return;
          setMode("jobs");
          const savedConvId = sessionStorage.getItem("wh_conv_id");
          if (savedConvId) {
            fetch(`/api/conversations/${savedConvId}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((conv) => {
                if (!conv || conv.error || !Array.isArray(conv.messages) || conv.messages.length === 0) return;
                setResumeConv({ id: conv.id, messages: conv.messages });
                setState((s) => ({ ...s, phase: "interview", userProfile: emptyProfile }));
              })
              .catch(() => {});
          }
        }
      }
    }
  }, [status, mode, pendingAutoMode, session?.user?.email]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d?.plan && d.plan !== "free") setIsSubscribed(true); })
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && mode === null && !pendingAutoMode) {
      const key = `wh_welcomed_${session.user.email}`;
      if (!localStorage.getItem(key)) {
        setShowWelcome(true);
      } else {
        router.push("/profile");
      }
    }
  }, [status, session?.user?.email, mode, pendingAutoMode, router]);

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
    const advisorCtx = consumeAdvisorScoutContext();
    if (advisorCtx) {
      setMode(chosen);
      setState({ ...initialState, phase: "searching" });
      setIsStreaming(true);
      const searchMsgs: Array<{ role: "user" | "assistant"; content: string }> = [
        { role: "user", content: advisorCtx },
      ];
      const collectedJobs: JobResult[] = [];
      let streamStarted = false;

      (async () => {
        try {
          const res = await fetch("/api/search-jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userProfile: emptyProfile, chatContext: advisorCtx, lang }),
          });
          if (!res.ok) throw new Error("failed");
          await readSearchStream(
            res,
            (job) => {
              collectedJobs.push(job);
              if (!streamStarted) {
                streamStarted = true;
                setState({
                  ...initialState,
                  phase: "results",
                  jobResults: [job],
                  userProfile: emptyProfile,
                });
              } else {
                setState((s) => ({
                  ...s,
                  jobResults: [...s.jobResults, job].sort((a, b) => b.matchScore - a.matchScore),
                }));
              }
            },
            (demo) => {
              setDemoMode(demo);
              setState((s) => ({
                ...s,
                jobResults: [...s.jobResults].sort((a, b) => b.matchScore - a.matchScore),
              }));
            }
          );
        } catch {
          if (!streamStarted) {
            setState({ ...initialState, phase: "results", jobResults: [], userProfile: emptyProfile });
          }
        } finally {
          setIsStreaming(false);
          fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: searchMsgs, searchContext: advisorCtx, jobs: collectedJobs }),
          }).catch(() => {});
        }
      })();
      return;
    }
    setMode(chosen);
  };

  const handleUploadComplete = (profile: UserProfile) => {
    setState((s) => ({ ...s, phase: "interview", userProfile: profile }));
  };

  const handleRefineSearch = () => {
    const ctx = scoutContextRef.current;
    if (!ctx) return;
    setResumeConv(ctx.convId ? { id: ctx.convId, messages: ctx.messages } : null);
    setState((s) => ({ ...s, phase: "interview", userProfile: s.userProfile ?? emptyProfile }));
    setIsStreaming(false);
    setDemoMode(false);
  };

  const handleInterviewComplete = async (
    context: string,
    convMessages: Array<{ role: "user" | "assistant"; content: string }>,
    existingConvId?: string
  ) => {
    scoutContextRef.current = { context, messages: convMessages, convId: existingConvId };
    if (state.userProfile) saveProfile(state.userProfile);
    setState((s) => ({ ...s, phase: "searching" }));
    setIsStreaming(true);

    const collectedJobs: JobResult[] = [];
    let streamStarted = false;
    const capturedProfile = state.userProfile;

    // Enrich profile from Scout conversation in parallel with job search
    (async () => {
      try {
        const fd = new FormData();
        fd.append("freeText", context);
        const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
        if (!res.ok) return;
        const parsed = await res.json();
        if (parsed?.parsedData && Object.keys(parsed.parsedData).length > 0) {
          const enriched: UserProfile = {
            rawText: context,
            parsedData: { ...(capturedProfile?.parsedData ?? {}), ...parsed.parsedData },
            missingFields: parsed.missingFields ?? capturedProfile?.missingFields ?? [],
            clarifyingQuestions: parsed.clarifyingQuestions ?? capturedProfile?.clarifyingQuestions ?? [],
          };
          setState((s) => ({ ...s, userProfile: enriched }));
          saveProfile(enriched);
          // Persist key profile fields to DB so profile page is populated
          const pd = enriched.parsedData;
          const metaPatch: Record<string, unknown> = {};
          if (pd.currentRole)     metaPatch.title           = pd.currentRole;
          if (pd.location)        metaPatch.location        = pd.location;
          if (pd.yearsExperience !== undefined) metaPatch.yearsExperience = pd.yearsExperience;
          if (pd.education)       metaPatch.education       = pd.education;
          if (pd.skills?.length)  metaPatch.skills          = pd.skills;
          if (pd.languages?.length) metaPatch.languages     = pd.languages;
          if (pd.targetRoles?.length) metaPatch.targetRoles = pd.targetRoles;
          if (Object.keys(metaPatch).length > 0) {
            fetch("/api/user-meta", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(metaPatch),
            }).catch(() => {});
          }
        }
      } catch {}
    })();

    try {
      const res = await fetch("/api/search-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: capturedProfile, chatContext: context, lang }),
      });
      if (!res.ok) throw new Error("Search failed");

      await readSearchStream(
        res,
        (job) => {
          collectedJobs.push(job);
          if (!streamStarted) {
            streamStarted = true;
            setState((s) => ({ ...s, phase: "results", jobResults: [job] }));
          } else {
            setState((s) => ({
              ...s,
              jobResults: [...s.jobResults, job].sort((a, b) => b.matchScore - a.matchScore),
            }));
          }
        },
        (demo) => {
          setDemoMode(demo);
          setState((s) => ({
            ...s,
            jobResults: [...s.jobResults].sort((a, b) => b.matchScore - a.matchScore),
          }));
        }
      );
    } catch {
      if (!streamStarted) {
        setState((s) => ({
          ...s,
          phase: "results",
          jobResults: [],
          error: "Search failed. Check your API keys.",
        }));
      }
    } finally {
      setIsStreaming(false);
    }

    if (existingConvId) {
      fetch(`/api/conversations/${existingConvId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: convMessages, searchContext: context, jobs: collectedJobs }),
      }).catch(() => {});
    } else {
      fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: convMessages, searchContext: context, jobs: collectedJobs }),
      }).catch(() => {});
    }
  };

  const handleReset = () => {
    setState(initialState);
    setDemoMode(false);
    setIsStreaming(false);
    setResumeConv(null);
    sessionStorage.removeItem("wh_conv_id");
  };

  if (mode === null) {
    if (pendingAutoMode || status === "loading") {
      return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />;
    }
    if (showWelcome && session?.user) {
      return (
        <WelcomeModal
          userName={session.user.name ?? ""}
          userEmail={session.user.email ?? ""}
        />
      );
    }
    if (status === "authenticated") {
      return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />;
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
          onComplete={(ctx: string, msgs: Array<{ role: "user" | "assistant"; content: string }>, convId?: string) => handleInterviewComplete(ctx, msgs, convId)}
          onBack={() => {
            setState((s) => ({ ...s, phase: "upload", userProfile: null }));
            setResumeConv(null);
            sessionStorage.removeItem("wh_conv_id");
          }}
          initialMessages={resumeConv?.messages}
          initialConvId={resumeConv?.id}
          initialReadyToSearch={resumeConv !== null && state.jobResults.length > 0}
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
          isStreaming={isStreaming}
          onReset={handleReset}
          onRefine={scoutContextRef.current ? handleRefineSearch : undefined}
        />
      );
  }
}
