"use client";

import { createContext, useContext, useState, useTransition, ReactNode } from "react";
import { Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  fading: boolean;
  toggle: () => void;
}

const LangContext = createContext<LangCtx>({ lang: "he", fading: false, toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");
  const [fading, setFading] = useState(false);
  const [, startTransition] = useTransition();

  const toggle = () => {
    setFading(true);
    setTimeout(() => {
      startTransition(() => setLang((l) => (l === "he" ? "en" : "he")));
      setFading(false);
    }, 220);
  };

  return (
    <LangContext.Provider value={{ lang, fading, toggle }}>
      <div
        dir={lang === "he" ? "rtl" : "ltr"}
        style={{ opacity: fading ? 0 : 1, transition: "opacity 220ms ease" }}
        className="min-h-screen"
      >
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLanguage = () => useContext(LangContext);
