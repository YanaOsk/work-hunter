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
  diagnosis: { he: "מיפוי", en: "Diagnosis" },
  direction: { he: "כיוון", en: "Direction" },
  cv:        { he: "קו\"ח", en: "CV" },
  linkedin:  { he: "LinkedIn", en: "LinkedIn" },
  strategy:  { he: "אסטרטגיה", en: "Strategy" },
  done:      { he: "הושלם", en: "Done" },
};

const PATH_LABELS: Record<string, { he: string; en: string }> = {
  employee:     { he: "שכיר/ה",          en: "Employee" },
  entrepreneur: { he: "עצמאי/ת · יזם/ת", en: "Entrepreneur" },
  studies:      { he: "לימודים · הסבה",  en: "Studies" },
};

function timeAgo(iso: string, he: boolean): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return he ? "היום" : "Today";
  if (days === 1) return he ? "אתמול" : "Yesterday";
  if (days < 7) return he ? `לפני ${days} ימים` : `${days}d ago`;
  if (days < 30) return he ? `לפני ${Math.floor(days / 7)} שבועות` : `${Math.floor(days / 7)}w ago`;
  return he ? `לפני ${Math.floor(days / 30)} חודשים` : `${Math.floor(days / 30)}mo ago`;
}

// ─── Tiny sub-components ──────────────────────────────────────────────────────

function ScoreChip({ score }: { score: number }) {
  const cls = score >= 80 ? "bg-green-500/20 text-green-400 border-green-500/30"
            : score >= 60 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
            : "bg-white/8 text-white/40 border-white/15";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{score}%</span>;
}

// ── Dot menu ──────────────────────────────────────────────────────────────────
function DotMenu({ items }: { items: { label: string; danger?: boolean; onClick: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute end-0 bottom-full mb-1 z-20 min-w-[130px] bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden">
          {items.map((item, i) => (
            <button key={i} onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full text-start px-3 py-2 text-xs transition hover:bg-white/5 ${item.danger ? "text-rose-400" : "text-white/70"}`}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CV thumbnail card ─────────────────────────────────────────────────────────
function CvCard({ cv, he, onDelete }: { cv: CvMeta; he: boolean; onDelete: () => void }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/cv-builder?cvId=${cv.id}&from=/profile`)}
      className="group cursor-pointer rounded-2xl border border-white/10 hover:border-purple-500/40 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden hover:shadow-xl hover:shadow-purple-900/20 hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-slate-800/80 to-purple-950/60 flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="w-20 opacity-20 flex flex-col gap-1.5 px-3 pt-3">
          <div className="h-1.5 bg-white rounded-full w-full" />
          <div className="h-1 bg-white/70 rounded-full w-4/5" />
          <div className="h-1 bg-white/50 rounded-full w-3/5 mt-1" />
          <div className="h-1 bg-white/40 rounded-full w-full" />
          <div className="h-1 bg-white/40 rounded-full w-5/6" />
          <div className="h-1 bg-white/30 rounded-full w-4/5 mt-1" />
          <div className="h-1 bg-white/30 rounded-full w-full" />
          <div className="h-1 bg-white/20 rounded-full w-3/4" />
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-purple-600/10 transition-opacity flex items-center justify-center">
          <span className="text-white/70 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full">{he ? "פתח" : "Open"}</span>
        </div>
      </div>
      {/* Footer */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-white/90 text-sm font-medium truncate">{cv.name}</p>
          <p className="text-white/60 text-xs">{timeAgo(cv.updatedAt, he)}</p>
        </div>
        <DotMenu items={[
          { label: he ? "מחק" : "Delete", danger: true, onClick: onDelete },
        ]} />
      </div>
    </div>
  );
}

// ── New card placeholder ──────────────────────────────────────────────────────
function NewCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 bg-transparent hover:bg-purple-500/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 h-[168px] hover:-translate-y-0.5"
    >
      <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-purple-500/20 border border-white/10 group-hover:border-purple-500/30 flex items-center justify-center transition-all">
        <svg className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-white/60 group-hover:text-purple-300 text-xs font-medium transition-colors">{label}</span>
    </button>
  );
}

// ── Conversation card ─────────────────────────────────────────────────────────
function ConvCard({
  conv, he, onContinue, onDelete, onRename,
}: {
  conv: ConversationPreview; he: boolean;
  onContinue: () => void; onDelete: () => void; onRename: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const jobs = conv.jobs ?? [];

  async function commitRename() {
    const trimmed = draft.trim();
    setEditing(false);
    if (!trimmed || trimmed === conv.title) return;
    await fetch(`/api/conversations/${conv.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    onRename(trimmed);
  }

  async function handleDelete() {
    await fetch(`/api/conversations/${conv.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="group rounded-2xl border border-white/10 hover:border-purple-500/30 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 overflow-hidden hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-0.5">
      {/* Card body */}
      <div
        className="px-4 pt-4 pb-3 cursor-pointer"
        onClick={!editing ? onContinue : undefined}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input ref={inputRef} value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false); }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/10 border border-purple-500/50 rounded-lg px-2 py-0.5 text-white text-sm focus:outline-none"
                autoFocus
              />
            ) : (
              <p className="text-white/90 text-sm font-medium truncate">
                {conv.title ?? (he ? "שיחה עם Scout" : "Scout conversation")}
              </p>
            )}
            <p className="text-white/60 text-xs mt-0.5">{timeAgo(conv.createdAt, he)}</p>
          </div>
        </div>
        {jobs.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-green-500/15 border border-green-500/25 text-green-400 px-2 py-0.5 rounded-full font-medium">
              {jobs.length} {he ? "משרות" : "jobs"}
            </span>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        <button onClick={onContinue}
          className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-400/40 bg-emerald-500/8 px-2.5 py-1 rounded-lg transition">
          {he ? "המשך ←" : "Continue →"}
        </button>
        <div className="flex items-center gap-1">
          <Link href={`/conversations/${conv.id}`} onClick={(e) => e.stopPropagation()}
            className="text-xs text-white/30 hover:text-purple-400 border border-white/8 hover:border-purple-500/30 px-2 py-1 rounded-lg transition">
            {he ? "צפה" : "View"}
          </Link>
          <DotMenu items={[
            { label: he ? "שנה שם" : "Rename", onClick: () => { setDraft(conv.title ?? ""); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50); } },
            { label: he ? "מחק" : "Delete", danger: true, onClick: handleDelete },
          ]} />
        </div>
      </div>
    </div>
  );
}

