import { Suspense } from "react";
import SettingsPage from "@/components/settings/SettingsPage";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ background: "var(--background)" }} className="min-h-screen" />}>
      <SettingsPage />
    </Suspense>
  );
}
