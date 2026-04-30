"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function AllFields() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const fields: Array<{ labelKey: keyof typeof t.he; emoji: string }> = [
    { labelKey: "fieldEducation", emoji: "📚" },
    { labelKey: "fieldHealth", emoji: "🩺" },
    { labelKey: "fieldDesign", emoji: "🎨" },
    { labelKey: "fieldSocial", emoji: "🤝" },
    { labelKey: "fieldSales", emoji: "📈" },
    { labelKey: "fieldMarketing", emoji: "📣" },
    { labelKey: "fieldLaw", emoji: "⚖️" },
    { labelKey: "fieldFinance", emoji: "💼" },
    { labelKey: "fieldTech", emoji: "💻" },
    { labelKey: "fieldFood", emoji: "🍽️" },
    { labelKey: "fieldArts", emoji: "🎭" },
    { labelKey: "fieldEngineering", emoji: "🔧" },
  ];

  return (
    <section className="py-10 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-6 md:mb-10 leading-tight">
          {tx.allFieldsTitle}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-8">
          {fields.map((f) => (
            <div
              key={f.labelKey}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 md:p-5 text-center hover:bg-white/10 hover:border-purple-400/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-default"
            >
              <div className="text-2xl md:text-3xl mb-1.5 sm:mb-2 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">
                {f.emoji}
              </div>
              <div className="text-white/80 text-xs font-medium leading-tight">{tx[f.labelKey]}</div>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-sm md:text-base leading-relaxed text-center max-w-2xl mx-auto">
          {tx.allFieldsFooter}
        </p>
      </div>
    </section>
  );
}
