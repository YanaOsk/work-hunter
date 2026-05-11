"use client";

import { useLanguage } from "./LanguageProvider";

/* ─── Mini UI mockups — decorative product previews ─────────────────────── */

function AdvisorMockup() {
  return (
    <div className="w-full max-w-sm linear-card p-5 select-none pointer-events-none">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-white/[0.07]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(94,106,210,0.15)" }}>
          <svg style={{ color: "#5E6AD2", width: "13px", height: "13px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <p className="text-white/80 text-xs font-semibold">Career Advisor</p>
          <p className="text-white/30 text-[10px]">AI-powered diagnosis</p>
        </div>
        <div className="ms-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Chat messages */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-600/40 flex-shrink-0 flex items-center justify-center text-[8px] text-purple-300 font-bold">AI</div>
          <div className="bg-white/[0.05] rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-white/70 leading-relaxed max-w-[85%]">
            ספר לי על הרקע המקצועי שלך ומה גרם לך לחפש שינוי כרגע?
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-purple-600/20 rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-white/80 leading-relaxed max-w-[85%]">
            עבדתי 4 שנים כמורה לביולוגיה ורוצה לעבור לתעשיית הביוטק...
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-600/40 flex-shrink-0 flex items-center justify-center text-[8px] text-purple-300 font-bold">AI</div>
          <div className="bg-white/[0.05] rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-white/70 leading-relaxed max-w-[85%]">
            מצוין! יש לך כישורי הוראה שמאוד מבוקשים ב-Medical Affairs...
          </div>
        </div>
      </div>

      {/* Typing indicator */}
      <div className="flex items-center gap-1 mt-3 ps-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-purple-400/50 animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ScoutMockup() {
  const jobs = [
    { title: "Senior PM", company: "monday.com", score: 94, remote: true },
    { title: "Product Lead", company: "Wix", score: 87, remote: false },
    { title: "Group PM", company: "Fiverr", score: 81, remote: true },
  ];

  return (
    <div className="w-full max-w-sm space-y-2.5 select-none pointer-events-none">
      {/* Scout status bar */}
      <div className="linear-card px-4 py-2.5 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <p className="text-white/50 text-[10px] uppercase tracking-wide font-medium">Scout scanning</p>
        <div className="ms-auto">
          <div className="h-0.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-0.5 rounded-full animate-progress-beam"
              style={{ width: "60px", background: "linear-gradient(90deg, transparent, #5E6AD2, #4ADE80, transparent)" }}
            />
          </div>
        </div>
      </div>

      {/* Job cards */}
      {jobs.map((j, i) => (
        <div
          key={i}
          className="linear-card px-4 py-3 flex items-center gap-3"
          style={{ animation: `staggerIn 0.4s ease both`, animationDelay: `${i * 100 + 200}ms` }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-white/85 text-xs font-semibold truncate">{j.title}</p>
            <p className="text-white/35 text-[10px] mt-0.5">{j.company} {j.remote && "· Remote"}</p>
          </div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            j.score >= 90
              ? "text-green-400 border-green-400/25 bg-green-400/10"
              : "text-purple-300 border-purple-400/25 bg-purple-400/10"
          }`}>
            {j.score}%
          </div>
        </div>
      ))}

      <p className="text-white/25 text-[9px] text-center pt-1">47 jobs matched · updated now</p>
    </div>
  );
}

function CvMockup() {
  const { lang } = useLanguage();
  const he = lang === "he";
  return (
    <div className="w-full max-w-xs linear-card p-5 select-none pointer-events-none">
      {/* CV header */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          YK
        </div>
        <div>
          <p className="text-white/85 text-xs font-semibold">Yael Katz</p>
          <p className="text-white/40 text-[10px]">Senior Marketing Manager</p>
          <p className="text-white/25 text-[9px] mt-0.5">Tel Aviv · linkedin.com/in/yaelkatz</p>
        </div>
      </div>

      {/* Score indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-white/40 text-[9px] uppercase tracking-wide">{he ? "ציון קורות חיים" : "CV Score"}</p>
          <span className="text-[10px] font-bold text-green-400">92 / 100</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06]">
          <div className="h-1 rounded-full w-[92%]" style={{ background: "linear-gradient(90deg, #5E6AD2, #4ADE80)" }} />
        </div>
      </div>

      {/* Section previews */}
      <div className="space-y-2.5">
        {[
          { label: "Experience", lines: [2, 1] },
          { label: "Skills", lines: [1] },
        ].map(({ label, lines }) => (
          <div key={label}>
            <p className="text-white/40 text-[9px] uppercase tracking-wide mb-1.5">{label}</p>
            {lines.map((w, i) => (
              <div key={i} className={`h-1.5 rounded-full bg-white/[0.06] mb-1 ${i === 0 ? `w-[${w === 2 ? "85" : "60"}%]` : "w-2/3"}`} />
            ))}
          </div>
        ))}
      </div>

      {/* AI badge */}
      <div className="mt-4 flex items-center gap-1.5 text-[9px] text-purple-400/70">
        <svg style={{ color: "#5E6AD2", width: "10px", height: "10px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Optimized by AI · ATS-ready
      </div>
    </div>
  );
}

/* ─── Feature block ──────────────────────────────────────────────────────── */
interface FeatureBlockProps {
  overline: string;
  sectionNum: string;
  headline: string;
  body: string;
  bullets: string[];
  accent: string;
  mockup: React.ReactNode;
  flip?: boolean;
}

function FeatureBlock({ overline, sectionNum, headline, body, bullets, accent, mockup, flip = false }: FeatureBlockProps) {
  return (
    <div className={`flex flex-col ${flip ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 md:gap-16`}>
      {/* Text side */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[10px] font-mono font-semibold text-white/20 tracking-widest tabular-nums">
            {sectionNum}
          </span>
          <div className="w-8 h-px" style={{ background: accent + "40" }} />
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent + "80" }}
          >
            {overline}
          </p>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-[-0.03em] leading-tight">
          {headline}
        </h3>
        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6">
          {body}
        </p>
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
              <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accent + "18" }}>
                <svg style={{ color: accent, width: "9px", height: "9px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup side */}
      <div className="flex-1 flex justify-center">
        {mockup}
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function FeatureShowcase() {
  const { lang } = useLanguage();
  const he = lang === "he";

  const blocks: FeatureBlockProps[] = [
    {
      overline: he ? "אבחון קריירה" : "CAREER DIAGNOSIS",
      sectionNum: "1.1",
      headline: he
        ? "שיחה אחת קצרה, וסוף סוף תראו את התמונה המלאה."
        : "One conversation. A complete picture of who you are.",
      body: he
        ? "היועץ שואל את השאלות שאף מגייס לא ישאל — על ערכים, על סביבות עבודה, על מה שמפעיל אתכם. התוצאה: אבחון כתוב עם חוזקות, מיומנויות מועברות ועיוורונות שכדאי לדעת."
        : "The advisor asks the questions no recruiter will — about values, work environments, what drives you. The output: a written diagnosis with strengths, transferable skills, and blind spots worth knowing.",
      bullets: he
        ? ["אבחון עמוק של כישורים מועברים", "מיפוי ערכים ואורח עבודה", "2–3 מסלולים מומלצים שמתאימים לפרופיל שלכם"]
        : ["Deep scan of transferable skills", "Values and work-style mapping", "2–3 recommended career paths that fit your profile"],
      accent: "#5E6AD2",
      mockup: <AdvisorMockup />,
      flip: false,
    },
    {
      overline: he ? "סקאוט משרות" : "JOB SCOUT",
      sectionNum: "1.2",
      headline: he
        ? "הבינה המלאכותית מחפשת. אתם רק בוחרים."
        : "The AI scouts. You just choose.",
      body: he
        ? "הסקאוט סורק משרות בלינקדאין, גלאסדור, AllJobs ועוד — ומסנן לפי הפרופיל האישי שלכם, לא רק לפי מילות מפתח. כל משרה מגיעה עם ניתוח התאמה, ניתוח פערים ודירוג."
        : "Scout scans LinkedIn, Glassdoor, AllJobs and more — filtered to your personal profile, not just keywords. Every listing comes with a match analysis, gap breakdown, and a score.",
      bullets: he
        ? ["סריקה על פני 10+ לוחות משרות", "ניתוח התאמה של כל משרה לפרופיל", "זיהוי הזדמנויות שמתחרים לא רואים"]
        : ["Scans 10+ job boards in one run", "Per-listing match analysis vs your profile", "Finds hidden-market roles competitors miss"],
      accent: "#4ADE80",
      mockup: <ScoutMockup />,
      flip: true,
    },
    {
      overline: he ? "קורות חיים ולינקדאין" : "CV & LINKEDIN",
      sectionNum: "1.3",
      headline: he
        ? "קורות חיים שמסבירים מי אתם, לא רק מה עשיתם."
        : "A CV that explains who you are, not just what you did.",
      body: he
        ? "הבינה המלאכותית כותבת מחדש את קורות החיים שלכם בשפה שמדברת לפרופיל הספציפי שאתם רוצים — ועוזרת לאופטימיזציה של הלינקדאין כך שמגייסים יגיעו אליכם."
        : "The AI rewrites your CV in language tuned to the specific role you're targeting — and optimizes your LinkedIn so recruiters come to you.",
      bullets: he
        ? ["כתיבה מחדש מותאמת לתפקיד הספציפי", "ניסוח מקצועי שעובר מסנני ATS", "אופטימיזציה של לינקדאין + כותרת מגנטית"]
        : ["Role-specific rewrite, not generic polish", "ATS-optimized language and structure", "LinkedIn headline and about-section upgrade"],
      accent: "#5E6AD2",
      mockup: <CvMockup />,
      flip: false,
    },
  ];

  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-20 md:space-y-32">
        {blocks.map((block, i) => (
          <FadeInBlock key={i} delay={i * 80}>
            <FeatureBlock {...block} />
          </FadeInBlock>
        ))}
      </div>
    </section>
  );
}

/* Simple client scroll reveal wrapper */
function FadeInBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      style={{ animation: `staggerIn 0.6s ease both`, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
