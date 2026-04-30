"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, UserProfile, JobResult } from "@/lib/types";
import { HiddenMarketResult } from "@/lib/jobSearch";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import ScoutRobot from "./ScoutRobot";
import { renderMixedText } from "@/lib/rtl";

interface EnrichedMessage extends ChatMessage {
  jobs?: JobResult[];
  hiddenMarket?: HiddenMarketResult | null;
  demoMode?: boolean;
}

interface Props {
  userProfile: UserProfile;
  onComplete: (context: string, messages: Array<{ role: "user" | "assistant"; content: string }>, convId?: string) => void;
  onBack: () => void;
  initialMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  initialConvId?: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
    score >= 60 ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
    score >= 40 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
    "bg-red-500/20 text-red-300 border-red-500/30";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}%
    </span>
  );
}

function InlineJobCard({ job, lang }: { job: JobResult; lang: string }) {
  const isHe = lang === "he";
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <ScoreBadge score={job.matchScore} />
            {job.isNonObvious && (
              <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full">
                {isHe ? "כיוון לא מובן מאליו" : "Non-obvious pick"}
              </span>
            )}
            {job.isRemote && (
              <span className="text-xs bg-sky-500/15 text-sky-300 border border-sky-500/25 px-2 py-0.5 rounded-full">
                {isHe ? "מרחוק" : "Remote"}
              </span>
            )}
          </div>
          <h4 className="text-white font-semibold text-sm leading-tight">{job.title}</h4>
          <p className="text-white/50 text-xs">{job.company} · {job.source}</p>
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
        >
          {isHe ? "להגשה" : "Apply"}
        </a>
      </div>

      {job.salaryRange && (
        <p className="text-emerald-400 text-xs mb-2">💰 {job.salaryRange}</p>
      )}

      <ul className="space-y-1">
        {job.matchReasons.slice(0, 3).map((reason, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-white/70">
            <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HiddenMarketCard({ data, lang }: { data: HiddenMarketResult; lang: string }) {
  const isHe = lang === "he";
  const [copied, setCopied] = useState(false);

  const copyTemplate = () => {
    navigator.clipboard.writeText(data.outreachTemplate).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mt-3 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-amber-400 text-lg">🔍</span>
        <h4 className="text-amber-300 font-semibold text-sm">
          {isHe ? "שוק נסתר — מסלול חלופי" : "Hidden Market Strategy"}
        </h4>
      </div>

      {data.intro && (
        <p className="text-white/70 text-xs leading-relaxed">{data.intro}</p>
      )}

      {data.facebookGroups?.length > 0 && (
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">
            {isHe ? "קבוצות פייסבוק מומלצות" : "Recommended Facebook Groups"}
          </p>
          <div className="space-y-2">
            {data.facebookGroups.map((g, i) => (
              <div key={i} className="bg-white/5 rounded-xl px-3 py-2">
                <p className="text-white text-xs font-medium">{g.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{g.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.linkedinTip && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-2">
          <p className="text-sky-300 text-xs font-semibold mb-0.5">LinkedIn</p>
          <p className="text-white/70 text-xs leading-relaxed">{data.linkedinTip}</p>
        </div>
      )}

      {data.outreachTemplate && (
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">
            {isHe ? "תבנית פנייה ישירה" : "Outreach Template"}
          </p>
          <div className="bg-white/5 rounded-xl px-3 py-2 relative">
            <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap pr-8">{data.outreachTemplate}</p>
            <button
              onClick={copyTemplate}
              className="absolute top-2 end-2 text-white/30 hover:text-white/70 transition"
              title={isHe ? "העתק" : "Copy"}
            >
              {copied ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPhase({ userProfile, onComplete, onBack, initialMessages, initialConvId }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyToSearch, setReadyToSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const convIdRef = useRef<string | null>(null);
  const messagesRef = useRef<EnrichedMessage[]>([]);

  const autoSave = async (plainMessages: Array<{ role: "user" | "assistant"; content: string }>) => {
    if (!convIdRef.current) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: plainMessages, skipTitle: true }),
        });
        if (res.ok) {
          const data = await res.json();
          convIdRef.current = data.id;
          sessionStorage.setItem("wh_conv_id", data.id);
        }
      } catch {}
    } else {
      fetch(`/api/conversations/${convIdRef.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: plainMessages }),
      }).catch(() => {});
    }
  };

  const addMessage = (role: "user" | "assistant", content: string, extras?: Partial<EnrichedMessage>): EnrichedMessage => {
    const msg: EnrichedMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      content,
      timestamp: new Date(),
      ...extras,
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Resuming an existing conversation
    if (initialMessages && initialMessages.length > 0) {
      const enriched: EnrichedMessage[] = initialMessages.map((m) => ({
        id: Math.random().toString(36).substr(2, 9),
        role: m.role,
        content: m.content,
        timestamp: new Date(),
      }));
      setMessages(enriched);
      if (initialConvId) convIdRef.current = initialConvId;
      return;
    }

    const rawText = userProfile.rawText?.trim();
    const fallbackGreeting = lang === "he"
      ? "היי! אני Scout. קראתי את מה שכתבתם ואני כאן כדי לעזור לכם למצוא את ההזדמנות הנכונה. מה הכי חשוב לכם בתפקיד הבא?"
      : "Hi! I'm Scout. I read your profile and I'm here to help you find the right opportunity. What matters most to you in your next role?";

    if (rawText) {
      const userMsg = addMessage("user", rawText);
      setLoading(true);

      const initMessages: ChatMessage[] = [
        { id: userMsg.id, role: "user", content: rawText, timestamp: userMsg.timestamp },
      ];

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: initMessages, userProfile, lang }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.readyToSearch) setReadyToSearch(true);
          addMessage("assistant", data.message || fallbackGreeting);
          autoSave([
            { role: "user", content: rawText },
            { role: "assistant", content: data.message || fallbackGreeting },
          ]);
        })
        .catch(() => addMessage("assistant", fallbackGreeting))
        .finally(() => setLoading(false));
    } else {
      const greeting = lang === "he"
        ? "היי! אני Scout, המלווה הקריירי שלכם. ספרו לי על עצמכם — מה הרקע שלכם ומה אתם מחפשים?"
        : "Hi! I'm Scout, your personal career guide. Tell me about yourself — what's your background and what are you looking for?";
      addMessage("assistant", greeting);
      autoSave([{ role: "assistant", content: greeting }]);
    }
  }, []);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    addMessage("user", userText);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { id: "tmp", role: "user", content: userText, timestamp: new Date() }],
          userProfile,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.message) {
        addMessage("assistant", lang === "he"
          ? "שגיאה זמנית — אנא נסו שוב עוד כמה שניות."
          : "Temporary error — please try again in a moment.");
      } else {
        if (data.readyToSearch) setReadyToSearch(true);
        addMessage("assistant", data.message);
        const allPlain = [
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: userText },
          { role: "assistant" as const, content: data.message },
        ];
        autoSave(allPlain);
      }
    } catch {
      addMessage("assistant", lang === "he"
        ? "שגיאה בחיבור — אנא נסו שוב."
        : "Connection error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !readyToSearch) { e.preventDefault(); sendMessage(); }
  };

  const handleStartSearch = () => {
    const context = messagesRef.current
      .slice(-12)
      .map((m) => `${m.role === "user" ? "מועמד" : "Scout"}: ${m.content}`)
      .join("\n");
    onComplete(context, messagesRef.current.map((m) => ({ role: m.role, content: m.content })), convIdRef.current ?? undefined);
  };

  const profileData = userProfile.parsedData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-3 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              title={lang === "he" ? "חזור אחורה" : "Go back"}
            >
              <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "he" ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"} />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{tx.interviewTitle}</p>
              <p className="text-purple-400 text-xs">{tx.interviewSubtitle}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {Array.isArray(profileData?.skills) && profileData.skills.slice(0, 3).map((s) => (
              <span key={s} className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs px-2 py-1 rounded-full">{s}</span>
            ))}
            {profileData?.yearsExperience && (
              <span className="bg-white/5 border border-white/20 text-white/60 text-xs px-2 py-1 rounded-full">
                {profileData.yearsExperience} {tx.expYears}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative">

        {/* Robot — always visible, big when empty, small corner when chatting */}
        <div className={`pointer-events-none select-none flex flex-col items-center transition-all duration-700 ${
          messages.length === 0
            ? "justify-center opacity-40 py-6"
            : "absolute bottom-4 end-3 opacity-15 w-16"
        }`}>
          <ScoutRobot className={messages.length === 0 ? "w-32" : "w-full"} />
          {messages.length === 0 && (
            <p className="text-purple-400/60 text-sm mt-2 font-medium tracking-wide">Scout</p>
          )}
        </div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center me-3 flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                )}
                <div className={`max-w-[85vw] sm:max-w-lg rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-ee-sm"
                    : "bg-white/10 text-white/90 rounded-es-sm border border-white/10"
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{renderMixedText(msg.content)}</p>
                </div>
              </div>

            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center me-3 flex-shrink-0">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl rounded-es-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {readyToSearch && !loading && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={handleStartSearch}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl text-base sm:text-lg transition-all shadow-lg shadow-emerald-900/40 animate-pulse hover:animate-none"
              >
                {lang === "he" ? "הבנתי הכל! בואו נתחיל בחיפוש 🚀" : "Got everything! Let's start searching 🚀"}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={readyToSearch}
            placeholder={readyToSearch
              ? (lang === "he" ? "לחצו על הכפתור הירוק למעלה כדי להתחיל בחיפוש" : "Click the green button above to start searching")
              : tx.typeAnswer
            }
            rows={1}
            className={`flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none transition ${readyToSearch ? "opacity-40 cursor-not-allowed" : ""}`}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || readyToSearch}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
