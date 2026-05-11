import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sendMonitorAlertEmail } from "@/lib/email";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Record<string, string> = {};
  const issues: string[] = [];

  // Postgres
  try {
    const { sql } = await import("@/lib/db");
    const db = sql();
    await Promise.race([
      db`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    checks.postgres = "ok";
  } catch (e) {
    checks.postgres = `failed: ${e instanceof Error ? e.message.slice(0, 80) : "error"}`;
    issues.push(`PostgreSQL: ${checks.postgres}`);
  }

  // OpenAI
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("missing OPENAI_API_KEY");
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    checks.openai = res.ok ? "ok" : `HTTP ${res.status}`;
    if (!res.ok) issues.push(`OpenAI: HTTP ${res.status}`);
  } catch (e) {
    checks.openai = `failed: ${e instanceof Error ? e.message.slice(0, 80) : "error"}`;
    issues.push(`OpenAI: ${checks.openai}`);
  }

  // Groq
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("missing GROQ_API_KEY");
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    checks.groq = res.ok ? "ok" : `HTTP ${res.status}`;
    if (!res.ok) issues.push(`Groq: HTTP ${res.status}`);
  } catch (e) {
    checks.groq = `failed: ${e instanceof Error ? e.message.slice(0, 80) : "error"}`;
    issues.push(`Groq: ${checks.groq}`);
  }

  // Serper
  try {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      checks.serper = "no key (demo mode)";
    } else {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q: "test", num: 1 }),
        signal: AbortSignal.timeout(8000),
      });
      checks.serper = res.ok ? "ok" : `HTTP ${res.status}`;
      if (!res.ok) issues.push(`Serper: HTTP ${res.status}`);
    }
  } catch (e) {
    checks.serper = `failed: ${e instanceof Error ? e.message.slice(0, 80) : "error"}`;
    issues.push(`Serper: ${checks.serper}`);
  }

  const ok = issues.length === 0;

  if (!ok) {
    sendMonitorAlertEmail(issues).catch(console.error);
  }

  return NextResponse.json({ ok, issues, checks, timestamp: new Date().toISOString() });
}
