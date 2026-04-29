"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { ltrSpan } from "@/lib/rtl";

function MenuItem({
  href,
  onClick,
  icon,
  children,
  danger = false,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  const cls = `w-full text-start px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-2.5 ${
    danger
      ? "text-red-400/80 hover:text-red-300 hover:bg-red-500/10"
      : "text-white/70 hover:text-white hover:bg-white/5"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {children}
    </button>
  );
}

const PLAN_BADGE: Record<string, { label: { he: string; en: string }; cls: string }> = {
  weekly:     { label: { he: "שבועי",       en: "Weekly"       }, cls: "text-sky-300 bg-sky-500/15 border-sky-500/30" },
  "one-time": { label: { he: "Career Boost", en: "Career Boost" }, cls: "text-purple-300 bg-purple-500/15 border-purple-500/30" },
  full:       { label: { he: "מסע מלא",     en: "Full Journey"  }, cls: "text-purple-300 bg-purple-500/15 border-purple-500/30" },
  pro:        { label: { he: "Pro",          en: "Pro"           }, cls: "text-amber-300 bg-amber-500/15 border-amber-500/30" },
};

export default function AuthButton({ plan = "free" }: { plan?: string }) {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const planBadge = PLAN_BADGE[plan] ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user-meta")
      .then((r) => r.json())
      .then((d) => { if (d?.profileImage) setProfileImage(d.profileImage); })
      .catch(() => {});
  }, [session?.user]);

  // Skeleton that exactly matches the logged-in avatar button dimensions
  // so there is zero layout shift when the session resolves.
  if (status === "loading") {
    return (
      <div
        className="flex items-center gap-2 rounded-full ps-1 pe-2 py-1 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="w-[30px] h-[30px] rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="h-3.5 w-14 bg-white/10 animate-pulse rounded-full hidden sm:block" />
        <div className="w-3.5 h-3.5 bg-white/10 animate-pulse rounded-sm flex-shrink-0" />
      </div>
    );
  }

  if (session?.user) {
    const user = session.user;
    const initials = user.name?.charAt(0).toUpperCase() || "?";
    const displayImage = profileImage ?? user.image ?? null;

    return (
      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full hover:bg-white/10 ps-1 pe-2 py-1 transition"
        >
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt={user.name || ""}
              className="w-[30px] h-[30px] rounded-full flex-shrink-0 object-cover"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials}
            </div>
          )}
          <span className="text-white/80 text-sm hidden sm:block max-w-[100px] truncate">
            {user.name?.split(" ")[0]}
          </span>
          {planBadge && (
            <svg className={`w-3 h-3 flex-shrink-0 ${planBadge.cls.split(" ")[0]}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
          <svg
            className={`w-3.5 h-3.5 text-white/40 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute end-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt="" className="w-[38px] h-[38px] rounded-full flex-shrink-0 object-cover" />
              ) : (
                <div className="w-[38px] h-[38px] rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-white/50 text-xs truncate">{user.email ? ltrSpan(user.email) : null}</p>
                {planBadge && (
                  <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${planBadge.cls}`}>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {he ? planBadge.label.he : planBadge.label.en}
                  </span>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              <MenuItem
                href="/profile"
                onClick={() => setOpen(false)}
                icon={
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                {he ? "הפרופיל שלי" : "My profile"}
              </MenuItem>

              <MenuItem
                href="/subscription"
                onClick={() => setOpen(false)}
                icon={
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
              >
                {he ? "המנוי שלי" : "My subscription"}
              </MenuItem>

              {/* Divider */}
              <div className="h-px bg-white/10 my-1 mx-1" />

              <MenuItem
                danger
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                icon={
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                {tx.signOut}
              </MenuItem>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="h-9 inline-flex items-center px-4 text-sm font-medium text-white/80 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition"
    >
      {tx.signIn}
    </Link>
  );
}
