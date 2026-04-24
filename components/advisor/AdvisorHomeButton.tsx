"use client";

import Link from "next/link";

export default function AdvisorHomeButton() {
  return (
    <Link
      href="/"
      className="fixed bottom-5 end-5 z-50 w-11 h-11 rounded-full bg-slate-800 border border-white/15 shadow-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-slate-700 transition-all hover:scale-110"
      title="חזרה לדף הבית"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </Link>
  );
}
