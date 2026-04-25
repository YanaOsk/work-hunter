"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AdvisorState, ChatMessage } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

const FREE_CHAT_LIMIT = 5;

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onUpdate: (next: AdvisorState) => void;
}

export default function AdvisorChat({ advisorState, onBack, onUpdate }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sentCount = advisorState.chatMessageCount;
  const remaining = Math.max(0, FREE_CHAT_LIMIT - sentCount);
  const limitReached = !advisorState.isPremium && sentCount >= FREE_CHAT_LIMIT;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [advisorState.chatMessages.length]);

  const send = async () => {
    if (!input.trim() || sending || limitReached) return;
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    const nextMessages = [...advisorState.chatMessages, userMsg];
    const nextCount = sentCount + 1;
    onUpdate({ ...advisorState, chatMessages: nextMessages, chatMessageCount: nextCount });
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          advisorState: { ...advisorState, chatMessages: nextMessages },
          lang,
        }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: data.message || data.error || "Error",
        timestamp: new Date(),
      };
      onUpdate({
        ...advisorState,
        chatMessages: [...nextMessages, assistantMsg],
        chatMessageCount: nextCount,
      });
    } catch {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: "Connection error.",
        timestamp: new Date(),
      };
      onUpdate({
        ...advisorState,
        chatMessages: [...nextMessages, errorMsg],
        chatMessageCount: nextCount,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm">
            {tx.backToAdvisor}
          </button>
          <h1 className="text-lg font-semibold text-white">{tx.advisorTitle}</h1>
          <div className="w-24" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {advisorState.chatMessages.length === 0 && (
            <div className="text-center py-12 text-white/40">{tx.advisorSubtitle}</div>
          )}
          {advisorState.chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
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
        </div>
      </div>

      <div className="p-4 md:p-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          {limitReached ? (
            <div className="bg-gradient-to-br from-purple-600/20 to-rose-600/20 border border-purple-500/40 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-1">{tx.chatLimitTitle}</h3>
              <p className="text-white/70 text-sm mb-4">
                {tx.chatLimitDesc.replace("{count}", String(FREE_CHAT_LIMIT))}
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition"
              >
                {tx.chatLimitCta}
              </Link>
            </div>
          ) : (
            <>
              {!advisorState.isPremium && (
                <p className="text-white/40 text-xs mb-2 text-center">
                  {tx.chatRemaining.replace("{remaining}", String(remaining))}
                </p>
              )}
              <div className="flex gap-3">
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
                  placeholder={tx.advisorChatPlaceholder}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
