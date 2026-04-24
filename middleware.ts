export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/advisor/:path*", "/cv-builder/:path*", "/profile/:path*", "/profile"],
};