// ─── ArchivedSessionCard ──────────────────────────────────────────────────────
function ArchivedSessionCard({ session, he }: { session: ArchivedAdvisorSession; he: boolean }) {
  const [open, setOpen] = useState(false);
  const { snapshot } = session;
  const dateStr = new Date(session.archivedAt).toLocaleDateString(he ? "he-IL" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  const stageReached = snapshot.currentStage === "done" ? (he ? "הושלם" : "Completed")
    : snapshot.strategy ? (he ? "אסטרטגיה" : "Strategy")
    : snapshot.cvReview ? (he ? "קו\"ח" : "CV Review")
    : snapshot.direction ? (he ? "כיוון" : "Direction")
    : snapshot.diagnosis ? (he ? "דיאגנוזה" : "Diagnosis")
    : (he ? "לא הושלם" : "Not completed");
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/3 transition text-start">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${snapshot.currentStage === "done" ? "text-green-400/80 bg-green-500/10 border-green-500/20" : "text-white/35 bg-white/5 border-white/10"}`}>{stageReached}</span>
          <span className="text-white/40 text-xs">{dateStr}</span>
          {snapshot.chosenPath && (
            <span className="text-purple-300/60 text-xs hidden sm:inline">{he ? PATH_LABELS[snapshot.chosenPath]?.he : PATH_LABELS[snapshot.chosenPath]?.en}</span>
          )}
        </div>
        <svg className={`w-3.5 h-3.5 text-white/25 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && snapshot.diagnosis?.topRoles && (
        <div className="px-4 pb-3 border-t border-white/5 pt-2.5">
          <div className="flex flex-wrap gap-1.5">
            {snapshot.diagnosis.topRoles.map((r, i) => (
              <span key={i} className="text-xs text-white/50 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-white/40 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {action}
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
  const [cvs, setCvs] = useState<CvMeta[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState<ArchivedAdvisorSession[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const allOfferedJobs = useMemo(() => {
    const seenUrls = new Set<string>();
    return conversations.flatMap((c) => c.jobs ?? [])
      .filter((j) => { if (seenUrls.has(j.url)) return false; seenUrls.add(j.url); return true; })
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
    } catch { } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  useEffect(() => {
    const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;
    const localAdvisor = getAdvisorState(profileId);
    setAdvisor(localAdvisor);
    if (localAdvisor) {
      const completedCount = localAdvisor.currentStage === "done"
        ? STAGE_ORDER.length
        : Math.max(0, STAGE_ORDER.indexOf(localAdvisor.currentStage as typeof STAGE_ORDER[number]));
      fetch("/api/user-meta", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorCurrentStage: localAdvisor.currentStage, advisorCompletedCount: completedCount }) }).catch(() => {});
    }
    setArchivedSessions(getAdvisorArchive(profileId));
  }, [session?.user?.id]);

  useEffect(() => {
    fetch("/api/conversations").then((r) => r.json())
      .then((d) => setConversations(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    fetch("/api/subscription").then((r) => r.json()).then((d) => { if (d?.plan) setPlan(d.plan); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/user-meta").then((r) => r.json()).then((d) => {
      if (d && !d.error) {
        setUserMeta(d as UserMeta);
        const hasDbProfile = d.title || (d.skills?.length ?? 0) > 0 || d.yearsExperience !== undefined;
        if (!hasDbProfile) {
          const patch: Record<string, unknown> = {};
          const profiles = getSavedProfiles();
          if (profiles.length > 0) {
            const pd = profiles[profiles.length - 1].profile.parsedData;
            if (pd.currentRole) patch.title = pd.currentRole;
            if (pd.location) patch.location = pd.location;
            if (pd.yearsExperience !== undefined) patch.yearsExperience = pd.yearsExperience;
            if (pd.education) patch.education = pd.education;
            if (pd.skills?.length) patch.skills = pd.skills;
            if (pd.languages?.length) patch.languages = pd.languages;
            if (pd.targetRoles?.length) patch.targetRoles = pd.targetRoles;
          }
          const pid = session?.user?.id ?? DEFAULT_ADVISOR_ID;
          const localAdvisor = getAdvisorState(pid);
          if (!d.bio && !patch.bio && localAdvisor?.cvReview?.rewrittenSummary) patch.bio = localAdvisor.cvReview.rewrittenSummary;
          if (Object.keys(patch).length > 0) {
            fetch("/api/user-meta", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) })
              .then((r) => r.json()).then(() => setUserMeta((prev) => ({ ...prev, ...(patch as Partial<UserMeta>) }))).catch(() => {});
          }
        }
      }
    }).catch(() => {});
    fetch("/api/cvs").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setCvs(d); }).catch(() => {});
  }, [session?.user?.id]);

  async function saveMeta(patch: Partial<UserMeta>) {
    await fetch("/api/user-meta", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setUserMeta((prev) => ({ ...prev, ...patch }));
  }

  const [activeSection, setActiveSection] = useState<"cvs" | "searches" | "jobs" | "advisor" | "profile" | "tracker">("cvs");
  const router = useRouter();
  const user = session?.user;
  const profileId = user?.id ?? DEFAULT_ADVISOR_ID;
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const displayImage = userMeta.profileImage ?? user?.image ?? null;

  const effectiveStage = advisor?.currentStage ?? userMeta.advisorCurrentStage ?? null;
  const advisorStarted  = !!(advisor || userMeta.advisorCurrentStage);
  const advisorDone     = effectiveStage === "done";
  const currentStageIdx = effectiveStage && effectiveStage !== "done" ? STAGE_ORDER.indexOf(effectiveStage as typeof STAGE_ORDER[number]) : -1;
  const completedCount  = advisorDone ? STAGE_ORDER.length : (advisor ? Math.max(0, currentStageIdx) : (userMeta.advisorCompletedCount ?? 0));
  const mockDone        = !!advisor?.mockInterview?.finished;
  const professionalSummary = advisor?.cvReview?.rewrittenSummary ?? null;

  function handleNewAdvisorSession() {
    archiveAdvisorState(profileId);
    setArchivedSessions(getAdvisorArchive(profileId));
    setAdvisor(null);
    fetch("/api/user-meta", { method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorCurrentStage: null, advisorCompletedCount: 0 }) }).catch(() => {});
    router.push(`/advisor?profileId=${profileId}`);
  }

  async function deleteCV(id: string) {
    await fetch(`/api/cvs/${id}`, { method: "DELETE" });
    setCvs((prev) => prev.filter((c) => c.id !== id));
  }

  const navItems: {
    id: "cvs" | "searches" | "jobs" | "advisor" | "profile" | "tracker";
    labelHe: string; labelEn: string; badge?: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: "cvs", labelHe: "קורות חיים", labelEn: "My CVs", badge: cvs.length,
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: "searches", labelHe: "חיפושי משרות", labelEn: "Job Searches", badge: conversations.length,
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    },
    {
      id: "jobs", labelHe: "המשרות שלי", labelEn: "My Jobs", badge: allOfferedJobs.length,
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" /></svg>,
    },
    {
      id: "advisor", labelHe: "ייעוץ תעסוקתי", labelEn: "Career Advisor",
      badge: completedCount > 0 ? completedCount : undefined,
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    },
    {
      id: "profile", labelHe: "פרופיל אישי", labelEn: "Personal Info",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      id: "tracker", labelHe: "מעקב הגשות", labelEn: "Applications",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0 sticky top-20 gap-1">

            {/* Avatar card */}
            <div className="linear-card p-4 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative group cursor-pointer flex-shrink-0" onClick={() => avatarInputRef.current?.click()}>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayImage} alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm select-none" style={{ background: "linear-gradient(135deg, #5E6AD2, #7C3AED)" }}>
                      {initials}
                    </div>
                  )}
                  <div className={`absolute inset-0 rounded-xl flex items-center justify-center transition-all ${uploadingAvatar ? "bg-black/60" : "bg-black/0 group-hover:bg-black/55"}`}>
                    {uploadingAvatar
                      ? <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      : <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    }
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate leading-tight">{user?.name || "—"}</p>
                  <p className="text-white/60 text-xs truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Advisor mini-progress */}
              {advisorStarted && (
                <div className="mb-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/35 text-[10px] uppercase tracking-wide">{he ? "ייעוץ" : "Advisor"}</span>
                    <span className="text-[10px] font-bold" style={{ color: advisorDone ? "#4ADE80" : "#5E6AD2" }}>
                      {advisorDone ? (he ? "הושלם" : "Done") : `${completedCount}/${STAGE_ORDER.length}`}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${advisorDone ? 100 : Math.round((completedCount / STAGE_ORDER.length) * 100)}%`,
                        background: advisorDone ? "#4ADE80" : "#5E6AD2",
                      }}
                    />
                  </div>
                </div>
              )}

              {plan === "free" ? (
                <Link
                  href="/pricing"
                  className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-white py-2 rounded-lg transition"
                  style={{ background: "#5E6AD2", boxShadow: "0 0 0 1px rgba(94,106,210,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#6D79DB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#5E6AD2")}
                >
                  {he ? "שדרג לפרמיום" : "Upgrade to Premium"}
                </Link>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {he ? "מנוי פעיל" : "Active plan"}
                </div>
              )}
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-start group ${
                      active
                        ? "text-white"
                        : "text-white/65 hover:text-white/90 hover:bg-white/[0.04]"
                    }`}
                    style={active ? { background: "rgba(94,106,210,0.12)", border: "1px solid rgba(94,106,210,0.22)" } : undefined}
                  >
                    <span style={{ color: active ? "#5E6AD2" : undefined }} className={active ? "" : "text-white/45 group-hover:text-white/70 transition-colors"}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{he ? item.labelHe : item.labelEn}</span>
                    {item.badge ? (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-semibold ${active ? "text-purple-300" : "bg-white/8 text-white/60"}`}
                        style={active ? { background: "rgba(94,106,210,0.25)" } : undefined}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="mt-1 pt-2 border-t border-white/[0.05]">
              <Link href="/settings"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white/85 hover:bg-white/[0.04] transition w-full group">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {he ? "הגדרות" : "Settings"}
              </Link>
            </div>
          </aside>

          {/* ─── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Mobile horizontal tabs */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 mb-5 scrollbar-hide">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveSection(item.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      active ? "text-white" : "text-white/45 bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                    style={active ? { background: "rgba(94,106,210,0.15)", border: "1px solid rgba(94,106,210,0.3)" } : undefined}
                  >
                    <span style={{ color: active ? "#5E6AD2" : undefined }} className={active ? "" : "text-white/25"}>{item.icon}</span>
                    {he ? item.labelHe : item.labelEn}
                    {item.badge ? <span className="text-[10px] bg-white/10 px-1.5 rounded-full">{item.badge}</span> : null}
                  </button>
                );
              })}
            </div>

            {/* ── CVs ──────────────────────────────────────────────────────── */}
            {activeSection === "cvs" && (
              <>
                <SectionHeader
                  title={he ? "קורות החיים שלי" : "My CVs"}
                  count={cvs.length}
                  action={
                    <Link href="/cv-builder?from=/profile"
                      className="flex items-center gap-1.5 text-sm font-semibold text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 px-3 py-1.5 rounded-xl transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {he ? "צור חדש" : "Create new"}
                    </Link>
                  }
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  <NewCard
                    label={he ? "צור קורות חיים" : "New CV"}
                    onClick={() => router.push("/cv-builder?from=/profile")}
                  />
                  {cvs.map((cv) => (
                    <CvCard key={cv.id} cv={cv} he={he} onDelete={() => deleteCV(cv.id)} />
                  ))}
                </div>
                {cvs.length === 0 && (
                  <p className="text-white/25 text-sm mt-4 text-center">{he ? "עדיין אין קורות חיים" : "No CVs yet"}</p>
                )}
              </>
            )}

            {/* ── Job Searches ─────────────────────────────────────────────── */}
            {activeSection === "searches" && (
              <>
                <SectionHeader
                  title={he ? "חיפושי משרות" : "Job Searches"}
                  count={conversations.length}
                  action={
                    <button onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 px-3 py-1.5 rounded-xl transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {he ? "חיפוש חדש" : "New search"}
                    </button>
                  }
                />
                {loadingConvs ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[0,1,2].map((i) => <div key={i} className="h-32 bg-white/4 rounded-2xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    <NewCard
                      label={he ? "חיפוש חדש" : "New search"}
                      onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                    />
                    {conversations.map((conv) => (
                      <ConvCard key={conv.id} conv={conv} he={he}
                        onContinue={() => router.push(`/?continueConv=${conv.id}`)}
                        onDelete={() => setConversations((prev) => prev.filter((c) => c.id !== conv.id))}
                        onRename={(title) => setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, title } : c))}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── My Jobs ──────────────────────────────────────────────────── */}
            {activeSection === "jobs" && (
              <>
                <SectionHeader title={he ? "המשרות שלי" : "My Jobs"} count={allOfferedJobs.length} />
                {allOfferedJobs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" /></svg>
                    </div>
                    <p className="text-white/30 text-sm">{he ? "עדיין אין משרות" : "No jobs yet"}</p>
                    <button onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                      className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block transition">
                      {he ? "צאי לחיפוש ←" : "Start searching →"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(showAllJobs ? allOfferedJobs : allOfferedJobs.slice(0, 10)).map((job) => (
                      <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/15 rounded-xl px-4 py-3 transition group">
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-sm font-medium truncate group-hover:text-purple-300 transition">{job.title}</p>
                          <p className="text-white/35 text-xs truncate">{job.company} · {job.source}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <ScoreChip score={job.matchScore} />
                          {job.isRemote && <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded-full">{he ? "מרחוק" : "Remote"}</span>}
                          <svg className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </div>
                      </a>
                    ))}
                    {allOfferedJobs.length > 10 && (
                      <button onClick={() => setShowAllJobs((v) => !v)}
                        className="w-full text-center text-xs text-white/25 hover:text-white/50 transition py-2">
                        {showAllJobs ? (he ? "הצג פחות" : "Show less") : `+${allOfferedJobs.length - 10} ${he ? "משרות נוספות" : "more"}`}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Career Advisor ───────────────────────────────────────────── */}
            {activeSection === "advisor" && (
              <>
                <SectionHeader title={he ? "ייעוץ תעסוקתי" : "Career Advisor"} />
                <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 mb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <p className="text-white font-semibold mb-0.5">{he ? "מסע הייעוץ שלכם" : "Your advisor journey"}</p>
                      <p className="text-white/40 text-sm">
                        {!advisorStarted ? (he ? "טרם התחלת" : "Not started yet")
                          : advisorDone ? (he ? "כל השלבים הושלמו 🎉" : "All stages complete 🎉")
                          : (he ? `${completedCount} מתוך ${STAGE_ORDER.length} שלבים` : `${completedCount} of ${STAGE_ORDER.length} stages`)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {advisorStarted && (
                        <button onClick={handleNewAdvisorSession}
                          className="text-white/30 hover:text-white/60 text-xs border border-white/8 hover:border-white/20 px-3 py-1.5 rounded-xl transition">
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
                          <Link href={`/advisor?profileId=${profileId}`}
                            className="text-purple-400 hover:text-purple-300 text-sm font-semibold border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-xl transition">
                            {he ? "ראה סיכום" : "View summary"}
                          </Link>
                          {!mockDone && (
                            <Link href={`/advisor?profileId=${profileId}`}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                              {he ? "ראיון מדומה" : "Mock interview"}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage progress */}
                  <div className="flex items-start gap-0 overflow-x-auto pb-1">
                    {STAGE_ORDER.map((stage, i) => {
                      const done = advisorDone || i < completedCount;
                      const current = !advisorDone && i === completedCount;
                      return (
                        <div key={stage} className="flex items-start flex-shrink-0">
                          <div className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-green-500" : current ? "bg-purple-600 ring-4 ring-purple-600/25 animate-pulse" : "bg-white/8 text-white/25"}`} style={(done || current) ? { color: "#fff" } : undefined}>
                              {done ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span>{i + 1}</span>}
                            </div>
                            <span className={`text-[10px] text-center leading-tight px-1 ${done ? "text-green-400" : current ? "text-purple-300" : "text-white/25"}`}>
                              {he ? (STAGE_LABELS[stage]?.he ?? stage) : (STAGE_LABELS[stage]?.en ?? stage)}
                            </span>
                          </div>
                          {i < STAGE_ORDER.length - 1 && <div className={`h-0.5 w-6 sm:w-8 mt-3.5 flex-shrink-0 ${done ? "bg-green-500" : "bg-white/8"}`} />}
                        </div>
                      );
                    })}
                    <div className="flex items-start flex-shrink-0">
                      <div className={`h-0.5 w-6 sm:w-8 mt-3.5 flex-shrink-0 ${advisorDone ? "bg-green-500" : "bg-white/8"}`} />
                      <div className="flex flex-col items-center gap-1.5 w-16 sm:w-20">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${mockDone ? "bg-green-500" : advisorDone ? "bg-amber-500 ring-4 ring-amber-500/25 animate-pulse" : "bg-white/8 text-white/25"}`} style={(mockDone || advisorDone) ? { color: "#fff" } : undefined}>
                          {mockDone ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                        </div>
                        <span className={`text-[10px] text-center leading-tight px-1 ${mockDone ? "text-green-400" : advisorDone ? "text-amber-400" : "text-white/25"}`}>
                          {he ? "ראיון" : "Interview"}{advisorDone && !mockDone && " ★"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {advisor?.chosenPath && (
                    <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2 flex-wrap">
                      <span className="text-white/35 text-xs">{he ? "מסלול:" : "Path:"}</span>
                      <span className="text-purple-300 text-xs bg-purple-500/15 border border-purple-500/25 px-2.5 py-0.5 rounded-full">
                        {he ? PATH_LABELS[advisor.chosenPath]?.he ?? advisor.chosenPath : PATH_LABELS[advisor.chosenPath]?.en ?? advisor.chosenPath}
                      </span>
                      {advisor.diagnosis?.strengths.slice(0, 3).map((s) => (
                        <span key={s} className="text-white/35 text-xs bg-white/4 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {advisorDone && advisor && (advisor.diagnosis?.topRoles?.length || advisor.strategy?.targetCompanies?.length) && (
                  <div className="bg-white/[0.03] border border-purple-500/20 rounded-2xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white font-semibold">{he ? "המלצות הייעוץ" : "Recommendations"}</p>
                      <Link href={`/advisor?profileId=${profileId}`}
                        className="text-xs text-white/35 hover:text-white/70 border border-white/8 hover:border-white/20 px-2.5 py-1 rounded-lg transition">
                        {he ? "סיכום מלא" : "Full summary"}
                      </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      {advisor.diagnosis?.topRoles && advisor.diagnosis.topRoles.length > 0 && (
                        <div>
                          <p className="text-emerald-400/70 text-xs font-semibold uppercase tracking-wide mb-2">{he ? "תפקידים מומלצים" : "Recommended roles"}</p>
                          <div className="flex flex-col gap-1.5">
                            {advisor.diagnosis.topRoles.map((role, i) => (
                              <div key={i} className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-3 py-2">
                                <span className="text-emerald-400/60 text-xs font-bold">#{i+1}</span>
                                <span className="text-white/80 text-sm">{role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {advisor.strategy?.targetCompanies && advisor.strategy.targetCompanies.length > 0 && (
                        <div>
                          <p className="text-purple-400/70 text-xs font-semibold uppercase tracking-wide mb-2">{he ? "חברות יעד" : "Target companies"}</p>
                          <div className="flex flex-col gap-1.5">
                            {advisor.strategy.targetCompanies.slice(0, 4).map((c, i) => (
                              <div key={i} className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                                <span className="text-white/80 text-sm">{c.name}</span>
                                <span className="text-white/25 text-xs">{c.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const lines: string[] = [];
                        if (advisor.diagnosis?.topRoles?.length) lines.push(`תפקידים: ${advisor.diagnosis.topRoles.join(", ")}`);
                        if (advisor.strategy?.targetCompanies?.length) lines.push(`חברות יעד: ${advisor.strategy.targetCompanies.map((c) => c.name).join(", ")}`);
                        if (advisor.chosenPath) lines.push(`מסלול: ${he ? PATH_LABELS[advisor.chosenPath]?.he : PATH_LABELS[advisor.chosenPath]?.en}`);
                        queueAdvisorScoutContext(lines.join("\n"));
                        queueAutoStart("jobs");
                        router.push("/");
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      {he ? "מצא לי משרות לפי הסיכום" : "Find jobs from my summary"}
                    </button>
                  </div>
                )}

                {/* Past sessions */}
                {archivedSessions.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-wide mb-3">
                      {he ? `ייעוצים קודמים (${archivedSessions.length})` : `Past sessions (${archivedSessions.length})`}
                    </p>
                    <div className="space-y-1.5">
                      {archivedSessions.map((s) => <ArchivedSessionCard key={s.id} session={s} he={he} />)}
                    </div>
                  </div>
                )}

                {/* Professional summary */}
                {professionalSummary && (
                  <div className="mt-4 bg-white/[0.03] border border-purple-500/20 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-semibold text-sm">{he ? "הסיכום המקצועי שלכם" : "Your Professional Summary"}</p>
                      <Link href="/cv-builder?from=/profile"
                        className="text-xs text-white/35 hover:text-white/70 border border-white/8 px-2.5 py-1 rounded-lg transition">
                        {he ? "הוסף ל-CV" : "Add to CV"}
                      </Link>
                    </div>
                    <blockquote className="border-s-2 border-purple-500/50 ps-4 text-white/65 text-sm leading-relaxed">
                      {professionalSummary}
                    </blockquote>
                  </div>
                )}
              </>
            )}

            {/* ── Personal Info ─────────────────────────────────────────────── */}
            {activeSection === "profile" && (
              <>
                <SectionHeader title={he ? "פרופיל אישי" : "Personal Info"} />
                <UserMetaCard meta={userMeta} scoutData={{}} onSave={saveMeta} he={he} />
              </>
            )}

            {/* ── Applications ─────────────────────────────────────────────── */}
            {activeSection === "tracker" && (
              <>
                <SectionHeader title={he ? "מעקב הגשות" : "Applications"} />
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">
                    {he ? "שמור משרות, עקוב אחרי סטטוס ההגשות וקבל תזכורות." : "Save jobs, track application status, and get follow-up reminders."}
                  </p>
                  <Link href="/tracker"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition">
                    {he ? "פתח לוח מעקב" : "Open Tracker"}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </Link>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
