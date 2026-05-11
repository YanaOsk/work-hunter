export const maxDuration = 30;
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { AdvisorState } from "@/lib/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function buildEmailHtml(state: AdvisorState, lang: string): string {
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";
  const name = state.userProfile.parsedData?.name || (isHe ? "שלום" : "Hello");
  const { diagnosis, direction, cvReview, linkedIn, strategy, chosenPath } = state;

  const rows: string[] = [];

  if (diagnosis) {
    rows.push(`<tr><td style="padding:16px 0;border-bottom:1px solid #1e293b;">
      <h3 style="margin:0 0 8px;color:#a78bfa;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "אבחון אישיותי" : "Personality Diagnosis"}
      </h3>
      ${diagnosis.mbtiType ? `<span style="background:#7c3aed22;color:#a78bfa;padding:2px 10px;border-radius:20px;font-size:13px;margin-inline-end:6px;">${diagnosis.mbtiType}</span>` : ""}
      ${diagnosis.hollandCode ? `<span style="background:#05966922;color:#34d399;padding:2px 10px;border-radius:20px;font-size:13px;">${diagnosis.hollandCode}</span>` : ""}
      <p style="margin:10px 0 0;color:#cbd5e1;font-size:14px;line-height:1.6;">${diagnosis.summary || ""}</p>
      ${diagnosis.topRoles?.length ? `<p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">${isHe ? "תפקידים מומלצים:" : "Top roles:"} ${diagnosis.topRoles.join(", ")}</p>` : ""}
    </td></tr>`);
  }

  if (chosenPath && direction) {
    const label = chosenPath === "employee" ? (isHe ? "שכיר" : "Employee") : chosenPath === "entrepreneur" ? (isHe ? "עצמאי/יזם" : "Entrepreneur") : (isHe ? "לימודים" : "Studies");
    rows.push(`<tr><td style="padding:16px 0;border-bottom:1px solid #1e293b;">
      <h3 style="margin:0 0 8px;color:#34d399;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "כיוון נבחר" : "Chosen Path"}
      </h3>
      <p style="margin:0;color:#f1f5f9;font-size:16px;font-weight:bold;">${label}</p>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">${direction.rationale || ""}</p>
    </td></tr>`);
  }

  if (diagnosis?.weekOneSteps?.length) {
    const steps = diagnosis.weekOneSteps.map((s, i) => `<li style="margin:6px 0;color:#cbd5e1;font-size:14px;">${i + 1}. ${s}</li>`).join("");
    rows.push(`<tr><td style="padding:16px 0;border-bottom:1px solid #1e293b;">
      <h3 style="margin:0 0 8px;color:#fbbf24;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "השבוע הראשון — 3 צעדים" : "Your First Week — 3 Actions"}
      </h3>
      <ol style="margin:0;padding-inline-start:20px;">${steps}</ol>
    </td></tr>`);
  }

  if (cvReview) {
    rows.push(`<tr><td style="padding:16px 0;border-bottom:1px solid #1e293b;">
      <h3 style="margin:0 0 8px;color:#60a5fa;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "ציון קורות חיים" : "CV Score"}
      </h3>
      <p style="margin:0;color:#f1f5f9;font-size:28px;font-weight:bold;">${cvReview.overallScore}<span style="font-size:14px;color:#94a3b8;">/100</span></p>
    </td></tr>`);
  }

  if (linkedIn) {
    const headlineRow = linkedIn.headline ? `<p style="margin:0 0 6px;color:#f1f5f9;font-size:15px;font-weight:bold;">${linkedIn.headline}</p>` : "";
    const aboutRow = linkedIn.about ? `<p style="margin:0;color:#cbd5e1;font-size:13px;line-height:1.6;">${linkedIn.about.slice(0, 300)}${linkedIn.about.length > 300 ? "..." : ""}</p>` : "";
    const skillsRow = linkedIn.skills?.length ? `<p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">${isHe ? "כישורים:" : "Skills:"} ${linkedIn.skills.join(", ")}</p>` : "";
    rows.push(`<tr><td style="padding:16px 0;border-bottom:1px solid #1e293b;">
      <h3 style="margin:0 0 8px;color:#38bdf8;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "פרופיל LinkedIn" : "LinkedIn Profile"}
      </h3>
      ${headlineRow}${aboutRow}${skillsRow}
    </td></tr>`);
  }

  if (strategy) {
    const topLineRow = strategy.topLine ? `<p style="margin:0 0 8px;color:#f1f5f9;font-size:15px;font-style:italic;line-height:1.7;">"${strategy.topLine}"</p>` : "";
    const companiesRow = strategy.targetCompanies?.length ? `<p style="margin:0;color:#94a3b8;font-size:12px;">${isHe ? "חברות יעד:" : "Target companies:"} ${strategy.targetCompanies.slice(0, 3).map((c) => c.name).join(", ")}</p>` : "";
    const groupsRow = strategy.facebookGroups?.length ? `<p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">${isHe ? "קבוצות פייסבוק:" : "Facebook groups:"} ${strategy.facebookGroups.slice(0, 3).join(", ")}</p>` : "";
    const tipsRows = strategy.hiddenMarketTips?.length ? `<ul style="margin:8px 0 0;padding-inline-start:18px;">${strategy.hiddenMarketTips.slice(0, 3).map((t) => `<li style="color:#cbd5e1;font-size:13px;margin:3px 0;">${t}</li>`).join("")}</ul>` : "";
    rows.push(`<tr><td style="padding:16px 0;">
      <h3 style="margin:0 0 8px;color:#f59e0b;font-size:13px;text-transform:uppercase;letter-spacing:1px;">
        ${isHe ? "אסטרטגיית חיפוש עבודה" : "Job Search Strategy"}
      </h3>
      ${topLineRow}${companiesRow}${groupsRow}${tipsRows}
    </td></tr>`);
  }

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:28px;color:#f1f5f9;">${isHe ? "תוכנית הקריירה שלך" : "Your Career Plan"}</h1>
      <p style="margin:8px 0 0;color:#64748b;font-size:14px;">${isHe ? `${name}, כל מה שבנינו ביחד — במקום אחד` : `${name}, everything we built together — in one place`}</p>
    </div>
    <div style="background:#1e293b;border-radius:16px;padding:24px;">
      <table style="width:100%;border-collapse:collapse;">${rows.join("")}</table>
    </div>
    <p style="text-align:center;color:#334155;font-size:12px;margin-top:24px;">Work Hunter · ${isHe ? "נבנה עם ❤️ בישראל" : "Built with ❤️ in Israel"}</p>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { toEmail, advisorState, lang } = (await request.json()) as {
      toEmail: string;
      advisorState: AdvisorState;
      lang?: string;
    };

    if (!toEmail || !advisorState) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const resolvedLang = lang ?? "he";
    const isHe = resolvedLang === "he";
    const name = advisorState.userProfile.parsedData?.name || "";

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      // Demo mode — pretend it was sent
      return NextResponse.json({ sent: true, demo: true });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Work Hunter" <${smtpUser}>`,
      to: toEmail,
      subject: isHe
        ? `${name ? `${name}, ` : ""}תוכנית הקריירה שלך מוכנה ✨`
        : `${name ? `${name}, ` : ""}Your career plan is ready ✨`,
      html: buildEmailHtml(advisorState, resolvedLang),
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[send-summary] failed:", String(error));
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
