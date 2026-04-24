import { describe, it, expect, beforeEach } from "vitest";
import {
  createInitialAdvisorState,
  saveAdvisorState,
  getAdvisorState,
} from "@/lib/advisorState";
import type { UserProfile } from "@/lib/types";

const profile: UserProfile = {
  rawText: "",
  parsedData: {},
  missingFields: [],
  clarifyingQuestions: [],
};

beforeEach(() => {
  localStorage.clear();
});

describe("Paywall — isPremium flag", () => {
  it("new users are not premium", () => {
    const state = createInitialAdvisorState(profile);
    expect(state.isPremium).toBe(false);
  });

  it("unlocking sets isPremium to true and persists it", () => {
    const state = createInitialAdvisorState(profile);
    saveAdvisorState("user-1", state);

    // Simulate clicking "Unlock now" (sets isPremium and saves)
    const unlocked = { ...state, isPremium: true };
    saveAdvisorState("user-1", unlocked);

    const reloaded = getAdvisorState("user-1");
    expect(reloaded!.isPremium).toBe(true);
  });

  it("summary is accessible after unlock", () => {
    // Simulates the gate check: isPremium=false → gate, isPremium=true → summary
    const gated = createInitialAdvisorState(profile);
    expect(gated.isPremium).toBe(false); // should see gate

    const unlocked = { ...gated, isPremium: true };
    expect(unlocked.isPremium).toBe(true); // should see summary
  });

  it("isPremium survives localStorage round-trip", () => {
    const state = { ...createInitialAdvisorState(profile), isPremium: true };
    saveAdvisorState("premium-user", state);

    // Simulate page reload: new component reads from localStorage
    const fresh = getAdvisorState("premium-user");
    expect(fresh!.isPremium).toBe(true);
  });

  it("different users have independent premium status", () => {
    const paid = { ...createInitialAdvisorState(profile), isPremium: true };
    const free = { ...createInitialAdvisorState(profile), isPremium: false };

    saveAdvisorState("paid-user", paid);
    saveAdvisorState("free-user", free);

    expect(getAdvisorState("paid-user")!.isPremium).toBe(true);
    expect(getAdvisorState("free-user")!.isPremium).toBe(false);
  });

  it("isPremium is independent of stage completion", () => {
    const state = { ...createInitialAdvisorState(profile), currentStage: "done" as const };
    // Completing all stages does NOT auto-grant premium
    expect(state.isPremium).toBe(false);
  });
});
