export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { DIRECTION_ANALYSIS_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

function slimDiagnosis(d: DiagnosisResult | null): string {
  if (!d) return "Not completed yet.";
  return JSON.stringify({
    mbtiType: d.mbtiType,
    hollandCode: d.hollandCode,
    topMessage: d.topMessage,
    topRoles: d.topRoles,
    strengths: d.strengths,
    summary: truncate(d.summary ?? "", 400),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, userGoal, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      userGoal: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const goalStr = truncate(
      userGoal || "The user did not provide additional context. Analyze based on profile and diagnosis alone.",
      600
    );

    const prompt = `${langInstruction(lang)}\n\n${DIRECTION_ANALYSIS_PROMPT(profileStr, diagnosisStr, goalStr)}`;
    const raw = await geminiGenerate("Analyze now.", prompt, 2800, false);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "direction");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[direction] failed:", String(error));
    return NextResponse.json({ error: "Direction analysis failed." }, { status: 500 });
  }
}
