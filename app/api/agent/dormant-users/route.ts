import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sql } from "@/lib/db";

export const maxDuration = 20;

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  // Users registered 7-30 days ago with zero return visits
  const [emailDormant, googleDormant, totalNew7, totalNew30] = await Promise.all([
    db`
      SELECT u.name, u.email, u.created_at,
             COALESCE(ae.sessions, 0) AS session_count
      FROM users u
      LEFT JOIN (
        SELECT session_id, COUNT(*) AS sessions
        FROM analytics_events
        GROUP BY session_id
      ) ae ON ae.session_id = u.id
      WHERE u.created_at BETWEEN ${thirtyDaysAgo} AND ${sevenDaysAgo}
        AND COALESCE(ae.sessions, 0) <= 1
      ORDER BY u.created_at DESC
      LIMIT 20
    `,
    db`
      SELECT g.name, g.email, g.created_at
      FROM google_accounts g
      WHERE g.created_at BETWEEN ${thirtyDaysAgo} AND ${sevenDaysAgo}
      ORDER BY g.created_at DESC
      LIMIT 20
    `,
    db`SELECT COUNT(*) AS cnt FROM users WHERE created_at >= ${sevenDaysAgo}`,
    db`SELECT COUNT(*) AS cnt FROM users WHERE created_at >= ${thirtyDaysAgo}`,
  ]);

  const dormant = [
    ...emailDormant.map((r) => ({
      name: r.name,
      email: r.email,
      registeredAt: r.created_at,
      provider: "email",
      daysSinceReg: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000),
    })),
    ...googleDormant.map((r) => ({
      name: r.name,
      email: r.email,
      registeredAt: r.created_at,
      provider: "google",
      daysSinceReg: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86_400_000),
    })),
  ].sort((a, b) => a.daysSinceReg - b.daysSinceReg);

  return NextResponse.json({
    dormantCount: dormant.length,
    newLast7Days: Number(totalNew7[0]?.cnt ?? 0),
    newLast30Days: Number(totalNew30[0]?.cnt ?? 0),
    dormantUsers: dormant,
    timestamp: new Date().toISOString(),
  });
}
