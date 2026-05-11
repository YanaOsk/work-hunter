#!/usr/bin/env python3
"""
Work Hunter — Scout + Gemini Evaluation Pipeline
─────────────────────────────────────────────────
Flow:
  1. Run each test profile through Scout (/api/agent/scout-eval)
  2. Send profile + job results to Google Gemini for QA review
  3. Email the developer a concise Hebrew report of what to fix and why
  4. NO code changes are made — email comes first

Usage:
  GEMINI_API_KEY=<key> python scripts/scout_gemini_eval.py
  or: GEMINI_API_KEY=<key> APP_URL=https://your-prod-url.vercel.app python scripts/scout_gemini_eval.py
"""

import json
import os
import smtplib
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from google import genai

# Force UTF-8 on Windows terminal
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Config ─────────────────────────────────────────────────────────────────────
APP_URL       = os.getenv("APP_URL", "http://localhost:3000")
AGENT_SECRET  = os.getenv("AGENT_SECRET", "wh_agent_ba266400b2512e4be84f3ba35a7c3705")
GEMINI_API_KEY = "AIzaSyAMjoUoYyKU8RrwlbrKPlV0dzf6wgDex8Y"
GEMINI_MODELS  = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"]

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "yanaoskin35@gmail.com"
SMTP_PASS = "jwcm unwc edbk tlaz"
REPORT_TO = "yanaoskin35@gmail.com"

# ── Test profiles ──────────────────────────────────────────────────────────────
# Each profile simulates a real user: what they'd type as CV/free text + constraints
TEST_PROFILES = [
    {
        "label": "רואת חשבון — חיפה — היברידי",
        "profileText": (
            "שם: רחל כהן, גיל 38. רואת חשבון עם 10 שנות ניסיון בחברות ייצור בצפון. "
            "תואר ראשון חשבונאות ומנהל עסקים, רישיון רו\"ח. "
            "גרה בחיפה. מחפשת עבודה היברידית — מקסימום 2 ימים משרד. "
            "שכר מינימום 15,000 ₪. לא מוכנה לנסוע דרומה מחיפה."
        ),
        "lang": "he",
    },
    {
        "label": "מפתח Full-Stack — remote בלבד — 3 שנות ניסיון",
        "profileText": (
            "שם: אייל לוי, גיל 27. מפתח Full-Stack, React + Node.js + PostgreSQL. "
            "3 שנות ניסיון בסטארטאפ SaaS. גר בתל אביב. "
            "מחפש remote בלבד — לא יבוא למשרד בכלל. "
            "שכר 25,000–30,000 ₪. מוכן לחברות ישראליות ובינלאומיות."
        ),
        "lang": "he",
    },
    {
        "label": "גננת מחפשת שינוי — ירושלים — ללא רכב",
        "profileText": (
            "שם: שרה מזרחי, גיל 42. גננת מוסמכת, 15 שנות ניסיון. "
            "עייפה מעבודה פיזית עם ילדים קטנים, רוצה תפקיד משרדי. "
            "חזקה בתיאום, ניהול לוחות זמנים, תקשורת עם הורים. "
            "גרה בירושלים, אין רכב — תחבורה ציבורית בלבד. "
            "שכר מינימום 9,000 ₪, פתוחה ללמוד."
        ),
        "lang": "he",
    },
    {
        "label": "אחות — מעבר לתחום רפואי אחר — תל אביב",
        "profileText": (
            "שם: לימור דוד, גיל 35. אחות רשומה עם 10 שנות ניסיון בבית חולים, מחלקת פנימית. "
            "עייפה ממשמרות לילה ולחץ בבית חולים. "
            "רוצה לעבור לעבודה בקליניקה פרטית, מרפאה, או תפקיד clinical coordinator. "
            "גרה בתל אביב. מחפשת משרה מלאה עם שעות קבועות. שכר מינימום 14,000 ₪."
        ),
        "lang": "he",
    },
    {
        "label": "מהנדס מכונות — מעבר קריירה לניהול פרויקטים",
        "profileText": (
            "שם: יואב כץ, גיל 44. מהנדס מכונות (BSc) עם 18 שנות ניסיון בתעשייה — "
            "תכנון, ייצור, QC. עבד ב-Elbit ו-IAI. "
            "רוצה לעבור לניהול פרויקטים — יש לו ניסיון ניהולי של 6 שנים. "
            "גר בחיפה. מוכן לנסוע לאזור הצפון. שכר מינימום 22,000 ₪."
        ),
        "lang": "he",
    },
    {
        "label": "מנהלת שיווק — עצמאית עוברת לשכירה",
        "profileText": (
            "שם: נועה שרון, גיל 32. 6 שנים כמנהלת שיווק עצמאית לעסקים קטנים — "
            "סושיאל מדיה, קמפיינים, אינסטגרם, Facebook Ads, דיוורים. "
            "רוצה להיות שכירה בחברה גדולה עם צוות. "
            "גרה בראשון לציון. מוכנה לנסוע לגוש דן. שכר מינימום 18,000 ₪."
        ),
        "lang": "he",
    },
    {
        "label": "טכנאי אלקטרוניקה — 50+ — פריפריה",
        "profileText": (
            "שם: משה בן-דוד, גיל 52. טכנאי אלקטרוניקה עם 25 שנות ניסיון — "
            "תיקון מכשירים, בדיקות, אלקטרוניקה תעשייתית. "
            "גר בקריית שמונה. רוצה עבודה באזור הצפון, מוכן לנסוע עד 40 ק\"מ. "
            "שכר מינימום 11,000 ₪."
        ),
        "lang": "he",
    },
    {
        "label": "עורכת דין — חופשת לידה — חצי משרה",
        "profileText": (
            "שם: מיכל גרין, גיל 36. עורכת דין מסחרי עם 8 שנות ניסיון במשרד בוטיק. "
            "חוזרת מחופשת לידה. מחפשת חצי משרה — מקסימום 5 שעות ביום. "
            "גרה ברמת גן. מוכנה לעבוד מהבית חלקית. שכר מינימום 12,000 ₪ לחצי משרה."
        ),
        "lang": "he",
    },
    {
        "label": "Data Analyst מתחיל — remote — ישראלי בחו\"ל",
        "profileText": (
            "שם: תום הלוי, גיל 25. בוגר תואר ראשון בסטטיסטיקה. "
            "6 חודשי ניסיון כ-Data Analyst Junior (סטאז'). "
            "יודע Python, SQL, Tableau. גר בברלין, אזרח ישראלי. "
            "מחפש remote only — עבודה בחברה ישראלית מגרמניה. "
            "שכר מינימום 15,000 ₪."
        ),
        "lang": "he",
    },
    {
        "label": "מלצר מנוסה — תל אביב — צמיחה לניהול",
        "profileText": (
            "שם: רון אברהמי, גיל 29. מלצר עם 7 שנות ניסיון במסעדות בתל אביב. "
            "שנתיים אחרונות כסו-שף / ראש צוות חדר האוכל. "
            "רוצה להתקדם לניהול מסעדה או F&B Manager. "
            "גר בתל אביב. גמיש בשעות. שכר מינימום 14,000 ₪."
        ),
        "lang": "he",
    },
]

