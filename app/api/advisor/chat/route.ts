export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { ADVISOR_CHAT_SYSTEM_PROMPT } from "@/lib/advisorPrompts";
import { AdvisorState, ChatMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ message: reply.trim() });
  } catch (error) {
    console.error("advisor chat error:", error);
    return NextResponse.json({ error: "Chat failed." }, { status: 500 });
  }
}
