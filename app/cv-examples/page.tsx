"use client";

import { useState } from "react";
import Link from "next/link";
import NavBarWrapper from "@/components/NavBarWrapper";
import SiteFooter from "@/components/SiteFooter";

/* ─── Data ─────────────────────────────────────────────────────────────── */

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
  // טכנולוגיה
  { id: "software-engineer", title: "מהנדס/ת תוכנה", category: "tech", accent: "#5E6AD2", exp: "5 שנות ניסיון", skills: ["React", "Node.js", "Python"] },
  { id: "product-manager", title: "מנהל/ת מוצר", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["Roadmap", "Agile", "B2B"] },
  { id: "data-scientist", title: "מדען/ית נתונים", category: "tech", accent: "#5E6AD2", exp: "3 שנות ניסיון", skills: ["Python", "ML", "SQL"] },
  { id: "devops", title: "מהנדס/ת DevOps", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["AWS", "Docker", "CI/CD"] },
  { id: "qa-engineer", title: "מהנדס/ת QA", category: "tech", accent: "#5E6AD2", exp: "3 שנות ניסיון", skills: ["Selenium", "Jest", "Jira"] },
  { id: "fullstack", title: "מפתח/ת Full Stack", category: "tech", accent: "#5E6AD2", exp: "4 שנות ניסיון", skills: ["React", "Django", "PostgreSQL"] },
  // שיווק
  { id: "marketing-manager", title: "מנהל/ת שיווק", category: "marketing", accent: "#4ADE80", exp: "6 שנות ניסיון", skills: ["Google Ads", "SEO", "Analytics"] },
  { id: "social-media", title: "מנהל/ת מדיה חברתית", category: "marketing", accent: "#4ADE80", exp: "2 שנות ניסיון", skills: ["Instagram", "TikTok", "Content"] },
  { id: "content-writer", title: "כותב/ת תוכן", category: "marketing", accent: "#4ADE80", exp: "3 שנות ניסיון", skills: ["SEO", "Copywriting", "WordPress"] },
  { id: "sales-manager", title: "מנהל/ת מכירות", category: "marketing", accent: "#4ADE80", exp: "5 שנות ניסיון", skills: ["CRM", "B2B", "Lead Gen"] },
  // כספים
  { id: "accountant", title: "רואה חשבון", category: "finance", accent: "#F59E0B", exp: "7 שנות ניסיון", skills: ["Excel", "IFRS", "Tax"] },
  { id: "financial-analyst", title: "אנליסט/ית פיננסי", category: "finance", accent: "#F59E0B", exp: "4 שנות ניסיון", skills: ["Excel", "Bloomberg", "Modeling"] },
  { id: "cfo", title: "סמנכ\"ל/ית כספים", category: "finance", accent: "#F59E0B", exp: "12 שנות ניסיון", skills: ["P&L", "Fundraising", "M&A"] },
  // רפואה
  { id: "doctor", title: "רופא/ה", category: "medical", accent: "#FB7185", exp: "8 שנות ניסיון", skills: ["אבחון", "מחקר", "כירורגיה"] },
  { id: "nurse", title: "אח/ות", category: "medical", accent: "#FB7185", exp: "5 שנות ניסיון", skills: ["ICU", "אונקולוגיה", "טיפול נמרץ"] },
  { id: "physiotherapist", title: "פיזיותרפיסט/ית", category: "medical", accent: "#FB7185", exp: "4 שנות ניסיון", skills: ["שיקום", "ספורט", "עמוד שדרה"] },
  // חינוך
  { id: "teacher", title: "מורה", category: "education", accent: "#34D399", exp: "6 שנות ניסיון", skills: ["מתמטיקה", "הוראה", "חינוך מיוחד"] },
  { id: "principal", title: "מנהל/ת בית ספר", category: "education", accent: "#34D399", exp: "10 שנות ניסיון", skills: ["ניהול", "פדגוגיה", "קהילה"] },
  { id: "lecturer", title: "מרצה אקדמי/ת", category: "education", accent: "#34D399", exp: "8 שנות ניסיון", skills: ["מחקר", "הוראה", "פרסומים"] },
  // ניהול
  { id: "project-manager", title: "מנהל/ת פרויקטים", category: "management", accent: "#818CF8", exp: "6 שנות ניסיון", skills: ["Scrum", "PMP", "Jira"] },
  { id: "operations", title: "מנהל/ת תפעול", category: "management", accent: "#818CF8", exp: "7 שנות ניסיון", skills: ["Logistics", "KPIs", "ERP"] },
  { id: "ceo", title: "מנכ\"ל/ית", category: "management", accent: "#818CF8", exp: "15 שנות ניסיון", skills: ["P&L", "Strategy", "Board"] },
  // עיצוב
  { id: "ux-designer", title: "מעצב/ת UX/UI", category: "design", accent: "#A78BFA", exp: "4 שנות ניסיון", skills: ["Figma", "Prototyping", "Research"] },
  { id: "graphic-designer", title: "מעצב/ת גרפי", category: "design", accent: "#A78BFA", exp: "5 שנות ניסיון", skills: ["Illustrator", "Photoshop", "Branding"] },
  // משפטים
  { id: "lawyer", title: "עורך/ת דין", category: "law", accent: "#60A5FA", exp: "8 שנות ניסיון", skills: ["חוזים", "ליטיגציה", "M&A"] },
  { id: "legal-advisor", title: "יועץ/ת משפטי", category: "law", accent: "#60A5FA", exp: "6 שנות ניסיון", skills: ["רגולציה", "IP", "Corporate"] },
  // משאבי אנוש
  { id: "hr-manager", title: "מנהל/ת משאבי אנוש", category: "hr", accent: "#F472B6", exp: "5 שנות ניסיון", skills: ["גיוס", "תגמול", "L&D"] },
  { id: "recruiter", title: "רקרוטר/ית", category: "hr", accent: "#F472B6", exp: "3 שנות ניסיון", skills: ["Linkedin", "Sourcing", "ATS"] },
];

