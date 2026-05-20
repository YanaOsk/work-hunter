/**
 * 5 full UI tests on production — non-tech users, different constraints.
 * Each test: register → Scout job search → Career Advisor.
 * Run with: npx playwright test prod-ui-test.spec.ts --project=prod-users
 */
import { test, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROD = "https://work-hunter-five.vercel.app";
const SS = path.join(process.cwd(), "tests", "screenshots");
if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true });

async function shot(page: Page, name: string) {
  try {
    await page.screenshot({ path: path.join(SS, `${name}.png`), fullPage: false });
  } catch {}
}

const users = [
  {
    id: "teacher",
    name: "מיכל כהן",
    email: "test-teacher@workhunter.dev",
    password: "Test1234",
    cvText:
      "שמי מיכל כהן, מורה לאנגלית עם 8 שנות ניסיון בחינוך יסודי ותיכון. לימדתי ב-3 בתי ספר, ניהלתי קבוצת למידה של 25 תלמידים ויש לי תעודת הוראה מהאוניברסיטה הפתוחה. גרה בירושלים, מחפשת עבודה היברידית, ציפיית שכר 12,000 שקל. יש לי ילד קטן אז צריכה שעות גמישות.",
    advisorText:
      "אני מורה לאנגלית מזה 8 שנים ורוצה לשדרג לתפקיד ניהולי בחינוך או לעבור לתחום ההדרכה הארגונית.",
  },
  {
    id: "restaurant",
    name: "יוסף מזרחי",
    email: "test-restaurant@workhunter.dev",
    password: "Test1234",
    cvText:
      "יוסף מזרחי, מנהל מסעדה ומטבח עם 10 שנות ניסיון. ניהלתי מסעדה של 60 מקומות, צוות של 15 עובדים, תקציב שנתי של 2M שקל. גר בחיפה, מחפש עבודה בחיפה או קריות, שכר 18,000-22,000 שקל. מעדיף לא לנסוע לתל אביב.",
    advisorText:
      "אני מנהל מסעדה כבר 10 שנים ורוצה לעבור לתפקיד מנהל תפעול או ניהול שרשרת אספקה בתחום המזון.",
  },
  {
    id: "physio",
    name: "שירה לוי",
    email: "test-physio@workhunter.dev",
    password: "Test1234",
    cvText:
      "שירה לוי, פיזיותרפיסטית מוסמכת עם 5 שנות ניסיון. עבדתי בבית חולים איכילוב ובמרפאה פרטית בתל אביב. מתמחה בשיקום ופיזיותרפיה ספורטיבית. גרה בתל אביב, מחפשת עבודה במרפאה פרטית, שכר 18,000 שקל, לא עובדת בשבתות.",
    advisorText:
      "אני פיזיותרפיסטית ורוצה לפתוח מרפאה עצמאית בשנה-שנתיים הקרובות. לא יודעת מאיפה להתחיל.",
  },
  {
    id: "lawyer",
    name: "אמיר דוד",
    email: "test-lawyer@workhunter.dev",
    password: "Test1234",
    cvText:
      "אמיר דוד, עורך דין מסחרי עם 12 שנות ניסיון. התמחיתי בדיני חברות, חוזים ומיזוגים. עבדתי ב-3 משרדי עורכי דין בתל אביב. יש לי רישיון ישראלי ואמריקאי. גר ברמת גן, מחפש תפקיד יועץ משפטי פנים-ארגוני בחברת הייטק, שכר 35,000-45,000 שקל.",
    advisorText:
      "אני עורך דין מסחרי שרוצה לעשות מעבר לתפקיד General Counsel בחברת טכנולוגיה. יש לי ניסיון אבל לא יודע איך להציג את עצמי לעולם ההייטק.",
  },
  {
    id: "marketing",
    name: "נועה גולן",
    email: "test-marketing@workhunter.dev",
    password: "Test1234",
    cvText:
      "נועה גולן, מנהלת שיווק ומותג עם 7 שנות ניסיון. עבדתי כ-Marketing Manager בחברות B2C ו-B2B, ניהלתי קמפיינים דיגיטליים ותקציב שיווק של 500K שקל. גרה בהרצליה, מחפשת עבודה היברידית, שכר 25,000-30,000 שקל. יש לי הריון בשבוע 14.",
    advisorText:
      "אני מנהלת שיווק בהריון ומחפשת עבודה. חוששת מאפליה בתהליכי גיוס. רוצה עצות איך להתמודד עם זה.",
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

async function registerOrLogin(page: Page, user: (typeof users)[0]) {
  await page.goto(`${PROD}/auth/signin`);
  await page.waitForTimeout(2000);
  await shot(page, `${user.id}_01_signin_page`);

  // Try register tab first (Hebrew text: "הרשמה")
  const registerTab = page.getByRole("button", { name: /הרשמה|Create account/i }).first();
  if (await registerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await registerTab.click();
    await page.waitForTimeout(500);
  }

  // Fill name (only on register tab)
  const nameInput = page.getByPlaceholder(/שם מלא|Full name/i);
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill(user.name);
  }

  // Fill email
  await page.getByPlaceholder(/אימייל|Email/i).fill(user.email);

  // Fill password
  await page.getByPlaceholder(/סיסמה|Password/i).first().fill(user.password);

  await shot(page, `${user.id}_02_form_filled`);

  // Submit (Hebrew: "יצירת חשבון" or "כניסה")
  await page.getByRole("button", { name: /יצירת חשבון|Create account|כניסה|Sign in/i }).last().click();
  await page.waitForTimeout(4000);
  await shot(page, `${user.id}_03_after_submit`);

  // Handle "user already exists" error — switch to sign-in
  const errorEl = page.locator("p.text-red-400");
  if (await errorEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    const errorText = await errorEl.textContent();
    console.log(`  [${user.id}] Error: ${errorText} — switching to sign-in tab`);
    const signinTab = page.getByRole("button", { name: /כניסה|Sign in/i }).first();
    await signinTab.click();
    await page.waitForTimeout(500);
    await page.getByPlaceholder(/אימייל|Email/i).fill(user.email);
    await page.getByPlaceholder(/סיסמה|Password/i).first().fill(user.password);
    await page.getByRole("button", { name: /כניסה|Sign in/i }).last().click();
    await page.waitForTimeout(4000);
    await shot(page, `${user.id}_03b_signin_retry`);
  }
}

async function dismissWelcomeAndGoToScout(page: Page, userId: string) {
  // WelcomeModal shows after registration — click "חיפוש עבודה"
  const jobsBtn = page.getByRole("button", { name: /חיפוש עבודה|Job Search/i });
  if (await jobsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`  [${userId}] Welcome modal — clicking Job Search`);
    await shot(page, `${userId}_04_welcome_modal`);
    await jobsBtn.click();
    await page.waitForTimeout(3000);
  } else {
    // Already on a page, navigate to home job search
    await page.goto(PROD);
    await page.waitForTimeout(2000);
    const scoutCard = page.getByText(/חיפוש עבודה/i).first();
    if (await scoutCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await scoutCard.click();
      await page.waitForTimeout(2000);
    }
  }
  await shot(page, `${userId}_05_scout_upload`);
}

