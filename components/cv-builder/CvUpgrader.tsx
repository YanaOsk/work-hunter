"use client";

import { useRef, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import type { CvUpgradeResult } from "@/app/api/upgrade-cv/route";

interface Props {
  onScoutCta?: (cvSummary: string) => void;
  onClose?: () => void;
}

export default function CvUpgrader({ onScoutCta, onClose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const isRtl = lang === "he";

  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CvUpgradeResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput = !!file || pasteText.trim().length > 40;

  const handleAnalyze = async () => {
    if (!hasInput || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let res: Response;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        if (pasteText.trim()) fd.append("text", pasteText);
        fd.append("lang", lang);
        res = await fetch("/api/upgrade-cv", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/upgrade-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pasteText, lang }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? tx.cvUpgradeError);
      }

      const data = await res.json() as CvUpgradeResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.cvUpgradeError);
    } finally {
      setLoading(false);
    }
  };

  const copyAfter = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const downloadImproved = (r: CvUpgradeResult) => {
    const lines: string[] = [];
    lines.push(isRtl ? "קורות חיים — גרסה משופרת עם AI" : "CV — AI-Improved Version");
    lines.push("=".repeat(50));
    r.upgrades.forEach((u) => {
      lines.push("");
      lines.push(`[${u.section}]`);
      lines.push(u.after);
    });
    if (r.strategicTips.length > 0) {
      lines.push("");
      lines.push(isRtl ? "טיפים אסטרטגיים:" : "Strategic Tips:");
      r.strategicTips.forEach((tip, i) => lines.push(`${i + 1}. ${tip}`));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isRtl ? "קורות_חיים_משופרים.txt" : "improved_cv.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildScoutSummary = (r: CvUpgradeResult) => {
    const skills = r.profile.topSkills.slice(0, 5).join(", ");
    return `${r.profile.currentRole}, ${r.profile.yearsExperience} ניסיון, כישורים: ${skills}`;
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-white font-bold text-xl">{tx.cvUpgradeTitle}</h2>
          <p className="text-white/50 text-sm mt-1 max-w-md">{tx.cvUpgradeSubtitle}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition ms-4 mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {!result && (
        <>
          {/* Drop zone */}
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f?.type === "application/pdf") { setFile(f); setError(""); }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
              dragging
                ? "border-purple-400 bg-purple-500/10"
                : file
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setError(""); }
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium truncate max-w-[220px]">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-white/30 hover:text-rose-400 transition ms-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-white/25 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-white/45 text-sm">{tx.cvUpgradeDrop}</p>
              </>
            )}
          </div>

          {/* Paste area */}
          <div className="mb-4">
            <label className="block text-white/50 text-xs mb-1.5">{tx.cvUpgradePasteLabel}</label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={tx.cvUpgradePastePh}
              rows={5}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white/80 placeholder-white/25 text-sm resize-none focus:outline-none focus:border-purple-500/60 transition"
            />
          </div>

          {error && <p className="text-rose-400 text-xs mb-3 text-center">{error}</p>}

          <button
            onClick={handleAnalyze}
            disabled={!hasInput || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tx.cvUpgrading}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {tx.cvUpgradeAnalyze}
              </>
            )}
          </button>
        </>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{tx.cvUpgradeProfile}</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-white/40 text-xs mb-0.5">{tx.cvUpgradeRole}</p>
                <p className="text-white text-sm font-medium">{result.profile.currentRole}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-0.5">{tx.cvUpgradeExp}</p>
                <p className="text-white text-sm font-medium">{result.profile.yearsExperience}</p>
              </div>
              <div className="col-span-2">
                <p className="text-white/40 text-xs mb-0.5">{tx.cvUpgradeEdu}</p>
                <p className="text-white text-sm font-medium">{result.profile.education}</p>
              </div>
            </div>
            {result.profile.topSkills.length > 0 && (
              <div>
                <p className="text-white/40 text-xs mb-1.5">{tx.cvUpgradeSkills}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.profile.topSkills.map((s) => (
                    <span key={s} className="bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weaknesses */}
          {result.weaknesses.length > 0 && (
            <div>
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{tx.cvUpgradeWeaknesses}</h3>
              <div className="flex flex-wrap gap-2">
                {result.weaknesses.map((w) => (
                  <span key={w} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-1.5 rounded-full">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Before / after cards */}
          {result.upgrades.length > 0 && (
            <div>
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{tx.cvUpgradeChanges}</h3>
              <div className="space-y-4">
                {result.upgrades.map((u, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10 bg-white/[0.03]">
                      <span className="text-white/70 text-xs font-semibold">{u.section}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                      <div className="p-4">
                        <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider mb-2">{tx.cvUpgradeBefore}</p>
                        <p className="text-white/55 text-sm leading-relaxed whitespace-pre-line">{u.before}</p>
                      </div>
                      <div className="p-4 bg-emerald-500/5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-emerald-400/70 text-[10px] font-semibold uppercase tracking-wider">{tx.cvUpgradeAfter}</p>
                          <button
                            onClick={() => copyAfter(u.after, i)}
                            className="text-xs text-white/40 hover:text-white/80 transition flex items-center gap-1"
                          >
                            {copiedIdx === i ? (
                              <>{tx.cvUpgradeCopied}</>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {tx.cvUpgradeCopy}
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{u.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic tips */}
          {result.strategicTips.length > 0 && (
            <div>
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{tx.cvUpgradeTips}</h3>
              <ol className="space-y-2">
                {result.strategicTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-white/75 text-sm leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Download improved + Scout CTA + Redo */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {result.upgrades.length > 0 && (
              <button
                onClick={() => downloadImproved(result)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {lang === "he" ? "הורד עם שיפורי AI" : "Download with AI improvements"}
              </button>
            )}
            {onScoutCta && (
              <button
                onClick={() => onScoutCta(buildScoutSummary(result))}
                className="flex-1 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {tx.cvUpgradeScoutCta}
              </button>
            )}
            <button
              onClick={() => { setResult(null); setFile(null); setPasteText(""); setError(""); }}
              className="sm:w-auto px-5 py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl text-sm transition"
            >
              {lang === "he" ? "ניתוח חדש" : "New analysis"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
