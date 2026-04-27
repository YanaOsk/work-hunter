"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdvisorState, LifePath } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import { queueAutoStart, queueAdvisorScoutContext } from "@/lib/autoStart";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onOpenInterview: () => void;
  onExit: () => void;
}

export default function SummaryView({ advisorState, onBack, onOpenInterview, onExit }: Props) {
  const { lang } = useLanguage();
  const router = useRouter();
  const tx = t[lang];
  const { diagnosis, direction, cvReview, strategy, chosenPath, userProfile } = advisorState;
  const name = userProfile.parsedData?.name || "";
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const wrapper = contentRef.current;
    if (!wrapper || downloading) return;
    setDownloading(true);
    try {
      const { toCanvas } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const hidden = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-no-pdf]"));
      hidden.forEach((el) => (el.style.display = "none"));

      const canvas = await toCanvas(wrapper, {
        pixelRatio: 2,
        backgroundColor: "#0f172a",
        skipFonts: false,
      });

      hidden.forEach((el) => el.style.removeProperty("display"));

      if (canvas.width === 0 || canvas.height === 0) throw new Error("Canvas is empty");

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pageW = 210;
      const pageH = 297;
      const ratio = pageW / canvas.width;
      const totalH = canvas.height * ratio;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let yOffset = 0;
      let remaining = totalH;
      while (remaining > 0) {
        pdf.addImage(imgData, "JPEG", 0, -yOffset, pageW, totalH);
        remaining -= pageH;
        if (remaining > 0) { pdf.addPage(); yOffset += pageH; }
      }

      pdf.save(`career-summary-${name || "advisor"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendToScout = () => {
    const lines: string[] = [];
    if (diagnosis?.topRoles?.length)
      lines.push(`תפקידים שמתאימים לי: ${diagnosis.topRoles.join(", ")}`);
    if (strategy?.targetCompanies?.length)
      lines.push(`חברות יעד: ${strategy.targetCompanies.map((c) => c.name).join(", ")}`);
    if (chosenPath)
      lines.push(`מסלול: ${pathLabel(chosenPath, tx)}`);
    if (diagnosis?.strengths?.length)
      lines.push(`חוזקות: ${diagnosis.strengths.slice(0, 3).join(", ")}`);
    queueAdvisorScoutContext(lines.join("\n"));
    queueAutoStart("jobs");
    router.push("/");
  };

  const chosenOption = direction?.options?.find((o) => o.path === chosenPath);
  const otherOptions = direction?.options?.filter((o) => o.path !== chosenPath) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto" ref={contentRef}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm transition">
            {tx.backToMap}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 disabled:opacity-50 text-sm border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl transition"
              title={lang === "he" ? "הורד כ-PDF" : "Download as PDF"}
            >
              {downloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {downloading ? (lang === "he" ? "מכין..." : "Preparing...") : "PDF"}
            </button>
            <button onClick={onExit} className="text-white/50 hover:text-white text-sm transition">
              {tx.newSearch}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{tx.summaryTitle}</h1>
          <p className="text-purple-300">
            {name && `${name} · `}
            {tx.summarySubtitle}
          </p>
        </div>

        {/* Top Message — personal brand statement */}
        {diagnosis?.topMessage && (
          <div className="relative mb-8 px-8 py-6 bg-gradient-to-br from-purple-600/15 via-emerald-600/10 to-purple-600/15 border border-purple-500/25 rounded-2xl overflow-hidden text-center">
            <div className="absolute top-3 start-5 text-5xl leading-none text-purple-500/20 select-none">"</div>
            <p className="text-lg md:text-xl font-semibold text-white/95 leading-relaxed relative z-10">
              {diagnosis.topMessage}
            </p>
            <div className="absolute bottom-1 end-5 text-5xl leading-none text-purple-500/20 select-none">"</div>
          </div>
        )}

        {/* Section 1: Professional DNA */}
        {diagnosis && (
          <Section title={tx.summarySection1}>
            {/* MBTI + Holland */}
            <div className="flex items-center gap-2 mb-4">
              {diagnosis.mbtiType && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-mono">
                  {diagnosis.mbtiType}
                </span>
              )}
              {diagnosis.hollandCode && (
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-mono">
                  {diagnosis.hollandCode}
                </span>
              )}
            </div>

            {/* Summary — personal address */}
            <p className="text-white/85 leading-relaxed mb-5">{diagnosis.summary}</p>

            {/* Top 2 roles */}
            {diagnosis.topRoles && diagnosis.topRoles.length > 0 && (
              <div className="mb-5">
                <h4 className="text-emerald-300 text-xs font-semibold mb-2.5 uppercase tracking-wide">
                  {tx.summaryTopRoles}
                </h4>
                <div className="flex flex-col gap-2">
                  {diagnosis.topRoles.map((role, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5"
                    >
                      <span className="text-emerald-400 text-xs font-bold tabular-nums">#{i + 1}</span>
                      <span className="text-white font-medium text-sm">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths / environments / directions */}
            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.diagnosisStrengths} items={diagnosis.strengths} color="emerald" />
              <MiniList title={tx.diagnosisEnvironments} items={diagnosis.workEnvironmentFit} color="purple" />
              <MiniList title={tx.diagnosisDirections} items={diagnosis.careerDirections} color="blue" />
            </div>
          </Section>
        )}

        {/* Section 2: Chosen path */}
        {chosenOption && (
          <Section title={tx.summarySection2}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-white">{pathLabel(chosenOption.path, tx)}</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                ⭐ {chosenOption.fitScore}/100
              </span>
            </div>
            {direction?.rationale && (
              <p className="text-white/75 italic text-sm mb-4">{direction.rationale}</p>
            )}
            <p className="text-white/85 leading-relaxed mb-4">{chosenOption.summary}</p>

            {/* Earning potential vs quality of life bars */}
            {(chosenOption.earningPotential !== undefined || chosenOption.qualityOfLife !== undefined) && (
              <div className="mb-4 space-y-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                {chosenOption.earningPotential !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-32 flex-shrink-0 text-end">
                      {tx.summaryEarningPotential}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${chosenOption.earningPotential}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 text-xs font-mono w-7 text-end">
                      {chosenOption.earningPotential}
                    </span>
                  </div>
                )}
                {chosenOption.qualityOfLife !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-32 flex-shrink-0 text-end">
                      {tx.summaryQualityOfLife}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${chosenOption.qualityOfLife}%` }}
                      />
                    </div>
                    <span className="text-purple-400 text-xs font-mono w-7 text-end">
                      {chosenOption.qualityOfLife}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.pros} items={chosenOption.pros} color="emerald" />
              <MiniList title={tx.cons} items={chosenOption.cons} color="rose" />
              <MiniList title={tx.firstSteps} items={chosenOption.firstSteps} color="blue" />
            </div>
          </Section>
        )}

        {/* Section 2b: Other paths comparison */}
        {otherOptions.length > 0 && (
          <Section title={tx.summaryAllPaths}>
            <div className="grid md:grid-cols-2 gap-3">
              {otherOptions.map((opt) => (
                <div key={opt.path} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{pathLabel(opt.path, tx)}</h4>
                    <span className="text-xs text-white/40">{opt.fitScore}/100</span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{opt.summary}</p>

                  {/* Compact bars for other options */}
                  {(opt.earningPotential !== undefined || opt.qualityOfLife !== undefined) && (
                    <div className="space-y-1.5 mb-3">
                      {opt.earningPotential !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/35 text-[10px] w-24 text-end flex-shrink-0">
                            {tx.summaryEarningPotential}
                          </span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${opt.earningPotential}%` }} />
                          </div>
                          <span className="text-white/40 text-[10px] w-5 text-end">{opt.earningPotential}</span>
                        </div>
                      )}
                      {opt.qualityOfLife !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/35 text-[10px] w-24 text-end flex-shrink-0">
                            {tx.summaryQualityOfLife}
                          </span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${opt.qualityOfLife}%` }} />
                          </div>
                          <span className="text-white/40 text-[10px] w-5 text-end">{opt.qualityOfLife}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <MiniList title={tx.pros} items={(opt.pros ?? []).slice(0, 2)} color="emerald" small />
                    <MiniList title={tx.cons} items={(opt.cons ?? []).slice(0, 2)} color="rose" small />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 3: CV Review */}
        {cvReview && (
          <Section title={tx.summarySection3}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">{tx.cvScore}</span>
              <span className="text-3xl font-bold text-emerald-400">{cvReview.overallScore}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <MiniList title={tx.cvStrengths} items={cvReview.strengths} color="emerald" />
              <MiniList title={tx.cvWeaknesses} items={cvReview.weaknesses} color="rose" />
            </div>
            {(cvReview.improvements ?? []).length > 0 && (
              <div className="mb-4">
                <h4 className="text-blue-300 text-sm font-semibold mb-2">{tx.cvImprovements}</h4>
                <div className="space-y-2">
                  {(cvReview.improvements ?? []).map((imp, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                      <div className="text-blue-300 text-xs font-semibold mb-1 uppercase">{imp.section}</div>
                      <div className="text-white/60 mb-1">❌ {imp.issue}</div>
                      <div className="text-white/90">✓ {imp.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.cvRewritten}</h4>
              <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {cvReview.rewrittenSummary}
              </div>
            </div>
          </Section>
        )}

        {/* Section 4: Search Strategy */}
        {strategy && (
          <Section title={tx.summarySection5}>
            {/* Target companies */}
            <div className="mb-5">
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.strategyCompanies}</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {(strategy.targetCompanies ?? []).map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-white text-sm">{c.name}</h5>
                      <span className="text-xs text-white/40">{c.size}</span>
                    </div>
                    <p className="text-white/70 text-xs">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Jobs Radar */}
            {strategy.hotJobs && strategy.hotJobs.length > 0 && (
              <div className="mb-5">
                <h4 className="text-emerald-300 text-sm font-semibold mb-2">{tx.summaryHotJobs}</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {strategy.hotJobs.map((job, i) => (
                    <div
                      key={i}
                      className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm leading-tight">{job.title}</p>
                          <p className="text-white/50 text-xs mt-0.5">{job.company}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                          {job.source}
                        </span>
                      </div>
                      <p className="text-white/65 text-xs leading-relaxed">{job.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facebook Groups */}
            {strategy.facebookGroups && strategy.facebookGroups.length > 0 && (
              <div className="mb-5">
                <h4 className="text-blue-300 text-sm font-semibold mb-2">{tx.summaryFacebookGroups}</h4>
                <div className="flex flex-wrap gap-2">
                  {strategy.facebookGroups.map((group, i) => (
                    <span
                      key={i}
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden market + networking (existing) */}
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <MiniList title={tx.strategyHidden} items={strategy.hiddenMarketTips} color="emerald" />
              <MiniList title={tx.strategyNetwork} items={strategy.networkingPlan} color="blue" />
            </div>

            {/* 30-Day Attack Plan */}
            {strategy.thirtyDayPlan && strategy.thirtyDayPlan.length > 0 && (
              <div className="mb-5">
                <h4 className="text-amber-300 text-sm font-semibold mb-2">{tx.summaryThirtyDayPlan}</h4>
                <div className="space-y-2">
                  {strategy.thirtyDayPlan.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3.5 py-2.5"
                    >
                      <span className="text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-white/80 text-sm leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Elevator Pitch */}
            <div>
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.summaryOutreachPitch}</h4>
              <div className="bg-white/5 border border-purple-500/30 rounded-lg p-4 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {strategy.outreachTemplate}
              </div>
            </div>
          </Section>
        )}

        {/* Top Line closing quote */}
        {strategy?.topLine && (
          <div className="relative mb-6 px-8 py-6 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-emerald-600/10 border border-white/10 rounded-2xl text-center overflow-hidden">
            <div className="absolute top-3 start-5 text-4xl leading-none text-white/10 select-none">"</div>
            <h4 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
              {tx.summaryTopLine}
            </h4>
            <p className="text-base md:text-lg font-bold text-white/95 leading-relaxed relative z-10">
              {strategy.topLine}
            </p>
            <div className="absolute bottom-1 end-5 text-4xl leading-none text-white/10 select-none">"</div>
          </div>
        )}

        {/* Scout CTA */}
        <div data-no-pdf className="mt-4 bg-gradient-to-br from-purple-600/20 to-emerald-600/20 border border-purple-500/30 rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === "he" ? "עכשיו Scout ימצא לך משרות" : "Now let Scout find your jobs"}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {lang === "he"
                  ? "Scout יקבל את הכיוונים שלך מהייעוץ וימצא עבורך משרות שמתאימות בדיוק לפרופיל."
                  : "Scout will receive your career direction and find jobs that match your profile precisely."}
              </p>
            </div>
          </div>
          <button
            onClick={handleSendToScout}
            className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition text-base"
          >
            {lang === "he" ? "שלח ל-Scout — מצא לי משרות" : "Send to Scout — Find my jobs"}
          </button>
        </div>

        {/* Interview CTA */}
        <div data-no-pdf className="mt-4 bg-gradient-to-br from-rose-600/20 to-amber-600/20 border border-rose-500/30 rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{tx.bonusInterview}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{tx.bonusInterviewDesc}</p>
            </div>
          </div>
          <button
            onClick={onOpenInterview}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition"
          >
            {tx.openInterview}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
      <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">{title}</h2>
      {children}
    </div>
  );
}

const MINI_COLORS = {
  emerald: { title: "text-emerald-300", bullet: "text-emerald-400" },
  purple: { title: "text-purple-300", bullet: "text-purple-400" },
  blue: { title: "text-blue-300", bullet: "text-blue-400" },
  rose: { title: "text-rose-300", bullet: "text-rose-400" },
} as const;

function MiniList({
  title,
  items,
  color,
  small = false,
}: {
  title: string;
  items: string[] | undefined | null;
  color: keyof typeof MINI_COLORS;
  small?: boolean;
}) {
  const c = MINI_COLORS[color];
  const safeItems = items ?? [];
  return (
    <div>
      <h4 className={`${c.title} ${small ? "text-[10px]" : "text-xs"} font-semibold mb-2 uppercase tracking-wide`}>
        {title}
      </h4>
      <ul className="space-y-1">
        {safeItems.map((it, i) => (
          <li key={i} className={`text-white/80 ${small ? "text-xs" : "text-sm"} flex gap-1.5`}>
            <span className={c.bullet}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pathLabel(
  path: LifePath,
  tx: { pathEmployee: string; pathEntrepreneur: string; pathStudies: string }
) {
  if (path === "employee") return tx.pathEmployee;
  if (path === "entrepreneur") return tx.pathEntrepreneur;
  return tx.pathStudies;
}
