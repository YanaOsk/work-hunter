import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sql } from "@/lib/db";
import { sendDailyReportEmail, type DailyStats } from "@/lib/email";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = new Date(todayStart.getTime() - 6 * 86_400_000);

  const todayStr = todayStart.toISOString();
  const weekAgoStr = weekAgo.toISOString();

  const [
    emailTotalRes,
    googleTotalRes,
    emailTodayRes,
    googleTodayRes,
    emailWeekRes,
    googleWeekRes,
    premiumRes,
    sessionsRes,
  ] = await Promise.all([
    db`SELECT COUNT(*) AS cnt FROM users`,
    db`SELECT COUNT(*) AS cnt FROM google_accounts`,
    db`SELECT COUNT(*) AS cnt FROM users WHERE created_at >= ${todayStr}`,
    db`SELECT COUNT(*) AS cnt FROM google_accounts WHERE created_at >= ${todayStr}`,
    db`SELECT COUNT(*) AS cnt FROM users WHERE created_at >= ${weekAgoStr}`,
    db`SELECT COUNT(*) AS cnt FROM google_accounts WHERE created_at >= ${weekAgoStr}`,
    db`SELECT COUNT(*) AS cnt FROM subscriptions WHERE expiry_date IS NULL OR expiry_date > ${now.toISOString()}`,
    db`SELECT COUNT(DISTINCT session_id) AS cnt FROM analytics_events WHERE type = 'pageview' AND timestamp >= ${todayStr}`,
  ]);

  const stats: DailyStats = {
    users: {
      total: Number(emailTotalRes[0]?.cnt ?? 0) + Number(googleTotalRes[0]?.cnt ?? 0),
      newToday: Number(emailTodayRes[0]?.cnt ?? 0) + Number(googleTodayRes[0]?.cnt ?? 0),
      newThisWeek: Number(emailWeekRes[0]?.cnt ?? 0) + Number(googleWeekRes[0]?.cnt ?? 0),
      premium: Number(premiumRes[0]?.cnt ?? 0),
    },
    analytics: {
      sessionsToday: Number(sessionsRes[0]?.cnt ?? 0),
    },
    revenue: {
      note: "Meshulam integration pending — יתווסף בקרוב",
    },
    timestamp: now.toISOString(),
  };

  const sendReport = req.nextUrl.searchParams.get("send") === "true";
  if (sendReport) {
    await sendDailyReportEmail(stats);
  }

  return NextResponse.json(stats);
}
