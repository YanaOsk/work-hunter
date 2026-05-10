export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { SKILL_GAP_PROMPT } from "@/lib/advisorPrompts";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(req: NextRequest) {
  try {
    const { userProfile, diagnosis, lang } = await req.json();
    const slimProfile = truncate(
      JSON.stringify({
        skills: userProfile?.parsedData?.skills,
        currentRole: userProfile?.parsedData?.currentRole,
        yearsExperience: userProfile?.parsedData?.yearsExperience,
        education: userProfile?.parsedData?.education,
      }),
      800
    );
    const topRoles = (diagnosis?.topRoles ?? []).join(", ") || "N/A";
    const prompt = `${langInstruction(lang ?? "he")}\n\n${SKILL_GAP_PROMPT(slimProfile, topRoles, lang ?? "he")}`;
    const raw = await geminiGenerate(prompt, undefined, 2048, true);
    const parsed = safeParseJson<{ gaps: unknown }>(raw);
    if (!parsed?.gaps) throw new Error("No gaps in response");
    return NextResponse.json({ gaps: parsed.gaps });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
