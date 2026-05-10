import json
import urllib.request
import re
import sys

# Read the prompts file
with open("lib/prompts.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Extract CHAT_SYSTEM_PROMPT between backtick delimiters
start_marker = "export const CHAT_SYSTEM_PROMPT = `"
end_marker = "export const MATCH_ANALYSIS_PROMPT"

start_idx = content.index(start_marker) + len(start_marker)
end_idx = content.index(end_marker)
chat_prompt = content[start_idx:end_idx].strip().rstrip("`").rstrip(";").strip()

review_request = f"""אתה מבקר מוצרים דיגיטליים ישראלי. הנה גרסה סופית (v3) של System Prompt של Scout לאחר שני סבבי שיפורים.

---PROMPT START---
{chat_prompt}
---PROMPT END---

ביקורת ראשונה נתנה 5/10. ביקורת שנייה נתנה 7/10 לאחר הוספת:
- מצבי חיים רגישים (פיטורים, גיל 50+, חזרה מחו"ל, עצמאי→שכיר, מוגבלות)
- שיפור הנחיית Quick Replies עם דוגמאות ספציפיות לפי הקשר
- טיוב ניסוח גיל 50+ ומוגבלות נפשית

כעת בדוק את הגרסה הסופית:
1. האם הניסוח של מצבי החיים הרגישים נשמע אנושי, אמפתי, וישראלי — לא מדריך HR?
2. האם Quick Replies ברמה מספיקה להפעלה בפרודקשן?
3. האם יש עוד פערים קריטיים שחייבים טיפול לפני השקה?

בסיום: ציון סופי ואם הגרסה "מאושרת להפעלה" (כן/לא). כל הביקורת בעברית."""

import os
api_key = os.getenv("OPENAI_API_KEY", "")

payload = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "system", "content": "אתה מבקר מוצרים דיגיטליים ישראלי חד ונוקב. תן ביקורת אמיתית, לא מנומסת."},
        {"role": "user", "content": review_request}
    ],
    "max_tokens": 3000,
    "temperature": 0.7
}

body = json.dumps(payload, ensure_ascii=False).encode("utf-8")

req = urllib.request.Request(
    "https://api.openai.com/v1/chat/completions",
    data=body,
    headers={
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": f"Bearer {api_key}"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        text = result["choices"][0]["message"]["content"]
        # Write to file to avoid Windows cp1252 encoding issues
        out_path = "scripts/roast_result.txt"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        sys.stdout.buffer.write(("DONE — saved to " + out_path + "\n").encode("utf-8"))
except urllib.error.HTTPError as e:
    err = e.read().decode("utf-8")
    sys.stderr.buffer.write(f"HTTP {e.code}: {err}\n".encode("utf-8"))
    sys.exit(1)
