import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate } from "@/lib/gemini";
import { LINKEDIN_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, diagnosis, currentLinkedin, targetRole, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      currentLinkedin: string;
      targetRole: string;
      lang?: string;
    };

    const profileStr = JSON.stringify(userProfile.parsedData || {}, null, 2);
    const diagnosisStr = diagnosis ? JSON.stringify(diagnosis, null, 2) : "Not completed.";

    const prompt = `${langInstruction(lang)}\n\n${LINKEDIN_PROMPT(
      profileStr,
      diagnosisStr,
      currentLinkedin || "",
      targetRole || ""
    )}`;
    const raw = await geminiGenerate("Build profile now.", prompt, 2000, true);
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("linkedin error:", error);
    return NextResponse.json({ error: "LinkedIn generation failed." }, { status: 500 });
  }
}
