import crypto from "crypto";
import { getDb } from "./mongodb";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

async function col() {
  const db = await getDb();
  return db.collection<StoredUser>("users");
}

export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const c = await col();
  const exists = await c.findOne({ email: email.toLowerCase() });
  if (exists) return null;

  const salt = crypto.randomBytes(16).toString("hex");
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  await c.insertOne(user);
  return { id: user.id, name: user.name, email: user.email };
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const c = await col();
  const user = await c.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  if (hashPassword(password, user.salt) !== user.passwordHash) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function getAllUsers(): Promise<
  { id: string; name: string; email: string; createdAt: string }[]
> {
  const c = await col();
  return c
    .find({}, { projection: { _id: 0, id: 1, name: 1, email: 1, createdAt: 1 } })
    .toArray() as Promise<{ id: string; name: string; email: string; createdAt: string }[]>;
}

export async function deleteUser(id: string): Promise<boolean> {
  const c = await col();
  const result = await c.deleteOne({ id });
  return result.deletedCount > 0;
}
