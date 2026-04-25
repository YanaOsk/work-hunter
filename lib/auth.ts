import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser } from "@/lib/users";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await verifyUser(credentials.email, credentials.password);
          console.log("[authorize]", credentials.email, "→", user ? "OK" : "null");
          return user;
        } catch (err) {
          console.error("[authorize] error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const { getDb } = await import("./mongodb");
          const db = await getDb();
          const email = user.email.toLowerCase();
          const existing = await db.collection("google_accounts").findOne({ email });
          if (!existing) {
            token.isNewUser = true;
            await db.collection("google_accounts").insertOne({
              email,
              name: user.name ?? "",
              createdAt: new Date().toISOString(),
            });
          } else {
            token.isNewUser = false;
          }
        } catch {
          // DB unavailable — treat as returning user, send to profile
          token.isNewUser = false;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (typeof token.isNewUser === "boolean") {
        session.user.isNewUser = token.isNewUser;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
