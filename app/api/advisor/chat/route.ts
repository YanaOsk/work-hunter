export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { geminiGenerate } from "@/lib/gemini";
import { ADVISOR_CHAT_SYSTEM_PROMPT } from "@/lib/advisorPrompts";
import { AdvisorState, ChatMessage } from "@/lib/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { upsertAdvisorSession, logAdvisorChatTurn } from "@/lib/advisorSessions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(request, { windowMs: 60_000, maxRequests: 20 });
  if (limited) return limited;

  try {
    const { messages, advisorState, lang } = (await request.json()) as {
      messages: ChatMessage[];
      advisorState: AdvisorState;
      lang?: string;
    };

    const langInstruction = lang === "he" ? "השב בעברית בלבד." : "Respond in English only.";

    const profileStr = JSON.stringify(advisorState.userProfile.parsedData || {}, null, 2);
    const diagnosisStr = advisorState.diagnosis
      ? JSON.stringify(advisorState.diagnosis, null, 2)
      : "לא בוצע אבחון.";
    const directionStr = advisorState.direction
      ? JSON.stringify(advisorState.direction, null, 2)
      : "לא הוחלט על כיוון.";

    const systemWithContext = `${ADVISOR_CHAT_SYSTEM_PROMPT}

${langInstruction}

--- מה שאתה יודע על הלקוח ---

פרופיל:
${profileStr}

אבחון אישיותי:
${diagnosisStr}

ניתוח כיוון חיים:
${directionStr}
--- סוף מידע ---`;

    const history = messages
      .map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`)
      .join("\n\n");
    const prompt = `${history}\n\nAdvisor:`;

    const reply = await geminiGenerate(prompt, systemWithContext, 1200);
    const trimmedReply = reply.trim();

    // Persist session + log this turn (fire-and-forget, don't block response)
    const userEmail = session.user.email!;
    const lastUserMsg = messages[messages.length - 1];
    Promise.all([
      upsertAdvisorSession(userEmail, advisorState),
      logAdvisorChatTurn(
        userEmail,
        lastUserMsg?.content ?? "",
        trimmedReply,
        advisorState,
        messages.length
      ),
    ]).catch((e) => console.error("advisor session save error:", e));

    return NextResponse.json({ message: trimmedReply });
  } catch (error) {
    console.error("advisor chat error:", error);
    return NextResponse.json({ error: "Chat failed." }, { status: 500 });
  }
}
