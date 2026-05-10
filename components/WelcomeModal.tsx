"use client";

import { useLanguage } from "./LanguageProvider";
import { getOrCreateAdvisorState, DEFAULT_ADVISOR_ID } from "@/lib/advisorState";
import { queueAutoStart } from "@/lib/autoStart";
import type { AppMode } from "@/lib/types";
import LogoMark from "./LogoMark";

interface Props {
  userName: string;
  userEmail: string;
}

const emptyProfile = { rawText: "", parsedData: {}, missingFields: [], clarifyingQuestions: [] };

export default function WelcomeModal({ userName, userEmail }: Props) {
  const { lang } = useLanguage();
  const he = lang === "he";

  const firstName = userName?.split(" ")[0] ?? "";

  const handleChoose = (mode: AppMode | "cv") => {
    if (userEmail) {
      localStorage.setItem(`wh_welcomed_${userEmail}`, "1");
    }
    if (mode === "advisor") {
      getOrCreateAdvisorState(DEFAULT_ADVISOR_ID, emptyProfile);
      window.location.replace(`/advisor?profileId=${DEFAULT_ADVISOR_ID}`);
    } else if (mode === "cv") {
      window.location.replace("/cv-builder");
    } else {
      queueAutoStart("jobs");
      window.location.replace("/");
    }
  };

  const cards = [
    {
      mode: "jobs" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: he ? "חיפוש עבודה" : "Job Search",
      desc: he
        ? "העלו קורות חיים ומצאו משרות רלוונטיות עם התאמה חכמה לפרופיל שלכם"
        : "Upload your CV and find jobs matched to your profile with AI",
    },
    {
      mode: "advisor" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: he ? "ייעוץ קריירה" : "Career Advisor",
      desc: he
        ? "תוכנית קריירה אישית, שיפור קורות חיים, הכנה לראיון ועוד עם יועץ AI"
        : "Personal career plan, CV improvement, interview prep & more with AI",
    },
    {
      mode: "cv" as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: he ? "בניית קורות חיים" : "CV Builder",
      desc: he
        ? "בנה קורות חיים מקצועיים בעברית ובאנגלית עם עזרת AI בקלות ובמהירות"
        : "Build a professional CV in Hebrew or English with AI assistance",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoMark size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            {firstName
              ? (he ? `ברוך הבא, ${firstName}` : `Welcome, ${firstName}`)
              : (he ? "ברוך הבא" : "Welcome")}
          </h1>
          <p className="text-white/40 text-sm">
            {he ? "עם מה נתחיל?" : "What would you like to do first?"}
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" dir={he ? "rtl" : "ltr"}>
          {cards.map(({ mode, icon, title, desc }) => (
            <button
              key={mode}
              onClick={() => handleChoose(mode)}
              className="group text-start bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.16] rounded-[8px] p-5 transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-[6px] bg-[#5e6ad2]/10 group-hover:bg-[#5e6ad2]/20 border border-[#5e6ad2]/20 flex items-center justify-center mb-4 transition-colors duration-150 text-[#818cf8]">
                {icon}
              </div>
              <h2 className="text-white font-semibold text-sm mb-1.5">{title}</h2>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[#818cf8]/60 group-hover:text-[#818cf8] text-xs font-medium transition-colors duration-150">
                <span>{he ? "התחל" : "Get started"}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={he ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          {he ? "תוכל/י לשנות בכל עת מהעמוד הראשי" : "You can always switch from the home page"}
        </p>
      </div>
    </div>
  );
}
