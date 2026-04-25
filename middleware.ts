import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/advisor/:path*", "/cv-builder/:path*", "/profile/:path*", "/profile"],
};
