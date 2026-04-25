import crypto from "crypto";
import { sql } from "./db";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

export async function createUser(
  name: string,
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const db = sql();
  const lowerEmail = email.toLowerCase();

  const existing = await db`SELECT id FROM users WHERE email = ${lowerEmail}`;
  if (existing.length > 0) return null;

  const salt = crypto.randomBytes(16).toString("hex");
  const id = crypto.randomUUID();
  await db`
    INSERT INTO users (id, name, email, password_hash, salt, created_at)
    VALUES (${id}, ${name}, ${lowerEmail}, ${hashPassword(password, salt)}, ${salt}, ${new Date().toISOString()})
  `;
  return { id, name, email: lowerEmail };
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const db = sql();
  const rows = await db`SELECT id, name, email, password_hash, salt FROM users WHERE email = ${email.toLowerCase()}`;
  if (rows.length === 0) return null;
  const user = rows[0];
  if (hashPassword(password, user.salt) !== user.password_hash) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function getAllUsers(): Promise<
  { id: string; name: string; email: string; createdAt: string }[]
> {
  const db = sql();
  const rows = await db`SELECT id, name, email, created_at FROM users ORDER BY created_at DESC`;
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at }));
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = sql();
  const rows = await db`DELETE FROM users WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
