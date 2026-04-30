import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geminiGenerate } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, yearsExperience, skills, volunteering, lang } = await req.json();

  const prompt =
    lang === "he"
      ? `אתה עוזר קריירה. צור פסקה קצרה (2-3 משפטים) שמסכמת את ה-Unique Value Proposition של המועמד הבא לשימוש בשדה "על עצמי" בפרופיל. כתוב בגוף ראשון, בעברית, בטון מקצועי ואנושי.

תפקיד: ${title || "לא צוין"}
שנות ניסיון: ${yearsExperience ?? "לא צוין"}
כישורים: ${Array.isArray(skills) ? skills.join(", ") : (skills || "לא צוין")}
התנדבות: ${volunteering || "לא צוין"}

החזר רק את הטקסט, ללא כותרת או הסברים.`
      : `You are a career assistant. Write a short "About me" paragraph (2-3 sentences) that captures the candidate's Unique Value Proposition. Write in first person, professional yet human tone, in English.

Role: ${title || "not specified"}
Years of experience: ${yearsExperience ?? "not specified"}
Skills: ${Array.isArray(skills) ? skills.join(", ") : (skills || "not specified")}
Volunteering: ${volunteering || "not specified"}

Return only the text, no headings or explanations.`;

  try {
    const uvp = (await geminiGenerate(prompt, undefined, 200)).trim();
    return NextResponse.json({ uvp });
  } catch (err) {
    console.error("[generate-uvp]", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
