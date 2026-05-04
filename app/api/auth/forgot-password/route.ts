import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/users";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const token = await createPasswordResetToken(email.trim());
    if (token) {
      const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
      sendPasswordResetEmail(email.trim().toLowerCase(), resetUrl).catch((e) =>
        console.error("[forgot-password] email failed:", e)
      );
    }
    // Always respond with success — don't reveal whether email exists
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
