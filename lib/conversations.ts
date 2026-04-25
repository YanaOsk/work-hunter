import crypto from "crypto";
import { sql } from "./db";
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
  const db = sql();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const jobSnaps = jobs.slice(0, 10).map(toJobSnap);
  await db`
    INSERT INTO conversations (id, user_id, created_at, message_count, title, messages, search_context, jobs)
    VALUES (
      ${id}, ${userId}, ${now}, ${messages.length},
      ${title ?? null}, ${JSON.stringify(messages)}, ${searchContext ?? null}, ${JSON.stringify(jobSnaps)}
    )
  `;
  return id;
}

export async function getConversation(userId: string, id: string): Promise<ConversationFull | null> {
  const db = sql();
  const rows = await db`
    SELECT id, user_id, created_at, message_count, title, messages, search_context, jobs
    FROM conversations WHERE id = ${id} AND user_id = ${userId}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id,
    createdAt: r.created_at,
    messageCount: r.message_count,
    title: r.title ?? undefined,
    searchContext: r.search_context ?? undefined,
    jobs: r.jobs as JobSnap[],
    messages: r.messages as ConversationMessage[],
  };
}

export async function listConversations(userId: string): Promise<ConversationPreview[]> {
  const db = sql();
  const rows = await db`
    SELECT id, user_id, created_at, message_count, title, jobs
    FROM conversations WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 20
  `;
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    createdAt: r.created_at,
    messageCount: r.message_count,
    title: r.title ?? undefined,
    jobs: r.jobs as JobSnap[],
  }));
}
