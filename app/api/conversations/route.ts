export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { saveConversation, listConversations } from "@/lib/conversations";
import type { ConversationMessage } from "@/lib/conversations";
import type { JobResult } from "@/lib/types";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

async function generateTitle(
  messages: ConversationMessage[],
  jobs: JobResult[],
  searchContext: string
): Promise<string> {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("no key");

    const { default: Groq } = await import("groq-sdk");
    const groq = new Groq({ apiKey: key });

    // searchContext is the full formatted conversation — best source for a meaningful title
    const contextSnippet = searchContext
      ? searchContext.slice(0, 1200)
      : messages
          .slice(0, 8)
          .map((m) => `${m.role === "user" ? "משתמש" : "Scout"}: ${m.content.slice(0, 200)}`)
          .join("\n");

    const topJobs = jobs.slice(0, 3).map((j) => j.title).join(", ");

    const prompt = `אתה עוזר שמייצר כותרות קצרות בעברית לשיחות חיפוש עבודה.

קרא את השיחה הבאה ואת המשרות שנמצאו, וכתוב כותרת קצרה בעברית (3-6 מילים) שמתארת את פרופיל המחפש ואת מה שחיפשו.

שיחה:
${contextSnippet}

משרות שנמצאו: ${topJobs || "לא נמצאו"}

כתוב רק את הכותרת, בלי הסבר ובלי מירכאות. הכותרת תתאר את הרקע והמטרה — למשל: "מפתח Full Stack תל אביב", "מנהלת מוצר היברידי", "מעצבת UX ניסיון בכיר", "אנליסט נתונים Python BI".`;

    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 25,
    });

    const title = resp.choices[0]?.message?.content?.trim().replace(/^["'״]|["'״]$/g, "") ?? "";
    if (title && title.length <= 80) return title;
  } catch {
    // fall through to heuristic
  }

  // Heuristic fallback: job titles from results
  if (jobs.length > 0) {
    return jobs.slice(0, 2).map((j) => j.title).join(" · ");
  }
  // Last resort: extract role from searchContext
  const roleMatch = searchContext?.match(/(?:role|תפקיד|עובד כ|אני )[\s:]*([\w\s]{3,25})/i);
  if (roleMatch) return roleMatch[1].trim();
  return "חיפוש משרות";
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversations = await listConversations(userId);
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, searchContext, jobs } = (await req.json()) as {
    messages: ConversationMessage[];
    searchContext: string;
    jobs?: JobResult[];
  };

  const jobsList = jobs ?? [];
  const title = await generateTitle(messages, jobsList, searchContext ?? "");
  const id = await saveConversation(userId, messages, searchContext, jobsList, title);
  return NextResponse.json({ id }, { status: 201 });
}
