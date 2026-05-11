import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyUser, updateUserPassword } from "@/lib/users";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = sql();
  const googleRow = await db`SELECT email FROM google_accounts WHERE email = ${session.user.email.toLowerCase()}`;
  return NextResponse.json({ isGoogleUser: googleRow.length > 0 });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  // Block Google users — they have no password
  const db = sql();
  const googleRow = await db`SELECT email FROM google_accounts WHERE email = ${email}`;
  if (googleRow.length > 0) {
    return NextResponse.json({ error: "Google accounts cannot change password here" }, { status: 400 });
  }

  const { currentPassword, newPassword } = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both fields required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (currentPassword === newPassword) {
    return NextResponse.json({ error: "New password must differ from current" }, { status: 400 });
  }

  const valid = await verifyUser(email, currentPassword);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const updated = await updateUserPassword(email, newPassword);
  if (!updated) {
    return NextResponse.json({ error: "Could not update password" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
