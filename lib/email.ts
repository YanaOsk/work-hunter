import nodemailer from "nodemailer";
import type { Plan } from "./plans";

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(" ")[0] ?? "";
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;color:#f0f0f5;direction:rtl">
<div style="max-width:520px;margin:0 auto;padding:40px 16px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter</div>
  </div>
  <div style="background:#1a1730;border:1px solid rgba(168,85,247,0.25);border-radius:24px;padding:36px 32px">
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800">שלום ${firstName ? firstName : ""}! 👋</h1>
    <p style="color:rgba(240,240,245,0.65);line-height:1.6">ברוכים הבאים ל-Work Hunter — הסקאוט האישי שלכם לקריירה.<br>אנחנו כאן כדי לעזור לכם למצוא את המשרה הבאה.</p>
    <a href="${appUrl}" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">התחילו עכשיו ←</a>
  </div>
</div></body></html>`;
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: email,
    subject: "ברוך הבא ל-Work Hunter! 🎯",
    html,
  });
}

export async function sendAdminNotificationEmail(name: string, email: string): Promise<void> {
  const adminEmail = process.env.SMTP_USER ?? process.env.SMTP_FROM;
  if (!adminEmail) return;
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: adminEmail,
    subject: `[Work Hunter] משתמש חדש: ${name}`,
    text: `משתמש חדש נרשם:\nשם: ${name}\nאימייל: ${email}\nזמן: ${new Date().toISOString()}`,
  });
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;color:#f0f0f5;direction:rtl">
<div style="max-width:520px;margin:0 auto;padding:40px 16px">
  <div style="text-align:center;margin-bottom:24px">
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter</div>
  </div>
  <div style="background:#1a1730;border:1px solid rgba(168,85,247,0.25);border-radius:24px;padding:36px 32px">
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800">איפוס סיסמה 🔑</h1>
    <p style="color:rgba(240,240,245,0.65);line-height:1.6;margin:0 0 24px">קיבלנו בקשה לאיפוס הסיסמה שלכם.<br>לחצו על הכפתור כדי לאפס את הסיסמה — הקישור תקף לשעה אחת.</p>
    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">אפסו סיסמה ←</a>
    <p style="color:rgba(240,240,245,0.35);font-size:12px;margin-top:24px">אם לא ביקשת איפוס סיסמה, אפשר להתעלם ממייל זה.</p>
  </div>
</div></body></html>`;
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: email,
    subject: "איפוס סיסמה — Work Hunter",
    html,
  });
}

export const ADMIN_EMAIL = "yanaoskin35@gmail.com";

export async function sendAdminPurchaseNotificationEmail(
  userName: string,
  userEmail: string,
  planId: string,
  planNameHe: string,
  price: string,
): Promise<void> {
  const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: ADMIN_EMAIL,
    subject: `💰 רכישה חדשה: ${planNameHe} — ${userName}`,
    html: `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;color:#f0f0f5;direction:rtl">
<div style="max-width:480px;margin:0 auto;padding:40px 16px">
  <div style="text-align:center;margin-bottom:20px">
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter — Admin</div>
  </div>
  <div style="background:#1a1730;border:1px solid rgba(16,185,129,0.35);border-radius:20px;padding:32px">
    <div style="font-size:36px;text-align:center;margin-bottom:16px">💰</div>
    <h1 style="margin:0 0 20px;font-size:20px;font-weight:800;text-align:center">רכישה חדשה!</h1>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:9px 0;color:rgba(240,240,245,0.5);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.07)">שם</td><td style="padding:9px 0;font-weight:600;font-size:14px;text-align:left">${userName}</td></tr>
      <tr><td style="padding:9px 0;color:rgba(240,240,245,0.5);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.07)">מייל</td><td style="padding:9px 0;font-weight:600;font-size:14px;text-align:left">${userEmail}</td></tr>
      <tr><td style="padding:9px 0;color:rgba(240,240,245,0.5);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.07)">מסלול</td><td style="padding:9px 0;font-weight:700;font-size:14px;color:#a855f7;text-align:left">${planNameHe} (${planId})</td></tr>
      <tr><td style="padding:9px 0;color:rgba(240,240,245,0.5);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.07)">מחיר</td><td style="padding:9px 0;font-weight:700;font-size:14px;color:#10b981;text-align:left">${price}</td></tr>
      <tr><td style="padding:9px 0;color:rgba(240,240,245,0.5);font-size:13px">זמן</td><td style="padding:9px 0;font-size:13px;text-align:left">${now}</td></tr>
    </table>
  </div>
</div></body></html>`,
  });
}

