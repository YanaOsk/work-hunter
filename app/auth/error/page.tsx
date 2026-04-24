"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const messages: Record<string, { title: string; desc: string }> = {
    Configuration: {
      title: "Authentication not configured",
      desc: "Google sign-in credentials are not set up yet. The site owner needs to add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment.",
    },
    AccessDenied: {
      title: "Access denied",
      desc: "You do not have permission to sign in.",
    },
    Verification: {
      title: "Link expired",
      desc: "The sign-in link has expired. Please try again.",
    },
    Default: {
      title: "Sign-in error",
      desc: "Something went wrong during sign-in. Please try again.",
    },
  };

  const msg = messages[error || ""] || messages.Default;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{msg.title}</h1>
        <p className="text-white/60 leading-relaxed mb-8">{msg.desc}</p>
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <Suspense fallback={<div className="min-h-[70vh]" />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
