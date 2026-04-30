"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import { renderMixedText } from "@/lib/rtl";
import SiteFooter from "./SiteFooter";

const PLAN_IDS: Record<string, string> = {
  free: "free",
  weekly: "weekly",
  popular: "quarterly",
  pro: "lifetime",
};

export default function PricingPage() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const router = useRouter();
  const { status } = useSession();
  const [toast, setToast] = useState<string | null>(null);
  const [openFeature, setOpenFeature] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/pricing");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />;
  }

  const weeklyFeatures = [tx.planWeekly1, tx.planWeekly2, tx.planWeekly3, tx.planWeekly4, tx.planWeekly5];
  const quarterlyFeatures = [tx.planQuarterly1, tx.planQuarterly2, tx.planQuarterly3, tx.planQuarterly4, tx.planQuarterly5];
  const lifetimeFeatures = [tx.planLifetime1, tx.planLifetime2, tx.planLifetime3, tx.planLifetime4, tx.planLifetime5];

  const faqs = [
    { q: tx.faq1Q, a: tx.faq1A },
    { q: tx.faq2Q, a: tx.faq2A },
    { q: tx.faq3Q, a: tx.faq3A },
    { q: tx.faq4Q, a: tx.faq4A },
    { q: tx.faq5Q, a: tx.faq5A },
    { q: tx.faq6Q, a: tx.faq6A },
    { q: tx.faq7Q, a: tx.faq7A },
    { q: tx.faq8Q, a: tx.faq8A },
    { q: tx.faq9Q, a: tx.faq9A },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex justify-end mb-6">
          <div className="text-white/40 text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1">
            {tx.pricingDemoNote}
          </div>
        </div>

        <div className="text-center mb-8 md:mb-10 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">{tx.pricingTitle}</h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">{tx.pricingSubtitle}</p>
        </div>

        {/* ── Two-column: description left, cards right ── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-10">
          <div className="flex-1 min-w-0">
          <div className="text-center mb-6">
            <p className="text-purple-400/70 text-xs font-bold uppercase tracking-widest mb-2">
              {lang === "he" ? "מה כלול בכל מנוי" : "Included in every plan"}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {lang === "he"
                ? "כלים מקצועיים שישנו את חיפוש העבודה שלך"
                : "Professional tools that transform your job search"}
            </h2>
          </div>

          <div
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
            dir={lang === "he" ? "rtl" : "ltr"}
          >
            {([
              {
                icon: "🧠",
                titleHe: "ייעוץ תעסוקתי אסטרטגי וניתוח אישיות",
                titleEn: "Strategic Career Consulting & Personality Analysis",
                descHe: "ניתוח אישיות עמוק, הכוונה למסלולי קריירה מותאמים וסימולציות ראיון עד להצלחה. זמין 24/7.",
                descEn: "Deep personality analysis, tailored career path guidance, and interview simulations until success. Available 24/7.",
                bulletsHe: [
                  { title: "אבחון DNA מקצועי", desc: "ניתוח מעמיק של חוזקות, כישורים וסגנון עבודה (כגון ENFP) ליצירת התאמה מדויקת לשוק העבודה." },
                  { title: "הכוונה למסלולי קריירה", desc: "זיהוי תפקידים אופטימליים (כמו ניהול יצירתי או יזמות) על בסיס שילוב בין כישורים לשאיפות אישיות." },
                  { title: "ניתוח כדאיות (שכיר vs עצמאי)", desc: "השוואה כמותית של פוטנציאל השתכרות ואיכות חיים בין מסלולי תעסוקה שונים." },
                  { title: "מיפוי חברות ואסטרטגיית חיפוש", desc: "בניית רשימת חברות יעד (Target Companies) ותוכנית נטוורקינג אופרטיבית ל-30 יום." },
                  { title: "סימולציית ראיונות ומיתוג אישי", desc: 'הכנה לראיונות עבודה מותאמים אישית וגיבוש ה-"Pitch" המקצועי שלך למול מעסיקים.' },
                ],
                bulletsEn: [
                  { title: "Professional DNA Diagnosis", desc: "In-depth analysis of strengths, skills, and work style (e.g. ENFP) to create a precise match with the job market." },
                  { title: "Career Path Guidance", desc: "Identifying optimal roles (e.g. creative management or entrepreneurship) based on the combination of skills and personal aspirations." },
                  { title: "Feasibility Analysis (Employee vs. Self-Employed)", desc: "Quantitative comparison of earning potential and quality of life across different employment paths." },
                  { title: "Company Mapping & Search Strategy", desc: "Building a Target Companies list and an operational 30-day networking plan." },
                  { title: "Interview Simulation & Personal Branding", desc: 'Personalized interview preparation and crafting your professional "Pitch" for employers.' },
                ],
              },
              {
                icon: "🤖",
                titleHe: "הסקאוט — צייד המשרות האישי שלך",
                titleEn: "The Scout — Your Personal Job Hunter",
                descHe: "סריקה אקטיבית של השוק למציאת משרות שמתאימות בדיוק לפרופיל שלך ולאילוצים האישיים שלך.",
                descEn: "Active market scanning to find positions that exactly match your profile and personal constraints.",
                bulletsHe: [
                  { title: "חיפוש חכם ללא הגבלה", desc: "סריקה אקטיבית של השוק למציאת משרות התואמות בדיוק את פרופיל הייעוץ שנבנה עבורך." },
                  { title: "התאמה לאילוצים אישיים", desc: "איתור משרות המתחשבות בצרכים ספציפיים כגון שירות מילואים, הריון, הורות ודרישות גמישות (היברידי/מרחוק)." },
                  { title: "גישה לשוק הנסתר", desc: "חשיפת הזדמנויות תעסוקתיות בחברות רלוונטיות עוד לפני שהן מתפרסמות בערוצים הרגילים." },
                ],
                bulletsEn: [
                  { title: "Smart Unlimited Search", desc: "Active market scanning to find positions that exactly match the career profile built for you." },
                  { title: "Adaptation to Personal Constraints", desc: "Finding positions that account for specific needs such as military reserve duty, pregnancy, parenthood, and flexibility (hybrid/remote)." },
                  { title: "Access to the Hidden Market", desc: "Uncovering employment opportunities at relevant companies before they're published through regular channels." },
                ],
              },
              {
                icon: "🚀",
                titleHe: "בניית ושדרוג קורות חיים עם AI",
                titleEn: "CV Building & AI-Powered Optimization",
                descHe: "יצירת קורות חיים מנצחים מ-0 או שדרוג קיימים — מותאמים ל-ATS ולדרישות המשרה.",
                descEn: "Build a winning CV from scratch or upgrade an existing one — tailored to ATS systems and job requirements.",
                bulletsHe: [
                  { title: "יצירה מ-0 בסטנדרט גלובלי", desc: "בניית מסמך מקצועי ומנצח בעברית או באנגלית המותאם למערכות הסינון (ATS)." },
                  { title: "שינוי תבניות (Formatting)", desc: "אפשרות להעלאת קובץ קיים והלבשתו על תבניות עיצוב מודרניות ומרשימות בלחיצת כפתור." },
                  { title: "אופטימיזציה של התוכן", desc: "הפיכת רשימת מטלות יבשה לתיאור הישגים מדידים ומרשימים (Impact-driven)." },
                  { title: "דיוק מילות מפתח", desc: "התאמת הניסיון התעסוקתי לדרישות המשרה כדי למשוך את תשומת לב המגייסים." },
                  { title: "סיכום מקצועי מנצח", desc: 'כתיבת פסקת פתיחה ("Summary") המזקקת את הערך המוסף הייחודי שלך.' },
                ],
                bulletsEn: [
                  { title: "Built from Scratch, Global Standard", desc: "Creating a professional, winning document in Hebrew or English, tailored to ATS filtering systems." },
                  { title: "Template Formatting", desc: "Option to upload an existing file and apply modern, impressive design templates with one click." },
                  { title: "Content Optimization", desc: "Transforming a dry task list into descriptions of measurable, impressive achievements (Impact-driven)." },
                  { title: "Keyword Precision", desc: "Matching work experience to job requirements to attract recruiter attention." },
                  { title: "Winning Professional Summary", desc: 'Writing an opening paragraph ("Summary") that distills your unique added value.' },
                ],
              },
            ] as const).map((item, i, arr) => {
              const isOpen = openFeature === i;
              const bullets = lang === "he" ? item.bulletsHe : item.bulletsEn;
              return (
                <div key={item.titleEn} className={i < arr.length - 1 ? "border-b border-white/10" : ""}>
                  <button
                    onClick={() => setOpenFeature(isOpen ? null : i)}
                    className="w-full flex items-start gap-4 px-6 py-5 text-start hover:bg-white/5 transition-colors"
                  >
                    <span className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm mb-1">
                        {lang === "he" ? item.titleHe : item.titleEn}
                      </p>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {lang === "he" ? item.descHe : item.descEn}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-white/40 flex-shrink-0 mt-1.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 border-t border-white/10 bg-white/3">
                      <ul className="mt-4 space-y-3">
                        {bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm">
                            <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white/75 leading-relaxed">
                              <span className="text-white font-semibold">{b.title}</span>
                              {b.desc ? `: ${b.desc}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          </div>

          {/* Right: Plan cards — sticky on desktop */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-20">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 text-center">
              {lang === "he" ? "בחרו את המסלול שמתאים לכם" : "Choose your plan"}
            </p>
            <div className="flex flex-col gap-4">
              <PlanCard
                name={tx.planWeeklyName}
                badge={tx.planWeeklyBadge}
                price={tx.planWeeklyPrice}
                per={tx.planWeeklyPer}
                tagline={tx.planWeeklyTagline}
                features={[]}
                cta={tx.planWeeklyCta}
                onCtaClick={() => router.push(`/checkout?plan=${PLAN_IDS["weekly"]}`)}
                variant="weekly"
              />
              <PlanCard
                name={tx.planQuarterlyName}
                badge={tx.planQuarterlyBadge}
                price={tx.planQuarterlyPrice}
                per={tx.planQuarterlyPer}
                tagline={tx.planQuarterlyTagline}
                features={[]}
                cta={tx.planQuarterlyCta}
                onCtaClick={() => router.push(`/checkout?plan=${PLAN_IDS["popular"]}`)}
                variant="popular"
              />
              <PlanCard
                name={tx.planLifetimeName}
                badge={tx.planLifetimeBadge}
                oldPrice={tx.planLifetimeOld}
                price={tx.planLifetimePrice}
                tagline={tx.planLifetimeTagline}
                features={[]}
                cta={tx.planLifetimeCta}
                onCtaClick={() => router.push(`/checkout?plan=${PLAN_IDS["pro"]}`)}
                variant="pro"
              />
            </div>
          </div>
        </div>

        {/* Free CTA */}
        <div className="flex flex-col items-center gap-3 mt-2 mb-10 md:mb-12">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 blur-md opacity-40 animate-pulse pointer-events-none" />
            <button
              onClick={() => router.push("/?start=jobs")}
              className="relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-white font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-900/30"
            >
              {lang === "he" ? "התחילו עכשיו בחינם" : "Start for Free Now"}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10 md:mb-16">
          <TrustCard icon="users" title={tx.trustUsers} desc={tx.trustUsersDesc} />
          <TrustCard icon="star" title={tx.trustRating} desc={tx.trustRatingDesc} />
          <TrustCard icon="shield" title={tx.trustSecure} desc={tx.trustSecureDesc} />
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-5 text-center">{tx.faqTitle}</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

interface PlanProps {
  name: string;
  badge?: string;
  oldPrice?: string;
  price: string;
  per?: string;
  tagline: string;
  features: string[];
  cta: string;
  onCtaClick: () => void;
  variant: "free" | "weekly" | "popular" | "pro";
}

function PlanCard({ name, badge, oldPrice, price, per, tagline, features, cta, onCtaClick, variant }: PlanProps) {
  const variantClasses = {
    free: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-white",
      cta: "bg-white/10 hover:bg-white/15 border border-white/20 text-white",
    },
    weekly: {
      wrap: "bg-white/5 border-sky-500/20",
      accent: "text-sky-300",
      cta: "bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold",
    },
    popular: {
      wrap: "bg-gradient-to-br from-purple-600/20 via-white/5 to-emerald-600/20 border-purple-500/50 shadow-2xl shadow-purple-500/20 lg:-translate-y-2 lg:scale-[1.02]",
      accent: "text-purple-300",
      cta: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    pro: {
      wrap: "bg-white/5 border-white/10",
      accent: "text-amber-300",
      cta: "bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold",
    },
  }[variant];

  return (
    <div className={`relative rounded-3xl p-6 backdrop-blur-sm border transition-all ${variantClasses.wrap}`}>
      {badge && (
        <div className={`absolute -top-3 start-6 text-xs font-bold px-3 py-1 rounded-full ${
          variant === "popular" ? "bg-gradient-to-r from-purple-500 to-emerald-500 text-white"
          : variant === "weekly" ? "bg-sky-500 text-slate-900"
          : "bg-amber-500 text-slate-900"
        }`}>
          {badge}
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-2 ${variantClasses.accent}`}>{name}</h3>
        <div className="flex items-baseline gap-2 mb-1">
          {oldPrice && <span className="text-white/40 line-through text-lg">{oldPrice}</span>}
          <span className="text-4xl font-bold text-white">{price}</span>
          {per && <span className="text-white/50 text-sm">{per}</span>}
        </div>
        <p className="text-white/60 text-sm">{tagline}</p>
      </div>

      <button
        onClick={onCtaClick}
        className={`w-full py-3 px-2 rounded-xl font-semibold transition mb-6 text-sm sm:text-base truncate ${variantClasses.cta}`}
      >
        {cta}
      </button>

      <ul className="space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                variant === "free" ? "text-white/50"
                : variant === "weekly" ? "text-sky-400"
                : variant === "popular" ? "text-purple-400"
                : "text-amber-400"
              }`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-white/85 leading-relaxed">{renderMixedText(f)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const paths: Record<string, string> = {
    users: "M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a3 3 0 013-3h1m4-4a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
    star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  };
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
      <svg className="w-8 h-8 text-purple-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={paths[icon]} />
      </svg>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-white/60 text-sm">{desc}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-start bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition"
    >
      <div className="flex items-center justify-between">
        <span className="text-white font-medium">{q}</span>
        <svg className={`w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && <p className="text-white/70 text-sm mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}
