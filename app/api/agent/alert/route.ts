import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sendMonitorAlertEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issues } = (await req.json()) as { issues?: string[] };
  if (!issues?.length) {
    return NextResponse.json({ error: "issues array required" }, { status: 400 });
  }

  await sendMonitorAlertEmail(issues);
  return NextResponse.json({ sent: true });
}
