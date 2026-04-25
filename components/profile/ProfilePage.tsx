"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { getAdvisorState, clearAdvisorState, DEFAULT_ADVISOR_ID } from "@/lib/advisorState";
import { getSavedProfiles } from "@/lib/profiles";
import { AdvisorState, STAGE_ORDER } from "@/lib/types";
import type { ConversationPreview, JobSnap } from "@/lib/conversations";
import type { UserMeta } from "@/lib/userMeta";
import type { CvMeta } from "@/lib/cvs";
import { queueAutoStart } from "@/lib/autoStart";
import UserMetaCard from "./UserMetaCard";

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
  free:       { he: "Explorer · חינמי", en: "Explorer · Free",  cls: "text-white/60 bg-white/10 border-white/20" },
  weekly:     { he: "שבועי",            en: "Weekly",            cls: "text-blue-300 bg-blue-500/20 border-blue-500/30" },
  "one-time": { he: "Career Boost",     en: "Career Boost",      cls: "text-purple-300 bg-purple-500/20 border-purple-500/30" },
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

function ConvCard({ conv, he }: { conv: ConversationPreview; he: boolean }) {
  const [open, setOpen] = useState(false);
  const jobs = conv.jobs ?? [];
  const shown = open ? jobs : jobs.slice(0, 3);

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {conv.title ?? (he ? "שיחה עם Scout" : "Scout conversation")}
            </p>
            <p className="text-white/40 text-xs">{timeAgo(conv.createdAt, he)}
              {conv.messageCount != null && ` · ${conv.messageCount} ${he ? "הודעות" : "msg"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {jobs.length > 0 && (
            <span className="text-xs bg-green-500/20 border border-green-500/30 text-green-400 px-2.5 py-0.5 rounded-full font-medium">
              {jobs.length} {he ? "משרות" : "jobs"}
            </span>
          )}
          <Link
            href={`/conversations/${conv.id}`}
            className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/25 hover:border-purple-400/50 bg-purple-500/10 px-2.5 py-1 rounded-lg transition"
          >
            {he ? "צפה בשיחה" : "View chat"}
          </Link>
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

function FeatureRow({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <p className={`flex items-center gap-1.5 ${active ? "text-white/70" : "text-white/25 line-through"}`}>
      <span className={active ? "text-green-400" : "text-white/20"}>{active ? "✓" : "✗"}</span>
      {children}
    </p>
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    clearAdvisorState(profileId);
    // Reset MongoDB-backed stage so the progress bar reflects the fresh start
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-5">

        {/* ── USER HEADER ──────────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Avatar with upload overlay */}
            <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
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
                  className="w-[72px] h-[72px] rounded-2xl object-cover"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-2xl font-bold select-none">
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
            <div className="flex-1 min-w-0">
              <p className="text-white text-lg sm:text-xl font-bold truncate">{user?.name || "—"}</p>
              <p className="text-white/50 text-sm truncate">{user?.email}</p>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${planMeta.cls}`}>
                  {he ? planMeta.he : planMeta.en}
                </span>
                {plan === "free" && (
                  <Link href="/pricing" className="text-purple-400 hover:text-purple-300 text-xs transition">
                    {he ? "שדרג" : "Upgrade"}
                  </Link>
                )}
                {plan !== "free" && (
                  <span className="text-emerald-400 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {he ? "פעיל" : "Active"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── PROFILE DATA (Scout + editable) ──────────────────────────── */}
        <UserMetaCard meta={userMeta} scoutData={scoutData} onSave={saveMeta} he={he} />

        {/* ── MY CVs ───────────────────────────────────────────────────── */}
        {cvs.length > 0 && (
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>{he ? "קורות החיים שלי" : "My CVs"}</SectionTitle>
              <Link href="/cv-builder" className="text-purple-400 hover:text-purple-300 text-sm transition">
                {he ? "צור חדש" : "Create new"}
              </Link>
            </div>
            <div className="space-y-2">
              {cvs.map((cv) => (
                <Link key={cv.id} href={`/cv-builder?cvId=${cv.id}`}
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
          <div className="flex items-start justify-between gap-4 mb-5">
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
            <div className="flex items-center gap-2 flex-shrink-0">
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
            ) : !mockDone ? (
              <Link href={`/advisor?profileId=${profileId}`}
                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {he ? "ראיון מדומה" : "Mock interview"}
              </Link>
            ) : (
              <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {he ? "הושלם" : "Complete"}
              </span>
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
              <Link href="/cv-builder"
                className="flex-shrink-0 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl transition">
                {he ? "הוסף ל-CV" : "Add to CV"}
              </Link>
            </div>
            <blockquote className="border-s-2 border-purple-500 ps-4 text-white/80 text-sm leading-relaxed">
              {professionalSummary}
            </blockquote>
          </SectionCard>
        )}

        {/* ── SCOUT CONVERSATIONS ──────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center justify-between mb-5">
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
              {conversations.map((conv) => <ConvCard key={conv.id} conv={conv} he={he} />)}
            </div>
          )}
        </SectionCard>

        {/* ── SUBSCRIPTION ─────────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SectionTitle>{he ? "המנוי שלי" : "My Subscription"}</SectionTitle>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${planMeta.cls}`}>
                  {he ? planMeta.he : planMeta.en}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <FeatureRow active>{he ? "אבחון אישיות מלא (MBTI + Holland)" : "Full personality diagnosis"}</FeatureRow>
                <FeatureRow active>{he ? "כיוון חיים — בחירת מסלול" : "Life direction"}</FeatureRow>
                <FeatureRow active={plan !== "free"}>{he ? "סיכום תוכנית קריירה מלא" : "Full career plan summary"}</FeatureRow>
                <FeatureRow active={plan !== "free"}>{he ? "שיפור CV + LinkedIn" : "CV + LinkedIn rewrite"}</FeatureRow>
                <FeatureRow active={plan !== "free"}>{he ? "אסטרטגיית חיפוש עבודה" : "Job search strategy"}</FeatureRow>
                <FeatureRow active={plan === "pro"}>{he ? "חיפוש משרות חי (Pro)" : "Live job search (Pro)"}</FeatureRow>
              </div>
            </div>
            {plan === "free" && (
              <Link href="/pricing"
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                {he ? "שדרג" : "Upgrade"}
              </Link>
            )}
            {plan !== "free" && (
              <span className="flex-shrink-0 text-emerald-400 text-sm font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {he ? "פעיל" : "Active"}
              </span>
            )}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
