import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Per-user window counters — in-memory, per serverless instance.
// Good enough for basic abuse protection at launch.
const counters = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  windowMs?: number;  // default 60 000 (1 min)
  maxRequests?: number; // default 20
}

export async function checkRateLimit(
  req: NextRequest,
  opts: RateLimitOptions = {},
): Promise<NextResponse | null> {
  const { windowMs = 60_000, maxRequests = 20 } = opts;

  const session = await getServerSession(authOptions);
  const key = session?.user?.email ?? req.headers.get("x-forwarded-for") ?? "anon";

  const now = Date.now();
  const entry = counters.get(key);

  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return null; // ok
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "יותר מדי בקשות — נסה שוב בעוד דקה" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }
  return null; // ok
}
