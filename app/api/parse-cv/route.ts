export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { PARSE_CV_SYSTEM_PROMPT } from "@/lib/prompts";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFParser = require("pdf2json");
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (err: { parserError: Error }) => reject(err.parserError));
    parser.on("pdfParser_dataReady", (data: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      const text = data.Pages.flatMap((p) =>
        p.Texts.flatMap((t) => t.R.map((r) => decodeURIComponent(r.T)))
      ).join(" ");
      resolve(text);
    });

    parser.parseBuffer(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const freeText = formData.get("freeText") as string | null;

    let inputText = "";

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      inputText = await extractTextFromPDF(buffer);
    }

    if (freeText) {
      inputText = inputText ? `${inputText}\n\nAdditional info: ${freeText}` : freeText;
    }

    if (!inputText.trim()) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const truncated = inputText.slice(0, 6000);
    const lang = formData.get("lang") as string | null;

    const responseText = await geminiGenerate(
      `Please analyze this CV/bio and extract structured data. Write all clarifyingQuestions in English.\n\n${truncated}`,
      PARSE_CV_SYSTEM_PROMPT,
      4096,
      true
    );

    const clean = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(clean);

    // Ensure array fields are always real arrays of primitives
    if (Array.isArray(parsed.clarifyingQuestions)) {
      parsed.clarifyingQuestions = parsed.clarifyingQuestions.map((q: unknown) =>
        typeof q === "string" ? q : typeof q === "object" && q !== null ? String(Object.values(q)[0]) : String(q)
      );
    }
    const pd = parsed.parsedData;
    if (pd) {
      if (pd.skills && !Array.isArray(pd.skills)) pd.skills = String(pd.skills).split(/[,،]/);
      if (pd.targetRoles && !Array.isArray(pd.targetRoles)) pd.targetRoles = [String(pd.targetRoles)];
      if (pd.constraints && !Array.isArray(pd.constraints)) pd.constraints = [String(pd.constraints)];
    }

    return NextResponse.json({ rawText: inputText, ...parsed });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("parse-cv error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
