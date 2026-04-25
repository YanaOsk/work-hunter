export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate } from "@/lib/gemini";
import { SEARCH_STRATEGY_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, DirectionResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, direction, userNotes, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      direction: DirectionResult | null;
      userNotes: string;
      lang?: string;
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const diagnosisStr = diagnosis ? JSON.stringify(diagnosis, null, 2) : "Not completed.";
    const directionStr = direction ? JSON.stringify(direction, null, 2) : "Not decided.";

    const prompt = `${langInstruction(lang)}\n\n${SEARCH_STRATEGY_PROMPT(
      profileStr,
      diagnosisStr,
      directionStr,
      userNotes || ""
    )}`;
    const raw = await geminiGenerate("Build strategy now.", prompt, 2500, true);
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("strategy error:", error);
    return NextResponse.json({ error: "Strategy failed." }, { status: 500 });
  }
}
