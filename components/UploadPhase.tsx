"use client";

import { useState, useRef, DragEvent } from "react";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import SavedProfiles from "./SavedProfiles";

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function UploadPhase({ onComplete }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [freeText, setFreeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!freeText.trim() && !file) { setError(tx.pleaseAdd); return; }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <SavedProfiles onSelect={onComplete} />
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{tx.appName}</h1>
          <p className="text-purple-300 text-lg">{tx.appTagline}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
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
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging ? "border-purple-400 bg-purple-500/10" : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
                <svg className="w-10 h-10 text-white/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-white/50 text-sm">{tx.dropPdf}</p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tx.analyzing}
              </>
            ) : (
              <>
                {tx.startSearch}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "he" ? "M11 17l-5-5m0 0l5-5m-5 5h12" : "M13 7l5 5m0 0l-5 5m5-5H6"} />
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-white/20 text-xs">{tx.privacy}</p>
        </div>
      </div>
    </div>
  );
}
