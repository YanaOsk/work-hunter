import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const opts = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, opts)
      .connect()
      .catch((err) => {
        // Reset so next request retries instead of reusing a failed promise
        global._mongoClientPromise = undefined;
        throw err;
      });
  }

  const client = await global._mongoClientPromise;
  return client.db("work-hunter");
}
