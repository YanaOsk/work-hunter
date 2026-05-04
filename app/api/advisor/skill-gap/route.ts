export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { SKILL_GAP_PROMPT } from "@/lib/advisorPrompts";

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
    const prompt = SKILL_GAP_PROMPT(slimProfile, topRoles, lang ?? "he");
    const raw = await geminiGenerate(prompt);
    const parsed = safeParseJson<{ gaps: unknown }>(raw);
    if (!parsed?.gaps) throw new Error("No gaps in response");
    return NextResponse.json({ gaps: parsed.gaps });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
