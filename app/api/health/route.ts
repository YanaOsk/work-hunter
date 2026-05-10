import { NextResponse } from "next/server";

export const maxDuration = 10;

export async function GET() {
  const checks: Record<string, string> = {};

  // Env vars
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ? "✅" : "❌ missing";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "✅" : "❌ missing";
  checks.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? "✅" : "❌ missing";
  checks.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? "✅" : "❌ missing";
  checks.GEMINI_API_KEY = process.env.GEMINI_API_KEY ? "✅" : "❌ missing";
  checks.OPENAI_API_KEY = process.env.OPENAI_API_KEY ? `✅ len=${process.env.OPENAI_API_KEY.length}` : "❌ missing";
  checks.GROQ_API_KEY = process.env.GROQ_API_KEY ? "✅" : "❌ missing";
  checks.SERPER_API_KEY = process.env.SERPER_API_KEY ? "✅" : "❌ missing (demo mode)";
  checks.DATABASE_URL = process.env.DATABASE_URL ? "✅" : "❌ missing";
  checks.NODE_ENV = process.env.NODE_ENV ?? "unknown";

  // Neon Postgres test
  try {
    const { sql } = await import("@/lib/db");
    const db = sql();
    await Promise.race([
      db`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    checks.postgres = "✅ connected";
  } catch (e: unknown) {
    checks.postgres = `❌ ${e instanceof Error ? e.message.slice(0, 120) : "failed"}`;
  }

  // OpenAI test
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("no key");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "hi" }], max_tokens: 5 }),
    });
    const json = await res.json() as Record<string, unknown>;
    checks.openai = res.ok ? "✅ working" : `❌ ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 120)}`;
  } catch (e: unknown) {
    checks.openai = `❌ ${e instanceof Error ? e.message : "failed"}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
