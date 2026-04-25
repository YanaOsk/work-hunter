"use client";

import { JobResult } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props { job: JobResult; rank: number; }

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? "bg-green-500/20 border-green-500/40 text-green-300"
    : score >= 70 ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
    : "bg-red-500/20 border-red-500/40 text-red-300";
  return (
    <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 ${color}`}>
      <span className="text-sm font-bold">{score}%</span>
      <span className="text-xs opacity-70">match</span>
    </div>
  );
}

export default function JobCard({ job, rank }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <div className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 sm:p-5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {job.isNonObvious && (
              <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                ✦ {lang === "he" ? "הצעת Scout" : "Scout's Pick"}
              </span>
            )}
            {!job.isNonObvious && rank <= 2 && (
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                {rank === 1 ? tx.topPick : tx.greatMatch}
              </span>
            )}
            {job.isRemote && (
              <span className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                {tx.remote}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">{job.title}</h3>
          <p className="text-purple-300 text-sm mt-0.5">{job.company}</p>
        </div>
        <ScoreBadge score={job.matchScore} />
      </div>

      <div className="flex items-center gap-4 text-white/50 text-xs mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {job.location}
        </span>
        {job.salaryRange && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salaryRange}
          </span>
        )}
        <span className="flex items-center gap-1 ms-auto">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
          {job.source}
        </span>
      </div>

      <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">{job.description}</p>

      {job.matchReasons.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">{tx.whyFits}</p>
          {job.matchReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/70 text-xs leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      )}

      <a href={job.url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200">
        {tx.viewJob}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
