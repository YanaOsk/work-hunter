import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const maxDuration = 30;

export async function GET() {
  try {
    const db = sql();

    await db`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS google_accounts (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS subscriptions (
        user_email TEXT PRIMARY KEY,
        user_name TEXT NOT NULL,
        plan TEXT NOT NULL,
        purchased_at TEXT NOT NULL,
        expiry_date TEXT,
        card_last4 TEXT,
        card_expiry TEXT,
        card_brand TEXT
      )
    `;
    // Migration: add expiry_date to existing tables that don't have it yet
    await db`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expiry_date TEXT`;

    await db`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        path TEXT NOT NULL,
        event TEXT,
        label TEXT,
        session_id TEXT NOT NULL,
        country TEXT,
        country_code TEXT,
        region TEXT,
        city TEXT,
        referrer TEXT,
        timestamp TEXT NOT NULL,
        is_new_session BOOLEAN
      )
    `;

    await db`
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)
    `;
    await db`
      CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id)
    `;

    await db`
      CREATE TABLE IF NOT EXISTS user_meta (
        email TEXT PRIMARY KEY,
        title TEXT,
        location TEXT,
        years_experience INTEGER,
        education TEXT,
        skills TEXT[],
        target_roles TEXT[],
        work_preference TEXT,
        languages TEXT[],
        bio TEXT,
        linkedin TEXT,
        availability TEXT,
        profile_image TEXT,
        advisor_current_stage TEXT,
        advisor_completed_count INTEGER,
        updated_at TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS cvs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;

    await db`
      CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id)
    `;

    await db`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        message_count INTEGER NOT NULL,
        title TEXT,
        messages JSONB NOT NULL DEFAULT '[]',
        search_context TEXT,
        jobs JSONB NOT NULL DEFAULT '[]'
      )
    `;

    await db`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)
    `;

    return NextResponse.json({ ok: true, message: "All tables created" });
  } catch (err) {
    console.error("init-db error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