# ── Gemini prompt ──────────────────────────────────────────────────────────────
def build_gemini_prompt(label: str, profile: str, jobs: list) -> str:
    if jobs:
        jobs_text = "\n".join(
            f"{i+1}. [{j.get('matchScore', '?')}%] {j.get('title', '?')} | {j.get('company', '?')} | {j.get('location', '?')}\n"
            f"   {j.get('snippet', '')[:200]}"
            for i, j in enumerate(jobs[:15])
        )
    else:
        jobs_text = "לא הוחזרו משרות."

    return f"""אתה מומחה QA לאיכות חיפוש עבודה ישראלי. תפקידך להעריך כמה Scout (מנוע החיפוש שלנו) ביצע טוב.

=== פרופיל שנשלח ל-Scout ===
תווית: {label}
{profile}

=== משרות שהוחזרו על-ידי Scout ===
{jobs_text}

=== משימת הערכה ===
1. MATCH QUALITY: האם המשרות מתאימות לפרופיל? ציין כל אי-התאמה ספציפית (תפקיד, שכר, מיקום, remote/onsite).
2. MISSED PATTERNS: מה היה צריך להיות בתוצאות אבל חסר?
3. FALSE POSITIVES: אילו תוצאות ברורות שגויות ולמה?
4. PROMPT FIXES: מה לשנות בפרומפטים של Scout? תן הצעות ספציפיות — לא כלליות.
5. PRIORITY: דרג את השינויים לפי חשיבות (גבוה / בינוני / נמוך).

כתוב בעברית. היה ביקורתי וספציפי — לא מנומס. אם יש בעיה קריטית, אמור זאת ישירות."""


# ── Gemini call ────────────────────────────────────────────────────────────────
_gemini_client = genai.Client(api_key=GEMINI_API_KEY)

