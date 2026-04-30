# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> 3 · Career advisor: stop at stage 3 → profile shows correct stage → complete all → see summary
- Location: tests\user-journey.spec.ts:154:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /מיפוי חוזקות|Personality diagnosis|מיפוי/i }).first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('button').filter({ hasText: /מיפוי חוזקות|Personality diagnosis|מיפוי/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - link "Work Hunter" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e8]
          - generic [ref=e14]: Work Hunter
        - generic [ref=e15]:
          - link "איך זה עובד" [ref=e16] [cursor=pointer]:
            - /url: /#how-it-works
          - link "בניית קורות חיים" [ref=e17] [cursor=pointer]:
            - /url: /cv-builder
          - link "מסלולים" [ref=e18] [cursor=pointer]:
            - /url: /pricing
          - link "ביקורות" [ref=e19] [cursor=pointer]:
            - /url: /reviews
        - generic [ref=e20]:
          - button "Switch to light mode" [ref=e21] [cursor=pointer]:
            - img [ref=e23]
          - button "T Test" [ref=e27] [cursor=pointer]:
            - generic [ref=e28]: T
            - generic [ref=e29]: Test
            - img [ref=e30]
            - img [ref=e32]
    - button "Switch language" [ref=e34] [cursor=pointer]:
      - generic [ref=e35]: 🇮🇱
      - generic [ref=e36]: English
    - generic [ref=e37]:
      - generic [ref=e39]:
        - img [ref=e42]
        - heading "הצעד הבא בקריירה שלך מעולם לא היה ברור יותר." [level=1] [ref=e48]
        - paragraph [ref=e49]: כל מה שהקריירה שלך צריכה, במקום אחד. מאבחון ראשוני ועד למשרה הבאה — ליווי חכם, אישי ובקצב שלך.
        - generic [ref=e50]:
          - button "להתחיל אבחון בחינם" [ref=e51] [cursor=pointer]
          - button "אני רק מחפש/ת עבודה" [ref=e52] [cursor=pointer]
        - paragraph [ref=e53]: 2,400+ ישראלים כבר בנו תוכנית קריירה · ★ 4.8 · מותאם ל-50+ תחומים · הכל בעברית
      - generic [ref=e57]:
        - heading "מכיר/ה את ההרגשה הזו?" [level=2] [ref=e58]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: 😔
            - paragraph [ref=e62]: “אני תקוע/ה בעבודה הזו כבר שנים — ולא יודע/ת לאן ללכת מכאן”
          - generic [ref=e63]:
            - generic [ref=e64]: 📭
            - paragraph [ref=e65]: “אני שולח/ת עשרות קורות חיים וכלום לא חוזר”
          - generic [ref=e66]:
            - generic [ref=e67]: 🤔
            - paragraph [ref=e68]: “חושב/ת על עצמאות אבל לא בטוח/ה שאני מתאים/ה”
      - generic [ref=e73]:
        - generic [ref=e74]:
          - heading "בניית תוכנית קריירה מקיפה ב-45 דקות בלבד. מדויק, ממוקד, אישי." [level=2] [ref=e75]
          - paragraph [ref=e76]: "בלי לדלג ובלי לנחש: כל שלב בתהליך נשען על קודמו ומדייק את הבא."
        - generic [ref=e79]:
          - generic [ref=e80]:
            - img [ref=e82]
            - generic [ref=e84]: "1"
            - heading "מיפוי חוזקות וכישורים" [level=3] [ref=e85]
          - generic [ref=e86]:
            - img [ref=e88]
            - generic [ref=e90]: "2"
            - heading "כיוון חיים" [level=3] [ref=e91]
          - generic [ref=e92]:
            - img [ref=e94]
            - generic [ref=e96]: "3"
            - heading "קורות חיים" [level=3] [ref=e97]
          - generic [ref=e98]:
            - img [ref=e100]
            - generic [ref=e102]: "4"
            - heading "אסטרטגיית חיפוש" [level=3] [ref=e103]
      - generic [ref=e107]:
        - generic [ref=e108]:
          - heading "הצעד הבא שלך — בואו נבחר אותו יחד." [level=2] [ref=e109]
          - paragraph
        - generic [ref=e110]:
          - generic [ref=e111]:
            - generic [ref=e112]:
              - img [ref=e114]
              - generic [ref=e116]: ליווי לעומק
            - heading "יועץ תעסוקתי" [level=3] [ref=e117]
            - paragraph [ref=e118]: "מסע של 4 שלבים, סה\"כ 30–45 דקות:"
            - list [ref=e119]:
              - listitem [ref=e120]:
                - generic [ref=e121]: •
                - generic [ref=e122]: מיפוי חוזקות וכישורים (MBTI + Holland)
              - listitem [ref=e123]:
                - generic [ref=e124]: •
                - generic [ref=e125]: כיוון חיים — שכיר, עצמאי, או לימודים
              - listitem [ref=e126]:
                - generic [ref=e127]: •
                - generic [ref=e128]: סקירה ושיפור CV (אופציונלי)
              - listitem [ref=e129]:
                - generic [ref=e130]: •
                - generic [ref=e131]: תרגול ראיון עבודה מדומה המותאם לתפקיד שלך
              - listitem [ref=e132]:
                - generic [ref=e133]: •
                - generic [ref=e134]: אסטרטגיית חיפוש עבודה או פתיחת עסק מותאמת אישית
            - paragraph [ref=e135]: "בונוס: ראיונות מדומים ללא הגבלה, מותאמים לתחום שלך."
            - button "התחל/י את היועץ" [ref=e136] [cursor=pointer]
          - generic [ref=e137]:
            - generic [ref=e138]:
              - img [ref=e140]
              - generic [ref=e142]: תוצאות מיידיות
            - heading "מצא לי משרות" [level=3] [ref=e143]
            - paragraph [ref=e144]: "ספר/י לנו הכל במקום אחד:"
            - list [ref=e145]:
              - listitem [ref=e146]:
                - generic [ref=e147]: •
                - generic [ref=e148]: הרקע, הכישורים והניסיון שלך
              - listitem [ref=e149]:
                - generic [ref=e150]: •
                - generic [ref=e151]: איפה את/ה גר/ה וכמה מוכן/ה לנסוע
              - listitem [ref=e152]:
                - generic [ref=e153]: •
                - generic [ref=e154]: ציפיות שכר, אילוצים (הריון, משפחה) — הכל
              - listitem [ref=e155]:
                - generic [ref=e156]: •
                - generic [ref=e157]: סוג סביבת העבודה שמתאימה לך
            - paragraph [ref=e158]: תקבל/י לינקים מדורגים לכל המשרות המתאימות, מכל הפלטפורמות הישראליות — LinkedIn, AllJobs, ג'ובמאסטר, דרושים, וקבוצות פייסבוק לדרושים.
            - button "מצא לי משרות עכשיו" [ref=e159] [cursor=pointer]
      - generic [ref=e163]:
        - heading "כל תחום. כל גיל. כל שלב בחיים." [level=2] [ref=e164]
        - generic [ref=e165]:
          - generic [ref=e166]:
            - generic [ref=e167]: 📚
            - generic [ref=e168]: חינוך
          - generic [ref=e169]:
            - generic [ref=e170]: 🩺
            - generic [ref=e171]: בריאות
          - generic [ref=e172]:
            - generic [ref=e173]: 🎨
            - generic [ref=e174]: עיצוב
          - generic [ref=e175]:
            - generic [ref=e176]: 🤝
            - generic [ref=e177]: עבודה סוציאלית
          - generic [ref=e178]:
            - generic [ref=e179]: 📈
            - generic [ref=e180]: מכירות
          - generic [ref=e181]:
            - generic [ref=e182]: 📣
            - generic [ref=e183]: שיווק
          - generic [ref=e184]:
            - generic [ref=e185]: ⚖️
            - generic [ref=e186]: משפטים
          - generic [ref=e187]:
            - generic [ref=e188]: 💼
            - generic [ref=e189]: פיננסים
          - generic [ref=e190]:
            - generic [ref=e191]: 💻
            - generic [ref=e192]: הייטק
          - generic [ref=e193]:
            - generic [ref=e194]: 🍽️
            - generic [ref=e195]: אוכל והסעדה
          - generic [ref=e196]:
            - generic [ref=e197]: 🎭
            - generic [ref=e198]: אמנות
          - generic [ref=e199]:
            - generic [ref=e200]: 🔧
            - generic [ref=e201]: הנדסה
        - paragraph [ref=e202]: האמת? רוב המשתמשים שלנו דווקא לא מההייטק. מורה שעברה ל-EdTech. אחות שפתחה קליניקה פרטית. יועץ מס שהעלה מחירים ב-40%.
      - generic [ref=e206]:
        - generic [ref=e207]:
          - heading "מה קורה בשוק העבודה בישראל" [level=2] [ref=e208]
          - paragraph [ref=e209]: נתונים אמיתיים. דע לאן את/ה צועד/ת.
        - generic [ref=e210]:
          - generic [ref=e211]:
            - img [ref=e213]
            - generic [ref=e215]: ~30,000 ₪
            - generic [ref=e216]: שכר ממוצע בהייטק
            - paragraph [ref=e217]: "ברוטו לחודש. Senior: 40–60 אלף. Junior: 18–25 אלף."
          - generic [ref=e218]:
            - img [ref=e220]
            - generic [ref=e222]: ~3.8%
            - generic [ref=e223]: אבטלה
            - paragraph [ref=e224]: מהנמוכות ב-OECD. שוק הדוק ותחרותי.
          - generic [ref=e225]:
            - img [ref=e227]
            - generic [ref=e229]: ~20% מהתמ"ג
            - generic [ref=e230]: הייטק מה-תמ"ג
            - paragraph [ref=e231]: אך רק ~11% מכוח העבודה. שכר גבוה, כניסה קשה.
          - generic [ref=e232]:
            - img [ref=e234]
            - generic [ref=e236]: ~500,000
            - generic [ref=e237]: עצמאים
            - paragraph [ref=e238]: אחד מכל שמונה ישראלים הוא עצמאי.
          - generic [ref=e239]:
            - img [ref=e241]
            - generic [ref=e243]: AI · סייבר · פינטק
            - generic [ref=e244]: תחומים לוהטים
            - paragraph [ref=e245]: ביקוש לתפקידי AI קפץ ~40% בשנה האחרונה.
          - generic [ref=e246]:
            - img [ref=e248]
            - generic [ref=e250]: תל אביב מובילה
            - generic [ref=e251]: גיאוגרפיה
            - paragraph [ref=e252]: אחריה הרצליה וחיפה. עבודה מרחוק צומחת מהר.
          - generic [ref=e253]:
            - img [ref=e255]
            - generic [ref=e257]: מעל 80%
            - generic [ref=e258]: לינקדאין חשוב
            - paragraph [ref=e259]: ממגייסי ההייטק בודקים לינקדאין לפני לוחות הדרושים.
          - generic [ref=e260]:
            - img [ref=e262]
            - generic [ref=e264]: ~60% מהמשרות
            - generic [ref=e265]: שוק נסתר
            - paragraph [ref=e266]: נסגרות דרך המלצות — לא מתפרסמות בגלוי.
        - paragraph [ref=e267]: "מקורות: בנק ישראל, הלמ\"ס, IVC, LinkedIn Israel. נתונים מקורבים, 2024–2025."
      - generic [ref=e271]:
        - heading "סיפורים אמיתיים של אנשים כמוך" [level=2] [ref=e272]
        - generic [ref=e273]:
          - generic [ref=e274]:
            - generic [ref=e275]:
              - generic [ref=e276]: יכ
              - generic [ref=e277]:
                - heading "יעל כהן" [level=4] [ref=e278]
                - paragraph [ref=e279]: 29 · חיפה · חינוך
              - generic [ref=e280]: ★★★★★
            - heading "עברתי מהוראה ל-EdTech — ובפעם הראשונה הרגשתי שמישהו שומע אותי" [level=3] [ref=e281]
            - paragraph [ref=e282]: הייתי 6 שנים מורה לאנגלית ורציתי לעזוב אבל לא ידעתי לאן. היועץ שאל שאלות שאף יועץ אנושי לא שאל אותי (בערך 5 ראיתי). האבחון פתח לי את העיניים לתחום ה-EdTech ושלב האסטרטגיה נתן לי רשימה של חברות שבאמת התאימו. תוך חודש קיבלתי עבודה כ-Learning Designer ב-company israeli.
          - generic [ref=e283]:
            - generic [ref=e284]:
              - generic [ref=e285]: אג
              - generic [ref=e286]:
                - heading "אסף גולן" [level=4] [ref=e287]
                - paragraph [ref=e288]: 31 · רמת גן · עיצוב
              - generic [ref=e289]: ★★★★★
            - heading "עברתי מעובד בחברה לפרילנסר — הכיוון היה הכל" [level=3] [ref=e290]
            - paragraph [ref=e291]: הייתי מעצב גרפי בחברה והרגשתי חנוק. שלב הכיוון השווה עצמאי מול שכיר בצורה כל כך כנה שלא שמעתי מאף יועץ אנושי. אחרי שבחרתי עצמאי, האסטרטגיה נתנה לי בדיוק איך למצוא את 10 הלקוחות הראשונים. היום יש לי 14.
          - generic [ref=e292]:
            - generic [ref=e293]:
              - generic [ref=e294]: רש
              - generic [ref=e295]:
                - heading "רונית שוורץ" [level=4] [ref=e296]
                - paragraph [ref=e297]: 50 · אור יהודה · חזרה לעבודה
              - generic [ref=e298]: ★★★★★
            - heading "חזרה לעבודה אחרי 12 שנות אימהות — בלי פאניקה" [level=3] [ref=e299]
            - paragraph [ref=e300]: הייתי אחות ולקחתי הפסקה של 12 שנה. חשבתי שאף אחד לא ירצה אותי. היועץ זיהה שהניסיון שלי רלוונטי לתפקידי תיאום בחברות רפואיות ושכתב לי CV שמציג את זה ככה. קיבלתי עבודה תוך 3 חודשים.
        - link "לעוד 7 סיפורים ←" [ref=e302] [cursor=pointer]:
          - /url: /reviews
      - generic [ref=e306]:
        - generic [ref=e307]:
          - heading "בחר/י את המסלול שלך" [level=2] [ref=e308]
          - paragraph [ref=e309]: התחל/י בחינם. שלם/י רק כשמרגיש ערך.
        - paragraph [ref=e311]: למה לשלם מאות שקלים לפגישה אחת? בואו לקבל תוכנית קריירה שלמה ב-99 ₪ בלבד, עם גישה לכל החיים.
        - generic [ref=e312]:
          - generic [ref=e313]:
            - generic [ref=e314]:
              - heading "Explorer" [level=3] [ref=e315]
              - generic [ref=e317]: חינם
              - paragraph [ref=e318]: נסה בלי כרטיס אשראי
            - button "התחל בחינם" [ref=e319] [cursor=pointer]
            - list [ref=e320]:
              - listitem [ref=e321]:
                - img [ref=e322]
                - generic [ref=e324]: אבחון אישיות מלא (MBTI + Holland)
              - listitem [ref=e325]:
                - img [ref=e326]
                - generic [ref=e328]: כיוון חיים — בחירת מסלול
              - listitem [ref=e329]:
                - img [ref=e330]
                - generic [ref=e332]: תצוגה מוגבלת של הסיכום
              - listitem [ref=e333]:
                - img [ref=e334]
                - generic [ref=e336]: צ'אט יועץ מוגבל (10 הודעות ביום)
          - generic [ref=e337]:
            - generic [ref=e338]: נהדר להתנסות
            - generic [ref=e339]:
              - heading "שבועי" [level=3] [ref=e340]
              - generic [ref=e341]:
                - generic [ref=e342]: 25 ₪
                - generic [ref=e343]: / שבוע
              - paragraph [ref=e344]: גישה מלאה ל-7 ימים · מסתיים אוטומטית, ללא חידוש
            - button "התחל/י שבוע" [ref=e345] [cursor=pointer]
            - list [ref=e346]:
              - listitem [ref=e347]:
                - img [ref=e348]
                - generic [ref=e350]: כל מה שיש במסע המלא
              - listitem [ref=e351]:
                - img [ref=e352]
                - generic [ref=e354]: כל 5 שלבי הייעוץ פתוחים לגמרי
              - listitem [ref=e355]:
                - img [ref=e356]
                - generic [ref=e358]: ראיונות מדומים ללא הגבלה
              - listitem [ref=e359]:
                - img [ref=e360]
                - generic [ref=e362]: סיכום תוכנית מלא + ייצוא PDF
              - listitem [ref=e363]:
                - img [ref=e364]
                - generic [ref=e366]: הגישה מסתיימת אחרי 7 ימים
          - generic [ref=e367]:
            - generic [ref=e368]: הכי פופולרי
            - generic [ref=e369]:
              - heading "המסע המלא" [level=3] [ref=e370]
              - generic [ref=e371]:
                - generic [ref=e372]: 149 ₪
                - generic [ref=e373]: 99 ₪
              - paragraph [ref=e374]: תשלום חד-פעמי · גישה לכל החיים
            - button "קבל את המסע המלא" [ref=e375] [cursor=pointer]
            - list [ref=e376]:
              - listitem [ref=e377]:
                - img [ref=e378]
                - generic [ref=e380]: כל 5 שלבי הייעוץ — פתוחים לגמרי
              - listitem [ref=e381]:
                - img [ref=e382]
                - generic [ref=e384]: סיכום תוכנית קריירה מלא
              - listitem [ref=e385]:
                - img [ref=e386]
                - generic [ref=e388]: סקירה מקצועית ושכתוב CV
              - listitem [ref=e389]:
                - img [ref=e390]
                - generic [ref=e392]: שכתוב פרופיל LinkedIn
              - listitem [ref=e393]:
                - img [ref=e394]
                - generic [ref=e396]: אסטרטגיית חיפוש עבודה ממוקדת
              - listitem [ref=e397]:
                - img [ref=e398]
                - generic [ref=e400]: ראיונות מדומים ללא הגבלה + פידבק STAR
              - listitem [ref=e401]:
                - img [ref=e402]
                - generic [ref=e404]: ייצוא התוכנית כ-PDF
              - listitem [ref=e405]:
                - img [ref=e406]
                - generic [ref=e408]: גישה לכל החיים לתוכנית שלך
          - generic [ref=e409]:
            - generic [ref=e410]: הכי טוב למחפשים פעילים
            - generic [ref=e411]:
              - heading "Pro" [level=3] [ref=e412]
              - generic [ref=e413]:
                - generic [ref=e414]: 69 ₪
                - generic [ref=e415]: 39 ₪
                - generic [ref=e416]: / חודש
              - paragraph [ref=e417]: 3 חודשים ראשונים במחיר השקה · בטל בכל עת
            - button "התחל ניסיון של 7 ימים" [ref=e418] [cursor=pointer]
            - list [ref=e419]:
              - listitem [ref=e420]:
                - img [ref=e421]
                - generic [ref=e423]: כל מה שיש במסע המלא
              - listitem [ref=e424]:
                - img [ref=e425]
                - generic [ref=e427]: ראיונות מדומים ללא הגבלה (מותאמים לתחום)
              - listitem [ref=e428]:
                - img [ref=e429]
                - generic [ref=e431]: צ'אט חי עם היועץ, 24/7
              - listitem [ref=e432]:
                - img [ref=e433]
                - generic [ref=e435]: חיפוש משרות חי עם הזדמנויות אמיתיות
              - listitem [ref=e436]:
                - img [ref=e437]
                - generic [ref=e439]: עדכון חודשי של האסטרטגיה
              - listitem [ref=e440]:
                - img [ref=e441]
                - generic [ref=e443]: תמיכה בעדיפות
        - link "לכל פרטי המסלולים ←" [ref=e445] [cursor=pointer]:
          - /url: /pricing
      - generic [ref=e449]:
        - heading "שאלות נפוצות" [level=2] [ref=e450]
        - generic [ref=e451]:
          - button "השירות עובד גם לתחומים שאינם הייטק?" [ref=e452] [cursor=pointer]:
            - generic [ref=e453]:
              - generic [ref=e454]: השירות עובד גם לתחומים שאינם הייטק?
              - img [ref=e455]
          - button "כמה זמן לוקח המסע המלא?" [ref=e457] [cursor=pointer]:
            - generic [ref=e458]:
              - generic [ref=e459]: כמה זמן לוקח המסע המלא?
              - img [ref=e460]
          - button "המידע שלי נשמר בצורה פרטית?" [ref=e462] [cursor=pointer]:
            - generic [ref=e463]:
              - generic [ref=e464]: המידע שלי נשמר בצורה פרטית?
              - img [ref=e465]
          - button "במה זה שונה מיועץ תעסוקתי אנושי?" [ref=e467] [cursor=pointer]:
            - generic [ref=e468]:
              - generic [ref=e469]: במה זה שונה מיועץ תעסוקתי אנושי?
              - img [ref=e470]
          - button "צריך קורות חיים כדי להשתמש?" [ref=e472] [cursor=pointer]:
            - generic [ref=e473]:
              - generic [ref=e474]: צריך קורות חיים כדי להשתמש?
              - img [ref=e475]
          - button "אפשר להשתמש בעברית?" [ref=e477] [cursor=pointer]:
            - generic [ref=e478]:
              - generic [ref=e479]: אפשר להשתמש בעברית?
              - img [ref=e480]
      - generic [ref=e485]:
        - heading "הצעד הבא שלך — בואו נבחר אותו יחד." [level=2] [ref=e486]
        - paragraph [ref=e487]: הרבה יותר קל כשיש מישהו ששואל את השאלות הנכונות.
        - button "להתחיל עכשיו — בחינם" [ref=e488] [cursor=pointer]
      - contentinfo [ref=e489]:
        - generic [ref=e490]:
          - generic [ref=e491]:
            - img [ref=e493]
            - generic [ref=e499]: Work Hunter
          - navigation [ref=e500]:
            - link "מסלולים" [ref=e501] [cursor=pointer]:
              - /url: /pricing
            - generic [ref=e502]: פרטיות
            - generic [ref=e503]: תנאי שימוש
            - generic [ref=e504]: צור קשר
        - paragraph [ref=e505]: © Work Hunter 2025 · נבנה באהבה בישראל
  - alert [ref=e506]
```

# Test source

```ts
  89  |   await expect(ta).toBeVisible({ timeout: 8000 });
  90  | 
  91  |   // ── Message 1: profile with constraints ───────────────────────────────────
  92  |   await chatAndWait(
  93  |     page,
  94  |     "שלום! אני מתכנת Full Stack עם 4 שנות ניסיון ב-React ו-Node.js. גר בתל אביב, מחפש עבודה היברידית או מרחוק. " +
  95  |     "יש לי ילד קטן אז אני צריך גמישות בשעות. מנסיון קודם עבדתי בסטארטאפים. " +
  96  |     "המשכורת המינימלית שמקובלת עלי היא 25,000 שקל.",
  97  |     20_000,
  98  |   );
  99  | 
  100 |   // ── Message 2: refine ────────────────────────────────────────────────────
  101 |   await chatAndWait(
  102 |     page,
  103 |     "אני לא מוכן לנסוע לאזור מחוץ לגוש דן. רצוי חברות שעובדות עם TypeScript ו-AWS.",
  104 |     20_000,
  105 |   );
  106 | 
  107 |   // ── Message 3: trigger search ────────────────────────────────────────────
  108 |   await chatAndWait(
  109 |     page,
  110 |     "אוקיי, אני חושב שנתתי לך מספיק מידע. תמצא לי משרות מתאימות בבקשה!",
  111 |     40_000, // AI may run job search here — longer timeout
  112 |   );
  113 | 
  114 |   // ── Verify inline job cards appeared ────────────────────────────────────
  115 |   // Jobs show as "N משרות שנמצאו" or job card elements
  116 |   const jobsFound =
  117 |     (await page.locator("text=/\\d+ משרות שנמצאו|matches found/").count()) > 0 ||
  118 |     (await page.locator("a[href*='drushim'], a[href*='alljobs'], a[href*='linkedin']").count()) > 0;
  119 | 
  120 |   if (!jobsFound) {
  121 |     // Try one more prompt to trigger the search
  122 |     await chatAndWait(
  123 |       page,
  124 |       "בבקשה חפש לי משרות עכשיו לפי כל מה שסיפרתי לך.",
  125 |       40_000,
  126 |     );
  127 |   }
  128 | 
  129 |   // At this point jobs should be inline in the chat
  130 |   await expect(
  131 |     page.locator("text=/\\d+ משרות|matches found|משרות שנמצאו/").or(
  132 |       page.locator("a[href*='drushim'], a[href*='alljobs'], a[href*='linkedin'], a[href*='comeet']")
  133 |     ).first()
  134 |   ).toBeVisible({ timeout: 10_000 });
  135 | 
  136 |   // ── Check saved conversation in profile ────────────────────────────────
  137 |   await page.goto(`${BASE}/profile`);
  138 |   await page.waitForLoadState("networkidle");
  139 |   await page.waitForTimeout(2000);
  140 | 
  141 |   // Scroll down to conversations section
  142 |   const convSection = page.locator("text=/שיחות|Conversations|שיחה/i").first();
  143 |   if (await convSection.isVisible({ timeout: 5000 }).catch(() => false)) {
  144 |     await convSection.scrollIntoViewIfNeeded();
  145 |     await page.waitForTimeout(800);
  146 |     // There should be at least one saved conversation
  147 |     const convCards = page.locator("a[href*='/conversations/']");
  148 |     await expect(convCards.first()).toBeVisible({ timeout: 5000 });
  149 |   }
  150 | });
  151 | 
  152 | // ─── TEST 3 · Career advisor: full journey with stage-map verification ─────────
  153 | 
  154 | test("3 · Career advisor: stop at stage 3 → profile shows correct stage → complete all → see summary", async ({ page }) => {
  155 |   test.setTimeout(15 * 60_000); // AI calls at each stage can be slow
  156 | 
  157 |   // ── Navigate to advisor (uses logged-in user's actual ID) ───────────────
  158 |   await page.goto(`${BASE}/advisor`);
  159 |   await page.waitForLoadState("networkidle");
  160 |   await page.waitForTimeout(1500);
  161 | 
  162 |   // ── Dismiss PreJourneyIntro ("בואו נתחיל") if showing ───────────────────
  163 |   const preIntroBtn = page.locator("button", { hasText: /בואו נתחיל/i }).first();
  164 |   if (await preIntroBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  165 |     await preIntroBtn.click();
  166 |     await page.waitForTimeout(1000);
  167 |   }
  168 | 
  169 |   // ── Handle SelfIntro wizard (name → basics → story → loves → dislikes → welcome) ──
  170 |   const nameField = page.getByPlaceholder(/השם שלך|Your name/i);
  171 |   if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
  172 |     await nameField.fill("Playwright Test");
  173 |     await page.waitForTimeout(400);
  174 |     // Click "הלאה" / "Next" or "סיימתי" up to 6 times to get through all steps
  175 |     for (let i = 0; i < 6; i++) {
  176 |       const btn = page.locator("button", { hasText: /הלאה|Next|סיימתי|יוצאים לדרך|Done/i }).last();
  177 |       if (await btn.isVisible({ timeout: 2000 }).catch(() => false) &&
  178 |           await btn.isEnabled().catch(() => false)) {
  179 |         await btn.click();
  180 |         await page.waitForTimeout(600);
  181 |       }
  182 |     }
  183 |     await page.waitForTimeout(1000);
  184 |   }
  185 | 
  186 |   // ── STAGE 1 · Diagnosis ─────────────────────────────────────────────────
  187 |   // Click the Diagnosis stage card in JourneyMap (label: "מיפוי חוזקות וכישורים")
  188 |   const diagnosisCard = page.locator("button", { hasText: /מיפוי חוזקות|Personality diagnosis|מיפוי/i }).first();
> 189 |   await expect(diagnosisCard).toBeVisible({ timeout: 8000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  190 |   await diagnosisCard.click();
  191 |   await page.waitForTimeout(800);
  192 | 
  193 |   // Intro screen → click Start
  194 |   const diagStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  195 |   await expect(diagStart).toBeVisible({ timeout: 5000 });
  196 |   await diagStart.click();
  197 |   await page.waitForTimeout(600);
  198 | 
  199 |   // Answer 6 questions: click the first checkbox option for each
  200 |   for (let q = 0; q < 6; q++) {
  201 |     // Click the first label/option visible
  202 |     const firstOption = page.locator("label").first();
  203 |     if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
  204 |       await firstOption.click();
  205 |       await page.waitForTimeout(400);
  206 |     }
  207 | 
  208 |     // Click "Next" or "Analyze" button
  209 |     const nextBtn = page.getByRole("button", { name: /הבא|Next|נתח|Analyze/i }).last();
  210 |     await expect(nextBtn).toBeVisible({ timeout: 5000 });
  211 |     await nextBtn.click();
  212 |     await page.waitForTimeout(500);
  213 |   }
  214 | 
  215 |   // Wait for AI to analyze (shows loading screen then returns to map)
  216 |   await waitForNoSpinner(page, 60_000);
  217 |   await page.waitForTimeout(2000);
  218 | 
  219 |   // ── STAGE 2 · Direction ─────────────────────────────────────────────────
  220 |   // We should be back at the Journey Map now
  221 |   // Direction stage label: "כיוון חיים" / "Life direction"
  222 |   const directionCard = page.locator("button", { hasText: /כיוון חיים|Life direction/i }).first();
  223 |   await expect(directionCard).toBeVisible({ timeout: 10_000 });
  224 |   await directionCard.click();
  225 |   await page.waitForTimeout(800);
  226 | 
  227 |   // Intro → Start
  228 |   const dirStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  229 |   if (await dirStart.isVisible({ timeout: 4000 }).catch(() => false)) {
  230 |     await dirStart.click();
  231 |     await page.waitForTimeout(600);
  232 |   }
  233 | 
  234 |   // Select "Employee" path (first option)
  235 |   const employeeBtn = page.locator("button", { hasText: /שכיר|Employee|עובד/i }).first();
  236 |   if (await employeeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  237 |     await employeeBtn.click();
  238 |     await page.waitForTimeout(500);
  239 |   } else {
  240 |     // Fallback: click first path button
  241 |     await page.locator("button.rounded-2xl").first().click();
  242 |     await page.waitForTimeout(500);
  243 |   }
  244 | 
  245 |   // Optionally fill goal text
  246 |   const goalTa = page.locator("textarea").first();
  247 |   if (await goalTa.isVisible({ timeout: 2000 }).catch(() => false)) {
  248 |     await goalTa.fill("אני רוצה למצוא עבודה יציבה בתחום הפיתוח");
  249 |     await page.waitForTimeout(400);
  250 |   }
  251 | 
  252 |   // Click Analyze
  253 |   const analyzeBtn = page.getByRole("button", { name: /נתח|Analyze|המשך|Continue/i }).last();
  254 |   await expect(analyzeBtn).toBeVisible({ timeout: 5000 });
  255 |   await analyzeBtn.click();
  256 | 
  257 |   // Wait for AI direction analysis
  258 |   await waitForNoSpinner(page, 60_000);
  259 |   await page.waitForTimeout(2000);
  260 | 
  261 |   // ── At this point currentStage should be "cv" (stage 3) ─────────────────
  262 |   // Navigate away to profile WITHOUT completing stage 3
  263 |   await page.goto(`${BASE}/profile`);
  264 |   await page.waitForLoadState("networkidle");
  265 |   await page.waitForTimeout(2000);
  266 | 
  267 |   // ── Verify profile shows stage 3 (CV review) as the current stage ────────
  268 |   // The profile shows "2 of 4 stages done" and circle 3 pulses purple
  269 |   const profileText = await page.locator("body").innerText();
  270 | 
  271 |   // Check "X of 4 stages done" text
  272 |   const stagesMatch = /2.*4|שלב 2|2 מתוך 4/i.test(profileText);
  273 |   expect(stagesMatch).toBe(true);
  274 | 
  275 |   // Check that the 3rd circle is the current (purple pulsing = animate-pulse + bg-purple)
  276 |   const currentCircle = page.locator(".animate-pulse.bg-purple-600, .bg-purple-600.ring-4").first();
  277 |   await expect(currentCircle).toBeVisible({ timeout: 5000 });
  278 | 
  279 |   // The CV review label should be visible near the current circle
  280 |   await expect(page.locator("text=/קורות חיים|CV review/i").first()).toBeVisible({ timeout: 5000 });
  281 | 
  282 |   // ── Continue from profile — click "המשך / Continue" ──────────────────────
  283 |   const continueBtn = page.locator("a, button", { hasText: /המשך|Continue/i }).first();
  284 |   await expect(continueBtn).toBeVisible({ timeout: 5000 });
  285 |   await continueBtn.click();
  286 |   await page.waitForLoadState("networkidle");
  287 |   await page.waitForTimeout(1500);
  288 | 
  289 |   // ── STAGE 3 · CV Review — click stage card and SKIP ──────────────────────
```