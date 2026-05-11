import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sendMonitorAlertEmail } from "@/lib/email";

export const maxDuration = 45;

const TEST_PROMPT = "שלום, אני מחפש עבודה כמהנדס תוכנה בישראל עם 3 שנות ניסיון";
const MIN_RESPONSE_LENGTH = 80;
const ENGLISH_RATIO_THRESHOLD = 0.5;

function hebrewRatio(text: string): number {
  const heChars = (text.match(/[֐-׿]/g) ?? []).length;
  const totalLetters = (text.match(/[a-zA-Z֐-׿]/g) ?? []).length;
  return totalLetters === 0 ? 0 : heChars / totalLetters;
}

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issues: string[] = [];
  let responseText = "";

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/advisor/diagnosis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: TEST_PROMPT }],
        profileData: { language: "he" },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      issues.push(`advisor/diagnosis returned HTTP ${res.status}`);
    } else {
      const data = await res.json() as { content?: string; message?: string; text?: string };
      responseText = data.content ?? data.message ?? data.text ?? JSON.stringify(data);

      if (responseText.length < MIN_RESPONSE_LENGTH) {
        issues.push(`תגובה קצרה מדי: ${responseText.length} תווים (מינימום ${MIN_RESPONSE_LENGTH})`);
      }

      const ratio = hebrewRatio(responseText);
      if (ratio < ENGLISH_RATIO_THRESHOLD) {
        issues.push(`תגובה בעברית נמוכה: ${Math.round(ratio * 100)}% עברית`);
      }

      const errorKeywords = ["error", "exception", "undefined", "null", "failed"];
      for (const kw of errorKeywords) {
        if (responseText.toLowerCase().includes(kw) && responseText.length < 200) {
          issues.push(`תגובה מכילה שגיאה אפשרית: "${kw}"`);
          break;
        }
      }
    }
  } catch (e) {
    issues.push(`advisor API לא נגיש: ${e instanceof Error ? e.message.slice(0, 120) : "error"}`);
  }

  const ok = issues.length === 0;

  if (!ok) {
    sendMonitorAlertEmail([
      "בעיית איכות AI זוהתה:",
      ...issues,
      `תגובה לדוגמה: ${responseText.slice(0, 200)}`,
    ]).catch(console.error);
  }

  return NextResponse.json({ ok, issues, responseLength: responseText.length, timestamp: new Date().toISOString() });
}
