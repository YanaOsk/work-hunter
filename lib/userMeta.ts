import { getDb } from "./mongodb";

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
  linkedin?: string;
  availability?: Availability;
  profileImage?: string;
  advisorCurrentStage?: string;
  advisorCompletedCount?: number;
  updatedAt?: string;
}

async function col() {
  const db = await getDb();
  return db.collection<UserMeta>("user_meta");
}

export async function getUserMeta(email: string): Promise<UserMeta | null> {
  const c = await col();
  const doc = await c.findOne({ email: email.toLowerCase() }, { projection: { _id: 0 } });
  return doc as unknown as UserMeta | null;
}

export async function saveUserMeta(email: string, data: Partial<Omit<UserMeta, "email">>): Promise<void> {
  const c = await col();
  await c.updateOne(
    { email: email.toLowerCase() },
    { $set: { ...data, email: email.toLowerCase(), updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
}
