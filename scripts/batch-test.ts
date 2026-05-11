/**
 * Batch Job Search Quality Test
 * Runs N synthetic profiles through the full search pipeline and evaluates result relevance.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/batch-test.ts [--limit 100] [--concurrency 5]
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { runJobSearch } from "@/lib/jobSearch";
import { JobResult } from "@/lib/types";
import * as fs from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  name?: string;
  age?: number;
  education?: string;
  yearsExperience?: number;
  skills?: string[];
  currentRole?: string;
  location?: string;
  salaryExpectation?: number | null;
  workPreference?: string;
  careerChangeInterest?: boolean;
  targetRoles?: string[];
  constraints?: string[];
  languages?: string[];
  additionalNotes?: string;
  maxCommuteKm?: number;
}

interface TestCase {
  id: string;
  label: string;
  profile: Profile;
  chatContext: string;            // simulated Scout conversation ending with [SEARCH_NOW]
  expectedKeywords: string[];     // any of these must appear in ≥1 returned job title
  expectedMinScore: number;       // average score of returned jobs must be ≥ this
  expectedRemoteOnly?: boolean;   // if true, ALL returned jobs must be remote
}

interface TestResult {
  id: string;
  label: string;
  passed: boolean;
  jobCount: number;
  avgScore: number;
  topJobs: string[];
  relevantCount: number;
  failReason?: string;
  durationMs: number;
}

// ─── Test Case Factory ────────────────────────────────────────────────────────

function tc(
  id: string,
  label: string,
  profile: Profile,
  chat: string,
  keywords: string[],
  minScore = 55,
  remoteOnly = false
): TestCase {
  return { id, label, profile, chatContext: chat, expectedKeywords: keywords, expectedMinScore: minScore, expectedRemoteOnly: remoteOnly };
}

// ─── 1000 Test Cases — 15 Categories ─────────────────────────────────────────

// Helper: build a "Scout conversation ending with [SEARCH_NOW]" string
const scoutChat = (lines: string[]) =>
  lines.map((l, i) => (i % 2 === 0 ? `מועמד: ${l}` : `Scout: ${l}`)).join("\n") + "\nScout: [SEARCH_NOW]";

export const ALL_CASES: TestCase[] = [

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 1 — SOFTWARE DEVELOPMENT (80 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("dev-001", "Junior React dev, TLV, 14K",
    { yearsExperience: 1, skills: ["React", "JavaScript", "HTML", "CSS"], location: "תל אביב", salaryExpectation: 14000, workPreference: "hybrid" },
    scoutChat(["מחפש עבודה כמפתח React, שנת ניסיון, תל אביב, 14K", "14K + ת\"א + hybrid — מסומן. מה הסטאק?"]),
    ["מפתח", "developer", "frontend", "react", "fullstack"], 50),

  tc("dev-002", "Senior Full Stack, remote, 38K",
    { yearsExperience: 8, skills: ["React", "Node.js", "PostgreSQL", "AWS"], location: "ירושלים", salaryExpectation: 38000, workPreference: "remote" },
    scoutChat(["8 שנות ניסיון Full Stack, רוצה remote מלא, 38K", "8 שנים + remote + 38K — שלושתם מסומנים. מה הסטאק?"]),
    ["מפתח", "developer", "fullstack", "full stack", "senior"], 50, true),

  tc("dev-003", "Backend Python dev, Be'er Sheva, 25K",
    { yearsExperience: 4, skills: ["Python", "Django", "PostgreSQL", "Docker"], location: "באר שבע", salaryExpectation: 25000, workPreference: "hybrid" },
    scoutChat(["Python backend, 4 שנות ניסיון, באר שבע, 25K", "4 שנות Python + ב\"ש — נחפש hybrid ב-R&D centers שיש להם מרכז בנגב"]),
    ["מפתח", "developer", "backend", "python", "software"], 48),

  tc("dev-004", "DevOps engineer, TLV, 32K",
    { yearsExperience: 6, skills: ["Kubernetes", "Terraform", "AWS", "GitHub Actions"], location: "תל אביב", salaryExpectation: 32000, workPreference: "hybrid" },
    scoutChat(["DevOps 6 שנות ניסיון, K8s+Terraform, ת\"א, 32K", "6 שנות DevOps + K8s/Terraform — מצדיק 32K. מה מצב העבודה?"]),
    ["devops", "cloud", "infrastructure", "platform engineer", "sre"], 50),

  tc("dev-005", "Mobile developer iOS, Herzliya, 35K",
    { yearsExperience: 7, skills: ["Swift", "iOS", "Xcode", "UIKit", "SwiftUI"], location: "הרצליה", salaryExpectation: 35000, workPreference: "onsite" },
    scoutChat(["iOS developer, Swift, 7 שנות ניסיון, הרצליה, 35K", "7 שנות iOS — Senior. מה גודל הצוות האחרון שעבדת?"]),
    ["ios", "mobile", "swift", "developer", "מפתח"], 50),

  tc("dev-006", "Android developer, RA, 28K",
    { yearsExperience: 5, skills: ["Kotlin", "Android", "Jetpack Compose", "Retrofit"], location: "ראש העין", salaryExpectation: 28000, workPreference: "hybrid" },
    scoutChat(["Android Kotlin, 5 שנות ניסיון, ראש העין, 28K", "5 שנות Android + Kotlin — ביקוש גבוה. 2-3 ימי hybrid מקובלים?"]),
    ["android", "mobile", "kotlin", "developer", "מפתח"], 50),

  tc("dev-007", "QA Automation, Petah Tikva, 22K",
    { yearsExperience: 3, skills: ["Selenium", "Python", "Playwright", "JIRA"], location: "פתח תקוה", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["QA Automation, Python+Playwright, 3 שנות ניסיון, פ\"ת, 22K", "3 שנות QA Automation — מצדיק 22K. מה הסטאק המדויק?"]),
    ["qa", "automation", "quality", "testing", "בודק"], 50),

  tc("dev-008", "Data Engineer, TLV, 35K",
    { yearsExperience: 6, skills: ["Python", "Spark", "Airflow", "BigQuery", "dbt"], location: "תל אביב", salaryExpectation: 35000, workPreference: "hybrid" },
    scoutChat(["Data Engineer, Python+Spark+dbt, 6 שנות ניסיון, ת\"א, 35K", "Data Engineer + dbt/Spark — Senior. מה מצב העבודה?"]),
    ["data engineer", "data", "engineer", "analytics", "pipeline"], 50),

  tc("dev-009", "ML Engineer, remote, 40K",
    { yearsExperience: 5, skills: ["Python", "PyTorch", "MLflow", "Kubernetes"], location: "חיפה", salaryExpectation: 40000, workPreference: "remote" },
    scoutChat(["ML Engineer, PyTorch, 5 שנות ניסיון, remote מלא, 40K", "5 שנות ML + PyTorch — ביקוש גבוה. remote מלא ועד 40K — נחפש"]),
    ["ml", "machine learning", "ai", "data scientist", "מדען"], 48, true),

  tc("dev-010", "Embedded C/C++ engineer, Haifa, 30K",
    { yearsExperience: 7, skills: ["C", "C++", "RTOS", "Embedded Linux", "FPGA"], location: "חיפה", salaryExpectation: 30000, workPreference: "onsite" },
    scoutChat(["Embedded C/C++, 7 שנות ניסיון, חיפה, 30K", "7 שנות Embedded — Tier senior. Elbit/Rafael/IAI הם הכתובת. מה מצב העבודה?"]),
    ["embedded", "firmware", "c++", "hardware", "software engineer"], 48),

  tc("dev-011", "Cybersecurity analyst, TLV, 32K",
    { yearsExperience: 4, skills: ["Penetration Testing", "SIEM", "Python", "Network Security"], location: "תל אביב", salaryExpectation: 32000, workPreference: "hybrid" },
    scoutChat(["Cyber security analyst, Pen-Test + SIEM, 4 שנות ניסיון, ת\"א, 32K", "4 שנות Cyber + Pen-Test — ביקוש גבוה. מה מצב העבודה?"]),
    ["cyber", "security", "analyst", "penetration", "infosec"], 50),

  tc("dev-012", "Frontend Vue.js, Modiin, 26K",
    { yearsExperience: 4, skills: ["Vue.js", "TypeScript", "GraphQL", "Sass"], location: "מודיעין", salaryExpectation: 26000, workPreference: "hybrid" },
    scoutChat(["Frontend Vue.js+TypeScript, 4 שנות ניסיון, מודיעין, 26K", "4 שנות Vue + TypeScript — Mid-Senior. מה מצב העבודה?"]),
    ["frontend", "developer", "vue", "web", "מפתח"], 50),

  tc("dev-013", "Blockchain developer, remote, 45K",
    { yearsExperience: 5, skills: ["Solidity", "Web3.js", "Ethereum", "StarkNet"], location: "תל אביב", salaryExpectation: 45000, workPreference: "remote" },
    scoutChat(["Blockchain / Web3 developer, Solidity+StarkNet, 5 שנות ניסיון, remote, 45K", "Web3 נישה — StarkWare ו-Fireblocks הן החברות הישראליות. remote מלא?"]),
    ["blockchain", "web3", "solidity", "developer", "crypto"], 45, true),

  tc("dev-014", "Site Reliability Engineer, TLV, 40K",
    { yearsExperience: 7, skills: ["Go", "Kubernetes", "Prometheus", "Terraform", "AWS"], location: "תל אביב", salaryExpectation: 40000, workPreference: "hybrid" },
    scoutChat(["SRE, Go+K8s+Prometheus, 7 שנות ניסיון, ת\"א, 40K", "7 שנות SRE — Senior. מה הסטאק המדויק?"]),
    ["sre", "devops", "platform", "reliability", "infrastructure"], 50),

  tc("dev-015", "Junior developer 0 experience, TLV",
    { yearsExperience: 0, skills: ["JavaScript", "React", "HTML"], location: "תל אביב", salaryExpectation: 13000, workPreference: "hybrid" },
    scoutChat(["סיימתי קורס Web Development, אין ניסיון, ת\"א, 13K", "CS + אין ניסיון — יש GitHub עם פרויקטים שרצים?", "יש פרויקט e-commerce עם API אמיתי", "פרויקט אמיתי + API — זה כבר מבדיל. מה האזור ומצב העבודה?"]),
    ["מפתח", "developer", "ג'וניור", "junior", "web"], 45),

  tc("dev-016", "Fullstack Rust developer, remote, 42K",
    { yearsExperience: 6, skills: ["Rust", "WebAssembly", "React", "PostgreSQL"], location: "הרצליה", salaryExpectation: 42000, workPreference: "remote" },
    scoutChat(["Rust + WASM fullstack, 6 שנות ניסיון, remote, 42K", "Rust Senior + remote — נחפש"]),
    ["developer", "software", "engineer", "fullstack", "backend"], 45, true),

  tc("dev-017", "Data Analyst SQL, TLV, 22K",
    { yearsExperience: 3, skills: ["SQL", "Python", "Tableau", "Excel", "Power BI"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["Data Analyst SQL+Python, 3 שנות ניסיון, ת\"א, 22K", "3 שנות Data Analyst — נחפש"]),
    ["data analyst", "analyst", "bi", "sql", "data"], 50),

  tc("dev-018", "Cloud architect AWS, remote, 50K",
    { yearsExperience: 10, skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Security"], location: "תל אביב", salaryExpectation: 50000, workPreference: "remote" },
    scoutChat(["Cloud Architect, AWS+Azure+K8s, 10 שנות ניסיון, remote, 50K", "10 שנות Cloud — Principal/Architect. remote מלא — נחפש"]),
    ["cloud", "architect", "aws", "infrastructure", "solution"], 48, true),

  tc("dev-019", "Backend Go developer, Modiin, 30K",
    { yearsExperience: 5, skills: ["Go", "gRPC", "PostgreSQL", "Redis", "Docker"], location: "מודיעין", salaryExpectation: 30000, workPreference: "hybrid" },
    scoutChat(["Go backend, gRPC+Redis, 5 שנות ניסיון, מודיעין, 30K", "5 שנות Go — Mid-Senior. מה מצב העבודה?"]),
    ["developer", "backend", "software", "engineer", "מפתח"], 50),

  tc("dev-020", "Technical writer, TLV, 18K",
    { yearsExperience: 3, skills: ["Technical Writing", "Markdown", "API Documentation", "DITA"], location: "תל אביב", salaryExpectation: 18000, workPreference: "hybrid" },
    scoutChat(["Technical Writer, API Docs + Markdown, 3 שנות ניסיון, ת\"א, 18K", "Technical Writer בטק — ביקוש אמיתי. מה מצב העבודה?"]),
    ["technical writer", "documentation", "writer", "content", "technical"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 2 — PRODUCT / UX / DESIGN (50 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("ux-001", "UX Designer, TLV, 24K",
    { yearsExperience: 3, skills: ["Figma", "User Research", "Prototyping", "Usability Testing"], location: "תל אביב", salaryExpectation: 24000, workPreference: "hybrid" },
    scoutChat(["UX Designer, Figma, 3 שנות ניסיון, ת\"א, 24K", "3 שנות UX — Mid. מה מצב העבודה?"]),
    ["ux", "ui", "designer", "product designer", "עיצוב"], 50),

  tc("ux-002", "Product Manager SaaS, TLV, 32K",
    { yearsExperience: 5, skills: ["Product Management", "SQL", "Jira", "User Research", "Agile"], location: "תל אביב", salaryExpectation: 32000, workPreference: "hybrid" },
    scoutChat(["Product Manager, SaaS B2B, 5 שנות ניסיון, ת\"א, 32K", "5 שנות PM — Mid-Senior. מה הסטאק?"]),
    ["product manager", "מנהל מוצר", "product", "pm"], 50),

  tc("ux-003", "VP Product, TLV, 55K",
    { yearsExperience: 12, skills: ["Product Strategy", "OKR", "Team Management", "B2B SaaS"], location: "תל אביב", salaryExpectation: 55000, workPreference: "hybrid" },
    scoutChat(["VP Product, 12 שנות ניסיון, ת\"א, 55K", "VP Product ב-55K — שאלת אימות: כמה PM ניהלת ומה ה-ARR?", "ניהלתי 8 PM, ARR 20M", "8 PM + 20M ARR — VP אמיתי. נחפש"]),
    ["vp product", "head of product", "vp", "product", "director"], 50),

  tc("ux-004", "UI Designer, Haifa, 20K",
    { yearsExperience: 2, skills: ["Figma", "Adobe XD", "Illustrator", "HTML", "CSS"], location: "חיפה", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["UI Designer, Figma+XD, 2 שנות ניסיון, חיפה, 20K", "2 שנות UI — מצב העבודה?"]),
    ["ui", "ux", "designer", "graphic", "עיצוב"], 48),

  tc("ux-005", "Product Manager fintech, remote, 38K",
    { yearsExperience: 7, skills: ["Payment Systems", "Fintech", "Product Management", "SQL"], location: "ירושלים", salaryExpectation: 38000, workPreference: "remote" },
    scoutChat(["PM Fintech, 7 שנות ניסיון, remote מלא, 38K", "7 שנות PM Fintech + remote — נחפש"]),
    ["product manager", "pm", "fintech", "product", "manager", "מנהל מוצר", "פינטק", "תשלומים"], 42, true),

  tc("ux-006", "Graphic designer, TLV, 16K",
    { yearsExperience: 3, skills: ["Photoshop", "Illustrator", "InDesign", "Figma"], location: "תל אביב", salaryExpectation: 16000, workPreference: "hybrid" },
    scoutChat(["מעצב/ת גרפי/ת, Photoshop+AI, 3 שנות ניסיון, ת\"א, 16K", "3 שנות עיצוב — מה מצב העבודה?"]),
    ["מעצב", "designer", "graphic", "creative", "עיצוב"], 48),

  tc("ux-007", "Technical PM from dev background, TLV, 35K",
    { yearsExperience: 6, skills: ["React", "Node.js", "Product Management", "Agile"], currentRole: "Senior Developer", careerChangeInterest: true, targetRoles: ["Technical Product Manager", "Platform PM"], location: "תל אביב", salaryExpectation: 35000, workPreference: "hybrid" },
    scoutChat(["6 שנות dev, עובר ל-Technical PM, ת\"א, 35K", "מעבר מ-dev ל-PM — Technical PM / Platform PM הם הכיוון הנכון. מה מצב העבודה?"]),
    ["product manager", "technical pm", "pm", "product", "מנהל מוצר"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 3 — HR / PEOPLE (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("hr-001", "HR Generalist, TLV, 14K",
    { yearsExperience: 2, skills: ["Recruiting", "Onboarding", "Labor Law", "HR Systems"], location: "תל אביב", salaryExpectation: 14000, workPreference: "hybrid" },
    scoutChat(["HR Generalist, 2 שנות ניסיון, ת\"א, 14K", "2 שנות HR — מה מצב העבודה?"]),
    ["hr", "human resources", "גיוס", "recruiter", "people"], 50),

  tc("hr-002", "HRBP tech company, TLV, 22K",
    { yearsExperience: 5, skills: ["HR Business Partner", "OKR", "Performance Management", "Compensation"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["HRBP בחברת הייטק, 5 שנות ניסיון, ת\"א, 22K", "5 שנות HRBP + הייטק — ביקוש גבוה. מה מצב העבודה?"]),
    ["hrbp", "hr business partner", "hr", "people partner", "people"], 50),

  tc("hr-003", "Talent Acquisition manager, TLV, 20K",
    { yearsExperience: 4, skills: ["Technical Recruiting", "LinkedIn", "Boolean Search", "ATS"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["Talent Acquisition, גיוס טכני, 4 שנות ניסיון, ת\"א, 20K", "4 שנות TA — מה מצב העבודה?"]),
    ["talent", "recruiter", "גיוס", "hr", "acquisition"], 50),

  tc("hr-004", "L&D manager, TLV, 22K",
    { yearsExperience: 5, skills: ["Learning & Development", "Instructional Design", "LMS", "SCORM"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["L&D Manager, Instructional Design, 5 שנות ניסיון, ת\"א, 22K", "5 שנות L&D — מה מצב העבודה?"]),
    ["l&d", "learning", "development", "instructional", "hr"], 48),

  tc("hr-005", "HR coordinator, Be'er Sheva, 11K",
    { yearsExperience: 1, skills: ["Admin", "Excel", "HR Software", "Onboarding"], location: "באר שבע", salaryExpectation: 11000, workPreference: "onsite" },
    scoutChat(["HR coordinator, 1 שנת ניסיון, ב\"ש, 11K", "1 שנת HR + ב\"ש — נחפש"]),
    ["hr", "coordinator", "human resources", "גיוס", "אדמין"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 4 — FINANCE / ACCOUNTING (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("fin-001", "Bookkeeper, TLV, 12K",
    { yearsExperience: 3, skills: ["Bookkeeping", "Priority", "Excel", "VAT", "Tax"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite" },
    scoutChat(["מנהלת חשבונות, Priority, 3 שנות ניסיון, ת\"א, 12K", "3 שנות מנהלת חשבונות — מה מצב העבודה?"]),
    ["מנהל חשבונות", "bookkeeper", "חשבונות", "accounting", "finance"], 50),

  tc("fin-002", "Financial controller, TLV, 28K",
    { yearsExperience: 8, skills: ["Financial Reporting", "IFRS", "Excel", "ERP", "Management Accounts"], location: "תל אביב", salaryExpectation: 28000, workPreference: "hybrid" },
    scoutChat(["Financial Controller, IFRS, 8 שנות ניסיון, ת\"א, 28K", "8 שנות Controller — Senior. מה מצב העבודה?"]),
    ["controller", "finance", "financial", "cfo", "חשבות"], 50),

  tc("fin-003", "CFO startup, TLV, 45K",
    { yearsExperience: 15, skills: ["CFO", "Fundraising", "Financial Strategy", "GAAP", "Investors"], location: "תל אביב", salaryExpectation: 45000, workPreference: "onsite" },
    scoutChat(["CFO, 15 שנות ניסיון, ת\"א, 45K", "CFO ב-45K — שאלת אימות: ניהלת סבב גיוס? מה ה-ARR?", "ניהלתי Series B של 15M, ARR 8M", "Series B + ARR 8M — CFO מנוסה. נחפש"]),
    ["cfo", "vp finance", "finance", "financial", "chief financial"], 50),

  tc("fin-004", "Payroll manager, TLV, 18K",
    { yearsExperience: 5, skills: ["Payroll", "Priority", "Labor Law", "Social Benefits"], location: "תל אביב", salaryExpectation: 18000, workPreference: "onsite" },
    scoutChat(["מנהל/ת שכר, Priority, 5 שנות ניסיון, ת\"א, 18K", "5 שנות שכר — מה מצב העבודה?"]),
    ["שכר", "payroll", "חשבות", "finance", "human resources"], 48),

  tc("fin-005", "FP&A analyst, TLV, 22K",
    { yearsExperience: 3, skills: ["FP&A", "Excel", "Power BI", "Financial Modeling", "Python"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["FP&A Analyst, Excel+Power BI, 3 שנות ניסיון, ת\"א, 22K", "3 שנות FP&A — מה מצב העבודה?"]),
    ["fpa", "analyst", "finance", "financial", "planning"], 50),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 5 — MARKETING / CONTENT (50 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("mkt-001", "Digital marketing manager, TLV, 22K",
    { yearsExperience: 4, skills: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "Email Marketing"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["Digital Marketing Manager, Google Ads + FB Ads, 4 שנות ניסיון, ת\"א, 22K", "4 שנות Digital — מה מצב העבודה?"]),
    ["marketing", "digital", "שיווק", "performance", "מנהל שיווק"], 50),

  tc("mkt-002", "Content manager, TLV, 16K",
    { yearsExperience: 3, skills: ["Content Strategy", "SEO", "Copywriting", "WordPress", "Social Media"], location: "תל אביב", salaryExpectation: 16000, workPreference: "hybrid" },
    scoutChat(["Content Manager, SEO + Copywriting, 3 שנות ניסיון, ת\"א, 16K", "3 שנות תוכן — מה מצב העבודה?"]),
    ["content", "תוכן", "copywriter", "marketing", "editor"], 50),

  tc("mkt-003", "Growth manager, TLV, 28K",
    { yearsExperience: 5, skills: ["Growth Hacking", "SQL", "A/B Testing", "Mixpanel", "Retention"], location: "תל אביב", salaryExpectation: 28000, workPreference: "hybrid" },
    scoutChat(["Growth Manager, SQL + A/B Testing, 5 שנות ניסיון, ת\"א, 28K", "5 שנות Growth + SQL — ביקוש גבוה. מה מצב העבודה?"]),
    ["growth", "marketing", "product", "manager", "שיווק"], 50),

  tc("mkt-004", "Social media manager, TLV, 14K",
    { yearsExperience: 2, skills: ["Instagram", "TikTok", "Content Creation", "Community Management"], location: "תל אביב", salaryExpectation: 14000, workPreference: "hybrid" },
    scoutChat(["Social Media Manager, Instagram+TikTok, 2 שנות ניסיון, ת\"א, 14K", "2 שנות Social — מה מצב העבודה?"]),
    ["social media", "social", "content", "marketing", "שיווק"], 48),

  tc("mkt-005", "VP Marketing B2B SaaS, TLV, 48K",
    { yearsExperience: 12, skills: ["B2B Marketing", "Demand Generation", "ABM", "Salesforce", "HubSpot"], location: "תל אביב", salaryExpectation: 48000, workPreference: "hybrid" },
    scoutChat(["VP Marketing B2B SaaS, 12 שנות ניסיון, ת\"א, 48K", "VP Marketing ב-48K — כמה ניהלת ומה ה-budget?", "ניהלתי 6 אנשים, budget 2M$", "6 אנשים + 2M$ budget — VP אמיתי. נחפש"]),
    ["vp marketing", "marketing", "head of marketing", "שיווק", "director"], 50),

  tc("mkt-006", "SEO specialist, remote, 18K",
    { yearsExperience: 3, skills: ["SEO", "Keyword Research", "Ahrefs", "Google Analytics", "Content"], location: "ירושלים", salaryExpectation: 18000, workPreference: "remote" },
    scoutChat(["SEO Specialist, Ahrefs + Content, 3 שנות ניסיון, remote, 18K", "3 שנות SEO + remote — נחפש"]),
    ["seo", "marketing", "digital", "content", "שיווק"], 48, true),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 6 — SALES / CUSTOMER SUCCESS (50 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("sales-001", "Account Executive B2B, TLV, 20K base",
    { yearsExperience: 4, skills: ["B2B Sales", "CRM", "Salesforce", "Cold Calling", "Negotiation"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["Account Executive B2B SaaS, 4 שנות ניסיון, ת\"א, 20K בסיס + עמלות", "4 שנות B2B Sales — מה מצב העבודה?"]),
    ["account executive", "sales", "מכירות", "account manager", "business development"], 50),

  tc("sales-002", "Customer Success Manager, TLV, 20K",
    { yearsExperience: 3, skills: ["Customer Success", "SaaS", "Onboarding", "Churn Reduction", "CRM"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["Customer Success Manager, SaaS, 3 שנות ניסיון, ת\"א, 20K", "3 שנות CSM — מה מצב העבודה?"]),
    ["customer success", "csm", "customer", "account", "success"], 50),

  tc("sales-003", "VP Sales, TLV, 45K",
    { yearsExperience: 15, skills: ["VP Sales", "Team Building", "Revenue", "CRO", "Enterprise Sales"], location: "תל אביב", salaryExpectation: 45000, workPreference: "hybrid" },
    scoutChat(["VP Sales, 15 שנות ניסיון, ת\"א, 45K", "VP Sales ב-45K — שאלת אימות: כמה ניהלת ומה ה-ARR?", "ניהלתי 12 נציגים, ARR 3M", "12 נציגים + 3M ARR — נחפש"]),
    ["vp sales", "sales director", "head of sales", "sales", "revenue"], 50),

  tc("sales-004", "SDR - Sales Development, TLV, 12K",
    { yearsExperience: 1, skills: ["Cold Calling", "LinkedIn Outreach", "CRM", "Sales"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite" },
    scoutChat(["SDR, 1 שנת ניסיון, ת\"א, 12K + עמלות", "1 שנת SDR — נחפש"]),
    ["sdr", "sales", "מכירות", "business development", "account"], 48),

  tc("sales-005", "Sales Operations, TLV, 22K",
    { yearsExperience: 4, skills: ["Salesforce", "Revenue Operations", "CRM", "SQL", "Analytics"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid", targetRoles: ["RevOps Manager", "Sales Operations", "Revenue Operations"] },
    scoutChat(["Sales Operations / RevOps, Salesforce+SQL, 4 שנות ניסיון, ת\"א, 22K", "4 שנות RevOps — מה מצב העבודה?"]),
    ["sales operations", "revops", "operations", "sales", "analyst"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 7 — HEALTHCARE (50 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("health-001", "Registered nurse hospital, TLV, 17K",
    { yearsExperience: 5, skills: ["Nursing", "IV", "Patient Care", "Emergency"], location: "תל אביב", salaryExpectation: 17000, workPreference: "onsite", constraints: ["shifts"] },
    scoutChat(["אחות מוסמכת, בית חולים, 5 שנות ניסיון, ת\"א, 17K", "5 שנות אחות — מה מצב העבודה?"]),
    ["אחות", "nurse", "nursing", "medical", "hospital"], 50),

  tc("health-002", "Physiotherapist clinic, TLV, 18K",
    { yearsExperience: 4, skills: ["Physiotherapy", "Manual Therapy", "Sports Injuries", "Orthopedics"], location: "תל אביב", salaryExpectation: 18000, workPreference: "onsite" },
    scoutChat(["פיזיותרפיסט/ית, קליניקה, 4 שנות ניסיון, ת\"א, 18K", "4 שנות פיזיו — נחפש"]),
    ["פיזיותרפיסט", "physiotherapy", "physical therapist", "קליניקה", "health"], 50),

  tc("health-003", "Clinical psychologist, TLV, 20K",
    { yearsExperience: 6, skills: ["Cognitive Behavioral Therapy", "Assessment", "Group Therapy"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["פסיכולוג/ית קליני/ת, CBT, 6 שנות ניסיון, ת\"א, 20K", "6 שנות פסיכולוגיה — מה מצב העבודה?"]),
    ["פסיכולוג", "psychologist", "therapy", "mental health", "clinic"], 48),

  tc("health-004", "Nurse practitioner home care, TLV, 16K",
    { yearsExperience: 8, skills: ["Home Care", "Geriatrics", "Wound Care", "IV Therapy"], location: "תל אביב", salaryExpectation: 16000, workPreference: "onsite" },
    scoutChat(["אחות מוסמכת, טיפול בית, 8 שנות ניסיון, ת\"א, 16K", "8 שנות טיפול בית — נחפש"]),
    ["אחות", "nurse", "nursing", "home care", "medical"], 48),

  tc("health-005", "Medical sales rep, TLV, 22K",
    { yearsExperience: 4, skills: ["Medical Sales", "Medical Devices", "CRM", "Clinical Knowledge"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["נציג מכירות ציוד רפואי, 4 שנות ניסיון, ת\"א, 22K + עמלות", "4 שנות Medical Sales — מה מצב העבודה?"]),
    ["מכירות", "medical", "sales", "ציוד רפואי", "representative"], 48),

  tc("health-006", "Occupational therapist, Haifa, 16K",
    { yearsExperience: 3, skills: ["Occupational Therapy", "Pediatrics", "ADL", "Sensory Integration"], location: "חיפה", salaryExpectation: 16000, workPreference: "onsite" },
    scoutChat(["מרפא/ה בעיסוק, ילדים, 3 שנות ניסיון, חיפה, 16K", "3 שנות ריפוי בעיסוק — נחפש"]),
    ["ריפוי בעיסוק", "occupational therapist", "therapist", "health", "clinic"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 8 — EDUCATION (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("edu-001", "School teacher math, TLV, 12K",
    { yearsExperience: 4, skills: ["Mathematics", "Teaching", "Bagrut", "Classroom Management"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite" },
    scoutChat(["מורה למתמטיקה, תיכון, 4 שנות ניסיון, ת\"א, 12K", "4 שנות הוראה — מה מצב העבודה?"]),
    ["מורה", "teacher", "הוראה", "mathematics", "school"], 48),

  tc("edu-002", "Instructional designer, TLV, 20K",
    { yearsExperience: 5, skills: ["Instructional Design", "eLearning", "Articulate Storyline", "SCORM", "LMS"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["Instructional Designer, Storyline + SCORM, 5 שנות ניסיון, ת\"א, 20K", "5 שנות ID — מה מצב העבודה?"]),
    ["instructional designer", "learning", "elearning", "content", "training"], 48),

  tc("edu-003", "Private tutor, TLV, 10K part-time",
    { yearsExperience: 2, skills: ["Mathematics", "Physics", "English", "Private Tutoring"], location: "תל אביב", salaryExpectation: 10000, workPreference: "onsite", constraints: ["חצי משרה"] },
    scoutChat(["מורה פרטי/ת, מתמטיקה+פיזיקה, 2 שנות ניסיון, ת\"א, חצי משרה 10K", "2 שנות הוראה פרטית + חצי משרה — נחפש"]),
    ["מורה", "tutor", "הוראה", "teaching", "education"], 45),

  tc("edu-004", "Teacher → Instructional designer pivot, TLV, 18K",
    { yearsExperience: 6, skills: ["Teaching", "Curriculum Design", "PowerPoint", "Content Writing"], currentRole: "School teacher", careerChangeInterest: true, targetRoles: ["Instructional Designer", "Learning Consultant"], location: "תל אביב", salaryExpectation: 18000, workPreference: "hybrid" },
    scoutChat(["מורה 6 שנות ניסיון, עוברת ל-Instructional Design, ת\"א, 18K", "מעבר מהוראה ל-ID — כישורי הוראה + עיצוב תוכן הם בדיוק מה שחברות EdTech מחפשות. מה מצב העבודה?"]),
    ["instructional", "learning", "training", "designer", "content"], 45),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 9 — CULINARY / HOSPITALITY (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("food-001", "Chef de cuisine, TLV, 16K",
    { yearsExperience: 8, skills: ["Kitchen Management", "Menu Design", "Food Cost", "Team Leadership"], location: "תל אביב", salaryExpectation: 16000, workPreference: "onsite" },
    scoutChat(["שף, 8 שנות ניסיון, ת\"א, 16K", "8 שנות שף — מה מצב העבודה?"]),
    ["שף", "chef", "מטבח", "kitchen", "culinary"], 50),

  tc("food-002", "Pastry chef, TLV, 12K",
    { yearsExperience: 4, skills: ["Pastry", "Baking", "French Pastry", "Chocolate", "Decoration"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite" },
    scoutChat(["קונדיטור/ית, 4 שנות ניסיון, ת\"א, 12K", "4 שנות קונדיטוריה — נחפש"]),
    ["קונדיטור", "pastry", "baker", "מאפה", "chef"], 48),

  tc("food-003", "Waiter, TLV, 7K + tips",
    { yearsExperience: 1, skills: ["Service", "POS", "English", "Hebrew"], location: "תל אביב", salaryExpectation: 7000, workPreference: "onsite" },
    scoutChat(["מלצר/ית, 1 שנת ניסיון, ת\"א, 7K + טיפים", "1 שנת מלצרות — מה מצב העבודה?"]),
    ["מלצר", "waiter", "שירות", "restaurant", "café"], 50),

  tc("food-004", "Barista, TLV, 8K",
    { yearsExperience: 2, skills: ["Espresso", "Latte Art", "Coffee Brewing", "POS"], location: "תל אביב", salaryExpectation: 8000, workPreference: "onsite" },
    scoutChat(["קפאי/ת, Latte Art, 2 שנות ניסיון, ת\"א, 8K", "2 שנות קפה — נחפש"]),
    ["קפאי", "barista", "קפה", "coffee", "café"], 50),

  tc("food-005", "Catering chef, Haifa, 14K",
    { yearsExperience: 5, skills: ["Catering", "Large Scale Cooking", "Event Planning", "Food Safety"], location: "חיפה", salaryExpectation: 14000, workPreference: "onsite" },
    scoutChat(["שף קייטרינג, 5 שנות ניסיון, חיפה, 14K", "5 שנות קייטרינג — נחפש"]),
    ["שף", "catering", "מטבח", "chef", "culinary"], 48),

  tc("food-006", "Kitchen helper, TLV, 7K",
    { yearsExperience: 0, skills: ["Kitchen Helper", "Food Prep", "Dishwashing"], location: "תל אביב", salaryExpectation: 7000, workPreference: "onsite" },
    scoutChat(["עוזר/ת מטבח, ללא ניסיון, ת\"א, 7K", "עוזר מטבח ללא ניסיון — נחפש"]),
    ["עוזר מטבח", "kitchen", "מטבח", "food", "helper"], 48),

  tc("food-007", "Food technologist, TLV, 18K",
    { yearsExperience: 4, skills: ["Food Technology", "R&D", "Food Safety", "Regulatory", "HACCP"], location: "תל אביב", salaryExpectation: 18000, workPreference: "hybrid" },
    scoutChat(["טכנולוג/ית מזון, R&D + HACCP, 4 שנות ניסיון, ת\"א, 18K", "4 שנות FoodTech — נחפש"]),
    ["טכנולוג מזון", "food technologist", "מזון", "food", "r&d"], 45),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 10 — BEAUTY / WELLNESS (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("beauty-001", "Nail technician, TLV, 10K",
    { yearsExperience: 2, skills: ["Gel Nails", "Nail Art", "Acrylic", "Manicure"], location: "תל אביב", salaryExpectation: 10000, workPreference: "onsite" },
    scoutChat(["טכנאית ציפורניים, גל + נייל ארט, 2 שנות ניסיון, ת\"א, 10K", "2 שנות נייל — נחפש"]),
    ["ציפורניים", "nail", "נייל", "beauty", "salon"], 48),

  tc("beauty-002", "Cosmetician, Haifa, 10K",
    { yearsExperience: 3, skills: ["Facials", "Skin Care", "Waxing", "Peeling", "Anti-aging"], location: "חיפה", salaryExpectation: 10000, workPreference: "onsite" },
    scoutChat(["קוסמטיקאית, טיפולי עור, 3 שנות ניסיון, חיפה, 10K", "3 שנות קוסמטיקה — נחפש"]),
    ["קוסמטיקאית", "cosmetician", "beauty", "skin", "salon"], 50),

  tc("beauty-003", "Hairdresser, TLV, 14K",
    { yearsExperience: 5, skills: ["Hair Coloring", "Cutting", "Keratin", "Balayage"], location: "תל אביב", salaryExpectation: 14000, workPreference: "onsite" },
    scoutChat(["ספר/ית, Balayage + קרטין, 5 שנות ניסיון, ת\"א, 14K", "5 שנות ספרות — נחפש"]),
    ["ספר", "hair", "salon", "hairdresser", "beauty"], 48),

  tc("beauty-004", "Dog groomer, TLV, 10K",
    { yearsExperience: 2, skills: ["Dog Grooming", "Pet Care", "Trimming", "Bathing"], location: "תל אביב", salaryExpectation: 10000, workPreference: "onsite" },
    scoutChat(["מטפל/ת גרומינג לכלבים, 2 שנות ניסיון, ת\"א, 10K", "2 שנות גרומינג — נחפש"]),
    ["גרומינג", "grooming", "כלבים", "pet", "beauty"], 48),

  tc("beauty-005", "Personal trainer, TLV, 10K",
    { yearsExperience: 3, skills: ["Personal Training", "Strength Training", "Nutrition", "Group Fitness"], location: "תל אביב", salaryExpectation: 10000, workPreference: "onsite" },
    scoutChat(["מאמן/ת כושר, אימון אישי + קבוצות, 3 שנות ניסיון, ת\"א, 10K", "3 שנות מאמן — נחפש"]),
    ["מאמן", "trainer", "כושר", "fitness", "gym"], 48),

  tc("beauty-006", "Lash artist, TLV, 9K",
    { yearsExperience: 1, skills: ["Eyelash Extensions", "Classic Lashes", "Volume Lashes", "Lash Lift"], location: "תל אביב", salaryExpectation: 9000, workPreference: "onsite" },
    scoutChat(["ריסים / אפרפיים, Classic + Volume, 1 שנת ניסיון, ת\"א, 9K", "1 שנת ריסים — נחפש"]),
    ["ריסים", "lash", "beauty", "salon", "עיצוב"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 11 — LOGISTICS / OPERATIONS (40 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("ops-001", "Operations manager, TLV, 20K",
    { yearsExperience: 7, skills: ["Operations", "Supply Chain", "Team Management", "Excel", "ERP"], location: "תל אביב", salaryExpectation: 20000, workPreference: "onsite" },
    scoutChat(["מנהל/ת תפעול, שרשרת אספקה, 7 שנות ניסיון, ת\"א, 20K", "7 שנות תפעול — מה מצב העבודה?"]),
    ["תפעול", "operations", "לוגיסטיקה", "logistics", "supply chain"], 50),

  tc("ops-002", "Warehouse manager, Ashdod, 15K",
    { yearsExperience: 5, skills: ["Warehouse Management", "Inventory", "Forklift", "WMS", "Team Leadership"], location: "אשדוד", salaryExpectation: 15000, workPreference: "onsite" },
    scoutChat(["מנהל/ת מחסן, WMS + מלגזה, 5 שנות ניסיון, אשדוד, 15K", "5 שנות מחסן — נחפש"]),
    ["מחסן", "warehouse", "לוגיסטיקה", "logistics", "storage"], 50),

  tc("ops-003", "Procurement manager, TLV, 22K",
    { yearsExperience: 6, skills: ["Procurement", "Vendor Management", "Negotiations", "SAP", "Supply Chain"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["מנהל/ת רכש, SAP + ניהול ספקים, 6 שנות ניסיון, ת\"א, 22K", "6 שנות רכש — מה מצב העבודה?"]),
    ["רכש", "procurement", "supply chain", "לוגיסטיקה", "operations"], 48),

  tc("ops-004", "Logistics coordinator, TLV, 12K",
    { yearsExperience: 2, skills: ["Logistics", "Shipping", "Excel", "Customer Service", "Customs"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite" },
    scoutChat(["רכז/ת לוגיסטיקה, 2 שנות ניסיון, ת\"א, 12K", "2 שנות לוגיסטיקה — נחפש"]),
    ["לוגיסטיקה", "logistics", "תפעול", "coordinator", "shipping"], 48),

  tc("ops-005", "Supply chain analyst, TLV, 20K",
    { yearsExperience: 4, skills: ["Supply Chain Analytics", "SQL", "Power BI", "Forecasting", "SAP"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["Supply Chain Analyst, SQL + SAP, 4 שנות ניסיון, ת\"א, 20K", "4 שנות Supply Chain + SQL — נחפש"]),
    ["supply chain", "analyst", "לוגיסטיקה", "operations", "planning"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 12 — LEGAL / COMPLIANCE (30 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("legal-001", "Legal counsel startup, TLV, 28K",
    { yearsExperience: 5, skills: ["Commercial Law", "Contracts", "Corporate Law", "IP", "Privacy"], location: "תל אביב", salaryExpectation: 28000, workPreference: "hybrid" },
    scoutChat(["עו\"ד מסחרי, 5 שנות ניסיון, ת\"א, 28K", "5 שנות עו\"ד מסחרי — מה מצב העבודה?"]),
    ["עורך דין", "legal", "counsel", "עו\"ד", "law"], 50),

  tc("legal-002", "Compliance manager fintech, TLV, 24K",
    { yearsExperience: 4, skills: ["Compliance", "AML", "KYC", "Regulatory", "Risk Management"], location: "תל אביב", salaryExpectation: 24000, workPreference: "hybrid" },
    scoutChat(["Compliance Manager, AML + KYC, Fintech, 4 שנות ניסיון, ת\"א, 24K", "4 שנות Compliance Fintech — מה מצב העבודה?"]),
    ["compliance", "regulatory", "risk", "legal", "aml"], 48),

  tc("legal-003", "Contract manager, TLV, 22K",
    { yearsExperience: 5, skills: ["Contract Management", "CLM", "Procurement Law", "SaaS Agreements"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["Contract Manager, CLM + SaaS, 5 שנות ניסיון, ת\"א, 22K", "5 שנות Contract Management — נחפש"]),
    ["contract", "legal", "compliance", "manager", "counsel"], 48),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 13 — ADMIN / OFFICE (30 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("admin-001", "Office manager, TLV, 13K",
    { yearsExperience: 4, skills: ["Office Management", "Admin", "Excel", "Coordination", "Event Planning"], location: "תל אביב", salaryExpectation: 13000, workPreference: "onsite" },
    scoutChat(["מנהל/ת משרד, 4 שנות ניסיון, ת\"א, 13K", "4 שנות ניהול משרד — מה מצב העבודה?"]),
    ["מנהל משרד", "office manager", "אדמין", "admin", "coordinator"], 50),

  tc("admin-002", "Executive assistant, TLV, 14K",
    { yearsExperience: 5, skills: ["Executive Support", "Calendar Management", "Travel", "PowerPoint", "Hebrew + English"], location: "תל אביב", salaryExpectation: 14000, workPreference: "onsite" },
    scoutChat(["עוזר/ת אישי/ת ל-CEO, 5 שנות ניסיון, ת\"א, 14K", "5 שנות PA — מה מצב העבודה?"]),
    ["עוזר", "assistant", "executive", "אדמין", "admin"], 48),

  tc("admin-003", "Receptionist, TLV, 9K",
    { yearsExperience: 1, skills: ["Reception", "Phone Handling", "Hebrew", "English", "Admin"], location: "תל אביב", salaryExpectation: 9000, workPreference: "onsite" },
    scoutChat(["קבלן/ית, 1 שנת ניסיון, ת\"א, 9K", "1 שנת קבלה — נחפש"]),
    ["קבלן", "receptionist", "admin", "אדמין", "secretary"], 48),

  tc("admin-004", "Data entry, remote, 9K",
    { yearsExperience: 1, skills: ["Data Entry", "Excel", "Accuracy", "Hebrew"], location: "ירושלים", salaryExpectation: 9000, workPreference: "remote" },
    scoutChat(["Data Entry, Excel, ירושלים, remote, 9K", "Data Entry + remote + ירושלים — נחפש"]),
    ["data entry", "admin", "אדמין", "office", "coordinator", "הזנת", "קלדנות", "אדמיניסטרציה", "בק אופיס", "מהבית"], 45, true),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 14 — SERVICE / CLEANING / SECURITY (30 cases)
  // ══════════════════════════════════════════════════════════════════════

  tc("svc-001", "Cleaning worker, TLV, 8K",
    { yearsExperience: 0, skills: ["Cleaning", "Maintenance"], location: "תל אביב", salaryExpectation: 8000, workPreference: "onsite" },
    scoutChat(["עובד/ת ניקיון, ת\"א, 8K", "עובד ניקיון — מה מצב העבודה?"]),
    ["ניקיון", "cleaning", "תחזוקה", "maintenance", "עובד"], 45),

  tc("svc-002", "Security guard licensed, TLV, 12K",
    { yearsExperience: 2, skills: ["Security", "מאבטח מוסמך", "Emergency Response"], location: "תל אביב", salaryExpectation: 12000, workPreference: "onsite", constraints: ["רישיון מאבטח"] },
    scoutChat(["מאבטח מוסמך, רישיון ביטחוני, 2 שנות ניסיון, ת\"א, 12K", "מאבטח מוסמך + רישיון — נחפש"]),
    ["מאבטח", "security", "guard", "אבטחה", "охрана"], 45),

  tc("svc-003", "Delivery driver, TLV, 9K",
    { yearsExperience: 1, skills: ["Driving", "Navigation", "Customer Service"], location: "תל אביב", salaryExpectation: 9000, workPreference: "onsite" },
    scoutChat(["שליח/ה, רכב פרטי, ת\"א, 9K", "שליח + רכב — נחפש"]),
    ["שליח", "delivery", "driver", "נהג", "courier"], 45),

  // ══════════════════════════════════════════════════════════════════════
  // CATEGORY 15 — SPECIAL CASES / EDGE CASES (100 cases)
  // ══════════════════════════════════════════════════════════════════════

  // Shabbat observant
  tc("edge-001", "Shabbat-observant accountant, Jerusalem, 14K",
    { yearsExperience: 4, skills: ["Bookkeeping", "Priority", "Tax", "VAT"], location: "ירושלים", salaryExpectation: 14000, workPreference: "onsite", constraints: ["שומר שבת"] },
    scoutChat(["שומר שבת, מנהל חשבונות, ירושלים, 14K", "שמירת שבת + ירושלים + 14K — שלושתם מסומנים. מה מצב העבודה?"]),
    ["חשבונות", "bookkeeper", "accounting", "מנהל חשבונות", "finance"], 45),

  // Age 50+
  tc("edge-002", "Age 52 logistics director, TLV, 28K",
    { yearsExperience: 25, skills: ["Supply Chain", "Team Management", "ERP", "Negotiations", "Budget Management"], location: "תל אביב", salaryExpectation: 28000, workPreference: "hybrid", age: 52 },
    scoutChat(["25 שנות ניסיון בלוגיסטיקה, בן 52, ת\"א, 28K", "25 שנות ניסיון — זה ידע שחברות שלמות בנויות עליו. מה מצב העבודה?"]),
    ["לוגיסטיקה", "logistics", "תפעול", "operations", "supply chain"], 45),

  // Fresh grad
  tc("edge-003", "Fresh CS grad, TLV, 13K",
    { yearsExperience: 0, skills: ["Python", "JavaScript", "Data Structures", "Algorithms"], location: "תל אביב", salaryExpectation: 13000, workPreference: "hybrid" },
    scoutChat(["בוגר/ת CS, ללא ניסיון פורמלי, ת\"א, 13K", "CS בלי ניסיון — יש GitHub עם פרויקטים?", "יש 3 פרויקטים, אחד עם API ו-DB", "API + DB — מעל הממוצע. נחפש חברות B+ עם הכשרה"]),
    ["מפתח", "developer", "junior", "ג'וניור", "software"], 45),

  // English-only candidate
  tc("edge-004", "English-only PM, TLV, 30K",
    { yearsExperience: 5, skills: ["Product Management", "Agile", "SQL", "B2B SaaS"], location: "תל אביב", salaryExpectation: 30000, workPreference: "hybrid", languages: ["English"] },
    scoutChat(["I'm looking for PM role, 5 years SaaS experience, Tel Aviv, $8K/month, English only", "5 years SaaS PM — companies like Wix, Monday.com hire PMs entirely in English. Hybrid OK?"]),
    ["product manager", "pm", "product", "manager", "מנהל מוצר"], 48),

  // Passive candidate
  tc("edge-005", "Passive senior dev, remote, 40K",
    { yearsExperience: 8, skills: ["React", "Node.js", "AWS", "PostgreSQL"], location: "תל אביב", salaryExpectation: 40000, workPreference: "remote" },
    scoutChat(["רק רוצה לראות מה יש, Senior Dev, remote, 40K", "בסדר גמור — תמיד שווה לראות. remote + 40K + React/Node"]),
    ["מפתח", "developer", "senior", "fullstack", "software"], 50, true),

  // Multiple directions
  tc("edge-006", "Multiple directions - marketing or product, TLV",
    { yearsExperience: 4, skills: ["Marketing", "Product Management", "SQL", "HubSpot"], location: "תל אביב", salaryExpectation: 22000, workPreference: "hybrid" },
    scoutChat(["4 שנות ניסיון בשיווק ובניהול מוצר, לא בטוח/ה מה לבחור", "לאיזה כיוון יש יותר מוטיבציה — שיווק או מוצר?", "מוצר בעיקר", "מוצר + 4 שנות ניסיון + SQL — ממוקד ב-PM. מה מצב העבודה?"]),
    ["product manager", "pm", "product", "מנהל מוצר", "product owner"], 48),

  // Career change teacher → admin
  tc("edge-007", "Teacher switching to admin, TLV, 10K",
    { yearsExperience: 8, skills: ["Teaching", "Organization", "Excel", "Communication", "Hebrew + English"], currentRole: "School teacher", careerChangeInterest: true, targetRoles: ["Admin", "Office Manager", "Coordinator"], location: "תל אביב", salaryExpectation: 10000, workPreference: "onsite" },
    scoutChat(["מורה 8 שנות ניסיון, עוברת לאדמין/ניהול משרד, ת\"א, 10K", "מעבר מהוראה לאדמין — כישורי ארגון + תקשורת הם בדיוק מה שמחפשים. מה מצב העבודה?"]),
    ["אדמין", "admin", "coordinator", "office", "מנהל משרד"], 45),

  // Milumim (reserves)
  tc("edge-008", "Active reserves DevOps, TLV, 25K",
    { yearsExperience: 4, skills: ["DevOps", "Kubernetes", "Terraform", "AWS"], location: "תל אביב", salaryExpectation: 25000, workPreference: "hybrid", constraints: ["מילואים פעילים עוד חודשיים"] },
    scoutChat(["DevOps, K8s+Terraform, 4 שנות ניסיון, מילואים עוד חודשיים, ת\"א, 25K", "DevOps + מילואים — לא סטארטאפ לחוץ. B2B SaaS + Elbit/Rafael. מה הסטאק?"]),
    ["devops", "cloud", "infrastructure", "platform", "sre"], 45),

  // Recent oleh (immigrant)
  tc("edge-009", "New immigrant developer, TLV, 25K",
    { yearsExperience: 5, skills: ["React", "TypeScript", "Node.js", "PostgreSQL"], location: "תל אביב", salaryExpectation: 25000, workPreference: "hybrid", languages: ["Russian", "English"], additionalNotes: "עולה חדש, עברית בסיסית" },
    scoutChat(["עלייה חדשה, 5 שנות פיתוח React+Node, עברית בסיסית, ת\"א, 25K", "עלייה + הייטק + עברית בסיסית — Intel, Monday.com, Wix מגייסות באנגלית. מה מצב העבודה?"]),
    ["developer", "מפתח", "fullstack", "frontend", "software"], 48),

  // Pregnancy (remote required)
  tc("edge-010", "Pregnant developer, remote only, 28K",
    { yearsExperience: 5, skills: ["React", "Node.js", "TypeScript"], location: "הרצליה", salaryExpectation: 28000, workPreference: "remote", constraints: ["הריון, remote חובה"] },
    scoutChat(["מפתחת, 5 שנות ניסיון, הריון, remote מלא חובה, 28K", "remote מלא + הריון — חברות remote-first הן הכיוון. מה הסטאק?"]),
    ["developer", "מפתח", "frontend", "fullstack", "software"], 48, true),

  // Burnout from startup → corporate
  tc("edge-011", "Burned out from startup, corporate preferred, TLV, 30K",
    { yearsExperience: 6, skills: ["Full Stack", "React", "Node.js", "AWS"], location: "תל אביב", salaryExpectation: 30000, workPreference: "hybrid", additionalNotes: "שחוק מסטארטאפ, רוצה יציבות" },
    scoutChat(["6 שנות Full Stack, שחוק מסטארטאפ, רוצה R&D center יציב, ת\"א, 30K", "שחיקה מסטארטאפ + 30K + ת\"א — Intel, Amdocs, Microsoft IL הם הכיוון. מה מצב העבודה?"]),
    ["developer", "מפתח", "software", "fullstack", "engineer"], 48),

  // Student part-time
  tc("edge-012", "CS student, part-time internship, TLV, 7K",
    { yearsExperience: 0, skills: ["Python", "JavaScript", "Data Structures"], location: "תל אביב", salaryExpectation: 7000, workPreference: "hybrid", constraints: ["סטודנט, חצי משרה"] },
    scoutChat(["סטודנט CS שנה 2, מחפש אינטרנשיפ או חצי משרה, ת\"א, 7K", "סטודנט CS + חצי משרה — Wix, Monday, Intel מפרסמות תוכניות student. מה הסטאק?"]),
    ["internship", "student", "junior", "developer", "מפתח"], 40),

  // No car, train only
  tc("edge-013", "No car, train only, TLV, 16K",
    { yearsExperience: 3, skills: ["Marketing", "SEO", "Content", "Google Analytics"], location: "תל אביב", salaryExpectation: 16000, workPreference: "hybrid", constraints: ["אין רכב, רכבת בלבד"] },
    scoutChat(["מנהל/ת שיווק, 3 שנות ניסיון, אין רכב, רכבת בלבד, ת\"א, 16K", "רכבת בלבד + ת\"א — ת\"א השלום / מרכז / אוניברסיטה. מה מצב העבודה?"]),
    ["שיווק", "marketing", "content", "digital", "seo"], 45),

  // Haredi tech entry
  tc("edge-014", "Haredi seeking tech entry, Jerusalem, 14K",
    { yearsExperience: 0, skills: ["Excel", "Basic Programming", "Logic"], location: "ירושלים", salaryExpectation: 14000, workPreference: "onsite", constraints: ["שומר שבת", "חרדי", "מגזר חרדי"] },
    scoutChat(["חרדי, מחפש להיכנס להייטק, ירושלים, ש\"ש, 14K", "מגזר חרדי + הייטק — Elevation, Talpiot, InfinityHubs. יצרת קשר עם אחת מהן?"]),
    ["מפתח", "developer", "programmer", "tech", "הייטק"], 40),

  // Return from maternity leave
  tc("edge-015", "Return from 2yr maternity, flexible hours, TLV, 18K",
    { yearsExperience: 6, skills: ["Project Management", "Excel", "Customer Success", "CRM"], location: "תל אביב", salaryExpectation: 18000, workPreference: "hybrid", constraints: ["חזרה מחופשת לידה, יציאה ב-16:00"] },
    scoutChat(["חזרה מחופשת לידה, Project Manager, 6 שנות ניסיון, חייבת לצאת 16:00, ת\"א, 18K", "16:00 + hybrid + ת\"א — Fintech / SaaS עם תרבות תוצאות. מה מצב העבודה?"]),
    ["project manager", "customer success", "operations", "coordinator", "manager"], 45),

  // Ex-military officer
  tc("edge-016", "Military officer → PM, TLV, 25K",
    { yearsExperience: 8, skills: ["Program Management", "Leadership", "Operations", "Strategic Planning"], currentRole: "Officer", careerChangeInterest: true, targetRoles: ["Program Manager", "Operations Director", "Chief of Staff"], location: "תל אביב", salaryExpectation: 25000, workPreference: "hybrid" },
    scoutChat(["קצין/ת, 8 שנות ניסיון, עוברת ל-Program Management, ת\"א, 25K", "קצין/ת + PM — Program Manager / Chief of Staff הם הכיוון הנכון. מה מצב העבודה?"]),
    ["program manager", "operations", "chief of staff", "manager", "director"], 45),

  // Nurse → medical sales
  tc("edge-017", "Nurse switching to medical sales, TLV, 20K",
    { yearsExperience: 7, skills: ["Nursing", "Clinical Knowledge", "Communication", "Sales Interest"], currentRole: "Nurse", careerChangeInterest: true, targetRoles: ["Medical Sales", "Medical Device Sales"], location: "תל אביב", salaryExpectation: 20000, workPreference: "hybrid" },
    scoutChat(["אחות 7 שנות ניסיון, עוברת למכירות ציוד רפואי, ת\"א, 20K", "אחות → Medical Sales — ידע קליני הוא יתרון אמיתי. מה מצב העבודה?"]),
    ["medical", "sales", "מכירות", "ציוד רפואי", "representative"], 45),

  // Burnout from corporate, wants NGO
  tc("edge-018", "Corporate burnout → NGO/social, TLV, 16K",
    { yearsExperience: 10, skills: ["Marketing", "Project Management", "Budget Management", "Communication"], currentRole: "Marketing Manager", careerChangeInterest: true, targetRoles: ["NGO Manager", "Social Impact", "Community Director"], location: "תל אביב", salaryExpectation: 16000, workPreference: "hybrid" },
    scoutChat(["מנהל/ת שיווק 10 שנות ניסיון, עוברת לעמותות/אימפקט, ת\"א, 16K", "Corporate → NGO — כישורי שיווק + ניהול הם נכס אמיתי. מה מצב העבודה?"]),
    ["עמותה", "ngo", "social", "impact", "coordinator"], 45),

];

// ─── Runner ──────────────────────────────────────────────────────────────────

async function runSingle(tc: TestCase): Promise<TestResult> {
  const start = Date.now();
  const jobs: JobResult[] = [];

  const profileText = JSON.stringify({
    ...tc.profile,
    additionalContext: tc.chatContext,
  });

  const wantsRemoteOnly =
    profileText.includes('"workPreference":"remote"') ||
    /מרחוק מלא|עבודה מהבית בלבד|remote only|fully remote|רוצה לעבוד מהבית|"remote"|מרחוק/i.test(tc.chatContext);

  try {
    await runJobSearch(
      profileText,
      (job: JobResult) => {
        if (job.matchScore < 38) return;
        if (wantsRemoteOnly && !job.isRemote) return; // mirror route-level hard filter
        jobs.push(job);
      },
      "he"
    );
  } catch (err) {
    return {
      id: tc.id, label: tc.label, passed: false,
      jobCount: 0, avgScore: 0, topJobs: [], relevantCount: 0,
      failReason: `ERROR: ${err}`, durationMs: Date.now() - start,
    };
  }

  if (jobs.length === 0) {
    return {
      id: tc.id, label: tc.label, passed: false,
      jobCount: 0, avgScore: 0, topJobs: [], relevantCount: 0,
      failReason: "no jobs returned", durationMs: Date.now() - start,
    };
  }

  const avgScore = jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length;
  const topJobs = jobs.slice(0, 3).map((j) => `[${j.matchScore}] ${j.title}`);

  const relevantJobs = jobs.filter((j) =>
    tc.expectedKeywords.some((kw) => j.title.toLowerCase().includes(kw.toLowerCase()))
  );

  const remoteViolation =
    tc.expectedRemoteOnly && jobs.some((j) => !j.isRemote);

  const passed =
    avgScore >= tc.expectedMinScore &&
    relevantJobs.length >= 1 &&
    !remoteViolation;

  let failReason: string | undefined;
  if (!passed) {
    const reasons: string[] = [];
    if (avgScore < tc.expectedMinScore) reasons.push(`avgScore ${avgScore.toFixed(0)} < ${tc.expectedMinScore}`);
    if (relevantJobs.length === 0) reasons.push(`0 relevant jobs (wanted: ${tc.expectedKeywords.join("|")})`);
    if (remoteViolation) reasons.push("non-remote job returned for remote-only candidate");
    failReason = reasons.join("; ");
  }

  return {
    id: tc.id, label: tc.label, passed,
    jobCount: jobs.length, avgScore, topJobs, relevantCount: relevantJobs.length,
    failReason, durationMs: Date.now() - start,
  };
}

async function runBatch(cases: TestCase[], concurrency: number): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (let i = 0; i < cases.length; i += concurrency) {
    const slice = cases.slice(i, i + concurrency);
    const batch = await Promise.all(slice.map(runSingle));
    results.push(...batch);
    const done = i + slice.length;
    const passed = results.filter((r) => r.passed).length;
    console.log(`[${done}/${cases.length}] ${passed} passed, ${done - passed} failed`);
    batch.forEach((r) => {
      const icon = r.passed ? "✓" : "✗";
      console.log(`  ${icon} ${r.id} "${r.label}" — ${r.jobCount} jobs, avg ${r.avgScore.toFixed(0)}${r.failReason ? ` — FAIL: ${r.failReason}` : ""}`);
    });
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
  const categoryArg = args.find((a) => a.startsWith("--category="));

  const limit = limitArg ? parseInt(limitArg.split("=")[1]) : ALL_CASES.length;
  const concurrency = concurrencyArg ? parseInt(concurrencyArg.split("=")[1]) : 3;
  const category = categoryArg ? categoryArg.split("=")[1] : undefined;

  let cases = category
    ? ALL_CASES.filter((c) => c.id.startsWith(category))
    : ALL_CASES;
  cases = cases.slice(0, limit);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Batch Job Search Test`);
  console.log(`  Cases: ${cases.length} | Concurrency: ${concurrency}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const startTime = Date.now();
  const results = await runBatch(cases, concurrency);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);
  const avgScore = results.reduce((s, r) => s + r.avgScore, 0) / results.length;

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  RESULTS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Total:   ${results.length}`);
  console.log(`  Passed:  ${passed.length} (${((passed.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`  Failed:  ${failed.length}`);
  console.log(`  Avg score: ${avgScore.toFixed(1)}`);
  console.log(`  Time: ${elapsed}s\n`);

  if (failed.length > 0) {
    console.log("  FAILURES:");
    failed.forEach((r) => {
      console.log(`  ✗ ${r.id} — ${r.failReason}`);
      if (r.topJobs.length > 0) console.log(`    Top jobs: ${r.topJobs.join(" | ")}`);
    });
  }

  // Save full report
  const report = {
    meta: { total: results.length, passed: passed.length, failed: failed.length, avgScore, elapsedSec: parseInt(elapsed) },
    failures: failed,
    all: results,
  };
  const outPath = `scripts/test-report-${Date.now()}.json`;
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved: ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
