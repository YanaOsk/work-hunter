export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, extractPdfTextWithVision } from "@/lib/gemini";
import { CV_UPGRADE_PROMPT } from "@/lib/prompts";

function isUsableText(text: string): boolean {
  if (!text || text.trim().length < 60) return false;
  const readableChars = text.replace(/[^a-zA-Z֐-׿]/g, "").length;
  return readableChars > 40;
}

async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text ?? "";
}

function containsHebrew(text: string): boolean {
  return /[א-ת]/.test(text);
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let parsedText = "";
  try {
    parsedText = await extractWithPdfParse(buffer);
  } catch { /* ignore */ }

  // Non-Hebrew text that parsed fine — use it directly
  if (isUsableText(parsedText) && !containsHebrew(parsedText)) return parsedText;

  // Hebrew or unreadable — try OpenAI Vision if key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      return await extractPdfTextWithVision(buffer);
    } catch { /* fall through */ }
  }

  // Fallback: use whatever pdf-parse returned (may be imperfect for Hebrew)
  if (isUsableText(parsedText)) return parsedText;
  return "";
}

export interface CvUpgradeResult {
  profile: {
    currentRole: string;
    yearsExperience: string;
    education: string;
    topSkills: string[];
  };
  weaknesses: string[];
  upgrades: { section: string; before: string; after: string }[];
  strategicTips: string[];
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let cvText = "";
    const lang = "he";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;
      const langField = formData.get("lang") as string | null;
      const effectiveLang = langField ?? lang;

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        cvText = await extractTextFromPDF(buffer);
      }
      if (pastedText?.trim()) {
        cvText = cvText ? `${cvText}\n\n${pastedText}` : pastedText;
      }

      if (!isUsableText(cvText)) {
        return NextResponse.json({ error: "לא ניתן לחלץ טקסט מהקובץ. נסה להדביק את הטקסט ידנית." }, { status: 400 });
      }

      const responseText = await geminiGenerate(
        CV_UPGRADE_PROMPT(cvText.slice(0, 8000), effectiveLang),
        undefined,
        4096,
        true
      );

      const stripped = responseText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
      const s = stripped.indexOf("{");
      const e = stripped.lastIndexOf("}");
      if (s === -1 || e <= s) throw new Error("AI did not return valid JSON");

      const result = JSON.parse(stripped.slice(s, e + 1)) as CvUpgradeResult;
      return NextResponse.json(result);
    }

    // JSON body (plain text paste)
    const body = await request.json() as { text?: string; lang?: string };
    cvText = body.text ?? "";
    const effectiveLang = body.lang ?? "he";

    if (!isUsableText(cvText)) {
      return NextResponse.json({ error: "הטקסט שהודבק קצר מדי." }, { status: 400 });
    }

    const responseText = await geminiGenerate(
      CV_UPGRADE_PROMPT(cvText.slice(0, 8000), effectiveLang),
      undefined,
      4096,
      true
    );

    const stripped = responseText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const s = stripped.indexOf("{");
    const e = stripped.lastIndexOf("}");
    if (s === -1 || e <= s) throw new Error("AI did not return valid JSON");

    const result = JSON.parse(stripped.slice(s, e + 1)) as CvUpgradeResult;
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[upgrade-cv] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
