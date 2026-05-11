export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson } from "@/lib/gemini";
import { SALARY_RESEARCH_PROMPT } from "@/lib/advisorPrompts";
import { langInstruction } from "@/lib/langInstruction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, lang } = await req.json();
    const p = userProfile?.parsedData ?? {};
    const prompt = `${langInstruction(lang ?? "he")}\n\n${SALARY_RESEARCH_PROMPT(
      diagnosis?.topRoles ?? [],
      p.currentRole ?? "",
      p.yearsExperience ?? 0,
      p.education ?? "",
      p.location ?? "Israel",
      lang ?? "he"
    )}`;
    const raw = await geminiGenerate(prompt, undefined, 2048, true);
    const parsed = safeParseJson<{ ranges: unknown[]; marketInsight: string; negotiationTip: string }>(raw);
    if (!parsed) throw new Error("Failed to parse response");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
