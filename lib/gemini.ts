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

function tryRepairJson(raw: string): string {
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

  const response = await getGroq().chat.completions.create({
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
      return callGroqFallback("llama-3.3-70b-versatile", prompt, systemPrompt, maxTokens, false);
    }
    throw new Error("AI service unavailable.");
  }
}
