export function validateAgentRequest(req: Request): boolean {
  const secret = process.env.AGENT_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
