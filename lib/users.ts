import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

function readUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}

export function createUser(
  name: string,
  email: string,
  password: string,
): { id: string; name: string; email: string } | null {
  const users = readUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return null;

  const salt = crypto.randomBytes(16).toString("hex");
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password, salt),
    salt,
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return { id: user.id, name: user.name, email: user.email };
}

export function getAllUsers(): { id: string; name: string; email: string; createdAt: string }[] {
  return readUsers().map(({ id, name, email, createdAt }) => ({ id, name, email, createdAt }));
}

export function deleteUser(id: string): boolean {
  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  writeUsers(filtered);
  return true;
}

export function verifyUser(
  email: string,
  password: string,
): { id: string; name: string; email: string } | null {
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  if (hashPassword(password, user.salt) !== user.passwordHash) return null;
  return { id: user.id, name: user.name, email: user.email };
}
