import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { listUserCvs, createUserCv } from "@/lib/cvs";
import type { CvData } from "@/lib/cvBuilder";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listUserCvs(userId));
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, data } = (await req.json()) as { name: string; data: CvData };
  const cv = await createUserCv(userId, name, data);
  return NextResponse.json(cv, { status: 201 });
}
