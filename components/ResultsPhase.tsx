"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { JobResult, UserProfile } from "@/lib/types";
import JobCard from "./JobCard";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import {
  addApplication,
  getApplications,
  isJobSaved,
  removeApplication,
  updateApplicationStatus,
} from "@/lib/applicationTracker";
import { DEFAULT_ADVISOR_ID } from "@/lib/advisorState";

const FREE_RESULTS = 3;

interface Props {
  jobs: JobResult[];
  userProfile: UserProfile;
  demoMode: boolean;
  isSubscribed?: boolean;
  isStreaming?: boolean;
  onReset: () => void;
  onRefine?: () => void;
}

type SortKey = "score" | "date";

function EmailModal({
  jobs,
  lang,
  onClose,
}: {
  jobs: JobResult[];
  lang: string;
  onClose: () => void;
}) {
  const tx = t[lang as keyof typeof t];
  const { data: session } = useSession();
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const send = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/scout/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: email.trim(), jobs, lang }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-slate-900 border border-white/15 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 end-4 text-white/40 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-white font-bold text-base mb-1">{tx.scoutEmailTitle}</h2>
        <p className="text-white/50 text-xs mb-4">
          {lang === "he"
            ? `שולח ${jobs.length} משרות לתיבת הדואר שלך`
            : `Sending ${jobs.length} jobs to your inbox`}
        </p>
        {status === "sent" ? (
          <p className="text-emerald-400 text-sm text-center py-4">{tx.scoutEmailSent}</p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tx.scoutEmailInput}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm mb-3"
            />
            {status === "error" && (
              <p className="text-rose-400 text-xs mb-2">{tx.scoutEmailFailed}</p>
            )}
            <button
              onClick={send}
              disabled={!email.trim() || status === "sending"}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              {status === "sending" ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tx.scoutEmailSending}
                </>
              ) : tx.scoutEmailSend}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResultsPhase({
  jobs,
  userProfile,
  demoMode,
  isSubscribed = false,
  isStreaming = false,
  onReset,
  onRefine,
}: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { data: session } = useSession();
  const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterSaved, setFilterSaved] = useState(false);
  const [filterLocation, setFilterLocation] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    const apps = getApplications(profileId);
    setSavedIds(new Set(apps.map((a) => a.id)));
  }, [profileId]);

  const toggleSave = (job: JobResult) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(job.id)) {
        removeApplication(profileId, job.id);
        next.delete(job.id);
      } else {
        addApplication(profileId, job);
        next.add(job.id);
      }
      return next;
    });
  };

  const handleMarkApplied = (job: JobResult) => {
    if (!isJobSaved(profileId, job.id)) {
      addApplication(profileId, job);
    }
    updateApplicationStatus(profileId, job.id, "applied");
    setSavedIds((prev) => new Set([...prev, job.id]));
  };

  const uniqueLocations = useMemo(() => {
    const locs = [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort();
    return locs;
  }, [jobs]);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      if (filterRemote && !j.isRemote) return false;
      if (j.matchScore < filterMinScore) return false;
      if (filterSaved && !savedIds.has(j.id)) return false;
      if (filterLocation !== "all" && j.location !== filterLocation) return false;
      return true;
    });
    if (sortKey === "date") {
      list = [...list].sort((a, b) => {
        if (!a.postedDate && !b.postedDate) return 0;
        if (!a.postedDate) return 1;
        if (!b.postedDate) return -1;
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
    }
    return list;
  }, [jobs, filterRemote, filterMinScore, filterSaved, filterLocation, sortKey, savedIds]);

  const showPaywall = !isSubscribed && !demoMode && !isStreaming && filtered.length > FREE_RESULTS;
  const visibleJobs = showPaywall ? filtered.slice(0, FREE_RESULTS) : filtered;
  const hiddenCount = showPaywall ? filtered.length - FREE_RESULTS : 0;
  const savedCount = savedIds.size;
  const userSkills = userProfile?.parsedData?.skills ?? [];
  const profile = userProfile.parsedData;

  const activeFilterCount = [filterRemote, filterMinScore > 0, filterSaved, filterLocation !== "all"].filter(Boolean).length;

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
          <div className="flex items-center gap-2 flex-shrink-0">
            {savedCount > 0 && (
              <Link
                href="/tracker"
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-xs border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 px-2.5 py-1.5 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {savedCount}
              </Link>
            )}
            {!isStreaming && (
              <button
                onClick={() => setShowEmail(true)}
                className="text-white/50 hover:text-white/80 text-xs border border-white/15 hover:border-white/30 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
                title={tx.scoutEmailResults}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">{tx.scoutEmailResults}</span>
              </button>
            )}
            {onRefine && !isStreaming && (
              <button
                onClick={onRefine}
                className="text-purple-300 hover:text-purple-200 text-xs border border-purple-500/30 hover:border-purple-500/60 bg-purple-500/10 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden sm:inline">{tx.refineSearch}</span>
              </button>
            )}
            <button
              onClick={onReset}
              className="text-white/60 hover:text-white text-xs sm:text-sm flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {tx.newSearch}
            </button>
          </div>
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

        {/* Filters + sort row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
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

          {/* Location filter */}
          {uniqueLocations.length > 1 && (
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className={`px-3 py-1.5 rounded-full text-sm bg-white/5 border transition-all appearance-none cursor-pointer ${
                filterLocation !== "all"
                  ? "border-violet-500/50 text-violet-300"
                  : "border-white/20 text-white/60 hover:border-white/40"
              }`}
            >
              <option value="all" className="bg-slate-900">{tx.allLocations}</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <div className="flex items-center gap-1 ms-auto">
            <span className="text-white/40 text-xs hidden sm:inline">{tx.sortBy}:</span>
            <button
              onClick={() => setSortKey("score")}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                sortKey === "score"
                  ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                  : "bg-white/5 border border-white/15 text-white/40 hover:text-white/60"
              }`}
            >
              {tx.sortScore}
            </button>
            <button
              onClick={() => setSortKey("date")}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                sortKey === "date"
                  ? "bg-purple-500/30 border border-purple-500/50 text-purple-300"
                  : "bg-white/5 border border-white/15 text-white/40 hover:text-white/60"
              }`}
            >
              {tx.sortDate}
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilterRemote(false); setFilterMinScore(0); setFilterSaved(false); setFilterLocation("all"); }}
              className="text-white/40 hover:text-white text-xs transition"
            >
              {tx.clearFilters}
            </button>
          )}

          <div className="w-full flex gap-2">
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
              onClick={() => { setFilterRemote(false); setFilterMinScore(0); setFilterSaved(false); setFilterLocation("all"); }}
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
                saved={savedIds.has(job.id)}
                onToggleSave={() => toggleSave(job)}
                onApplied={() => handleMarkApplied(job)}
                userSkills={userSkills}
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

      {showEmail && (
        <EmailModal
          jobs={filtered.length > 0 ? filtered : jobs}
          lang={lang}
          onClose={() => setShowEmail(false)}
        />
      )}
    </div>
  );
}
