export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate, extractPdfTextWithVision } from "@/lib/gemini";
import { IMPORT_CV_PROMPT } from "@/lib/prompts";
import { EMPTY_CV, newId } from "@/lib/cvBuilder";
import type { CvData } from "@/lib/cvBuilder";

// Must contain real readable letters, not just binary/metadata garbage
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

async function extractWithPdf2Json(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require("pdf2json");
      const parser = new PDFParser();
      parser.on("pdfParser_dataError", () => resolve(""));
      parser.on("pdfParser_dataReady", (data: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
        try {
          const text = data.Pages.flatMap((p) =>
            p.Texts.flatMap((t) =>
              t.R.map((r) => {
                try { return decodeURIComponent(r.T); } catch { return r.T; }
              })
            )
          ).join(" ");
          resolve(text);
        } catch {
          resolve("");
        }
      });
      parser.parseBuffer(buffer);
    } catch {
      resolve("");
    }
  });
}

function containsHebrew(text: string): boolean {
  return /[א-ת]/.test(text);
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // 1. pdf-parse — most text-based PDFs
  try {
    const text = await extractWithPdfParse(buffer);
    if (isUsableText(text)) {
      // Hebrew PDFs often store text in visual order (reversed) — vision reads correctly
      if (containsHebrew(text)) {
        console.log("[import-cv] Hebrew detected in pdf-parse output, switching to vision");
        return extractPdfTextWithVision(buffer);
      }
      console.log("[import-cv] extracted via pdf-parse, chars:", text.length);
      return text;
    }
  } catch {
    // fall through
  }

  // 2. pdf2json
  try {
    const text = await extractWithPdf2Json(buffer);
    if (isUsableText(text)) {
      if (containsHebrew(text)) {
        console.log("[import-cv] Hebrew detected in pdf2json output, switching to vision");
        return extractPdfTextWithVision(buffer);
      }
      console.log("[import-cv] extracted via pdf2json, chars:", text.length);
      return text;
    }
  } catch {
    // fall through
  }

  // 3. Vision — scanned PDFs, image-based, or Hebrew with visual-order text
  console.log("[import-cv] falling back to vision extraction");
  return extractPdfTextWithVision(buffer);
}

const COMMON_TLDS = ["com", "net", "org", "co", "il", "io", "me", "info", "edu", "gov", "ac"];

// In RTL bidi rendering, European Numbers (digits) at the end of a local part
// get visually pulled to the front: "yanaoskin35" → "35yanaoskin".
// If local starts with digits followed by 4+ letters, move digits to end.
function fixLocalPart(local: string): string {
  const m = local.match(/^(\d+)([a-zA-Z].{3,})$/);
  return m ? `${m[2]}${m[1]}` : local;
}

function maybeFixEmail(email: string): string {
  if (!email) return email;
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const raw_local = email.slice(0, atIdx).trim();
  const raw_domain = email.slice(atIdx + 1).trim();

  // Case: local looks like a reversed domain (e.g. "com.gmail@35yanaoskin")
  // → swap parts and reverse domain segments, then fix local digits
  if (raw_local.includes(".")) {
    const localParts = raw_local.split(".");
    if (COMMON_TLDS.includes(localParts[0].toLowerCase())) {
      const fixedDomain = [...localParts].reverse().join(".");
      const fixedLocal = fixLocalPart(raw_domain);
      return `${fixedLocal}@${fixedDomain}`;
    }
  }

  // Case: domain segments are reversed (e.g. "user@com.gmail")
  const domainParts = raw_domain.split(".");
  if (domainParts.length >= 2 && COMMON_TLDS.includes(domainParts[0].toLowerCase())) {
    return `${fixLocalPart(raw_local)}@${[...domainParts].reverse().join(".")}`;
  }

  return `${raw_local}@${raw_domain}`;
}

