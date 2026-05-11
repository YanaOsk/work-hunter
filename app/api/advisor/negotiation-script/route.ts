export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze as geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { NEGOTIATION_PROMPT } from "@/lib/advisorPrompts";
import { UserProfile, DiagnosisResult } from "@/lib/types";
import { langInstruction } from "@/lib/langInstruction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, jobTitle, company, lang } = (await request.json()) as {
      userProfile: UserProfile;
      diagnosis: DiagnosisResult | null;
      jobTitle: string;
      company: string;
      lang?: string;
    };

    const profileStr = truncate(JSON.stringify({
      ...userProfile.parsedData,
      topRoles: diagnosis?.topRoles,
      strengths: diagnosis?.strengths?.slice(0, 5),
    }, null, 2), 1200);

    const prompt = `${langInstruction(lang)}\n\n${NEGOTIATION_PROMPT(profileStr, jobTitle, company, lang ?? "he")}`;
    const raw = await geminiGenerate("Write the negotiation script now.", prompt, 1200, false);

    const parsed = safeParseJson<Record<string, unknown>>(raw, "negotiation-script");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[negotiation-script] failed:", String(error));
    return NextResponse.json({ error: "Negotiation script generation failed." }, { status: 500 });
  }
}
