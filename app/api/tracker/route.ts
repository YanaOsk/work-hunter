import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { JobApplication } from "@/lib/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = sql();
    const rows = await db`
      SELECT id, job, status, saved_at, applied_at, notes, cover_letter
      FROM job_applications
      WHERE user_id = ${session.user.email}
      ORDER BY saved_at DESC
    `;
    const applications: JobApplication[] = rows.map((r) => ({
      id: r.id as string,
      job: r.job as JobApplication["job"],
      status: r.status as JobApplication["status"],
      savedAt: r.saved_at as string,
      appliedAt: r.applied_at as string | undefined,
      notes: r.notes as string | undefined,
      coverLetter: r.cover_letter as string | undefined,
    }));
    return NextResponse.json({ applications });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let applications: JobApplication[];
  try {
    const body = await request.json();
    applications = body.applications;
    if (!Array.isArray(applications)) throw new Error("Invalid");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const db = sql();
    for (const app of applications) {
      await db`
        INSERT INTO job_applications (user_id, id, job, status, saved_at, applied_at, notes, cover_letter)
        VALUES (
          ${session.user.email},
          ${app.id},
          ${JSON.stringify(app.job)},
          ${app.status},
          ${app.savedAt},
          ${app.appliedAt ?? null},
          ${app.notes ?? null},
          ${app.coverLetter ?? null}
        )
        ON CONFLICT (user_id, id) DO UPDATE SET
          job = EXCLUDED.job,
          status = EXCLUDED.status,
          saved_at = EXCLUDED.saved_at,
          applied_at = EXCLUDED.applied_at,
          notes = EXCLUDED.notes,
          cover_letter = EXCLUDED.cover_letter
      `;
    }

    const currentIds = applications.map((a) => a.id);
    if (currentIds.length > 0) {
      await db`
        DELETE FROM job_applications
        WHERE user_id = ${session.user.email}
        AND id != ALL(${currentIds})
      `;
    } else {
      await db`DELETE FROM job_applications WHERE user_id = ${session.user.email}`;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
