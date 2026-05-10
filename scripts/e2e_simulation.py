"""
E2E Scout Chat Simulation
Runs full flow: Scout conversation → search plan → Serper jobs → GPT-4o evaluation
"""

import json
import urllib.request
import urllib.error
import re
import sys
import time

import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import os
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
SERPER_KEY = os.getenv("SERPER_API_KEY", "")

# ── Load prompts from source ──────────────────────────────────────────────────
def load_prompt(name: str) -> str:
    with open("lib/prompts.ts", "r", encoding="utf-8") as f:
        content = f.read()
    markers = {
        "chat":   ("export const CHAT_SYSTEM_PROMPT = `", "export const MATCH_ANALYSIS_PROMPT"),
        "search": ("export const SEARCH_QUERY_PROMPT = (profile: string) => `", "export const HIDDEN_MARKET_PROMPT"),
    }
    start_marker, end_marker = markers[name]
    start = content.index(start_marker) + len(start_marker)
    end = content.index(end_marker)
    return content[start:end].strip().rstrip("`").rstrip(";").strip()

CHAT_PROMPT   = load_prompt("chat")
SEARCH_PROMPT_TEMPLATE = load_prompt("search")

# ── OpenAI helper ─────────────────────────────────────────────────────────────
def openai_call(messages: list, model="gpt-4o-mini", max_tokens=800, temperature=0.6) -> str:
    payload = {"model": model, "messages": messages, "max_tokens": max_tokens, "temperature": temperature}
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json; charset=utf-8", "Authorization": f"Bearer {OPENAI_KEY}"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))["choices"][0]["message"]["content"]

