export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { SEARCH_STRATEGY_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, DirectionResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

function slimDirection(d: DirectionResult | null, path: string | null): string {
  if (!d) return "Not completed.";
  const chosen = d.options?.find((o) => o.path === path);
  return JSON.stringify({
    recommendedPath: d.recommendedPath,
    chosenPath: path,
    rationale: truncate(d.rationale ?? "", 300),
    chosenSummary: chosen ? truncate(chosen.summary, 200) : undefined,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, direction, chosenPath, userNotes, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      direction: DirectionResult | null;
      chosenPath: string | null;
      userNotes?: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const directionStr = slimDirection(direction, chosenPath);

    const prompt = `${langInstruction(lang)}\n\n${SEARCH_STRATEGY_PROMPT(profileStr, diagnosisStr, directionStr, userNotes ?? "")}`;
    const raw = await geminiGenerate("Build strategy now.", prompt, 3000, false);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "strategy");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[strategy] failed:", String(error));
    return NextResponse.json({ error: "Strategy generation failed." }, { status: 500 });
  }
}
