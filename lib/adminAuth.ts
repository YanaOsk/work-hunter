import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const ADMIN_EMAIL = "yanaoskin35@gmail.com";

const secure = process.env.NODE_ENV === "production";

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
  callbacks: {
    async signIn({ user }) {
      return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: "admin-next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure },
    },
    callbackUrl: {
      name: "admin-next-auth.callback-url",
      options: { sameSite: "lax", path: "/", secure },
    },
    csrfToken: {
      name: "admin-next-auth.csrf-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
