import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/analytics";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data = await getAnalyticsSummary();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
