import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  const opts = { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 };

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, opts);
    }
    return global._mongoClient;
  }

  return new MongoClient(uri, opts);
}

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!_db) {
    const client = getClient();
    await client.connect();
    _db = client.db("work-hunter");
  }
  return _db;
}
