"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { DEFAULT_ADVISOR_ID, getAdvisorState } from "@/lib/advisorState";
import ScoutRobot from "./ScoutRobot";
import FaqSection from "./FaqSection";
import SiteFooter from "./SiteFooter";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function UploadPhase({ onComplete }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";
  const { data: session } = useSession();
  const [freeText, setFreeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [advisorProfile, setAdvisorProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profileId = session?.user?.id ?? DEFAULT_ADVISOR_ID;
    const state = getAdvisorState(profileId);
    if (state?.diagnosis && state.userProfile.parsedData?.name) {
      setAdvisorProfile(state.userProfile);
    }
  }, [session?.user?.id]);

  const isAccepted = (f: File) =>
    f.type === "application/pdf" ||
    f.type.includes("word") ||
    f.type === "application/rtf" ||
    f.type === "text/rtf" ||
    /\.(docx?|rtf|pdf)$/i.test(f.name);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isAccepted(dropped)) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!freeText.trim() && !file) {
      setError(tx.pleaseAdd);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (freeText) formData.append("freeText", freeText);
      formData.append("lang", lang);
      const res = await fetch("/api/parse-cv", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      onComplete(data as UserProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-3 sm:gap-8 lg:gap-16">

        {/* ── Left / top: form ── */}
        <div className="w-full lg:flex-1 order-2 lg:order-1">

          {/* Greeting */}
          <div className="mb-8">
            <p className="text-[#818cf8]/60 text-xs font-medium tracking-widest uppercase mb-2">
              {he ? "ברוכים הבאים" : "Welcome"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3 tracking-tight">
              {he ? (
                <>היי! אני <span className="text-[#818cf8]">Scout</span> 👋</>
              ) : (
                <>Hey! I&apos;m <span className="text-[#818cf8]">Scout</span> 👋</>
              )}
            </h1>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed">
              {he
                ? "אני הולך להיות העוזר האישי שלכם לחיפוש עבודה. ספרו לי קצת על עצמכם ואני אמצא לכם את המשרות הכי מתאימות."
                : "I'm going to be your personal job search assistant. Tell me a bit about yourself and I'll find the most relevant jobs for you."}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-[10px] p-6 sm:p-8 space-y-5">

            {/* Advisor import banner */}
            {advisorProfile && (
              <div className="bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-[6px] px-4 py-3 flex items-center gap-3">
                <span className="text-lg flex-shrink-0">🎯</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{tx.scoutAdvisorBanner}</p>
                  <p className="text-white/40 text-xs truncate">{advisorProfile.parsedData?.name}</p>
                </div>
                <button
                  onClick={() => onComplete(advisorProfile)}
                  className="flex-shrink-0 bg-[#5e6ad2] hover:bg-[#6d79e8] text-white text-xs font-medium px-3 py-1.5 rounded-[6px] transition-colors duration-150"
                >
                  {tx.scoutAdvisorImport}
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wide">{tx.tellMe}</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={tx.uploadPlaceholder}
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-[6px] px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#5e6ad2]/50 focus:ring-1 focus:ring-[#5e6ad2]/30 resize-none transition-colors duration-150"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-white/25 text-xs">{tx.orUpload}</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group border border-dashed rounded-[8px] p-8 text-center cursor-pointer transition-all duration-150 ${
                dragging
                  ? "border-[#5e6ad2]/60 bg-[#5e6ad2]/8"
                  : "border-white/[0.1] hover:border-[#5e6ad2]/40 hover:bg-[#5e6ad2]/5"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.rtf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f && isAccepted(f)) setFile(f); }} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-[#818cf8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-sm">{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-white/30 hover:text-white/70 ms-1 text-xs">✕</button>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto mb-3 text-white/20 group-hover:text-[#818cf8]/60 transition-colors duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-white/35 text-sm group-hover:text-white/60 transition-colors duration-150">{tx.dropPdf}</p>
                </>
              )}
            </div>

            <p className="text-center text-white/25 text-xs leading-relaxed">{tx.privacy}</p>

            {error && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-[6px] px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-[#5e6ad2] hover:bg-[#6d79e8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-[6px] transition-colors duration-150 flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tx.analyzing}
                </>
              ) : tx.startSearch}
            </button>

          </div>
        </div>

        {/* ── Right / top on mobile: robot ── */}
        <div className="w-28 sm:w-52 lg:w-[340px] xl:w-[400px] order-1 lg:order-2 flex-shrink-0 flex flex-col items-center">
          <ScoutRobot className="w-full drop-shadow-[0_0_60px_rgba(124,58,237,0.35)]" />
          <p className="hidden sm:block text-purple-400/70 text-lg font-bold tracking-widest mt-3 select-none">Scout</p>
        </div>

      </div>
      </div>
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
