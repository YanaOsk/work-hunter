"use client";

import { Suspense } from "react";
import AdvisorPageInner from "@/components/advisor/AdvisorPageInner";

export default function AdvisorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <AdvisorPageInner />
    </Suspense>
  );
}
