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
  { id: string; name: string; email: string; createdAt: string; provider: string }[]
> {
  const db = sql();
  const [emailRows, googleRows] = await Promise.all([
    db`SELECT id, name, email, created_at FROM users ORDER BY created_at DESC`,
    db`SELECT email AS id, name, email, created_at FROM google_accounts ORDER BY created_at DESC`,
  ]);

  const seen = new Set<string>();
  const merged = [
    ...emailRows.map((r) => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at, provider: "email" })),
    ...googleRows.map((r) => ({ id: r.id, name: r.name, email: r.email, createdAt: r.created_at, provider: "google" })),
  ].filter((u) => {
    if (seen.has(u.email)) return false;
    seen.add(u.email);
    return true;
  });

  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = sql();
  // Email-based user: id is a UUID
  const emailRows = await db`DELETE FROM users WHERE id = ${id} RETURNING id`;
  if (emailRows.length > 0) return true;
  // Google user: id is the email address
  const googleRows = await db`DELETE FROM google_accounts WHERE email = ${id} RETURNING email`;
  return googleRows.length > 0;
}

async function ensureResetTokensTable() {
  const db = sql();
  await db`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
  )`;
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const db = sql();
  const rows = await db`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
  if (rows.length === 0) return null;
  await ensureResetTokensTable();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db`DELETE FROM password_reset_tokens WHERE email = ${email.toLowerCase()}`;
  await db`INSERT INTO password_reset_tokens (token, email, expires_at) VALUES (${token}, ${email.toLowerCase()}, ${expiresAt.toISOString()})`;
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  await ensureResetTokensTable();
  const db = sql();
  const rows = await db`SELECT email, expires_at FROM password_reset_tokens WHERE token = ${token}`;
  if (rows.length === 0) return null;
  const { email, expires_at } = rows[0];
  await db`DELETE FROM password_reset_tokens WHERE token = ${token}`;
  if (new Date(expires_at) < new Date()) return null;
  return email as string;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  const db = sql();
  const salt = crypto.randomBytes(16).toString("hex");
  const rows = await db`UPDATE users SET password_hash = ${hashPassword(newPassword, salt)}, salt = ${salt} WHERE email = ${email.toLowerCase()} RETURNING id`;
  return rows.length > 0;
}