async function dismissWelcomeAndGoToAdvisor(page: Page, userId: string) {
  const advisorBtn = page.getByRole("button", { name: /ייעוץ קריירה|Career/i });
  if (await advisorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await advisorBtn.click();
    await page.waitForTimeout(3000);
  } else {
    await page.goto(`${PROD}/advisor`);
    await page.waitForTimeout(2000);
  }
  await shot(page, `${userId}_10_advisor`);
}

async function runScoutFlow(page: Page, user: (typeof users)[0]) {
  // Find the CV textarea
  const textarea = page.locator("textarea").first();
  if (!(await textarea.isVisible({ timeout: 8000 }).catch(() => false))) {
    console.log(`  [${user.id}] textarea not found on Scout upload — trying navigation`);
    await page.goto(PROD);
    await page.waitForTimeout(2000);
    await page.getByText(/חיפוש עבודה/i).first().click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  const ta = page.locator("textarea").first();
  if (await ta.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ta.fill(user.cvText);
    await page.waitForTimeout(500);
    await shot(page, `${user.id}_06_cv_text_filled`);

    // Click the submit/analyze button
    const submitBtn = page
      .getByRole("button", { name: /התחל חיפוש|Start Search|שלח|המשך|אנל/i })
      .first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
    } else {
      // fallback: find any purple primary button
      await page.locator("button.bg-purple-600, button.bg-purple-500").first().click().catch(() => {});
    }
    console.log(`  [${user.id}] CV submitted — waiting for Scout chat`);
    await page.waitForTimeout(10000);
    await shot(page, `${user.id}_07_scout_chat_loaded`);
  } else {
    console.log(`  [${user.id}] WARNING: could not find textarea`);
    await shot(page, `${user.id}_06_no_textarea`);
    return;
  }

  // Wait longer for Scout to finish loading
  await page.waitForTimeout(15000);
  await shot(page, `${user.id}_08_scout_response`);

  // Only send a follow-up if: chat input is visible AND no job cards yet AND no error shown
  const jobCard = page.locator('[class*="job"], [class*="result"], [class*="card"]').first();
  const errorMsg = page.getByText(/שגיאה זמנית|Temporary error/i).first();
  const hasJobs = await jobCard.isVisible({ timeout: 1000 }).catch(() => false);
  const hasError = await errorMsg.isVisible({ timeout: 1000 }).catch(() => false);

  if (!hasJobs && !hasError) {
    const chatInput = page.locator('input[placeholder*="כתוב"], textarea[placeholder*="כתוב"]').last();
    const chatInputFallback = page.locator("textarea").last();
    let inputEl = null;
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) inputEl = chatInput;
    else if (await chatInputFallback.isVisible({ timeout: 2000 }).catch(() => false)) inputEl = chatInputFallback;

    if (inputEl) {
      console.log(`  [${user.id}] Sending follow-up message`);
      await inputEl.fill("כן בבקשה תחפש לי משרות");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(20000);
      await shot(page, `${user.id}_08b_after_reply`);
    }
  }

  // Final wait for job cards
  await page.waitForTimeout(5000);
  await shot(page, `${user.id}_09_jobs_results`);
  console.log(`  [${user.id}] Scout flow done`);
}

