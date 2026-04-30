import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserMeta, saveUserMeta } from "@/lib/userMeta";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const meta = await getUserMeta(session.user.email);
  return NextResponse.json(meta ?? {});
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowed = ["title", "location", "yearsExperience", "education", "skills", "targetRoles", "workPreference", "languages", "bio", "volunteering", "linkedin", "availability", "profileImage", "advisorCurrentStage", "advisorCompletedCount", "advisorState"] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  await saveUserMeta(session.user.email, patch);
  return NextResponse.json({ ok: true });
}
