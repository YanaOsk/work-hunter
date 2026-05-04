import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { saveSubscription, type SavedCard } from "@/lib/subscriptions";
import { sendPurchaseConfirmationEmail, sendAdminPurchaseNotificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, saveCard, cardLast4, cardExpiry, cardBrand } = body;

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const savedCard: SavedCard | undefined =
      saveCard && cardLast4
        ? { last4: cardLast4, expiry: cardExpiry ?? "", brand: cardBrand ?? "Visa" }
        : undefined;

    // Save subscription — must succeed for checkout to complete
    // (skipped in local dev when DATABASE_URL is absent — demo mode)
    if (process.env.DATABASE_URL) {
      await saveSubscription(
        session.user.email,
        session.user.name ?? "",
        planId,
        savedCard,
      );
    }

    // Send confirmation to user + admin notification — both non-fatal
    const priceStr = plan.price === 0 ? "חינם" : `${plan.displayPrice}${plan.per ? ` ${plan.per}` : ""}`;
    await Promise.allSettled([
      sendPurchaseConfirmationEmail(session.user.email, session.user.name ?? "", plan),
      sendAdminPurchaseNotificationEmail(
        session.user.name ?? session.user.email,
        session.user.email,
        planId,
        plan.nameHe,
        priceStr,
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
