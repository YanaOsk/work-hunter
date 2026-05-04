import { Suspense } from "react";
import ApplicationTracker from "@/components/ApplicationTracker";

export default function TrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />}>
      <ApplicationTracker />
    </Suspense>
  );
}
