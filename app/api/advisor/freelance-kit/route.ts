export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { FREELANCE_KIT_PROMPT } from "@/lib/advisorPrompts";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userProfile, diagnosis, chosenPath, lang } = await req.json();
    const slimProfile = truncate(
      JSON.stringify({
        currentRole: userProfile?.parsedData?.currentRole,
        skills: userProfile?.parsedData?.skills,
        location: userProfile?.parsedData?.location,
        yearsExperience: userProfile?.parsedData?.yearsExperience,
      }),
      600
    );
    const topRoles = (diagnosis?.topRoles ?? []).join(", ") || "N/A";
    const prompt = FREELANCE_KIT_PROMPT(slimProfile, topRoles, chosenPath ?? "entrepreneur", lang ?? "he");
    const raw = await geminiGenerate(prompt);
    const parsed = safeParseJson<{ pricingGuidance: string[]; legalSteps: string[]; firstClientSources: string[]; monthlyGoal: string }>(raw);
    if (!parsed) throw new Error("Failed to parse response");
    return NextResponse.json({ ...parsed, completedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
