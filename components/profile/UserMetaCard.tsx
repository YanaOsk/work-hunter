"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserMeta, Availability, WorkPref } from "@/lib/userMeta";
import type { UserProfile } from "@/lib/types";
import { queueAutoStart } from "@/lib/autoStart";

type ParsedData = UserProfile["parsedData"];

interface Props {
  meta: UserMeta;
  scoutData: ParsedData;
  onSave: (patch: Partial<UserMeta>) => Promise<void>;
  he: boolean;
}

const AVAIL: Record<Availability, { he: string; cls: string; dot: string }> = {
  active:         { he: "מחפש/ת פעיל/ית",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  open:           { he: "פתוח/ה להצעות",     cls: "bg-sky-500/15 text-sky-300 border-sky-500/30",           dot: "bg-sky-400" },
  "not-looking":  { he: "לא מחפש/ת כרגע",    cls: "bg-white/8 text-white/40 border-white/15",               dot: "bg-white/30" },
};

const WORK_PREF: Record<WorkPref, { he: string }> = {
  remote:   { he: "מרחוק" },
  hybrid:   { he: "היברידי" },
  onsite:   { he: "פיזי" },
  flexible: { he: "גמיש" },
};

function buildAutoSummary({
  title, yoe, location, workPref, avail, he,
}: {
  title?: string; yoe?: number; location?: string; workPref?: WorkPref; avail?: Availability; he: boolean;
}): string | null {
  const parts: string[] = [];
  if (title) {
    parts.push(yoe !== undefined
      ? (he ? `${title} עם ${yoe} שנות ניסיון` : `${title} · ${yoe} yrs exp`)
      : title);
  } else if (yoe !== undefined) {
    parts.push(he ? `${yoe} שנות ניסיון` : `${yoe} yrs experience`);
  }
  if (location) parts.push(location);
  if (workPref) parts.push(he ? WORK_PREF[workPref].he : workPref);
  else if (avail === "active") parts.push(he ? "מחפש/ת פעיל/ית" : "actively searching");
  return parts.length ? parts.join(" · ") : null;
}

function merge<T>(userVal: T | undefined, scoutVal: T | undefined): T | undefined {
  return userVal !== undefined ? userVal : scoutVal;
}

function mergeArr(userArr: string[] | undefined, scoutArr: string[] | undefined): string[] {
  const combined = [...(userArr ?? []), ...(scoutArr ?? [])];
  return [...new Set(combined)];
}

export default function UserMetaCard({ meta, scoutData, onSave, he }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Merged display values
  const title         = merge(meta.title, scoutData.currentRole);
  const location      = merge(meta.location, scoutData.location);
  const yoe           = merge(meta.yearsExperience, scoutData.yearsExperience);
  const education     = merge(meta.education, scoutData.education);
  const skills        = mergeArr(meta.skills, scoutData.skills);
  const targetRoles   = mergeArr(meta.targetRoles, scoutData.targetRoles);
  const workPref      = merge(meta.workPreference, scoutData.workPreference as WorkPref | undefined);
  const languages     = mergeArr(meta.languages, scoutData.languages);
  const avail         = meta.availability;
  const hasAnyData    = title || location || yoe || education || skills.length || targetRoles.length;

  // Draft state for editing
  const [draft, setDraft] = useState<Partial<UserMeta>>({});
  const [skillInput, setSkillInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const skillRef = useRef<HTMLInputElement>(null);
  const roleRef  = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft({
      title:           meta.title ?? scoutData.currentRole ?? "",
      location:        meta.location ?? scoutData.location ?? "",
      yearsExperience: meta.yearsExperience ?? scoutData.yearsExperience,
      education:       meta.education ?? scoutData.education ?? "",
      skills:          skills,
      targetRoles:     targetRoles,
      workPreference:  meta.workPreference ?? (scoutData.workPreference as WorkPref | undefined),
      languages:       languages,
      bio:             meta.bio ?? "",
      linkedin:        meta.linkedin ?? "",
      availability:    meta.availability,
    });
    setSkillInput("");
    setRoleInput("");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    const patch: Partial<UserMeta> = {
      title:           (draft.title as string)?.trim() || undefined,
      location:        (draft.location as string)?.trim() || undefined,
      yearsExperience: draft.yearsExperience,
      education:       (draft.education as string)?.trim() || undefined,
      skills:          draft.skills,
      targetRoles:     draft.targetRoles,
      workPreference:  draft.workPreference,
      languages:       draft.languages,
      bio:             (draft.bio as string)?.trim() || undefined,
      linkedin:        (draft.linkedin as string)?.trim() || undefined,
      availability:    draft.availability,
    };
    await onSave(patch);
    setSaving(false);
    setEditing(false);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !(draft.skills ?? []).includes(s)) {
      setDraft((d) => ({ ...d, skills: [...(d.skills ?? []), s] }));
    }
    setSkillInput("");
    skillRef.current?.focus();
  }

  function addRole() {
    const r = roleInput.trim();
    if (r && !(draft.targetRoles ?? []).includes(r)) {
      setDraft((d) => ({ ...d, targetRoles: [...(d.targetRoles ?? []), r] }));
    }
    setRoleInput("");
    roleRef.current?.focus();
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  if (!editing) {
    return (
      <div className="rounded-3xl overflow-hidden bg-white/5 border border-white/10">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-white font-semibold">{he ? "הפרופיל המקצועי שלי" : "Professional Profile"}</h2>
          </div>
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition border border-purple-500/25 hover:border-purple-400/50 bg-purple-500/10 px-3 py-1.5 rounded-xl"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {he ? "ערוך" : "Edit"}
          </button>
        </div>

        {hasAnyData && (() => {
          const summary = buildAutoSummary({ title, yoe, location, workPref, avail, he });
          return summary ? (
            <div className="px-6 pb-2">
              <p className="text-white/50 text-sm leading-relaxed">{summary}</p>
            </div>
          ) : null;
        })()}

        {!hasAnyData ? (
          <div className="px-6 pb-6 py-4 text-center">
            <p className="text-white/40 text-sm">
              {he ? "עדיין אין מידע — " : "No data yet — "}
              <button onClick={startEdit} className="text-purple-400 hover:text-purple-300 transition">
                {he ? "הוסף פה" : "add here"}
              </button>
              {he ? " או " : " or "}
              <button
                onClick={() => { queueAutoStart("jobs"); router.push("/"); }}
                className="text-purple-400 hover:text-purple-300 transition">
                {he ? "צאי לחיפוש עם Scout" : "search with Scout"}
              </button>
            </p>
          </div>
        ) : (
          <div className="px-6 pb-6 space-y-4">
            {/* Top row: role + location + experience */}
            <div className="flex flex-wrap items-center gap-3">
              {title && (
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-base">{title}</span>
                </div>
              )}
              {location && (
                <span className="flex items-center gap-1 text-white/50 text-sm">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {location}
                </span>
              )}
              {yoe !== undefined && (
                <span className="text-xs font-medium bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-full">
                  {he ? `${yoe} שנות ניסיון` : `${yoe} yrs exp`}
                </span>
              )}
              {avail && (
                <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${AVAIL[avail].cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${AVAIL[avail].dot}`} />
                  {he ? AVAIL[avail].he : avail}
                </span>
              )}
            </div>

            {/* Bio */}
            {meta.bio && (
              <p className="text-white/60 text-sm leading-relaxed">{meta.bio}</p>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <p className="text-white/35 text-xs uppercase tracking-wide mb-2">{he ? "כישורים" : "Skills"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="text-xs bg-purple-500/15 border border-purple-500/25 text-purple-200 px-2.5 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Target roles */}
            {targetRoles.length > 0 && (
              <div>
                <p className="text-white/35 text-xs uppercase tracking-wide mb-2">{he ? "תפקידים מבוקשים" : "Target roles"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {targetRoles.map((r) => (
                    <span key={r} className="text-xs bg-emerald-500/12 border border-emerald-500/25 text-emerald-300 px-2.5 py-0.5 rounded-full">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom row: work pref + languages + education */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              {workPref && (
                <span className="text-white/45 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
                  </svg>
                  {he ? WORK_PREF[workPref].he : workPref}
                </span>
              )}
              {languages.length > 0 && (
                <span className="text-white/45 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {languages.join(", ")}
                </span>
              )}
              {education && (
                <span className="text-white/45 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {education}
                </span>
              )}
              {meta.linkedin && (
                <a href={meta.linkedin.startsWith("http") ? meta.linkedin : `https://${meta.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1.5 transition">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold">{he ? "עריכת פרופיל" : "Edit Profile"}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(false)} className="text-white/40 hover:text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 transition">
            {he ? "ביטול" : "Cancel"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5">
            {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
            {he ? "שמור" : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-4" dir={he ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={he ? "תפקיד נוכחי" : "Current role"}>
            <input value={(draft.title as string) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={he ? "מפתח/ת, מעצב/ת..." : "Developer, Designer..."}
              className={input} />
          </Field>
          <Field label={he ? "מיקום" : "Location"}>
            <input value={(draft.location as string) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              placeholder={he ? "תל אביב" : "Tel Aviv"}
              className={input} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={he ? "שנות ניסיון" : "Years of experience"}>
            <input type="number" min={0} max={50} value={draft.yearsExperience ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, yearsExperience: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="3" className={input} />
          </Field>
          <Field label={he ? "השכלה" : "Education"}>
            <input value={(draft.education as string) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, education: e.target.value }))}
              placeholder={he ? "ב.ס מדעי המחשב..." : "BSc Computer Science..."}
              className={input} />
          </Field>
        </div>

        {/* Availability */}
        <Field label={he ? "סטטוס חיפוש" : "Search status"}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(AVAIL) as Availability[]).map((key) => (
              <button key={key} type="button" onClick={() => setDraft((d) => ({ ...d, availability: key }))}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${draft.availability === key ? AVAIL[key].cls : "bg-white/5 border-white/12 text-white/40 hover:border-white/25"}`}>
                {he ? AVAIL[key].he : key}
              </button>
            ))}
          </div>
        </Field>

        {/* Work preference */}
        <Field label={he ? "העדפת עבודה" : "Work preference"}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WORK_PREF) as WorkPref[]).map((key) => (
              <button key={key} type="button" onClick={() => setDraft((d) => ({ ...d, workPreference: key }))}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${draft.workPreference === key ? "bg-sky-500/20 border-sky-500/40 text-sky-300" : "bg-white/5 border-white/12 text-white/40 hover:border-white/25"}`}>
                {he ? WORK_PREF[key].he : key}
              </button>
            ))}
          </div>
        </Field>

        {/* Skills */}
        <Field label={he ? "כישורים" : "Skills"}>
          <TagInput
            tags={draft.skills ?? []}
            inputVal={skillInput}
            inputRef={skillRef}
            onInputChange={setSkillInput}
            onAdd={addSkill}
            onRemove={(s) => setDraft((d) => ({ ...d, skills: (d.skills ?? []).filter((x) => x !== s) }))}
            onKey={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
              if (e.key === "Backspace" && !skillInput) setDraft((d) => ({ ...d, skills: d.skills?.slice(0, -1) }));
            }}
            placeholder={he ? "הוסף כישור + Enter" : "Add skill + Enter"}
            tagCls="bg-purple-500/20 border-purple-500/30 text-purple-300"
          />
        </Field>

        {/* Target roles */}
        <Field label={he ? "תפקידים מבוקשים" : "Target roles"}>
          <TagInput
            tags={draft.targetRoles ?? []}
            inputVal={roleInput}
            inputRef={roleRef}
            onInputChange={setRoleInput}
            onAdd={addRole}
            onRemove={(r) => setDraft((d) => ({ ...d, targetRoles: (d.targetRoles ?? []).filter((x) => x !== r) }))}
            onKey={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRole(); }
              if (e.key === "Backspace" && !roleInput) setDraft((d) => ({ ...d, targetRoles: d.targetRoles?.slice(0, -1) }));
            }}
            placeholder={he ? "הוסף תפקיד + Enter" : "Add role + Enter"}
            tagCls="bg-emerald-500/15 border-emerald-500/25 text-emerald-300"
          />
        </Field>

        {/* Bio */}
        <Field label={he ? "על עצמי" : "About me"}>
          <textarea rows={3} value={(draft.bio as string) ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
            placeholder={he ? "קצת על הרקע, המטרות שלך..." : "A bit about your background and goals..."}
            className={`${input} resize-none`} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="LinkedIn">
            <input value={(draft.linkedin as string) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, linkedin: e.target.value }))}
              placeholder="linkedin.com/in/..." className={input} />
          </Field>
          <Field label={he ? "שפות" : "Languages"}>
            <input value={(draft.languages as string[] | undefined)?.join(", ") ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              placeholder={he ? "עברית, אנגלית..." : "Hebrew, English..."} className={input} />
          </Field>
        </div>
      </div>
    </div>
  );
}

const input = "w-full bg-white/5 border border-white/12 focus:border-purple-500/60 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/40 text-xs mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

interface TagInputProps {
  tags: string[];
  inputVal: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (s: string) => void;
  onKey: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  tagCls: string;
}

function TagInput({ tags, inputVal, inputRef, onInputChange, onAdd, onRemove, onKey, placeholder, tagCls }: TagInputProps) {
  return (
    <div className="bg-white/5 border border-white/12 focus-within:border-purple-500/60 rounded-xl px-3.5 py-2.5 transition min-h-[44px] flex flex-wrap gap-1.5 items-center">
      {tags.map((s) => (
        <span key={s} className={`flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full ${tagCls}`}>
          {s}
          <button type="button" onClick={() => onRemove(s)} className="opacity-60 hover:opacity-100 transition leading-none">×</button>
        </span>
      ))}
      <input ref={inputRef} value={inputVal} onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKey} onBlur={onAdd}
        placeholder={tags.length ? "" : placeholder}
        className="flex-1 min-w-[120px] bg-transparent text-white text-xs placeholder-white/20 focus:outline-none" />
    </div>
  );
}
