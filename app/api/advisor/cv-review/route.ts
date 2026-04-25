import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate } from "@/lib/gemini";
import { CV_REVIEW_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, cvText, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      cvText: string;
      lang?: string;
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const diagnosisStr = diagnosis ? JSON.stringify(diagnosis, null, 2) : "Not completed.";

    const prompt = `${langInstruction(lang)}\n\n${CV_REVIEW_PROMPT(profileStr, diagnosisStr, cvText || "")}`;
    const raw = await geminiGenerate("Review now.", prompt, 2000, true);
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("cv-review error:", error);
    return NextResponse.json({ error: "CV review failed." }, { status: 500 });
  }
}
