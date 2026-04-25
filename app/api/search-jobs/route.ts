export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { runJobSearch } from "@/lib/jobSearch";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userProfile, chatContext } = body;

    const profileText = JSON.stringify({
      ...userProfile?.parsedData,
      additionalContext: chatContext,
    });

    const { jobs, demoMode } = await runJobSearch(profileText);
    return NextResponse.json({ jobs, demoMode });
  } catch (error) {
    console.error("search-jobs error:", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
