"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../LanguageProvider";
import { getSampleCv } from "@/lib/cvSamples";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "tech", label: "טכנולוגיה" },
  { id: "marketing", label: "שיווק" },
  { id: "finance", label: "כספים" },
  { id: "medical", label: "רפואה" },
  { id: "education", label: "חינוך" },
  { id: "management", label: "ניהול" },
  { id: "design", label: "עיצוב" },
  { id: "law", label: "משפטים" },
  { id: "hr", label: "משאבי אנוש" },
];

const EXAMPLES = [
  { id: "software-engineer", title: "מהנדס/ת תוכנה", category: "tech", accent: "#5E6AD2", exp: "5 שנות ניסיון", skills: ["React", "Node.js", "Python"] },
  { id: "product-manager", title: "מנהל/ת מוצר", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["Roadmap", "Agile", "B2B"] },
  { id: "data-scientist", title: "מדען/ית נתונים", category: "tech", accent: "#5E6AD2", exp: "3 שנות ניסיון", skills: ["Python", "ML", "SQL"] },
  { id: "devops", title: "מהנדס/ת DevOps", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["AWS", "Docker", "CI/CD"] },
  { id: "qa-engineer", title: "מהנדס/ת QA", category: "tech", accent: "#5E6AD2", exp: "3 שנות ניסיון", skills: ["Selenium", "Jest", "Jira"] },
  { id: "fullstack", title: "מפתח/ת Full Stack", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["React", "Django", "PostgreSQL"] },
  { id: "marketing-manager", title: "מנהל/ת שיווק", category: "marketing", accent: "#4ADE80", exp: "6 שנות ניסיון", skills: ["Google Ads", "SEO", "Analytics"] },
  { id: "social-media", title: "מנהל/ת מדיה חברתית", category: "marketing", accent: "#4ADE80", exp: "2 שנות ניסיון", skills: ["Instagram", "TikTok", "Content"] },
  { id: "content-writer", title: "כותב/ת תוכן", category: "marketing", accent: "#4ADE80", exp: "3 שנות ניסיון", skills: ["SEO", "Copywriting", "WordPress"] },
  { id: "sales-manager", title: "מנהל/ת מכירות", category: "marketing", accent: "#4ADE80", exp: "5 שנות ניסיון", skills: ["CRM", "B2B", "Lead Gen"] },
  { id: "accountant", title: "רואה חשבון", category: "finance", accent: "#F59E0B", exp: "7 שנות ניסיון", skills: ["Excel", "IFRS", "Tax"] },
  { id: "financial-analyst", title: "אנליסט/ית פיננסי", category: "finance", accent: "#F59E0B", exp: "4 שנות ניסיון", skills: ["Excel", "Bloomberg", "Modeling"] },
  { id: "cfo", title: "סמנכ\"ל/ית כספים", category: "finance", accent: "#F59E0B", exp: "12 שנות ניסיון", skills: ["P&L", "Fundraising", "M&A"] },
  { id: "doctor", title: "רופא/ה", category: "medical", accent: "#FB7185", exp: "8 שנות ניסיון", skills: ["אבחון", "מחקר", "כירורגיה"] },
  { id: "nurse", title: "אח/ות", category: "medical", accent: "#FB7185", exp: "5 שנות ניסיון", skills: ["ICU", "אונקולוגיה", "טיפול נמרץ"] },
  { id: "physiotherapist", title: "פיזיותרפיסט/ית", category: "medical", accent: "#FB7185", exp: "4 שנות ניסיון", skills: ["שיקום", "ספורט", "עמוד שדרה"] },
  { id: "teacher", title: "מורה", category: "education", accent: "#34D399", exp: "6 שנות ניסיון", skills: ["מתמטיקה", "הוראה", "חינוך מיוחד"] },
  { id: "principal", title: "מנהל/ת בית ספר", category: "education", accent: "#34D399", exp: "10 שנות ניסיון", skills: ["ניהול", "פדגוגיה", "קהילה"] },
  { id: "lecturer", title: "מרצה אקדמי/ת", category: "education", accent: "#34D399", exp: "8 שנות ניסיון", skills: ["מחקר", "הוראה", "פרסומים"] },
  { id: "project-manager", title: "מנהל/ת פרויקטים", category: "management", accent: "#818CF8", exp: "6 שנות ניסיון", skills: ["Scrum", "PMP", "Jira"] },
  { id: "operations", title: "מנהל/ת תפעול", category: "management", accent: "#818CF8", exp: "7 שנות ניסיון", skills: ["Logistics", "KPIs", "ERP"] },
  { id: "ceo", title: "מנכ\"ל/ית", category: "management", accent: "#818CF8", exp: "15 שנות ניסיון", skills: ["P&L", "Strategy", "Board"] },
  { id: "ux-designer", title: "מעצב/ת UX/UI", category: "design", accent: "#A78BFA", exp: "4 שנות ניסיון", skills: ["Figma", "Prototyping", "Research"] },
  { id: "graphic-designer", title: "מעצב/ת גרפי", category: "design", accent: "#A78BFA", exp: "5 שנות ניסיון", skills: ["Illustrator", "Photoshop", "Branding"] },
  { id: "lawyer", title: "עורך/ת דין", category: "law", accent: "#60A5FA", exp: "8 שנות ניסיון", skills: ["חוזים", "ליטיגציה", "M&A"] },
  { id: "legal-advisor", title: "יועץ/ת משפטי", category: "law", accent: "#60A5FA", exp: "6 שנות ניסיון", skills: ["רגולציה", "IP", "Corporate"] },
  { id: "hr-manager", title: "מנהל/ת משאבי אנוש", category: "hr", accent: "#F472B6", exp: "5 שנות ניסיון", skills: ["גיוס", "תגמול", "L&D"] },
  { id: "recruiter", title: "רקרוטר/ית", category: "hr", accent: "#F472B6", exp: "3 שנות ניסיון", skills: ["Linkedin", "Sourcing", "ATS"] },
];

