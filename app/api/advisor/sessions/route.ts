import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAdvisorSession, getAdvisorChatLog } from "@/lib/advisorSessions";
import { sql } from "@/lib/db";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const mode = searchParams.get("mode") ?? "session"; // "session" | "log" | "list"

  try {
    if (mode === "list") {
      // List all users who have advisor sessions
      const db = sql();
      const rows = await db`
        SELECT user_email, updated_at, stage
        FROM advisor_sessions
        ORDER BY updated_at DESC
        LIMIT 50
      `;
      return NextResponse.json({ sessions: rows });
    }

    if (!email) {
      return NextResponse.json({ error: "email param required" }, { status: 400 });
    }

    if (mode === "log") {
      const log = await getAdvisorChatLog(email, 100);
      return NextResponse.json({ log });
    }

    // Default: full session state
    const advisorSession = await getAdvisorSession(email);
    if (!advisorSession) {
      return NextResponse.json({ error: "No session found for this email" }, { status: 404 });
    }
    return NextResponse.json({ session: advisorSession });
  } catch (error) {
    console.error("advisor sessions fetch error:", error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
