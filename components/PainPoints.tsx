"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function PainPoints() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const pains = [tx.pain1, tx.pain2, tx.pain3];
  const emojis = ["😔", "📭", "🤔"];

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
          {tx.painTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pains.map((text, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="text-3xl mb-3 transition-transform group-hover:scale-110">
                {emojis[i]}
              </div>
              <p className="text-white/80 leading-relaxed text-base md:text-lg italic">
                &ldquo;{text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
