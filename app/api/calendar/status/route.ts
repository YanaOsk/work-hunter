import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ connected: false });
  }

  const db = sql();
  const rows = await db`
    SELECT connected_at FROM calendar_tokens
    WHERE user_email = ${session.user.email.toLowerCase()}
  `;

  return NextResponse.json({ connected: rows.length > 0, connectedAt: rows[0]?.connected_at ?? null });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  await db`DELETE FROM calendar_tokens WHERE user_email = ${session.user.email.toLowerCase()}`;

  return NextResponse.json({ ok: true });
}
