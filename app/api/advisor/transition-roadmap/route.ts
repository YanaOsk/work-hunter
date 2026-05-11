export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson } from "@/lib/gemini";
import { TRANSITION_ROADMAP_PROMPT } from "@/lib/advisorPrompts";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, chosenPath, lang } = await req.json();
    const p = userProfile?.parsedData ?? {};
    const prompt = TRANSITION_ROADMAP_PROMPT(
      p.currentRole ?? "",
      diagnosis?.topRoles ?? [],
      chosenPath ?? "employee",
      p.skills ?? [],
      lang ?? "he"
    );
    const raw = await geminiGenerate(prompt);
    const parsed = safeParseJson<{ totalDuration: string; phases: unknown[]; honestNote: string }>(raw);
    if (!parsed) throw new Error("Failed to parse response");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
