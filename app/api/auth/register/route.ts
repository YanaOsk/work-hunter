import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { sendWelcomeEmail, sendAdminNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    let user: { id: string; name: string; email: string } | null = null;
    try {
      user = await createUser(name.trim(), email.trim(), password);
    } catch (err) {
      console.error("[register] createUser threw:", err);
      return NextResponse.json({ error: "Could not save user — check server logs" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    console.log("[register] user created:", user.email);
    sendWelcomeEmail(user.name, user.email).catch((e) => console.error("[email] welcome failed:", e));
    sendAdminNotificationEmail(user.name, user.email).catch((e) => console.error("[email] admin notify failed:", e));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[register] unexpected error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
