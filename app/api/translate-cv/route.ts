export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { geminiGenerate } from "@/lib/gemini";
import { TRANSLATE_CV_PROMPT } from "@/lib/prompts";
import { newId } from "@/lib/cvBuilder";
import type { CvData } from "@/lib/cvBuilder";

// Only the text fields that should be translated
interface TranslatableFields {
  fullName: string;
  title: string;
  summary: string;
  experiences: Array<{ role: string; company: string; location: string; description: string }>;
  educations: Array<{ degree: string; school: string; location: string; description: string }>;
  military: { unit: string; role: string };
  skills: string;
  languages: string;
}

function extractTranslatableFields(cv: CvData): TranslatableFields {
  return {
    fullName: cv.personal.fullName ?? "",
    title: cv.personal.title ?? "",
    summary: cv.summary ?? "",
    experiences: (cv.experiences ?? []).map((e) => ({
      role: e.role ?? "",
      company: e.company ?? "",
      location: e.location ?? "",
      description: e.description ?? "",
    })),
    educations: (cv.educations ?? []).map((e) => ({
      degree: e.degree ?? "",
      school: e.school ?? "",
      location: e.location ?? "",
      description: e.description ?? "",
    })),
    military: {
      unit: cv.military?.unit ?? "",
      role: cv.military?.role ?? "",
    },
    skills: cv.skills ?? "",
    languages: cv.languages ?? "",
  };
}

function mergeTranslatedFields(original: CvData, translated: TranslatableFields): CvData {
  return {
    ...original,
    personal: {
      ...original.personal,
      fullName: translated.fullName || original.personal.fullName,
      title: translated.title ?? original.personal.title,
    },
    summary: translated.summary ?? original.summary,
    experiences: (original.experiences ?? []).map((e, i) => ({
      ...e,
      id: e.id || newId(),
      role: translated.experiences?.[i]?.role ?? e.role,
      company: translated.experiences?.[i]?.company ?? e.company,
      location: translated.experiences?.[i]?.location ?? e.location,
      description: translated.experiences?.[i]?.description ?? e.description,
    })),
    educations: (original.educations ?? []).map((e, i) => ({
      ...e,
      id: e.id || newId(),
      degree: translated.educations?.[i]?.degree ?? e.degree,
      school: translated.educations?.[i]?.school ?? e.school,
      location: translated.educations?.[i]?.location ?? e.location,
      description: translated.educations?.[i]?.description ?? e.description,
    })),
    military: {
      ...original.military,
      unit: translated.military?.unit ?? original.military?.unit ?? "",
      role: translated.military?.role ?? original.military?.role ?? "",
    },
    skills: translated.skills ?? original.skills,
    languages: translated.languages ?? original.languages,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cvData: CvData; targetLang: "he" | "en" };
    const { cvData, targetLang } = body;

    if (!cvData || !targetLang) {
      return NextResponse.json({ error: "Missing cvData or targetLang" }, { status: 400 });
    }

    const fields = extractTranslatableFields(cvData);
    const fieldsJson = JSON.stringify(fields, null, 2);

    const responseText = await geminiGenerate(
      TRANSLATE_CV_PROMPT(fieldsJson, targetLang),
      undefined,
      8192,
      true
    );

    const stripped = responseText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const s = stripped.indexOf("{");
    const e = stripped.lastIndexOf("}");
    if (s === -1 || e <= s) throw new Error("AI did not return valid JSON");

    const translatedFields = JSON.parse(stripped.slice(s, e + 1)) as TranslatableFields;
    const translatedCv = mergeTranslatedFields(cvData, translatedFields);

    return NextResponse.json(translatedCv);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[translate-cv] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
