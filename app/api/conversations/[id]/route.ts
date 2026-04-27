export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getConversation, deleteConversation, updateConversation, generateConversationTitle } from "@/lib/conversations";
import type { ConversationMessage } from "@/lib/conversations";
import type { JobResult } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const conv = await getConversation(session.user.email, id);
  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(conv);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as {
    messages?: ConversationMessage[];
    jobs?: JobResult[];
    searchContext?: string;
    title?: string;
  };

  // Title-only rename — don't touch messages or generate a new title
  if (body.title !== undefined && !body.messages && !body.jobs) {
    await updateConversation(session.user.email, id, [], [], undefined, body.title);
    return NextResponse.json({ ok: true });
  }

  const msgList = body.messages ?? [];
  const jobsList = body.jobs ?? [];

  let title: string | undefined;
  if (jobsList.length > 0 || msgList.length >= 4) {
    title = await generateConversationTitle(msgList, jobsList, body.searchContext ?? "");
  }

  await updateConversation(session.user.email, id, msgList, jobsList, body.searchContext, title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await deleteConversation(session.user.email, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