function sanitizeCvData(raw: Partial<CvData>): CvData {
  const base = EMPTY_CV;
  return {
    personal: {
      fullName:  raw.personal?.fullName  ?? "",
      title:     raw.personal?.title     ?? "",
      email:     maybeFixEmail(raw.personal?.email ?? ""),
      phone:     raw.personal?.phone     ?? "",
      location:  raw.personal?.location  ?? "",
      linkedin:  raw.personal?.linkedin  ?? "",
      website:   raw.personal?.website   ?? "",
      photo:     "",
    },
    summary: raw.summary ?? "",
    experiences: (raw.experiences ?? []).map((e) => ({
      id:          e.id || newId(),
      role:        e.role        ?? "",
      company:     e.company     ?? "",
      location:    e.location    ?? "",
      start:       e.start       ?? "",
      end:         e.current ? "" : (e.end ?? ""),
      current:     e.current     ?? false,
      description: e.description ?? "",
    })),
    educations: (raw.educations ?? []).map((e) => ({
      id:          e.id || newId(),
      degree:      e.degree      ?? "",
      school:      e.school      ?? "",
      location:    e.location    ?? "",
      start:       e.start       ?? "",
      end:         e.current ? "" : (e.end ?? ""),
      current:     e.current     ?? false,
      description: e.description ?? "",
    })),
    military: {
      unit:        raw.military?.unit        ?? "",
      role:        raw.military?.role        ?? "",
      start:       raw.military?.start       ?? "",
      end:         raw.military?.end         ?? "",
      reserveDuty: raw.military?.reserveDuty ?? false,
    },
    skills:      raw.skills      ?? "",
    languages:   raw.languages   ?? "",
    template:    raw.template    ?? base.template,
    accentColor: raw.accentColor ?? base.accentColor,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lang = (formData.get("lang") as string | null) ?? "he";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawText = await extractTextFromPDF(buffer);

    console.log("[import-cv] rawText length:", rawText.trim().length, "| preview:", rawText.slice(0, 100));

    if (!isUsableText(rawText)) {
      const msg = lang === "he"
        ? "לא הצלחנו לקרוא את ה-PDF. נסה קובץ אחר או הדבק את תוכן קורות החיים ידנית."
        : "Could not read this PDF. Try a different file or paste your CV content manually.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const truncated = rawText.slice(0, 10000);

    // 12000 tokens — enough for a full structured CV JSON output
    // jsonMode:true forces OpenAI to escape newlines/quotes inside strings
    const responseText = await geminiGenerate(
      IMPORT_CV_PROMPT(truncated, lang),
      undefined,
      12000,
      true
    );

    console.log("[import-cv] AI response length:", responseText.length, "| preview:", responseText.slice(0, 200));

    // Strip markdown fences if present, then find the JSON object
    const stripped = responseText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const objStart = stripped.indexOf("{");
    const objEnd   = stripped.lastIndexOf("}");
    if (objStart === -1 || objEnd === -1 || objEnd <= objStart) {
      console.error("[import-cv] no JSON object found. Response:", stripped.slice(0, 300));
      throw new Error("AI did not return valid JSON");
    }

    const jsonStr = stripped.slice(objStart, objEnd + 1);

    let parsed: Partial<CvData>;
    try {
      parsed = JSON.parse(jsonStr) as Partial<CvData>;
    } catch (firstErr) {
      console.error("[import-cv] first parse failed:", firstErr, "| attempting repair");
      // Escape only newlines that sit INSIDE string values (not structural whitespace)
      const repaired = jsonStr.replace(/"((?:[^"\\]|\\.)*)"/g, (_m, inner: string) =>
        `"${inner.replace(/\n/g, "\\n").replace(/\r/g, "")}"`
      );
      try {
        parsed = JSON.parse(repaired) as Partial<CvData>;
      } catch (secondErr) {
        console.error("[import-cv] repair also failed:", secondErr, "| snippet:", jsonStr.slice(0, 400));
        throw new Error("Could not parse AI response as JSON");
      }
    }
    const cvData = sanitizeCvData(parsed);

    return NextResponse.json(cvData);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[import-cv] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