export async function sendPurchaseConfirmationEmail(
  toEmail: string,
  toName: string,
  plan: Plan,
): Promise<void> {
  const firstName = toName?.split(" ")[0] ?? "";
  const priceStr =
    plan.price === 0 ? "חינם" : `${plan.displayPrice}${plan.per ? ` ${plan.per}` : ""}`;

  const featuresHtml = plan.featuresHe
    .map(
      (f) => `<tr><td style="padding:7px 0;color:rgba(240,240,245,0.85);font-size:15px">
        <span style="color:#10b981;margin-left:10px;font-weight:700">✓</span>${f}
      </td></tr>`,
    )
    .join("");

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#f0f0f5">
<div style="max-width:560px;margin:0 auto;padding:40px 16px">

  <div style="text-align:center;margin-bottom:36px">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#a855f7,#ec4899,#10b981);margin-bottom:10px">
      <span style="font-size:26px">🎯</span>
    </div>
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter</div>
  </div>

  <div style="background:#1a1730;border:1px solid rgba(168,85,247,0.25);border-radius:24px;padding:36px 32px;margin-bottom:20px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:44px;margin-bottom:14px">🎉</div>
      <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#f0f0f5">
        ${firstName ? `שלום ${firstName},` : "שלום!"}
      </h1>
      <p style="margin:0;color:rgba(240,240,245,0.65);font-size:16px;line-height:1.6">
        איזה כיף שרכשת את המסלול<br>
        <strong style="color:#a855f7;font-size:19px">${plan.nameHe}</strong>!
      </p>
    </div>

    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(16,185,129,0.12));border:1px solid rgba(168,85,247,0.35);border-radius:16px;padding:18px 24px;margin-bottom:28px;text-align:center">
      <div style="color:rgba(240,240,245,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-weight:600">המסלול שלכם</div>
      <div style="color:#f0f0f5;font-size:26px;font-weight:800">${plan.nameHe}</div>
      <div style="color:#a855f7;font-size:15px;font-weight:600;margin-top:4px">${priceStr}</div>
    </div>

    <div>
      <div style="color:rgba(240,240,245,0.45);font-size:12px;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;margin-bottom:14px">
        מעכשיו הכלים הזמינים לכם:
      </div>
      <table style="width:100%;border-collapse:collapse"><tbody>${featuresHtml}</tbody></table>
    </div>
  </div>

  <div style="text-align:center;margin-bottom:32px">
    <a href="${appUrl}/advisor?profileId=default-advisor"
       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-weight:700;font-size:16px;padding:16px 40px;border-radius:14px;text-decoration:none">
      התחילו עכשיו ←
    </a>
  </div>

  <div style="text-align:center;color:rgba(240,240,245,0.22);font-size:12px;line-height:1.8">
    <p style="margin:0">Work Hunter — הסקאוט האישי שלכם לקריירה</p>
    <p style="margin:0">© 2026 Work Hunter. כל הזכויות שמורות.</p>
  </div>
</div>
</body></html>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: toEmail,
    subject: `🎉 ברוך הבא למסלול ${plan.nameHe}! | Work Hunter`,
    html,
  });
}

