"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ApplicationStatus, JobApplication, UserProfile, DiagnosisResult, JDFitResult } from "@/lib/types";
import {
  getApplications,
  mergeWithServer,
  removeApplication,
  updateApplicationNotes,
  updateApplicationStatus,
  updateInterviewDate,
  addManualApplication,
} from "@/lib/applicationTracker";
import { DEFAULT_ADVISOR_ID, getAdvisorState } from "@/lib/advisorState";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CoverLetterModal from "./CoverLetterModal";
import AddToCalendarModal from "./AddToCalendarModal";

interface NegotiationState {
  loading: boolean;
  script?: string;
  keyPoints?: string[];
  copied?: boolean;
  error?: string;
}

interface JDFitState {
  open: boolean;
  jd: string;
  loading: boolean;
  result?: JDFitResult;
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

function interviewDateLabel(dateStr: string, lang: string): { text: string; color: string } {
  const interview = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((interview.getTime() - todayStart.getTime()) / 86400000);
  const formatted = interview.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  if (diffDays < 0) return { text: lang === "he" ? `ראיון היה ב-${formatted}` : `Interview was ${formatted}`, color: "text-white/30" };
  if (diffDays === 0) return { text: lang === "he" ? "ראיון היום!" : "Interview today!", color: "text-emerald-400 font-semibold" };
  if (diffDays === 1) return { text: lang === "he" ? "ראיון מחר!" : "Interview tomorrow!", color: "text-yellow-400 font-semibold" };
  return { text: lang === "he" ? `ראיון ב-${formatted}` : `Interview on ${formatted}`, color: "text-purple-300" };
}

function exportToCSV(apps: JobApplication[], lang: string) {
  const headers = lang === "he"
    ? ["כותרת", "חברה", "סטטוס", "נשמר", "הוגש", "תאריך ראיון", "קישור", "הערות"]
    : ["Title", "Company", "Status", "Saved", "Applied", "Interview Date", "URL", "Notes"];
  const rows = apps.map((a) => [
    a.job.title,
    a.job.company,
    a.status,
    a.savedAt ? new Date(a.savedAt).toLocaleDateString() : "",
    a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "",
    a.interviewDate ? new Date(a.interviewDate).toLocaleDateString() : "",
    a.job.url,
    (a.notes ?? "").replace(/"/g, '""'),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "applications.csv";
  a.click();
  URL.revokeObjectURL(url);
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
  const [jdFits, setJdFits] = useState<Record<string, JDFitState>>({});
  const [advisorProfile, setAdvisorProfile] = useState<{ userProfile: UserProfile; diagnosis: DiagnosisResult | null } | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [editingInterviewDate, setEditingInterviewDate] = useState<string | null>(null);
  const [calendarApp, setCalendarApp] = useState<JobApplication | null>(null);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/calendar/status").then(r => r.json()).then(d => setCalendarConnected(d.connected)).catch(() => {});
  }, []);

  useEffect(() => {
    mergeWithServer(profileId).then(() => {
      setApps(getApplications(profileId));
    });
    const state = getAdvisorState(profileId);
    if (state) setAdvisorProfile({ userProfile: state.userProfile, diagnosis: state.diagnosis });
  }, [profileId]);

  const refresh = () => setApps(getApplications(profileId));

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

  const openJDFit = (jobId: string) => {
    setJdFits((prev) => ({ ...prev, [jobId]: { open: true, jd: prev[jobId]?.jd ?? "", loading: false, result: prev[jobId]?.result } }));
  };

  const handleJDFit = async (app: JobApplication) => {
    const state = jdFits[app.id];
    if (!state?.jd.trim()) return;
    setJdFits((prev) => ({ ...prev, [app.id]: { ...prev[app.id], loading: true, error: undefined, result: undefined } }));
    try {
      const res = await fetch("/api/advisor/jd-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: state.jd,
          userProfile: advisorProfile?.userProfile ?? { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] },
          diagnosis: advisorProfile?.diagnosis ?? null,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setJdFits((prev) => ({ ...prev, [app.id]: { ...prev[app.id], loading: false, result: data as JDFitResult } }));
    } catch {
      setJdFits((prev) => ({ ...prev, [app.id]: { ...prev[app.id], loading: false, error: lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again" } }));
    }
  };

  const copyNegotiationScript = (jobId: string, script: string) => {
    navigator.clipboard.writeText(script).catch(() => {});
    setNegotiations((prev) => ({ ...prev, [jobId]: { ...prev[jobId], copied: true } }));
    setTimeout(() => setNegotiations((prev) => ({ ...prev, [jobId]: { ...prev[jobId], copied: false } })), 2000);
  };

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

  const handleSaveInterviewDate = (jobId: string, date: string) => {
    updateInterviewDate(profileId, jobId, date || null);
    setEditingInterviewDate(null);
    refresh();
  };

  const handleAddManual = () => {
    if (!manualTitle.trim()) return;
    addManualApplication(profileId, manualTitle.trim(), manualCompany.trim(), manualUrl.trim());
    setManualTitle("");
    setManualCompany("");
    setManualUrl("");
    setShowAddForm(false);
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

  const filteredApps = statusFilter === "all" ? apps : apps.filter((a) => a.status === statusFilter);

  const totalApplied = apps.filter((a) => a.status !== "saved").length;
  const totalInterview = apps.filter((a) => a.status === "interview").length;
  const totalOffer = apps.filter((a) => a.status === "offer").length;
  const responseRate = totalApplied > 0 ? Math.round((totalInterview / totalApplied) * 100) : 0;

  const statusCounts: Record<ApplicationStatus | "all", number> = {
    all: apps.length,
    saved: apps.filter((a) => a.status === "saved").length,
    applied: apps.filter((a) => a.status === "applied").length,
    interview: totalInterview,
    offer: totalOffer,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  if (apps.length === 0 && !showAddForm) {
    return (
      <div style={{ background: "var(--background)" }} className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm leading-relaxed mb-4">{tx.trackerEmpty}</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {tx.trackerAddManual}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--background)" }} className="min-h-screen p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-white">{tx.trackerTitle}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(apps, lang)}
              title={tx.trackerExportCSV}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 px-2.5 py-1.5 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {tx.trackerExportCSV}
            </button>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {tx.trackerAddManual}
            </button>
          </div>
        </div>

        {/* Google Calendar connect nudge */}
        {calendarConnected === false && (
          <div className="flex items-center justify-between gap-3 bg-[#4285F4]/8 border border-[#4285F4]/20 rounded-2xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-[#4285F4] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
              </svg>
              <p className="text-white/60 text-xs">
                {lang === "he" ? "חבר את יומן Google כדי להוסיף ראיונות ישירות ללוז שלך" : "Connect Google Calendar to add interviews to your schedule"}
              </p>
            </div>
            <a href="/settings" className="text-[#4285F4] text-xs font-semibold whitespace-nowrap hover:underline">
              {lang === "he" ? "חבר ←" : "Connect →"}
            </a>
          </div>
        )}

        {/* Manual add form */}
        {showAddForm && (
          <div className="bg-white/5 border border-white/15 rounded-2xl p-4 mb-5 space-y-3">
            <p className="text-white/70 text-sm font-semibold">{tx.trackerAddManualTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={tx.trackerAddManualJobTitle + " *"}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder={tx.trackerAddManualCompany}
                value={manualCompany}
                onChange={(e) => setManualCompany(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
            </div>
            <input
              type="url"
              placeholder={tx.trackerAddManualUrl}
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddManual}
                disabled={!manualTitle.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
              >
                {tx.trackerAddManualAdd}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-sm text-white/40 hover:text-white/70 px-3 py-1.5 transition"
              >
                {lang === "he" ? "ביטול" : "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: lang === "he" ? "שמורות" : "Saved", value: apps.length, color: "text-white/60" },
            { label: lang === "he" ? "הוגשו" : "Applied", value: totalApplied, color: "text-blue-300" },
            { label: lang === "he" ? "ראיונות" : "Interviews", value: totalInterview, color: "text-purple-300" },
            { label: tx.trackerResponseRate, value: totalApplied > 0 ? `${responseRate}%` : "—", color: responseRate >= 20 ? "text-emerald-300" : "text-white/60" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["all", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                statusFilter === s
                  ? "border-purple-500 bg-purple-500/20 text-purple-200"
                  : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              {s === "all" ? tx.trackerFilterAll : statusLabel(s as ApplicationStatus)}
              <span className="ms-1 opacity-60">{statusCounts[s]}</span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-white/30 text-sm">
            {lang === "he" ? "אין תוצאות לפילטר זה" : "No applications match this filter"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => (
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
                    {app.interviewDate && (() => {
                      const label = interviewDateLabel(app.interviewDate, lang);
                      return (
                        <button
                          onClick={() => setEditingInterviewDate(editingInterviewDate === app.id ? null : app.id)}
                          className={`text-xs mt-0.5 ${label.color} hover:opacity-80 transition`}
                        >
                          {label.text}
                        </button>
                      );
                    })()}
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

                {/* Interview date editor */}
                {app.status === "interview" && editingInterviewDate === app.id && (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                    <label className="text-purple-300 text-xs whitespace-nowrap">{tx.trackerInterviewDate}:</label>
                    <input
                      type="date"
                      defaultValue={app.interviewDate ? app.interviewDate.slice(0, 10) : ""}
                      className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-purple-500 flex-1 min-w-0"
                      onChange={(e) => handleSaveInterviewDate(app.id, e.target.value ? new Date(e.target.value).toISOString() : "")}
                    />
                    <button onClick={() => setEditingInterviewDate(null)} className="text-white/30 hover:text-white/60 text-xs">✕</button>
                  </div>
                )}
                {app.status === "interview" && !app.interviewDate && editingInterviewDate !== app.id && (
                  <button
                    onClick={() => setEditingInterviewDate(app.id)}
                    className="flex items-center gap-1.5 text-xs text-purple-400/70 hover:text-purple-300 transition"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {tx.trackerInterviewDate} +
                  </button>
                )}
                {app.status === "interview" && calendarConnected && (
                  <button
                    onClick={() => setCalendarApp(app)}
                    className="flex items-center gap-1.5 text-xs text-[#4285F4]/80 hover:text-[#4285F4] border border-[#4285F4]/20 hover:border-[#4285F4]/40 px-2.5 py-1 rounded-lg transition"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                    </svg>
                    {lang === "he" ? "הוסף ליומן" : "Add to calendar"}
                  </button>
                )}

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

                {/* Post-interview follow-up templates */}
                {app.status === "interview" && (
                  <details className="group">
                    <summary className="text-xs text-purple-300 hover:text-purple-200 cursor-pointer list-none flex items-center gap-1.5">
                      <svg className="w-3 h-3 group-open:rotate-90 transition-transform flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {tx.interviewFollowUpTitle}
                    </summary>
                    <div className="mt-2 space-y-2">
                      {[
                        {
                          label: tx.interviewFollowUpThankYou,
                          text: lang === "he"
                            ? `שלום,\n\nתודה על הזמן שהקדשת לראיון איתי למשרת ${app.job.title} ב-${app.job.company}.\nנהניתי מאוד מהשיחה ומהיכרות עם הצוות — אני מאמין/ת שיכולתי לתרום רבות.\nמצפה בקוצר רוח לשמוע ממך.\n\nבברכה`
                            : `Hi,\n\nThank you for taking the time to interview me for the ${app.job.title} position at ${app.job.company}.\nI really enjoyed learning about the team and role — I believe I could make a strong contribution.\nLooking forward to hearing from you.\n\nBest regards`,
                        },
                        {
                          label: tx.interviewFollowUpSilence,
                          text: lang === "he"
                            ? `שלום,\n\nרציתי לעקוב אחרי הראיון שערכנו לפני כשבוע למשרת ${app.job.title}.\nאני עדיין מאוד מעוניין/ת בתפקיד ורוצה לוודא שההגשה שלי בתהליך.\nאשמח לדעת אם יש עדכון.\n\nתודה`
                            : `Hi,\n\nI wanted to follow up on our interview a week ago for the ${app.job.title} role.\nI'm still very interested in the position and wanted to confirm my application is being considered.\nPlease let me know if there's any update.\n\nThank you`,
                        },
                      ].map(({ label, text }, idx) => (
                        <FollowUpTemplate key={idx} label={label} text={text} lang={lang} />
                      ))}
                    </div>
                  </details>
                )}

                {/* JD Fit analyzer */}
                {(() => {
                  const fit = jdFits[app.id];
                  if (!fit?.open) return (
                    <button
                      onClick={() => openJDFit(app.id)}
                      className="text-xs text-white/40 hover:text-blue-300 transition flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {tx.jdFitTitle}
                    </button>
                  );
                  return (
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 space-y-2">
                      <p className="text-blue-300 text-xs font-semibold">{tx.jdFitTitle}</p>
                      {fit.result ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-white/50 text-xs">{tx.jdFitScore}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${fit.result.score >= 70 ? "bg-emerald-500" : fit.result.score >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${fit.result.score}%` }} />
                            </div>
                            <span className={`text-xs font-bold tabular-nums ${fit.result.score >= 70 ? "text-emerald-400" : fit.result.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{fit.result.score}</span>
                          </div>
                          {[
                            { label: tx.jdFitMatch, items: fit.result.matchPoints, color: "text-emerald-400" },
                            { label: tx.jdFitGap, items: fit.result.gapPoints, color: "text-rose-400" },
                            { label: tx.jdFitTips, items: fit.result.tips, color: "text-blue-400" },
                          ].map(({ label, items, color }) => items?.length > 0 && (
                            <div key={label}>
                              <p className={`${color} text-[10px] font-semibold uppercase tracking-wide mb-1`}>{label}</p>
                              <ul className="space-y-0.5">
                                {items.map((it, i) => <li key={i} className="text-white/70 text-xs flex gap-1.5"><span className={color}>•</span>{it}</li>)}
                              </ul>
                            </div>
                          ))}
                          <button onClick={() => openJDFit(app.id)} className="text-[10px] text-white/30 hover:text-white/60 transition">{lang === "he" ? "↺ נתח שוב" : "↺ Re-analyze"}</button>
                        </div>
                      ) : fit.loading ? (
                        <div className="flex items-center gap-2 text-blue-400 text-xs">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {tx.jdFitAnalyzing}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {fit.error && <p className="text-rose-400 text-xs">{fit.error}</p>}
                          <textarea
                            rows={4}
                            value={fit.jd}
                            onChange={(e) => setJdFits((prev) => ({ ...prev, [app.id]: { ...prev[app.id], jd: e.target.value } }))}
                            placeholder={tx.jdFitPlaceholder}
                            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
                          />
                          <button
                            onClick={() => handleJDFit(app)}
                            disabled={!fit.jd.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            {tx.jdFitAnalyze}
                          </button>
                        </div>
                      )}
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
                  {app.job.url && app.job.url !== "#" && (
                    <a
                      href={app.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-300 hover:text-purple-200 transition"
                    >
                      {tx.trackerViewJob} ↗
                    </a>
                  )}
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
        )}
      </div>

      {coverLetterJob && (
        <CoverLetterModal
          jobTitle={coverLetterJob.job.title}
          jobDescription={coverLetterJob.job.description}
          jobId={coverLetterJob.id}
          onClose={() => { setCoverLetterJob(null); refresh(); }}
        />
      )}

      {calendarApp && (
        <AddToCalendarModal
          defaultTitle={lang === "he"
            ? `ראיון עבודה — ${calendarApp.job.company}`
            : `Job interview — ${calendarApp.job.company}`}
          defaultDescription={lang === "he"
            ? `ראיון לתפקיד ${calendarApp.job.title} ב-${calendarApp.job.company}`
            : `Interview for ${calendarApp.job.title} at ${calendarApp.job.company}`}
          defaultLocation={calendarApp.job.location ?? ""}
          onClose={() => setCalendarApp(null)}
        />
      )}
    </div>
  );
}

function FollowUpTemplate({ label, text, lang }: { label: string; text: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wide">{label}</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-purple-300 transition"
        >
          {copied ? (
            <span className="text-emerald-400">✓ {lang === "he" ? "הועתק" : "Copied"}</span>
          ) : (
            <>{lang === "he" ? "העתק" : "Copy"}</>
          )}
        </button>
      </div>
      <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}
