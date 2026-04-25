import { sql } from "./db";

export interface SavedCard {
  last4: string;
  expiry: string;
  brand: string;
}

export interface Subscription {
  userEmail: string;
  userName: string;
  plan: string;
  purchasedAt: string;
  savedCard?: SavedCard;
}

export async function getSubscription(userEmail: string): Promise<Subscription | null> {
  const db = sql();
  const rows = await db`
    SELECT user_email, user_name, plan, purchased_at, card_last4, card_expiry, card_brand
    FROM subscriptions WHERE user_email = ${userEmail.toLowerCase()}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    userEmail: r.user_email,
    userName: r.user_name,
    plan: r.plan,
    purchasedAt: r.purchased_at,
    savedCard: r.card_last4
      ? { last4: r.card_last4, expiry: r.card_expiry ?? "", brand: r.card_brand ?? "Visa" }
      : undefined,
  };
}

export async function cancelSubscription(userEmail: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM subscriptions WHERE user_email = ${userEmail.toLowerCase()}`;
}

export async function saveSubscription(
  userEmail: string,
  userName: string,
  plan: string,
  savedCard?: SavedCard,
): Promise<void> {
  const db = sql();
  const lowerEmail = userEmail.toLowerCase();
  await db`
    INSERT INTO subscriptions (user_email, user_name, plan, purchased_at, card_last4, card_expiry, card_brand)
    VALUES (
      ${lowerEmail}, ${userName}, ${plan}, ${new Date().toISOString()},
      ${savedCard?.last4 ?? null}, ${savedCard?.expiry ?? null}, ${savedCard?.brand ?? null}
    )
    ON CONFLICT (user_email) DO UPDATE SET
      user_name = EXCLUDED.user_name,
      plan = EXCLUDED.plan,
      purchased_at = EXCLUDED.purchased_at,
      card_last4 = EXCLUDED.card_last4,
      card_expiry = EXCLUDED.card_expiry,
      card_brand = EXCLUDED.card_brand
  `;
}
