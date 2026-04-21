"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

export default function FaqSection() {
  const { lang } = useLanguage();
  const tx = t[lang];

  const faqs = [
    { q: tx.faq3Q, a: tx.faq3A },
    { q: tx.faq4Q, a: tx.faq4A },
    { q: tx.faq5Q, a: tx.faq5A },
    { q: tx.faq7Q, a: tx.faq7A },
    { q: tx.faq6Q, a: tx.faq6A },
    { q: tx.faq8Q, a: tx.faq8A },
  ];

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10 leading-tight">
          {tx.faqTitle}
        </h2>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-start bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-white font-medium text-base">{q}</span>
        <svg
          className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && <p className="text-white/70 text-sm mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}
