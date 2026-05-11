import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { geminiAnalyze, safeParseJson } from "@/lib/gemini";
import { DIAGNOSIS_ANALYSIS_PROMPT } from "@/lib/advisorPrompts";

export const maxDuration = 60;

// ── Test personas ────────────────────────────────────────────────────────────
// Each persona has: a synthetic CV profile, personality Q&A answers, and
// the "rules" we expect the advisor to follow (used for automated scoring).

interface Persona {
  id: string;
  label: string;
  profile: string;
  answers: string;
  expectations: {
    mustIncludeBranch?: string;    // branch keyword expected in careerPaths
    mustNotSuggestTech?: boolean;  // Rule 1 — no tech for non-tech profiles
    mustHaveStability?: boolean;   // hard constraint: stable jobs only
    mustAvoidFreelance?: boolean;  // no freelance/startup suggestions
    mustMentionLocation?: string;  // periphery city must appear in realismNote
    mustHaveFinancialUrgency?: boolean; // TRIAGE protocol expected
    hasDisability?: boolean;       // disability accommodation expected
    hasCriminalRecord?: boolean;   // Rule 5U expected
    isUnder25?: boolean;           // under-25 validation expected
    isMilitaryOfficer?: boolean;   // senior officer translation expected
    isDualBranch?: boolean;        // two-branch mix expected
  };
}

