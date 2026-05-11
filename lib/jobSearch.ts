import { geminiAnalyze } from "@/lib/gemini";
import { SEARCH_QUERY_PROMPT, MATCH_ANALYSIS_PROMPT, HIDDEN_MARKET_PROMPT, ENTRY_PATH_PROMPT } from "@/lib/prompts";
import { JobResult, EntryPathResult } from "@/lib/types";

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
  requiresTraining?: boolean;
  trainingBarrier?: string;
  educationQueries?: string[];
  entryTimeMonths?: number;
}

const MAIN_IL_SITES =
  "site:drushim.co.il OR site:alljobs.co.il OR site:jobmaster.co.il OR site:gotfriends.co.il OR site:sahbak.co.il OR site:mploy.co.il";
const SECONDARY_IL_SITES =
  "site:jobnet.co.il OR site:joba.co.il OR site:comeet.io OR site:nisha.co.il OR site:seev.co.il OR site:urbanrecruits.co.il OR site:goozali.com OR site:karyera.org.il OR site:govo.co.il";
const FACEBOOK_SITES = "site:facebook.com/groups";
const LINKEDIN_SITES = "site:linkedin.com/jobs";

const INACTIVE_MARKERS = [
  "המשרה אינה פעילה", "משרה זו נסגרה", "המשרה הוסרה", "המשרה כבר אוישה",
  "המשרה אינה זמינה", "המשרה פגה", "המשרה הסתיימה", "הגשת מועמדות אינה אפשרית",
  "לא ניתן להגיש מועמדות", "פרסום זה פג תוקפו", "סליחה אך דף זה כבר לא קיים",
  "המשרה נמחקה", "המשרה כבר לא קיימת", "משרה לא פעילה", "המשרה הוסרה מהאתר",
  "no longer available", "position has been filled", "listing has expired",
  "no longer accepting applications", "position closed",
  "job posting is no longer active", "this job is no longer", "job expired",
];

function isExpiredListing(result: SerperResult): boolean {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  return INACTIVE_MARKERS.some((m) => text.includes(m.toLowerCase()));
}

const GENERIC_PAGE_TITLE_PATTERNS = [
  /^דרושים$/, /^משרות$/, /^jobs?$/i, /^careers?$/i, /^all jobs/i,
  /כל המשרות/, /לוח דרושים/, /חיפוש משרות/, /job listings/i, /job board/i,
  /remote jobs/i, /משרות מרחוק$/, /משרות היום/,
  // drushim.co.il category pages: "מצאנו 200 הצעות עבודה חדשות" / "27 משרות חדשות"
  /מצאנו \d+ הצעות עבודה/,
  /הצעות עבודה חדשות/,
  /\d+ משרות חדשות/,
  /משרות חדשות מתעדכנות/,
  // alljobs.co.il category pages: "מגוון משרות מיידיות"
  /מגוון משרות מיידיות/,
  // drushim guides/articles (not job listings)
  /המדריך המלא/,
  // Facebook group pages: "משרות ל[group]", "משרות בתחום", "קבוצת משרות", "Hi-Tech Jobs israel - Facebook"
  /^משרות ל/, /^משרות בתחום/, /קבוצת משרות/,
  /\bjobs\b.*- facebook$/i, /\bwork\b.*- facebook$/i, /\bמשרות.*- facebook$/i,
  // Jobnet / board category pages: "דרושים ב[city/field]" with no specific role, or "משרות X | דרושים..."
  /^דרושים ב[א-ת]+ - Jobnet$/, /^דרושים ב[א-ת]+ – Jobnet$/,
  /^משרות [א-ת].* \| דרושים/,
];

const GENERIC_PAGE_URL_PATTERNS = [
  /\/(jobs|careers|positions|משרות)\/?$/, // bare category pages
  /\?category=/, /\?type=remote/, /\/tag\//, /\/category\//,
];

function isGenericLandingPage(result: SerperResult): boolean {
  const titleLower = result.title.trim().toLowerCase();
  if (GENERIC_PAGE_TITLE_PATTERNS.some((p) => p.test(titleLower))) return true;
  if (GENERIC_PAGE_URL_PATTERNS.some((p) => p.test(result.link))) return true;
  const snippet = result.snippet ?? "";
  if (snippet.length < 60 && !/משרה|דרוש|מחפש|דרישות|ניסיון|job|hiring|position/i.test(snippet)) return true;
  return false;
}

const SPAM_PATTERNS = [
  /[一-鿿㐀-䶿]/,  // Chinese characters anywhere in title
  /vip[\s.]*(网|直推|cc|客服)/i,
  /app下载|直推|叫炮|tg客服|网红服务|叫小姐|世界杯|竞彩|约小姐/i,
  /→[a-z0-9]+\.(vip|cc|top|xyz)/i,  // spam shortlinks
];

