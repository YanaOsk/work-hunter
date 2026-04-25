import { geminiAnalyze } from "@/lib/gemini";
import { SEARCH_QUERY_PROMPT, MATCH_ANALYSIS_PROMPT, HIDDEN_MARKET_PROMPT } from "@/lib/prompts";
import { JobResult } from "@/lib/types";

export interface HiddenMarketResult {
  intro: string;
  facebookGroups: { name: string; why: string }[];
  outreachTemplate: string;
  linkedinTip: string;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

interface TaggedResult extends SerperResult {
  isNonObvious?: boolean;
}

interface SearchPlan {
  hebrewQueries: string[];
  englishQueries: string[];
  facebookQuery?: string;
  linkedinQuery?: string;
  isTech: boolean;
  targetTitles: string[];
  searchRationale?: string;
}

const PRIMARY_IL_SITES =
  "site:drushim.co.il OR site:alljobs.co.il OR site:jobmaster.co.il OR site:gotfriends.co.il OR site:comeet.io OR site:linkedin.com/jobs OR site:glassdoor.com/Jobs";
const FACEBOOK_SITES =
  "site:facebook.com/groups OR site:facebook.com/marketplace/jobs OR site:facebook.com";
const LINKEDIN_SITES = "site:linkedin.com/jobs OR site:linkedin.com/in";

async function generateSearchPlan(profileText: string): Promise<SearchPlan> {
  const text = await geminiAnalyze(SEARCH_QUERY_PROMPT(profileText), undefined, 1024, true);
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

async function serperSearch(query: string, sites: string, lang: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || apiKey === "your_serper_api_key_here") return [];
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `${query} ${sites}`, gl: "il", hl: lang, num: 6, tbs: "qdr:m" }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.organic as SerperResult[]) || [];
  } catch {
    return [];
  }
}

async function runSearches(plan: SearchPlan): Promise<TaggedResult[]> {
  const boardQueries = [
    ...plan.hebrewQueries.map((q, i) => ({ q, lang: "iw", nonObvious: i === plan.hebrewQueries.length - 1, sites: PRIMARY_IL_SITES })),
    ...plan.englishQueries.map((q, i) => ({ q, lang: "en", nonObvious: i === plan.englishQueries.length - 1, sites: PRIMARY_IL_SITES })),
  ];
  const fbQuery = plan.facebookQuery || `${plan.hebrewQueries[0]} דרושים`;
  const fbSearches = [
    { q: fbQuery, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
    { q: `${plan.hebrewQueries[0]} דרושים קבוצה`, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
  ];
  const liQuery = plan.linkedinQuery || plan.englishQueries[0];
  const linkedinSearches = [{ q: liQuery, lang: "en", nonObvious: false, sites: LINKEDIN_SITES }];

  const results = await Promise.all(
    [...boardQueries, ...fbSearches, ...linkedinSearches].map(({ q, lang, nonObvious, sites }) =>
      serperSearch(q, sites, lang).then((r) => r.map((item) => ({ ...item, isNonObvious: nonObvious })))
    )
  );
  const all = results.flat();
  return all.filter((r, i, arr) => arr.findIndex((x) => x.link === r.link) === i).slice(0, 18);
}

async function analyzeMatch(profileText: string, job: TaggedResult): Promise<JobResult> {
  try {
    const text = await geminiAnalyze(MATCH_ANALYSIS_PROMPT(profileText, job.title, job.snippet), undefined, 512, true);
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(clean);
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: extractCompany(job.title),
      location: analysis.isRemote ? "מרחוק" : "ראה מודעה",
      url: job.link,
      description: job.snippet,
      matchScore: analysis.matchScore || 70,
      matchReasons: analysis.matchReasons || [],
      isRemote: analysis.isRemote || false,
      salaryRange: analysis.salaryRange || undefined,
      postedDate: job.date,
      source: getDomain(job.link),
      isNonObvious: job.isNonObvious,
    };
  } catch {
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: extractCompany(job.title),
      location: "ראה מודעה",
      url: job.link,
      description: job.snippet,
      matchScore: 65,
      matchReasons: ["מתאים לפרופיל שלך"],
      isRemote: false,
      postedDate: job.date,
      source: getDomain(job.link),
      isNonObvious: job.isNonObvious,
    };
  }
}