/* ─── Mini CV Preview ───────────────────────────────────────────────────── */

function MiniCvPreview({ accent, title, skills }: { accent: string; title: string; skills: string[] }) {
  return (
    <div className="w-full bg-white rounded-lg overflow-hidden select-none" style={{ aspectRatio: "3/4", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      {/* Header stripe */}
      <div className="h-2 w-full" style={{ background: accent }} />
      <div className="p-3">
        {/* Name placeholder */}
        <div className="h-2.5 rounded-full w-3/4 mb-1" style={{ background: accent + "30" }} />
        <div className="h-1.5 rounded-full w-1/2 mb-3" style={{ background: accent + "18" }} />

        {/* Section: Experience */}
        <div className="h-1 rounded-full w-1/3 mb-1.5" style={{ background: accent + "40" }} />
        <div className="space-y-1 mb-3">
          <div className="h-1 rounded-full bg-gray-100 w-full" />
          <div className="h-1 rounded-full bg-gray-100 w-5/6" />
          <div className="h-1 rounded-full bg-gray-100 w-4/5" />
          <div className="h-1 rounded-full bg-gray-100 w-full" />
          <div className="h-1 rounded-full bg-gray-100 w-3/4" />
        </div>

        {/* Section: Skills */}
        <div className="h-1 rounded-full w-1/4 mb-1.5" style={{ background: accent + "40" }} />
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.map(s => (
            <span key={s} className="text-[7px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: accent + "15", color: accent }}>
              {s}
            </span>
          ))}
        </div>

        {/* Section: Education */}
        <div className="h-1 rounded-full w-1/3 mb-1.5" style={{ background: accent + "40" }} />
        <div className="space-y-1">
          <div className="h-1 rounded-full bg-gray-100 w-full" />
          <div className="h-1 rounded-full bg-gray-100 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Example Card ──────────────────────────────────────────────────────── */

function ExampleCard({ example }: { example: typeof EXAMPLES[0] }) {
  return (
    <div className="group linear-card overflow-hidden flex flex-col">
      {/* CV Preview */}
      <div className="p-4 pb-3 flex-1">
        <MiniCvPreview accent={example.accent} title={example.title} skills={example.skills} />
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <h3 className="text-white font-semibold text-sm mb-0.5 tracking-tight" dir="rtl">
          {example.title}
        </h3>
        <p className="text-white/40 text-[11px] mb-3" dir="rtl">{example.exp}</p>

        <Link
          href={`/cv-builder?role=${encodeURIComponent(example.title)}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: example.accent + "18", color: example.accent }}
          onMouseEnter={e => { e.currentTarget.style.background = example.accent + "28"; }}
          onMouseLeave={e => { e.currentTarget.style.background = example.accent + "18"; }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          צפה בדוגמה
        </Link>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function CvExamplesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = EXAMPLES.filter(e => {
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    const matchQ = !query || e.title.includes(query);
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <NavBarWrapper />

      {/* Hero */}
      <section className="py-14 md:py-20 px-4 md:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1 mb-5 border"
            style={{ background: "rgba(94,106,210,0.10)", borderColor: "rgba(94,106,210,0.22)", color: "#5E6AD2" }}>
            דוגמאות קורות חיים בעברית
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-4" dir="rtl">
            קורות חיים לכל מקצוע
          </h1>
          <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8" dir="rtl">
            דוגמאות מקצועיות בעברית לכל תחום. בחרו את המקצוע שלכם וצרו קורות חיים מותאמים אישית.
          </p>

          {/* Search */}
          <div className="relative max-w-sm mx-auto">
            <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="חפש מקצוע..."
              dir="rtl"
              className="w-full bg-white/[0.06] border border-white/[0.10] text-white placeholder-white/30 rounded-xl py-2.5 ps-4 pe-10 text-sm focus:outline-none focus:border-[#5E6AD2]/50 transition"
            />
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="px-4 md:px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={activeCategory === cat.id
                  ? { background: "#5E6AD2", color: "#fff", boxShadow: "0 2px 12px rgba(94,106,210,0.30)" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-white/40 py-16" dir="rtl">לא נמצאו תוצאות לחיפוש זה.</p>
          ) : (
            <>
              <p className="text-white/30 text-xs mb-5 text-right" dir="rtl">{filtered.length} דוגמאות</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map(ex => (
                  <ExampleCard key={ex.id} example={ex} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
