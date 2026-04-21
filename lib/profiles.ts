import { UserProfile } from "./types";

export interface SavedProfile {
  id: string;
  name: string;
  savedAt: string;
  avatarUrl?: string; // future: Google/social photo URL
  profile: UserProfile;
}

const STORAGE_KEY = "work_hunter_profiles";

export function getSavedProfiles(): SavedProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProfile(profile: UserProfile): SavedProfile {
  const profiles = getSavedProfiles();
  const name = profile.parsedData?.name?.trim() || "משתמש";
  const existing = profiles.find((p) => p.name === name);

  const saved: SavedProfile = {
    id: existing?.id || Math.random().toString(36).substr(2, 9),
    name,
    savedAt: new Date().toISOString(),
    avatarUrl: existing?.avatarUrl,
    profile,
  };

  const updated = existing
    ? profiles.map((p) => (p.id === existing.id ? saved : p))
    : [...profiles, saved];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return saved;
}

export function deleteProfile(id: string): void {
  const profiles = getSavedProfiles().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-purple-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-pink-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-600",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(hash)];
}