const PERSONAS: Persona[] = [
  // ── BRANCH 1 — Beauty ──────────────────────────────────────────────────────
  {
    id: "beauty-nails",
    label: "טכנאית ציפורניים רוצה להתפתח",
    profile: "שם: מיכל לוי, גיל 29. עוסקת 5 שנים כטכנאית ציפורניים ועיצוב ריסים. עצמאית, עובדת מהבית. מרוויחה 8,000 ₪ לחודש. עייפה מהעבודה הפיזית היומיומית, רוצה לצמוח.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה — אני מגדירה את הדרך בעצמי\nQ: ערכים?\nA: תגמול כלכלי, חופש ואוטונומיה\nQ: חלום?\nA: ללמד נשים אחרות את המקצוע\nQ: מה אחרים אומרים?\nA: שאני הכי סבלנית ומדויקת שיש",
    expectations: { mustIncludeBranch: "beauty", mustNotSuggestTech: true },
  },
  // ── BRANCH 2 — Tech (explicit) ─────────────────────────────────────────────
  {
    id: "tech-fullstack",
    label: "מפתח Full Stack 3 שנות ניסיון",
    profile: "שם: אלון כהן, גיל 26. תואר מדעי המחשב, 3 שנות ניסיון Full Stack (React + Node). מחפש שינוי — השרות הנוכחי יציב אבל משעמם.",
    answers: "Q: סביבת עבודה?\nA: סביבה של צוות ורעיונות\nQ: ערכים?\nA: למידה מתמדת, תגמול כלכלי\nQ: חלום?\nA: לבנות מוצר שלי\nQ: מה אחרים אומרים?\nA: שאני פותר בעיות מהר מאוד",
    expectations: { mustIncludeBranch: "tech" },
  },
  // ── Hard constraint: stability ─────────────────────────────────────────────
  {
    id: "stability-seeker",
    label: "מחפשת יציבות מוחלטת",
    profile: "שם: רחל אברהם, גיל 38. אם חד-הורית ל-2 ילדים. הייתה עצמאית בתחום הקייטרינג 4 שנים — עסק נסגר. מחפשת עבודה שכירה יציבה, רצוי ממשלתית.",
    answers: "Q: סביבת עבודה?\nA: סדר, הגדרות ומטרות ברורות\nQ: ערכים?\nA: יציבות, ביטחון ותנאים טובים\nQ: חלום?\nA: שיהיה לי בטוח — פנסיה, ביטוח בריאות, שעות קבועות\nQ: מה אחרים אומרים?\nA: שאני מאורגנת ואמינה",
    expectations: { mustHaveStability: true, mustAvoidFreelance: true, mustNotSuggestTech: true },
  },
  // ── Financial urgency (TRIAGE) ─────────────────────────────────────────────
  {
    id: "financial-urgency",
    label: "חוב — צריך הכנסה תוך 3 שבועות",
    profile: "שם: יוסי מזרחי, גיל 34. ברמן 8 שנים, פוטר לפני חודש. חוב של 15,000 ₪ בכרטיס אשראי. צריך הכנסה תוך 3 שבועות. אין תעודות, אין תואר.",
    answers: "Q: סביבת עבודה?\nA: קצב מהיר ואקשן\nQ: ערכים?\nA: תגמול כלכלי גבוה\nQ: חלום?\nA: לנהל בר משלי\nQ: מה אחרים אומרים?\nA: שאני יודע לשמור על אנשים מאושרים",
    expectations: { mustHaveFinancialUrgency: true, mustNotSuggestTech: true },
  },
  // ── Periphery location ─────────────────────────────────────────────────────
  {
    id: "periphery-kiryat-shmona",
    label: "קרית שמונה — רוצה הייטק",
    profile: "שם: דניאל אורן, גיל 22. קרית שמונה. עשה קורס Python בסיסי ב-YouTube. רוצה להיכנס להייטק. אין לו תואר, אין קשרים.",
    answers: "Q: סביבת עבודה?\nA: עבודה עצמאית עם ראש שקט\nQ: ערכים?\nA: למידה מתמדת, תגמול כלכלי\nQ: חלום?\nA: לעבוד בחברת הייטק גדולה\nQ: מה אחרים אומרים?\nA: שאני מתמיד וסקרן",
    expectations: { mustMentionLocation: "קרית שמונה", mustIncludeBranch: "tech" },
  },
  // ── Under-25 trade choice ──────────────────────────────────────────────────
  {
    id: "under25-electrician",
    label: "בן 21 בחר חשמלאות על פני אוניברסיטה",
    profile: "שם: שמעון ביטון, גיל 21. סיים 12 שנות לימוד. מעוניין להיות חשמלאי מוסמך. לא אוהב ללמוד תיאוריה, אוהב לעבוד עם הידיים.",
    answers: "Q: סביבת עבודה?\nA: קצב מהיר ואקשן\nQ: ערכים?\nA: תגמול כלכלי, חופש\nQ: חלום?\nA: להקים חברת חשמל עצמאית\nQ: מה אחרים אומרים?\nA: שאני נוח לעבוד איתי ועובד קשה",
    expectations: { isUnder25: true, mustIncludeBranch: "construction" },
  },
  // ── Military officer transition ────────────────────────────────────────────
  {
    id: "military-officer",
    label: "אלוף משנה יוצא צבא — 20 שנות שירות",
    profile: "שם: גל שפירא, גיל 47. פרש מהצבא לאחר 20 שנה. דרגת סא\"ל, פיקד על גדוד של 800 חיילים. ניהל תקציב שנתי של 50 מיליון שקל.",
    answers: "Q: סביבת עבודה?\nA: סדר, הגדרות ומטרות ברורות\nQ: ערכים?\nA: הובלה, עמדה, השפעה\nQ: חלום?\nA: לנהל ארגון גדול\nQ: מה אחרים אומרים?\nA: שאני לידר טבעי שמוציא את הטוב מכל אחד",
    expectations: { isMilitaryOfficer: true },
  },
  // ── Dual-branch profile ────────────────────────────────────────────────────
  {
    id: "dual-branch-chef-writer",
    label: "שף שאוהב לכתוב על אוכל",
    profile: "שם: עמית רוזן, גיל 33. שף מקצועי 9 שנים. במקביל מנהל בלוג קולינרי עם 15,000 עוקבים. חולם לשלב את שניהם.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה\nQ: ערכים?\nA: יצירה, חופש, השפעה\nQ: חלום?\nA: לכתוב ספר בישול שיוציא לאור בהוצאת ספרים\nQ: מה אחרים אומרים?\nA: שאני מסביר אוכל בצורה שגורמת לרצות לבשל",
    expectations: { isDualBranch: true },
  },
  // ── Disability / chronic illness ───────────────────────────────────────────
  {
    id: "disability-remote",
    label: "מורה עם MS — צריכה שעות גמישות",
    profile: "שם: תמר גורן, גיל 41. מורה לאנגלית 12 שנה. אובחנה ב-MS לפני שנתיים. לא יכולה לעמוד 6 שעות ביום. מחפשת אלטרנטיבה שמשתמשת בידע שלה.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה\nQ: ערכים?\nA: משמעות, חופש, למידה\nQ: חלום?\nA: ללמד ממקום הנוח לי\nQ: מה אחרים אומרים?\nA: שאני מסבירה דברים מסובכים בפשטות",
    expectations: { hasDisability: true, mustAvoidFreelance: false },
  },
  // ── Recovery / gap ─────────────────────────────────────────────────────────
  {
    id: "addiction-recovery",
    label: "5 שנות שקמה מהתמכרות — חוזר לשוק",
    profile: "שם: ניר לוי, גיל 39. היה מנהל מכירות לפני 6 שנים. עבר 5 שנות התמכרות לאלכוהול, עכשיו 14 חודשי שיקום. רוצה לחזור לעבוד.",
    answers: "Q: סביבת עבודה?\nA: עבודה עצמאית עם ראש שקט\nQ: ערכים?\nA: יציבות, משמעות\nQ: חלום?\nA: לעזור לאנשים אחרים שעברו מה שעברתי\nQ: מה אחרים אומרים?\nA: שיש לי כריזמה טבעית עם אנשים",
    expectations: {},
  },
  // ── Altruistic / impact ────────────────────────────────────────────────────
  {
    id: "impact-driven",
    label: "מנהלת הזדמנות NGO — רוצה להרוויח יותר",
    profile: "שם: נועה כץ, גיל 31. 4 שנות ניסיון בניהול פרויקטים בארגון ללא מטרת רווח. מרוויחה 9,500 ₪. מרגישה שהיא נותנת הרבה וצריכה גם לשפר את ההכנסה.",
    expectations: {},
    answers: "Q: סביבת עבודה?\nA: סביבה של צוות ורעיונות\nQ: ערכים?\nA: משמעות, תגמול כלכלי\nQ: חלום?\nA: לנהל ארגון שעושה שינוי אמיתי ולהתפרנס טוב\nQ: מה אחרים אומרים?\nA: שאני מנהלת פרויקטים מדהימה שרואה את התמונה הגדולה",
  },
  // ── Criminal record ────────────────────────────────────────────────────────
  {
    id: "criminal-record",
    label: "הרשעה בעבר — רוצה לעבוד בחשבונאות",
    profile: "שם: אלי נחמה, גיל 36. הורשע לפני 8 שנים בגין קטין. שירת 18 חודשי מאסר. מאז למד הנהלת חשבונות. רוצה לעבוד כחשב שכר.",
    answers: "Q: סביבת עבודה?\nA: סדר, הגדרות ומטרות ברורות\nQ: ערכים?\nA: יציבות, ביטחון\nQ: חלום?\nA: לעבוד בחברה פרטית ולהיות מקצועי אמין\nQ: מה אחרים אומרים?\nA: שאני מדויק ואחראי",
    expectations: { hasCriminalRecord: true },
  },
  // ── Senior academic (over-qualified) ──────────────────────────────────────
  {
    id: "overqualified-phd",
    label: "ד\"ר כלכלה — קיבל \"over-qualified\" 6 פעמים",
    profile: "שם: יעקב פלדמן, גיל 52. דוקטורט בכלכלה מהאוניברסיטה העברית. 20 שנה בסטארטאפים, החברה האחרונה נסגרה. מקבל דחיות בגלל over-qualification.",
    answers: "Q: סביבת עבודה?\nA: אוטונומיה גבוהה עם מטרה ברורה\nQ: ערכים?\nA: למידה, השפעה\nQ: חלום?\nA: להשפיע על מדיניות כלכלית בישראל\nQ: מה אחרים אומרים?\nA: שאני מוצא דפוסים שאחרים לא רואים",
    expectations: {},
  },
  // ── Social anxiety / introversion ─────────────────────────────────────────
  {
    id: "social-anxiety-introvert",
    label: "חרדה חברתית — מחפשת עבודה בלי ישיבות",
    profile: "שם: שירה אלמוג, גיל 27. בוגרת גרפיקה. עובדת כעת בסוכנות פרסום בה יש ישיבות קבוצתיות 3 פעמים ביום — מוצאת את זה מתיש מאוד. יש לה אבחנה של חרדה חברתית.",
    answers: "Q: סביבת עבודה?\nA: עבודה עצמאית עם ראש שקט\nQ: ערכים?\nA: חופש, גמישות, יצירה\nQ: חלום?\nA: ליצור דברים יפים בלי שיפריעו לי\nQ: מה אחרים אומרים?\nA: שהעבודות שלי מדברות בעצמן",
    expectations: {},
  },
  // ── Career changer — 40s, burnout ──────────────────────────────────────────
  {
    id: "burnout-accountant",
    label: "רואת חשבון שרוצה לעזוב — שחיקה מוחלטת",
    profile: "שם: דינה שטרן, גיל 44. רואת חשבון 18 שנה. שחיקה קשה. לא ישנה טוב שנה. רוצה לעשות משהו עם אנשים, לא רק מספרים.",
    answers: "Q: סביבת עבודה?\nA: סביבה של צוות ורעיונות\nQ: ערכים?\nA: משמעות, השפעה\nQ: חלום?\nA: ליעץ לעסקים קטנים — לא כרואת חשבון, כמנטורית\nQ: מה אחרים אומרים?\nA: שאני מסבירה את הכספים בצורה שגורמת לאנשים להרגיש בטוח",
    expectations: {},
  },
  // ── Parent return to workforce ─────────────────────────────────────────────
  {
    id: "parent-return",
    label: "חזרה לשוק אחרי 5 שנות הורות",
    profile: "שם: אביגיל מוזס, גיל 37. הייתה מנהלת תוכן דיגיטלי. לקחה 5 שנות חופשת לידה לגדל 3 ילדים. הצעיר בן 3. מחפשת לחזור לעבוד — רצוי חלקי בתחילה.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה\nQ: ערכים?\nA: גמישות, חופש, תגמול כלכלי\nQ: חלום?\nA: לעבוד בתוכן שמשמעותי לאנשים\nQ: מה אחרים אומרים?\nA: שאני כותבת ברמה של עורכת, לא רק כותבת",
    expectations: {},
  },
  // ── Physical trade with injury ─────────────────────────────────────────────
  {
    id: "trade-injury",
    label: "נגר 15 שנה — פציעת גב, לא יכול להמשיך",
    profile: "שם: אמיר דהן, גיל 42. נגר מטבחים 15 שנה. פציעת דיסק בגב לפני שנה — לא יכול להרים. חייב מקצוע שלא דורש עמידה ממושכת.",
    answers: "Q: סביבת עבודה?\nA: סדר, הגדרות ומטרות ברורות\nQ: ערכים?\nA: יציבות, תגמול כלכלי\nQ: חלום?\nA: להמשיך בעולם הנגרות אבל בצורה אחרת\nQ: מה אחרים אומרים?\nA: שאני יודע לקרוא שרטוטים ולתכנן פרויקטים מושלמים",
    expectations: { hasDisability: true },
  },
  // ── Teen / new immigrant ────────────────────────────────────────────────────
  {
    id: "new-immigrant",
    label: "עולה חדשה מרוסיה — מהנדסת, לא מכירה שוק ישראלי",
    profile: "שם: אנסטסיה ולנטינה, גיל 34. הגיעה לישראל לפני 8 חודשים מרוסיה. מהנדסת מכונות 8 שנות ניסיון. עברית בסיסית, אנגלית טובה.",
    answers: "Q: סביבת עבודה?\nA: מסגרת ברורה, תהליכים מוגדרים\nQ: ערכים?\nA: יציבות, למידה\nQ: חלום?\nA: לעבוד כמהנדסת בחברה ישראלית גדולה\nQ: מה אחרים אומרים?\nA: שאני מדויקת ואנחנו יכולים לסמוך עליה",
    expectations: {},
  },
  // ── Reduced capacity (4 hrs/day) ───────────────────────────────────────────
  {
    id: "reduced-capacity",
    label: "עובד 4 שעות ביום בגלל מחלה כרונית",
    profile: "שם: אורי זיו, גיל 38. מאובחן עם פיברומיאלגיה. יכול לעבוד בממוצע 4 שעות ביום, לא יותר. היה מנהל פרויקטים בחינוך. צריך להכניס לפחות 6,000 ₪ לחודש.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה\nQ: ערכים?\nA: גמישות, חופש, יציבות\nQ: חלום?\nA: לעבוד מהבית בשעות שמתאימות לגוף שלי\nQ: מה אחרים אומרים?\nA: שאני מארגן ומתכנן ברמה שאנשים לא מאמינים",
    expectations: { hasDisability: true },
  },
  // ── Beauty scale-up (5JJ) ──────────────────────────────────────────────────
  {
    id: "beauty-scaleup",
    label: "מאפרת 7 שנים — עייפה, רוצה לצמוח",
    profile: "שם: מיה אשד, גיל 31. מאפרת מקצועית 7 שנים, עצמאית. עובדת 6 ימים בשבוע. מרוויחה 14,000 ₪ אבל עייפה מהעומס הפיזי. רוצה לשמר את הכנסה ולצמוח.",
    answers: "Q: סביבת עבודה?\nA: גמישות מלאה\nQ: ערכים?\nA: תגמול כלכלי, חופש\nQ: חלום?\nA: לבנות מותג ולמכור קורסים\nQ: מה אחרים אומרים?\nA: שאני מאפרת הכי טובה שהן פגשו ושאני מלמדת בשמחה",
    expectations: { mustIncludeBranch: "beauty" },
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────────

interface DiagnosisOutput {
  topMessage?: string;
  topRoles?: string[];
  careerPaths?: { title?: string; domain?: string }[];
  weekOneSteps?: string[];
  reflection?: string;
  realismNote?: string;
  strengths?: string[];
  careerDirections?: string[];
}

function hebrewRatio(text: string): number {
  const hebrewChars = (text.match(/[֐-׿]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  return totalChars > 0 ? hebrewChars / totalChars : 0;
}

function scoreResponse(output: DiagnosisOutput, persona: Persona): {
  score: number;
  maxScore: number;
  issues: string[];
  passes: string[];
} {
  const issues: string[] = [];
  const passes: string[] = [];
  let score = 0;
  const maxScore = 10;

  // 1. JSON validity + structure (2 pts)
  const hasStructure = output.topMessage && output.careerPaths && output.weekOneSteps && output.reflection;
  if (hasStructure) { score += 2; passes.push("מבנה JSON תקין"); }
  else { issues.push("חסרים שדות מרכזיים"); }

  // 2. Hebrew ratio in topMessage (1 pt)
  if (output.topMessage) {
    const ratio = hebrewRatio(output.topMessage);
    if (ratio >= 0.5) { score += 1; passes.push(`עברית ב-topMessage: ${Math.round(ratio * 100)}%`); }
    else { issues.push(`עברית נמוכה ב-topMessage: ${Math.round(ratio * 100)}%`); }
  }

  // 3. topMessage specificity — not generic (1 pt)
  const genericPhrases = ["אדם יצירתי", "כישרונות מרשימים", "מוכן לשלב הבא", "כישורים רבים"];
  const isGeneric = output.topMessage ? genericPhrases.some(p => output.topMessage!.includes(p)) : true;
  if (!isGeneric && output.topMessage && output.topMessage.length > 40) {
    score += 1; passes.push("topMessage ספציפי ולא גנרי");
  } else {
    issues.push("topMessage נשמע גנרי");
  }

  // 4. Exactly 3 careerPaths (1 pt)
  if (output.careerPaths?.length === 3) { score += 1; passes.push("3 careerPaths"); }
  else { issues.push(`מספר careerPaths שגוי: ${output.careerPaths?.length ?? 0}`); }

  // 5. No tech for non-tech (1 pt)
  if (persona.expectations.mustNotSuggestTech) {
    const techKeywords = ["מפתח", "developer", "full stack", "backend", "frontend", "devops", "product manager", "ux", "data scientist"];
    const allPaths = (output.careerPaths || []).map(p => `${p.title} ${p.domain}`).join(" ").toLowerCase();
    const hasTech = techKeywords.some(k => allPaths.includes(k));
    if (!hasTech) { score += 1; passes.push("ללא הצעות טק למי שאינו טק"); }
    else { issues.push("הוצע תפקיד טק לפרופיל ללא ניסיון טק"); }
  } else {
    score += 1; // neutral
  }

  // 6. Stability hard constraint (1 pt)
  if (persona.expectations.mustAvoidFreelance) {
    const allText = JSON.stringify(output).toLowerCase();
    const freelanceWords = ["עצמאי", "freelance", "startup", "סטארטאפ", "יזמות", "להקים עסק"];
    const hasFreelance = freelanceWords.some(w => allText.includes(w));
    if (!hasFreelance) { score += 1; passes.push("ללא הצעות עצמאות לפרופיל שמבקש יציבות"); }
    else { issues.push("הוצעה עצמאות לפרופיל שדרש יציבות"); }
  } else {
    score += 1; // neutral
  }

  // 7. Reflection quality — 3 sentences (1 pt)
  if (output.reflection) {
    const sentences = output.reflection.split(/[.!?—]/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2) { score += 1; passes.push("reflection מספיק ארוך"); }
    else { issues.push("reflection קצר מדי"); }
  } else {
    issues.push("חסר reflection");
  }

  // 8. weekOneSteps present and specific (1 pt)
  if (output.weekOneSteps && output.weekOneSteps.length >= 2) {
    const avgLen = output.weekOneSteps.reduce((s, w) => s + w.length, 0) / output.weekOneSteps.length;
    if (avgLen > 20) { score += 1; passes.push("weekOneSteps ספציפיים"); }
    else { issues.push("weekOneSteps קצרים מדי"); }
  } else {
    issues.push("weekOneSteps חסרים");
  }

  // 9. Response length sanity (1 pt)
  const totalLength = JSON.stringify(output).length;
  if (totalLength > 800) { score += 1; passes.push(`תגובה מפורטת (${totalLength} תווים)`); }
  else { issues.push(`תגובה קצרה מדי (${totalLength} תווים)`); }

  return { score, maxScore, issues, passes };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const countParam = parseInt(req.nextUrl.searchParams.get("count") ?? "10");
  const count = Math.min(Math.max(countParam, 1), PERSONAS.length);

  // Shuffle and pick
  const shuffled = [...PERSONAS].sort(() => Math.random() - 0.5).slice(0, count);

  const results = [];
  let totalScore = 0;
  let totalMax = 0;

  for (const persona of shuffled) {
    const t0 = Date.now();
    try {
      const prompt = DIAGNOSIS_ANALYSIS_PROMPT(persona.profile, persona.answers);
      const raw = await geminiAnalyze("Analyze now.", prompt, 3000, true);
      const output = safeParseJson<DiagnosisOutput>(raw, `training-${persona.id}`);
      const { score, maxScore, issues, passes } = scoreResponse(output, persona);
      totalScore += score;
      totalMax += maxScore;

      results.push({
        id: persona.id,
        label: persona.label,
        score,
        maxScore,
        pct: Math.round((score / maxScore) * 100),
        passes,
        issues,
        topMessage: output.topMessage ?? null,
        topRoles: output.topRoles ?? [],
        durationMs: Date.now() - t0,
        ok: true,
      });
    } catch (err) {
      results.push({
        id: persona.id,
        label: persona.label,
        score: 0,
        maxScore: 10,
        pct: 0,
        passes: [],
        issues: [`שגיאה: ${err instanceof Error ? err.message : String(err)}`],
        topMessage: null,
        topRoles: [],
        durationMs: Date.now() - t0,
        ok: false,
      });
      totalMax += 10;
    }
  }

  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const failing = results.filter(r => r.pct < 60);

  return NextResponse.json({
    ok: failing.length === 0,
    overallScore: `${totalScore}/${totalMax} (${overallPct}%)`,
    testedCount: results.length,
    failingCount: failing.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
