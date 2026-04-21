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

export async function geminiGenerate(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 4096,
  jsonMode = false
): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const model = "llama-3.3-70b-versatile";

  const response = await getGroq().chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  return response.choices[0]?.message?.content ?? "";
}
