export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { saveConversation, listConversations, generateConversationTitle } from "@/lib/conversations";
import type { ConversationMessage } from "@/lib/conversations";
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

  const { messages, searchContext, jobs, skipTitle } = (await req.json()) as {
    messages: ConversationMessage[];
    searchContext?: string;
    jobs?: JobResult[];
    skipTitle?: boolean;
  };

  const jobsList = jobs ?? [];
  const title = skipTitle
    ? "שיחה עם Scout"
    : await generateConversationTitle(messages, jobsList, searchContext ?? "");
  const id = await saveConversation(userId, messages, searchContext ?? "", jobsList, title);
  return NextResponse.json({ id }, { status: 201 });
}
