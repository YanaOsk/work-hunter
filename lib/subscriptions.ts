import { getDb } from "./mongodb";

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

async function col() {
  const db = await getDb();
  return db.collection<Subscription>("subscriptions");
}

export async function getSubscription(userEmail: string): Promise<Subscription | null> {
  const c = await col();
  const doc = await c.findOne(
    { userEmail: userEmail.toLowerCase() },
    { projection: { _id: 0 } },
  );
  return doc as unknown as Subscription | null;
}

export async function cancelSubscription(userEmail: string): Promise<void> {
  const c = await col();
  await c.deleteOne({ userEmail: userEmail.toLowerCase() });
}

export async function saveSubscription(
  userEmail: string,
  userName: string,
  plan: string,
  savedCard?: SavedCard,
): Promise<void> {
  const c = await col();
  const $set: Record<string, unknown> = {
    userEmail: userEmail.toLowerCase(),
    userName,
    plan,
    purchasedAt: new Date().toISOString(),
  };
  if (savedCard) $set.savedCard = savedCard;
  await c.updateOne(
    { userEmail: userEmail.toLowerCase() },
    { $set },
    { upsert: true },
  );
}
