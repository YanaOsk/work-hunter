import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/adminAuth";
import { getAllUsers, deleteUser } from "@/lib/users";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email?: string | null) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function GET() {
  const session = await getServerSession(adminAuthOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(await getAllUsers());
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(adminAuthOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = (await req.json()) as { id: string };
  const deleted = await deleteUser(id);
  if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
