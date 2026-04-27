export const maxDuration = 60;
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { runJobSearch } from "@/lib/jobSearch";
import { JobResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: { userProfile?: Record<string, unknown>; chatContext?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { userProfile, chatContext } = body;
  const profileText = JSON.stringify({
    ...(userProfile as Record<string, unknown> | undefined)?.parsedData,
    additionalContext: chatContext,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      try {
        const { demoMode } = await runJobSearch(profileText, (job: JobResult) => {
          send({ type: "job", job });
        });
        send({ type: "done", demoMode });
      } catch (err) {
        console.error("search-jobs stream error:", err);
        send({ type: "error", message: "Search failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
