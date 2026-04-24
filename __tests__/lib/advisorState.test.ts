import { describe, it, expect, beforeEach } from "vitest";
import {
  advanceStage,
  createInitialAdvisorState,
  getAdvisorState,
  saveAdvisorState,
  clearAdvisorState,
  migrateGuestToUser,
} from "@/lib/advisorState";
import type { UserProfile } from "@/lib/types";
import { STAGE_ORDER } from "@/lib/types";

const emptyProfile: UserProfile = {
  rawText: "",
  parsedData: {},
  missingFields: [],
  clarifyingQuestions: [],
};

beforeEach(() => {
  localStorage.clear();
});

// --- advanceStage ---
describe("advanceStage", () => {
  it("advances from first to second stage", () => {
    expect(advanceStage("diagnosis")).toBe("direction");
  });

  it("advances through all stages in order", () => {
    STAGE_ORDER.slice(0, -1).forEach((stage, i) => {
      expect(advanceStage(stage)).toBe(STAGE_ORDER[i + 1]);
    });
  });

  it("returns done after the last stage", () => {
    const last = STAGE_ORDER[STAGE_ORDER.length - 1];
    expect(advanceStage(last)).toBe("done");
  });

  it("returns done for unknown stage", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(advanceStage("nonexistent" as any)).toBe("done");
  });
});

// --- createInitialAdvisorState ---
describe("createInitialAdvisorState", () => {
  it("starts at diagnosis stage", () => {
    const state = createInitialAdvisorState(emptyProfile);
    expect(state.currentStage).toBe("diagnosis");
  });

  it("sets isPremium to false", () => {
    const state = createInitialAdvisorState(emptyProfile);
    expect(state.isPremium).toBe(false);
  });

  it("has no completed stages", () => {
    const state = createInitialAdvisorState(emptyProfile);
    expect(state.diagnosis).toBeNull();
    expect(state.direction).toBeNull();
    expect(state.cvReview).toBeNull();
    expect(state.strategy).toBeNull();
  });

  it("stores the given profile", () => {
    const profile: UserProfile = { rawText: "test", parsedData: { name: "Yana" }, missingFields: [], clarifyingQuestions: [] };
    const state = createInitialAdvisorState(profile);
    expect(state.userProfile.parsedData.name).toBe("Yana");
  });
});

// --- localStorage CRUD ---
describe("saveAdvisorState / getAdvisorState / clearAdvisorState", () => {
  it("returns null for unknown profileId", () => {
    expect(getAdvisorState("unknown-user")).toBeNull();
  });

  it("persists and retrieves state", () => {
    const state = createInitialAdvisorState(emptyProfile);
    saveAdvisorState("user-1", state);
    const loaded = getAdvisorState("user-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.currentStage).toBe("diagnosis");
  });

  it("persists isPremium flag", () => {
    const state = { ...createInitialAdvisorState(emptyProfile), isPremium: true };
    saveAdvisorState("user-2", state);
    const loaded = getAdvisorState("user-2");
    expect(loaded!.isPremium).toBe(true);
  });

  it("clears state correctly", () => {
    const state = createInitialAdvisorState(emptyProfile);
    saveAdvisorState("user-3", state);
    clearAdvisorState("user-3");
    expect(getAdvisorState("user-3")).toBeNull();
  });

  it("different profileIds are isolated", () => {
    const s1 = { ...createInitialAdvisorState(emptyProfile), isPremium: false };
    const s2 = { ...createInitialAdvisorState(emptyProfile), isPremium: true };
    saveAdvisorState("user-a", s1);
    saveAdvisorState("user-b", s2);
    expect(getAdvisorState("user-a")!.isPremium).toBe(false);
    expect(getAdvisorState("user-b")!.isPremium).toBe(true);
  });
});

// --- migrateGuestToUser ---
describe("migrateGuestToUser", () => {
  it("copies guest state to user key", () => {
    const guestState = createInitialAdvisorState(emptyProfile);
    saveAdvisorState("guest-123", guestState);
    migrateGuestToUser("guest-123", "google-user-456");
    expect(getAdvisorState("google-user-456")).not.toBeNull();
  });

  it("removes guest key after migration", () => {
    const guestState = createInitialAdvisorState(emptyProfile);
    saveAdvisorState("guest-abc", guestState);
    migrateGuestToUser("guest-abc", "google-user-xyz");
    expect(getAdvisorState("guest-abc")).toBeNull();
  });

  it("does not overwrite existing user state", () => {
    const userState = { ...createInitialAdvisorState(emptyProfile), isPremium: true };
    const guestState = { ...createInitialAdvisorState(emptyProfile), isPremium: false };
    saveAdvisorState("user-existing", userState);
    saveAdvisorState("guest-xyz", guestState);
    migrateGuestToUser("guest-xyz", "user-existing");
    // User state should be preserved
    expect(getAdvisorState("user-existing")!.isPremium).toBe(true);
  });

  it("handles missing guest state gracefully", () => {
    expect(() => migrateGuestToUser("nonexistent-guest", "some-user")).not.toThrow();
  });
});
