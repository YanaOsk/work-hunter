import crypto from "crypto";
import { getDb } from "./mongodb";
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

async function col() {
  const db = await getDb();
  return db.collection<SavedCv>("cvs");
}

export async function listUserCvs(userId: string): Promise<CvMeta[]> {
  const c = await col();
  return c
    .find(
      { userId },
      { projection: { _id: 0, id: 1, userId: 1, name: 1, createdAt: 1, updatedAt: 1 } },
    )
    .sort({ updatedAt: -1 })
    .toArray() as Promise<CvMeta[]>;
}

export async function getUserCv(userId: string, cvId: string): Promise<SavedCv | null> {
  const c = await col();
  const doc = await c.findOne({ id: cvId, userId }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function createUserCv(
  userId: string,
  name: string,
  data: CvData,
): Promise<SavedCv> {
  const c = await col();
  const now = new Date().toISOString();
  const cv: SavedCv = {
    id: crypto.randomUUID(),
    userId,
    name: name || "קורות חיים",
    data: { ...EMPTY_CV, ...data },
    createdAt: now,
    updatedAt: now,
  };
  await c.insertOne(cv);
  return cv;
}

export async function updateUserCv(
  userId: string,
  cvId: string,
  updates: { name?: string; data?: CvData },
): Promise<SavedCv | null> {
  const c = await col();
  const now = new Date().toISOString();
  const result = await c.findOneAndUpdate(
    { id: cvId, userId },
    { $set: { ...updates, updatedAt: now } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return result ?? null;
}

export async function deleteUserCv(userId: string, cvId: string): Promise<boolean> {
  const c = await col();
  const result = await c.deleteOne({ id: cvId, userId });
  return result.deletedCount > 0;
}
