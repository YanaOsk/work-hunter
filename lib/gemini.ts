import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function geminiGenerate(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  // 70b for all tasks — better Hebrew and complex nested JSON. 8b truncated outputs.
  const model = "llama-3.3-70b-versatile";

  const response = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  return response.choices[0]?.message?.content ?? "";
}
