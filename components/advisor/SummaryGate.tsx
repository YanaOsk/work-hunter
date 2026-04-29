"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

export type UnlockPlan = "weekly" | "quarterly" | "lifetime";

interface Props {
  onUnlock: (plan: UnlockPlan) => void;
  onBack: () => void;
}

export default function SummaryGate({ onUnlock, onBack }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const previews = [
    { title: tx.gatePreview1, color: "purple" as const },
    { title: tx.gatePreview2, color: "emerald" as const },
    { title: tx.gatePreview3, color: "blue" as const },
    { title: tx.gatePreview4, color: "amber" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-8">
          {tx.backToMap}
        </button>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            {/* Sparkle dots */}
            <div className="absolute -top-1 -end-1 w-4 h-4 bg-purple-400 rounded-full opacity-70 animate-pulse" />
            <div className="absolute -bottom-1 -start-1 w-3 h-3 bg-emerald-400 rounded-full opacity-60 animate-pulse [animation-delay:0.5s]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {tx.gateTitle}
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            {tx.gateSubtitle}
          </p>
        </div>

        {/* Preview sections */}
        <div className="mb-10">
          <p className="text-white/50 text-sm text-center mb-5 uppercase tracking-wide font-medium">
            {tx.gateWhatInside}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previews.map((item, i) => (
              <LockedSection key={i} title={item.title} color={item.color} />
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <p className="text-center text-white text-xl font-bold mb-6">{tx.gateChoosePlan}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PlanCard
              name={tx.planWeeklyName}
              badge={tx.planWeeklyBadge}
              price={tx.planWeeklyPrice}
              per={tx.planWeeklyPer}
              tagline={tx.planWeeklyTagline}
              cta={tx.gateUnlock}
              variant="weekly"
              onClick={() => onUnlock("weekly")}
            />
            <PlanCard
              name={tx.planQuarterlyName}
              badge={tx.planQuarterlyBadge}
              price={tx.planQuarterlyPrice}
              per={tx.planQuarterlyPer}
              tagline={tx.planQuarterlyTagline}
              cta={tx.gateUnlock}
              variant="popular"
              onClick={() => onUnlock("quarterly")}
            />
            <PlanCard
              name={tx.planLifetimeName}
              badge={tx.planLifetimeBadge}
              oldPrice={tx.planLifetimeOld}
              price={tx.planLifetimePrice}
              tagline={tx.planLifetimeTagline}
              cta={tx.gateUnlock}
              variant="pro"
              onClick={() => onUnlock("lifetime")}
            />
          </div>
        </div>

        <p className="text-center text-white/25 text-xs">{tx.gateDemoNote}</p>
      </div>
    </div>
  );
}

// --- Locked preview section ---
const COLOR_MAP = {
  purple: { dot: "bg-purple-500", bar: "bg-purple-500/15", lock: "text-purple-400" },
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-500/15", lock: "text-emerald-400" },
  blue: { dot: "bg-blue-500", bar: "bg-blue-500/15", lock: "text-blue-400" },
  amber: { dot: "bg-amber-500", bar: "bg-amber-500/15", lock: "text-amber-400" },
} as const;

function LockedSection({
  title,
  color,
}: {
  title: string;
  color: keyof typeof COLOR_MAP;
}) {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-2.5 h-2.5 rounded-full ${c.dot} flex-shrink-0`} />
        <span className="text-white text-sm font-semibold">{title}</span>
      </div>
      {/* Blurred placeholder lines */}
      <div className="space-y-2 pointer-events-none select-none">
        {[78, 92, 65, 80].map((w, i) => (
          <div
            key={i}
            className={`h-2.5 ${c.bar} rounded-full blur-[2px]`}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 ${c.lock} text-xs font-medium`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Locked
        </div>
      </div>
    </div>
  );
}

// --- Mini plan card ---
interface PlanCardProps {
  name: string;
  badge?: string;
  oldPrice?: string;
  price: string;
  per?: string;
  tagline: string;
  cta: string;
  variant: "weekly" | "popular" | "pro";
  onClick: () => void;
}

const PLAN_STYLES = {
  weekly: {
    wrap: "bg-white/5 border-sky-500/25",
    accent: "text-sky-300",
    cta: "bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold",
    badge: "bg-sky-500 text-slate-900",
  },
  popular: {
    wrap: "bg-gradient-to-br from-purple-600/20 to-emerald-600/20 border-purple-500/50 shadow-xl shadow-purple-500/20",
    accent: "text-purple-300",
    cta: "bg-purple-600 hover:bg-purple-500 text-white",
    badge: "bg-gradient-to-r from-purple-500 to-emerald-500 text-white",
  },
  pro: {
    wrap: "bg-white/5 border-amber-500/15",
    accent: "text-amber-300",
    cta: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold",
    badge: "bg-amber-500 text-slate-900",
  },
};

function PlanCard({ name, badge, oldPrice, price, per, tagline, cta, variant, onClick }: PlanCardProps) {
  const s = PLAN_STYLES[variant];
  return (
    <div
      className={`relative rounded-3xl p-6 border transition-all duration-200 hover:-translate-y-1 cursor-pointer ${s.wrap}`}
    >
      {badge && (
        <div className={`absolute -top-3 start-6 text-xs font-bold px-3 py-1 rounded-full ${s.badge}`}>
          {badge}
        </div>
      )}
      <h3 className={`text-base font-semibold mb-2 ${s.accent}`}>{name}</h3>
      <div className="flex items-baseline gap-1.5 mb-1">
        {oldPrice && (
          <span className="text-white/30 line-through text-sm">{oldPrice}</span>
        )}
        <span className="text-3xl font-bold text-white">{price}</span>
        {per && <span className="text-white/50 text-sm">{per}</span>}
      </div>
      <p className="text-white/50 text-xs mb-5 leading-relaxed">{tagline}</p>
      <button
        onClick={onClick}
        className={`w-full py-3 rounded-xl font-semibold transition text-sm ${s.cta}`}
      >
        {cta}
      </button>
    </div>
  );
}
