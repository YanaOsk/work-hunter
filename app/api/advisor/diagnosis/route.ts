export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { DIAGNOSIS_ANALYSIS_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisAnswer, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, answers, lang, freeformIntro } = (await request.json()) as {
      userProfile: UserProfile;
      answers: DiagnosisAnswer[];
      lang?: string;
      freeformIntro?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const answersStr = truncate(
      answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n"),
      2500
    );
    const introStr = freeformIntro ? truncate(freeformIntro, 800) : undefined;

    const prompt = `${langInstruction(lang)}\n\n${DIAGNOSIS_ANALYSIS_PROMPT(profileStr, answersStr, introStr)}`;
    const raw = await geminiGenerate("Analyze now.", prompt, 4000, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "diagnosis");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[diagnosis] failed:", detail);
    return NextResponse.json({ error: "Diagnosis failed.", detail }, { status: 500 });
  }
}
