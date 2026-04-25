export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { MOCK_INTERVIEW_SYSTEM_PROMPT } from "@/lib/advisorPrompts";
import { ChatMessage, DirectionResult, LifePath, UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, role, messages, chosenPath, direction } = (await request.json()) as {
      userProfile: UserProfile;
      role: string;
      messages: ChatMessage[];
      chosenPath: LifePath | null;
      direction: DirectionResult | null;
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const chosen = chosenPath ?? "employee";
    const chosenOption = direction?.options?.find((o) => o.path === chosen);
    const directionSummary = chosenOption
      ? `${chosenOption.title}: ${chosenOption.summary}`
      : "N/A";

    const system = MOCK_INTERVIEW_SYSTEM_PROMPT(profileStr, role || "", chosen, directionSummary);

    const history = messages
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n\n");
    const prompt =
      messages.length === 0
        ? "Begin the interview with your first question."
        : `${history}\n\nInterviewer:`;

    const reply = await geminiGenerate(prompt, system, 1200);
    const finished = reply.includes("[INTERVIEW_COMPLETE]");
    const cleanReply = reply.replace("[INTERVIEW_COMPLETE]", "").trim();
    return NextResponse.json({ message: cleanReply, finished });
  } catch (error) {
    console.error("mock-interview error:", error);
    return NextResponse.json({ error: "Interview failed." }, { status: 500 });
  }
}
