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
    <p style="color:rgba(240,240,245,0.65);line-height:1.6">ברוך הבא ל-Work Hunter — הסקאוט האישי שלך לקריירה.<br>אנחנו כאן כדי לעזור לך למצוא את המשרה הבאה.</p>
    <a href="${appUrl}" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">התחל/י עכשיו ←</a>
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
      <div style="color:rgba(240,240,245,0.45);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-weight:600">המסלול שלך</div>
      <div style="color:#f0f0f5;font-size:26px;font-weight:800">${plan.nameHe}</div>
      <div style="color:#a855f7;font-size:15px;font-weight:600;margin-top:4px">${priceStr}</div>
    </div>

    <div>
      <div style="color:rgba(240,240,245,0.45);font-size:12px;text-transform:uppercase;letter-spacing:1.2px;font-weight:600;margin-bottom:14px">
        מעכשיו הכלים הזמינים לך:
      </div>
      <table style="width:100%;border-collapse:collapse"><tbody>${featuresHtml}</tbody></table>
    </div>
  </div>

  <div style="text-align:center;margin-bottom:32px">
    <a href="${appUrl}/advisor?profileId=default-advisor"
       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-weight:700;font-size:16px;padding:16px 40px;border-radius:14px;text-decoration:none">
      התחל/י עכשיו ←
    </a>
  </div>

  <div style="text-align:center;color:rgba(240,240,245,0.22);font-size:12px;line-height:1.8">
    <p style="margin:0">Work Hunter — הסקאוט האישי שלך לקריירה</p>
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
