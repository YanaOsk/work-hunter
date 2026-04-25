import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set. Add it to your environment variables.");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Repair common LLM JSON mistakes: trailing commas, unclosed strings/brackets
function tryRepairJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  // Remove trailing commas before ] or }
  s = s.replace(/,(\s*[\]}])/g, "$1");
  // If odd number of unescaped quotes, close the open string
  const quoteCount = (s.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) s += '"';
  // Close any unclosed braces/brackets
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
    else if ((ch === "}" || ch === "]") && stack.length) stack.pop();
  }
  s += stack.reverse().join("");
  return s;
}

async function callGroq(
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  try {
    const response = await getGroq().chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    });
    return response.choices[0]?.message?.content ?? "";
  } catch (err: unknown) {
    // Groq json_validate_failed: the model produced structurally invalid JSON.
    // Recover the raw output from the error and attempt a best-effort repair.
    if (jsonMode && err !== null && typeof err === "object") {
      const e = (err as Record<string, unknown>).error as Record<string, unknown> | undefined;
      if (e?.code === "json_validate_failed" && typeof e?.failed_generation === "string") {
        return tryRepairJson(e.failed_generation);
      }
    }
    throw err;
  }
}

// Real-time chat — llama-3.1-8b-instant has ~500K tokens/day limit
export async function geminiGenerate(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  return callGroq("llama-3.1-8b-instant", prompt, systemPrompt, maxTokens, jsonMode);
}

// Complex analysis — llama-3.3-70b-versatile, higher quality, 100K tokens/day limit
export async function geminiAnalyze(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  return callGroq("llama-3.3-70b-versatile", prompt, systemPrompt, maxTokens, jsonMode);
}

// Best-effort: try 70b, silently fall back to 8b on rate-limit or any error.
// Use this for user-facing chat so clients never see API failures.
export async function geminiChat(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096
): Promise<string> {
  try {
    return await callGroq("llama-3.3-70b-versatile", prompt, systemPrompt, maxTokens, false);
  } catch {
    return callGroq("llama-3.1-8b-instant", prompt, systemPrompt, maxTokens, false);
  }
}
