"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import { CvData } from "@/lib/cvBuilder";

interface Props {
  data: CvData;
}

// Convert hex color to rgba string
function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CvPreview({ data }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const dir: "rtl" | "ltr" = lang === "he" ? "rtl" : "ltr";
  const ac = data.accentColor || "#7c3aed";

  const skillsList = data.skills.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const languagesList = data.languages.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  const isEmpty =
    !data.summary &&
    data.experiences.length === 0 &&
    data.educations.length === 0 &&
    skillsList.length === 0 &&
    languagesList.length === 0;

  const props = { data, tx, dir, skillsList, languagesList, isEmpty, ac };

  switch (data.template) {
    case "minimal":    return <MinimalTemplate {...props} />;
    case "accent":     return <AccentTemplate {...props} />;
    case "executive":  return <ExecutiveTemplate {...props} />;
    case "tech":       return <TechTemplate {...props} />;
    case "bold":       return <BoldTemplate {...props} />;
    case "elegant":    return <ElegantTemplate {...props} />;
    case "gradient":   return <GradientTemplate {...props} />;
    default:           return <SlateTemplate {...props} />;
  }
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface TemplateProps {
  data: CvData;
  tx: Record<string, string>;
  dir: "ltr" | "rtl";
  skillsList: string[];
  languagesList: string[];
  isEmpty: boolean;
  ac: string; // accent color hex
}

// ─── Contact row helper ────────────────────────────────────────────────────────

function ContactRow({ icon, children, light }: { icon: string; children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 ${light ? "text-white/80" : "text-slate-600"}`}>
      <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <span className="text-[13px]">{children}</span>
    </span>
  );
}

const ICON_EMAIL    = "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const ICON_PHONE    = "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
const ICON_LOCATION = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z";
const ICON_LINK     = "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1";

// ─── Template 1: Slate (Modern dark header) ───────────────────────────────────

function SlateTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden" dir={dir}>
      <div className="px-8 py-10 text-white print:py-8" style={{ backgroundColor: ac }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">
          {data.personal.fullName || <span className="text-white/40">{tx.cvPreviewEmptyName}</span>}
        </h1>
        <p className="text-lg text-white/80 mb-5">
          {data.personal.title || <span className="text-white/40">{tx.cvPreviewEmptyTitle}</span>}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {data.personal.email    && <ContactRow icon={ICON_EMAIL}    light>{data.personal.email}</ContactRow>}
          {data.personal.phone    && <ContactRow icon={ICON_PHONE}    light>{data.personal.phone}</ContactRow>}
          {data.personal.location && <ContactRow icon={ICON_LOCATION} light>{data.personal.location}</ContactRow>}
          {data.personal.linkedin && <ContactRow icon={ICON_LINK}     light><span dir="ltr">{data.personal.linkedin}</span></ContactRow>}
          {data.personal.website  && <ContactRow icon={ICON_LINK}     light><span dir="ltr">{data.personal.website}</span></ContactRow>}
        </div>
      </div>

      <div className="px-8 py-8 text-slate-800">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <SlateSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">{data.summary}</p>
          </SlateSection>
        )}
        {data.experiences.length > 0 && (
          <SlateSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 text-[15px]">
                      {exp.role || "—"}
                      {exp.company && <span className="text-slate-500 font-normal"> · {exp.company}</span>}
                    </h3>
                    <span className="text-slate-400 text-xs font-mono" dir="ltr">
                      {exp.start || "—"} – {exp.current ? tx.cvFieldPresent : exp.end || "—"}
                    </span>
                  </div>
                  {exp.location && <div className="text-slate-400 text-xs mb-1.5">{exp.location}</div>}
                  {exp.description && <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </SlateSection>
        )}
        {data.educations.length > 0 && (
          <SlateSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 text-[15px]">
                      {edu.degree || "—"}
                      {edu.school && <span className="text-slate-500 font-normal"> · {edu.school}</span>}
                    </h3>
                    <span className="text-slate-400 text-xs font-mono" dir="ltr">
                      {edu.start || "—"} – {edu.current ? tx.cvFieldPresent : edu.end || "—"}
                    </span>
                  </div>
                  {edu.location && <div className="text-slate-400 text-xs">{edu.location}</div>}
                </div>
              ))}
            </div>
          </SlateSection>
        )}
        {skillsList.length > 0 && (
          <SlateSection title={tx.cvSecSkills} ac={ac}>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-md" style={{ backgroundColor: rgba(ac, 0.08), color: ac, border: `1px solid ${rgba(ac, 0.2)}` }}>{s}</span>
              ))}
            </div>
          </SlateSection>
        )}
        {languagesList.length > 0 && (
          <SlateSection title={tx.cvSecLanguages} ac={ac}>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-slate-600 text-sm">
              {languagesList.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </SlateSection>
        )}
      </div>
    </div>
  );
}

function SlateSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-3 pb-2 border-b" style={{ color: ac, borderColor: rgba(ac, 0.2) }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 2: Minimal (elegant thin accent line) ──────────────────────────

function MinimalTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden" dir={dir}>
      <div className="px-10 pt-10 pb-6 border-b-4" style={{ borderColor: ac }}>
        <h1 className="text-4xl font-light text-slate-900 tracking-tight mb-1">
          {data.personal.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
        </h1>
        <p className="font-medium text-base mb-4 tracking-wide uppercase text-sm" style={{ color: ac }}>
          {data.personal.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          {data.personal.email    && <ContactRow icon={ICON_EMAIL}>{data.personal.email}</ContactRow>}
          {data.personal.phone    && <ContactRow icon={ICON_PHONE}>{data.personal.phone}</ContactRow>}
          {data.personal.location && <ContactRow icon={ICON_LOCATION}>{data.personal.location}</ContactRow>}
          {data.personal.linkedin && <ContactRow icon={ICON_LINK}><span dir="ltr">{data.personal.linkedin}</span></ContactRow>}
          {data.personal.website  && <ContactRow icon={ICON_LINK}><span dir="ltr">{data.personal.website}</span></ContactRow>}
        </div>
      </div>

      <div className="px-10 py-8 text-slate-800">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <MinimalSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap italic">{data.summary}</p>
          </MinimalSection>
        )}
        {data.experiences.length > 0 && (
          <MinimalSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="pt-1 text-xs font-mono whitespace-nowrap" dir="ltr" style={{ color: rgba(ac, 0.7) }}>
                    {exp.start || "—"}<br />{exp.current ? tx.cvFieldPresent : exp.end || "—"}
                  </div>
                  <div className="flex-1 border-s-2 ps-4" style={{ borderColor: rgba(ac, 0.2) }}>
                    <h3 className="font-semibold text-slate-900 text-[15px]">{exp.role || "—"}</h3>
                    {exp.company && <div className="text-slate-500 text-sm mb-1">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                    {exp.description && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </MinimalSection>
        )}
        {data.educations.length > 0 && (
          <MinimalSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                  <div className="pt-1 text-xs font-mono whitespace-nowrap" dir="ltr" style={{ color: rgba(ac, 0.7) }}>
                    {edu.start || "—"}<br />{edu.current ? tx.cvFieldPresent : edu.end || "—"}
                  </div>
                  <div className="flex-1 border-s-2 ps-4" style={{ borderColor: rgba(ac, 0.2) }}>
                    <h3 className="font-semibold text-slate-900 text-[15px]">{edu.degree || "—"}</h3>
                    {edu.school && <div className="text-slate-500 text-sm">{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>}
                  </div>
                </div>
              ))}
            </div>
          </MinimalSection>
        )}
        {skillsList.length > 0 && (
          <MinimalSection title={tx.cvSecSkills} ac={ac}>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ color: ac, borderColor: rgba(ac, 0.3), border: `1px solid ${rgba(ac, 0.3)}`, backgroundColor: rgba(ac, 0.07) }}>{s}</span>
              ))}
            </div>
          </MinimalSection>
        )}
        {languagesList.length > 0 && (
          <MinimalSection title={tx.cvSecLanguages} ac={ac}>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-slate-600 text-sm">
              {languagesList.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </MinimalSection>
        )}
      </div>
    </div>
  );
}

function MinimalSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: ac }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 3: Accent (colored sidebar) ────────────────────────────────────

function AccentTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden" dir={dir}>
      <div className="flex min-h-full">
        <div className="w-[38%] text-white px-6 py-8 flex-shrink-0" style={{ background: `linear-gradient(160deg, ${ac}, ${rgba(ac, 0.7)})` }}>
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 text-2xl font-bold">
              {data.personal.fullName ? data.personal.fullName.charAt(0).toUpperCase() : "?"}
            </div>
            <h1 className="text-xl font-bold leading-tight mb-1">
              {data.personal.fullName || <span className="text-white/40">{tx.cvPreviewEmptyName}</span>}
            </h1>
            <p className="text-white/75 text-xs font-medium uppercase tracking-wide">
              {data.personal.title || <span className="text-white/30">{tx.cvPreviewEmptyTitle}</span>}
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {data.personal.email    && <ContactRow icon={ICON_EMAIL}    light>{data.personal.email}</ContactRow>}
            {data.personal.phone    && <ContactRow icon={ICON_PHONE}    light>{data.personal.phone}</ContactRow>}
            {data.personal.location && <ContactRow icon={ICON_LOCATION} light>{data.personal.location}</ContactRow>}
            {data.personal.linkedin && <ContactRow icon={ICON_LINK}     light><span dir="ltr" className="break-all">{data.personal.linkedin}</span></ContactRow>}
          </div>

          {skillsList.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">{tx.cvSecSkills}</h2>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="bg-white/15 text-white text-[11px] px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {languagesList.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">{tx.cvSecLanguages}</h2>
              <div className="space-y-1">
                {languagesList.map((l, i) => (
                  <div key={i} className="text-white/80 text-xs">{l}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-7 py-8">
          {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
          {data.summary && (
            <AccentSection title={tx.cvSecSummary} ac={ac}>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            </AccentSection>
          )}
          {data.experiences.length > 0 && (
            <AccentSection title={tx.cvSecExperience} ac={ac}>
              <div className="space-y-5">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                      <h3 className="font-semibold text-slate-900 text-sm">{exp.role || "—"}</h3>
                      <span className="text-slate-400 text-[11px] font-mono" dir="ltr">
                        {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                      </span>
                    </div>
                    {exp.company && <div className="text-xs font-medium mb-1" style={{ color: ac }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                    {exp.description && <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </AccentSection>
          )}
          {data.educations.length > 0 && (
            <AccentSection title={tx.cvSecEducation} ac={ac}>
              <div className="space-y-3">
                {data.educations.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{edu.degree || "—"}</h3>
                      <span className="text-slate-400 text-[11px] font-mono" dir="ltr">
                        {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                      </span>
                    </div>
                    {edu.school && <div className="text-xs font-medium" style={{ color: ac }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>}
                  </div>
                ))}
              </div>
            </AccentSection>
          )}
        </div>
      </div>
    </div>
  );
}

function AccentSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1.5 border-b" style={{ color: ac, borderColor: rgba(ac, 0.25) }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 4: Executive (classic professional) ─────────────────────────────

function ExecutiveTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden" dir={dir}>
      <div className="px-10 pt-10 pb-6 text-center border-b-2" style={{ borderColor: ac }}>
        <h1 className="text-4xl font-bold text-slate-900 tracking-wide uppercase mb-2">
          {data.personal.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
        </h1>
        <p className="text-sm tracking-widest uppercase mb-4" style={{ color: ac }}>
          {data.personal.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5">
          {data.personal.email    && <ContactRow icon={ICON_EMAIL}>{data.personal.email}</ContactRow>}
          {data.personal.phone    && <ContactRow icon={ICON_PHONE}>{data.personal.phone}</ContactRow>}
          {data.personal.location && <ContactRow icon={ICON_LOCATION}>{data.personal.location}</ContactRow>}
          {data.personal.linkedin && <ContactRow icon={ICON_LINK}><span dir="ltr">{data.personal.linkedin}</span></ContactRow>}
          {data.personal.website  && <ContactRow icon={ICON_LINK}><span dir="ltr">{data.personal.website}</span></ContactRow>}
        </div>
      </div>

      <div className="px-10 py-8 text-slate-800">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <ExecSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </ExecSection>
        )}
        {data.experiences.length > 0 && (
          <ExecSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                    <h3 className="font-bold text-slate-900 text-[15px] uppercase tracking-wide">{exp.role || "—"}</h3>
                    <span className="text-slate-500 text-xs font-mono" dir="ltr">
                      {exp.start || "—"} – {exp.current ? tx.cvFieldPresent : exp.end || "—"}
                    </span>
                  </div>
                  {exp.company && <div className="text-slate-600 text-sm font-medium mb-1.5 italic">{exp.company}{exp.location ? `, ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </ExecSection>
        )}
        {data.educations.length > 0 && (
          <ExecSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-[15px]">{edu.degree || "—"}</h3>
                    <span className="text-slate-500 text-xs font-mono" dir="ltr">
                      {edu.start || "—"} – {edu.current ? tx.cvFieldPresent : edu.end || "—"}
                    </span>
                  </div>
                  {edu.school && <div className="text-slate-600 text-sm italic">{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </ExecSection>
        )}
        {skillsList.length > 0 && (
          <ExecSection title={tx.cvSecSkills} ac={ac}>
            <p className="text-slate-700 text-sm leading-relaxed">{skillsList.join("  ·  ")}</p>
          </ExecSection>
        )}
        {languagesList.length > 0 && (
          <ExecSection title={tx.cvSecLanguages} ac={ac}>
            <p className="text-slate-700 text-sm">{languagesList.join("  ·  ")}</p>
          </ExecSection>
        )}
      </div>
    </div>
  );
}

function ExecSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b-2" style={{ color: ac, borderColor: ac }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 5: Tech (dark monospace developer) ──────────────────────────────

function TechTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-gray-950 text-gray-100 rounded-xl shadow-xl overflow-hidden font-mono" dir={dir} style={{ minHeight: 900 }}>
      <div className="px-8 py-8" style={{ backgroundColor: ac }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{p.fullName || <span className="opacity-50">{tx.cvPreviewEmptyName}</span>}</h1>
            {p.title && <p className="text-white/80 text-sm mt-1 font-normal">{p.title}</p>}
          </div>
          <div className="text-xs text-white/70 space-y-0.5 text-end">
            {p.email    && <div>$ {p.email}</div>}
            {p.phone    && <div>$ {p.phone}</div>}
            {p.location && <div>📍 {p.location}</div>}
            {p.linkedin && <div>in {p.linkedin}</div>}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-7">
        {isEmpty && <p className="text-gray-600 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ac }}>// {tx.cvSecSummary}</h2>
            <p className="text-gray-300 text-sm leading-relaxed border-s-2 ps-3" style={{ borderColor: rgba(ac, 0.5) }}>{data.summary}</p>
          </section>
        )}
        {data.experiences.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ac }}>// {tx.cvSecExperience}</h2>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-s-2 border-gray-700 ps-4">
                  <div className="flex justify-between flex-wrap gap-1 mb-1">
                    <span className="text-white font-semibold text-sm">{exp.role}</span>
                    <span className="text-gray-500 text-xs font-mono">{exp.start}{exp.start && (exp.end || exp.current) ? " → " : ""}{exp.current ? "present" : exp.end}</span>
                  </div>
                  {exp.company && <div className="text-xs mb-2" style={{ color: rgba(ac, 0.9) }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="grid grid-cols-2 gap-6">
          {skillsList.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ac }}>// {tx.cvSecSkills}</h2>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: rgba(ac, 0.15), border: `1px solid ${rgba(ac, 0.3)}`, color: rgba(ac, 0.95) }}>{s}</span>
                ))}
              </div>
            </section>
          )}
          {languagesList.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ac }}>// {tx.cvSecLanguages}</h2>
              <div className="space-y-0.5">
                {languagesList.map((l, i) => <div key={i} className="text-gray-400 text-xs">› {l}</div>)}
              </div>
            </section>
          )}
        </div>
        {data.educations.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ac }}>// {tx.cvSecEducation}</h2>
            <div className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="border-s-2 border-gray-700 ps-4">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-white text-sm font-semibold">{edu.degree}</span>
                    <span className="text-gray-500 text-xs">{edu.start}{edu.start && edu.end ? "–" : ""}{edu.end}</span>
                  </div>
                  {edu.school && <div className="text-gray-400 text-xs">{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Template 6: Bold (large name, strong accent stripe) ─────────────────────

function BoldTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      <div className="relative">
        <div className="absolute start-0 top-0 bottom-0 w-2" style={{ backgroundColor: ac }} />
        <div className="ps-10 pe-8 pt-10 pb-8 bg-slate-50 border-b border-slate-200">
          {p.fullName && <h1 className="text-4xl font-black text-slate-900 leading-none mb-2 tracking-tight uppercase">{p.fullName}</h1>}
          {p.title   && <p className="font-bold text-lg tracking-wide" style={{ color: ac }}>{p.title}</p>}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-slate-500 text-xs">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>
      </div>

      <div className="ps-10 pe-8 py-8 space-y-7">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-1 rounded-full" style={{ backgroundColor: ac }} />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{tx.cvSecSummary}</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{data.summary}</p>
          </section>
        )}
        {data.experiences.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-1 rounded-full" style={{ backgroundColor: ac }} />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{tx.cvSecExperience}</h2>
            </div>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{exp.role}</h3>
                    <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {exp.start}{exp.start && (exp.end || exp.current) ? "–" : ""}{exp.current ? "Now" : exp.end}
                    </span>
                  </div>
                  {exp.company && <div className="font-semibold text-xs mt-0.5" style={{ color: ac }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-xs mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="grid grid-cols-2 gap-6">
          {skillsList.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-1 rounded-full" style={{ backgroundColor: ac }} />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{tx.cvSecSkills}</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.08), border: `1px solid ${rgba(ac, 0.25)}`, color: ac }}>{s}</span>
                ))}
              </div>
            </section>
          )}
          {languagesList.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-1 rounded-full" style={{ backgroundColor: ac }} />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{tx.cvSecLanguages}</h2>
              </div>
              <div className="space-y-1">
                {languagesList.map((l, i) => <div key={i} className="text-slate-600 text-xs font-medium">• {l}</div>)}
              </div>
            </section>
          )}
        </div>
        {data.educations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-1 rounded-full" style={{ backgroundColor: ac }} />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">{tx.cvSecEducation}</h2>
            </div>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                    <span className="text-xs text-slate-400">{edu.start}{edu.start && edu.end ? "–" : ""}{edu.end}</span>
                  </div>
                  {edu.school && <div className="text-slate-500 text-xs mt-0.5">{edu.school}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Template 7: Elegant (serif-inspired, clean two-column) ───────────────────

function ElegantTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: ac }} />

      <div className="flex min-h-full">
        {/* Left column */}
        <div className="w-[34%] border-e border-slate-100 px-6 py-8 flex-shrink-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
              {p.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: ac }}>
              {p.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
            </p>
            <div className="space-y-2">
              {p.email    && <ContactRow icon={ICON_EMAIL}>{p.email}</ContactRow>}
              {p.phone    && <ContactRow icon={ICON_PHONE}>{p.phone}</ContactRow>}
              {p.location && <ContactRow icon={ICON_LOCATION}>{p.location}</ContactRow>}
              {p.linkedin && <ContactRow icon={ICON_LINK}><span dir="ltr" className="break-all text-[11px]">{p.linkedin}</span></ContactRow>}
              {p.website  && <ContactRow icon={ICON_LINK}><span dir="ltr" className="break-all text-[11px]">{p.website}</span></ContactRow>}
            </div>
          </div>

          {skillsList.length > 0 && (
            <div className="mb-7">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b" style={{ color: ac, borderColor: rgba(ac, 0.25) }}>{tx.cvSecSkills}</h2>
              <div className="space-y-1.5">
                {skillsList.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
                    <span className="text-slate-700 text-xs">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languagesList.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-1 border-b" style={{ color: ac, borderColor: rgba(ac, 0.25) }}>{tx.cvSecLanguages}</h2>
              <div className="space-y-1.5">
                {languagesList.map((l, i) => (
                  <div key={i} className="text-slate-700 text-xs">{l}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 px-8 py-8">
          {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
          {data.summary && (
            <ElegantSection title={tx.cvSecSummary} ac={ac}>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            </ElegantSection>
          )}
          {data.experiences.length > 0 && (
            <ElegantSection title={tx.cvSecExperience} ac={ac}>
              <div className="space-y-6">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="relative ps-4 border-s" style={{ borderColor: rgba(ac, 0.2) }}>
                    <div className="absolute -start-[5px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac }} />
                    <div className="flex justify-between flex-wrap gap-1 mb-0.5">
                      <h3 className="font-bold text-slate-900 text-[14px]">{exp.role || "—"}</h3>
                      <span className="text-slate-400 text-xs font-mono" dir="ltr">
                        {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                      </span>
                    </div>
                    {exp.company && <div className="text-xs font-medium mb-1.5" style={{ color: ac }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                    {exp.description && <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </ElegantSection>
          )}
          {data.educations.length > 0 && (
            <ElegantSection title={tx.cvSecEducation} ac={ac}>
              <div className="space-y-4">
                {data.educations.map((edu) => (
                  <div key={edu.id} className="relative ps-4 border-s" style={{ borderColor: rgba(ac, 0.2) }}>
                    <div className="absolute -start-[5px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac }} />
                    <div className="flex justify-between flex-wrap gap-1">
                      <h3 className="font-bold text-slate-900 text-[14px]">{edu.degree || "—"}</h3>
                      <span className="text-slate-400 text-xs font-mono" dir="ltr">
                        {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                      </span>
                    </div>
                    {edu.school && <div className="text-xs font-medium" style={{ color: ac }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>}
                  </div>
                ))}
              </div>
            </ElegantSection>
          )}
        </div>
      </div>
    </div>
  );
}

function ElegantSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: ac }}>
        <span className="inline-block w-4 h-px" style={{ backgroundColor: ac }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Template 8: Gradient (full gradient header, bold modern) ─────────────────

function GradientTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Gradient header */}
      <div className="px-8 py-10 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${ac} 0%, ${rgba(ac, 0.6)} 100%)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
            {p.fullName || <span className="text-white/40">{tx.cvPreviewEmptyName}</span>}
          </h1>
          <p className="text-white/85 text-base font-light mb-5">
            {p.title || <span className="text-white/40">{tx.cvPreviewEmptyTitle}</span>}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {p.email    && <ContactRow icon={ICON_EMAIL}    light>{p.email}</ContactRow>}
            {p.phone    && <ContactRow icon={ICON_PHONE}    light>{p.phone}</ContactRow>}
            {p.location && <ContactRow icon={ICON_LOCATION} light>{p.location}</ContactRow>}
            {p.linkedin && <ContactRow icon={ICON_LINK}     light><span dir="ltr">{p.linkedin}</span></ContactRow>}
            {p.website  && <ContactRow icon={ICON_LINK}     light><span dir="ltr">{p.website}</span></ContactRow>}
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}
        {data.summary && (
          <GradSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </GradSection>
        )}
        {data.experiences.length > 0 && (
          <GradSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="rounded-xl p-4" style={{ backgroundColor: rgba(ac, 0.04), border: `1px solid ${rgba(ac, 0.1)}` }}>
                  <div className="flex justify-between flex-wrap gap-1 mb-0.5">
                    <h3 className="font-bold text-slate-900 text-[15px]">{exp.role || "—"}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.1), color: ac }}>
                      {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                    </span>
                  </div>
                  {exp.company && <div className="font-semibold text-xs mb-2" style={{ color: ac }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </GradSection>
        )}
        {data.educations.length > 0 && (
          <GradSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id} className="rounded-xl p-4" style={{ backgroundColor: rgba(ac, 0.04), border: `1px solid ${rgba(ac, 0.1)}` }}>
                  <div className="flex justify-between flex-wrap gap-1">
                    <h3 className="font-bold text-slate-900 text-[15px]">{edu.degree || "—"}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.1), color: ac }}>
                      {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                    </span>
                  </div>
                  {edu.school && <div className="font-semibold text-xs" style={{ color: ac }}>{edu.school}{edu.location ? ` · ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </GradSection>
        )}
        {(skillsList.length > 0 || languagesList.length > 0) && (
          <div className="grid grid-cols-2 gap-6">
            {skillsList.length > 0 && (
              <GradSection title={tx.cvSecSkills} ac={ac}>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((s, i) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: rgba(ac, 0.1), color: ac }}>{s}</span>
                  ))}
                </div>
              </GradSection>
            )}
            {languagesList.length > 0 && (
              <GradSection title={tx.cvSecLanguages} ac={ac}>
                <div className="space-y-1.5">
                  {languagesList.map((l, i) => <div key={i} className="text-slate-600 text-sm">{l}</div>)}
                </div>
              </GradSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GradSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rgba(ac, 0.12) }}>
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: ac }} />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ac }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
