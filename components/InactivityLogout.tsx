"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;

export default function InactivityLogout() {
  const { status } = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: "/auth/signin" });
      }, TIMEOUT_MS);
    }

    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [status]);

  return null;
}
