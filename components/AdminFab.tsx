"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

export default function AdminFab() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;

  return (
    <Link
      href="/admin"
      title="Admin Panel"
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-purple-500/40 flex items-center justify-center shadow-lg transition-all group"
    >
      <svg className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </Link>
  );
}