function extractCompany(title: string): string {
  const parts = title.split(" - ");
  if (parts.length > 1) return parts[parts.length - 1];
  const atParts = title.split(" at ");
  return atParts.length > 1 ? atParts[atParts.length - 1] : "ראה מודעה";
}

function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    if (domain.includes("linkedin")) return "LinkedIn";
    if (domain.includes("facebook")) return "Facebook";
    if (domain.includes("drushim")) return "דרושים";
    if (domain.includes("alljobs")) return "AllJobs";
    if (domain.includes("jobmaster")) return "JobMaster";
    if (domain.includes("gotfriends")) return "GotFriends";
    if (domain.includes("comeet")) return "Comeet";
    return domain;
  } catch {
    return "לוח דרושים";
  }
}

function getMockJobs(profileText: string): JobResult[] {
  const isRemote = profileText.includes("remote") || profileText.includes("מרחוק") || profileText.includes("היברידי");
  return [
    {
      id: "mock1",
      title: "מנהל/ת פרויקטים",
      company: "חברת טכנולוגיה",
      location: isRemote ? "מרחוק" : "תל אביב",
      url: "https://www.drushim.co.il",
      description: "ניהול פרויקטים טכנולוגיים, עבודה מול לקוחות ומפתחים.",
      matchScore: 85,
      matchReasons: ["מתאים לרקע שלך", isRemote ? "עבודה מהבית" : "מיקום מרכזי", "הזדמנות צמיחה"],
      isRemote,
      source: "דרושים",
    },
    {
      id: "mock2",
      title: "Customer Success Manager",
      company: "SaaS Startup",
      location: "מרחוק",
      url: "https://www.linkedin.com/jobs",
      description: "ליווי לקוחות, העצמה ושימור. דורש אמפתיה ויכולת טכנית.",
      matchScore: 78,
      matchReasons: ["מתאים לכישורי התקשורת שלך", "גמישות גבוהה", "שכר תחרותי"],
      isRemote: true,
      source: "LinkedIn",
    },
  ];
}

export async function runJobSearch(profileText: string): Promise<{ jobs: JobResult[]; demoMode: boolean }> {
  const serperKey = process.env.SERPER_API_KEY;
  const hasRealSearch = serperKey && serperKey !== "your_serper_api_key_here";

  let jobs: JobResult[];
  if (hasRealSearch) {
    const plan = await generateSearchPlan(profileText);
    const results = await runSearches(plan);
    jobs = await Promise.all(results.map((r) => analyzeMatch(profileText, r)));
  } else {
    jobs = getMockJobs(profileText);
  }

  jobs.sort((a, b) => b.matchScore - a.matchScore);
  return { jobs, demoMode: !hasRealSearch };
}

export async function generateHiddenMarket(profileText: string, lang: string): Promise<HiddenMarketResult> {
  try {
    const text = await geminiAnalyze(HIDDEN_MARKET_PROMPT(profileText, lang), undefined, 800, true);
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      intro: lang === "he"
        ? "לא מצאנו משרות שעונות בדיוק על כל האילוצים שלך — אבל יש מסלול חלופי שעובד."
        : "We didn't find exact matches — but here's a path that works.",
      facebookGroups: [
        { name: "משרות מפייסבוק לאוזן", why: "הגדולה ביותר בישראל — עשרות פוסטים ביום" },
        { name: "דנה ונועה תעשו לי קריירה", why: "קהילה תומכת, הרבה הפניות ישירות" },
      ],
      outreachTemplate: "שלום [שם], ראיתי את הפעילות שלך ב[חברה] ואני מרשים/ה מהגישה שלכם. אני [תפקיד] עם ניסיון ב[תחום] ומחפש/ת את האתגר הבא — האם תהיה פתוחות לשיחה קצרה?",
      linkedinTip: 'חפשו "#hiring Israel" ו-"We\'re hiring" + התחום שלכם — מנהלי גיוס מפרסמים שם לפני שמעלים למשרות',
    };
  }
}
