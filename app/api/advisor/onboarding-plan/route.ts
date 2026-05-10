export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { ONBOARDING_PLAN_PROMPT } from "@/lib/advisorPrompts";
import { langInstruction } from "@/lib/langInstruction";

export async function POST(req: NextRequest) {
  try {
    const { chosenPath, topRoles, strategy, lang } = await req.json();
    const prompt = `${langInstruction(lang ?? "he")}\n\n${ONBOARDING_PLAN_PROMPT(
      chosenPath ?? "employee",
      topRoles ?? [],
      truncate(JSON.stringify(strategy ?? {}), 600),
      lang ?? "he"
    )}`;
    const raw = await geminiGenerate(prompt, undefined, 2048, true);
    const parsed = safeParseJson<{ days30: string[]; days60: string[]; days90: string[] }>(raw);
    if (!parsed || !parsed.days30) throw new Error("Failed to parse response");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
