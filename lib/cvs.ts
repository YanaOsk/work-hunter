import crypto from "crypto";
import { sql } from "./db";
import { CvData, EMPTY_CV } from "./cvBuilder";

export interface SavedCv {
  id: string;
  userId: string;
  name: string;
  data: CvData;
  createdAt: string;
  updatedAt: string;
}

export type CvMeta = Omit<SavedCv, "data">;

export async function listUserCvs(userId: string): Promise<CvMeta[]> {
  const db = sql();
  const rows = await db`
    SELECT id, user_id, name, created_at, updated_at
    FROM cvs WHERE user_id = ${userId} ORDER BY updated_at DESC
  `;
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getUserCv(userId: string, cvId: string): Promise<SavedCv | null> {
  const db = sql();
  const rows = await db`
    SELECT id, user_id, name, data, created_at, updated_at
    FROM cvs WHERE id = ${cvId} AND user_id = ${userId}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    data: r.data as CvData,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function createUserCv(
  userId: string,
  name: string,
  data: CvData,
): Promise<SavedCv> {
  const db = sql();
  const now = new Date().toISOString();
  const cv: SavedCv = {
    id: crypto.randomUUID(),
    userId,
    name: name || "קורות חיים",
    data: { ...EMPTY_CV, ...data },
    createdAt: now,
    updatedAt: now,
  };
  await db`
    INSERT INTO cvs (id, user_id, name, data, created_at, updated_at)
    VALUES (${cv.id}, ${cv.userId}, ${cv.name}, ${JSON.stringify(cv.data)}, ${cv.createdAt}, ${cv.updatedAt})
  `;
  return cv;
}

export async function updateUserCv(
  userId: string,
  cvId: string,
  updates: { name?: string; data?: CvData },
): Promise<SavedCv | null> {
  const db = sql();
  const now = new Date().toISOString();

  const rows = await db`
    UPDATE cvs SET
      name = COALESCE(${updates.name ?? null}, name),
      data = COALESCE(${updates.data ? JSON.stringify(updates.data) : null}::jsonb, data),
      updated_at = ${now}
    WHERE id = ${cvId} AND user_id = ${userId}
    RETURNING id, user_id, name, data, created_at, updated_at
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    data: r.data as CvData,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function deleteUserCv(userId: string, cvId: string): Promise<boolean> {
  const db = sql();
  const result = await db`DELETE FROM cvs WHERE id = ${cvId} AND user_id = ${userId}`;
  return (result as unknown as { count: number }).count > 0;
}
