import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { runJobSearch } from "@/lib/jobSearch";
import { JobResult, EntryPathResult } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!validateAgentRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { profileText?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { profileText, lang = "he" } = body;
  if (!profileText) {
    return NextResponse.json({ error: "profileText required" }, { status: 400 });
  }

  const wantsRemoteOnly =
    /"workPreference"\s*:\s*"remote"/.test(profileText) ||
    /remote בלבד|מרחוק בלבד|לא יבוא למשרד|לא תגיע למשרד|only remote|fully remote|remote only|עבודה מהבית בלבד|100% remote/i.test(profileText);

  const goodJobs: JobResult[] = [];
  const allJobs: JobResult[] = [];
  let entryPath: EntryPathResult | undefined;

  try {
    await runJobSearch(
      profileText,
      (job: JobResult) => {
        allJobs.push(job);
        if (job.matchScore < 30) return;
        if (wantsRemoteOnly && !job.isRemote) return;
        goodJobs.push(job);
      },
      lang,
      (ep: EntryPathResult) => { entryPath = ep; },
    );
  } catch (err) {
    console.error("[scout-eval] runJobSearch failed:", err);
    return NextResponse.json({ error: "Scout search failed" }, { status: 500 });
  }

  // Fallback: if nothing cleared the main bar but Serper did return something,
  // include the top-3 lowest-scoring results so Gemini can see WHAT is coming back
  // and give useful feedback (instead of a generic "0 results" review).
  const jobs =
    goodJobs.length > 0
      ? goodJobs
      : allJobs
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 3);

  return NextResponse.json({ profileText, lang, jobs, entryPath: entryPath ?? null });
}
