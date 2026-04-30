export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { LINKEDIN_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

function slimDiagnosis(d: DiagnosisResult | null): string {
  if (!d) return "Not completed.";
  return JSON.stringify({
    mbtiType: d.mbtiType,
    hollandCode: d.hollandCode,
    topRoles: d.topRoles,
    strengths: d.strengths,
    summary: truncate(d.summary ?? "", 300),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, currentLinkedin, targetRole, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      currentLinkedin: string;
      targetRole: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const linkedinStr = truncate(currentLinkedin || "", 2000);
    const roleStr = truncate(targetRole || "", 300);

    const prompt = `${langInstruction(lang)}\n\n${LINKEDIN_PROMPT(profileStr, diagnosisStr, linkedinStr, roleStr)}`;
    const raw = await geminiGenerate("Build profile now.", prompt, 2500, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "linkedin");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[linkedin] failed:", String(error));
    return NextResponse.json({ error: "LinkedIn generation failed." }, { status: 500 });
  }
}
