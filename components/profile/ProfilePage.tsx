"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getAdvisorState,
  clearAdvisorState,
  archiveAdvisorState,
  getAdvisorArchive,
  ArchivedAdvisorSession,
  DEFAULT_ADVISOR_ID,
} from "@/lib/advisorState";
import { getSavedProfiles } from "@/lib/profiles";
import { AdvisorState, STAGE_ORDER } from "@/lib/types";
import type { ConversationPreview, JobSnap } from "@/lib/conversations";
import type { UserMeta } from "@/lib/userMeta";
import type { CvMeta } from "@/lib/cvs";
import { ltrSpan } from "@/lib/rtl";
import { queueAutoStart, queueAdvisorScoutContext } from "@/lib/autoStart";
import UserMetaCard from "./UserMetaCard";
import SiteFooter from "@/components/SiteFooter";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, { he: string; en: string }> = {
  diagnosis: { he: "מיפוי אישיות", en: "Personality" },
  direction:  { he: "כיוון חיים",  en: "Life direction" },
  cv:         { he: "קורות חיים",  en: "CV review" },
  strategy:   { he: "אסטרטגיה",   en: "Strategy" },
};

const PATH_LABELS: Record<string, { he: string; en: string }> = {
  employee:     { he: "שכיר/ה",       en: "Employee" },
  entrepreneur: { he: "עצמאי/ת · יזם/ת", en: "Entrepreneur" },
  studies:      { he: "לימודים · הסבה",  en: "Studies" },
};

