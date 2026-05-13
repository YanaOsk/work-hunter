"use client";

import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";

const CATEGORIES = [
  { emoji: "💻", label: "הייטק ודיגיטל", sample: "מפתח, מנהל מוצר, UX, DevOps, Data" },
  { emoji: "⚖️", label: "משפטים וכספים", sample: "עו\"ד, רו\"ח, יועץ מס, מנהל פיננסי" },
  { emoji: "🏥", label: "בריאות ורפואה", sample: "רופא, אחות, פיזיותרפיסט, פסיכולוג" },
  { emoji: "📚", label: "חינוך והדרכה", sample: "מורה, מרצה, Life Coach, יועץ קריירה" },
  { emoji: "🏗️", label: "בנייה והנדסה", sample: "אדריכל, חשמלאי, קבלן, מהנדס אזרחי" },
  { emoji: "🎨", label: "אמנות ותקשורת", sample: "מעצב גרפי, צלם, קופירייטר, עיתונאי" },
  { emoji: "💄", label: "יופי וטיפוח", sample: "קוסמטיקאית, מעצב שיער, סטייליסטית" },
  { emoji: "🍽️", label: "מזון ואירוח", sample: "שף, מנהל מסעדה, מלצר, קונדיטור" },
  { emoji: "📱", label: "כלכלת יוצרים", sample: "יוטיובר, פודקאסטר, Ghostwriter, SEO" },
  { emoji: "🔬", label: "מדע ומחקר", sample: "חוקר, מיקרוביולוג, אגרונום, כימאי" },
  { emoji: "🚚", label: "תחבורה ומכירות", sample: "נהג, סוכן מכירות, לוגיסטיקה, נדל\"ן" },
  { emoji: "🏢", label: "שירותים עסקיים", sample: "מנהל כנסים, יועץ, מנהל משאבי אנוש" },
  { emoji: "⚙️", label: "מלאכות ותעשייה", sample: "נגר, רתך, טכנאי, מפעיל CNC" },
  { emoji: "🩺", label: "רפואה משלימה", sample: "נטורופת, מדקר, מטפל זוגי, פלדנקרייז" },
  { emoji: "🎭", label: "תרבות ופנאי", sample: "שחקן, מדריך טיולים, DJ, מאמן ספורט" },
];

const ACCENT_COLORS = [
  "rgba(94,106,210,0.12)",
  "rgba(74,222,128,0.08)",
  "rgba(251,191,36,0.08)",
  "rgba(248,113,113,0.08)",
  "rgba(96,165,250,0.08)",
];

export default function IndustriesSection() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  return (
    <section className="py-14 md:py-24 px-4 md:px-6" dir={he ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-[#5E6AD2] text-xs font-semibold tracking-wide">
              {he ? "+1,000 מקצועות" : "1,000+ professions"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-[-0.03em]">
            {he ? "מתאים לכל תחום ולכל רקע" : "Built for every industry"}
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            {he
              ? "בין אם אתה מפתח תוכנה, מורה, שף, או עצמאי — המערכת שלנו מכירה את התחום שלך לעומק"
              : "Whether you're a developer, teacher, chef, or freelancer — our system knows your field deeply"}
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              className="group relative rounded-2xl border border-white/[0.07] p-4 flex flex-col gap-2 cursor-default transition-all duration-200 hover:border-white/[0.14] hover:scale-[1.02]"
              style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
            >
              <span className="text-2xl leading-none">{cat.emoji}</span>
              <p className="text-white text-[13px] font-semibold leading-tight">{cat.label}</p>
              <p className="text-white/40 text-[10px] leading-relaxed">{cat.sample}</p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/30 text-xs mt-8">
          {he
            ? "המערכת מכסה את שוק העבודה הישראלי במלואו — כולל שוק נסתר, עצמאים ומסלולי הכשרה"
            : "Full coverage of the Israeli job market — including hidden market, freelancers, and training paths"}
        </p>
      </div>
    </section>
  );
}
