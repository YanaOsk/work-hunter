"use client";

import { useLanguage } from "./LanguageProvider";
import { getOrCreateAdvisorState, DEFAULT_ADVISOR_ID } from "@/lib/advisorState";
import { queueAutoStart } from "@/lib/autoStart";
import type { AppMode } from "@/lib/types";

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

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 sm:mb-5 shadow-lg shadow-purple-900/50"
            style={{ background: "linear-gradient(135deg,#a855f7,#ec4899,#10b981)" }}
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
            {firstName
              ? (he ? `ברוך הבא, ${firstName}! 🎉` : `Welcome, ${firstName}! 🎉`)
              : (he ? "ברוך הבא! 🎉" : "Welcome! 🎉")}
          </h1>
          <p className="text-white/55 text-sm sm:text-lg">
            {he ? "עם מה נתחיל?" : "What would you like to do first?"}
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" dir={he ? "rtl" : "ltr"}>
          <button
            onClick={() => handleChoose("jobs")}
            className="group text-start bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-purple-500/60 rounded-3xl p-5 sm:p-8 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/20"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 flex items-center justify-center mb-5 transition-colors duration-200">
              <svg className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {he ? "חיפוש עבודה" : "Job Search"}
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              {he
                ? "העלה קורות חיים ומצא משרות רלוונטיות עם התאמה חכמה לפרופיל שלך"
                : "Upload your CV and find jobs matched to your profile with AI"}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-purple-400 text-sm font-medium group-hover:gap-2.5 transition-all">
              <span>{he ? "בואו נתחיל" : "Let's go"}</span>
            </div>
          </button>

          <button
            onClick={() => handleChoose("advisor")}
            className="group text-start bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-emerald-500/60 rounded-3xl p-5 sm:p-8 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/20"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 group-hover:bg-emerald-600 flex items-center justify-center mb-5 transition-colors duration-200">
              <svg className="w-6 h-6 text-emerald-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {he ? "ייעוץ קריירה" : "Career Advisor"}
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              {he
                ? "תוכנית קריירה אישית, שיפור קורות חיים, הכנה לראיון ועוד עם יועץ AI"
                : "Personal career plan, CV improvement, interview prep & more with AI"}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-emerald-400 text-sm font-medium group-hover:gap-2.5 transition-all">
              <span>{he ? "בואו נתחיל" : "Let's go"}</span>
            </div>
          </button>

          <button
            onClick={() => handleChoose("cv")}
            className="group text-start bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-sky-500/60 rounded-3xl p-5 sm:p-8 transition-all duration-200 hover:shadow-lg hover:shadow-sky-900/20"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-600/20 group-hover:bg-sky-600 flex items-center justify-center mb-5 transition-colors duration-200">
              <svg className="w-6 h-6 text-sky-300 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {he ? "בניית קורות חיים" : "CV Builder"}
            </h2>
            <p className="text-white/55 text-sm leading-relaxed">
              {he
                ? "בנה קורות חיים מקצועיים בעברית ובאנגלית עם עזרת AI בקלות ובמהירות"
                : "Build a professional CV in Hebrew or English with AI assistance"}
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-sky-400 text-sm font-medium group-hover:gap-2.5 transition-all">
              <span>{he ? "בואו נתחיל" : "Let's go"}</span>
            </div>
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          {he ? "תוכל/י לשנות בכל עת מהעמוד הראשי" : "You can always switch from the home page"}
        </p>
      </div>
    </div>
  );
}
