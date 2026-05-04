export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { CV_REVIEW_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, DirectionResult, LifePath, UserProfile } from "@/lib/types";
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
    const { userProfile, diagnosis, cvText, lang, direction, chosenPath } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      cvText: string;
      lang?: string;
      direction?: DirectionResult | null;
      chosenPath?: LifePath | null;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const cvStr = truncate(cvText || "", 3000);

    let directionContext: string | undefined;
    if (direction && chosenPath) {
      const chosen = direction.options?.find((o) => o.path === chosenPath);
      if (chosen) {
        directionContext = `Chosen path: ${chosenPath} — ${chosen.title}. ${chosen.summary} Rationale: ${direction.rationale}`;
      }
    }

    const prompt = `${langInstruction(lang)}\n\n${CV_REVIEW_PROMPT(profileStr, diagnosisStr, cvStr, directionContext)}`;
    const raw = await geminiGenerate("Review now.", prompt, 2800, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "cv-review");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[cv-review] failed:", String(error));
    return NextResponse.json({ error: "CV review failed." }, { status: 500 });
  }
}
