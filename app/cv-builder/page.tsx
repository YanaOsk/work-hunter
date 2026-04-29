import { Suspense } from "react";
import CvBuilderPage from "@/components/cv-builder/CvBuilderPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />}>
      <CvBuilderPage />
    </Suspense>
  );
}
