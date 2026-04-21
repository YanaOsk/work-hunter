"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function PromoBanner() {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-amber-500/30 backdrop-blur-md border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto py-2 px-4 text-center">
        <p className="text-amber-100 text-xs md:text-sm font-medium">{tx.promoBanner}</p>
      </div>
    </div>
  );
}
