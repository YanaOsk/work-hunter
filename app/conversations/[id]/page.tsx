"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { queueAutoStart } from "@/lib/autoStart";
import { useLanguage } from "@/components/LanguageProvider";
import type { ConversationFull, JobSnap } from "@/lib/conversations";

function timeStr(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ScoreChip({ score }: { score: number }) {
  const cls = score >= 80 ? "bg-green-500/20 text-green-400 border-green-500/30"
            : score >= 60 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-white/8 text-white/40 border-white/15";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{score}%</span>;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const he = lang === "he";
  const [conv, setConv] = useState<ConversationFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    fetch(`/api/conversations/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => setConv(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={he ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"} />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {conv?.title ?? (he ? "שיחה עם Scout" : "Scout Conversation")}
            </p>
            {conv && <p className="text-white/40 text-xs">{timeStr(conv.createdAt)}</p>}
          </div>
          <Link href="/profile" className="text-purple-400 hover:text-purple-300 text-sm transition flex-shrink-0">
            {he ? "לפרופיל ←" : "→ Profile"}
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="h-16 w-64 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg mb-2">{he ? "השיחה לא נמצאה" : "Conversation not found"}</p>
            <Link href="/profile" className="text-purple-400 hover:text-purple-300 text-sm transition">
              {he ? "חזרה לפרופיל ←" : "Back to profile →"}
            </Link>
          </div>
        )}

        {/* Conversation messages */}
        {conv && (
          <>
            <div className="space-y-4">
              {conv.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center me-3 flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                  )}
                  <div className={`max-w-lg rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-ee-sm"
                      : "bg-white/10 text-white/90 rounded-es-sm border border-white/10"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Jobs found */}
            {conv.jobs.length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-white font-medium text-sm">
                    {he ? `${conv.jobs.length} משרות שנמצאו` : `${conv.jobs.length} jobs found`}
                  </p>
                </div>
                <div className="divide-y divide-white/5">
                  {conv.jobs.map((job: JobSnap) => (
                    <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition group">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate group-hover:text-purple-300 transition">
                          {job.title}
                        </p>
                        <p className="text-white/40 text-xs truncate">{job.company} · {job.source}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <ScoreChip score={job.matchScore} />
                        {job.isRemote && (
                          <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                            {he ? "מרחוק" : "Remote"}
                          </span>
                        )}
                        <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Start new search CTA */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {he ? "חיפוש חדש" : "New search"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
