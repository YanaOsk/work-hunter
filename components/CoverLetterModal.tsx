"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DEFAULT_ADVISOR_ID, getAdvisorState } from "@/lib/advisorState";
import { isJobSaved, saveCoverLetter } from "@/lib/applicationTracker";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  jobTitle: string;
  jobDescription?: string;
  jobId?: string;
  onClose: () => void;
}

export default function CoverLetterModal({ jobTitle, jobDescription = "", jobId, onClose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { data: session } = useSession();
  const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;

  const [jobDesc, setJobDesc] = useState(jobDescription);
  const [letter, setLetter] = useState("");
  const [keyStrengths, setKeyStrengths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const generate = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true);
    setError("");
    try {
      const advisorState = getAdvisorState(profileId);
      const res = await fetch("/api/advisor/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState?.userProfile ?? { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] },
          diagnosis: advisorState?.diagnosis ?? null,
          jobDescription: jobDesc.trim(),
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const generatedLetter = data.coverLetter || "";
      setLetter(generatedLetter);
      setKeyStrengths(data.keyStrengths ?? []);
      if (jobId && isJobSaved(profileId, jobId) && generatedLetter) {
        saveCoverLetter(profileId, jobId, generatedLetter);
        setSavedToTracker(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full md:max-w-2xl max-h-[90vh] bg-slate-900 border border-white/15 rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">{tx.coverLetterTitle}</h2>
            <p className="text-purple-300 text-xs mt-0.5 truncate max-w-xs">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!letter ? (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  {tx.coverLetterJobLabel}
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={8}
                  autoFocus
                  placeholder={tx.coverLetterJobPh}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={!jobDesc.trim() || loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tx.coverLetterAnalyzing}
                  </>
                ) : tx.coverLetterSubmit}
              </button>
            </>
          ) : (
            <>
              {keyStrengths.length > 0 && (
                <div>
                  <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">
                    {tx.coverLetterKeyStrengths}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keyStrengths.map((s, i) => (
                      <span key={i} className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {letter}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {tx.coverLetterCopied}
                    </>
                  ) : tx.coverLetterCopy}
                </button>
                <button
                  onClick={() => { setLetter(""); setKeyStrengths([]); setSavedToTracker(false); }}
                  className="text-white/40 hover:text-white/70 text-sm px-4 transition"
                >
                  {lang === "he" ? "כתוב מחדש" : "Rewrite"}
                </button>
              </div>
              {savedToTracker && (
                <p className="text-emerald-400 text-xs text-center flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {tx.coverLetterSaved}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