function MiniCvPreview({ accent, title, skills }: { accent: string; title: string; skills: string[] }) {
  return (
    <div
      className="w-full bg-white rounded-lg overflow-hidden select-none"
      style={{ aspectRatio: "3/4", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
    >
      <div className="h-2 w-full" style={{ background: accent }} />
      <div className="p-3" dir="rtl">
        <p className="text-[8px] font-bold text-gray-800 leading-tight mb-0.5">ישראל ישראלי</p>
        <p className="text-[6px] text-gray-500 mb-2.5 truncate">{title}</p>

        <p className="text-[5.5px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>ניסיון תעסוקתי</p>
        <p className="text-[6px] font-semibold text-gray-700 mb-0.5 truncate">{title} בכיר/ה</p>
        <p className="text-[5px] text-gray-400 leading-relaxed mb-1.5 line-clamp-2">
          ניהול וביצוע תהליכים מורכבים בסביבה דינמית ורב-תחומית עם דגש על תוצאות עסקיות ומדידות.
        </p>
        <div className="h-px bg-gray-100 mb-2" />

        <p className="text-[5.5px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>כישורים</p>
        <div className="flex flex-wrap gap-0.5 mb-2.5">
          {skills.map(s => (
            <span
              key={s}
              className="text-[5px] px-1 py-0.5 rounded-full font-medium"
              style={{ background: accent + "18", color: accent }}
            >
              {s}
            </span>
          ))}
        </div>

        <p className="text-[5.5px] font-bold uppercase tracking-wide mb-1" style={{ color: accent }}>השכלה</p>
        <p className="text-[6px] font-semibold text-gray-700 mb-0.5">תואר ראשון / שני</p>
        <p className="text-[5px] text-gray-400">אוניברסיטה · 2015–2019</p>
      </div>
    </div>
  );
}

function ExampleCard({ example }: { example: typeof EXAMPLES[0] }) {
  const { lang } = useLanguage();
  const router = useRouter();

  const handleOpen = () => {
    const cvData = getSampleCv(example.id, lang);
    if (cvData) {
      try { sessionStorage.setItem("work_hunter_cv_sample", JSON.stringify(cvData)); } catch {}
    }
    router.push("/cv-builder");
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all bg-white/[0.03] hover:bg-white/[0.06]">
      <div className="p-3">
        <MiniCvPreview accent={example.accent} title={example.title} skills={example.skills} />
      </div>
      <div className="px-3 pb-3">
        <p className="text-white text-[11px] font-semibold leading-tight truncate mb-0.5">{example.title}</p>
        <p className="text-white/35 text-[10px] mb-2">{example.exp}</p>
        <button
          onClick={handleOpen}
          className="w-full text-[10px] font-semibold py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ background: example.accent + "22", color: example.accent }}
        >
          {lang === "he" ? "פתחו דוגמה" : "View Example"}
        </button>
      </div>
    </div>
  );
}

interface Props {
  compact?: boolean;
}

export default function CvExamplesContent({ compact = false }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = EXAMPLES.filter(e => {
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    const matchQ = !query || e.title.includes(query);
    return matchCat && matchQ;
  });

  return (
    <div dir="rtl">
      {!compact && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em] mb-2">
            קורות חיים לכל מקצוע
          </h2>
          <p className="text-white/50 text-sm">
            בחרו מקצוע וצרו קורות חיים מותאמים — בעברית, בכמה דקות.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="חפש מקצוע..."
          className="w-full bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/30 rounded-xl py-2 ps-4 pe-9 text-sm focus:outline-none focus:border-[#5E6AD2]/50 transition"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.id
                ? "bg-[#5E6AD2] border-[#5E6AD2] text-white shadow-md shadow-[#5E6AD2]/25"
                : "bg-white/5 border-white/10 text-white/55 hover:text-white/80 hover:border-white/20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-white/40 text-sm py-12 text-center">לא נמצאו תוצאות.</p>
      ) : (
        <>
          <p className="text-white/30 text-xs mb-4">{filtered.length} דוגמאות</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(ex => (
              <ExampleCard key={ex.id} example={ex} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
