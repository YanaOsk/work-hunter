export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { PRACTICAL_PREP_PROMPT } from "@/lib/advisorPrompts";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, role, lang } = await req.json();
    const targetRole = role || (diagnosis?.topRoles?.[0] ?? "N/A");
    const professionContext = truncate(
      JSON.stringify({
        currentRole: userProfile?.parsedData?.currentRole,
        skills: userProfile?.parsedData?.skills,
        targetRoles: diagnosis?.topRoles,
      }),
      500
    );
    const prompt = PRACTICAL_PREP_PROMPT(targetRole, professionContext, lang ?? "he");
    const raw = await geminiGenerate(prompt);
    const parsed = safeParseJson<{ format: string; whatToBring: string[]; whatToExpect: unknown[]; howToStandOut: string[] }>(raw);
    if (!parsed) throw new Error("Failed to parse response");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
