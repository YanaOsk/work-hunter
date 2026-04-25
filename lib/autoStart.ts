import type { AppMode } from "./types";

let _pending: AppMode | null = null;

export function queueAutoStart(mode: AppMode): void {
  _pending = mode;
}

export function consumeAutoStart(): AppMode | null {
  const m = _pending;
  _pending = null;
  return m;
}
