import { Suspense } from "react";
import CvBuilderPage from "@/components/cv-builder/CvBuilderPage";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ background: "var(--background)" }} className="min-h-screen " />}>
      <CvBuilderPage />
    </Suspense>
  );
}
