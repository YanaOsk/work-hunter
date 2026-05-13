import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/settings?calendar=error", req.url));
  }

  let userEmail: string;
  try {
    userEmail = Buffer.from(state, "base64").toString("utf-8");
  } catch {
    return NextResponse.redirect(new URL("/settings?calendar=error", req.url));
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/calendar/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/settings?calendar=error", req.url));
  }

  const tokens = await tokenRes.json();
  const db = sql();

  const expiresAt = tokens.expires_in
    ? Date.now() + tokens.expires_in * 1000
    : null;

  await db`
    INSERT INTO calendar_tokens (user_email, access_token, refresh_token, expires_at, connected_at)
    VALUES (
      ${userEmail.toLowerCase()},
      ${tokens.access_token},
      ${tokens.refresh_token ?? null},
      ${expiresAt},
      ${new Date().toISOString()}
    )
    ON CONFLICT (user_email) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = COALESCE(EXCLUDED.refresh_token, calendar_tokens.refresh_token),
      expires_at   = EXCLUDED.expires_at,
      connected_at = EXCLUDED.connected_at
  `;

  return NextResponse.redirect(new URL("/settings?calendar=connected", req.url));
}
