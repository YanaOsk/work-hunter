import { NextRequest, NextResponse } from "next/server";
import { validateAgentRequest } from "@/lib/agentAuth";
import { sql } from "@/lib/db";
import { sendMonitorAlertEmail } from "@/lib/email";

export const maxDuration = 30;

const NEON_FREE_TIER_BYTES = 512 * 1024 * 1024; // 0.5 GB
const WARN_AT_PERCENT = 70;

export async function GET(req: NextRequest) {
  if (!validateAgentRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  const issues: string[] = [];

  const [sizeRes, tablesRes, connectionsRes] = await Promise.all([
    db`SELECT pg_database_size(current_database()) AS bytes`,
    db`
      SELECT relname AS table_name,
             n_live_tup AS row_count,
             pg_total_relation_size(relid) AS size_bytes
      FROM pg_stat_user_tables
      ORDER BY size_bytes DESC
      LIMIT 10
    `,
    db`SELECT count(*) AS cnt FROM pg_stat_activity WHERE state = 'active'`,
  ]);

  const dbBytes = Number(sizeRes[0]?.bytes ?? 0);
  const dbMB = +(dbBytes / 1024 / 1024).toFixed(1);
  const usagePercent = +((dbBytes / NEON_FREE_TIER_BYTES) * 100).toFixed(1);
  const activeConnections = Number(connectionsRes[0]?.cnt ?? 0);

  if (usagePercent >= WARN_AT_PERCENT) {
    issues.push(`DB מנצל ${usagePercent}% מה-free tier של Neon (${dbMB}MB / 512MB)`);
  }
  if (activeConnections > 8) {
    issues.push(`${activeConnections} חיבורים פעילים ל-DB — גבוה מהרגיל`);
  }

  const tables = tablesRes.map((r) => ({
    name: r.table_name,
    rows: Number(r.row_count),
    sizeMB: +((Number(r.size_bytes) / 1024 / 1024)).toFixed(2),
  }));

  if (issues.length > 0) {
    sendMonitorAlertEmail(issues).catch(console.error);
  }

  return NextResponse.json({
    ok: issues.length === 0,
    issues,
    database: {
      sizeMB: dbMB,
      usagePercent,
      activeConnections,
      freeTierLimitMB: 512,
    },
    tables,
    timestamp: new Date().toISOString(),
  });
}
