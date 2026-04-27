import { AdvisorStage, AdvisorState, STAGE_ORDER, UserProfile } from "./types";

const STORAGE_KEY = "work_hunter_advisor";
export const DEFAULT_ADVISOR_ID = "default-advisor";

export function getAdvisorState(profileId: string): AdvisorState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${profileId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdvisorState>;
    return {
      userProfile: parsed.userProfile!,
      introDismissed: parsed.introDismissed ?? false,
      selfIntroCompleted: parsed.selfIntroCompleted ?? false,
      chatMessageCount: parsed.chatMessageCount ?? 0,
      isPremium: parsed.isPremium ?? false,
      currentStage: parsed.currentStage ?? "diagnosis",
      diagnosis: parsed.diagnosis ?? null,
      direction: parsed.direction ?? null,
      chosenPath: parsed.chosenPath ?? null,
      cvSkipped: parsed.cvSkipped ?? false,
      cvReview: parsed.cvReview ?? null,
      strategy: parsed.strategy ?? null,
      mockInterview: parsed.mockInterview ?? null,
      chatMessages: parsed.chatMessages ?? [],
    };
  } catch {
    return null;
  }
}

export function saveAdvisorState(profileId: string, state: AdvisorState): void {
  localStorage.setItem(`${STORAGE_KEY}_${profileId}`, JSON.stringify(state));
}

export function createInitialAdvisorState(profile: UserProfile): AdvisorState {
  return {
    userProfile: profile,
    introDismissed: false,
    selfIntroCompleted: false,
    chatMessageCount: 0,
    isPremium: false,
    currentStage: "diagnosis",
    diagnosis: null,
    direction: null,
    chosenPath: null,
    cvSkipped: false,
    cvReview: null,
    strategy: null,
    mockInterview: null,
    chatMessages: [],
  };
}

export function advanceStage(current: AdvisorStage): AdvisorStage {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return "done";
  return STAGE_ORDER[idx + 1];
}

export function getOrCreateAdvisorState(
  profileId: string,
  fallbackProfile: UserProfile
): AdvisorState {
  const existing = getAdvisorState(profileId);
  if (existing) return existing;
  const fresh = createInitialAdvisorState(fallbackProfile);
  saveAdvisorState(profileId, fresh);
  return fresh;
}

export function clearAdvisorState(profileId: string): void {
  localStorage.removeItem(`${STORAGE_KEY}_${profileId}`);
}

// ── Archive ──────────────────────────────────────────────────────────────────

export interface ArchivedAdvisorSession {
  id: string;
  archivedAt: string;
  snapshot: AdvisorState;
}

const ARCHIVE_KEY = "work_hunter_advisor_archive";

export function getAdvisorArchive(profileId: string): ArchivedAdvisorSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${ARCHIVE_KEY}_${profileId}`);
    if (!raw) return [];
    return JSON.parse(raw) as ArchivedAdvisorSession[];
  } catch {
    return [];
  }
}

export function archiveAdvisorState(profileId: string): void {
  if (typeof window === "undefined") return;
  const current = getAdvisorState(profileId);
  if (!current) return;
  const archive = getAdvisorArchive(profileId);
  archive.unshift({
    id: `${Date.now()}`,
    archivedAt: new Date().toISOString(),
    snapshot: current,
  });
  // Keep at most 10 past sessions
  localStorage.setItem(`${ARCHIVE_KEY}_${profileId}`, JSON.stringify(archive.slice(0, 10)));
  clearAdvisorState(profileId);
}

export function migrateGuestToUser(guestId: string, userId: string): void {
  if (typeof window === "undefined") return;
  const userKey = `${STORAGE_KEY}_${userId}`;
  const guestKey = `${STORAGE_KEY}_${guestId}`;
  if (localStorage.getItem(userKey)) return; // user already has their own state
  const guestRaw = localStorage.getItem(guestKey);
  if (!guestRaw) return;
  localStorage.setItem(userKey, guestRaw);
  localStorage.removeItem(guestKey);
}
