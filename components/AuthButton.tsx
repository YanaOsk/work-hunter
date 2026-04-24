"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const { lang } = useLanguage();
  const tx = t[lang];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // During loading render the same sign-in button shape so layout never shifts
  if (status === "loading") {
    return (
      <div className="h-9 w-[84px] rounded-lg border border-white/10 bg-white/5 animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full hover:bg-white/10 ps-1 pe-2 py-1 transition"
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || ""}
              width={30}
              height={30}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <span className="text-white/80 text-sm hidden sm:block max-w-[100px] truncate">
            {session.user.name?.split(" ")[0]}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-white/40 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute end-0 top-full mt-2 w-60 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={38}
                  height={38}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-[38px] h-[38px] rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {session.user.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{session.user.name}</p>
                <p className="text-white/50 text-xs truncate">{session.user.email}</p>
              </div>
            </div>

            <div className="p-1.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="w-full text-start px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-sm transition flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {lang === "he" ? "הפרופיל שלי" : "My profile"}
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-start px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-sm transition flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {tx.signOut}
              </button>
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
