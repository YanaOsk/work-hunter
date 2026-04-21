import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userProfile, lang } = body as {
      messages: ChatMessage[];
      userProfile: Record<string, unknown>;
      lang?: string;
    };

    const langInstruction = lang === "he"
      ? "השב בעברית בלבד."
      : "Respond in English only.";

    const systemWithContext = `${CHAT_SYSTEM_PROMPT}

${langInstruction}

Current user profile (what we know so far):
${JSON.stringify(userProfile?.parsedData || {}, null, 2)}

Missing information we still need: ${JSON.stringify(userProfile?.missingFields || [])}`;

    const history = messages
      .map((m) => `${m.role === "user" ? "User" : "Scout"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${history}\n\nScout:`;

    const assistantMessage = await geminiGenerate(prompt, systemWithContext, 800);
    const readyToSearch = assistantMessage.includes("[READY_TO_SEARCH]");
    const cleanMessage = assistantMessage.replace("[READY_TO_SEARCH]", "").trim();

    return NextResponse.json({ message: cleanMessage, readyToSearch });
  } catch (error) {
    console.error("chat error:", error);
    return NextResponse.json({ error: "Chat failed. Check your GROQ_API_KEY." }, { status: 500 });
  }
}