def call_gemini(prompt: str) -> str:
    for model_name in GEMINI_MODELS:
        for attempt in range(3):
            try:
                response = _gemini_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                return response.text.strip()
            except Exception as e:
                msg = str(e)
                if "503" in msg or "UNAVAILABLE" in msg:
                    wait = 10 * (attempt + 1)
                    print(f"  {model_name} busy, retry in {wait}s...")
                    time.sleep(wait)
                elif "404" in msg or "NOT_FOUND" in msg:
                    print(f"  {model_name} not available, trying next...")
                    break
                else:
                    raise
    raise RuntimeError("All Gemini models failed")


# ── Scout call ─────────────────────────────────────────────────────────────────
def call_scout(profile_text: str, lang: str = "he") -> dict:
    url = f"{APP_URL}/api/agent/scout-eval"
    payload = json.dumps({"profileText": profile_text, "lang": lang}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AGENT_SECRET}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ── Email ──────────────────────────────────────────────────────────────────────
def send_email(subject: str, html_body: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"Work Hunter Scout QA <{SMTP_USER}>"
    msg["To"]      = REPORT_TO
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, REPORT_TO, msg.as_bytes())

    print(f"  ✉ Email sent to {REPORT_TO}")


def build_email_html(results: list[dict], run_ts: str) -> str:
    rows = ""
    for r in results:
        status_color = "#22c55e" if r["jobs_count"] > 0 else "#ef4444"
        rows += f"""
        <div style="border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:24px;background:#1a1a1a;">
          <h3 style="margin:0 0 8px;color:#fff;">{r["label"]}</h3>
          <p style="margin:0 0 4px;color:#aaa;font-size:13px;">
            משרות שהוחזרו: <span style="color:{status_color};font-weight:bold;">{r["jobs_count"]}</span>
          </p>
          <hr style="border-color:#333;margin:12px 0;"/>
          <div style="color:#e2e2e2;font-size:14px;line-height:1.7;white-space:pre-wrap;">{r["feedback"]}</div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"/><title>Scout QA Report</title></head>
<body style="background:#111;color:#e2e2e2;font-family:Arial,sans-serif;padding:24px;direction:rtl;">
  <h1 style="color:#fff;border-bottom:1px solid #333;padding-bottom:12px;">
    🔍 Scout QA — דוח פידבק Gemini
  </h1>
  <p style="color:#aaa;font-size:13px;">הופק: {run_ts} | דגמים שנבדקו: {len(results)}</p>
  <p style="background:#1e3a5f;border-radius:6px;padding:12px;color:#93c5fd;">
    ⚠️ זהו דוח מידע בלבד. <strong>אין שינויים בקוד</strong> — אישור נדרש לפני כל שינוי.
  </p>
  {rows}
  <p style="color:#555;font-size:12px;margin-top:32px;">Work Hunter Scout QA Pipeline · Gemini {GEMINI_MODELS[0]}</p>
</body>
</html>"""


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    run_ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"\n=== Scout + Gemini Eval — {run_ts} ===\n")
    print(f"  Scout endpoint: {APP_URL}/api/agent/scout-eval")
    print(f"  Gemini models:  {GEMINI_MODELS}")
    print(f"  Report to:      {REPORT_TO}\n")

    results = []
    for profile in TEST_PROFILES:
        label = profile["label"]
        print(f"▶ [{label}]")

        # 1. Run Scout
        print("  → Calling Scout...", end="", flush=True)
        try:
            scout_data = call_scout(profile["profileText"], profile.get("lang", "he"))
            jobs = scout_data.get("jobs", [])
            print(f" {len(jobs)} jobs returned")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            print(f" FAILED ({e.code}): {err_body[:200]}")
            results.append({"label": label, "jobs_count": 0, "feedback": f"Scout error {e.code}: {err_body[:300]}"})
            continue
        except Exception as e:
            print(f" FAILED: {e}")
            results.append({"label": label, "jobs_count": 0, "feedback": f"Scout error: {e}"})
            continue

        # 2. Send to Gemini
        print("  → Asking Gemini for feedback...", end="", flush=True)
        try:
            gemini_prompt = build_gemini_prompt(label, profile["profileText"], jobs)
            feedback = call_gemini(gemini_prompt)
            print(" done")
        except Exception as e:
            print(f" FAILED: {e}")
            feedback = f"Gemini error: {e}"

        results.append({"label": label, "jobs_count": len(jobs), "feedback": feedback})
        print("\n--- Gemini Feedback ---")
        print(feedback)
        print("-----------------------\n")
        time.sleep(2)  # avoid Gemini rate limit

    # 3. Send email
    print("→ Sending email report...", end="", flush=True)
    html = build_email_html(results, run_ts)
    send_email(f"Scout QA Report — {run_ts} ({len(results)} profiles)", html)

    print("\nDone. No code changes were made — review the email and approve before changing anything.\n")


if __name__ == "__main__":
    main()
