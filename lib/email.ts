import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendWelcomeEmail(name: string, email: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;

  const firstName = name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ברוכים הבאים ל-Work Hunter</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);border-radius:16px;padding:14px 28px;">
                <span style="color:#a78bfa;font-size:22px;font-weight:700;letter-spacing:-0.5px;">⚡ Work Hunter</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:24px;padding:40px 36px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                היי ${firstName}! 👋
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:rgba(255,255,255,0.55);line-height:1.6;">
                שמחים שהצטרפת ל-Work Hunter. עכשיו כל הכלים שצריך כדי למצוא את הצעד הבא בקריירה שלך — כאן, בשבילך.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:rgba(255,255,255,0.08);margin-bottom:28px;"></div>

              <!-- What you get -->
              <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">מה מחכה לך</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;background:rgba(124,58,237,0.2);border-radius:12px;text-align:center;vertical-align:middle;font-size:18px;">🤖</td>
                        <td style="padding-right:14px;">
                          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">ייעוץ קריירה אישי</p>
                          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">שיחה עם Scout, המדריך החכם שלך — שמבין את הפרופיל שלך</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;background:rgba(16,185,129,0.2);border-radius:12px;text-align:center;vertical-align:middle;font-size:18px;">🎯</td>
                        <td style="padding-right:14px;">
                          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">חיפוש משרות ממוקד</p>
                          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">תוצאות שמתאימות בדיוק למה שאתה מחפש — לא רשימה אקראית</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;background:rgba(59,130,246,0.2);border-radius:12px;text-align:center;vertical-align:middle;font-size:18px;">📄</td>
                        <td style="padding-right:14px;">
                          <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;">בונה קורות חיים חכם</p>
                          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">עיצובים מקצועיים שבולטים, עם ייצוא ל-PDF בלחיצה אחת</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="margin-top:32px;text-align:center;">
                <a href="${process.env.NEXTAUTH_URL ?? "https://workhunter.app"}/advisor?profileId=default-advisor"
                   style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">
                  התחל עכשיו →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);line-height:1.8;">
                קיבלת מייל זה כי נרשמת ל-Work Hunter עם הכתובת ${email}.<br/>
                © 2026 Work Hunter. כל הזכויות שמורות.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Work Hunter" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: `ברוכים הבאים ל-Work Hunter, ${firstName}! 🎉`,
    html,
  });
}

export async function sendAdminNotificationEmail(newUserName: string, newUserEmail: string) {
  const adminEmail = process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !adminEmail) return;

  const html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.35);border-radius:14px;padding:12px 24px;">
                <span style="color:#a78bfa;font-size:18px;font-weight:700;">⚡ Work Hunter Admin</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:20px;padding:32px;">
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;">משתמש חדש נרשם 🎉</p>
              <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.45);">הגיע יוזר חדש ל-Work Hunter</p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.25);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:10px;">
                      <span style="font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">שם</span><br/>
                      <span style="font-size:16px;font-weight:600;color:#ffffff;">${newUserName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;border-top:1px solid rgba(255,255,255,0.07);padding-top:10px;">
                      <span style="font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">אימייל</span><br/>
                      <span style="font-size:16px;font-weight:600;color:#a78bfa;">${newUserEmail}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px;">
                      <span style="font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">נרשם בתאריך</span><br/>
                      <span style="font-size:15px;color:rgba(255,255,255,0.7);">${new Date().toLocaleString("he-IL")}</span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;">
                <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin"
                   style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">
                  פתח אדמין פאנל →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Work Hunter" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `👤 משתמש חדש: ${newUserName} (${newUserEmail})`,
    html,
  });
}
