# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: user-journey.spec.ts >> 2 · Job search: conversation → inline job cards → saved in profile
- Location: tests\user-journey.spec.ts:75:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/\\d+ משרות|matches found|משרות שנמצאו/').or(locator('a[href*=\'drushim\'], a[href*=\'alljobs\'], a[href*=\'linkedin\'], a[href*=\'comeet\']')).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=/\\d+ משרות|matches found|משרות שנמצאו/').or(locator('a[href*=\'drushim\'], a[href*=\'alljobs\'], a[href*=\'linkedin\'], a[href*=\'comeet\']')).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
    - generic [ref=e38]:
      - generic [ref=e39]:
        - img [ref=e42]
        - heading "Work Hunter" [level=1] [ref=e48]
        - paragraph [ref=e49]: הסוכן האישי שלך לחיפוש עבודה
      - generic [ref=e50]:
        - generic [ref=e51]:
          - generic [ref=e52]: ספר/י לי על עצמך
          - textbox "ספר/י הכל — רקע, כישורים, ניסיון, מה אתה/את מחפש/ת, ציפיות שכר, מיקום, אילוצים (הריון, ילדים, מילואים, נסיעות). ככל שתשתף/י יותר — ההתאמות יהיו מדויקות יותר." [active] [ref=e53]: בבקשה חפש לי משרות עכשיו לפי כל מה שסיפרתי לך.
        - generic [ref=e56]: או העלה/י קורות חיים
        - generic [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - paragraph [ref=e61]: גרור/י קובץ PDF לכאן או לחץ/י לבחירה
        - button "התחל/י חיפוש עבודה" [ref=e62] [cursor=pointer]
        - paragraph [ref=e63]: המידע שלך מעובד בצורה מאובטחת ואינו נשמר לצמיתות.
  - alert [ref=e64]
```

# Test source

```ts
  34  |   }
  35  | 
  36  |   // Fill in fake credit card details
  37  |   await page.getByPlaceholder("0000 0000 0000 0000").fill("4242 4242 4242 4242");
  38  |   await page.waitForTimeout(400);
  39  | 
  40  |   await page.getByPlaceholder("MM/YY").fill("12/28");
  41  |   await page.waitForTimeout(400);
  42  | 
  43  |   await page.getByPlaceholder("123").fill("123");
  44  |   await page.waitForTimeout(400);
  45  | 
  46  |   await page.getByPlaceholder(/ישראל ישראלי|name/i).fill("Test User");
  47  |   await page.waitForTimeout(600);
  48  | 
  49  |   // Click the pay button (text contains "שלם")
  50  |   const payBtn = page.locator("button", { hasText: /שלם|Pay/i }).last();
  51  |   await expect(payBtn).toBeEnabled();
  52  |   await payBtn.click();
  53  | 
  54  |   // Wait for the success screen
  55  |   await expect(page.locator("h1", { hasText: /הרכישה הושלמה|Purchase complete/i }))
  56  |     .toBeVisible({ timeout: 15_000 });
  57  | 
  58  |   // ── Verify in subscription page ──────────────────────────────────────────
  59  |   await page.goto(`${BASE}/subscription`);
  60  |   await page.waitForLoadState("networkidle");
  61  |   await page.waitForTimeout(2000);
  62  | 
  63  |   // The subscription page should NOT show "no active subscription"
  64  |   // It should show the plan name (Full Journey / המסלול המלא)
  65  |   const pageText = await page.locator("body").innerText();
  66  |   const hasPlan =
  67  |     /Full Journey|Career Boost|מסלול מלא|Career|Boost/i.test(pageText) ||
  68  |     !/אין מנוי פעיל|no active subscription/i.test(pageText);
  69  | 
  70  |   expect(hasPlan).toBe(true);
  71  | });
  72  | 
  73  | // ─── TEST 2 · Job search chat → inline jobs → saved conversation ──────────────
  74  | 
  75  | test("2 · Job search: conversation → inline job cards → saved in profile", async ({ page }) => {
  76  |   test.setTimeout(5 * 60_000); // AI responses can take up to 40s each
  77  |   await page.goto(BASE);
  78  |   await page.waitForLoadState("networkidle");
  79  |   await page.waitForTimeout(1000);
  80  | 
  81  |   // Click "אני רק מחפש/ת עבודה" (just looking for work)
  82  |   const jobBtn = page.locator("button", { hasText: /אני רק מחפש|Just Looking for Work|Looking for work/i }).first();
  83  |   await expect(jobBtn).toBeVisible({ timeout: 8000 });
  84  |   await jobBtn.click();
  85  |   await page.waitForTimeout(1500);
  86  | 
  87  |   // Wait for chat textarea to appear
  88  |   const ta = page.locator("textarea").last();
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
> 134 |   ).toBeVisible({ timeout: 10_000 });
      |     ^ Error: expect(locator).toBeVisible() failed
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
  189 |   await expect(diagnosisCard).toBeVisible({ timeout: 8000 });
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
```