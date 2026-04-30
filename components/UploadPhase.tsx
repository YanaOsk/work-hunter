"use client";

import { useState, useRef, DragEvent } from "react";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
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
  const [freeText, setFreeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedResult, setParsedResult] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setParsedResult(data as UserProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-3 sm:gap-8 lg:gap-16">

        {/* ── Left / top: form ── */}
        <div className="w-full lg:flex-1 order-2 lg:order-1">

          {/* Greeting */}
          <div className="mb-8">
            <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-2">
              {he ? "ברוכים הבאים" : "Welcome"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              {he ? (
                <>היי! אני <span className="text-purple-400">Scout</span> 👋</>
              ) : (
                <>Hey! I&apos;m <span className="text-purple-400">Scout</span> 👋</>
              )}
            </h1>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed">
              {he
                ? "אני הולך להיות העוזר האישי שלך לחיפוש עבודה. ספר לי קצת על עצמך ואני אמצא לך את המשרות הכי מתאימות."
                : "I'm going to be your personal job search assistant. Tell me a bit about yourself and I'll find the most relevant jobs for you."}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">{tx.tellMe}</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={tx.uploadPlaceholder}
                rows={4}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-sm">{tx.orUpload}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragging
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-white/20 hover:border-purple-500 hover:bg-purple-500/8"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.rtf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f && isAccepted(f)) setFile(f); }} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-purple-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-white/40 hover:text-white ms-2">✕</button>
                </div>
              ) : (
                <>
                  <svg className="w-10 h-10 mx-auto mb-3 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-white/50 text-sm group-hover:text-white/80 transition-colors">{tx.dropPdf}</p>
                </>
              )}
            </div>

            <p className="text-center text-white/40 text-xs leading-relaxed">{tx.privacy}</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
            )}

            {parsedResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {he ? "הפרופיל נותח בהצלחה" : "Profile analyzed successfully"}
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-200 text-sm leading-relaxed">
                  {he
                    ? "⚠️ ניתוח ה-AI עשוי להכיל טעויות — Scout יאפשר לכם לתקן ולהשלים פרטים במהלך השיחה."
                    : "⚠️ AI analysis may not be 100% accurate — Scout will let you correct and add details during the conversation."}
                </div>
                <button onClick={() => onComplete(parsedResult)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-900/40">
                  {he ? "המשיכו לשיחה" : "Continue to Chat"}
                </button>
              </div>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-white/80 font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-900/40">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tx.analyzing}
                  </>
                ) : tx.startSearch}
              </button>
            )}

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
