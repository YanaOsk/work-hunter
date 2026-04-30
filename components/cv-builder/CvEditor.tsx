"use client";

import { useState } from "react";
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
  const [improving, setImproving] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleImproveSummary = async () => {
    if (!data.summary.trim() || improving) return;
    setImproving(true);
    setSuggestion(null);
    try {
      const res = await fetch("/api/ai/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.summary,
          name: data.personal.fullName,
          title: data.personal.title,
          lang,
        }),
      });
      const json = await res.json();
      if (json.improved) setSuggestion(json.improved);
    } catch {
      // silently fail
    } finally {
      setImproving(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      onChange({ ...data, summary: suggestion });
      setSuggestion(null);
    }
  };

  const setPersonal = (field: keyof CvData["personal"], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const setMilitary = (field: keyof CvData["military"], value: string | boolean) => {
    onChange({ ...data, military: { ...data.military, [field]: value } });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPersonal("photo", reader.result as string);
    reader.readAsDataURL(file);
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
      {/* Personal */}
      <Section title={tx.cvSecPersonal} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={tx.cvFieldName} value={data.personal.fullName} onChange={(v) => setPersonal("fullName", v)} />
          <Field label={tx.cvFieldTitle} value={data.personal.title} onChange={(v) => setPersonal("title", v)} />
          <Field label={tx.cvFieldEmail} value={data.personal.email} onChange={(v) => setPersonal("email", v)} type="email" dir="ltr" />
          <Field label={tx.cvFieldPhone} value={data.personal.phone} onChange={(v) => setPersonal("phone", v)} dir="ltr" />
          <Field label={tx.cvFieldLocation} value={data.personal.location} onChange={(v) => setPersonal("location", v)} />
          <Field label={tx.cvFieldLinkedin} value={data.personal.linkedin} onChange={(v) => setPersonal("linkedin", v)} dir="ltr" />
          <Field label={tx.cvFieldWebsite} value={data.personal.website} onChange={(v) => setPersonal("website", v)} dir="ltr" className="sm:col-span-2" />
        </div>

        {/* Photo upload */}
        <div className="mt-3">
          <label className="block text-xs text-white/60 mb-1.5">{tx.cvPhotoUpload}</label>
          <div className="flex items-center gap-3">
            {data.personal.photo ? (
              <img src={data.personal.photo} className="w-12 h-12 rounded-full object-cover border border-white/20 flex-shrink-0" alt="" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <label className="cursor-pointer px-3 py-1.5 bg-white/5 border border-white/20 rounded-lg text-xs text-white/70 hover:bg-white/10 transition">
              {data.personal.photo ? tx.cvPhotoChange : tx.cvPhotoUpload}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            {data.personal.photo && (
              <button onClick={() => setPersonal("photo", "")} className="text-rose-400/70 hover:text-rose-400 text-xs transition">
                {tx.cvPhotoRemove}
              </button>
            )}
            <span className="text-white/30 text-[11px]">
              {lang === "he" ? "• מופיע בתבניות Nova, Nordic, Sidebar, Timeline" : "• Shown in Nova, Nordic, Sidebar, Timeline"}
            </span>
          </div>
        </div>
      </Section>

      {/* Summary */}
      <Section title={tx.cvSecSummary} icon="M4 6h16M4 12h16M4 18h7">
        <textarea
          value={data.summary}
          onChange={(e) => onChange({ ...data, summary: e.target.value })}
          rows={4}
          placeholder={tx.cvFieldSummaryPh}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
        />
        <button
          onClick={handleImproveSummary}
          disabled={improving || !data.summary.trim()}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {improving ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
          {improving ? tx.cvImproving : tx.cvImproveWithAI}
        </button>

        {suggestion && (
          <div className="mt-3 bg-purple-950/60 border border-purple-500/30 rounded-xl p-4">
            <p className="text-xs text-purple-300 font-medium mb-2">{tx.cvSuggestion}</p>
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{suggestion}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={acceptSuggestion}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition"
              >
                {tx.cvAccept}
              </button>
              <button
                onClick={() => setSuggestion(null)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/70 text-xs rounded-lg transition"
              >
                {tx.cvDiscard}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Military Service */}
      <Section title={tx.cvSecMilitary} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={tx.cvFieldMilUnit} value={data.military.unit} onChange={(v) => setMilitary("unit", v)} />
          <Field label={tx.cvFieldMilRole} value={data.military.role} onChange={(v) => setMilitary("role", v)} />
          <Field label={tx.cvFieldMilStart} value={data.military.start} onChange={(v) => setMilitary("start", v)} placeholder="MM/YYYY" dir="ltr" />
          <Field label={tx.cvFieldMilEnd} value={data.military.end} onChange={(v) => setMilitary("end", v)} placeholder="MM/YYYY" dir="ltr" />
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={data.military.reserveDuty}
            onChange={(e) => setMilitary("reserveDuty", e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500"
          />
          {tx.cvFieldMilReserve}
        </label>
      </Section>

      {/* Experience */}
      <Section title={tx.cvSecExperience} icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8">
        {data.experiences.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">—</p>
        )}
        <div className="space-y-3">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-white/50 text-xs">#{data.experiences.indexOf(exp) + 1}</span>
                <button onClick={() => removeExperience(exp.id)} className="text-rose-400/70 hover:text-rose-400 text-xs">
                  {tx.cvRemove}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={tx.cvFieldRole} value={exp.role} onChange={(v) => updateExperience(exp.id, "role", v)} />
                <Field label={tx.cvFieldCompany} value={exp.company} onChange={(v) => updateExperience(exp.id, "company", v)} />
                <Field label={tx.cvFieldLocation} value={exp.location} onChange={(v) => updateExperience(exp.id, "location", v)} />
                <div />
                <Field label={tx.cvFieldStart} value={exp.start} onChange={(v) => updateExperience(exp.id, "start", v)} placeholder="MM/YYYY" dir="ltr" />
                <Field label={tx.cvFieldEnd} value={exp.end} onChange={(v) => updateExperience(exp.id, "end", v)} placeholder="MM/YYYY" dir="ltr" disabled={exp.current} />
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

      {/* Education */}
      <Section title={tx.cvSecEducation} icon="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z">
        {data.educations.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">—</p>
        )}
        <div className="space-y-3">
          {data.educations.map((edu) => (
            <div key={edu.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-white/50 text-xs">#{data.educations.indexOf(edu) + 1}</span>
                <button onClick={() => removeEducation(edu.id)} className="text-rose-400/70 hover:text-rose-400 text-xs">
                  {tx.cvRemove}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Field label={tx.cvFieldDegree} value={edu.degree} onChange={(v) => updateEducation(edu.id, "degree", v)} />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {([tx.cvDegreeHS, tx.cvDegreeHSPartial, tx.cvDegreeHS12] as string[]).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateEducation(edu.id, "degree", preset)}
                        className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/5 border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={tx.cvFieldSchool} value={edu.school} onChange={(v) => updateEducation(edu.id, "school", v)} />
                <Field label={tx.cvFieldLocation} value={edu.location} onChange={(v) => updateEducation(edu.id, "location", v)} />
                <div />
                <Field label={tx.cvFieldStart} value={edu.start} onChange={(v) => updateEducation(edu.id, "start", v)} placeholder="YYYY" dir="ltr" />
                <Field label={tx.cvFieldEnd} value={edu.end} onChange={(v) => updateEducation(edu.id, "end", v)} placeholder="YYYY" dir="ltr" disabled={edu.current} />
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

      {/* Skills */}
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

      {/* Languages */}
      <Section title={tx.cvSecLanguages} icon="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129">
        <textarea
          value={data.languages}
          onChange={(e) => onChange({ ...data, languages: e.target.value })}
          rows={2}
          placeholder={tx.cvFieldLangsPh}
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none text-sm"
        />
      </Section>

      {/* Volunteering */}
      <Section title={tx.cvSecVolunteering} icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
        <textarea
          value={data.volunteering ?? ""}
          onChange={(e) => onChange({ ...data, volunteering: e.target.value })}
          rows={3}
          placeholder={tx.cvFieldVolunteeringPh}
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
