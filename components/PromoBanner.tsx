"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function PromoBanner() {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <div className="border-b" style={{ background: "rgba(94,106,210,0.10)", borderColor: "rgba(94,106,210,0.15)" }}>
      <div className="max-w-7xl mx-auto py-2 px-4 text-center">
        <p className="text-white/70 text-xs md:text-sm font-medium tracking-[-0.01em]">{tx.promoBanner}</p>
      </div>
    </div>
  );
}
