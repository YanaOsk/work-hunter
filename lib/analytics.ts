import { sql } from "./db";

export interface AnalyticsEvent {
  type: "pageview" | "event";
  path: string;
  event?: string;
  label?: string;
  sessionId: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  referrer?: string;
  timestamp: string;
  isNewSession?: boolean;
}

export async function recordEvent(event: AnalyticsEvent) {
  const db = sql();
  await db`
    INSERT INTO analytics_events
      (type, path, event, label, session_id, country, country_code, region, city, referrer, timestamp, is_new_session)
    VALUES (
      ${event.type}, ${event.path}, ${event.event ?? null}, ${event.label ?? null},
      ${event.sessionId}, ${event.country ?? null}, ${event.countryCode ?? null},
      ${event.region ?? null}, ${event.city ?? null}, ${event.referrer ?? null},
      ${event.timestamp}, ${event.isNewSession ?? null}
    )
  `;
}

export async function getAnalyticsSummary() {
  const db = sql();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 6 * 86_400_000);
  const todayStr = today.toISOString();
  const weekAgoStr = weekAgo.toISOString();

  const [
    totalPageviewsRes,
    allSessionsRes,
    todaySessionsRes,
    weekSessionsRes,
    topPagesRes,
    topCountriesRes,
    israelCitiesRes,
    topEventsRes,
    dailyStatsRes,
    topReferrersRes,
  ] = await Promise.all([
    db`SELECT COUNT(*) AS cnt FROM analytics_events WHERE type = 'pageview'`,

    db`SELECT COUNT(DISTINCT session_id) AS cnt FROM analytics_events`,

    db`SELECT COUNT(DISTINCT session_id) AS cnt FROM analytics_events WHERE type = 'pageview' AND timestamp >= ${todayStr}`,

    db`SELECT COUNT(DISTINCT session_id) AS cnt FROM analytics_events WHERE type = 'pageview' AND timestamp >= ${weekAgoStr}`,

    db`
      SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
      FROM analytics_events WHERE type = 'pageview'
      GROUP BY path ORDER BY views DESC LIMIT 12
    `,

    db`
      SELECT country, country_code AS "countryCode", COUNT(DISTINCT session_id) AS visitors
      FROM analytics_events
      WHERE type = 'pageview' AND country IS NOT NULL AND country != '' AND country != 'Local'
      GROUP BY country, country_code ORDER BY visitors DESC LIMIT 15
    `,

    db`
      SELECT city, COUNT(DISTINCT session_id) AS visitors
      FROM analytics_events
      WHERE type = 'pageview' AND country_code = 'IL' AND city IS NOT NULL AND city != ''
      GROUP BY city ORDER BY visitors DESC LIMIT 12
    `,

    db`
      SELECT event, label, COUNT(*) AS count
      FROM analytics_events WHERE type = 'event'
      GROUP BY event, label ORDER BY count DESC LIMIT 20
    `,

    db`
      SELECT LEFT(timestamp, 10) AS date, COUNT(DISTINCT session_id) AS visitors, COUNT(*) AS views
      FROM analytics_events
      WHERE type = 'pageview' AND timestamp >= ${weekAgoStr}
      GROUP BY LEFT(timestamp, 10) ORDER BY date ASC
    `,

    db`
      SELECT referrer AS "_id", COUNT(*) AS count
      FROM analytics_events
      WHERE type = 'pageview' AND referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer ORDER BY count DESC LIMIT 8
    `,
  ]);

  return {
    totalPageviews: Number(totalPageviewsRes[0]?.cnt ?? 0),
    totalSessions: Number(allSessionsRes[0]?.cnt ?? 0),
    todaySessions: Number(todaySessionsRes[0]?.cnt ?? 0),
    weekSessions: Number(weekSessionsRes[0]?.cnt ?? 0),
    topPages: topPagesRes,
    topCountries: topCountriesRes,
    israelCities: israelCitiesRes,
    topEvents: topEventsRes,
    dailyStats: dailyStatsRes,
    topReferrers: topReferrersRes,
  };
}
