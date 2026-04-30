"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();

  return (
    <button
      onClick={toggle}
      className="fixed bottom-4 end-4 z-[60] flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-white/20 hover:border-purple-400/50 text-white text-sm font-medium px-3.5 py-2 rounded-full backdrop-blur-md shadow-xl shadow-black/20 transition-all duration-200 hover:scale-105"
      aria-label="Switch language"
    >
      <span>{t[lang].switchLang}</span>
    </button>
  );
}
