import type { AppMode } from "./types";

let _pending: AppMode | null = null;
let _advisorCtx: string | null = null;

export function queueAutoStart(mode: AppMode): void {
  _pending = mode;
}

export function consumeAutoStart(): AppMode | null {
  const m = _pending;
  _pending = null;
  return m;
}

export function queueAdvisorScoutContext(ctx: string): void {
  _advisorCtx = ctx;
}

export function consumeAdvisorScoutContext(): string | null {
  const c = _advisorCtx;
  _advisorCtx = null;
  return c;
}
