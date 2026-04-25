"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import PromoBanner from "./PromoBanner";
import NavBar from "./NavBar";

export default function NavBarWrapper() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<string>("free");
  const [subChecked, setSubChecked] = useState(false);

  useEffect(() => {
    // No session → nothing to check
    if (status === "unauthenticated") {
      setSubChecked(true);
      return;
    }
    if (!session?.user) return;

    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { if (d?.plan) setPlan(d.plan); })
      .catch(() => {})
      .finally(() => setSubChecked(true));
  }, [session?.user, status]);

  if (pathname.startsWith("/admin")) return null;

  const hasPaidPlan = plan !== "free";
  // Don't show the banner until we know whether the user has a paid plan
  const showBanner = subChecked && !hasPaidPlan;

  return (
    <div className="print:hidden sticky top-0 z-50">
      {showBanner && <PromoBanner />}
      <NavBar hasPaidPlan={hasPaidPlan} plan={plan} planReady={subChecked} />
    </div>
  );
}
