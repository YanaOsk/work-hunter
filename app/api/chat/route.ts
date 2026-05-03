export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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

  try {
    const body = await request.json();
    const { messages, userProfile, lang } = body as {
      messages: ChatMessage[];
      userProfile: Record<string, unknown>;
      lang?: string;
    };

    const parsedData = (userProfile?.parsedData as Record<string, unknown>) || {};
    const gender = detectGender(messages, parsedData);

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

    const rawIntro = (userProfile as Record<string, unknown>)?.rawText as string | undefined;

    const systemWithContext = `${CHAT_SYSTEM_PROMPT}

${langInstruction}

Current user profile (what we know so far):
${JSON.stringify(parsedData, null, 2)}

${rawIntro ? `Original intro from the user:\n"${rawIntro}"\n` : ""}
Missing information: ${JSON.stringify(userProfile?.missingFields || [])}`;

    const history = messages
      .map((m) => `${m.role === "user" ? "משתמש" : "Scout"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${history}\n\nScout:`;

    const agentResponse = await geminiChat(prompt, systemWithContext, 1200);

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

    return NextResponse.json({ message: cleanMessage, readyToSearch: shouldSearch, suggestedReplies });
  } catch (error) {
    console.error("chat error:", error);
    return NextResponse.json({ error: "Chat failed. Check your GEMINI_API_KEY." }, { status: 500 });
  }
}
