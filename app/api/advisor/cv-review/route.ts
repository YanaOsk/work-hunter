export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { CV_REVIEW_PROMPT } from "@/lib/advisorPrompts";
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
    const { userProfile, diagnosis, cvText, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      cvText: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const cvStr = truncate(cvText || "", 3000);

    const prompt = `${langInstruction(lang)}\n\n${CV_REVIEW_PROMPT(profileStr, diagnosisStr, cvStr)}`;
    const raw = await geminiGenerate("Review now.", prompt, 2800, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "cv-review");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[cv-review] failed:", String(error));
    return NextResponse.json({ error: "CV review failed." }, { status: 500 });
  }
}
