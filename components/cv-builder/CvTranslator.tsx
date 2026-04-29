"use client";

import { useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import type { CvData } from "@/lib/cvBuilder";

interface Props {
  currentData: CvData;
  currentName: string;
  onDone: (translatedData: CvData, newName: string) => void;
  onClose: () => void;
}

type TranslateDirection = "he-en" | "en-he";

function detectCvLang(data: CvData): "he" | "en" {
  const sample = [
    data.personal.fullName,
    data.personal.title,
    data.summary,
    data.experiences[0]?.description ?? "",
  ].join(" ");
  return /[א-ת]/.test(sample) ? "he" : "en";
}

const FEATURES_EN = [
  { icon: "💼", key: "cvTranslateFeature1" },
  { icon: "🎖️", key: "cvTranslateFeature2" },
  { icon: "⚡", key: "cvTranslateFeature3" },
  { icon: "📍", key: "cvTranslateFeature4" },
  { icon: "💻", key: "cvTranslateFeature5" },
] as const;

export default function CvTranslator({ currentData, currentName, onDone, onClose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const isRtl = lang === "he";

  const cvLang = detectCvLang(currentData);
  const [direction, setDirection] = useState<TranslateDirection>(cvLang === "he" ? "he-en" : "en-he");
  const targetLang = direction === "he-en" ? "en" : "he";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/translate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: currentData, targetLang }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? tx.cvTranslateError);
      }

      const translatedData: CvData = await res.json();

      const nameSuffix = targetLang === "en"
        ? tx.cvTranslateNewName.replace("{name}", currentName)
        : tx.cvTranslateNewNameHe.replace("{name}", currentName);

      onDone(translatedData, nameSuffix);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.cvTranslateError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🌐</span>
            <h2 className="text-white font-bold text-xl">{tx.cvTranslateTitle}</h2>
          </div>
          <p className="text-white/50 text-sm max-w-sm">{tx.cvTranslateSubtitle}</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 transition ms-4 mt-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Direction selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
        <p className="text-white/40 text-xs mb-3">{tx.cvTranslateCurrentLang}</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { dir: "he-en" as TranslateDirection, label: "עברית לאנגלית" },
            { dir: "en-he" as TranslateDirection, label: "אנגלית לעברית" },
          ]).map(({ dir, label }) => (
            <button
              key={dir}
              onClick={() => setDirection(dir)}
              className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                direction === dir
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-white/5 border-white/15 text-white/50 hover:text-white hover:border-white/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature list */}
      <div className="mb-5">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2.5">
          {tx.cvTranslateWhatChanges}
        </p>
        <ul className="space-y-2">
          {FEATURES_EN.map(({ icon, key }) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-white/65">
              <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
              <span>{tx[key as keyof typeof tx]}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Note */}
      <p className="text-white/35 text-xs mb-4 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {tx.cvTranslateWillCreate}
      </p>
      <p className="text-white/25 text-xs mb-4">
        {isRtl
          ? "התרגום עשוי להכיל טעויות — מומלץ לבדוק את כל הפרמטרים ולערוך בהתאם."
          : "The translation may contain errors — review all fields and edit as needed."}
      </p>

      {error && <p className="text-rose-400 text-xs mb-3 text-center">{error}</p>}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tx.cvTranslating}
            </>
          ) : (
            <>
              <span className="text-base">🌐</span>
              {targetLang === "en" ? tx.cvTranslateToEn : tx.cvTranslateToHe}
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="px-5 py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl text-sm transition"
        >
          {lang === "he" ? "ביטול" : "Cancel"}
        </button>
      </div>
    </div>
  );
}
