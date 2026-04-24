import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { saveConversation, listConversations } from "@/lib/conversations";
import type { JobResult } from "@/lib/types";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.email ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const conversations = await listConversations(userId);
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { messages, searchContext, jobs } = (await req.json()) as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    searchContext: string;
    jobs?: JobResult[];
  };
  const id = await saveConversation(userId, messages, searchContext, jobs ?? []);
  return NextResponse.json({ id }, { status: 201 });
}
