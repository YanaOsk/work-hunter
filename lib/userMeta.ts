import { sql } from "./db";

export type Availability = "active" | "open" | "not-looking";
export type WorkPref   = "remote" | "hybrid" | "onsite" | "flexible";

export interface UserMeta {
  email: string;
  title?: string;
  location?: string;
  yearsExperience?: number;
  education?: string;
  skills?: string[];
  targetRoles?: string[];
  workPreference?: WorkPref;
  languages?: string[];
  bio?: string;
  volunteering?: string;
  linkedin?: string;
  availability?: Availability;
  profileImage?: string;
  advisorCurrentStage?: string;
  advisorCompletedCount?: number;
  advisorState?: string;
  updatedAt?: string;
}

export async function getUserMeta(email: string): Promise<UserMeta | null> {
  const db = sql();
  const rows = await db`
    SELECT * FROM user_meta WHERE email = ${email.toLowerCase()}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    email: r.email,
    title: r.title ?? undefined,
    location: r.location ?? undefined,
    yearsExperience: r.years_experience ?? undefined,
    education: r.education ?? undefined,
    skills: r.skills ?? undefined,
    targetRoles: r.target_roles ?? undefined,
    workPreference: r.work_preference ?? undefined,
    languages: r.languages ?? undefined,
    bio: r.bio ?? undefined,
    linkedin: r.linkedin ?? undefined,
    availability: r.availability ?? undefined,
    volunteering: r.volunteering ?? undefined,
    profileImage: r.profile_image ?? undefined,
    advisorCurrentStage: r.advisor_current_stage ?? undefined,
    advisorCompletedCount: r.advisor_completed_count ?? undefined,
    advisorState: r.advisor_state ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function saveUserMeta(email: string, data: Partial<Omit<UserMeta, "email">>): Promise<void> {
  const db = sql();
  const lowerEmail = email.toLowerCase();
  const now = new Date().toISOString();
  await db`ALTER TABLE user_meta ADD COLUMN IF NOT EXISTS advisor_state TEXT`;
  await db`ALTER TABLE user_meta ADD COLUMN IF NOT EXISTS volunteering TEXT`;
  await db`
    INSERT INTO user_meta (
      email, title, location, years_experience, education, skills, target_roles,
      work_preference, languages, bio, volunteering, linkedin, availability, profile_image,
      advisor_current_stage, advisor_completed_count, advisor_state, updated_at
    ) VALUES (
      ${lowerEmail},
      ${data.title ?? null}, ${data.location ?? null}, ${data.yearsExperience ?? null},
      ${data.education ?? null}, ${data.skills ?? null}, ${data.targetRoles ?? null},
      ${data.workPreference ?? null}, ${data.languages ?? null}, ${data.bio ?? null},
      ${data.volunteering ?? null}, ${data.linkedin ?? null}, ${data.availability ?? null},
      ${data.profileImage ?? null},
      ${data.advisorCurrentStage ?? null}, ${data.advisorCompletedCount ?? null},
      ${data.advisorState ?? null}, ${now}
    )
    ON CONFLICT (email) DO UPDATE SET
      title = COALESCE(EXCLUDED.title, user_meta.title),
      location = COALESCE(EXCLUDED.location, user_meta.location),
      years_experience = COALESCE(EXCLUDED.years_experience, user_meta.years_experience),
      education = COALESCE(EXCLUDED.education, user_meta.education),
      skills = COALESCE(EXCLUDED.skills, user_meta.skills),
      target_roles = COALESCE(EXCLUDED.target_roles, user_meta.target_roles),
      work_preference = COALESCE(EXCLUDED.work_preference, user_meta.work_preference),
      languages = COALESCE(EXCLUDED.languages, user_meta.languages),
      bio = COALESCE(EXCLUDED.bio, user_meta.bio),
      volunteering = COALESCE(EXCLUDED.volunteering, user_meta.volunteering),
      linkedin = COALESCE(EXCLUDED.linkedin, user_meta.linkedin),
      availability = COALESCE(EXCLUDED.availability, user_meta.availability),
      profile_image = COALESCE(EXCLUDED.profile_image, user_meta.profile_image),
      advisor_current_stage = COALESCE(EXCLUDED.advisor_current_stage, user_meta.advisor_current_stage),
      advisor_completed_count = COALESCE(EXCLUDED.advisor_completed_count, user_meta.advisor_completed_count),
      advisor_state = COALESCE(EXCLUDED.advisor_state, user_meta.advisor_state),
      updated_at = EXCLUDED.updated_at
  `;
}
