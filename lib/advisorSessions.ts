import { sql } from "./db";
import type { AdvisorState } from "./types";

export async function upsertAdvisorSession(
  userEmail: string,
  advisorState: AdvisorState
): Promise<void> {
  const db = sql();
  const now = new Date().toISOString();
  await db`
    INSERT INTO advisor_sessions (user_email, created_at, updated_at, stage, full_state)
    VALUES (
      ${userEmail}, ${now}, ${now},
      ${advisorState.currentStage ?? null},
      ${JSON.stringify(advisorState)}
    )
    ON CONFLICT (user_email) DO UPDATE SET
      updated_at  = ${now},
      stage       = ${advisorState.currentStage ?? null},
      full_state  = ${JSON.stringify(advisorState)}
  `;
}

export async function logAdvisorChatTurn(
  userEmail: string,
  userMessage: string,
  advisorResponse: string,
  advisorState: AdvisorState,
  messageIndex: number
): Promise<void> {
  const db = sql();
  const now = new Date().toISOString();
  const context = {
    profile: advisorState.userProfile?.parsedData ?? null,
    diagnosis: advisorState.diagnosis ?? null,
    direction: advisorState.direction ?? null,
    chosenPath: advisorState.chosenPath ?? null,
    stage: advisorState.currentStage ?? null,
  };
  await db`
    INSERT INTO advisor_chat_log
      (user_email, created_at, user_message, advisor_response, context, message_index)
    VALUES (
      ${userEmail}, ${now}, ${userMessage}, ${advisorResponse},
      ${JSON.stringify(context)}, ${messageIndex}
    )
  `;
}

export interface AdvisorSessionRow {
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  stage: string | null;
  fullState: AdvisorState;
}

export async function getAdvisorSession(
  userEmail: string
): Promise<AdvisorSessionRow | null> {
  const db = sql();
  const rows = await db`
    SELECT user_email, created_at, updated_at, stage, full_state
    FROM advisor_sessions WHERE user_email = ${userEmail}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    userEmail: r.user_email,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    stage: r.stage,
    fullState: r.full_state as AdvisorState,
  };
}

export interface AdvisorChatLogRow {
  id: number;
  userEmail: string;
  createdAt: string;
  userMessage: string;
  advisorResponse: string;
  context: Record<string, unknown>;
  messageIndex: number;
}

export async function getAdvisorChatLog(
  userEmail: string,
  limit = 50
): Promise<AdvisorChatLogRow[]> {
  const db = sql();
  const rows = await db`
    SELECT id, user_email, created_at, user_message, advisor_response, context, message_index
    FROM advisor_chat_log
    WHERE user_email = ${userEmail}
    ORDER BY id DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    userEmail: r.user_email,
    createdAt: r.created_at,
    userMessage: r.user_message,
    advisorResponse: r.advisor_response,
    context: r.context as Record<string, unknown>,
    messageIndex: r.message_index,
  }));
}
