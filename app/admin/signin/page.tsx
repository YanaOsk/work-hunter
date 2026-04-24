"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function AdminSignInContent() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 mb-5">
            <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-white/35 text-sm mt-1">Work Hunter</p>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          {error === "AccessDenied" && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-300 text-sm text-center">
              אין לך הרשאות גישה לאדמין.
            </div>
          )}
          {error && error !== "AccessDenied" && (
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-5 text-rose-300 text-sm text-center">
              שגיאה בהתחברות. נסי שוב.
            </div>
          )}

          <a
            href="/api/admin/auth/signin/google?callbackUrl=/admin"
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold px-5 py-3.5 rounded-xl transition shadow-sm"
          >
            <GoogleIcon />
            Sign in with Google
          </a>

          <p className="text-white/20 text-xs text-center mt-4">
            גישה מוגבלת לאדמין בלבד
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AdminSignInContent />
    </Suspense>
  );
}
