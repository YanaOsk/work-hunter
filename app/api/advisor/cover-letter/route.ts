export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { COVER_LETTER_PROMPT } from "@/lib/advisorPrompts";
import { DiagnosisResult, UserProfile } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function slimDiagnosis(d: DiagnosisResult | null): string {
  if (!d) return "No diagnosis data.";
  return JSON.stringify({
    mbtiType: d.mbtiType,
    topRoles: d.topRoles,
    strengths: d.strengths?.slice(0, 5),
    summary: truncate(d.summary ?? "", 250),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, jobDescription, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      jobDescription: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify(userProfile.parsedData || {}, null, 2), 1500);
    const diagnosisStr = slimDiagnosis(diagnosis);
    const jobStr = truncate(jobDescription, 1500);

    const prompt = `${langInstruction(lang)}\n\n${COVER_LETTER_PROMPT(profileStr, diagnosisStr, jobStr, lang ?? "he")}`;
    const raw = await geminiGenerate("Write the cover letter now.", prompt, 1500, false);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "cover-letter");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[cover-letter] failed:", String(error));
    return NextResponse.json({ error: "Cover letter generation failed." }, { status: 500 });
  }
}
