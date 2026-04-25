import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { geminiChat } from "@/lib/gemini";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";
import { runJobSearch, generateHiddenMarket } from "@/lib/jobSearch";

// Build a compact profile summary from conversation history for the search engine
function buildProfileFromConversation(
  messages: ChatMessage[],
  userProfile: Record<string, unknown>
): string {
  const parsedData = (userProfile?.parsedData as Record<string, unknown>) ?? {};
  const rawText = (userProfile?.rawText as string) ?? "";

  const conversationSummary = messages
    .slice(-12) // last 12 messages — enough context, not too much
    .map((m) => `${m.role === "user" ? "מועמד" : "Scout"}: ${m.content}`)
    .join("\n");

  return JSON.stringify({
    ...parsedData,
    rawIntro: rawText,
    conversationContext: conversationSummary,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages, userProfile, lang } = body as {
      messages: ChatMessage[];
      userProfile: Record<string, unknown>;
      lang?: string;
    };

    const langInstruction = lang === "he"
      ? "השב בעברית בלבד. אל תשתמש בלוכסנים (כגון בחר/י) — השתמש בניסוחים ניטרליים."
      : "Respond in English only.";

    const rawIntro = (userProfile as Record<string, unknown>)?.rawText as string | undefined;

    const systemWithContext = `${CHAT_SYSTEM_PROMPT}

${langInstruction}

Current user profile (what we know so far):
${JSON.stringify(userProfile?.parsedData || {}, null, 2)}

${rawIntro ? `Original intro from the user:\n"${rawIntro}"\n` : ""}
Missing information: ${JSON.stringify(userProfile?.missingFields || [])}`;

    const history = messages
      .map((m) => `${m.role === "user" ? "User" : "Scout"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${history}\n\nScout:`;

    const agentResponse = await geminiChat(prompt, systemWithContext, 1200);

    // Detect search signal
    const shouldSearch = agentResponse.includes("[SEARCH_NOW]") || agentResponse.includes("[READY_TO_SEARCH]");
    const cleanMessage = agentResponse
      .replace("[SEARCH_NOW]", "")
      .replace("[READY_TO_SEARCH]", "")
      .trim();

    if (!shouldSearch) {
      return NextResponse.json({ message: cleanMessage, readyToSearch: false });
    }

    // Build full profile from conversation and run the search
    const profileText = buildProfileFromConversation(messages, userProfile);

    let jobs = [];
    let demoMode = false;
    let hiddenMarket = null;

    try {
      const result = await runJobSearch(profileText);
      jobs = result.jobs;
      demoMode = result.demoMode;

      // If fewer than 3 good matches (score ≥ 60), supplement with hidden market strategy
      const goodMatches = jobs.filter((j) => j.matchScore >= 60);
      if (goodMatches.length < 3) {
        hiddenMarket = await generateHiddenMarket(profileText, lang ?? "he");
      }
    } catch {
      // Search failed — still return the message, no jobs
      return NextResponse.json({ message: cleanMessage, readyToSearch: true, jobs: [], demoMode: false, hiddenMarket: null });
    }

    return NextResponse.json({
      message: cleanMessage,
      readyToSearch: true,
      jobs,
      demoMode,
      hiddenMarket,
    });
  } catch (error) {
    console.error("chat error:", error);
    return NextResponse.json({ error: "Chat failed. Check your GROQ_API_KEY." }, { status: 500 });
  }
}
