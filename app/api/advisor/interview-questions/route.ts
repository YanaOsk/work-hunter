export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { INTERVIEW_QUESTIONS_PROMPT } from "@/lib/advisorPrompts";
import { UserProfile, DiagnosisResult } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, role, chosenPath, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      role: string;
      chosenPath?: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify({
      currentRole: userProfile.parsedData?.currentRole,
      yearsExperience: userProfile.parsedData?.yearsExperience,
      skills: userProfile.parsedData?.skills?.slice(0, 8),
      topRoles: diagnosis?.topRoles,
      strengths: diagnosis?.strengths?.slice(0, 4),
    }, null, 2), 800);

    const prompt = `${langInstruction(lang)}\n\n${INTERVIEW_QUESTIONS_PROMPT(profileStr, role, chosenPath ?? "employee", lang ?? "he")}`;
    const raw = await geminiGenerate("Generate the interview questions now.", prompt, 1000, false);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "interview-questions");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[interview-questions] failed:", String(error));
    return NextResponse.json({ error: "Question generation failed." }, { status: 500 });
  }
}
