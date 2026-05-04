import { NextRequest, NextResponse } from "next/server";
import { consumePasswordResetToken, updateUserPassword } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = (await request.json()) as { token?: string; password?: string };
    if (!token?.trim() || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const email = await consumePasswordResetToken(token.trim());
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const updated = await updateUserPassword(email, password);
    if (!updated) {
      return NextResponse.json({ error: "Could not update password" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