async function runAdvisorFlow(page: Page, user: (typeof users)[0]) {
  await page.waitForTimeout(2000);
  await shot(page, `${user.id}_10_advisor_landing`);

  // Step 1: PreJourneyIntro — click "בוא/י נתחיל"
  const preIntroBtn = page.locator("button", { hasText: /בואו נתחיל|בוא נתחיל|Let.s start/i }).first();
  if (await preIntroBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log(`  [${user.id}] Clicking PreJourneyIntro button`);
    await preIntroBtn.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, `${user.id}_11_after_intro`);

  // Step 2: SelfIntro wizard (name → basics → story → loves → dislikes → constraints → welcome)
  // Only shown on first visit — skip through all 7 steps
  const nameField = page.getByPlaceholder(/השם שלך|Your name/i);
  if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`  [${user.id}] SelfIntro wizard — filling name and skipping through`);
    await nameField.fill(user.name);
    await page.waitForTimeout(400);
    for (let i = 0; i < 7; i++) {
      const btn = page.locator("button", { hasText: /הלאה|Next|סיימתי|יוצאים לדרך|Done/i }).last();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false) &&
          await btn.isEnabled().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
    await page.waitForTimeout(1000);
    await shot(page, `${user.id}_12_after_selfintro`);
  }

  // Step 3: JourneyMap — click Diagnosis card
  const diagCard = page.locator("button", { hasText: /מיפוי חוזקות|Personality diagnosis/i }).first();
  if (await diagCard.isVisible({ timeout: 8000 }).catch(() => false)) {
    console.log(`  [${user.id}] Clicking Diagnosis card`);
    await diagCard.click();
    await page.waitForTimeout(800);
  } else {
    console.log(`  [${user.id}] WARNING: Diagnosis card not found`);
    await shot(page, `${user.id}_12_no_diag_card`);
    return;
  }

  // Step 4: StageIntro — click "התחל"
  const diagStart = page.getByRole("button", { name: /התחל|Start/i }).first();
  if (await diagStart.isVisible({ timeout: 5000 }).catch(() => false)) {
    await diagStart.click();
    await page.waitForTimeout(600);
  }
  await shot(page, `${user.id}_13_diagnosis_quiz`);

  // Step 5: DiagnosisTool — 6 checkbox questions then 2 freeform
  // Q1–6: click first checkbox label then "הבא"
  for (let q = 0; q < 6; q++) {
    const firstLabel = page.locator("label").first();
    if (await firstLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstLabel.click();
      await page.waitForTimeout(400);
    }
    const nextBtn = page.getByRole("button", { name: /הבא|Next/i }).last();
    if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Q7: dream — freeform textarea
  const dreamTa = page.locator("textarea").first();
  if (await dreamTa.isVisible({ timeout: 5000 }).catch(() => false)) {
    await dreamTa.fill(user.advisorText);
    await page.waitForTimeout(400);
    const nextBtn7 = page.getByRole("button", { name: /הבא|Next/i }).last();
    if (await nextBtn7.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn7.click();
      await page.waitForTimeout(500);
    }
  }

  // Q8: reputation — freeform textarea + "שלח" / submit
  const repTa = page.locator("textarea").first();
  if (await repTa.isVisible({ timeout: 5000 }).catch(() => false)) {
    await repTa.fill("אנשים אומרים שאני מקצועי ומסור ויודע לפתור בעיות בצורה יצירתית");
    await page.waitForTimeout(400);
    const submitBtn = page.getByRole("button", { name: /שלח|Submit|נתח|Analyze/i }).last();
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log(`  [${user.id}] Submitting DiagnosisTool`);
      await submitBtn.click();
    }
  }
  await shot(page, `${user.id}_14_diagnosis_submitted`);

  // Wait for AI to finish and JourneyMap to reappear (up to 90s)
  await page.waitForSelector("button:has-text('כיוון חיים'), button:has-text('Life direction')", {
    timeout: 90_000,
    state: "visible",
  }).catch(() => page.waitForTimeout(45_000));
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await shot(page, `${user.id}_15_advisor_done`);
  console.log(`  [${user.id}] Advisor flow done`);
}

// ─── tests ────────────────────────────────────────────────────────────────────

for (const user of users) {
  test(`[${user.id}] ${user.name}`, async ({ page }) => {
    test.setTimeout(300000); // 5 min per user

    console.log(`\n${"=".repeat(60)}`);
    console.log(`TEST: ${user.name} (${user.email})`);
    console.log(`${"=".repeat(60)}`);

    // 1. Register / Login
    await registerOrLogin(page, user);

    // ── SCOUT FLOW ──
    await dismissWelcomeAndGoToScout(page, user.id);
    await runScoutFlow(page, user);

    // ── ADVISOR FLOW ──
    // Go back to home to navigate to advisor
    await page.goto(PROD);
    await page.waitForTimeout(2000);
    await shot(page, `${user.id}_home_between`);

    const advisorCard = page.getByText(/ייעוץ קריירה/i).first();
    if (await advisorCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await advisorCard.click();
      await page.waitForTimeout(2000);
    } else {
      await page.goto(`${PROD}/advisor`);
      await page.waitForTimeout(2000);
    }
    await runAdvisorFlow(page, user);

    await shot(page, `${user.id}_99_done`);
    console.log(`✅ DONE: ${user.name}`);
  });
}