export async function sendMonitorAlertEmail(issues: string[]): Promise<void> {
  const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  const issuesHtml = issues
    .map((i) => `<li style="margin-bottom:8px;color:#f87171">${i}</li>`)
    .join("");
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: ADMIN_EMAIL,
    subject: `[Work Hunter] התראת מערכת — ${issues.length} בעיה(ות) זוהו`,
    html: `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;color:#f0f0f5;direction:rtl">
<div style="max-width:520px;margin:0 auto;padding:40px 16px">
  <div style="text-align:center;margin-bottom:20px">
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter — Monitor</div>
  </div>
  <div style="background:#1a1730;border:1px solid rgba(248,113,113,0.4);border-radius:20px;padding:32px">
    <div style="font-size:36px;text-align:center;margin-bottom:12px">🚨</div>
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;text-align:center">זוהו בעיות במערכת</h2>
    <p style="color:rgba(240,240,245,0.5);font-size:13px;margin:0 0 20px;text-align:center">${now}</p>
    <ul style="padding-right:18px;margin:0">${issuesHtml}</ul>
  </div>
</div></body></html>`,
  });
}

export interface DailyStats {
  users: { total: number; newToday: number; newThisWeek: number; premium: number };
  analytics: { sessionsToday: number };
  revenue: { note: string };
  timestamp: string;
}

export async function sendDailyReportEmail(stats: DailyStats): Promise<void> {
  const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "Work Hunter <noreply@workhunter.com>",
    to: ADMIN_EMAIL,
    subject: `[Work Hunter] דוח יומי — ${new Date().toLocaleDateString("he-IL")}`,
    html: `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0e1a;font-family:'Segoe UI',Arial,sans-serif;color:#f0f0f5;direction:rtl">
<div style="max-width:520px;margin:0 auto;padding:40px 16px">
  <div style="text-align:center;margin-bottom:20px">
    <div style="color:#a855f7;font-weight:800;font-size:18px">Work Hunter — דוח יומי</div>
  </div>
  <div style="background:#1a1730;border:1px solid rgba(168,85,247,0.25);border-radius:20px;padding:32px">
    <p style="color:rgba(240,240,245,0.4);font-size:12px;margin:0 0 24px;text-align:center">${now}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td colspan="2" style="padding:6px 0 10px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:rgba(240,240,245,0.35)">משתמשים</td></tr>
      <tr><td style="padding:8px 0;color:rgba(240,240,245,0.55);border-bottom:1px solid rgba(255,255,255,0.06)">סה"כ</td><td style="padding:8px 0;font-weight:700;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">${stats.users.total}</td></tr>
      <tr><td style="padding:8px 0;color:rgba(240,240,245,0.55);border-bottom:1px solid rgba(255,255,255,0.06)">חדשים היום</td><td style="padding:8px 0;font-weight:700;color:#10b981;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">+${stats.users.newToday}</td></tr>
      <tr><td style="padding:8px 0;color:rgba(240,240,245,0.55);border-bottom:1px solid rgba(255,255,255,0.06)">חדשים השבוע</td><td style="padding:8px 0;font-weight:700;color:#10b981;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">+${stats.users.newThisWeek}</td></tr>
      <tr><td style="padding:8px 0;color:rgba(240,240,245,0.55);border-bottom:1px solid rgba(255,255,255,0.06)">פרימיום</td><td style="padding:8px 0;font-weight:700;color:#a855f7;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">${stats.users.premium}</td></tr>
      <tr><td colspan="2" style="padding:18px 0 10px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:rgba(240,240,245,0.35)">תנועה</td></tr>
      <tr><td style="padding:8px 0;color:rgba(240,240,245,0.55)">סשנים היום</td><td style="padding:8px 0;font-weight:700;text-align:left">${stats.analytics.sessionsToday}</td></tr>
      <tr><td colspan="2" style="padding:18px 0 10px;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:rgba(240,240,245,0.35)">הכנסות</td></tr>
      <tr><td colspan="2" style="padding:8px 0;color:rgba(240,240,245,0.4);font-size:13px">${stats.revenue.note}</td></tr>
    </table>
  </div>
</div></body></html>`,
  });
}
