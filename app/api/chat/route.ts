export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { geminiChat } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";

function detectGender(messages: ChatMessage[], parsedData: Record<string, unknown>): "female" | "male" | "unknown" {
  if (parsedData.pregnancyWeek) return "female";
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");
  if (/\bאני (מחפשת|עובדת|מנהלת|גרה|נשואה|גרושה|רווקה|אמא|עצמאית|פרילנסרית|מועמדת)\b/.test(userText)) return "female";
  if (/\bבהריון\b/.test(userText)) return "female";
  if (/\bאני (מחפש|עובד|מנהל|גר|נשוי|גרוש|רווק|אבא|עצמאי|פרילנסר|מועמד)\b/.test(userText)) return "male";
  return "unknown";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(request, { windowMs: 60_000, maxRequests: 30 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { messages, userProfile, lang } = body as {
      messages: ChatMessage[];
      userProfile: Record<string, unknown>;
      lang?: string;
    };

    const parsedData = (userProfile?.parsedData as Record<string, unknown>) || {};
    const gender = detectGender(messages, parsedData);

    const lastUserMsg = messages[messages.length - 1];
    // Structured CV summary sent by InterviewPhase when parsedData is available
    const isCvUpload = lastUserMsg?.role === "user" && lastUserMsg.content.startsWith("[CV_UPLOAD]");
    // \b doesn't work on Hebrew (Hebrew chars are \W), so no word boundaries on Hebrew terms
    const CV_PASTE_RE = /(ניסיון עבודה|ניסיון מקצועי|השכלה|כישורים|קורות חיים|תפקיד נוכחי|Work Experience|Education|Skills|Resume|Summary|Employment History)/i;
    const isPastedCV = isCvUpload || (lastUserMsg?.role === "user" &&
      lastUserMsg.content.length > 350 &&
      CV_PASTE_RE.test(lastUserMsg.content));

    const genderRule = gender === "female"
      ? 'פנה למשתמש בלשון נקבה: "את", "שלך", "אותך", "את מחפשת", "מה מדליק אותך".'
      : gender === "male"
      ? 'פנה למשתמש בלשון זכר: "אתה", "שלך", "אותך", "אתה מחפש", "מה מדליק אותך".'
      : 'פנה בלשון רבים ניטרלית: "אתכם", "שלכם", "מה מדליק אתכם" — אסור לוכסנים ("בחר/י", "את/ה").';

    const searchExample = gender === "female"
      ? "לאיזה אזור את מחפשת?"
      : gender === "male"
      ? "לאיזה אזור אתה מחפש?"
      : "לאיזה אזור אתם מחפשים?";

    const langInstruction = lang === "he"
      ? `חוקי שפה — חובה לקיים:
1. עברית יומיומית בלבד — כמו הודעת WhatsApp, לא מכתב.
2. תגובה קצרה: 1-3 משפטים. שאלה אחת בסוף, לא יותר.
3. מילים אסורות: "בהחלט", "כמובן", "אשמח", "בוודאי", "על מנת ל", "כמו כן", "יש לציין", "הינו", "בהתאם ל", "לאור האמור", "נשמע".
4. ${genderRule}
5. אסור להתחיל תשובה במילה "נשמע" — זה נשמע רובוטי ושחוק. תגיב ישירות לתוכן.
   ניסוחים מותרים לפתיחה: "אוקיי", "מעניין", "אז", "רגע", "הבנתי", "יופי" — אבל עדיף לפתוח ישר בתגובה.
6. אם מתאים (לא חובה), הוסף בסוף 2-3 תשובות מהירות מוצעות בפורמט: [QUICK: "תשובה א'"|"תשובה ב'"|"תשובה ג'"]

דוגמה טובה: "Full Stack עם ניסיון בענן — מעניין. ${searchExample}"
דוגמה רעה: "נשמע! לאור המידע שסיפרת אשמח לדעת מה האזור הגיאוגרפי המועדף עליך לעבודה?"`
      : `Respond in English only. Keep answers short — 1-3 sentences. One question at a time.
Optionally, when it makes sense, append 2-3 quick reply suggestions at the end in this exact format: [QUICK: "Option A"|"Option B"|"Option C"]`;

    // Don't include rawIntro when we have a clean [CV_UPLOAD] message:
    // garbled PDF text (lone surrogates, invalid UTF-8) in the system prompt
    // causes JSON.stringify to throw, making the entire route crash silently.
    const rawIntroRaw = (userProfile as Record<string, unknown>)?.rawText as string | undefined;
    const rawIntro = isCvUpload ? undefined : rawIntroRaw;

    const cvSummary = [
      parsedData.currentRole,
      parsedData.yearsExperience != null ? `${parsedData.yearsExperience} שנות ניסיון` : null,
      parsedData.location,
      (parsedData.skills as string[] | undefined)?.slice(0, 4).join(", "),
    ].filter(Boolean).join(" | ");

    console.log("[chat] isCvUpload:", isCvUpload, "isPastedCV:", isPastedCV, "cvSummary:", cvSummary || "(empty)", "firstMsgPreview:", lastUserMsg?.content?.slice(0, 80));

    const cvPasteInstruction = isPastedCV ? `

IMPORTANT INSTRUCTION — CV RECEIVED:
${cvSummary
  ? `Extracted data: ${cvSummary}

YOUR RESPONSE MUST follow this exact structure:
Line 1: Mirror back the key facts in one sentence. Example: "ראיתי — ${cvSummary.split(" | ")[0] ?? "מומחה"} עם ${cvSummary.split(" | ")[1] ?? "ניסיון רב"} — מעניין."
Line 2: Ask exactly ONE question about what is missing or unclear (location / salary / desired role).
After the user replies once — add [SEARCH_NOW] at the end of your response.
If location AND salary are already in parsedData — add [SEARCH_NOW] right now, no questions.`
  : `Could not extract structured data from the CV.
Say: "העליתם קורות חיים — ספרו לי בקצרה: מה התפקיד הנוכחי שלכם ומה אתם מחפשים בתפקיד הבא?"
After they describe themselves — ask one question about location or salary, then add [SEARCH_NOW].`}
If the CV is in English, respond in English with the same logic.
` : "";

    // Sanitize parsedData before embedding in system prompt — lone surrogates in
    // AI-generated field values cause JSON.stringify to throw in Node 20+.
    const sanitizeObj = (v: unknown): unknown => {
      if (typeof v === "string") return v.replace(/[\uD800-\uDFFF]/g, "?");
      if (Array.isArray(v)) return v.map(sanitizeObj);
      if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, val]) => [k, sanitizeObj(val)]));
      return v;
    };
    const safeParsedData = sanitizeObj(parsedData);

    const systemWithContext = `${CHAT_SYSTEM_PROMPT}
${cvPasteInstruction}
${langInstruction}

Current user profile (what we know so far):
${JSON.stringify(safeParsedData, null, 2)}

${rawIntro ? `Original intro from the user:\n"${rawIntro}"\n` : ""}
Missing information: ${JSON.stringify(userProfile?.missingFields || [])}`;

    // Strip lone surrogates that make JSON.stringify crash (garbled PDF text)
    const sanitize = (s: string) => s.replace(/[\uD800-\uDFFF]/g, "?");

    const history = messages
      .slice(-8)
      .map((m) => `${m.role === "user" ? "משתמש" : "Scout"}: ${sanitize(m.content)}`)
      .join("\n\n");

    const prompt = `${history}\n\nScout:`;

    const agentResponse = await geminiChat(prompt, systemWithContext, 500);

    const shouldSearch = agentResponse.includes("[SEARCH_NOW]") || agentResponse.includes("[READY_TO_SEARCH]");

    // Parse optional quick-reply chips: [QUICK: "a"|"b"|"c"]
    const quickMatch = agentResponse.match(/\[QUICK:\s*"([^"]+)"(?:\|"([^"]+)")?(?:\|"([^"]+)")?\]/);
    const suggestedReplies: string[] = quickMatch
      ? [quickMatch[1], quickMatch[2], quickMatch[3]].filter(Boolean) as string[]
      : [];

    const cleanMessage = agentResponse
      .replace("[SEARCH_NOW]", "")
      .replace("[READY_TO_SEARCH]", "")
      .replace(/\[QUICK:[^\]]+\]/g, "")
      .trim()
      // Strip leading "נשמע" openers that Gemini insists on adding
      .replace(/^נשמע[.,!،]?\s*/u, "")
      .replace(/^נשמע\s+/u, "")
      .trim();

    // If AI sent only [SEARCH_NOW] with no text, provide a fallback so the client
    // doesn't see an empty message and incorrectly show a "temporary error".
    const finalMessage = cleanMessage || (shouldSearch
      ? (lang === "he" ? "מצאתי מספיק פרטים — מחפש לכם משרות מתאימות!" : "Got it — searching for matching jobs now!")
      : "");

    return NextResponse.json({ message: finalMessage, readyToSearch: shouldSearch, suggestedReplies });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("chat error:", msg);
    return NextResponse.json({ error: `Chat failed: ${msg}` }, { status: 500 });
  }
}
