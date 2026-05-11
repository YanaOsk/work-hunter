// Auth is enforced in each protected page component via useSession
// to avoid Edge Runtime JWT parsing failures in production.
export {};
export const config = { matcher: [] };
