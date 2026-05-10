/**
 * AI Model Routing — Work Hunter
 * ─────────────────────────────────────────────────────────────────────────────
 * Despite the filename, this module does NOT call Google Gemini.
 * All production calls go to OpenAI (primary) with Groq as fallback.
 *
 * Model selection guide:
 *   gpt-4o-mini  — default for everything: Scout chat, CV parsing, job match
 *                  scoring, search query generation, CV translation/upgrade.
 *                  Fast, cheap, Hebrew-capable. Use unless you need deep reasoning.
 *
 *   gpt-4o       — reserved for high-stakes one-off tasks: prompt audits,
 *                  counseling case analysis, complex multi-document synthesis.
 *                  Use via a standalone script (see scripts/roast_review.py).
 *                  NOT used in the live app to keep costs predictable.
 *
 *   llama-3.3-70b-versatile (Groq) — fallback when OpenAI is down or rate-limited.
 *                  Capped at 600 output tokens (Groq free tier: 6K TPM).
 *                  Suitable for short responses; avoid for CV parsing / long outputs.
 *
 *   Google Gemini API (AIzaSy...) — free-tier key, limited daily quota.
 *                  Use only for offline audits / agent reviews, never in prod.
 *                  Key lives in scripts/; not wired to the app.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import OpenAI from "openai";
import Groq from "groq-sdk";

let openaiClient: OpenAI | null = null;
let groqClient: Groq | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Extracts text from a PDF buffer using the OpenAI Responses API (vision-capable).
// Works for both text-based and image/scanned PDFs.
export async function extractPdfTextWithVision(pdfBuffer: Buffer): Promise<string> {
  const base64 = pdfBuffer.toString("base64");
  const client = getOpenAI();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (client as any).responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename: "cv.pdf",
            file_data: `data:application/pdf;base64,${base64}`,
          },
          {
            type: "input_text",
            text: "Extract ALL text from this CV/resume document. Preserve the structure as much as possible — include all sections, names, dates, bullet points, and contact details. Output only the extracted text with no extra commentary.",
          },
        ],
      },
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = response as any;
  return r.output_text ?? r.output?.[0]?.content?.[0]?.text ?? "";
}

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set.");
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export function truncate(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "…";
}

export function safeParseJson<T = unknown>(raw: string, context?: string): T {
  const repaired = tryRepairJson(raw);
  try {
    return JSON.parse(repaired) as T;
  } catch (err) {
    console.error(`[safeParseJson] parse failed${context ? ` (${context})` : ""}`, {
      rawPreview: raw.slice(0, 300),
      repairedPreview: repaired.slice(0, 300),
      error: String(err),
    });
    throw new Error("AI returned invalid JSON");
  }
}

export function tryRepairJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  let start = -1;
  let closingChar = "";
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace; closingChar = "}";
  } else if (firstBracket !== -1) {
    start = firstBracket; closingChar = "]";
  }
  if (start !== -1) {
    const lastClose = s.lastIndexOf(closingChar);
    s = lastClose > start ? s.slice(start, lastClose + 1) : s.slice(start);
  }

  s = s.replace(/,(\s*[\]}])/g, "$1");

  const quoteCount = (s.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) s += '"';

  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
    else if ((ch === "}" || ch === "]") && stack.length) stack.pop();
  }
  s += stack.reverse().join("");

  return s;
}

async function callOpenAI(
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const response = await getOpenAI().chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const text = response.choices[0]?.message?.content ?? "";

  if (jsonMode && text) {
    try { JSON.parse(text); return text; } catch {
      const repaired = tryRepairJson(text);
      try { JSON.parse(repaired); return repaired; } catch { return repaired; }
    }
  }

  return text;
}

async function callGroqFallback(
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  // Groq free tier: 6,000 TPM. Cap output to avoid burning through the limit.
  const cappedTokens = Math.min(maxTokens, 600);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await getGroq().chat.completions.create({
        model,
        messages,
        max_tokens: cappedTokens,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      });

      const text = response.choices[0]?.message?.content ?? "";

      if (jsonMode && text) {
        try { JSON.parse(text); return text; } catch {
          const repaired = tryRepairJson(text);
          try { JSON.parse(repaired); return repaired; } catch { return repaired; }
        }
      }

      return text;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (status === 429 && attempt < 2) {
        // Rate-limited — wait 3 s then retry
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// Scout chat + fast tasks — gpt-4o-mini, Groq 70b fallback
export async function geminiGenerate(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  try {
    return await callOpenAI("gpt-4o-mini", prompt, systemPrompt, maxTokens, jsonMode);
  } catch {
    if (process.env.GROQ_API_KEY) {
      return callGroqFallback("llama-3.3-70b-versatile", prompt, systemPrompt, maxTokens, jsonMode);
    }
    throw new Error("AI service unavailable.");
  }
}

// Complex analysis — gpt-4o-mini, Groq 70b fallback
export async function geminiAnalyze(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  try {
    return await callOpenAI("gpt-4o-mini", prompt, systemPrompt, maxTokens, jsonMode);
  } catch {
    if (process.env.GROQ_API_KEY) {
      return callGroqFallback("llama-3.3-70b-versatile", prompt, systemPrompt, maxTokens, jsonMode);
    }
    throw new Error("AI service unavailable.");
  }
}

// Scout chat — gpt-4o-mini, Groq 70b fallback
export async function geminiChat(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096
): Promise<string> {
  try {
    return await callOpenAI("gpt-4o-mini", prompt, systemPrompt, maxTokens, false);
  } catch {
    if (process.env.GROQ_API_KEY) {
      // Groq free tier: ~12k TPM. Truncate system prompt to stay under budget.
      const groqSystem = systemPrompt && systemPrompt.length > 6000
        ? systemPrompt.slice(0, 6000) + "\n[system prompt truncated for fallback model]"
        : systemPrompt;
      return callGroqFallback("llama-3.3-70b-versatile", prompt, groqSystem, maxTokens, false);
    }
    throw new Error("AI service unavailable.");
  }
}
