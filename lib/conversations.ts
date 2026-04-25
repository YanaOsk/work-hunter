import crypto from "crypto";
import { getDb } from "./mongodb";
import type { JobResult } from "./types";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface JobSnap {
  id: string;
  title: string;
  company: string;
  matchScore: number;
  isRemote: boolean;
  source: string;
  url: string;
  matchReasons: string[];
}

export interface ConversationPreview {
  id: string;
  userId: string;
  createdAt: string;
  messageCount: number;
  title?: string;
  searchContext?: string;
  jobs: JobSnap[];
}

export interface ConversationFull extends ConversationPreview {
  messages: ConversationMessage[];
}

function toJobSnap(j: JobResult): JobSnap {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    matchScore: j.matchScore,
    isRemote: j.isRemote,
    source: j.source,
    url: j.url,
    matchReasons: j.matchReasons,
  };
}

export async function saveConversation(
  userId: string,
  messages: ConversationMessage[],
  searchContext: string,
  jobs: JobResult[] = [],
  title?: string
): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.collection("conversations").insertOne({
    id,
    userId,
    createdAt: new Date().toISOString(),
    messageCount: messages.length,
    title: title ?? null,
    messages,
    searchContext,
    jobs: jobs.slice(0, 10).map(toJobSnap),
  });
  return id;
}

export async function getConversation(userId: string, id: string): Promise<ConversationFull | null> {
  const db = await getDb();
  const doc = await db
    .collection("conversations")
    .findOne({ id, userId }, { projection: { _id: 0 } });
  return doc as unknown as ConversationFull | null;
}

export async function listConversations(userId: string): Promise<ConversationPreview[]> {
  const db = await getDb();
  const docs = await db
    .collection("conversations")
    .find({ userId }, { projection: { _id: 0, messages: 0, searchContext: 0 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return docs as unknown as ConversationPreview[];
}
