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
    <section className="py-16 md:py-20 px-4 md:px-6">
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
  const styles =
    variant === "advisor"
      ? {
          badge: "bg-emerald-500/20 text-emerald-300",
          icon: "bg-emerald-600/20 text-emerald-300",
          bullet: "text-emerald-400",
          cta: "bg-emerald-600 hover:bg-emerald-500 text-white",
          resultWrap: "bg-emerald-500/5 border-emerald-500/20 text-emerald-200",
        }
      : {
          badge: "bg-purple-500/20 text-purple-300",
          icon: "bg-purple-600/20 text-purple-300",
          bullet: "text-purple-400",
          cta: "bg-purple-600 hover:bg-purple-500 text-white",
          resultWrap: "bg-purple-500/5 border-purple-500/20 text-purple-200",
        };

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl rounded-3xl p-6 md:p-7 transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${styles.icon} flex items-center justify-center`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles.badge}`}>{badge}</span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-4">{intro}</p>

      <ul className="space-y-2 mb-4 flex-1">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-white/80">
            <span className={`${styles.bullet} mt-1`}>•</span>
            <span className="leading-relaxed">{s}</span>
          </li>
        ))}
      </ul>

      {bonus && (
        <p className="bg-white/5 border border-white/10 rounded-xl p-3 text-white/70 text-xs leading-relaxed mb-4">
          {bonus}
        </p>
      )}
      {result && (
        <p className={`border rounded-xl p-3 text-xs leading-relaxed mb-4 ${styles.resultWrap}`}>
          {result}
        </p>
      )}

      <button
        onClick={onClick}
        className={`w-full py-3 rounded-xl font-semibold transition ${styles.cta}`}
      >
        {cta}
      </button>
    </div>
  );
}
