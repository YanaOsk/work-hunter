"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WelcomeModal from "@/components/WelcomeModal";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "modal" | "redirecting">("loading");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    const email = session?.user?.email ?? "";
    const isNewUser = session?.user?.isNewUser;

    // isNewUser is set by the JWT callback only on first Google sign-in.
    // true → new user, show modal. false → existing user, go to profile.
    // undefined → not a Google sign-in context, check localStorage fallback.
    if (isNewUser === true) {
      setState("modal");
    } else if (isNewUser === false) {
      setState("redirecting");
      router.replace("/profile");
    } else {
      // Fallback for edge cases: check localStorage
      const alreadyWelcomed = email ? localStorage.getItem(`wh_welcomed_${email}`) : "1";
      if (alreadyWelcomed) {
        setState("redirecting");
        router.replace("/profile");
      } else {
        setState("modal");
      }
    }
  }, [status, session, router]);

  if (state === "loading" || state === "redirecting") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <WelcomeModal
        userName={session?.user?.name ?? ""}
        userEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
