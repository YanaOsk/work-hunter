import { Suspense } from "react";
import ApplicationTracker from "@/components/ApplicationTracker";

export default function TrackerPage() {
  return (
    <Suspense fallback={<div style={{ background: "var(--background)" }} className="min-h-screen " />}>
      <ApplicationTracker />
    </Suspense>
  );
}
