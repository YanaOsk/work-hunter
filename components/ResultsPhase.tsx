"use client";

import { useState, useEffect } from "react";
import { JobResult, UserProfile } from "@/lib/types";
import JobCard from "./JobCard";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

const FREE_RESULTS = 3;
const SAVED_KEY = "wh_saved_jobs";

interface Props {
  jobs: JobResult[];
  userProfile: UserProfile;
  demoMode: boolean;
  isSubscribed?: boolean;
  isStreaming?: boolean;
  onReset: () => void;
}

export default function ResultsPhase({
  jobs,
  userProfile,
  demoMode,
  isSubscribed = false,
  isStreaming = false,
  onReset,
}: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterSaved, setFilterSaved] = useState(false);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_KEY);
      if (stored) setSavedUrls(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const toggleSave = (url: string) => {
    setSavedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const filtered = jobs.filter((j) => {
    if (filterRemote && !j.isRemote) return false;
    if (j.matchScore < filterMinScore) return false;
    if (filterSaved && !savedUrls.has(j.url)) return false;
    return true;
  });

  const showPaywall = !isSubscribed && !demoMode && !isStreaming && filtered.length > FREE_RESULTS;
  const visibleJobs = showPaywall ? filtered.slice(0, FREE_RESULTS) : filtered;
  const hiddenCount = showPaywall ? filtered.length - FREE_RESULTS : 0;
  const savedCount = jobs.filter((j) => savedUrls.has(j.url)).length;

  const profile = userProfile.parsedData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm sm:text-lg truncate flex items-center gap-2">
              {isStreaming && (
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block flex-shrink-0" />
              )}
              {jobs.length} {tx.jobsFound}
              {isStreaming ? "..." : (
                profile?.name && <span className="text-purple-400 hidden sm:inline"> — {profile.name}</span>
              )}
            </h1>
            <p className="text-white/40 text-xs">
              {isStreaming ? tx.streamingResults : tx.rankedBy}
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-white/60 hover:text-white text-xs sm:text-sm flex items-center gap-1 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {tx.newSearch}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {demoMode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="text-yellow-400 text-xl">⚡</span>
            <div>
              <p className="text-yellow-300 text-sm font-medium">{tx.demoMode}</p>
              <p className="text-yellow-300/70 text-xs">{tx.demoDesc}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setFilterRemote(!filterRemote)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              filterRemote
                ? "bg-blue-500/30 border border-blue-500/50 text-blue-300"
                : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
            }`}
          >
            {tx.filterRemote}
          </button>
          <button
            onClick={() => setFilterMinScore(filterMinScore === 80 ? 0 : 80)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              filterMinScore === 80
                ? "bg-green-500/30 border border-green-500/50 text-green-300"
                : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
            }`}
          >
            {tx.filter80}
          </button>
          {savedCount > 0 && (
            <button
              onClick={() => setFilterSaved(!filterSaved)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                filterSaved
                  ? "bg-amber-500/30 border border-amber-500/50 text-amber-300"
                  : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={filterSaved ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {tx.filterSaved} ({savedCount})
            </button>
          )}
          {(filterRemote || filterMinScore > 0 || filterSaved) && (
            <button
              onClick={() => { setFilterRemote(false); setFilterMinScore(0); setFilterSaved(false); }}
              className="text-white/40 hover:text-white text-xs transition"
            >
              {tx.clearFilters}
            </button>
          )}
          <div className="ms-auto hidden md:flex gap-2">
            {profile?.workPreference && (
              <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                {profile.workPreference}
              </span>
            )}
          </div>
        </div>

        {filtered.length === 0 && !isStreaming ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">{tx.noResults}</p>
            <button
              onClick={() => { setFilterRemote(false); setFilterMinScore(0); setFilterSaved(false); }}
              className="text-purple-400 text-sm mt-2 hover:underline"
            >
              {tx.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleJobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                rank={i + 1}
                saved={savedUrls.has(job.url)}
                onToggleSave={() => toggleSave(job.url)}
              />
            ))}

            {isStreaming && jobs.length === 0 && (
              <div className="flex items-center justify-center py-12 gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <span className="text-white/50 text-sm">{tx.streamingResults}</span>
              </div>
            )}

            {showPaywall && (
              <div className="mt-2 rounded-3xl overflow-hidden border border-white/10">
                <div className="bg-gradient-to-br from-purple-900/80 via-slate-900/90 to-purple-950/80 backdrop-blur-sm px-8 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/40 mb-5">
                    <svg className="w-7 h-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <p className="text-2xl font-bold text-white mb-1">
                    {tx.paywallUnlock.replace("{hidden}", String(hiddenCount))}
                  </p>
                  <p className="text-white/50 text-sm mb-6">
                    {tx.paywallTeaser.replace("{shown}", String(FREE_RESULTS)).replace("{total}", String(filtered.length))}
                  </p>

                  <div className="flex flex-col items-center gap-2 mb-7 text-sm text-white/60">
                    <span>✓ {tx.paywallPerk1.replace("{total}", String(filtered.length))}</span>
                    <span>✓ {tx.paywallPerk2}</span>
                    <span>✓ {tx.paywallPerk3}</span>
                  </div>

                  <div className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium px-4 py-1.5 rounded-full mb-5">
                    {tx.paywallDiscount}
                  </div>

                  <div className="flex justify-center">
                    <a
                      href="/pricing"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-sm"
                    >
                      {tx.paywallCta}
                    </a>
                  </div>
                </div>

                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none opacity-40 divide-y divide-white/5">
                    {filtered.slice(FREE_RESULTS, FREE_RESULTS + 2).map((job, i) => (
                      <JobCard key={job.id} job={job} rank={FREE_RESULTS + i + 1} />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/95" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs">{tx.footerNote}</p>
        </div>
      </div>
    </div>
  );
}
