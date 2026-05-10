export const maxDuration = 60;
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { runJobSearch } from "@/lib/jobSearch";
import { JobResult, EntryPathResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: { userProfile?: { parsedData?: Record<string, unknown> }; chatContext?: string; lang?: string; cvUsage?: "cv" | "text" | "both" };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { userProfile, chatContext, lang = "he", cvUsage } = body;

  let profileText: string;
  if (cvUsage === "text") {
    // User wants to ignore their CV — search only by what they said in the conversation
    profileText = JSON.stringify({ additionalContext: chatContext });
  } else if (cvUsage === "cv") {
    // User wants CV-only search — ignore conversational context
    profileText = JSON.stringify({ ...(userProfile?.parsedData ?? {}) });
  } else {
    // "both" or not set — merge CV data with conversation (default)
    profileText = JSON.stringify({
      ...(userProfile?.parsedData ?? {}),
      additionalContext: chatContext,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      try {
        const wantsRemoteOnly =
          profileText.includes('"workPreference":"remote"') ||
          /"workPreference"\s*:\s*"remote"/.test(profileText) ||
          /מרחוק מלא|עבודה מהבית בלבד|remote only|fully remote|רוצה לעבוד מהבית|"remote"|מרחוק/i.test(profileText);

        const { demoMode } = await runJobSearch(
          profileText,
          (job: JobResult) => {
            if (job.matchScore < 38) return;
            // Hard filter: never send onsite jobs to remote-only candidates
            if (wantsRemoteOnly && !job.isRemote) return;
            send({ type: "job", job });
          },
          lang,
          (entryPath: EntryPathResult) => { send({ type: "entryPath", data: entryPath }); },
        );
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
