"use client";

import { useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import type { CvUpgradeResult } from "@/app/api/upgrade-cv/route";
import type { CvData, CvExperience, CvEducation } from "@/lib/cvBuilder";
import CvPreview from "./CvPreview";

interface Props {
  cvData: CvData;
  onApplyChanges?: (data: CvData) => void;
  onClose?: () => void;
  onScoutCta?: (cvSummary: string) => void;
}

function cvDataToText(cv: CvData): string {
  const parts: string[] = [];
  if (cv.personal.fullName) parts.push(`שם: ${cv.personal.fullName}`);
  if (cv.personal.title) parts.push(`תפקיד: ${cv.personal.title}`);
  if (cv.summary) parts.push(`\nסיכום מקצועי:\n${cv.summary}`);
  if (cv.experiences.length > 0) {
    parts.push(`\nניסיון תעסוקתי:`);
    cv.experiences.forEach((e) => {
      parts.push(`${e.role} ב-${e.company}${e.location ? `, ${e.location}` : ""} (${e.start}–${e.current ? "היום" : e.end})`);
      if (e.description) parts.push(e.description);
    });
  }
  if (cv.educations.length > 0) {
    parts.push(`\nהשכלה:`);
    cv.educations.forEach((e) => {
      parts.push(`${e.degree} - ${e.school}${e.location ? `, ${e.location}` : ""} (${e.start}–${e.current ? "היום" : e.end})`);
      if (e.description) parts.push(e.description);
    });
  }
  if (cv.military.unit || cv.military.role) {
    parts.push(`\nשירות צבאי:`);
    if (cv.military.role) parts.push(`תפקיד: ${cv.military.role}`);
    if (cv.military.unit) parts.push(`יחידה: ${cv.military.unit}`);
  }
  if (cv.skills) parts.push(`\nכישורים:\n${cv.skills}`);
  if (cv.languages) parts.push(`\nשפות:\n${cv.languages}`);
  return parts.join("\n");
}

function applyImprovements(
  cv: CvData,
  upgrades: { section: string; before: string; after: string }[]
): CvData {
  let updated: CvData = {
    ...cv,
    experiences: cv.experiences.map((e): CvExperience => ({ ...e })),
    educations: cv.educations.map((e): CvEducation => ({ ...e })),
    military: { ...cv.military },
  };

  for (const u of upgrades) {
    const s = u.section.toLowerCase();

    if (s.includes("summary") || s.includes("סיכום") || s.includes("profile") || s.includes("פרופיל") || s.includes("objective")) {
      updated = { ...updated, summary: u.after };
    } else if (s.includes("skill") || s.includes("כישור") || s.includes("competenc")) {
      updated = { ...updated, skills: u.after };
    } else if (
      s.includes("experience") || s.includes("ניסיון") ||
      s.includes("work") || s.includes("עבודה") || s.includes("תפקיד")
    ) {
      const exps = updated.experiences.map((e): CvExperience => ({ ...e }));
      let matchIdx = -1;
      for (let i = 0; i < exps.length; i++) {
        if (exps[i].company && s.includes(exps[i].company.toLowerCase())) { matchIdx = i; break; }
        if (exps[i].role && s.includes(exps[i].role.toLowerCase())) { matchIdx = i; break; }
      }
      if (matchIdx === -1) {
        for (let i = 0; i < exps.length; i++) {
          if (exps[i].description && u.before && exps[i].description.slice(0, 40) === u.before.slice(0, 40)) {
            matchIdx = i; break;
          }
        }
      }
      if (matchIdx === -1 && exps.length > 0) matchIdx = 0;
      if (matchIdx >= 0) {
        exps[matchIdx] = { ...exps[matchIdx], description: u.after };
        updated = { ...updated, experiences: exps };
      }
    } else if (s.includes("military") || s.includes("צבאי") || s.includes("army") || s.includes("idf") || s.includes("מילואים")) {
      updated = { ...updated, military: { ...updated.military, role: u.after } };
    } else if (s.includes("education") || s.includes("השכלה") || s.includes("degree") || s.includes("university")) {
      const edus = updated.educations.map((e): CvEducation => ({ ...e }));
      if (edus.length > 0) {
        edus[0] = { ...edus[0], description: u.after };
        updated = { ...updated, educations: edus };
      }
    }
  }

  return updated;
}

export default function CvUpgrader({ cvData, onApplyChanges, onClose, onScoutCta }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const isRtl = lang === "he";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CvUpgradeResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<CvData | null>(null);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setPreviewData(null);

    try {
      const text = cvDataToText(cvData);
      const res = await fetch("/api/upgrade-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
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

  const buildScoutSummary = (r: CvUpgradeResult) => {
    const skills = r.profile.topSkills.slice(0, 5).join(", ");
    return `${r.profile.currentRole}, ${r.profile.yearsExperience} ניסיון, כישורים: ${skills}`;
  };

  const handleShowInTemplate = () => {
    if (!result) return;
    setPreviewData(applyImprovements(cvData, result.upgrades));
  };

  const handleAccept = () => {
    if (!previewData || !onApplyChanges) return;
    onApplyChanges(previewData);
    onClose?.();
  };

  return (
    <>
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

        {/* Analyze button (initial state) */}
        {!result && (
          <>
            {/* CV summary preview */}
            <div className="mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60">
              <p className="font-semibold text-white/80 mb-1">
                {isRtl ? "קורות חיים פתוחים:" : "Open CV:"}
              </p>
              <p className="truncate">{cvData.personal.fullName || (isRtl ? "ללא שם" : "No name")} · {cvData.personal.title || ""}</p>
              <p className="text-white/40 text-xs mt-0.5">
                {cvData.experiences.length} {isRtl ? "תפקידים" : "positions"} · {cvData.educations.length} {isRtl ? "השכלה" : "education"}
              </p>
            </div>

            {error && <p className="text-rose-400 text-xs mb-3 text-center">{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={loading}
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {result.upgrades.length > 0 && onApplyChanges && (
                <button
                  onClick={handleShowInTemplate}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {isRtl ? "הצג בתבנית" : "Show in template"}
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
                onClick={() => { setResult(null); setError(""); setPreviewData(null); }}
                className="sm:w-auto px-5 py-3 border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-xl text-sm transition"
              >
                {isRtl ? "ניתוח חדש" : "New analysis"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full-screen template preview */}
      {previewData && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/80 backdrop-blur-sm">
          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center justify-between gap-4 px-5 py-3 bg-slate-900 border-b border-white/10">
            <p className="text-white/60 text-sm">
              {isRtl ? "תצוגה מקדימה — שיפורי AI" : "Preview — AI improvements"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 border border-white/15 hover:border-white/30 text-white/60 hover:text-white rounded-lg text-sm transition"
              >
                {isRtl ? "בטל" : "Cancel"}
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm transition"
              >
                {isRtl ? "אמץ שינויים" : "Apply changes"}
              </button>
            </div>
          </div>
          {/* CV preview */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <CvPreview data={previewData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
