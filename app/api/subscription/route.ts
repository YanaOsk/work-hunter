import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSubscription, cancelSubscription, removeCard } from "@/lib/subscriptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscription(session.user.email);
    return NextResponse.json(sub ?? { plan: "free" });
  } catch (err) {
    console.error("Subscription fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await cancelSubscription(session.user.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscription cancel error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH — remove saved card only (subscription stays active, won't auto-renew) */
export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await removeCard(session.user.email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove card error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
