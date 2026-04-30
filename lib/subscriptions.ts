import { sql } from "./db";
import { PLANS, type PlanId } from "./plans";

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
  expiryDate: string | null; // null = lifetime
  savedCard?: SavedCard;
  isLifetime: boolean;
  isExpired?: boolean;
}

function calcExpiryDate(plan: string, from: Date): Date | null {
  const renewalDays = PLANS[plan as PlanId]?.renewalDays;
  if (renewalDays === null || renewalDays === undefined) return null; // lifetime or free
  const d = new Date(from);
  d.setDate(d.getDate() + renewalDays);
  return d;
}

export async function getSubscription(userEmail: string): Promise<Subscription | null> {
  const db = sql();
  // Ensure expiry_date column exists (no-op if already present)
  await db`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expiry_date TEXT`;
  const rows = await db`
    SELECT user_email, user_name, plan, purchased_at, expiry_date, card_last4, card_expiry, card_brand
    FROM subscriptions WHERE user_email = ${userEmail.toLowerCase()}
  `;
  if (rows.length === 0) return null;

  const r = rows[0];
  const savedCard: SavedCard | undefined = r.card_last4
    ? { last4: r.card_last4, expiry: r.card_expiry ?? "", brand: r.card_brand ?? "Visa" }
    : undefined;

  const isLifetime = r.expiry_date === null;
  const now = new Date();
  const expiryDate: Date | null = r.expiry_date ? new Date(r.expiry_date) : null;
  const isExpired = !isLifetime && expiryDate !== null && expiryDate < now;

  // Auto-renew if expired and has saved card (simulate recurring billing)
  if (isExpired && savedCard) {
    const newPurchasedAt = now;
    const newExpiry = calcExpiryDate(r.plan, newPurchasedAt);
    await db`
      UPDATE subscriptions
      SET purchased_at = ${newPurchasedAt.toISOString()},
          expiry_date  = ${newExpiry ? newExpiry.toISOString() : null}
      WHERE user_email = ${userEmail.toLowerCase()}
    `;
    return {
      userEmail: r.user_email,
      userName: r.user_name,
      plan: r.plan,
      purchasedAt: newPurchasedAt.toISOString(),
      expiryDate: newExpiry ? newExpiry.toISOString() : null,
      savedCard,
      isLifetime: false,
    };
  }

  // Expired with no saved card → return as expired (not null) so UI can show expiry message
  if (isExpired) {
    return {
      userEmail: r.user_email,
      userName: r.user_name,
      plan: r.plan,
      purchasedAt: r.purchased_at,
      expiryDate: r.expiry_date ?? null,
      savedCard: undefined,
      isLifetime: false,
      isExpired: true,
    };
  }

  return {
    userEmail: r.user_email,
    userName: r.user_name,
    plan: r.plan,
    purchasedAt: r.purchased_at,
    expiryDate: r.expiry_date ?? null,
    savedCard,
    isLifetime,
  };
}

export async function cancelSubscription(userEmail: string): Promise<void> {
  const db = sql();
  await db`DELETE FROM subscriptions WHERE user_email = ${userEmail.toLowerCase()}`;
}

/** Remove saved card only — subscription stays active until expiry, won't auto-renew */
export async function removeCard(userEmail: string): Promise<void> {
  const db = sql();
  await db`
    UPDATE subscriptions
    SET card_last4 = NULL, card_expiry = NULL, card_brand = NULL
    WHERE user_email = ${userEmail.toLowerCase()}
  `;
}

export async function saveSubscription(
  userEmail: string,
  userName: string,
  plan: string,
  savedCard?: SavedCard,
): Promise<void> {
  const db = sql();
  const lowerEmail = userEmail.toLowerCase();
  const now = new Date();
  const expiryDate = calcExpiryDate(plan, now);

  // Ensure expiry_date column exists (no-op if already present)
  await db`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expiry_date TEXT`;

  await db`
    INSERT INTO subscriptions
      (user_email, user_name, plan, purchased_at, expiry_date, card_last4, card_expiry, card_brand)
    VALUES (
      ${lowerEmail}, ${userName}, ${plan}, ${now.toISOString()},
      ${expiryDate ? expiryDate.toISOString() : null},
      ${savedCard?.last4 ?? null}, ${savedCard?.expiry ?? null}, ${savedCard?.brand ?? null}
    )
    ON CONFLICT (user_email) DO UPDATE SET
      user_name    = EXCLUDED.user_name,
      plan         = EXCLUDED.plan,
      purchased_at = EXCLUDED.purchased_at,
      expiry_date  = EXCLUDED.expiry_date,
      card_last4   = COALESCE(EXCLUDED.card_last4,  subscriptions.card_last4),
      card_expiry  = COALESCE(EXCLUDED.card_expiry, subscriptions.card_expiry),
      card_brand   = COALESCE(EXCLUDED.card_brand,  subscriptions.card_brand)
  `;
}
