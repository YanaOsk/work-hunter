"use client";

import { useLanguage } from "./LanguageProvider";

export default function LostCallout() {
  const { lang } = useLanguage();
  const he = lang === "he";

  return (
    <section className="py-10 md:py-14 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative linear-card px-7 py-8 md:px-10 md:py-10 overflow-hidden"
          style={{ borderColor: "rgba(94,106,210,0.18)" }}
          dir={he ? "rtl" : "ltr"}
        >
          {/* Subtle purple glow — flips side based on language */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: he
                ? "radial-gradient(ellipse at 20% 50%, rgba(94,106,210,0.12) 0%, transparent 70%)"
                : "radial-gradient(ellipse at 80% 50%, rgba(94,106,210,0.12) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">
              {he ? "לא בטוחים מאיפה להתחיל?" : "Not sure where to start?"}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-[-0.02em] leading-snug">
              {he
                ? "מרגישים קצת אבודים? זה לגמרי בסדר."
                : "Feeling a little lost? That's completely okay."}
            </h3>
            <p className="text-white/55 text-sm sm:text-base leading-relaxed">
              {he
                ? "הרבה מאיתנו מגיעים לשלב שבו הכיוון כבר לא ברור, או שהמסלול שהיינו בו פשוט הפסיק להתאים. Work Hunter נבנה בדיוק בשביל הרגעים האלו – לעזור לכם לעצור, לנשום, ולהבין מחדש מה באמת נכון לכם עכשיו. אנחנו נהיה המצפן שלכם עד שנמצא יחד את הדרך שמרגשת אתכם."
                : "Many of us reach a point where the direction isn't clear anymore, or the path we were on just stopped fitting. Work Hunter was built exactly for moments like these — to help you pause, breathe, and rediscover what's truly right for you now. We'll be your compass until we find the path that excites you, together."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
