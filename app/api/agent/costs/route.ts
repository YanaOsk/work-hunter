import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sql } from "@/lib/db";

export const maxDuration = 30;

// Rough token estimates per operation (input + output combined)
const TOKEN_ESTIMATES = {
  advisor_chat: 2_500,
  scout_search: 3_000,
  cv_parse: 1_500,
  cv_improve: 2_000,
  cover_letter: 2_500,
  diagnosis: 3_000,
};

// OpenAI pricing per 1K tokens (gpt-4o-mini)
const OPENAI_PRICE_PER_1K = 0.00015;
// Serper pricing: $50 / 50K searches
const SERPER_PRICE_PER_SEARCH = 0.001;

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [
    convWeekRes, convMonthRes,
    advisorEventsWeekRes, advisorEventsMonthRes,
    scoutEventsWeekRes, scoutEventsMonthRes,
    cvEventsWeekRes,
  ] = await Promise.all([
    db`SELECT COUNT(*) AS cnt FROM conversations WHERE created_at >= ${weekAgo}`,
    db`SELECT COUNT(*) AS cnt FROM conversations WHERE created_at >= ${monthAgo}`,
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type='event' AND event LIKE '%advisor%' AND timestamp >= ${weekAgo}`,
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type='event' AND event LIKE '%advisor%' AND timestamp >= ${monthAgo}`,
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type='event' AND (event LIKE '%scout%' OR event LIKE '%search%') AND timestamp >= ${weekAgo}`,
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type='event' AND (event LIKE '%scout%' OR event LIKE '%search%') AND timestamp >= ${monthAgo}`,
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type='event' AND event LIKE '%cv%' AND timestamp >= ${weekAgo}`,
  ]);

  const convWeek = Number(convWeekRes[0]?.cnt ?? 0);
  const convMonth = Number(convMonthRes[0]?.cnt ?? 0);
  const advisorWeek = Number(advisorEventsWeekRes[0]?.cnt ?? 0);
  const advisorMonth = Number(advisorEventsMonthRes[0]?.cnt ?? 0);
  const scoutWeek = Number(scoutEventsWeekRes[0]?.cnt ?? 0);
  const scoutMonth = Number(scoutEventsMonthRes[0]?.cnt ?? 0);
  const cvWeek = Number(cvEventsWeekRes[0]?.cnt ?? 0);

  const tokensWeek =
    convWeek * TOKEN_ESTIMATES.scout_search +
    advisorWeek * TOKEN_ESTIMATES.advisor_chat +
    cvWeek * TOKEN_ESTIMATES.cv_parse;

  const tokensMonth =
    convMonth * TOKEN_ESTIMATES.scout_search +
    advisorMonth * TOKEN_ESTIMATES.advisor_chat;

  const costWeekUSD = (tokensWeek / 1000) * OPENAI_PRICE_PER_1K + scoutWeek * SERPER_PRICE_PER_SEARCH;
  const costMonthUSD = (tokensMonth / 1000) * OPENAI_PRICE_PER_1K + scoutMonth * SERPER_PRICE_PER_SEARCH;
  const costMonthILS = costMonthUSD * 3.7;

  return NextResponse.json({
    week: {
      conversations: convWeek,
      advisorCalls: advisorWeek,
      scoutSearches: scoutWeek,
      cvOperations: cvWeek,
      estimatedTokens: tokensWeek,
      estimatedCostUSD: +costWeekUSD.toFixed(3),
    },
    month: {
      conversations: convMonth,
      advisorCalls: advisorMonth,
      scoutSearches: scoutMonth,
      estimatedTokens: tokensMonth,
      estimatedCostUSD: +costMonthUSD.toFixed(2),
      estimatedCostILS: +costMonthILS.toFixed(2),
    },
    note: "הערכה גסה — מבוסס על ממוצע של 2,500 טוקן לשיחה ו-$0.001 לחיפוש Serper",
    timestamp: new Date().toISOString(),
  });
}
