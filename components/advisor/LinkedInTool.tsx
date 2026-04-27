"use client";

import { useState } from "react";
import { AdvisorState, LinkedInProfile } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onComplete: (result: LinkedInProfile) => void;
  onSkip: () => void;
}

export default function LinkedInTool({ advisorState, onBack, onComplete, onSkip }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const [phase, setPhase] = useState<"gate" | "input">("gate");
  const [targetRole, setTargetRole] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentLinkedin, setCurrentLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/advisor/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: advisorState.userProfile,
          diagnosis: advisorState.diagnosis,
          currentLinkedin: [linkedinUrl.trim(), currentLinkedin.trim()].filter(Boolean).join("\n\n"),
          targetRole: targetRole.trim(),
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onComplete(data as LinkedInProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen label={tx.linkedinAnalyzing} />;

  if (phase === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
            {tx.backToAdvisor}
          </button>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
            <h1 className="text-2xl font-bold text-white">{tx.toolLinkedin}</h1>
            <p className="text-white/70 leading-relaxed">{tx.linkedinIntro}</p>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">{tx.linkedinTarget}</label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder={tx.interviewRolePlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">{tx.linkedinUrlLabel}</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ltr:text-left"
                dir="ltr"
                placeholder={tx.linkedinUrlPh}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">{tx.linkedinCurrent}</label>
              <textarea
                value={currentLinkedin}
                onChange={(e) => setCurrentLinkedin(e.target.value)}
                rows={8}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={submit}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition"
            >
              {tx.linkedinSubmit}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
          {tx.backToAdvisor}
        </button>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white">{tx.toolLinkedin}</h1>
          <p className="text-white/80 leading-relaxed text-lg">{tx.introLinkedin}</p>

          <p className="text-white font-semibold pt-2">{tx.introLinkedinQuestion}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setPhase("input")}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {tx.yesIHave}
            </button>
            <button
              onClick={onSkip}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium py-3.5 rounded-xl transition"
            >
              {tx.noSkip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center">
        <svg className="animate-spin w-10 h-10 text-purple-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-white/70">{label}</p>
      </div>
    </div>
  );
}