function isSpam(result: SerperResult): boolean {
  return SPAM_PATTERNS.some((p) => p.test(result.title));
}

const JOBSEEKER_POST_MARKERS = [
  "מחפש עבודה", "מחפשת עבודה", "מחפש/ת עבודה",
  "זמין למשרה", "זמינה למשרה", "פנוי לתפקיד", "פנויה לתפקיד",
  "מחפש הזדמנות", "מחפשת הזדמנות", "אני מחפש", "אני מחפשת",
  "זמין לעבודה", "זמינה לעבודה", "מעוניין במשרה", "מעוניינת במשרה",
  "מציג את עצמי", "קורות חיים לשיתוף", "שיתוף קו\"ח",
  "looking for work", "seeking employment", "available for hire",
  "open to work", "seeking a job", "job seeker", "seeking new opportunities",
  "i am looking for", "currently seeking",
];

function isJobSeekerPost(result: SerperResult): boolean {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  return JOBSEEKER_POST_MARKERS.some((m) => text.includes(m.toLowerCase()));
}

async function generateSearchPlan(profileText: string): Promise<SearchPlan> {
  const text = await geminiAnalyze(SEARCH_QUERY_PROMPT(profileText), undefined, 1024, true);
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean);
}

async function serperSearch(query: string, sites: string, lang: string, isTech = true): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || apiKey === "your_serper_api_key_here") return [];
  // Non-tech boards have lower posting volume — use 3-month window instead of 1-month
  const recency = isTech ? "qdr:m" : "qdr:m3";
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `${query} ${sites}`, gl: "il", hl: lang, num: 6, tbs: recency }),
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
    ...plan.hebrewQueries.map((q, i) => ({
      q, lang: "iw",
      nonObvious: i === plan.hebrewQueries.length - 1,
      sites: i % 2 === 0 ? MAIN_IL_SITES : SECONDARY_IL_SITES,
    })),
    ...plan.englishQueries.map((q, i) => ({
      q, lang: "en",
      nonObvious: i === plan.englishQueries.length - 1,
      sites: MAIN_IL_SITES,
    })),
  ];

  const fbQuery = plan.facebookQuery || `${plan.hebrewQueries[0]} דרושים`;
  const fbQuery2 = plan.hebrewQueries.length > 1
    ? `${plan.hebrewQueries[1]} דרושים`
    : `${plan.targetTitles[0] || plan.hebrewQueries[0]} קבוצה דרושים`;
  const fbSearches = [
    { q: fbQuery, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
    { q: fbQuery2, lang: "iw", nonObvious: false, sites: FACEBOOK_SITES },
  ];

  const liQuery = plan.linkedinQuery || plan.englishQueries[0];
  const isSeniorNonTech = !plan.isTech && plan.targetTitles.some(
    (t) => /VP|Director|Head of|Senior|בכיר|מנהל בכיר|סמנכ"ל|מנכ"ל|ראש צוות|C-Level|Chief/i.test(t)
  );
  // Also use LinkedIn when Gemini explicitly provided a linkedinQuery for a professional non-tech role (HRBP, Finance, etc.)
  const hasExplicitLinkedIn = !!plan.linkedinQuery;
  const linkedinSearches = (plan.isTech || isSeniorNonTech || hasExplicitLinkedIn)
    ? [{ q: liQuery, lang: "en", nonObvious: false, sites: LINKEDIN_SITES }]
    : [];

  const allSearches = [...boardQueries, ...fbSearches, ...linkedinSearches];
  const results = await Promise.all(
    allSearches.map(({ q, lang, nonObvious, sites }) =>
      serperSearch(q, sites, lang, plan.isTech).then((r) => r.map((item) => ({ ...item, isNonObvious: nonObvious })))
    )
  );

  const all = results.flat();
  const deduped = all.filter((r, i, arr) => arr.findIndex((x) => x.link === r.link) === i);
  const active = deduped.filter((r) => !isSpam(r) && !isExpiredListing(r) && !isGenericLandingPage(r) && !isJobSeekerPost(r));

  // Pre-rank: results whose title overlaps a targetTitle keyword score first
  const titleWords = plan.targetTitles.flatMap((t) =>
    t.toLowerCase().split(/[\s/\-–—,]+/).filter((w) => w.length > 2)
  );
  const scored = active.map((r) => {
    const titleLower = r.title.toLowerCase();
    const hits = titleWords.filter((w) => titleLower.includes(w)).length;
    return { r, hits };
  });
  scored.sort((a, b) => b.hits - a.hits);
  return scored.map(({ r }) => r).slice(0, 14);
}

