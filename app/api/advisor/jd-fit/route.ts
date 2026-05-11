export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, safeParseJson, truncate } from "@/lib/gemini";
import { JD_FIT_PROMPT } from "@/lib/advisorPrompts";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { jobDescription, userProfile, diagnosis, lang } = await req.json();
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description required" }, { status: 400 });
    }
    const slimProfile = truncate(
      JSON.stringify({
        skills: userProfile?.parsedData?.skills,
        currentRole: userProfile?.parsedData?.currentRole,
        yearsExperience: userProfile?.parsedData?.yearsExperience,
        education: userProfile?.parsedData?.education,
      }),
      600
    );
    const prompt = JD_FIT_PROMPT(
      truncate(jobDescription, 2000),
      slimProfile,
      diagnosis?.topRoles ?? [],
      lang ?? "he"
    );
    const raw = await geminiGenerate(prompt);
    const parsed = safeParseJson<{ score: number; matchPoints: string[]; gapPoints: string[]; tips: string[] }>(raw);
    if (!parsed) throw new Error("Failed to parse response");
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
