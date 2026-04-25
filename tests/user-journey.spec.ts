import { test, expect, Page } from "@playwright/test";

const BASE = "https://work-hunter-five.vercel.app";

// ─── helpers ──────────────────────────────────────────────────────────────────

async function waitForNoSpinner(page: Page, timeout = 45_000) {
  // Wait until the bouncing-dot loader disappears
  await page.waitForFunction(
    () => !document.querySelector(".animate-bounce"),
    { timeout },
  ).catch(() => {}); // ok if there was no spinner
}

async function chatAndWait(page: Page, text: string, waitMs = 25_000) {
  const ta = page.locator("textarea").last();
  await ta.fill(text);
  await ta.press("Enter");
  await page.waitForTimeout(waitMs); // give AI time to respond
}

// ─── TEST 1 · Checkout + subscription verification ────────────────────────────

test("1 · Purchase subscription with credit card and verify it is active", async ({ page }) => {
  // Navigate directly to the Full Journey plan checkout
  await page.goto(`${BASE}/checkout?plan=one-time`);
  await page.waitForLoadState("networkidle");

  // Make sure "כרטיס" (card) tab is selected — it's the default
  const cardTab = page.locator("button", { hasText: /כרטיס|Card/i }).first();
  if (await cardTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cardTab.click();
    await page.waitForTimeout(500);
  }

  // Fill in fake credit card details
  await page.getByPlaceholder("0000 0000 0000 0000").fill("4242 4242 4242 4242");
  await page.waitForTimeout(400);

  await page.getByPlaceholder("MM/YY").fill("12/28");
  await page.waitForTimeout(400);

  await page.getByPlaceholder("123").fill("123");
  await page.waitForTimeout(400);

  await page.getByPlaceholder(/ישראל ישראלי|name/i).fill("Test User");
  await page.waitForTimeout(600);

  // Click the pay button (text contains "שלם")
  const payBtn = page.locator("button", { hasText: /שלם|Pay/i }).last();
  await expect(payBtn).toBeEnabled();
  await payBtn.click();

  // Wait for the success screen
  await expect(page.locator("h1", { hasText: /הרכישה הושלמה|Purchase complete/i }))
    .toBeVisible({ timeout: 15_000 });

  // ── Verify in subscription page ──────────────────────────────────────────
  await page.goto(`${BASE}/subscription`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // The subscription page should NOT show "no active subscription"
  // It should show the plan name (Full Journey / המסלול המלא)
  const pageText = await page.locator("body").innerText();
  const hasPlan =
    /Full Journey|Career Boost|מסלול מלא|Career|Boost/i.test(pageText) ||
    !/אין מנוי פעיל|no active subscription/i.test(pageText);

  expect(hasPlan).toBe(true);
});

// ─── TEST 2 · Job search chat → inline jobs → saved conversation ──────────────

test("2 · Job search: conversation → inline job cards → saved in profile", async ({ page }) => {
  test.setTimeout(5 * 60_000); // AI responses can take up to 40s each
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // Click "אני רק מחפש/ת עבודה" (just looking for work)
  const jobBtn = page.locator("button", { hasText: /אני רק מחפש|Just Looking for Work|Looking for work/i }).first();
  await expect(jobBtn).toBeVisible({ timeout: 8000 });
  await jobBtn.click();
  await page.waitForTimeout(1500);

  // Wait for chat textarea to appear
  const ta = page.locator("textarea").last();
  await expect(ta).toBeVisible({ timeout: 8000 });

  // ── Message 1: profile with constraints ───────────────────────────────────
  await chatAndWait(
    page,
    "שלום! אני מתכנת Full Stack עם 4 שנות ניסיון ב-React ו-Node.js. גר בתל אביב, מחפש עבודה היברידית או מרחוק. " +
    "יש לי ילד קטן אז אני צריך גמישות בשעות. מנסיון קודם עבדתי בסטארטאפים. " +
    "המשכורת המינימלית שמקובלת עלי היא 25,000 שקל.",
    20_000,
  );

  // ── Message 2: refine ────────────────────────────────────────────────────
  await chatAndWait(
    page,
    "אני לא מוכן לנסוע לאזור מחוץ לגוש דן. רצוי חברות שעובדות עם TypeScript ו-AWS.",
    20_000,
  );

  // ── Message 3: trigger search ────────────────────────────────────────────
  await chatAndWait(
    page,
    "אוקיי, אני חושב שנתתי לך מספיק מידע. תמצא לי משרות מתאימות בבקשה!",
    40_000, // AI may run job search here — longer timeout
  );

  // ── Verify inline job cards appeared ────────────────────────────────────
  // Jobs show as "N משרות שנמצאו" or job card elements
  const jobsFound =
    (await page.locator("text=/\\d+ משרות שנמצאו|matches found/").count()) > 0 ||
    (await page.locator("a[href*='drushim'], a[href*='alljobs'], a[href*='linkedin']").count()) > 0;

  if (!jobsFound) {
    // Try one more prompt to trigger the search
    await chatAndWait(
      page,
      "בבקשה חפש לי משרות עכשיו לפי כל מה שסיפרתי לך.",
      40_000,
    );
  }

  // At this point jobs should be inline in the chat
  await expect(
    page.locator("text=/\\d+ משרות|matches found|משרות שנמצאו/").or(
      page.locator("a[href*='drushim'], a[href*='alljobs'], a[href*='linkedin'], a[href*='comeet']")
    ).first()
  ).toBeVisible({ timeout: 10_000 });

  // ── Check saved conversation in profile ────────────────────────────────
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Scroll down to conversations section
  const convSection = page.locator("text=/שיחות|Conversations|שיחה/i").first();
  if (await convSection.isVisible({ timeout: 5000 }).catch(() => false)) {
    await convSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    // There should be at least one saved conversation
    const convCards = page.locator("a[href*='/conversations/']");
    await expect(convCards.first()).toBeVisible({ timeout: 5000 });
  }
});

// ─── TEST 3 · Career advisor: full journey with stage-map verification ─────────

test("3 · Career advisor: stop at stage 3 → profile shows correct stage → complete all → see summary", async ({ page }) => {
  test.setTimeout(15 * 60_000); // AI calls at each stage can be slow

  // ── Navigate to advisor (uses logged-in user's actual ID) ───────────────
  await page.goto(`${BASE}/advisor`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  // ── Dismiss PreJourneyIntro ("בואו נתחיל") if showing ───────────────────
  const preIntroBtn = page.locator("button", { hasText: /בואו נתחיל/i }).first();
  if (await preIntroBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await preIntroBtn.click();
    await page.waitForTimeout(1000);
  }

  // ── Handle SelfIntro wizard (name → basics → story → loves → dislikes → welcome) ──
  const nameField = page.getByPlaceholder(/השם שלך|Your name/i);
  if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameField.fill("Playwright Test");
    await page.waitForTimeout(400);
    // Click "הלאה" / "Next" or "סיימתי" up to 6 times to get through all steps
    for (let i = 0; i < 6; i++) {
      const btn = page.locator("button", { hasText: /הלאה|Next|סיימתי|יוצאים לדרך|Done/i }).last();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false) &&
          await btn.isEnabled().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
    await page.waitForTimeout(1000);
  }

  // ── STAGE 1 · Diagnosis ─────────────────────────────────────────────────
  // Click the Diagnosis stage card in JourneyMap (label: "מיפוי חוזקות וכישורים")
  const diagnosisCard = page.locator("button", { hasText: /מיפוי חוזקות|Personality diagnosis|מיפוי/i }).first();
  await expect(diagnosisCard).toBeVisible({ timeout: 8000 });
  await diagnosisCard.click();
  await page.waitForTimeout(800);

  // Intro screen → click Start
  const diagStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  await expect(diagStart).toBeVisible({ timeout: 5000 });
  await diagStart.click();
  await page.waitForTimeout(600);

  // Answer 6 questions: click the first checkbox option for each
  for (let q = 0; q < 6; q++) {
    // Click the first label/option visible
    const firstOption = page.locator("label").first();
    if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOption.click();
      await page.waitForTimeout(400);
    }

    // Click "Next" or "Analyze" button
    const nextBtn = page.getByRole("button", { name: /הבא|Next|נתח|Analyze/i }).last();
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    await nextBtn.click();
    await page.waitForTimeout(500);
  }

  // Wait for AI to analyze (shows loading screen then returns to map)
  await waitForNoSpinner(page, 60_000);
  await page.waitForTimeout(2000);

  // ── STAGE 2 · Direction ─────────────────────────────────────────────────
  // We should be back at the Journey Map now
  // Direction stage label: "כיוון חיים" / "Life direction"
  const directionCard = page.locator("button", { hasText: /כיוון חיים|Life direction/i }).first();
  await expect(directionCard).toBeVisible({ timeout: 10_000 });
  await directionCard.click();
  await page.waitForTimeout(800);

  // Intro → Start
  const dirStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  if (await dirStart.isVisible({ timeout: 4000 }).catch(() => false)) {
    await dirStart.click();
    await page.waitForTimeout(600);
  }

  // Select "Employee" path (first option)
  const employeeBtn = page.locator("button", { hasText: /שכיר|Employee|עובד/i }).first();
  if (await employeeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await employeeBtn.click();
    await page.waitForTimeout(500);
  } else {
    // Fallback: click first path button
    await page.locator("button.rounded-2xl").first().click();
    await page.waitForTimeout(500);
  }

  // Optionally fill goal text
  const goalTa = page.locator("textarea").first();
  if (await goalTa.isVisible({ timeout: 2000 }).catch(() => false)) {
    await goalTa.fill("אני רוצה למצוא עבודה יציבה בתחום הפיתוח");
    await page.waitForTimeout(400);
  }

  // Click Analyze
  const analyzeBtn = page.getByRole("button", { name: /נתח|Analyze|המשך|Continue/i }).last();
  await expect(analyzeBtn).toBeVisible({ timeout: 5000 });
  await analyzeBtn.click();

  // Wait for AI direction analysis
  await waitForNoSpinner(page, 60_000);
  await page.waitForTimeout(2000);

  // ── At this point currentStage should be "cv" (stage 3) ─────────────────
  // Navigate away to profile WITHOUT completing stage 3
  await page.goto(`${BASE}/profile`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // ── Verify profile shows stage 3 (CV review) as the current stage ────────
  // The profile shows "2 of 4 stages done" and circle 3 pulses purple
  const profileText = await page.locator("body").innerText();

  // Check "X of 4 stages done" text
  const stagesMatch = /2.*4|שלב 2|2 מתוך 4/i.test(profileText);
  expect(stagesMatch).toBe(true);

  // Check that the 3rd circle is the current (purple pulsing = animate-pulse + bg-purple)
  const currentCircle = page.locator(".animate-pulse.bg-purple-600, .bg-purple-600.ring-4").first();
  await expect(currentCircle).toBeVisible({ timeout: 5000 });

  // The CV review label should be visible near the current circle
  await expect(page.locator("text=/קורות חיים|CV review/i").first()).toBeVisible({ timeout: 5000 });

  // ── Continue from profile — click "המשך / Continue" ──────────────────────
  const continueBtn = page.locator("a, button", { hasText: /המשך|Continue/i }).first();
  await expect(continueBtn).toBeVisible({ timeout: 5000 });
  await continueBtn.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  // ── STAGE 3 · CV Review — click stage card and SKIP ──────────────────────
  // CV stage label: "שיפור קורות חיים" / "CV review"
  const cvCard = page.locator("button", { hasText: /שיפור קורות חיים|CV review/i }).first();
  await expect(cvCard).toBeVisible({ timeout: 8000 });
  await cvCard.click();
  await page.waitForTimeout(800);

  // On the CV gate screen, click "Skip" / "דלג"
  const skipBtn = page.locator("button", { hasText: /דלג|Skip|ללא קורות/i }).first();
  await expect(skipBtn).toBeVisible({ timeout: 8000 });
  await skipBtn.click();
  await page.waitForTimeout(1000);

  // ── STAGE 4 · Strategy ───────────────────────────────────────────────────
  // Strategy label: "אסטרטגיית חיפוש" / "Search strategy"
  const strategyCard = page.locator("button", { hasText: /אסטרטגיית חיפוש|Search strategy/i }).first();
  await expect(strategyCard).toBeVisible({ timeout: 8000 });
  await strategyCard.click();
  await page.waitForTimeout(800);

  // Intro → Start
  const stratStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  if (await stratStart.isVisible({ timeout: 4000 }).catch(() => false)) {
    await stratStart.click();
    await page.waitForTimeout(600);
  }

  // Fill notes and submit
  const stratTa = page.locator("textarea").first();
  await expect(stratTa).toBeVisible({ timeout: 8000 });
  await stratTa.fill(
    "אני מפתח Full Stack עם 4 שנות ניסיון. מחפש עבודה בתחום הטכנולוגיה בגוש דן, " +
    "היברידי או מרחוק, עם גמישות בשעות. תחומי עניין: React, TypeScript, Node.js, AWS."
  );
  await page.waitForTimeout(400);

  const stratSubmit = page.getByRole("button", { name: /בנה|Build|שלח|Submit|המשך/i }).last();
  await expect(stratSubmit).toBeVisible({ timeout: 5000 });
  await stratSubmit.click();

  // Wait for AI strategy analysis (can take up to 40s)
  await waitForNoSpinner(page, 60_000);
  await page.waitForTimeout(3000);

  // ── All stages done → Summary should appear ──────────────────────────────
  const summaryHeading = page.locator("h1", { hasText: /סיכום|Summary|הסיכום|מסע/i }).first();
  await expect(summaryHeading).toBeVisible({ timeout: 15_000 });

  // ── Verify summary content matches what we discussed ─────────────────────
  const summaryText = await page.locator("body").innerText();

  // Diagnosis result should contain MBTI / career insights
  const hasDiagnosisContent =
    /INTJ|ENFP|INTP|ISTJ|INFJ|ENTJ|ESTJ|ENTP|INFP|ISTP|ESFJ|ISFJ|ESFP|ISFP|ESTP|ENFJ/i.test(summaryText) ||
    /חוזקות|strengths|כיוון|direction|תפקיד|role/i.test(summaryText);
  expect(hasDiagnosisContent).toBe(true);

  // Direction should show chosen path (employee)
  const hasDirectionContent = /שכיר|employee|עובד/i.test(summaryText);
  expect(hasDirectionContent).toBe(true);

  // Strategy should reference companies or plan
  const hasStrategyContent =
    /חברות|companies|לינקדאין|linkedin|אסטרטגיה|strategy|30/i.test(summaryText);
  expect(hasStrategyContent).toBe(true);

  // ── Verify there is a Bonus Interview button (not a PDF — PDF is in CV Builder) ──
  const interviewBtn = page.locator("button", { hasText: /ראיון|Interview/i }).first();
  await expect(interviewBtn).toBeVisible({ timeout: 5000 });

  // Scroll down so the user sees the full summary
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
  await page.waitForTimeout(2000);

  // ── Navigate to CV Builder and verify PDF download exists there ──────────
  await page.goto(`${BASE}/cv-builder`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  const pdfBtn = page.locator("button", { hasText: /הורד|Download|PDF/i }).first();
  await expect(pdfBtn).toBeVisible({ timeout: 8000 });
});
