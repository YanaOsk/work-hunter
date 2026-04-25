export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate } from "@/lib/gemini";
import { MOCK_INTERVIEW_FEEDBACK_PROMPT } from "@/lib/advisorPrompts";
import { ChatMessage, UserProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, role, messages } = (await request.json()) as {
      userProfile: UserProfile;
      role: string;
      messages: ChatMessage[];
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n\n");

    const prompt = MOCK_INTERVIEW_FEEDBACK_PROMPT(profileStr, role || "", transcript);
    const feedback = await geminiGenerate("Write feedback now.", prompt, 1500);
    return NextResponse.json({ feedback, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("feedback error:", error);
    return NextResponse.json({ error: "Feedback failed." }, { status: 500 });
  }
}
