import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { SEARCH_QUERY_PROMPT, MATCH_ANALYSIS_PROMPT } from "@/lib/prompts";
import { JobResult } from "@/lib/types";

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
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

async function generateSearchPlan(profileText: string): Promise<SearchPlan> {
  const text = await geminiGenerate(SEARCH_QUERY_PROMPT(profileText), undefined, 1024, true);
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

async function serperSearch(query: string, sites: string, lang: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || apiKey === "your_serper_api_key_here") return [];

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      q: `${query} ${sites}`,
      gl: "il",
      hl: lang,
      num: 6,
    }),
  });

  if (!response.ok) return [];
  const data: SerperResponse = await response.json();
  return data.organic || [];
}

// Primary Israeli job boards + LinkedIn
const PRIMARY_IL_SITES =
  "site:drushim.co.il OR site:alljobs.co.il OR site:jobmaster.co.il OR site:gotfriends.co.il OR site:comeet.io OR site:linkedin.com/jobs OR site:glassdoor.com/Jobs";

// Facebook job groups
const FACEBOOK_SITES =
  "site:facebook.com/groups OR site:facebook.com/marketplace/jobs OR site:facebook.com";

// LinkedIn dedicated search
const LINKEDIN_SITES = "site:linkedin.com/jobs OR site:linkedin.com/in";

interface TaggedResult extends SerperResult {
  isNonObvious?: boolean;
}

async function runSearches(plan: SearchPlan): Promise<TaggedResult[]> {
  const boardQueries = [
    ...plan.hebrewQueries.map((q, i) => ({ q, lang: "iw", nonObvious: i === plan.hebrewQueries.length - 1, sites: PRIMARY_IL_SITES })),
    ...plan.englishQueries.map((q, i) => ({ q, lang: "en", nonObvious: i === plan.englishQueries.length - 1, sites: PRIMARY_IL_SITES })),
  ];

  // Facebook: custom query + fallback
  const fbQuery = plan.facebookQuery || `${plan.hebrewQueries[0]} דרושים`;
  const fbSearches = [
    { q: fbQuery, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
    { q: `${plan.hebrewQueries[0]} דרושים קבוצה`, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
  ];

  // LinkedIn: dedicated query
  const liQuery = plan.linkedinQuery || plan.englishQueries[0];
  const linkedinSearches = [
    { q: liQuery, lang: "en", nonObvious: false, sites: LINKEDIN_SITES },
  ];

  const results = await Promise.all(
    [...boardQueries, ...fbSearches, ...linkedinSearches].map(({ q, lang, nonObvious, sites }) =>
      serperSearch(q, sites, lang).then((r) =>
        r.map((item) => ({ ...item, isNonObvious: nonObvious }))
      )
    )
  );

  const all = results.flat();
  return all.filter((r, i, arr) => arr.findIndex((x) => x.link === r.link) === i).slice(0, 18);
}

async function analyzeMatch(profileText: string, job: TaggedResult): Promise<JobResult> {
  try {
    const text = await geminiGenerate(MATCH_ANALYSIS_PROMPT(profileText, job.title, job.snippet), undefined, 512, true);
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(clean);

    return {
      id: Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: extractCompanyFromTitle(job.title),
      location: analysis.isRemote ? "מרחוק" : "ראה מודעה",
      url: job.link,
      description: job.snippet,
      matchScore: analysis.matchScore || 70,
      matchReasons: analysis.matchReasons || [],
      isRemote: analysis.isRemote || false,
      salaryRange: analysis.salaryRange || undefined,
      postedDate: job.date,
      source: getDomainFromUrl(job.link),
      isNonObvious: job.isNonObvious,
    };
  } catch {
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: extractCompanyFromTitle(job.title),
      location: "ראה מודעה",
      url: job.link,
      description: job.snippet,
      matchScore: 65,
      matchReasons: ["מתאים לפרופיל שלך"],
      isRemote: false,
      postedDate: job.date,
      source: getDomainFromUrl(job.link),
      isNonObvious: job.isNonObvious,
    };
  }
}

function extractCompanyFromTitle(title: string): string {
  const parts = title.split(" - ");
  if (parts.length > 1) return parts[parts.length - 1];
  const atParts = title.split(" at ");
  return atParts.length > 1 ? atParts[atParts.length - 1] : "ראה מודעה";
}

function getDomainFromUrl(url: string): string {
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

function getMockJobs(profile: Record<string, unknown>): JobResult[] {
  const isRemote = profile.workPreference === "remote" || profile.workPreference === "flexible";
  return [
    {
      id: "mock1",
      title: "מפתח/ת פול סטאק",
      company: "סטארטאפ ישראלי",
      location: isRemote ? "מרחוק (ישראל)" : "תל אביב",
      url: "https://www.drushim.co.il",
      description: "דרוש/ה מפתח/ת פול סטאק עם ניסיון ב-React ו-Node.js לסטארטאפ בצמיחה.",
      matchScore: 88,
      matchReasons: ["מתאים לניסיון הפול סטאק שלך", isRemote ? "משרה מלאה מהבית" : "אופציית היברידי", "React ו-Node.js תואמים"],
      isRemote,
      salaryRange: "20,000–30,000 ₪",
      source: "דרושים",
    },
    {
      id: "mock2",
      title: "מנהל/ת מוצר טכנולוגי",
      company: "חברת Scale-up",
      location: "מרחוק",
      url: "https://www.linkedin.com/jobs",
      description: "גשר בין הנדסה ומוצר. נדרש רקע טכנולוגי. שעות גמישות.",
      matchScore: 82,
      matchReasons: ["מסלול מעבר קריירה מפיתוח", "תואר CS הכרחי", "שעות גמישות"],
      isRemote: true,
      salaryRange: "25,000–35,000 ₪",
      source: "LinkedIn",
    },
    {
      id: "mock3",
      title: "ארכיטקט/ית פתרונות",
      company: "חברת אנטרפרייז",
      location: "מרחוק / תל אביב",
      url: "https://www.gotfriends.co.il",
      description: "עיצוב פתרונות טכניים ללקוחות ארגוניים. רקע בפיתוח יתרון.",
      matchScore: 75,
      matchReasons: ["רקע הפיתוח שלך בעל ערך רב", "מסלול צמיחה מעבר לקידוד", "ידידותי למרחוק"],
      isRemote: true,
      salaryRange: "28,000–40,000 ₪",
      source: "GotFriends",
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, chatContext } = body;

    const profileText = JSON.stringify({
      ...userProfile?.parsedData,
      additionalContext: chatContext,
    });

    let jobs: JobResult[] = [];
    const serperKey = process.env.SERPER_API_KEY;
    const hasRealSearch = serperKey && serperKey !== "your_serper_api_key_here";

    if (hasRealSearch) {
      const plan = await generateSearchPlan(profileText);
      const results = await runSearches(plan);
      jobs = await Promise.all(results.map((r) => analyzeMatch(profileText, r)));
    } else {
      jobs = getMockJobs(userProfile?.parsedData || {});
    }

    jobs.sort((a, b) => b.matchScore - a.matchScore);
    return NextResponse.json({ jobs, demoMode: !hasRealSearch });
  } catch (error) {
    console.error("search-jobs error:", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
