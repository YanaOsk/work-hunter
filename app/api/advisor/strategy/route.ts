export const maxDuration = 90;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { SEARCH_STRATEGY_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, DirectionResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

function slimDiagnosis(d: DiagnosisResult | null): string {
  if (!d) return "Not completed.";
  return JSON.stringify({
    mbtiType: d.mbtiType,
    hollandCode: d.hollandCode,
    topMessage: d.topMessage,
    topRoles: d.topRoles,
    strengths: d.strengths,
    summary: truncate(d.summary ?? "", 400),
    tomorrowStep: d.tomorrowStep,
  });
}

function slimDirection(d: DirectionResult | null): string {
  if (!d) return "Not decided.";
  return JSON.stringify({
    recommendedPath: d.recommendedPath,
    rationale: truncate(d.rationale ?? "", 300),
    options: (d.options ?? []).map((o) => ({
      path: o.path,
      title: o.title,
      fitScore: o.fitScore,
      firstSteps: o.firstSteps?.slice(0, 3),
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, direction, userNotes, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      direction: DirectionResult | null;
      userNotes: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const directionStr = slimDirection(direction);
    const notesStr = truncate(userNotes || "", 800);

    const prompt = `${langInstruction(lang)}\n\n${SEARCH_STRATEGY_PROMPT(
      profileStr,
      diagnosisStr,
      directionStr,
      notesStr
    )}`;
    const raw = await geminiGenerate("Build strategy now.", prompt, 5000, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "strategy");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[strategy] failed:", String(error));
    return NextResponse.json({ error: "Strategy failed." }, { status: 500 });
  }
}
