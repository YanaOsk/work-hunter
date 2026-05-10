"use client";

import { AppMode } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  onChoose: (mode: AppMode) => void;
}

export default function ServicesIntro({ onChoose }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <section className="py-10 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">{tx.servicesTitle}</h2>
          <p className="text-white/60">{tx.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ServiceCard
            badge={tx.serviceAdvisorBadge}
            title={tx.serviceAdvisorTitle}
            intro={tx.serviceAdvisorWhat}
            steps={[
              tx.serviceAdvisor1,
              tx.serviceAdvisor2,
              tx.serviceAdvisor3,
              tx.serviceAdvisor4,
              tx.serviceAdvisor5,
            ]}
            bonus={tx.serviceAdvisorBonus}
            cta={tx.serviceAdvisorCta}
            onClick={() => onChoose("advisor")}
            variant="advisor"
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
          <ServiceCard
            badge={tx.serviceJobsBadge}
            title={tx.serviceJobsTitle}
            intro={tx.serviceJobsWhat}
            steps={[tx.serviceJobs1, tx.serviceJobs2, tx.serviceJobs3, tx.serviceJobs4]}
            result={tx.serviceJobsResult}
            cta={tx.serviceJobsCta}
            onClick={() => onChoose("jobs")}
            variant="jobs"
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  badge: string;
  title: string;
  intro: string;
  steps: string[];
  bonus?: string;
  result?: string;
  cta: string;
  onClick: () => void;
  variant: "advisor" | "jobs";
  icon: string;
}

function ServiceCard({ badge, title, intro, steps, bonus, result, cta, onClick, variant, icon }: ServiceCardProps) {
  return (
    <div className="bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] rounded-[8px] p-6 transition-all duration-150 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-[6px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/15 flex items-center justify-center text-[#818cf8]">
          <svg className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-[4px] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#818cf8]">{badge}</span>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm mb-4">{intro}</p>

      <ul className="space-y-2 mb-4 flex-1">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-white/60">
            <span className="text-white/25 mt-1">•</span>
            <span className="leading-relaxed">{s}</span>
          </li>
        ))}
      </ul>

      {bonus && (
        <p className="bg-white/[0.03] border border-white/[0.07] rounded-[6px] p-3 text-white/50 text-xs leading-relaxed mb-4">
          {bonus}
        </p>
      )}
      {result && (
        <p className="border border-[#5e6ad2]/20 bg-[#5e6ad2]/8 rounded-[6px] p-3 text-xs leading-relaxed mb-4 text-[#818cf8]/80">
          {result}
        </p>
      )}

      <button
        onClick={onClick}
        className="w-full py-2.5 rounded-[6px] font-medium transition-colors duration-150 text-sm bg-[#5e6ad2] hover:bg-[#6d79e8] text-white"
      >
        {cta}
      </button>
    </div>
  );
}
