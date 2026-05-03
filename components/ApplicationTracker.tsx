"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ApplicationStatus, JobApplication, UserProfile, DiagnosisResult } from "@/lib/types";
import {
  getApplications,
  mergeWithServer,
  removeApplication,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/lib/applicationTracker";
import { DEFAULT_ADVISOR_ID, getAdvisorState } from "@/lib/advisorState";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CoverLetterModal from "./CoverLetterModal";

interface NegotiationState {
  loading: boolean;
  script?: string;
  keyPoints?: string[];
  copied?: boolean;
  error?: string;
}

const STATUS_ORDER: ApplicationStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

function statusColor(s: ApplicationStatus) {
  if (s === "saved") return "bg-white/10 text-white/60";
  if (s === "applied") return "bg-blue-500/20 text-blue-300";
  if (s === "interview") return "bg-purple-500/20 text-purple-300";
  if (s === "offer") return "bg-emerald-500/20 text-emerald-300";
  return "bg-rose-500/20 text-rose-400";
}

function relativeDate(iso: string, lang: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return lang === "he" ? "היום" : "Today";
  if (days === 1) return lang === "he" ? "אתמול" : "Yesterday";
  return lang === "he" ? `לפני ${days} ימים` : `${days} days ago`;
}

export default function ApplicationTracker() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { data: session } = useSession();
  const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;

  const [apps, setApps] = useState<JobApplication[]>([]);
  const [coverLetterJob, setCoverLetterJob] = useState<JobApplication | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [negotiations, setNegotiations] = useState<Record<string, NegotiationState>>({});
  const [advisorProfile, setAdvisorProfile] = useState<{ userProfile: UserProfile; diagnosis: DiagnosisResult | null } | null>(null);

  useEffect(() => {
    mergeWithServer(profileId).then(() => {
      setApps(getApplications(profileId));
    });
    const state = getAdvisorState(profileId);
    if (state) setAdvisorProfile({ userProfile: state.userProfile, diagnosis: state.diagnosis });
  }, [profileId]);

  const handleNegotiate = async (app: JobApplication) => {
    setNegotiations((prev) => ({ ...prev, [app.id]: { loading: true } }));
    try {
      const res = await fetch("/api/advisor/negotiation-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorProfile?.userProfile ?? { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] },
          diagnosis: advisorProfile?.diagnosis ?? null,
          jobTitle: app.job.title,
          company: app.job.company,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setNegotiations((prev) => ({ ...prev, [app.id]: { loading: false, script: data.script, keyPoints: data.keyPoints ?? [] } }));
    } catch {
      setNegotiations((prev) => ({ ...prev, [app.id]: { loading: false, error: lang === "he" ? "שגיאה ביצירת הסקריפט" : "Failed to generate script" } }));
    }
  };

  const copyNegotiationScript = (jobId: string, script: string) => {
    navigator.clipboard.writeText(script).catch(() => {});
    setNegotiations((prev) => ({ ...prev, [jobId]: { ...prev[jobId], copied: true } }));
    setTimeout(() => setNegotiations((prev) => ({ ...prev, [jobId]: { ...prev[jobId], copied: false } })), 2000);
  };

  const refresh = () => setApps(getApplications(profileId));

  const handleStatus = (jobId: string, status: ApplicationStatus) => {
    updateApplicationStatus(profileId, jobId, status);
    refresh();
  };

  const handleRemove = (jobId: string) => {
    removeApplication(profileId, jobId);
    refresh();
  };

  const handleSaveNotes = (jobId: string) => {
    updateApplicationNotes(profileId, jobId, notesText);
    setEditingNotes(null);
    refresh();
  };

  const statusLabel = (s: ApplicationStatus) => {
    const map: Record<ApplicationStatus, string> = {
      saved: tx.trackerStatusSaved,
      applied: tx.trackerStatusApplied,
      interview: tx.trackerStatusInterview,
      offer: tx.trackerStatusOffer,
      rejected: tx.trackerStatusRejected,
    };
    return map[s];
  };

  if (apps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">{tx.trackerEmpty}</p>
        </div>
      </div>
    );
  }

  const totalApplied = apps.filter((a) => a.status !== "saved").length;
  const totalInterview = apps.filter((a) => a.status === "interview").length;
  const totalOffer = apps.filter((a) => a.status === "offer").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-5">{tx.trackerTitle}</h1>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: lang === "he" ? "שמורות" : "Saved", value: apps.length, color: "text-white/60" },
            { label: lang === "he" ? "הוגשו" : "Applied", value: totalApplied, color: "text-blue-300" },
            { label: lang === "he" ? "ראיונות" : "Interviews", value: totalInterview, color: "text-purple-300" },
            { label: lang === "he" ? "הצעות" : "Offers", value: totalOffer, color: "text-emerald-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{app.job.title}</h3>
                  <p className="text-purple-300 text-sm">{app.job.company}</p>
                  <p className="text-white/30 text-xs mt-0.5">{relativeDate(app.savedAt, lang)}</p>
                  {app.appliedAt && (
                    <p className="text-blue-300 text-xs mt-0.5 font-medium">
                      {tx.trackerAppliedOn.replace("{date}", relativeDate(app.appliedAt, lang))}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(app.status)}`}>
                    {statusLabel(app.status)}
                  </div>
                  {app.status === "saved" && (
                    <button
                      onClick={() => handleStatus(app.id, "applied")}
                      className="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 px-2 py-0.5 rounded-full transition whitespace-nowrap"
                    >
                      {tx.trackerMarkApplied}
                    </button>
                  )}
                </div>
              </div>

              {/* Status chips */}
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatus(app.id, s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition ${
                      app.status === s
                        ? "border-purple-500 bg-purple-500/20 text-purple-200"
                        : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
                    }`}
                  >
                    {statusLabel(s)}
                  </button>
                ))}
              </div>

              {/* Follow-up nudge for stale applied */}
              {app.status === "applied" && app.appliedAt && Date.now() - new Date(app.appliedAt).getTime() > 7 * 86400000 && (
                <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-3 py-2.5">
                  <span className="text-yellow-400 text-sm flex-shrink-0 mt-0.5">⏰</span>
                  <p className="text-yellow-300 text-xs leading-relaxed">{tx.trackerFollowUp}</p>
                </div>
              )}

              {/* Rejection support */}
              {app.status === "rejected" && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-rose-500/5 border border-rose-500/20 rounded-xl px-3 py-2.5">
                    <span className="text-rose-300 text-sm flex-shrink-0">💪</span>
                    <p className="text-rose-300 text-xs leading-relaxed">{tx.trackerRejectedHelp}</p>
                  </div>
                  <details className="group">
                    <summary className="text-xs text-white/50 hover:text-white/80 cursor-pointer list-none flex items-center gap-1.5 px-1">
                      <svg className="w-3 h-3 group-open:rotate-90 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {tx.trackerRejectedFeedbackBtn}
                    </summary>
                    <div className="mt-2 bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white/70 text-xs leading-relaxed whitespace-pre-wrap">
                      {lang === "he"
                        ? `שלום,\n\nתודה על הזמן שהקדשתם לתהליך איתי למשרת ${app.job.title} ב-${app.job.company}.\nאני מעוניין ללמוד מהחוויה — האם תוכלו לשתף מה היה אפשר לעשות בצורה טובה יותר?\n\nתודה רבה`
                        : `Hi,\n\nThank you for considering me for the ${app.job.title} role at ${app.job.company}.\nI'd love to learn from this experience — could you share any feedback on what I could have done better?\n\nThank you`}
                    </div>
                  </details>
                  <a
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {tx.trackerRejectedScout}
                  </a>
                </div>
              )}

              {/* Negotiation CTA for offer */}
              {app.status === "offer" && (() => {
                const neg = negotiations[app.id];
                if (!neg) return (
                  <button
                    onClick={() => handleNegotiate(app)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tx.trackerNegotiate}
                  </button>
                );
                if (neg.loading) return (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs py-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tx.trackerNegotiateAnalyzing}
                  </div>
                );
                if (neg.error) return <p className="text-rose-400 text-xs">{neg.error}</p>;
                return (
                  <div className="space-y-3">
                    <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">{tx.trackerNegotiateTitle}</p>
                    {neg.keyPoints && neg.keyPoints.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {neg.keyPoints.map((pt, i) => (
                          <span key={i} className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">{pt}</span>
                        ))}
                      </div>
                    )}
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white/80 text-xs leading-relaxed whitespace-pre-wrap">
                      {neg.script}
                    </div>
                    <button
                      onClick={() => copyNegotiationScript(app.id, neg.script!)}
                      className="flex items-center gap-1.5 text-xs text-white/50 hover:text-emerald-300 transition"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {neg.copied ? tx.trackerNegotiateCopied : tx.trackerNegotiateCopy}
                    </button>
                  </div>
                );
              })()}

              {/* Notes */}
              {editingNotes === app.id ? (
                <div className="space-y-2">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder={tx.trackerNotesPlaceholder}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveNotes(app.id)}
                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      {lang === "he" ? "שמור" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 transition"
                    >
                      {lang === "he" ? "ביטול" : "Cancel"}
                    </button>
                  </div>
                </div>
              ) : app.notes ? (
                <button
                  onClick={() => { setEditingNotes(app.id); setNotesText(app.notes!); }}
                  className="w-full text-start bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-white/60 text-xs leading-relaxed hover:bg-white/5 transition"
                >
                  {app.notes}
                </button>
              ) : null}

              {/* Saved cover letter preview */}
              {app.coverLetter && (
                <details className="group">
                  <summary className="text-xs text-emerald-400 cursor-pointer hover:text-emerald-300 transition list-none flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {tx.coverLetterSaved}
                    <svg className="w-3 h-3 text-white/30 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 bg-white/[0.03] border border-white/10 rounded-xl p-3 text-white/70 text-xs leading-relaxed whitespace-pre-wrap">
                    {app.coverLetter}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={app.job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-300 hover:text-purple-200 transition"
                >
                  {tx.trackerViewJob} ↗
                </a>
                <button
                  onClick={() => { setEditingNotes(app.id); setNotesText(app.notes ?? ""); }}
                  className="text-xs text-white/40 hover:text-white/70 transition"
                >
                  {tx.trackerNotes}
                </button>
                <button
                  onClick={() => setCoverLetterJob(app)}
                  className="text-xs text-sky-400 hover:text-sky-300 transition"
                >
                  {tx.trackerCoverLetter}
                </button>
                <button
                  onClick={() => handleRemove(app.id)}
                  className="text-xs text-rose-400/60 hover:text-rose-400 transition ms-auto"
                >
                  {tx.trackerRemove}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {coverLetterJob && (
        <CoverLetterModal
          jobTitle={coverLetterJob.job.title}
          jobDescription={coverLetterJob.job.description}
          jobId={coverLetterJob.id}
          onClose={() => { setCoverLetterJob(null); refresh(); }}
        />
      )}
    </div>
  );
}
