import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const opts = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  tls: true,
  tlsAllowInvalidCertificates: false,
};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  // Reuse the same connection promise across all invocations (hot or cold)
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, opts).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db("work-hunter");
}
