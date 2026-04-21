"use client";

import { useState } from "react";
import { JobResult, UserProfile } from "@/lib/types";
import JobCard from "./JobCard";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  jobs: JobResult[];
  userProfile: UserProfile;
  demoMode: boolean;
  onReset: () => void;
}

export default function ResultsPhase({ jobs, userProfile, demoMode, onReset }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterMinScore, setFilterMinScore] = useState(0);

  const filtered = jobs.filter((j) => {
    if (filterRemote && !j.isRemote) return false;
    if (j.matchScore < filterMinScore) return false;
    return true;
  });

  const profile = userProfile.parsedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg">
              {filtered.length} {tx.jobsFound}
              {profile?.name && <span className="text-purple-400"> — {profile.name}</span>}
            </h1>
            <p className="text-white/40 text-xs">{tx.rankedBy}</p>
          </div>
          <button onClick={onReset} className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition">
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
          <button onClick={() => setFilterRemote(!filterRemote)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              filterRemote ? "bg-blue-500/30 border border-blue-500/50 text-blue-300" : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
            }`}>
            {tx.filterRemote}
          </button>
          <button onClick={() => setFilterMinScore(filterMinScore === 80 ? 0 : 80)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              filterMinScore === 80 ? "bg-green-500/30 border border-green-500/50 text-green-300" : "bg-white/5 border border-white/20 text-white/60 hover:border-white/40"
            }`}>
            {tx.filter80}
          </button>
          {(filterRemote || filterMinScore > 0) && (
            <button onClick={() => { setFilterRemote(false); setFilterMinScore(0); }}
              className="text-white/40 hover:text-white text-xs transition">
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

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">{tx.noResults}</p>
            <button onClick={() => { setFilterRemote(false); setFilterMinScore(0); }} className="text-purple-400 text-sm mt-2 hover:underline">
              {tx.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((job, i) => <JobCard key={job.id} job={job} rank={i + 1} />)}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs">{tx.footerNote}</p>
        </div>
      </div>
    </div>
  );
}
