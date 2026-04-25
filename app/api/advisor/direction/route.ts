export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate } from "@/lib/gemini";
import { DIRECTION_ANALYSIS_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, userGoal, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      userGoal: string;
      lang?: string;
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const diagnosisStr = diagnosis
      ? JSON.stringify(diagnosis, null, 2)
      : "Not completed yet.";

    const prompt = `${langInstruction(lang)}\n\n${DIRECTION_ANALYSIS_PROMPT(
      profileStr,
      diagnosisStr,
      userGoal || "The user did not provide additional context. Analyze based on profile and diagnosis alone."
    )}`;
    const raw = await geminiGenerate("Analyze now.", prompt, 2500, true);

    const parsed = JSON.parse(raw);
    return NextResponse.json({
      ...parsed,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("direction error:", error);
    return NextResponse.json({ error: "Direction analysis failed." }, { status: 500 });
  }
}
