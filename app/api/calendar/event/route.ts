import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

async function getValidToken(email: string): Promise<string | null> {
  const db = sql();
  const rows = await db`
    SELECT access_token, refresh_token, expires_at
    FROM calendar_tokens
    WHERE user_email = ${email.toLowerCase()}
  `;
  if (!rows.length) return null;

  const { access_token, refresh_token, expires_at } = rows[0];

  // If token still valid (with 2-min buffer), return it
  if (expires_at && Date.now() < Number(expires_at) - 120_000) {
    return access_token;
  }

  // Refresh the token
  if (!refresh_token) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  const tokens = await res.json();
  const newExpiry = Date.now() + (tokens.expires_in ?? 3600) * 1000;

  await db`
    UPDATE calendar_tokens
    SET access_token = ${tokens.access_token}, expires_at = ${newExpiry}
    WHERE user_email = ${email.toLowerCase()}
  `;

  return tokens.access_token;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, date, time, durationMinutes = 60, location } = await req.json();

  if (!title || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = await getValidToken(session.user.email);
  if (!token) {
    return NextResponse.json({ error: "Calendar not connected" }, { status: 403 });
  }

  // Build start/end times (Israel timezone)
  const startISO = `${date}T${time}:00`;
  const startDate = new Date(`${startISO}+03:00`);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  const event = {
    summary: title,
    description: description ?? "",
    location: location ?? "",
    start: { dateTime: startDate.toISOString(), timeZone: "Asia/Jerusalem" },
    end:   { dateTime: endDate.toISOString(),   timeZone: "Asia/Jerusalem" },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email",  minutes: 60 },
        { method: "popup",  minutes: 30 },
      ],
    },
  };

  const calRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!calRes.ok) {
    const err = await calRes.json();
    return NextResponse.json({ error: err.error?.message ?? "Calendar error" }, { status: 500 });
  }

  const created = await calRes.json();
  return NextResponse.json({ ok: true, eventId: created.id, eventUrl: created.htmlLink });
}
