"use client";

import { useLanguage } from "./LanguageProvider";

const FIELDS = [
  { emoji: "💻", he: "הייטק ותוכנה",       en: "Tech & Software" },
  { emoji: "🏥", he: "בריאות ורפואה",       en: "Healthcare" },
  { emoji: "📚", he: "חינוך והוראה",         en: "Education" },
  { emoji: "📣", he: "שיווק ופרסום",         en: "Marketing" },
  { emoji: "📈", he: "מכירות",               en: "Sales" },
  { emoji: "🎨", he: "עיצוב וקריאייטיב",    en: "Design & Creative" },
  { emoji: "⚖️", he: "משפטים",               en: "Law & Legal" },
  { emoji: "💰", he: "פיננסים וחשבונאות",    en: "Finance & Accounting" },
  { emoji: "⚙️", he: "הנדסה ותעשייה",        en: "Engineering" },
  { emoji: "👥", he: "משאבי אנוש",            en: "Human Resources" },
  { emoji: "🎯", he: "ניהול ואסטרטגיה",      en: "Management" },
  { emoji: "🚀", he: "יזמות ועצמאים",         en: "Entrepreneurs & Freelance" },
  { emoji: "🏗️", he: "בנייה ונדל\"ן",         en: "Real Estate & Construction" },
  { emoji: "🎧", he: "שירות לקוחות",           en: "Customer Success" },
  { emoji: "📦", he: "לוגיסטיקה ושרשרת אספקה", en: "Logistics & Supply Chain" },
  { emoji: "🎭", he: "אמנות ותקשורת",          en: "Media & Arts" },
];

export default function AllFieldsSection() {
  const { lang } = useLanguage();
  const he = lang === "he";

  return (
    <section className="py-14 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
            {he ? "לכולם" : "FOR EVERYONE"}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-[-0.03em]">
            {he ? "לכל תחום. לכל נקודת פתיחה." : "Every field. Every background."}
          </h2>
          <p className="text-white/45 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {he
              ? "משוחרר טרי, מורה, מהנדס, איש מכירות — Work Hunter מכיר את שוק העבודה הישראלי לעומק, בכל תחום."
              : "Engineers, teachers, salespeople, or career changers — Work Hunter knows the Israeli job market across every sector"}
          </p>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
          {FIELDS.map((f, i) => (
            <div
              key={i}
              className="group linear-card px-4 py-3.5 flex items-center gap-3 cursor-default"
              style={{ animation: `staggerIn 0.4s ease both`, animationDelay: `${i * 40}ms` }}
            >
              <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                {f.emoji}
              </span>
              <span className="text-white/70 text-xs sm:text-sm font-medium leading-snug tracking-[-0.01em]">
                {he ? f.he : f.en}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/25 text-xs mt-8 tracking-wide">
          {he
            ? "ועוד עשרות תחומים — אם אתם בחיפוש, אנחנו כבר כאן."
            : "And dozens more — if you're job hunting, Work Hunter knows how to help"}
        </p>
      </div>
    </section>
  );
}
