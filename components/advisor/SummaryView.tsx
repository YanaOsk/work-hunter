"use client";

import { AdvisorState, LifePath } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onOpenInterview: () => void;
  onExit: () => void;
}

export default function SummaryView({ advisorState, onBack, onOpenInterview, onExit }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { diagnosis, direction, cvReview, strategy, chosenPath, userProfile } = advisorState;
  const name = userProfile.parsedData?.name || "";

  const chosenOption = direction?.options?.find((o) => o.path === chosenPath);
  const otherOptions = direction?.options?.filter((o) => o.path !== chosenPath) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm">
            ← {tx.backToMap}
          </button>
          <button
            onClick={onExit}
            className="text-white/50 hover:text-white text-sm"
          >
            {tx.newSearch}
          </button>
        </div>

        <div className="text-center mb-10">
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

        {diagnosis && (
          <Section title={tx.summarySection1}>
            <div className="flex items-center gap-2 mb-3">
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
            <p className="text-white/85 leading-relaxed mb-4">{diagnosis.summary}</p>
            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.diagnosisStrengths} items={diagnosis.strengths} color="emerald" />
              <MiniList
                title={tx.diagnosisEnvironments}
                items={diagnosis.workEnvironmentFit}
                color="purple"
              />
              <MiniList
                title={tx.diagnosisDirections}
                items={diagnosis.careerDirections}
                color="blue"
              />
            </div>
          </Section>
        )}

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
            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.pros} items={chosenOption.pros} color="emerald" />
              <MiniList title={tx.cons} items={chosenOption.cons} color="rose" />
              <MiniList title={tx.firstSteps} items={chosenOption.firstSteps} color="blue" />
            </div>
          </Section>
        )}

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
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <MiniList title={tx.pros} items={opt.pros.slice(0, 2)} color="emerald" small />
                    <MiniList title={tx.cons} items={opt.cons.slice(0, 2)} color="rose" small />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

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
            {cvReview.improvements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-blue-300 text-sm font-semibold mb-2">{tx.cvImprovements}</h4>
                <div className="space-y-2">
                  {cvReview.improvements.map((imp, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                      <div className="text-blue-300 text-xs font-semibold mb-1 uppercase">
                        {imp.section}
                      </div>
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

        {strategy && (
          <Section title={tx.summarySection5}>
            <div className="mb-4">
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.strategyCompanies}</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {strategy.targetCompanies.map((c, i) => (
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
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <MiniList title={tx.strategyHidden} items={strategy.hiddenMarketTips} color="emerald" />
              <MiniList title={tx.strategyNetwork} items={strategy.networkingPlan} color="blue" />
            </div>
            <div>
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.strategyTemplate}</h4>
              <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {strategy.outreachTemplate}
              </div>
            </div>
          </Section>
        )}

        <div className="mt-10 bg-gradient-to-br from-rose-600/20 to-amber-600/20 border border-rose-500/30 rounded-3xl p-8">
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
  items: string[];
  color: keyof typeof MINI_COLORS;
  small?: boolean;
}) {
  const c = MINI_COLORS[color];
  return (
    <div>
      <h4 className={`${c.title} ${small ? "text-[10px]" : "text-xs"} font-semibold mb-2 uppercase tracking-wide`}>
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className={`text-white/80 ${small ? "text-xs" : "text-sm"} flex gap-1.5`}>
            <span className={c.bullet}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkedInBlock({ label, text, multiline }: { label: string; text: string; multiline?: boolean }) {
  return (
    <div className="mb-4">
      <h4 className="text-purple-300 text-sm font-semibold mb-2">{label}</h4>
      <div
        className={`bg-white/5 border border-white/10 rounded-lg p-3 text-white/90 text-sm leading-relaxed ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      >
        {text}
      </div>
    </div>
  );
}

const PILL_COLORS = {
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
} as const;

function Pills({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: keyof typeof PILL_COLORS;
}) {
  return (
    <div>
      <h4 className="text-white/60 text-xs font-semibold mb-2">{label}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className={`px-2 py-0.5 rounded-full text-xs border ${PILL_COLORS[color]}`}>
            {it}
          </span>
        ))}
      </div>
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