// Fetch full job page content for richer match analysis
async function fetchJobContent(url: string): Promise<string | null> {
  // Skip sites that require auth or JS rendering
  if (url.includes("linkedin.com") || url.includes("facebook.com")) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const html = await response.text();
    const text = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 300 ? text.slice(0, 3000) : null;
  } catch {
    return null;
  }
}

function normalizeSerperDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString();
  const lower = dateStr.toLowerCase().trim();
  const now = Date.now();
  let match: RegExpMatchArray | null;
  if ((match = lower.match(/(\d+)\s*hour[s]?\s*ago/))) return new Date(now - +match[1] * 3_600_000).toISOString();
  if ((match = lower.match(/(\d+)\s*day[s]?\s*ago/))) return new Date(now - +match[1] * 86_400_000).toISOString();
  if ((match = lower.match(/(\d+)\s*week[s]?\s*ago/))) return new Date(now - +match[1] * 604_800_000).toISOString();
  if ((match = lower.match(/(\d+)\s*month[s]?\s*ago/))) return new Date(now - +match[1] * 30 * 86_400_000).toISOString();
  // Hebrew relative dates from Serper (e.g. "לפני 3 ימים")
  if ((match = dateStr.match(/לפני\s+(\d+)\s+(שעה|שעות)/))) return new Date(now - +match[1] * 3_600_000).toISOString();
  if ((match = dateStr.match(/לפני\s+(\d+)\s+(יום|ימים)/))) return new Date(now - +match[1] * 86_400_000).toISOString();
  if ((match = dateStr.match(/לפני\s+(\d+)\s+(שבוע|שבועות)/))) return new Date(now - +match[1] * 604_800_000).toISOString();
  if ((match = dateStr.match(/לפני\s+(\d+)\s+(חודש|חודשים)/))) return new Date(now - +match[1] * 30 * 86_400_000).toISOString();
  if (/^(היום|today|just posted)$/i.test(dateStr.trim())) return new Date(now).toISOString();
  return undefined;
}

async function analyzeMatch(profileText: string, job: TaggedResult, lang = "he"): Promise<JobResult> {
  const fullContent = await fetchJobContent(job.link);
  const snippet = job.snippet ?? "";
  // Use full page content only when it's substantially richer than the snippet
  const description =
    fullContent && fullContent.length > snippet.length * 2 ? fullContent : snippet;

  try {
    const text = await geminiAnalyze(
      MATCH_ANALYSIS_PROMPT(profileText, job.title, description, lang),
      undefined,
      512,
      true
    );
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(clean);
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: analysis.companyName || extractCompany(job.title),
      location: analysis.isRemote ? "מרחוק" : (analysis.location || "ראה מודעה"),
      url: job.link,
      description: job.snippet,
      matchScore: analysis.matchScore ?? 0,
      matchReasons: analysis.matchReasons || [],
      matchNegatives: analysis.matchNegatives || [],
      isRemote: analysis.isRemote || false,
      salaryRange: analysis.salaryRange || undefined,
      salaryNote: analysis.salaryNote || undefined,
      postedDate: normalizeSerperDate(job.date),
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
      matchScore: 0,
      matchReasons: [],
      matchNegatives: ["לא ניתן לנתח את המשרה"],
      isRemote: false,
      postedDate: normalizeSerperDate(job.date),
      source: getDomain(job.link),
      isNonObvious: job.isNonObvious,
    };
  }
}

function extractCompany(title: string): string {
  const separators = [" – ", " — ", " - ", " | ", " at ", " @ "];
  for (const sep of separators) {
    const idx = title.lastIndexOf(sep);
    if (idx > 0) {
      const candidate = title.slice(idx + sep.length)
        .replace(/drushim.*|alljobs.*|jobmaster.*|gotfriends.*|comeet.*/i, "")
        .trim();
      if (candidate.length > 1) return candidate;
    }
  }
  return "ראה מודעה";
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
    if (domain.includes("sahbak")) return "סחבק";
    if (domain.includes("mploy")) return "Mploy";
    if (domain.includes("comeet")) return "Comeet";
    if (domain.includes("jobnet")) return "JobNet";
    if (domain.includes("joba")) return "Joba";
    if (domain.includes("nisha")) return "נישה";
    if (domain.includes("seev")) return "Seev";
    if (domain.includes("urbanrecruits")) return "UrbanRecruits";
    if (domain.includes("goozali")) return "Goozali";
    if (domain.includes("karyera")) return "Karyera";
    if (domain.includes("govo")) return "GOVO";
    return domain;
  } catch {
    return "לוח דרושים";
  }
}