const PLAN_META: Record<string, { he: string; en: string; cls: string }> = {
  free:       { he: "חינמי",             en: "Explorer · Free",  cls: "text-white/60 bg-white/10 border-white/20" },
  weekly:     { he: "שבועי",            en: "Weekly",            cls: "text-blue-300 bg-blue-500/20 border-blue-500/30" },
  "one-time": { he: "קידום קריירה",     en: "Career Boost",      cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
  full:       { he: "מסע מלא",          en: "Full Journey",      cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
  pro:        { he: "Pro",              en: "Pro",               cls: "text-amber-300 bg-amber-500/20 border-amber-500/30" },
};

function timeAgo(iso: string, he: boolean): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return he ? "היום" : "Today";
  if (days === 1) return he ? "אתמול" : "Yesterday";
  if (days < 7) return he ? `לפני ${days} ימים` : `${days} days ago`;
  if (days < 30) return he ? `לפני ${Math.floor(days / 7)} שבועות` : `${Math.floor(days / 7)} weeks ago`;
  return he ? `לפני ${Math.floor(days / 30)} חודשים` : `${Math.floor(days / 30)} months ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl p-6 ${accent ? "bg-white/5 border border-purple-500/30" : "bg-white/5 border border-white/10"}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-white font-semibold text-lg mb-1">{children}</h2>;
}

function ScoreChip({ score }: { score: number }) {
  const cls = score >= 80 ? "bg-green-500/20 text-green-400 border-green-500/30"
            : score >= 60 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-white/8 text-white/40 border-white/15";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{score}%</span>;
}

function ConvCard({
  conv, he, onContinue, onDelete, onRename,
}: {
  conv: ConversationPreview;
  he: boolean;
  onContinue: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const jobs = conv.jobs ?? [];
  const shown = open ? jobs : jobs.slice(0, 3);

  function startEdit() {
    setDraft(conv.title ?? (he ? "שיחה עם Scout" : "Scout conversation"));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitRename() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === conv.title) return;
    await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    onRename(trimmed);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/conversations/${conv.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="px-3 sm:px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false); }}
                className="w-full bg-white/10 border border-purple-500/50 rounded-lg px-2 py-0.5 text-white text-sm focus:outline-none focus:border-purple-400"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5 group/title">
                <p className="text-white text-sm font-medium truncate">
                  {conv.title ?? (he ? "שיחה עם Scout" : "Scout conversation")}
                </p>
                <button
                  onClick={startEdit}
                  className="opacity-0 group-hover/title:opacity-100 transition text-white/30 hover:text-white/70 flex-shrink-0"
                  title={he ? "ערוך שם" : "Rename"}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-white/40 text-xs">{timeAgo(conv.createdAt, he)}
              {conv.messageCount != null && ` · ${conv.messageCount} ${he ? "הודעות" : "msg"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {jobs.length > 0 && (
            <span className="hidden sm:inline-flex text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2.5 py-0.5 rounded-full font-medium">
              {jobs.length} {he ? "משרות" : "jobs"}
            </span>
          )}
          <button
            onClick={onContinue}
            className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 hover:border-emerald-400/50 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-lg transition"
          >
            {he ? "המשך" : "Continue"}
          </button>
          <Link
            href={`/conversations/${conv.id}`}
            className="hidden sm:block text-xs text-purple-400 hover:text-purple-300 border border-purple-500/25 hover:border-purple-400/50 bg-purple-500/10 px-2.5 py-1 rounded-lg transition"
          >
            {he ? "צפה" : "View"}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-white/25 hover:text-red-400 transition disabled:opacity-40"
            title={he ? "מחק שיחה" : "Delete conversation"}
          >
            {deleting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
          {jobs.length > 0 && (
            <button onClick={() => setOpen((v) => !v)}>
              <svg className={`w-4 h-4 text-white/25 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {(open && jobs.length > 0) && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {shown.map((job: JobSnap) => (
            <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition group">
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-medium truncate group-hover:text-purple-300 transition">{job.title}</p>
                <p className="text-white/40 text-xs truncate">{job.company} · {job.source}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScoreChip score={job.matchScore} />
                {job.isRemote && (
                  <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                    {he ? "מרחוק" : "Remote"}
                  </span>
                )}
              </div>
            </a>
          ))}
          {jobs.length > 3 && (
            <button onClick={() => setOpen((v) => !v)} className="w-full text-center text-xs text-white/30 hover:text-white/60 transition pt-1">
              {open ? (he ? "הצג פחות" : "Show less") : `+${jobs.length - 3} ${he ? "משרות נוספות" : "more jobs"}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ArchivedSessionCard ──────────────────────────────────────────────────────

function ArchivedSessionCard({ session, he }: { session: ArchivedAdvisorSession; he: boolean }) {
  const [open, setOpen] = useState(false);
  const { snapshot } = session;

  const dateStr = new Date(session.archivedAt).toLocaleDateString(he ? "he-IL" : "en-US", {
    day: "numeric", month: "short", year: "numeric",
  });

  const stageReached = snapshot.currentStage === "done"
    ? (he ? "הושלם" : "Completed")
    : snapshot.strategy ? (he ? "אסטרטגיה" : "Strategy")
    : snapshot.cvReview ? (he ? "קו\"ח" : "CV Review")
    : snapshot.direction ? (he ? "כיוון" : "Direction")
    : snapshot.diagnosis ? (he ? "דיאגנוזה" : "Diagnosis")
    : (he ? "לא הושלם" : "Not completed");

  const pathLabels: Record<string, { he: string; en: string }> = {
    employee:     { he: "שכיר/ה",          en: "Employee" },
    entrepreneur: { he: "עצמאי/ת · יזם/ת",  en: "Entrepreneur" },
    studies:      { he: "לימודים",           en: "Studies" },
  };

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden transition-all">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-white/5 transition text-start"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-medium">
              {he ? "ייעוץ" : "Session"} · {dateStr}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {snapshot.chosenPath && (
                <span className="text-purple-300/70 text-xs bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  {he ? pathLabels[snapshot.chosenPath].he : pathLabels[snapshot.chosenPath].en}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                snapshot.currentStage === "done"
                  ? "text-green-400/80 bg-green-500/10 border-green-500/20"
                  : "text-white/35 bg-white/5 border-white/10"
              }`}>
                {stageReached}
              </span>
            </div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-white/25 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-4">
          {/* Top message */}
          {snapshot.diagnosis?.topMessage && (
            <p className="text-white/70 text-sm italic leading-relaxed border-s-2 border-purple-500/40 ps-3">
              {snapshot.diagnosis.topMessage}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Top roles */}
            {snapshot.diagnosis?.topRoles && snapshot.diagnosis.topRoles.length > 0 && (
              <div>
                <p className="text-emerald-300/70 text-xs font-semibold uppercase tracking-wide mb-2">
                  {he ? "תפקידים מומלצים" : "Recommended Roles"}
                </p>
                <div className="flex flex-col gap-1">
                  {snapshot.diagnosis.topRoles.map((role, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="text-emerald-400/60 text-xs font-bold">#{i + 1}</span>
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target companies */}
            {snapshot.strategy?.targetCompanies && snapshot.strategy.targetCompanies.length > 0 && (
              <div>
                <p className="text-purple-300/70 text-xs font-semibold uppercase tracking-wide mb-2">
                  {he ? "חברות יעד" : "Target Companies"}
                </p>
                <div className="flex flex-col gap-1">
                  {snapshot.strategy.targetCompanies.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-white/70">
                      <span>{c.name}</span>
                      <span className="text-white/30 text-xs">{c.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strengths */}
          {snapshot.diagnosis?.strengths && snapshot.diagnosis.strengths.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {snapshot.diagnosis.strengths.map((s, i) => (
                <span key={i} className="text-xs text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const he = lang === "he";

  const [advisor, setAdvisor] = useState<AdvisorState | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [plan, setPlan] = useState("free");
  const [userMeta, setUserMeta] = useState<UserMeta>({} as UserMeta);
  const [scoutData, setScoutData] = useState<import("@/lib/types").UserProfile["parsedData"]>({});
  const [cvs, setCvs] = useState<CvMeta[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState<ArchivedAdvisorSession[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const allOfferedJobs = useMemo(() => {
    const seenUrls = new Set<string>();
    return conversations
      .flatMap((c) => c.jobs ?? [])
      .filter((job) => {
        if (seenUrls.has(job.url)) return false;
        seenUrls.add(job.url);
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [conversations]);

  function resizeImage(file: File, maxPx: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load")); };
      img.src = url;
    });
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const base64 = await resizeImage(file, 256);
      await saveMeta({ profileImage: base64 });
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  useEffect(() => {
    const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;
    const localAdvisor = getAdvisorState(profileId);
    setAdvisor(localAdvisor);

    // Persist advisor stage to MongoDB so it survives across devices/sessions
    if (localAdvisor) {
      const completedCount = localAdvisor.currentStage === "done"
        ? STAGE_ORDER.length
        : Math.max(0, STAGE_ORDER.indexOf(localAdvisor.currentStage as typeof STAGE_ORDER[number]));
      fetch("/api/user-meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorCurrentStage: localAdvisor.currentStage,
          advisorCompletedCount: completedCount,
        }),
      }).catch(() => {});
    }

    const profiles = getSavedProfiles();
    if (profiles.length > 0) {
      setScoutData(profiles[profiles.length - 1].profile.parsedData);
    }

    setArchivedSessions(getAdvisorArchive(profileId));
  }, [session?.user?.id]);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d?.plan) setPlan(d.plan); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/user-meta")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setUserMeta(d as UserMeta); })
      .catch(() => {});
    fetch("/api/cvs")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setCvs(d); })
      .catch(() => {});
  }, []);

  async function saveMeta(patch: Partial<UserMeta>) {
    await fetch("/api/user-meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setUserMeta((prev) => ({ ...prev, ...patch }));
  }

  const router = useRouter();
  const user = session?.user;
  const profileId = user?.id ?? DEFAULT_ADVISOR_ID;
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const planMeta = PLAN_META[plan] ?? PLAN_META["free"];
  const displayImage = userMeta.profileImage ?? user?.image ?? null;

  function handleNewAdvisorSession() {
    archiveAdvisorState(profileId);
    setArchivedSessions(getAdvisorArchive(profileId));
    setAdvisor(null);
    fetch("/api/user-meta", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorCurrentStage: null, advisorCompletedCount: 0 }),
    }).catch(() => {});
    router.push(`/advisor?profileId=${profileId}`);
  }

  // Use localStorage state; fall back to MongoDB-backed stage if localStorage was cleared
  const effectiveStage = advisor?.currentStage ?? userMeta.advisorCurrentStage ?? null;
  const advisorStarted  = !!(advisor || userMeta.advisorCurrentStage);
  const advisorDone     = effectiveStage === "done";
  const currentStageIdx = effectiveStage && effectiveStage !== "done"
    ? STAGE_ORDER.indexOf(effectiveStage as typeof STAGE_ORDER[number])
    : -1;
  const completedCount  = advisorDone
    ? STAGE_ORDER.length
    : (advisor ? Math.max(0, currentStageIdx) : (userMeta.advisorCompletedCount ?? 0));
  const mockDone        = !!advisor?.mockInterview?.finished;
  const professionalSummary = advisor?.cvReview?.rewrittenSummary ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-8 space-y-5">

        {/* ── USER HEADER — social profile style ───────────────────────── */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">

          {/* Cover banner */}
          <div className="relative h-36 sm:h-44 bg-gradient-to-br from-purple-900 via-violet-700/80 to-indigo-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_0%,rgba(168,85,247,0.35),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_10%_100%,rgba(99,102,241,0.25),transparent)]" />
            <div className="absolute bottom-3 end-4 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-purple-400/40" />
              <div className="w-2 h-2 rounded-full bg-violet-400/40" />
            </div>
          </div>

          {/* Avatar + info */}
          <div className="px-5 sm:px-7 pb-6">
            <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
              {/* Avatar */}
              <div
                className="flex-shrink-0 relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                {displayImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayImage}
                    alt=""
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-slate-900"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white text-3xl font-black select-none ring-4 ring-slate-900">
                    {initials}
                  </div>
                )}
                {/* Upload overlay */}
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all ${uploadingAvatar ? "bg-black/60" : "bg-black/0 group-hover:bg-black/50"}`}>
                  {uploadingAvatar ? (
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Plan badge — top-right of info row */}
              <div className="mb-1 flex items-center gap-2">
                {plan !== "free" && (
                  <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {he ? "פעיל" : "Active"}
                  </span>
                )}
                {plan === "free" && (
                  <Link href="/pricing" className="text-purple-400 hover:text-purple-300 text-xs transition font-medium">
                    {he ? "שדרג ↑" : "Upgrade ↑"}
                  </Link>
                )}
              </div>
            </div>

            {/* Name + email */}
            <p className="text-white text-xl sm:text-2xl font-bold leading-tight">{user?.name || "—"}</p>
            <p className="text-white/45 text-sm mt-0.5" style={{ textAlign: "right" }}>{user?.email ? ltrSpan(user.email) : null}</p>
          </div>
        </div>

        {/* ── PROFILE DATA (Scout + editable) ──────────────────────────── */}
        <UserMetaCard meta={userMeta} scoutData={scoutData} onSave={saveMeta} he={he} />

        {/* ── MY CVs ───────────────────────────────────────────────────── */}
        {cvs.length > 0 && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>{he ? "קורות החיים שלי" : "My CVs"}</SectionTitle>
              <Link href="/cv-builder?from=/profile" className="text-purple-400 hover:text-purple-300 text-sm transition">
                {he ? "צור חדש" : "Create new"}
              </Link>
            </div>
            <div className="space-y-2">
              {cvs.map((cv) => (
                <Link key={cv.id} href={`/cv-builder?cvId=${cv.id}&from=/profile`}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition group">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-purple-300 transition">{cv.name}</p>
                    <p className="text-white/40 text-xs">{timeAgo(cv.updatedAt, he)}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── ADVISOR JOURNEY ──────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <SectionTitle>{he ? "מסע הייעוץ התעסוקתי" : "Career Advisor Journey"}</SectionTitle>
              <p className="text-white/40 text-sm">
                {!advisorStarted
                  ? (he ? "טרם התחלת את התהליך" : "You haven't started yet")
                  : advisorDone
                  ? (he ? "כל השלבים הושלמו!" : "All stages complete!")
                  : (he ? `שלב ${completedCount} מתוך ${STAGE_ORDER.length} הושלמו` : `${completedCount} of ${STAGE_ORDER.length} stages done`)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {advisorStarted && (
                <button
                  onClick={handleNewAdvisorSession}
                  className="text-white/35 hover:text-white/70 text-xs border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-xl transition"
                >
                  {he ? "התחל מ-0" : "Start fresh"}
                </button>
              )}
            {!advisorDone ? (
              <Link href={`/advisor?profileId=${profileId}`}
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                {!advisorStarted ? (he ? "התחל" : "Start") : (he ? "המשך" : "Continue")}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={`/advisor?profileId=${profileId}`}
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold border border-purple-500/30 hover:border-purple-400/60 bg-purple-500/10 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {he ? "ראה סיכום" : "View Summary"}
                </Link>
                {!mockDone && (
                  <Link href={`/advisor?profileId=${profileId}`}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {he ? "ראיון מדומה" : "Mock interview"}
                  </Link>
                )}
                {mockDone && (
                  <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {he ? "הושלם" : "Complete"}
                  </span>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Stage tracker */}
          <div className="flex items-start gap-0 overflow-x-auto pt-2 pb-1">
            {STAGE_ORDER.map((stage, i) => {
              const done    = advisorDone || i < completedCount;
              const current = !advisorDone && i === completedCount;
              return (
                <div key={stage} className="flex items-start flex-shrink-0">
                  <div className="flex flex-col items-center gap-1.5 w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done    ? "bg-green-500" :
                        current ? "bg-purple-600 ring-4 ring-purple-600/30 animate-pulse" :
                        "bg-white/10 text-white/30"
                      }`}
                      style={(done || current) ? { color: "#ffffff" } : undefined}
                    >
                      {done ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs text-center leading-tight px-1 ${
                      done ? "text-green-400" : current ? "text-purple-300" : "text-white/30"
                    }`}>
                      {he ? STAGE_LABELS[stage].he : STAGE_LABELS[stage].en}
                    </span>
                  </div>
                  {i < STAGE_ORDER.length - 1 && (
                    <div className={`h-0.5 w-8 mt-4 flex-shrink-0 ${done ? "bg-green-500" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}

            {/* Mock interview bonus */}
            <div className="flex items-start flex-shrink-0">
              <div className={`h-0.5 w-8 mt-4 flex-shrink-0 ${advisorDone ? "bg-green-500" : "bg-white/10"}`} />
              <div className="flex flex-col items-center gap-1.5 w-20">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    mockDone    ? "bg-green-500" :
                    advisorDone ? "bg-amber-500 ring-4 ring-amber-500/30 animate-pulse" :
                    "bg-white/10 text-white/30"
                  }`}
                  style={(mockDone || advisorDone) ? { color: "#ffffff" } : undefined}
                >
                  {mockDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs text-center leading-tight px-1 ${
                  mockDone ? "text-green-400" : advisorDone ? "text-amber-400" : "text-white/30"
                }`}>
                  {he ? "ראיון מדומה" : "Mock interview"}
                  {advisorDone && !mockDone && " ★"}
                </span>
              </div>
            </div>
          </div>

          {advisor?.chosenPath && (
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
              <span className="text-white/40 text-xs">{he ? "המסלול שנבחר:" : "Chosen path:"}</span>
              <span className="text-purple-300 text-xs font-medium bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-full">
                {he ? PATH_LABELS[advisor.chosenPath].he : PATH_LABELS[advisor.chosenPath].en}
              </span>
              {advisor.diagnosis?.strengths.slice(0, 2).map((s) => (
                <span key={s} className="text-white/40 text-xs bg-white/5 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}

          {/* ── Past sessions ── */}
          {archivedSessions.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-white/35 text-xs font-semibold uppercase tracking-wide mb-3">
                {he ? `ייעוצים קודמים (${archivedSessions.length})` : `Past sessions (${archivedSessions.length})`}
              </p>
              <div className="space-y-2">
                {archivedSessions.map((s) => (
                  <ArchivedSessionCard key={s.id} session={s} he={he} />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── PROFESSIONAL SUMMARY ─────────────────────────────────────── */}
        {professionalSummary && (
          <SectionCard accent>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <SectionTitle>{he ? "הסיכום המקצועי שלך" : "Your Professional Summary"}</SectionTitle>
                <p className="text-purple-400 text-xs mt-0.5">
                  {he ? "נוצר ע\"י יועץ ה-AI שלך" : "Created by your AI advisor"}
                </p>
              </div>
              <Link href="/cv-builder?from=/profile"
                className="flex-shrink-0 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl transition">
                {he ? "הוסף ל-CV" : "Add to CV"}
              </Link>
            </div>
            <blockquote className="border-s-2 border-purple-500 ps-4 text-white/80 text-sm leading-relaxed">
              {professionalSummary}
            </blockquote>
          </SectionCard>
        )}

        {/* ── ADVISOR INSIGHTS ─────────────────────────────────────────── */}
        {advisorDone && advisor && (advisor.diagnosis?.topRoles?.length || advisor.strategy?.targetCompanies?.length) && (
          <SectionCard accent>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <SectionTitle>{he ? "המלצות הייעוץ שלך" : "Your Career Recommendations"}</SectionTitle>
                <p className="text-purple-400 text-xs mt-0.5">
                  {he ? "כיוונים ויעדים שזוהו בתהליך הייעוץ" : "Directions & targets from your advisor session"}
                </p>
              </div>
              <Link
                href={`/advisor?profileId=${profileId}`}
                className="flex-shrink-0 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl transition"
              >
                {he ? "סיכום מלא" : "Full summary"}
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              {advisor.diagnosis?.topRoles && advisor.diagnosis.topRoles.length > 0 && (
                <div>
                  <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    {he ? "תפקידים מומלצים" : "Recommended Roles"}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {advisor.diagnosis.topRoles.map((role, i) => (
                      <div key={i} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                        <span className="text-emerald-400 text-xs font-bold">#{i + 1}</span>
                        <span className="text-white text-sm font-medium">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {advisor.strategy?.targetCompanies && advisor.strategy.targetCompanies.length > 0 && (
                <div>
                  <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    {he ? "חברות יעד" : "Target Companies"}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {advisor.strategy.targetCompanies.slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-white text-sm font-medium">{c.name}</span>
                        <span className="text-white/35 text-xs">{c.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const lines: string[] = [];
                if (advisor.diagnosis?.topRoles?.length)
                  lines.push(`תפקידים שמתאימים לי: ${advisor.diagnosis.topRoles.join(", ")}`);
                if (advisor.strategy?.targetCompanies?.length)
                  lines.push(`חברות יעד: ${advisor.strategy.targetCompanies.map((c) => c.name).join(", ")}`);
                if (advisor.chosenPath)
                  lines.push(`מסלול: ${he ? PATH_LABELS[advisor.chosenPath].he : PATH_LABELS[advisor.chosenPath].en}`);
                if (advisor.diagnosis?.strengths?.length)
                  lines.push(`חוזקות: ${advisor.diagnosis.strengths.slice(0, 3).join(", ")}`);
                queueAdvisorScoutContext(lines.join("\n"));
                queueAutoStart("jobs");
                router.push("/");
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {he ? "שלח ל-Scout — מצא לי משרות לפי הסיכום" : "Send to Scout — Find jobs from my summary"}
            </button>
          </SectionCard>
        )}

        {/* ── SCOUT CONVERSATIONS ──────────────────────────────────────── */}
        <SectionCard>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <SectionTitle>{he ? "חיפושי משרות עם Scout" : "Job Searches with Scout"}</SectionTitle>
              <p className="text-white/40 text-sm">{he ? "כל שיחת חיפוש עם התוצאות שלה" : "Every search session with its results"}</p>
            </div>
            <button
              onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
              className="flex-shrink-0 text-purple-400 hover:text-purple-300 text-sm transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {he ? "חיפוש חדש" : "New search"}
            </button>
          </div>

          {loadingConvs ? (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-white/40 text-sm">{he ? "עדיין לא ביצעת חיפוש משרות" : "No job searches yet"}</p>
              <button onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block transition">
                {he ? "צאי לחיפוש עכשיו" : "Start searching now"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <ConvCard
                  key={conv.id}
                  conv={conv}
                  he={he}
                  onContinue={() => router.push(`/?continueConv=${conv.id}`)}
                  onDelete={() => setConversations((prev) => prev.filter((c) => c.id !== conv.id))}
                  onRename={(title) => setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, title } : c))}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── MY JOBS ──────────────────────────────────────────────────── */}
        <SectionCard>
          <div className="mb-4">
            <SectionTitle>{he ? "המשרות שלי" : "My Jobs"}</SectionTitle>
          </div>

          {allOfferedJobs.length === 0 ? (
            <p className="text-white/40 text-sm py-2">{he ? "עדיין אין לך משרות" : "No jobs yet"}</p>
          ) : (
            <div className="space-y-2">
              {(showAllJobs ? allOfferedJobs : allOfferedJobs.slice(0, 6)).map((job) => (
                <a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2.5 transition group"
                >
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
                    <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
              {allOfferedJobs.length > 6 && (
                <button
                  onClick={() => setShowAllJobs((v) => !v)}
                  className="w-full text-center text-xs text-white/30 hover:text-white/60 transition pt-1"
                >
                  {showAllJobs
                    ? (he ? "הצג פחות" : "Show less")
                    : `+${allOfferedJobs.length - 6} ${he ? "משרות נוספות" : "more jobs"}`}
                </button>
              )}
            </div>
          )}
        </SectionCard>


      </div>
      <SiteFooter />
    </div>
  );
}
