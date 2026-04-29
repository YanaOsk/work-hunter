"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import { CvData } from "@/lib/cvBuilder";
import { renderMixedText, ltrSpan } from "@/lib/rtl";

interface Props {
  data: CvData;
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function detectCvDir(data: CvData): "rtl" | "ltr" {
  // Use content-rich fields only (exclude fullName — stays in original language after translation)
  const sample = [
    data.personal.title ?? "",
    data.summary ?? "",
    data.experiences[0]?.role ?? "",
    data.experiences[0]?.description ?? "",
    data.experiences[1]?.description ?? "",
  ].join(" ");
  const hebrew = (sample.match(/[א-ת]/g) ?? []).length;
  const latin  = (sample.match(/[a-zA-Z]/g) ?? []).length;
  const total  = hebrew + latin;
  if (total === 0) return "rtl"; // blank CV — default RTL (Israeli app)
  return hebrew / total > 0.25 ? "rtl" : "ltr";
}

export default function CvPreview({ data }: Props) {
  const { lang } = useLanguage();
  const dir = detectCvDir(data);
  const cvLang = dir === "rtl" ? "he" : "en";
  const tx = t[cvLang];
  const ac = data.accentColor || "#7c3aed";

  const skillsList = data.skills.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const languagesList = data.languages.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const hasMilitary = !!(data.military.unit || data.military.role);

  const isEmpty =
    !data.summary &&
    data.experiences.length === 0 &&
    data.educations.length === 0 &&
    skillsList.length === 0 &&
    languagesList.length === 0 &&
    !hasMilitary;

  const props: TemplateProps = { data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac };

  switch (data.template) {
    case "minimal":   return <NordicTemplate {...props} />;
    case "accent":    return <SidebarTemplate {...props} />;
    case "executive": return <ClassicTemplate {...props} />;
    case "tech":      return <CodeTemplate {...props} />;
    case "bold":      return <ImpactTemplate {...props} />;
    case "elegant":   return <TimelineTemplate {...props} />;
    case "gradient":  return <PrismTemplate {...props} />;
    default:          return <NovaTemplate {...props} />;
  }
}

interface TemplateProps {
  data: CvData;
  tx: Record<string, string>;
  dir: "ltr" | "rtl";
  skillsList: string[];
  languagesList: string[];
  isEmpty: boolean;
  hasMilitary: boolean;
  ac: string;
}

// ─── Icon paths ────────────────────────────────────────────────────────────────
const ICON_EMAIL    = "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
const ICON_PHONE    = "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z";
const ICON_LOCATION = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z";
const ICON_LINK     = "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1";

// Returns "ltr" when the string contains Latin letters — keeps multi-word Latin
// names, emails, URLs, and phone numbers in the correct left-to-right order
// inside an RTL container. Pure Hebrew/Arabic strings return undefined (inherit).
function latinDir(text: string): "ltr" | undefined {
  return /[a-zA-Z0-9@._+\-:/]/.test(text) ? "ltr" : undefined;
}

function CIcon({ d, cls = "w-3 h-3" }: { d: string; cls?: string }) {
  return (
    <svg className={`${cls} flex-shrink-0 opacity-75`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );
}

// ─── Template 1: Nova (modern photo header) ────────────────────────────────────

function NovaTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Header */}
      <div className="relative px-8 py-9 text-white" style={{ backgroundColor: ac }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-[32px] font-extrabold leading-tight tracking-tight mb-1 text-white">
              {p.fullName || <span className="opacity-40">{tx.cvPreviewEmptyName}</span>}
            </h1>
            <p className="text-white/80 font-medium text-[15px] mb-5">
              {p.title || <span className="opacity-40">{tx.cvPreviewEmptyTitle}</span>}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {p.email    && <span className="flex items-center gap-1.5 text-white/85 text-[12px]"><CIcon d={ICON_EMAIL} cls="w-3 h-3" />{ltrSpan(p.email)}</span>}
              {p.phone    && <span className="flex items-center gap-1.5 text-white/85 text-[12px]"><CIcon d={ICON_PHONE} cls="w-3 h-3" />{ltrSpan(p.phone)}</span>}
              {p.location && <span className="flex items-center gap-1.5 text-white/85 text-[12px]"><CIcon d={ICON_LOCATION} cls="w-3 h-3" />{p.location}</span>}
              {p.linkedin && <span className="flex items-center gap-1.5 text-white/85 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3 h-3" />{p.linkedin}</span>}
              {p.website  && <span className="flex items-center gap-1.5 text-white/85 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3 h-3" />{p.website}</span>}
            </div>
          </div>
          {p.photo && (
            <img src={p.photo} className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-white/30 flex-shrink-0 shadow-lg" alt="" />
          )}
        </div>
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: `linear-gradient(to bottom, transparent, ${rgba(ac, 0.3)})` }} />
      </div>

      {/* Body */}
      <div className="px-8 py-7">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

        {data.summary && (
          <NovaSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-600 leading-relaxed text-[13.5px] whitespace-pre-wrap">{data.summary}</p>
          </NovaSection>
        )}

        {data.experiences.length > 0 && (
          <NovaSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
                    <div>
                      <h3 className="font-bold text-slate-900 text-[14.5px]">{exp.role || "—"}</h3>
                      {exp.company && (
                        <span className="text-[12.5px] font-semibold" style={{ color: ac }}>
                          {renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[11.5px] font-medium mt-0.5 whitespace-nowrap" dir="ltr">
                      {exp.start || "—"} – {exp.current ? tx.cvFieldPresent : exp.end || "—"}
                    </span>
                  </div>
                  {exp.description && <p className="text-slate-600 text-[13px] leading-relaxed mt-1.5 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </NovaSection>
        )}

        {data.educations.length > 0 && (
          <NovaSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-[14px]">{edu.degree || "—"}</h3>
                    {edu.school && <span className="text-[12.5px] font-semibold" style={{ color: ac }}>{renderMixedText(edu.school)}{edu.location ? ` · ${edu.location}` : ""}</span>}
                  </div>
                  <span className="text-slate-400 text-[11.5px] font-medium mt-0.5" dir="ltr">
                    {edu.start || "—"} – {edu.current ? tx.cvFieldPresent : edu.end || "—"}
                  </span>
                </div>
              ))}
            </div>
          </NovaSection>
        )}

        {hasMilitary && (
          <NovaSection title={tx.cvSecMilitary} ac={ac}>
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
              <div>
                {data.military.role && <h3 className="font-bold text-slate-900 text-[14px]">{data.military.role}</h3>}
                {data.military.unit && <span className="text-[12.5px] font-semibold" style={{ color: ac }}>{data.military.unit}</span>}
              </div>
              {(data.military.start || data.military.end) && (
                <span className="text-slate-400 text-[11.5px] font-medium mt-0.5" dir="ltr">
                  {data.military.start || "—"} – {data.military.end || "—"}
                </span>
              )}
            </div>
            {data.military.reserveDuty && (
              <div className="flex items-center gap-1.5 mt-1.5 text-[12.5px] text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                {tx.cvFieldMilReserve}
              </div>
            )}
          </NovaSection>
        )}

        {skillsList.length > 0 && (
          <NovaSection title={tx.cvSecSkills} ac={ac}>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((s, i) => (
                <span key={i} className="text-[11.5px] font-medium px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: rgba(ac, 0.08), color: ac, border: `1px solid ${rgba(ac, 0.18)}` }}>
                  {s}
                </span>
              ))}
            </div>
          </NovaSection>
        )}

        {languagesList.length > 0 && (
          <NovaSection title={tx.cvSecLanguages} ac={ac}>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-slate-600 text-[13px]">
              {languagesList.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </NovaSection>
        )}
      </div>
    </div>
  );
}

function NovaSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="h-[2px] w-4 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
        <h2 className="text-[10.5px] font-black uppercase tracking-[0.12em]" style={{ color: ac }}>{title}</h2>
        <span className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${rgba(ac, 0.2)}, transparent)` }} />
      </div>
      {children}
    </section>
  );
}

// ─── Template 2: Nordic (clean two-column with photo) ─────────────────────────

function NordicTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Top header row */}
      <div className="px-8 pt-8 pb-5 border-b-[3px]" style={{ borderColor: ac }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-[38px] font-light text-slate-900 tracking-tight leading-none mb-2">
              {p.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
            </h1>
            <p className="text-[13px] font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: ac }}>
              {p.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {p.email    && <span className="flex items-center gap-1.5 text-slate-500 text-[12px]"><CIcon d={ICON_EMAIL} />{ltrSpan(p.email)}</span>}
              {p.phone    && <span className="flex items-center gap-1.5 text-slate-500 text-[12px]"><CIcon d={ICON_PHONE} />{ltrSpan(p.phone)}</span>}
              {p.location && <span className="flex items-center gap-1.5 text-slate-500 text-[12px]"><CIcon d={ICON_LOCATION} />{p.location}</span>}
              {p.linkedin && <span className="flex items-center gap-1.5 text-slate-500 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} />{p.linkedin}</span>}
              {p.website  && <span className="flex items-center gap-1.5 text-slate-500 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} />{p.website}</span>}
            </div>
          </div>
          {p.photo && (
            <img src={p.photo} className="w-[90px] h-[90px] rounded-full object-cover flex-shrink-0 shadow-md" style={{ border: `3px solid ${rgba(ac, 0.3)}` }} alt="" />
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-[34%] border-e border-slate-100 px-5 py-6 flex-shrink-0 bg-slate-50/50">
          {isEmpty && <p className="text-slate-400 text-center py-10 text-sm">{tx.cvPlaceholder}</p>}

          {skillsList.length > 0 && (
            <NordicSideSection title={tx.cvSecSkills} ac={ac}>
              <div className="space-y-1.5">
                {skillsList.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
                    <span className="text-slate-700 text-[12.5px]">{s}</span>
                  </div>
                ))}
              </div>
            </NordicSideSection>
          )}

          {languagesList.length > 0 && (
            <NordicSideSection title={tx.cvSecLanguages} ac={ac}>
              <div className="space-y-1.5">
                {languagesList.map((l, i) => (
                  <div key={i} className="text-slate-700 text-[12.5px]">{l}</div>
                ))}
              </div>
            </NordicSideSection>
          )}

          {hasMilitary && (
            <NordicSideSection title={tx.cvSecMilitary} ac={ac}>
              {data.military.role && <div className="text-slate-800 text-[12.5px] font-semibold">{data.military.role}</div>}
              {data.military.unit && <div className="text-[12px] mt-0.5" style={{ color: ac }}>{data.military.unit}</div>}
              {(data.military.start || data.military.end) && (
                <div className="text-slate-400 text-[11px] mt-1" dir="ltr">
                  {data.military.start || "—"} – {data.military.end || "—"}
                </div>
              )}
              {data.military.reserveDuty && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
                  {tx.cvFieldMilReserve}
                </div>
              )}
            </NordicSideSection>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 px-7 py-6">
          {data.summary && (
            <NordicMainSection title={tx.cvSecSummary} ac={ac}>
              <p className="text-slate-600 text-[13px] leading-relaxed whitespace-pre-wrap italic">{data.summary}</p>
            </NordicMainSection>
          )}

          {data.experiences.length > 0 && (
            <NordicMainSection title={tx.cvSecExperience} ac={ac}>
              <div className="space-y-5">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4">
                    <div className="text-[11px] font-medium whitespace-nowrap pt-0.5 w-[70px] flex-shrink-0 text-end" style={{ color: rgba(ac, 0.8) }} dir="ltr">
                      <div>{exp.start || "—"}</div>
                      <div>{exp.current ? tx.cvFieldPresent : exp.end || "—"}</div>
                    </div>
                    <div className="flex-1 border-s-2 ps-4" style={{ borderColor: rgba(ac, 0.25) }}>
                      <h3 className="font-bold text-slate-900 text-[14px]">{exp.role || "—"}</h3>
                      {exp.company && <div className="text-[12px] font-semibold mb-1" style={{ color: ac }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                      {exp.description && <p className="text-slate-600 text-[12.5px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </NordicMainSection>
          )}

          {data.educations.length > 0 && (
            <NordicMainSection title={tx.cvSecEducation} ac={ac}>
              <div className="space-y-4">
                {data.educations.map((edu) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="text-[11px] font-medium whitespace-nowrap pt-0.5 w-[70px] flex-shrink-0 text-end" style={{ color: rgba(ac, 0.8) }} dir="ltr">
                      <div>{edu.start || "—"}</div>
                      <div>{edu.current ? tx.cvFieldPresent : edu.end || "—"}</div>
                    </div>
                    <div className="flex-1 border-s-2 ps-4" style={{ borderColor: rgba(ac, 0.25) }}>
                      <h3 className="font-bold text-slate-900 text-[14px]">{edu.degree || "—"}</h3>
                      {edu.school && <div className="text-[12px] font-semibold" style={{ color: ac }}>{renderMixedText(edu.school)}{edu.location ? ` · ${edu.location}` : ""}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </NordicMainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function NordicSideSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <div className="mb-6 last:mb-0">
      <h2 className="text-[10px] font-black uppercase tracking-[0.14em] mb-2.5 pb-1.5 border-b" style={{ color: ac, borderColor: rgba(ac, 0.2) }}>{title}</h2>
      {children}
    </div>
  );
}

function NordicMainSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="text-[10.5px] font-black uppercase tracking-[0.14em] mb-3" style={{ color: ac }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 3: Sidebar (bold accent sidebar with photo) ─────────────────────

function SidebarTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      <div className="flex min-h-full">
        {/* Sidebar */}
        <div className="w-[36%] flex-shrink-0 text-white px-5 py-8" style={{ background: `linear-gradient(175deg, ${ac} 0%, ${rgba(ac, 0.82)} 100%)` }}>
          {p.photo ? (
            <img src={p.photo} className="w-[90px] h-[90px] rounded-full object-cover border-[3px] border-white/40 shadow-lg mx-auto mb-4" alt="" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow">
              {p.fullName ? p.fullName.charAt(0).toUpperCase() : "?"}
            </div>
          )}

          <h1 className="text-[18px] font-bold text-white leading-tight text-center mb-1">
            {p.fullName || <span className="opacity-50">{tx.cvPreviewEmptyName}</span>}
          </h1>
          <p className="text-white/70 text-[11.5px] font-medium uppercase tracking-widest text-center mb-6">
            {p.title || <span className="opacity-50">{tx.cvPreviewEmptyTitle}</span>}
          </p>

          {/* Contact */}
          <div className="space-y-2 mb-7">
            {p.email    && <div className="flex items-center gap-2 text-white/80 text-[11.5px]"><CIcon d={ICON_EMAIL} cls="w-3 h-3" />{ltrSpan(p.email)}</div>}
            {p.phone    && <div className="flex items-center gap-2 text-white/80 text-[11.5px]"><CIcon d={ICON_PHONE} cls="w-3 h-3" />{ltrSpan(p.phone)}</div>}
            {p.location && <div className="flex items-center gap-2 text-white/80 text-[11.5px]"><CIcon d={ICON_LOCATION} cls="w-3 h-3" />{p.location}</div>}
            {p.linkedin && <div className="flex items-start gap-2 text-white/80 text-[11.5px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3 h-3 mt-0.5" /><span className="break-all">{p.linkedin}</span></div>}
          </div>

          {skillsList.length > 0 && (
            <SidebarSideSection title={tx.cvSecSkills}>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </SidebarSideSection>
          )}

          {languagesList.length > 0 && (
            <SidebarSideSection title={tx.cvSecLanguages}>
              <div className="space-y-1">
                {languagesList.map((l, i) => <div key={i} className="text-white/80 text-[12px]">{l}</div>)}
              </div>
            </SidebarSideSection>
          )}

          {hasMilitary && (
            <SidebarSideSection title={tx.cvSecMilitary}>
              {data.military.role && <div className="text-white font-semibold text-[12px]">{data.military.role}</div>}
              {data.military.unit && <div className="text-white/70 text-[11.5px]">{data.military.unit}</div>}
              {(data.military.start || data.military.end) && (
                <div className="text-white/55 text-[11px] mt-0.5" dir="ltr">
                  {data.military.start || "—"} – {data.military.end || "—"}
                </div>
              )}
              {data.military.reserveDuty && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-white/75">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  {tx.cvFieldMilReserve}
                </div>
              )}
            </SidebarSideSection>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 px-7 py-8">
          {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

          {data.summary && (
            <SidebarMainSection title={tx.cvSecSummary} ac={ac}>
              <p className="text-slate-600 text-[13px] leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            </SidebarMainSection>
          )}

          {data.experiences.length > 0 && (
            <SidebarMainSection title={tx.cvSecExperience} ac={ac}>
              <div className="space-y-5">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start gap-2 flex-wrap mb-0.5">
                      <h3 className="font-bold text-slate-900 text-[14px]">{exp.role || "—"}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: rgba(ac, 0.1), color: ac }} dir="ltr">
                        {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                      </span>
                    </div>
                    {exp.company && <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: ac }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                    {exp.description && <p className="text-slate-600 text-[12.5px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </SidebarMainSection>
          )}

          {data.educations.length > 0 && (
            <SidebarMainSection title={tx.cvSecEducation} ac={ac}>
              <div className="space-y-4">
                {data.educations.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-[14px]">{edu.degree || "—"}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: rgba(ac, 0.1), color: ac }} dir="ltr">
                        {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                      </span>
                    </div>
                    {edu.school && <div className="text-[12.5px] font-semibold" style={{ color: ac }}>{renderMixedText(edu.school)}{edu.location ? ` · ${edu.location}` : ""}</div>}
                  </div>
                ))}
              </div>
            </SidebarMainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarSideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h2 className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55 mb-2.5 pb-1.5 border-b border-white/20">{title}</h2>
      {children}
    </div>
  );
}

function SidebarMainSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-[10.5px] font-black uppercase tracking-[0.14em] mb-3 pb-1.5 border-b" style={{ color: ac, borderColor: rgba(ac, 0.2) }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 4: Classic (traditional centered) ───────────────────────────────

function ClassicTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Header */}
      <div className="px-10 pt-10 pb-7 text-center">
        <h1 className="text-[34px] font-bold text-slate-900 tracking-wide uppercase mb-2 leading-tight">
          {p.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
        </h1>
        <p className="text-[12.5px] tracking-[0.18em] uppercase font-semibold mb-5" style={{ color: ac }}>
          {p.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-slate-500 text-[12px]">
          {p.email    && <span className="flex items-center gap-1.5"><CIcon d={ICON_EMAIL} />{ltrSpan(p.email)}</span>}
          {p.phone    && <span className="flex items-center gap-1.5"><CIcon d={ICON_PHONE} />{ltrSpan(p.phone)}</span>}
          {p.location && <span className="flex items-center gap-1.5"><CIcon d={ICON_LOCATION} />{p.location}</span>}
          {p.linkedin && <span className="flex items-center gap-1.5" dir="ltr"><CIcon d={ICON_LINK} />{p.linkedin}</span>}
          {p.website  && <span className="flex items-center gap-1.5" dir="ltr"><CIcon d={ICON_LINK} />{p.website}</span>}
        </div>
      </div>
      {/* Double line */}
      <div className="mx-8 mb-6" style={{ borderTop: `3px solid ${ac}`, paddingTop: 3, borderBottom: `1px solid ${rgba(ac, 0.3)}` }} />

      <div className="px-10 pb-8">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

        {data.summary && (
          <ClassicSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-600 text-[13.5px] leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </ClassicSection>
        )}

        {data.experiences.length > 0 && (
          <ClassicSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
                    <h3 className="font-bold text-slate-900 text-[15px] uppercase tracking-wide">{exp.role || "—"}</h3>
                    <span className="text-slate-500 text-[11.5px] font-medium" dir="ltr">
                      {exp.start || "—"} – {exp.current ? tx.cvFieldPresent : exp.end || "—"}
                    </span>
                  </div>
                  {exp.company && <div className="text-slate-600 text-[13px] font-medium mb-1.5 italic">{renderMixedText(exp.company)}{exp.location ? `, ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-[13px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </ClassicSection>
        )}

        {data.educations.length > 0 && (
          <ClassicSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-[15px] uppercase tracking-wide">{edu.degree || "—"}</h3>
                    <span className="text-slate-500 text-[11.5px] font-medium" dir="ltr">
                      {edu.start || "—"} – {edu.current ? tx.cvFieldPresent : edu.end || "—"}
                    </span>
                  </div>
                  {edu.school && <div className="text-slate-600 text-[13px] italic">{renderMixedText(edu.school)}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </ClassicSection>
        )}

        {hasMilitary && (
          <ClassicSection title={tx.cvSecMilitary} ac={ac}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
              {data.military.role && <h3 className="font-bold text-slate-900 text-[15px] uppercase tracking-wide">{data.military.role}</h3>}
              {(data.military.start || data.military.end) && (
                <span className="text-slate-500 text-[11.5px] font-medium" dir="ltr">
                  {data.military.start || "—"} – {data.military.end || "—"}
                </span>
              )}
            </div>
            {data.military.unit && <div className="text-slate-600 text-[13px] italic">{data.military.unit}</div>}
            {data.military.reserveDuty && <div className="text-slate-500 text-[13px] mt-1 italic">{tx.cvFieldMilReserve}</div>}
          </ClassicSection>
        )}

        {skillsList.length > 0 && (
          <ClassicSection title={tx.cvSecSkills} ac={ac}>
            <p className="text-slate-700 text-[13.5px] leading-relaxed">{skillsList.join("  ·  ")}</p>
          </ClassicSection>
        )}
        {languagesList.length > 0 && (
          <ClassicSection title={tx.cvSecLanguages} ac={ac}>
            <p className="text-slate-700 text-[13.5px]">{languagesList.join("  ·  ")}</p>
          </ClassicSection>
        )}
      </div>
    </div>
  );
}

function ClassicSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3 pb-1 border-b-2" style={{ color: ac, borderColor: ac }}>{title}</h2>
      {children}
    </section>
  );
}

// ─── Template 5: Code (dark developer) ────────────────────────────────────────

function CodeTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-[#0d1117] text-gray-100 rounded-xl shadow-xl overflow-hidden font-mono" dir={dir} style={{ minHeight: 900 }}>
      {/* Header */}
      <div className="px-8 py-8 relative overflow-hidden" style={{ backgroundColor: ac }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.3) 28px, rgba(255,255,255,0.3) 29px)" }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight">
              {p.fullName || <span className="opacity-50">{tx.cvPreviewEmptyName}</span>}
            </h1>
            {p.title && <p className="text-white/80 text-[13.5px] font-normal mt-1">{`> ${p.title}`}</p>}
          </div>
          <div className="text-[11.5px] text-white/75 space-y-0.5 text-start" dir="ltr">
            {p.email    && <div>@ {ltrSpan(p.email)}</div>}
            {p.phone    && <div># {ltrSpan(p.phone)}</div>}
            {p.location && <div>$ {p.location}</div>}
            {p.linkedin && <div>in {p.linkedin}</div>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-7">
        {isEmpty && <p className="text-gray-600 text-center py-10">{tx.cvPlaceholder}</p>}

        {data.summary && (
          <CodeSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-gray-400 text-[13px] leading-relaxed border-s-2 ps-4" style={{ borderColor: rgba(ac, 0.5) }}>{data.summary}</p>
          </CodeSection>
        )}

        {data.experiences.length > 0 && (
          <CodeSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-s-2 border-[#21262d] ps-4 hover:border-s-[3px] transition-all">
                  <div className="flex justify-between flex-wrap gap-1 mb-1">
                    <span className="text-white font-semibold text-[13.5px]">{exp.role || "—"}</span>
                    <span className="text-gray-500 text-[11.5px]" dir="ltr">{exp.start}{exp.start && (exp.end || exp.current) ? " → " : ""}{exp.current ? "present" : exp.end}</span>
                  </div>
                  {exp.company && <div className="text-[12px] mb-1.5 font-medium" style={{ color: rgba(ac, 0.9) }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-gray-400 text-[12px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </CodeSection>
        )}

        {data.educations.length > 0 && (
          <CodeSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="border-s-2 border-[#21262d] ps-4">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-white text-[13.5px] font-semibold">{edu.degree || "—"}</span>
                    <span className="text-gray-500 text-[11px]" dir="ltr">{edu.start}{edu.start && edu.end ? "–" : ""}{edu.end}</span>
                  </div>
                  {edu.school && <div className="text-gray-400 text-[12px]">{renderMixedText(edu.school)}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </CodeSection>
        )}

        {hasMilitary && (
          <CodeSection title={tx.cvSecMilitary} ac={ac}>
            <div className="border-s-2 border-[#21262d] ps-4">
              <div className="flex justify-between flex-wrap gap-1 mb-1">
                {data.military.role && <span className="text-white font-semibold text-[13.5px]">{data.military.role}</span>}
                {(data.military.start || data.military.end) && (
                  <span className="text-gray-500 text-[11px]" dir="ltr">{data.military.start}–{data.military.end}</span>
                )}
              </div>
              {data.military.unit && <div className="text-[12px] font-medium" style={{ color: rgba(ac, 0.9) }}>{data.military.unit}</div>}
              {data.military.reserveDuty && <div className="text-gray-400 text-[12px] mt-1">{`// ${tx.cvFieldMilReserve}`}</div>}
            </div>
          </CodeSection>
        )}

        <div className="grid grid-cols-2 gap-6">
          {skillsList.length > 0 && (
            <CodeSection title={tx.cvSecSkills} ac={ac}>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded"
                    style={{ backgroundColor: rgba(ac, 0.12), border: `1px solid ${rgba(ac, 0.3)}`, color: rgba(ac, 0.95) }}>
                    {s}
                  </span>
                ))}
              </div>
            </CodeSection>
          )}
          {languagesList.length > 0 && (
            <CodeSection title={tx.cvSecLanguages} ac={ac}>
              <div className="space-y-0.5">
                {languagesList.map((l, i) => <div key={i} className="text-gray-400 text-[12px]">› {l}</div>)}
              </div>
            </CodeSection>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section>
      <h2 className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: ac }}>
        {`// ${title}`}
      </h2>
      {children}
    </section>
  );
}

// ─── Template 6: Impact (bold typography, vertical accent bar) ────────────────

function ImpactTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Header with left bar */}
      <div className="relative">
        <div className="absolute start-0 top-0 bottom-0 w-1.5 rounded-e-full" style={{ backgroundColor: ac }} />
        <div className="ps-9 pe-8 pt-9 pb-7 bg-slate-50 border-b border-slate-200">
          <h1 className="text-[38px] font-black text-slate-900 leading-none mb-2 tracking-tight">
            {p.fullName || <span className="text-slate-300">{tx.cvPreviewEmptyName}</span>}
          </h1>
          <p className="font-bold text-[15px] tracking-wide mb-4" style={{ color: ac }}>
            {p.title || <span className="text-slate-400">{tx.cvPreviewEmptyTitle}</span>}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-slate-500 text-[12px]">
            {p.email    && <span className="flex items-center gap-1.5"><CIcon d={ICON_EMAIL} />{ltrSpan(p.email)}</span>}
            {p.phone    && <span className="flex items-center gap-1.5"><CIcon d={ICON_PHONE} />{ltrSpan(p.phone)}</span>}
            {p.location && <span className="flex items-center gap-1.5"><CIcon d={ICON_LOCATION} />{p.location}</span>}
            {p.linkedin && <span className="flex items-center gap-1.5" dir="ltr"><CIcon d={ICON_LINK} />{p.linkedin}</span>}
          </div>
        </div>
      </div>

      <div className="ps-9 pe-8 py-8 space-y-7">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

        {data.summary && (
          <ImpactSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-600 text-[13.5px] leading-relaxed">{data.summary}</p>
          </ImpactSection>
        )}

        {data.experiences.length > 0 && (
          <ImpactSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-[14.5px]">{exp.role || "—"}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {exp.start}{exp.start && (exp.end || exp.current) ? "–" : ""}{exp.current ? tx.cvFieldPresent : exp.end}
                    </span>
                  </div>
                  {exp.company && <div className="font-bold text-[12.5px] mt-0.5" style={{ color: ac }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-[13px] mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </ImpactSection>
        )}

        {data.educations.length > 0 && (
          <ImpactSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-4">
              {data.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-[14.5px]">{edu.degree || "—"}</h3>
                    <span className="text-[11px] text-slate-400">{edu.start}{edu.start && edu.end ? "–" : ""}{edu.end}</span>
                  </div>
                  {edu.school && <div className="text-slate-500 text-[13px] mt-0.5">{renderMixedText(edu.school)}{edu.location ? `, ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </ImpactSection>
        )}

        {hasMilitary && (
          <ImpactSection title={tx.cvSecMilitary} ac={ac}>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              {data.military.role && <h3 className="font-bold text-slate-900 text-[14.5px]">{data.military.role}</h3>}
              {(data.military.start || data.military.end) && (
                <span className="text-[11px] text-slate-400 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full" dir="ltr">
                  {data.military.start}–{data.military.end}
                </span>
              )}
            </div>
            {data.military.unit && <div className="font-bold text-[12.5px] mt-0.5" style={{ color: ac }}>{data.military.unit}</div>}
            {data.military.reserveDuty && <div className="text-slate-500 text-[12.5px] mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />{tx.cvFieldMilReserve}</div>}
          </ImpactSection>
        )}

        <div className="grid grid-cols-2 gap-6">
          {skillsList.length > 0 && (
            <ImpactSection title={tx.cvSecSkills} ac={ac}>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, i) => (
                  <span key={i} className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: rgba(ac, 0.08), border: `1px solid ${rgba(ac, 0.2)}`, color: ac }}>
                    {s}
                  </span>
                ))}
              </div>
            </ImpactSection>
          )}
          {languagesList.length > 0 && (
            <ImpactSection title={tx.cvSecLanguages} ac={ac}>
              <div className="space-y-1">
                {languagesList.map((l, i) => <div key={i} className="text-slate-600 text-[12.5px] font-medium">· {l}</div>)}
              </div>
            </ImpactSection>
          )}
        </div>
      </div>
    </div>
  );
}

function ImpactSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-5 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
        <h2 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Template 7: Timeline (elegant centered photo) ────────────────────────────

function TimelineTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Thin accent top bar */}
      <div className="h-1.5" style={{ backgroundColor: ac }} />

      <div className="flex min-h-full">
        {/* Left sidebar */}
        <div className="w-[32%] border-e border-slate-100 bg-slate-50/60 px-5 py-8 flex-shrink-0">
          {/* Photo */}
          {p.photo ? (
            <img src={p.photo} className="w-[80px] h-[80px] rounded-full object-cover mx-auto mb-4 shadow-md" style={{ border: `3px solid ${rgba(ac, 0.35)}` }} alt="" />
          ) : (
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center mx-auto mb-4 shadow text-slate-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          <h1 className="text-center text-[17px] font-bold text-slate-900 leading-tight mb-1">
            {p.fullName || <span className="text-slate-400">{tx.cvPreviewEmptyName}</span>}
          </h1>
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest mb-5" style={{ color: ac }}>
            {p.title || <span className="text-slate-300">{tx.cvPreviewEmptyTitle}</span>}
          </p>

          <div className="space-y-2 mb-7">
            {p.email    && <div className="flex items-center gap-2 text-slate-600 text-[12px]"><CIcon d={ICON_EMAIL} />{ltrSpan(p.email)}</div>}
            {p.phone    && <div className="flex items-center gap-2 text-slate-600 text-[12px]"><CIcon d={ICON_PHONE} />{ltrSpan(p.phone)}</div>}
            {p.location && <div className="flex items-center gap-2 text-slate-600 text-[12px]"><CIcon d={ICON_LOCATION} />{p.location}</div>}
            {p.linkedin && <div className="flex items-start gap-2 text-slate-600 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3 h-3 mt-0.5" /><span className="break-all">{p.linkedin}</span></div>}
            {p.website  && <div className="flex items-start gap-2 text-slate-600 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3 h-3 mt-0.5" /><span className="break-all">{p.website}</span></div>}
          </div>

          {skillsList.length > 0 && (
            <TimelineSideSection title={tx.cvSecSkills} ac={ac}>
              <div className="space-y-1.5">
                {skillsList.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ac }} />
                    <span className="text-slate-700 text-[12px]">{s}</span>
                  </div>
                ))}
              </div>
            </TimelineSideSection>
          )}

          {languagesList.length > 0 && (
            <TimelineSideSection title={tx.cvSecLanguages} ac={ac}>
              <div className="space-y-1.5">
                {languagesList.map((l, i) => <div key={i} className="text-slate-700 text-[12px]">{l}</div>)}
              </div>
            </TimelineSideSection>
          )}

          {hasMilitary && (
            <TimelineSideSection title={tx.cvSecMilitary} ac={ac}>
              {data.military.role && <div className="text-slate-800 text-[12px] font-semibold">{data.military.role}</div>}
              {data.military.unit && <div className="text-[11.5px] mt-0.5" style={{ color: ac }}>{data.military.unit}</div>}
              {(data.military.start || data.military.end) && (
                <div className="text-slate-400 text-[11px] mt-1" dir="ltr">{data.military.start || "—"} – {data.military.end || "—"}</div>
              )}
              {data.military.reserveDuty && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                  {tx.cvFieldMilReserve}
                </div>
              )}
            </TimelineSideSection>
          )}
        </div>

        {/* Right main */}
        <div className="flex-1 px-7 py-8">
          {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

          {data.summary && (
            <TimelineMainSection title={tx.cvSecSummary} ac={ac}>
              <p className="text-slate-600 text-[13px] leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            </TimelineMainSection>
          )}

          {data.experiences.length > 0 && (
            <TimelineMainSection title={tx.cvSecExperience} ac={ac}>
              <div className="space-y-6">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="relative ps-5 border-s-2" style={{ borderColor: rgba(ac, 0.25) }}>
                    <div className="absolute -start-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: ac }} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 mb-0.5">
                      <h3 className="font-bold text-slate-900 text-[14px]">{exp.role || "—"}</h3>
                      <span className="text-slate-400 text-[11px] font-medium" dir="ltr">
                        {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                      </span>
                    </div>
                    {exp.company && <div className="text-[12px] font-semibold mb-1.5" style={{ color: ac }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                    {exp.description && <p className="text-slate-600 text-[12.5px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </TimelineMainSection>
          )}

          {data.educations.length > 0 && (
            <TimelineMainSection title={tx.cvSecEducation} ac={ac}>
              <div className="space-y-5">
                {data.educations.map((edu) => (
                  <div key={edu.id} className="relative ps-5 border-s-2" style={{ borderColor: rgba(ac, 0.25) }}>
                    <div className="absolute -start-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: ac }} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <h3 className="font-bold text-slate-900 text-[14px]">{edu.degree || "—"}</h3>
                      <span className="text-slate-400 text-[11px] font-medium" dir="ltr">
                        {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                      </span>
                    </div>
                    {edu.school && <div className="text-[12px] font-semibold" style={{ color: ac }}>{renderMixedText(edu.school)}{edu.location ? ` · ${edu.location}` : ""}</div>}
                  </div>
                ))}
              </div>
            </TimelineMainSection>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineSideSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <div className="mb-6 last:mb-0">
      <h2 className="text-[10px] font-black uppercase tracking-[0.14em] mb-2.5 pb-1.5 border-b" style={{ color: ac, borderColor: rgba(ac, 0.2) }}>{title}</h2>
      {children}
    </div>
  );
}

function TimelineMainSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="text-[11px] font-black uppercase tracking-[0.13em] mb-5 flex items-center gap-2" style={{ color: ac }}>
        <span className="inline-block w-5 h-0.5 rounded-full" style={{ backgroundColor: ac }} />
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Template 8: Prism (rich gradient header, card sections) ──────────────────

function PrismTemplate({ data, tx, dir, skillsList, languagesList, isEmpty, hasMilitary, ac }: TemplateProps) {
  const p = data.personal;
  return (
    <div className="bg-white rounded-2xl shadow-2xl print:shadow-none overflow-hidden" dir={dir} style={{ minHeight: 900 }}>
      {/* Gradient header */}
      <div className="relative px-8 py-11 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${ac} 0%, ${rgba(ac, 0.65)} 60%, ${rgba(ac, 0.9)} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 end-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10">
          <h1 className="text-[34px] font-black text-white tracking-tight leading-tight mb-2">
            {p.fullName || <span className="opacity-40">{tx.cvPreviewEmptyName}</span>}
          </h1>
          <p className="text-white/80 text-[15px] font-light mb-6">
            {p.title || <span className="opacity-40">{tx.cvPreviewEmptyTitle}</span>}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {p.email    && <span className="flex items-center gap-2 text-white/85 text-[12px]"><CIcon d={ICON_EMAIL} cls="w-3.5 h-3.5" />{ltrSpan(p.email)}</span>}
            {p.phone    && <span className="flex items-center gap-2 text-white/85 text-[12px]"><CIcon d={ICON_PHONE} cls="w-3.5 h-3.5" />{ltrSpan(p.phone)}</span>}
            {p.location && <span className="flex items-center gap-2 text-white/85 text-[12px]"><CIcon d={ICON_LOCATION} cls="w-3.5 h-3.5" />{p.location}</span>}
            {p.linkedin && <span className="flex items-center gap-2 text-white/85 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3.5 h-3.5" />{p.linkedin}</span>}
            {p.website  && <span className="flex items-center gap-2 text-white/85 text-[12px]" dir="ltr"><CIcon d={ICON_LINK} cls="w-3.5 h-3.5" />{p.website}</span>}
          </div>
        </div>
      </div>

      <div className="px-8 py-7">
        {isEmpty && <p className="text-slate-400 text-center py-10">{tx.cvPlaceholder}</p>}

        {data.summary && (
          <PrismSection title={tx.cvSecSummary} ac={ac}>
            <p className="text-slate-600 text-[13.5px] leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </PrismSection>
        )}

        {data.experiences.length > 0 && (
          <PrismSection title={tx.cvSecExperience} ac={ac}>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="rounded-xl p-4" style={{ backgroundColor: rgba(ac, 0.04), border: `1px solid ${rgba(ac, 0.1)}` }}>
                  <div className="flex justify-between flex-wrap gap-1 mb-0.5">
                    <h3 className="font-bold text-slate-900 text-[14.5px]">{exp.role || "—"}</h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.1), color: ac }} dir="ltr">
                      {exp.start} – {exp.current ? tx.cvFieldPresent : exp.end}
                    </span>
                  </div>
                  {exp.company && <div className="font-semibold text-[12.5px] mb-2" style={{ color: ac }}>{renderMixedText(exp.company)}{exp.location ? ` · ${exp.location}` : ""}</div>}
                  {exp.description && <p className="text-slate-600 text-[12.5px] leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          </PrismSection>
        )}

        {data.educations.length > 0 && (
          <PrismSection title={tx.cvSecEducation} ac={ac}>
            <div className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="rounded-xl p-4" style={{ backgroundColor: rgba(ac, 0.04), border: `1px solid ${rgba(ac, 0.1)}` }}>
                  <div className="flex justify-between flex-wrap gap-1">
                    <h3 className="font-bold text-slate-900 text-[14.5px]">{edu.degree || "—"}</h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.1), color: ac }} dir="ltr">
                      {edu.start} – {edu.current ? tx.cvFieldPresent : edu.end}
                    </span>
                  </div>
                  {edu.school && <div className="font-semibold text-[12.5px] mt-0.5" style={{ color: ac }}>{renderMixedText(edu.school)}{edu.location ? ` · ${edu.location}` : ""}</div>}
                </div>
              ))}
            </div>
          </PrismSection>
        )}

        {hasMilitary && (
          <PrismSection title={tx.cvSecMilitary} ac={ac}>
            <div className="rounded-xl p-4" style={{ backgroundColor: rgba(ac, 0.04), border: `1px solid ${rgba(ac, 0.1)}` }}>
              <div className="flex justify-between flex-wrap gap-1 mb-0.5">
                {data.military.role && <h3 className="font-bold text-slate-900 text-[14.5px]">{data.military.role}</h3>}
                {(data.military.start || data.military.end) && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: rgba(ac, 0.1), color: ac }} dir="ltr">
                    {data.military.start} – {data.military.end}
                  </span>
                )}
              </div>
              {data.military.unit && <div className="font-semibold text-[12.5px]" style={{ color: ac }}>{data.military.unit}</div>}
              {data.military.reserveDuty && (
                <div className="flex items-center gap-1.5 mt-2 text-[12px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ac }} />
                  {tx.cvFieldMilReserve}
                </div>
              )}
            </div>
          </PrismSection>
        )}

        {(skillsList.length > 0 || languagesList.length > 0) && (
          <div className="grid grid-cols-2 gap-6">
            {skillsList.length > 0 && (
              <PrismSection title={tx.cvSecSkills} ac={ac}>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((s, i) => (
                    <span key={i} className="text-[12px] font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: rgba(ac, 0.1), color: ac }}>{s}</span>
                  ))}
                </div>
              </PrismSection>
            )}
            {languagesList.length > 0 && (
              <PrismSection title={tx.cvSecLanguages} ac={ac}>
                <div className="space-y-1.5">
                  {languagesList.map((l, i) => <div key={i} className="text-slate-600 text-[13px]">{l}</div>)}
                </div>
              </PrismSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PrismSection({ title, children, ac }: { title: string; children: React.ReactNode; ac: string }) {
  return (
    <section className="mb-6 last:mb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rgba(ac, 0.12) }}>
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ac }} />
        </div>
        <h2 className="text-[10.5px] font-black uppercase tracking-[0.14em]" style={{ color: ac }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
