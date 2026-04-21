"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import { CvData } from "@/lib/cvBuilder";

interface Props {
  data: CvData;
}

export default function CvPreview({ data }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const skillsList = data.skills
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const languagesList = data.languages
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden" dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-10 text-white print:py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
          {data.personal.fullName || <span className="text-white/40">{tx.cvPreviewEmptyName}</span>}
        </h1>
        <p className="text-lg text-white/80 mb-4">
          {data.personal.title || <span className="text-white/40">{tx.cvPreviewEmptyTitle}</span>}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/85">
          {data.personal.email && (
            <ContactItem icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
              {data.personal.email}
            </ContactItem>
          )}
          {data.personal.phone && (
            <ContactItem icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
              {data.personal.phone}
            </ContactItem>
          )}
          {data.personal.location && (
            <ContactItem icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z">
              {data.personal.location}
            </ContactItem>
          )}
          {data.personal.linkedin && (
            <ContactItem icon="M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a3 3 0 013-3h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z">
              <span dir="ltr">{data.personal.linkedin}</span>
            </ContactItem>
          )}
          {data.personal.website && (
            <ContactItem icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9">
              <span dir="ltr">{data.personal.website}</span>
            </ContactItem>
          )}
        </div>
      </div>

      <div className="px-8 py-8 text-slate-800">
        {data.summary && (
          <SectionBlock title={tx.cvSecSummary}>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </SectionBlock>
        )}

        {data.experiences.length > 0 && (
          <SectionBlock title={tx.cvSecExperience}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-base">
                      {exp.role || "—"}
                      {exp.company && <span className="text-slate-500 font-normal"> · {exp.company}</span>}
                    </h3>
                    <span className="text-slate-500 text-sm font-mono whitespace-nowrap" dir="ltr">
                      {exp.start || "—"} – {exp.current ? tx.cvFieldPresent : exp.end || "—"}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-slate-500 text-sm mb-2">{exp.location}</div>
                  )}
                  {exp.description && (
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {data.educations.length > 0 && (
          <SectionBlock title={tx.cvSecEducation}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-base">
                      {edu.degree || "—"}
                      {edu.school && <span className="text-slate-500 font-normal"> · {edu.school}</span>}
                    </h3>
                    <span className="text-slate-500 text-sm font-mono whitespace-nowrap" dir="ltr">
                      {edu.start || "—"} – {edu.current ? tx.cvFieldPresent : edu.end || "—"}
                    </span>
                  </div>
                  {edu.location && (
                    <div className="text-slate-500 text-sm">{edu.location}</div>
                  )}
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {skillsList.length > 0 && (
          <SectionBlock title={tx.cvSecSkills}>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s, i) => (
                <span
                  key={i}
                  className="bg-slate-100 border border-slate-200 text-slate-700 text-sm px-3 py-1 rounded-md"
                >
                  {s}
                </span>
              ))}
            </div>
          </SectionBlock>
        )}

        {languagesList.length > 0 && (
          <SectionBlock title={tx.cvSecLanguages}>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-700 text-sm">
              {languagesList.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </SectionBlock>
        )}

        {!data.summary &&
          data.experiences.length === 0 &&
          data.educations.length === 0 &&
          skillsList.length === 0 &&
          languagesList.length === 0 && (
            <p className="text-slate-400 text-center py-10">
              {tx.cvPreviewTitle} — {tx.cvPlaceholder}
            </p>
          )}
      </div>
    </div>
  );
}

function ContactItem({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg className="w-4 h-4 flex-shrink-0 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {children}
    </span>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b-2 border-slate-200">
        {title}
      </h2>
      {children}
    </section>
  );
}
