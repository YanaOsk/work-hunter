"use client";

import { useState } from "react";
import { JobResult } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import CoverLetterModal from "./CoverLetterModal";

interface Props {
  job: JobResult;
  rank: number;
  saved?: boolean;
  onToggleSave?: () => void;
  onApplied?: () => void;
  onFindSimilar?: (job: JobResult) => void;
  userSkills?: string[];
}

function detectJobType(title: string, description: string): "part-time" | "freelance" | "contract" | null {
  const text = (title + " " + (description ?? "")).toLowerCase();
  if (/משרה חלקית|part[\s-]time|חלקי\b/.test(text)) return "part-time";
  if (/פרילנס|freelance/.test(text)) return "freelance";
  if (/\bארעי|\bזמני|temporary|\bcontract\b|קבלני/.test(text)) return "contract";
  return null;
}

function ScoreBadge({
  score,
  positives,
  negatives,
  lang,
}: {
  score: number;
  positives: string[];
  negatives: string[];
  lang: string;
}) {
  const [open, setOpen] = useState(false);
  const color =
    score >= 85
      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
      : score >= 70
      ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-400"
      : "bg-red-500/10 border-red-500/25 text-red-400";
  const hasReasons = positives.length > 0 || negatives.length > 0;

  return (
    <div className="relative flex-shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className={`flex items-center gap-1.5 border rounded-[4px] px-2.5 py-1 cursor-default select-none text-xs ${color}`}>
        <span className="font-semibold">{score}%</span>
        <span className="opacity-60">{lang === "he" ? "התאמה" : "match"}</span>
        {hasReasons && (
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {open && hasReasons && (
        <div
          className="absolute top-full mt-2 end-0 z-50 w-72 bg-slate-800 border border-white/[0.1] rounded-[8px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.6)] p-3 text-xs"
          style={{ direction: lang === "he" ? "rtl" : "ltr" }}
        >
          {positives.length > 0 && (
            <div className="mb-2.5">
              <p className="text-emerald-400/80 font-medium uppercase tracking-wide text-[10px] mb-1.5">
                {lang === "he" ? "למה כן" : "Why it fits"}
              </p>
              <div className="space-y-1">
                {positives.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <svg className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/70 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {negatives.length > 0 && (
            <div>
              <p className="text-red-400/80 font-medium uppercase tracking-wide text-[10px] mb-1.5">
                {lang === "he" ? "למה פחות" : "Potential gaps"}
              </p>
              <div className="space-y-1">
                {negatives.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <svg className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-white/60 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function highlightSkills(text: string, skills: string[]): React.ReactNode {
  if (!skills.length) return text;
  const escaped = skills.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part)
      ? <mark key={i} className="bg-amber-400/20 text-amber-300 rounded px-0.5 not-italic">{part}</mark>
      : part
  );
}

function formatPostedDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return lang === "he" ? "היום" : "Today";
    if (diffDays === 1) return lang === "he" ? "אתמול" : "Yesterday";
    if (diffDays < 7) return lang === "he" ? `לפני ${diffDays} ימים` : `${diffDays}d ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return lang === "he" ? `לפני ${weeks} שבועות` : `${weeks}w ago`;
    }
    return d.toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export default function JobCard({ job, rank, saved = false, onToggleSave, onApplied, onFindSimilar, userSkills = [] }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);
  const jobType = detectJobType(job.title, job.description);

  const handleViewJob = () => {
    if (!appliedToast) {
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 6000);
    }
  };

  const handleApplied = () => {
    setAppliedToast(false);
    if (onApplied) onApplied();
    if (!saved && onToggleSave) onToggleSave();
  };

  const accentBar =
    job.matchScore >= 85 ? "bg-emerald-500/60" :
    job.matchScore >= 70 ? "bg-yellow-500/50" :
    "bg-red-400/40";

  return (
    <div className="group relative bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-[8px] p-4 sm:p-5 transition-all duration-150 overflow-hidden">
      <div className={`absolute top-0 bottom-0 start-0 w-[3px] rounded-s-[8px] ${accentBar}`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {job.isNonObvious && (
              <span className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-[4px] font-medium">
                Scout&apos;s Pick
              </span>
            )}
            {!job.isNonObvious && rank <= 2 && (
              <span className="text-[11px] bg-[#5e6ad2]/15 border border-[#5e6ad2]/25 text-[#818cf8] px-2 py-0.5 rounded-[4px] font-medium">
                {rank === 1 ? tx.topPick : tx.greatMatch}
              </span>
            )}
            {job.isRemote && (
              <span className="text-[11px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded-[4px]">
                {tx.remote}
              </span>
            )}
            {jobType === "part-time" && (
              <span className="text-[11px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded-[4px]">
                {tx.jobTypePart}
              </span>
            )}
            {jobType === "freelance" && (
              <span className="text-[11px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-[4px]">
                {tx.jobTypeFreelance}
              </span>
            )}
            {jobType === "contract" && (
              <span className="text-[11px] bg-slate-500/15 border border-white/10 text-white/50 px-2 py-0.5 rounded-[4px]">
                {tx.jobTypeContract}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm sm:text-base leading-snug">{job.title}</h3>
          <p className="text-[#818cf8] text-sm mt-0.5">{job.company}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBadge score={job.matchScore} positives={job.matchReasons ?? []} negatives={job.matchNegatives ?? []} lang={lang} />
          {onToggleSave && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
              className={`p-1.5 rounded-[6px] transition-all duration-150 ${
                saved
                  ? "text-amber-400 bg-amber-500/10"
                  : "text-white/25 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-white/35 text-xs mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {job.location}
        </span>
        {job.salaryRange && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salaryRange}
          </span>
        )}
        {job.postedDate && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {tx.postedDate} {formatPostedDate(job.postedDate, lang)}
          </span>
        )}
        <span className="flex items-center gap-1 ms-auto">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
          {job.source}
        </span>
      </div>

      {job.salaryNote && (
        <p className="text-amber-400/60 text-xs mb-2 flex items-start gap-1">
          <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {job.salaryNote}
        </p>
      )}

      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
        {userSkills.length > 0 ? highlightSkills(job.description, userSkills) : job.description}
      </p>

      {job.matchReasons.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-medium text-white/30 uppercase tracking-wide">{tx.whyFits}</p>
          {job.matchReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-3 h-3 text-emerald-400/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/50 text-xs leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleViewJob}
          className="inline-flex items-center gap-1.5 bg-[#5e6ad2] hover:bg-[#6d79e8] text-white text-xs font-medium px-3.5 py-2 rounded-[6px] transition-colors duration-150"
        >
          {tx.viewJob}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <button
          onClick={() => setShowCoverLetter(true)}
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/5 px-3.5 py-2 rounded-[6px] transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {tx.coverLetterBtn}
        </button>
        {onFindSimilar && (
          <button
            onClick={() => onFindSimilar(job)}
            className="inline-flex items-center gap-1.5 text-[#818cf8]/60 hover:text-[#818cf8] text-xs border border-[#5e6ad2]/15 hover:border-[#5e6ad2]/35 hover:bg-[#5e6ad2]/8 px-3.5 py-2 rounded-[6px] transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {tx.findSimilar}
          </button>
        )}
      </div>

      {appliedToast && onApplied && (
        <div className="mt-3 flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-[6px] px-3 py-2.5 animate-fade-in">
          <span className="text-emerald-400 text-sm flex-shrink-0">✓</span>
          <p className="text-emerald-400/80 text-xs flex-1">{tx.appliedToast}</p>
          <button
            onClick={handleApplied}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-[4px] transition-colors duration-150 whitespace-nowrap"
          >
            {saved ? tx.appliedToastCta : tx.appliedToastSave}
          </button>
          <button
            onClick={() => setAppliedToast(false)}
            className="text-white/25 hover:text-white/60 transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {showCoverLetter && (
        <CoverLetterModal
          jobTitle={job.title}
          jobDescription={job.description}
          jobId={job.id}
          onClose={() => setShowCoverLetter(false)}
        />
      )}
    </div>
  );
}
