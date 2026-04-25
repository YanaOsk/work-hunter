import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics";

interface GeoData {
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
}

// In-process cache: IP → geo, TTL 10 min
const geoCache = new Map<string, { data: GeoData; ts: number }>();

async function getGeo(ip: string): Promise<GeoData> {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: "Local", countryCode: "XX", city: "Dev", regionName: "Dev" };
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < 10 * 60_000) return cached.data;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) return {};
    const data: GeoData = await res.json();
    geoCache.set(ip, { data, ts: Date.now() });
    // Prevent unbounded growth
    if (geoCache.size > 2000) {
      const oldest = geoCache.keys().next().value;
      if (oldest) geoCache.delete(oldest);
    }
    return data;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, path, event, label, sessionId, referrer, isNewSession } = body;

    if (!type || !path || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const geo = await getGeo(ip);

    await recordEvent({
      type,
      path,
      event,
      label,
      sessionId,
      country: geo.country,
      countryCode: geo.countryCode,
      region: geo.regionName,
      city: geo.city,
      referrer: referrer || undefined,
      timestamp: new Date().toISOString(),
      isNewSession,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
