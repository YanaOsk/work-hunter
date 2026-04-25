import { NextRequest, NextResponse } from "next/server";
import { geminiAnalyze } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { summary, name, title, lang } = (await req.json()) as {
    summary: string;
    name?: string;
    title?: string;
    lang: "he" | "en";
  };

  if (!summary?.trim()) {
    return NextResponse.json({ error: "No summary provided" }, { status: 400 });
  }

  const prompt =
    lang === "he"
      ? `אתה מומחה לכתיבת קורות חיים בעברית. שפר את הסיכום המקצועי הבא כך שיהיה חזק, ממוקד ומושך למגייסים. שמור על 2-4 משפטים. החזר רק את הטקסט המשופר, ללא הסברים.

שם: ${name || ""}
תפקיד: ${title || ""}
סיכום נוכחי:
${summary}`
      : `You are a professional CV writer. Improve the following professional summary to be strong, focused, and attractive to recruiters. Keep it 2-4 sentences. Return only the improved text, no explanations.

Name: ${name || ""}
Title: ${title || ""}
Current summary:
${summary}`;

  try {
    const improved = (await geminiAnalyze(prompt, undefined, 300)).trim();
    return NextResponse.json({ improved });
  } catch (err) {
    console.error("[improve-summary]", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
