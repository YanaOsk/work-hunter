"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  userProfile: UserProfile;
  onComplete: (context: string, messages: Array<{ role: "user" | "assistant"; content: string }>) => void;
  onBack: () => void;
}

export default function InterviewPhase({ userProfile, onComplete, onBack }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyToSearch, setReadyToSearch] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const addMessage = (role: "user" | "assistant", content: string): ChatMessage => {
    const msg: ChatMessage = { id: Math.random().toString(36).substr(2, 9), role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const rawText = userProfile.rawText?.trim();

    const fallbackGreeting = lang === "he"
      ? "היי! אני Scout. קראתי את מה שכתבת ואני כאן כדי לעזור לך למצוא את ההזדמנות הנכונה. מה הכי חשוב לך בתפקיד הבא?"
      : "Hi! I'm Scout. I read your profile and I'm here to help you find the right opportunity. What matters most to you in your next role?";

    if (rawText) {
      // Show the user's initial text as their first visible message in the chat
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
          addMessage("assistant", data.message || fallbackGreeting);
          if (data.readyToSearch) setReadyToSearch(true);
        })
        .catch(() => {
          addMessage("assistant", fallbackGreeting);
        })
        .finally(() => setLoading(false));
    } else {
      const greeting = lang === "he"
        ? "היי! אני Scout, המדריך האישי שלך לקריירה. ספר לי על עצמך — מה הרקע שלך ומה אתה מחפש?"
        : "Hi! I'm Scout, your personal career guide. Tell me about yourself — what's your background and what are you looking for?";
      addMessage("assistant", greeting);
    }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, readyToSearch]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    const userMsg = addMessage("user", userText);
    setLoading(true);
    try {
      const history = [...messages, { id: "tmp", role: "user" as const, content: userText, timestamp: new Date() }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, userProfile, lang }),
      });
      const data = await res.json();
      if (!res.ok || data.error || !data.message) {
        const errMsg = lang === "he"
          ? "שגיאה זמנית — אנא נסה שוב עוד כמה שניות."
          : "Temporary error — please try again in a moment.";
        addMessage("assistant", errMsg);
      } else {
        addMessage("assistant", data.message);
        const updated = [...messages, userMsg, { id: "tmp2", role: "assistant" as const, content: data.message, timestamp: new Date() }];
        setAllMessages(updated);
        if (data.readyToSearch) setReadyToSearch(true);
      }
    } catch {
      const errMsg = lang === "he"
        ? "שגיאה בחיבור — אנא נסה שוב."
        : "Connection error — please try again.";
      addMessage("assistant", errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startSearch = () => {
    const msgs = allMessages.length ? allMessages : messages;
    const context = msgs.map((m) => `${m.role}: ${m.content}`).join("\n");
    const plainMsgs = msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    onComplete(context, plainMsgs);
  };

  const profileData = userProfile.parsedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
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

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center me-3 flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl rounded-es-sm px-4 py-4 max-w-lg">
                <p className="text-green-300 text-sm font-medium mb-1">{tx.readyTitle}</p>
                <p className="text-white/60 text-xs mb-3">{tx.readySubtitle}</p>
                <button onClick={startSearch}
                  className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {tx.searchNow}
                </button>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={readyToSearch ? tx.keepRefining : tx.typeAnswer}
            rows={1}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none transition" />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition-all flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