# ── Serper search ─────────────────────────────────────────────────────────────
def serper_search(query: str, sites: str) -> list:
    payload = {"q": f"{query} {sites}", "gl": "il", "hl": "iw", "num": 5, "tbs": "qdr:m"}
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://google.serper.dev/search",
        data=body,
        headers={"X-API-KEY": SERPER_KEY, "Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
            return data.get("organic", [])[:4]
    except:
        return []

MAIN_SITES = "site:drushim.co.il OR site:alljobs.co.il OR site:jobmaster.co.il OR site:gotfriends.co.il"

# ── Scout conversation simulator ──────────────────────────────────────────────
def run_scout_conversation(scenario: dict) -> dict:
    """Simulates Scout chat until [SEARCH_NOW] is triggered."""
    system = (
        CHAT_PROMPT
        + "\n\nחוקי שפה — חובה לקיים:\n"
        "1. עברית יומיומית בלבד — כמו הודעת WhatsApp.\n"
        "2. תגובה קצרה: 1-3 משפטים. שאלה אחת בסוף.\n"
        "3. מילים אסורות: 'בהחלט', 'כמובן', 'אשמח', 'נשמע'.\n"
        "4. פנה בלשון רבים ניטרלית.\n"
        "5. אם מתאים, הוסף [QUICK: \"א\"|\"ב\"|\"ג\"] בסוף."
    )

    history = []  # list of {role, content}
    conversation_log = []

    # First user message
    first_msg = scenario["first_message"]
    history.append({"role": "user", "content": first_msg})
    conversation_log.append(f"משתמש: {first_msg}")

    search_context = None
    max_turns = 5

    for turn in range(max_turns):
        messages = [{"role": "system", "content": system}] + history
        scout_reply = openai_call(messages, model="gpt-4o-mini", max_tokens=400)

        # Strip [QUICK] from display, clean [SEARCH_NOW]
        display_reply = re.sub(r"\[QUICK:[^\]]+\]", "", scout_reply).replace("[SEARCH_NOW]", "").replace("[READY_TO_SEARCH]", "").strip()
        conversation_log.append(f"Scout: {display_reply}")
        history.append({"role": "assistant", "content": scout_reply})

        if "[SEARCH_NOW]" in scout_reply or "[READY_TO_SEARCH]" in scout_reply:
            search_context = "\n".join(conversation_log)
            break

        # Simulate user reply (use scenario follow-ups if available)
        follow_up_idx = turn
        if follow_up_idx < len(scenario.get("follow_ups", [])):
            user_reply = scenario["follow_ups"][follow_up_idx]
        else:
            user_reply = "אוקיי"

        history.append({"role": "user", "content": user_reply})
        conversation_log.append(f"משתמש: {user_reply}")
        time.sleep(1)  # small delay between turns

    if not search_context:
        search_context = "\n".join(conversation_log)

    return {
        "name": scenario["name"],
        "conversation": "\n".join(conversation_log),
        "search_context": search_context,
        "turns": len([l for l in conversation_log if l.startswith("Scout:")]),
    }

# ── Generate search plan ──────────────────────────────────────────────────────
def generate_search_plan(search_context: str) -> dict:
    profile = json.dumps({"additionalContext": search_context}, ensure_ascii=False)
    prompt = SEARCH_PROMPT_TEMPLATE.replace("${profile}", profile)
    # The template uses ${profile} — also handle backtick template literal style
    if "${profile}" not in prompt:
        prompt = re.sub(r'\$\{profile\}', profile, prompt)
    # Fallback: just append the profile
    full_prompt = f"{SEARCH_PROMPT_TEMPLATE}\n\nProfile:\n{profile}"
    response = openai_call(
        [{"role": "user", "content": full_prompt}],
        model="gpt-4o-mini",
        max_tokens=600,
        temperature=0.3
    )
    try:
        clean = re.sub(r"```json\n?|```\n?", "", response).strip()
        return json.loads(clean)
    except:
        return {"hebrewQueries": [], "englishQueries": [], "error": response[:200]}

# ── Run real job search ───────────────────────────────────────────────────────
GENERIC_TITLE_PATTERNS = [
    re.compile(r"^דרושים$"), re.compile(r"^משרות$"), re.compile(r"^jobs?$", re.I),
    re.compile(r"כל המשרות"), re.compile(r"לוח דרושים"), re.compile(r"חיפוש משרות"),
    re.compile(r"remote jobs", re.I), re.compile(r"משרות מרחוק$"), re.compile(r"משרות היום"),
    re.compile(r"מצאנו \d+ הצעות עבודה"),
    re.compile(r"הצעות עבודה חדשות"),
    re.compile(r"\d+ משרות חדשות"),
    re.compile(r"משרות חדשות מתעדכנות"),
    re.compile(r"מגוון משרות מיידיות"),
    re.compile(r"המדריך המלא"),
]

def is_generic_page(job: dict) -> bool:
    title = job.get("title", "").strip()
    return any(p.search(title) for p in GENERIC_TITLE_PATTERNS)

def run_job_search(plan: dict) -> list:
    jobs = []
    queries = plan.get("hebrewQueries", [])[:3] + plan.get("englishQueries", [])[:2]
    for q in queries:
        results = serper_search(q, MAIN_SITES)
        for r in results:
            jobs.append({
                "title": r.get("title", ""),
                "link": r.get("link", ""),
                "snippet": r.get("snippet", "")[:200],
                "source": r.get("link", "").split("/")[2] if r.get("link") else "",
            })
        time.sleep(0.5)
    # Deduplicate and filter category pages
    seen = set()
    unique = []
    for j in jobs:
        if j["link"] not in seen and not is_generic_page(j):
            seen.add(j["link"])
            unique.append(j)
    return unique[:8]

# ── GPT-4o evaluation ─────────────────────────────────────────────────────────
def evaluate_with_gpt4o(result: dict, jobs: list, plan: dict) -> str:
    jobs_text = "\n".join([
        f"- {j['title']} | {j['source']}\n  {j['snippet']}"
        for j in jobs
    ]) or "לא נמצאו משרות"

    queries_text = "\n".join(plan.get("hebrewQueries", []) + plan.get("englishQueries", []))

    eval_prompt = f"""אתה מומחה UX ויועץ קריירה ישראלי. בדוק את תוצאות הסימולציה הבאה:

**תרחיש:** {result['name']}

**שיחה עם Scout ({result['turns']} הודעות):**
{result['conversation']}

**שאילתות חיפוש שנוצרו:**
{queries_text}

**משרות שהתקבלו:**
{jobs_text}

בדוק ודרג לפי 4 קריטריונים (כל אחד 1-10):

1. **שיחה** — האם Scout שאל את השאלות הנכונות? האם ידע מתי לסיים? האם הטון ישראלי ואנושי?
2. **שאילתות** — האם השאילתות מדויקות לפרופיל? האם הן מכסות את כל השוק הרלוונטי?
3. **רלוונטיות משרות** — האם המשרות שהתקבלו מתאימות לפרופיל המשתמש?
4. **חוויה כוללת** — האם משתמש אמיתי היה מרוצה מהתוצאה?

לכל קריטריון: ציון + משפט קצר. בסוף: 1-2 שיפורים קונקרטיים.
הכל בעברית."""

    return openai_call(
        [{"role": "user", "content": eval_prompt}],
        model="gpt-4o",
        max_tokens=800,
        temperature=0.5
    )

# ── Test scenarios ────────────────────────────────────────────────────────────
SCENARIOS = [
    {
        "name": "מפתח Full Stack בכיר — חוזר מחופשת לידה",
        "first_message": "[CV_UPLOAD]\nשם: דניאל לוי\nתפקיד נוכחי: Full Stack Developer\nניסיון: 6 שנים\nכישורים: React, Node.js, TypeScript, AWS\nמיקום: תל אביב",
        "follow_ups": [
            "חוזר מחופשת לידה, חייב לצאת ב-15:30 כל יום. רוצה hybrid, 2 ימים מהבית. שכר מינימום 28K.",
            "ת\"א בלבד. 2 ימים במשרד זה בסדר."
        ]
    },
    {
        "name": "מורה שעוברת לתחום חדש",
        "first_message": "עבדתי 9 שנים כמורה לאנגלית. אני רוצה לעבור לתחום של תוכן דיגיטלי או הדרכה בחברות הייטק. אין לי ניסיון ספציפי בהייטק אבל יצרתי תכנים ומצגות לאורך כל הדרך.",
        "follow_ups": [
            "כל הארץ, אפשר גם remote. שכר — לא יודעת כמה מקובל, מה שסביר. פנויה מיד."
        ]
    },
    {
        "name": "מנהל לוגיסטיקה — פוטר לאחרונה",
        "first_message": "פוטרתי לפני שבועיים אחרי 12 שנה באותה חברה. מנהל לוגיסטיקה ותפעול. אין לי רכב — חייב ליד רכבת. רוצה לפחות 18K.",
        "follow_ups": [
            "מרכז הארץ — ת\"א, הרצליה, פתח תקווה. hybrid מתאים לי, גם full office."
        ]
    },
]

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    all_results = []

    for i, scenario in enumerate(SCENARIOS):
        print(f"\n{'='*60}", flush=True)
        print(f"תרחיש {i+1}: {scenario['name']}", flush=True)
        print('='*60, flush=True)

        # 1. Scout conversation
        print("▶ מריץ שיחת Scout...", flush=True)
        conv_result = run_scout_conversation(scenario)
        print(f"  השיחה הסתיימה ב-{conv_result['turns']} הודעות Scout", flush=True)
        time.sleep(2)

        # 2. Search plan
        print("▶ יוצר תוכנית חיפוש...", flush=True)
        plan = generate_search_plan(conv_result["search_context"])
        queries = plan.get("hebrewQueries", []) + plan.get("englishQueries", [])
        print(f"  {len(queries)} שאילתות נוצרו", flush=True)
        time.sleep(2)

        # 3. Real job search via Serper
        print("▶ מחפש משרות אמיתיות...", flush=True)
        jobs = run_job_search(plan)
        print(f"  נמצאו {len(jobs)} משרות", flush=True)
        time.sleep(2)

        # 4. GPT-4o evaluation
        print("▶ שולח ל-GPT-4o להערכה...", flush=True)
        evaluation = evaluate_with_gpt4o(conv_result, jobs, plan)

        scenario_result = {
            "name": scenario["name"],
            "conversation": conv_result["conversation"],
            "turns": conv_result["turns"],
            "queries": queries,
            "jobs_found": jobs,
            "evaluation": evaluation,
        }
        all_results.append(scenario_result)

        print("\n--- הערכת GPT-4o ---", flush=True)
        print(evaluation, flush=True)
        time.sleep(3)

    # Save full results
    out_path = "scripts/e2e_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    # Save readable summary
    summary_path = "scripts/e2e_summary.txt"
    with open(summary_path, "w", encoding="utf-8") as f:
        for r in all_results:
            f.write(f"\n{'='*60}\n")
            f.write(f"תרחיש: {r['name']}\n")
            f.write(f"{'='*60}\n\n")
            f.write("שיחה:\n")
            f.write(r["conversation"] + "\n\n")
            f.write("שאילתות שנוצרו:\n")
            for q in r["queries"]:
                f.write(f"  • {q}\n")
            f.write(f"\nמשרות שהתקבלו ({len(r['jobs_found'])}):\n")
            for j in r["jobs_found"]:
                f.write(f"  • {j['title']} ({j['source']})\n")
            f.write(f"\nהערכת GPT-4o:\n{r['evaluation']}\n")

    print(f"\n\n✅ סיכום שמור ב: {summary_path}", flush=True)
    sys.stdout.buffer.write(b"DONE\n")

if __name__ == "__main__":
    main()
