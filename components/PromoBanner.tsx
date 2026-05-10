"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function PromoBanner() {
  const { lang } = useLanguage();
  const tx = t[lang];

  return (
    <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-emerald-700 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto py-2 px-4 text-center">
        <p className="text-on-color text-xs md:text-sm font-medium tracking-wide">{tx.promoBanner}</p>
      </div>
    </div>
  );
}
