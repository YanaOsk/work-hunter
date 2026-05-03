export const maxDuration = 30;
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { JobResult } from "@/lib/types";

function buildEmailHtml(jobs: JobResult[], lang: string): string {
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  const rows = jobs
    .slice(0, 20)
    .map((job, i) => {
      const scoreColor = job.matchScore >= 85 ? "#34d399" : job.matchScore >= 70 ? "#fbbf24" : "#f87171";
      const reasons = (job.matchReasons ?? [])
        .slice(0, 3)
        .map((r) => `<li style="margin:3px 0;color:#cbd5e1;font-size:12px;">✓ ${r}</li>`)
        .join("");
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #1e293b;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div style="flex:1;min-width:0;">
                <p style="margin:0 0 2px;color:#94a3b8;font-size:11px;">#${i + 1} · ${job.source}</p>
                <h3 style="margin:0 0 3px;color:#f1f5f9;font-size:15px;font-weight:bold;">${job.title}</h3>
                <p style="margin:0 0 6px;color:#a78bfa;font-size:13px;">${job.company} · ${job.location}</p>
                ${job.salaryRange ? `<p style="margin:0 0 6px;color:#34d399;font-size:12px;">💰 ${job.salaryRange}</p>` : ""}
                ${reasons ? `<ul style="margin:6px 0 0;padding-inline-start:0;list-style:none;">${reasons}</ul>` : ""}
              </div>
              <div style="flex-shrink:0;text-align:center;">
                <div style="background:${scoreColor}22;border:1px solid ${scoreColor}55;border-radius:20px;padding:4px 10px;color:${scoreColor};font-size:13px;font-weight:bold;white-space:nowrap;">${job.matchScore}%</div>
              </div>
            </div>
            <a href="${job.url}" style="display:inline-block;margin-top:10px;background:#7c3aed;color:white;text-decoration:none;font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;">
              ${isHe ? "צפה במשרה →" : "View Job →"}
            </a>
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="margin:0;font-size:26px;color:#f1f5f9;">
        ${isHe ? `Scout מצא לך ${jobs.length} משרות 🎯` : `Scout found ${jobs.length} jobs for you 🎯`}
      </h1>
      <p style="margin:8px 0 0;color:#64748b;font-size:13px;">
        ${isHe ? "ממוינות לפי ציון התאמה" : "Ranked by AI match score"}
      </p>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:20px 24px;">
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>
    <p style="text-align:center;color:#334155;font-size:11px;margin-top:20px;">
      Work Hunter · ${isHe ? "נבנה עם ❤️ בישראל" : "Built with ❤️ in Israel"}
    </p>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { toEmail, jobs, lang } = (await request.json()) as {
      toEmail: string;
      jobs: JobResult[];
      lang?: string;
    };

    if (!toEmail || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const resolvedLang = lang ?? "he";
    const isHe = resolvedLang === "he";

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json({ sent: true, demo: true });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Work Hunter Scout" <${smtpUser}>`,
      to: toEmail,
      subject: isHe
        ? `Scout מצא ${jobs.length} משרות מותאמות לך ✨`
        : `Scout found ${jobs.length} matching jobs for you ✨`,
      html: buildEmailHtml(jobs, resolvedLang),
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[scout/send-results] failed:", String(error));
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
