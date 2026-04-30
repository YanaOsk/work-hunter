export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { DIAGNOSIS_ANALYSIS_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisAnswer, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, answers, lang } = (await request.json()) as {
      userProfile: UserProfile;
      answers: DiagnosisAnswer[];
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const answersStr = truncate(
      answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n"),
      2000
    );

    const prompt = `${langInstruction(lang)}\n\n${DIAGNOSIS_ANALYSIS_PROMPT(profileStr, answersStr)}`;
    const raw = await geminiGenerate("Analyze now.", prompt, 2800, true);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "diagnosis");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[diagnosis] failed:", String(error));
    return NextResponse.json({ error: "Diagnosis failed." }, { status: 500 });
  }
}
