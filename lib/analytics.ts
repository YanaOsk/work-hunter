import { getDb } from "./mongodb";

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

async function col() {
  const db = await getDb();
  return db.collection<AnalyticsEvent>("analytics");
}

export async function recordEvent(event: AnalyticsEvent) {
  const c = await col();
  await c.insertOne(event);
}

export async function getAnalyticsSummary() {
  const c = await col();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 6 * 86_400_000);

  const [
    totalPageviews,
    allSessions,
    todaySessions,
    weekSessions,
    topPages,
    topCountries,
    israelCities,
    topEvents,
    dailyStats,
    topReferrers,
  ] = await Promise.all([
    c.countDocuments({ type: "pageview" }),
    c.distinct("sessionId"),
    c.distinct("sessionId", { type: "pageview", timestamp: { $gte: today.toISOString() } }),
    c.distinct("sessionId", { type: "pageview", timestamp: { $gte: weekAgo.toISOString() } }),

    c.aggregate([
      { $match: { type: "pageview" } },
      { $group: { _id: "$path", views: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
      { $project: { path: "$_id", views: 1, visitors: { $size: "$sessions" } } },
      { $sort: { views: -1 } },
      { $limit: 12 },
    ]).toArray(),

    c.aggregate([
      { $match: { type: "pageview", country: { $exists: true, $nin: [null, "", "Local"] } } },
      { $group: { _id: "$country", countryCode: { $first: "$countryCode" }, sessions: { $addToSet: "$sessionId" } } },
      { $project: { country: "$_id", countryCode: 1, visitors: { $size: "$sessions" } } },
      { $sort: { visitors: -1 } },
      { $limit: 15 },
    ]).toArray(),

    c.aggregate([
      { $match: { type: "pageview", countryCode: "IL", city: { $exists: true, $nin: [null, ""] } } },
      { $group: { _id: "$city", sessions: { $addToSet: "$sessionId" } } },
      { $project: { city: "$_id", visitors: { $size: "$sessions" } } },
      { $sort: { visitors: -1 } },
      { $limit: 12 },
    ]).toArray(),

    c.aggregate([
      { $match: { type: "event" } },
      { $group: { _id: { event: "$event", label: "$label" }, count: { $sum: 1 } } },
      { $project: { event: "$_id.event", label: "$_id.label", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]).toArray(),

    c.aggregate([
      { $match: { type: "pageview", timestamp: { $gte: weekAgo.toISOString() } } },
      { $group: {
        _id: { $substr: ["$timestamp", 0, 10] },
        sessions: { $addToSet: "$sessionId" },
        views: { $sum: 1 },
      }},
      { $project: { date: "$_id", visitors: { $size: "$sessions" }, views: 1 } },
      { $sort: { date: 1 } },
    ]).toArray(),

    c.aggregate([
      { $match: { type: "pageview", referrer: { $exists: true, $nin: [null, ""] } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]).toArray(),
  ]);

  return {
    totalPageviews,
    totalSessions: allSessions.length,
    todaySessions: todaySessions.length,
    weekSessions: weekSessions.length,
    topPages,
    topCountries,
    israelCities,
    topEvents,
    dailyStats,
    topReferrers,
  };
}
