"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  try {
    let sid = localStorage.getItem("wh_sid");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("wh_sid", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

function checkNewSession(): boolean {
  try {
    const key = "wh_sess_ts";
    const last = localStorage.getItem(key);
    localStorage.setItem(key, Date.now().toString());
    return !last || Date.now() - parseInt(last) > 30 * 60_000;
  } catch {
    return false;
  }
}

async function send(payload: object) {
  try {
    navigator.sendBeacon
      ? navigator.sendBeacon("/api/track", JSON.stringify(payload))
      : await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  } catch {}
}

export function trackEvent(event: string, label?: string) {
  if (typeof window === "undefined") return;
  send({
    type: "event",
    path: window.location.pathname,
    event,
    label: label?.slice(0, 80),
    sessionId: getSessionId(),
  });
}

// Skip these paths from click tracking (too noisy)
const SKIP_LABELS = new Set(["", "←", "→", "✓", "✗", "...", "×", "☰"]);

export default function TrackingProvider() {
  const pathname = usePathname();
  const lastPath = useRef("");

  // Page view tracking
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sid = getSessionId();
    const isNewSession = checkNewSession();

    send({
      type: "pageview",
      path: pathname,
      sessionId: sid,
      referrer: document.referrer || null,
      isNewSession,
    });
  }, [pathname]);

  // Global click event tracking
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Element;

      // data-track attribute: explicit tracking
      const tracked = target.closest("[data-track]");
      if (tracked) {
        const ev = tracked.getAttribute("data-track") ?? "click";
        const lbl = tracked.getAttribute("data-track-label") || tracked.textContent?.trim().slice(0, 80);
        trackEvent(ev, lbl);
        return;
      }

      // Auto-track button clicks
      const btn = target.closest("button");
      if (!btn) return;
      const label = btn.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "";
      if (SKIP_LABELS.has(label)) return;

      // Include page context
      trackEvent("button_click", `[${pathname}] ${label}`);
    }

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
