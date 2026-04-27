"use client";

import { useEffect, useRef, useState } from "react";
import { AdvisorState, ChatMessage, MockInterview } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import StageIntro from "./StageIntro";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onUpdate: (next: MockInterview) => void;
}

type Stage = "intro" | "role" | "chatting" | "fetching-feedback" | "done";

export default function MockInterviewTool({ advisorState, onBack, onUpdate }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const existing = advisorState.mockInterview;

  const [stage, setStage] = useState<Stage>(
    existing?.feedback ? "done" : existing?.messages.length ? "chatting" : "intro"
  );
  const [role, setRole] = useState(existing?.role || "");
  const [messages, setMessages] = useState<ChatMessage[]>(existing?.messages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(existing?.finished || false);
  const [error, setError] = useState("");
  const [localFeedback, setLocalFeedback] = useState<string | null>(existing?.feedback || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  const persist = (partial: Partial<MockInterview>) => {
    const next: MockInterview = {
      role,
      messages,
      finished,
      feedback: existing?.feedback || null,
      completedAt: existing?.completedAt || null,
      ...partial,
    };
    onUpdate(next);
  };

  const start = async () => {
    if (!role.trim()) return;
    setStage("chatting");
    setSending(true);
    try {
      const res = await fetch("/api/advisor/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState.userProfile,
          role: role.trim(),
          messages: [],
          chosenPath: advisorState.chosenPath,
          direction: advisorState.direction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const firstQuestion: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages([firstQuestion]);
      setFinished(!!data.finished);
      persist({ role: role.trim(), messages: [firstQuestion], finished: !!data.finished });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown");
      setStage("role");
    } finally {
      setSending(false);
    }
  };

  const send = async () => {
    if (!input.trim() || sending || finished) return;
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/advisor/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState.userProfile,
          role,
          messages: nextMsgs,
          chosenPath: advisorState.chosenPath,
          direction: advisorState.direction,
        }),
      });
      const data = await res.json();
      const interviewerMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      const finalMsgs = [...nextMsgs, interviewerMsg];
      setMessages(finalMsgs);
      setFinished(!!data.finished);
      persist({ messages: finalMsgs, finished: !!data.finished });
    } catch {
      setError("Connection error.");
    } finally {
      setSending(false);
    }
  };

  const getFeedback = async () => {
    setStage("fetching-feedback");
    try {
      const res = await fetch("/api/advisor/mock-interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState.userProfile,
          role,
          messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLocalFeedback(data.feedback);
      persist({ feedback: data.feedback, completedAt: data.completedAt });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown");
      setStage("chatting");
    }
  };

  const restart = () => {
    setStage("role");
    setRole("");
    setMessages([]);
    setInput("");
    setFinished(false);
    setError("");
    setLocalFeedback(null);
    onUpdate({ role: "", messages: [], finished: false, feedback: null, completedAt: null });
  };

  if (stage === "intro") {
    return (
      <StageIntro
        title={tx.toolInterview}
        intro={tx.introInterview}
        actionLabel={tx.startStage}
        onBack={onBack}
        onAction={() => setStage("role")}
      />
    );
  }

  if (stage === "role") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
            {tx.backToAdvisor}
          </button>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
            <h1 className="text-2xl font-bold text-white">{tx.toolInterview}</h1>
            <p className="text-white/70 leading-relaxed">{tx.interviewIntroRole}</p>

            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder={tx.interviewRolePlaceholder}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={start}
              disabled={!role.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
            >
              {tx.interviewStart}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "fetching-feedback") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-purple-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/70">{tx.interviewGettingFeedback}</p>
        </div>
      </div>
    );
  }

  const feedbackText = localFeedback ?? existing?.feedback ?? null;

  if (stage === "done" && feedbackText) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
            {tx.backToAdvisor}
          </button>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{tx.interviewFeedback}</h1>
              <span className="text-white/50 text-sm">{existing?.role ?? role}</span>
            </div>

            <div className="bg-white/5 border border-purple-500/30 rounded-xl p-5 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
              {feedbackText}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onBack}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition"
              >
                {tx.backToAdvisor}
              </button>
              <button
                onClick={restart}
                className="text-purple-300 hover:text-purple-200 text-sm underline"
              >
                {tx.interviewRestart}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm">
            {tx.backToAdvisor}
          </button>
          <div className="text-center">
            <h1 className="text-base font-semibold text-white">{tx.toolInterview}</h1>
            <p className="text-purple-300 text-xs">{role}</p>
          </div>
          <button
            onClick={getFeedback}
            disabled={messages.length < 2}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition"
          >
            {tx.interviewEnd}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-white border border-white/10"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white/70 rounded-2xl px-4 py-3 border border-white/10">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
            </div>
          )}
          {finished && !sending && (
            <div className="text-center text-emerald-300 text-sm py-4">↑ {tx.interviewEnd}</div>
          )}
        </div>
      </div>

      {!finished && (
        <div className="p-6 border-t border-white/10">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={tx.interviewYourTurn}
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 rounded-xl transition"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
