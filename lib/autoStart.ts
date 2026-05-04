import type { AppMode } from "./types";

const AUTO_START_KEY = "wh_auto_start";
const ADVISOR_CTX_KEY = "wh_advisor_ctx";

export function queueAutoStart(mode: AppMode): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTO_START_KEY, mode);
  }
}

export function consumeAutoStart(): AppMode | null {
  if (typeof window === "undefined") return null;
  const m = sessionStorage.getItem(AUTO_START_KEY) as AppMode | null;
  if (m) sessionStorage.removeItem(AUTO_START_KEY);
  return m;
}

export function queueAdvisorScoutContext(ctx: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ADVISOR_CTX_KEY, ctx);
  }
}

export function consumeAdvisorScoutContext(): string | null {
  if (typeof window === "undefined") return null;
  const c = sessionStorage.getItem(ADVISOR_CTX_KEY);
  if (c) sessionStorage.removeItem(ADVISOR_CTX_KEY);
  return c;
}
