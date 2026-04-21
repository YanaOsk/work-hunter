"use client";

import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import {
  CvData,
  CvEducation,
  CvExperience,
  emptyEducation,
  emptyExperience,
} from "@/lib/cvBuilder";

interface Props {
  data: CvData;
  onChange: (data: CvData) => void;
}

export default function CvEditor({ data, onChange }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];

  const setPersonal = (field: keyof CvData["personal"], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const addExperience = () => {
    onChange({ ...data, experiences: [...data.experiences, emptyExperience()] });
  };
  const updateExperience = (id: string, field: keyof CvExperience, value: string | boolean) => {
    onChange({
      ...data,
      experiences: data.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };
  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter((e) => e.id !== id) });
  };

  const addEducation = () => {
    onChange({ ...data, educations: [...data.educations, emptyEducation()] });
  };
  const updateEducation = (id: string, field: keyof CvEducation, value: string | boolean) => {
    onChange({
      ...data,
      educations: data.educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    });
  };
  const removeEducation = (id: string) => {
    onChange({ ...data, educations: data.educations.filter((e) => e.id !== id) });
  };

  return (
    <div className="space-y-5">
      <Section title={tx.cvSecPersonal} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={tx.cvFieldName} value={data.personal.fullName} onChange={(v) => setPersonal("fullName", v)} />
          <Field label={tx.cvFieldTitle} value={data.personal.title} onChange={(v) => setPersonal("title", v)} />
          <Field label={tx.cvFieldEmail} value={data.personal.email} onChange={(v) => setPersonal("email", v)} type="email" />
          <Field label={tx.cvFieldPhone} value={data.personal.phone} onChange={(v) => setPersonal("phone", v)} />
          <Field label={tx.cvFieldLocation} value={data.personal.location} onChange={(v) => setPersonal("location", v)} />
          <Field label={tx.cvFieldLinkedin} value={data.personal.linkedin} onChange={(v) => setPersonal("linkedin", v)} dir="ltr" />
          <Field label={tx.cvFieldWebsite} value={data.personal.website} onChange={(v) => setPersonal("website", v)} dir="ltr" className="sm:col-span-2" />
        </div>
      </Section>

      <Section title={tx.cvSecSummary} icon="M4 6h16M4 12h16M4 18h7">
        <textarea
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={4}
          placeholder={tx.cvFieldSummaryPh}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
        />
      </Section>

      <Section title={tx.cvSecExperience} icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8">
        {data.experiences.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">—</p>
        )}
        <div className="space-y-3">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-white/50 text-xs">#{data.experiences.indexOf(exp) + 1}</span>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-rose-400/70 hover:text-rose-400 text-xs"
                >
                  {tx.cvRemove}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={tx.cvFieldRole} value={exp.role} onChange={(v) => updateExperience(exp.id, "role", v)} />
                <Field label={tx.cvFieldCompany} value={exp.company} onChange={(v) => updateExperience(exp.id, "company", v)} />
                <Field label={tx.cvFieldLocation} value={exp.location} onChange={(v) => updateExperience(exp.id, "location", v)} />
                <div />
                <Field label={tx.cvFieldStart} value={exp.start} onChange={(v) => updateExperience(exp.id, "start", v)} placeholder="MM/YYYY" dir="ltr" />
                <Field
                  label={tx.cvFieldEnd}
                  value={exp.end}
                  onChange={(v) => updateExperience(exp.id, "end", v)}
                  placeholder="MM/YYYY"
                  dir="ltr"
                  disabled={exp.current}
                />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                {tx.cvFieldPresent}
              </label>
              <div className="mt-3">
                <label className="block text-xs text-white/60 mb-1.5">{tx.cvFieldDescription}</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addExperience}
          className="mt-3 w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {tx.cvAddExperience}
        </button>
      </Section>

      <Section title={tx.cvSecEducation} icon="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z">
        {data.educations.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">—</p>
        )}
        <div className="space-y-3">
          {data.educations.map((edu) => (
            <div key={edu.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-white/50 text-xs">#{data.educations.indexOf(edu) + 1}</span>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-rose-400/70 hover:text-rose-400 text-xs"
                >
                  {tx.cvRemove}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={tx.cvFieldDegree} value={edu.degree} onChange={(v) => updateEducation(edu.id, "degree", v)} />
                <Field label={tx.cvFieldSchool} value={edu.school} onChange={(v) => updateEducation(edu.id, "school", v)} />
                <Field label={tx.cvFieldLocation} value={edu.location} onChange={(v) => updateEducation(edu.id, "location", v)} />
                <div />
                <Field label={tx.cvFieldStart} value={edu.start} onChange={(v) => updateEducation(edu.id, "start", v)} placeholder="YYYY" dir="ltr" />
                <Field
                  label={tx.cvFieldEnd}
                  value={edu.end}
                  onChange={(v) => updateEducation(edu.id, "end", v)}
                  placeholder="YYYY"
                  dir="ltr"
                  disabled={edu.current}
                />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={edu.current}
                  onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                  className="w-4 h-4 rounded accent-purple-500"
                />
                {tx.cvFieldPresent}
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={addEducation}
          className="mt-3 w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {tx.cvAddEducation}
        </button>
      </Section>

      <Section title={tx.cvSecSkills} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
        <textarea
          value={data.skills}
          onChange={(e) => onChange({ ...data, skills: e.target.value })}
          rows={2}
          placeholder={tx.cvFieldSkillsPh}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
        />
        <p className="text-white/40 text-xs mt-1.5">{tx.cvFieldSkillsHelp}</p>
      </Section>

      <Section title={tx.cvSecLanguages} icon="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129">
        <textarea
          value={data.languages}
          onChange={(e) => onChange({ ...data, languages: e.target.value })}
          rows={2}
          placeholder={tx.cvFieldLangsPh}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-white font-semibold mb-4">
        <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  dir,
  disabled,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-white/60 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm disabled:opacity-40"
      />
    </div>
  );
}
