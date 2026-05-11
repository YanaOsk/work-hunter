import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sendMonitorAlertEmail } from "@/lib/email";

export const maxDuration = 20;

const TEST_QUERIES = [
  { q: "מפתח Full Stack תל אביב", expectIsrael: true },
  { q: "מנהל שיווק דיגיטלי ישראל", expectIsrael: true },
];

interface SerperResult {
  organic?: { title: string; link: string; snippet: string }[];
  error?: string;
}

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, issues: ["SERPER_API_KEY חסר"], results: [] });
  }

  const issues: string[] = [];
  const results = [];

  for (const test of TEST_QUERIES) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: test.q, gl: "il", hl: "iw", num: 5 }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        issues.push(`Serper HTTP ${res.status} עבור: "${test.q}"`);
        results.push({ query: test.q, ok: false, resultCount: 0 });
        continue;
      }

      const data = (await res.json()) as SerperResult;
      const organic = data.organic ?? [];
      const resultCount = organic.length;

      if (resultCount === 0) {
        issues.push(`אפס תוצאות עבור: "${test.q}"`);
      }

      results.push({
        query: test.q,
        ok: resultCount > 0,
        resultCount,
        sample: organic[0]?.title ?? null,
      });
    } catch (e) {
      issues.push(`Serper timeout/error עבור: "${test.q}" — ${e instanceof Error ? e.message : "error"}`);
      results.push({ query: test.q, ok: false, resultCount: 0 });
    }
  }

  const ok = issues.length === 0;
  if (!ok) {
    sendMonitorAlertEmail(["בעיית Serper API:", ...issues]).catch(console.error);
  }

  return NextResponse.json({ ok, issues, results, timestamp: new Date().toISOString() });
}