async function searchEducationInstitutions(plan: SearchPlan, lang: string): Promise<EntryPathResult> {
  const queries = (plan.educationQueries ?? []).slice(0, 3);
  const rawResults = (
    await Promise.all(queries.map((q) => serperSearch(q, "", lang)))
  ).flat().slice(0, 8);

  const field = plan.targetTitles?.[0] ?? plan.hebrewQueries?.[0] ?? "התחום";
  const barrier = plan.trainingBarrier ?? "הכשרה מקצועית";
  const months = plan.entryTimeMonths ?? 6;

  try {
    const text = await geminiAnalyze(
      ENTRY_PATH_PROMPT(field, barrier, months, rawResults.map((r) => ({
        title: r.title, link: r.link, snippet: r.snippet,
      }))),
      undefined, 800, true
    );
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return {
      message: parsed.message ?? "",
      trainingBarrier: barrier,
      entryTimeMonths: months,
      institutions: (parsed.institutions ?? []).slice(0, 3),
    };
  } catch {
    return {
      message: `לא מצאתי משרה שמתאימה לך כרגע ללא ${barrier}. הנה 3 מקומות ללמוד את התחום — בעוד כ-${months} חודשים תוכל להתחיל לעבוד בזה.`,
      trainingBarrier: barrier,
      entryTimeMonths: months,
      institutions: [],
    };
  }
}

function getMockJobs(profileText: string): JobResult[] {
  const isRemote =
    profileText.includes("remote") ||
    profileText.includes("מרחוק") ||
    profileText.includes("היברידי");
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
      matchNegatives: [],
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
      matchNegatives: [],
      isRemote: true,
      source: "LinkedIn",
    },
  ];
}

export async function runJobSearch(
  profileText: string,
  onJob?: (job: JobResult) => void,
  lang = "he",
  onEntryPath?: (path: EntryPathResult) => void,
): Promise<{ jobs: JobResult[]; entryPath?: EntryPathResult; demoMode: boolean }> {
  const serperKey = process.env.SERPER_API_KEY;
  const hasRealSearch = serperKey && serperKey !== "your_serper_api_key_here";

  if (hasRealSearch) {
    const plan = await generateSearchPlan(profileText);
    const results = await runSearches(plan);

    // No job results + profession requires training → switch to education path
    if (results.length === 0 && plan.requiresTraining && (plan.educationQueries?.length ?? 0) > 0) {
      const entryPath = await searchEducationInstitutions(plan, lang);
      onEntryPath?.(entryPath);
      return { jobs: [], entryPath, demoMode: false };
    }

    const jobs: JobResult[] = [];
    await Promise.all(
      results.map(async (r) => {
        const job = await analyzeMatch(profileText, r, lang);
        jobs.push(job);
        onJob?.(job);
      })
    );
    jobs.sort((a, b) => b.matchScore - a.matchScore);
    // Drop clearly irrelevant results, but never return empty if search succeeded
    const MINIMUM_SCORE = 30;
    const aboveThreshold = jobs.filter((j) => j.matchScore >= MINIMUM_SCORE);
    return { jobs: aboveThreshold.length >= 2 ? aboveThreshold : jobs, demoMode: false };
  } else {
    const jobs = getMockJobs(profileText);
    for (const job of jobs) {
      onJob?.(job);
    }
    return { jobs, demoMode: true };
  }
}

export async function generateHiddenMarket(
  profileText: string,
  lang: string
): Promise<HiddenMarketResult> {
  try {
    const text = await geminiAnalyze(HIDDEN_MARKET_PROMPT(profileText, lang), undefined, 800, true);
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      intro:
        lang === "he"
          ? "לא מצאנו משרות שעונות בדיוק על כל האילוצים שלך — אבל יש מסלול חלופי שעובד."
          : "We didn't find exact matches — but here's a path that works.",
      facebookGroups: [
        { name: "משרות מפייסבוק לאוזן", why: "הגדולה ביותר בישראל — עשרות פוסטים ביום" },
        { name: "דנה ונועה תעשו לי קריירה", why: "קהילה תומכת, הרבה הפניות ישירות" },
      ],
      outreachTemplate:
        "שלום [שם], ראיתי את הפעילות שלך ב[חברה] ואני מרשים/ה מהגישה שלכם. אני [תפקיד] עם ניסיון ב[תחום] ומחפש/ת את האתגר הבא — האם תהיה פתוחות לשיחה קצרה?",
      linkedinTip:
        'חפשו "#hiring Israel" ו-"We\'re hiring" + התחום שלכם — מנהלי גיוס מפרסמים שם לפני שמעלים למשרות',
    };
  }
}
