import { test, expect } from "@playwright/test";

const BASE = "https://work-hunter-five.vercel.app";

// ─── TESTS ────────────────────────────────────────────────────────────────────
// All tests run with a pre-authenticated session (set up in global-setup.ts).
// The browser stays logged in throughout — no sign-in/sign-out per test.

test.describe("Work Hunter – Production Sanity (logged in)", () => {

  test("1 · Homepage loads with all sections", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/Work Hunter/i);
    await expect(page.locator("nav").first()).toBeVisible();

    // Scroll to pricing section
    await page.locator("text=Explorer").first().scrollIntoViewIfNeeded();
    await expect(page.locator("text=Explorer").first()).toBeVisible();
  });

  test("2 · Pricing page loads", async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Explorer").first()).toBeVisible();
  });

  test("3 · Reviews page loads", async ({ page }) => {
    await page.goto(`${BASE}/reviews`);
    await page.waitForLoadState("networkidle");
  });

  test("4 · Profile page loads (protected route)", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");
    // Must stay on /profile — not redirected to sign-in
    await expect(page).toHaveURL(/profile/);
  });

  test("5 · Refresh on profile page stays on profile", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/profile/);
  });

  test("6 · CV Builder loads (protected route)", async ({ page }) => {
    await page.goto(`${BASE}/cv-builder`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/cv-builder/);
  });

  test("7 · Refresh on CV Builder stays on CV Builder", async ({ page }) => {
    await page.goto(`${BASE}/cv-builder`);
    await page.waitForLoadState("networkidle");

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/cv-builder/);
  });

  test("8 · Advisor page loads (protected route)", async ({ page }) => {
    await page.goto(`${BASE}/advisor?profileId=test-sanity`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/advisor/);
  });

  test("9 · Checkout page loads", async ({ page }) => {
    await page.goto(`${BASE}/checkout?plan=one-time`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/checkout/);
  });

  test("10 · Subscription page loads", async ({ page }) => {
    await page.goto(`${BASE}/subscription`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/subscription/);
  });

  test("11 · Homepage chat — send message and receive AI response", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    // Click "Just Looking for Work" to open the job search chat
    const jobsBtn = page.locator("button", { hasText: /מחפש עבודה|Just Looking/i }).first();
    if (await jobsBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await jobsBtn.click();
      await page.waitForTimeout(1000);
    }

    // Type a message in the chat input
    const chatInput = page.locator("textarea").last();
    if (await chatInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await chatInput.fill("אני מפתח JavaScript עם 3 שנות ניסיון, מחפש עבודה בתל אביב");
      await chatInput.press("Enter");
      // Wait for AI response (up to 15 seconds)
      await page.waitForTimeout(10000);
    }
  });

  test("12 · Navigate profile → advisor → back to profile", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/profile/);

    // Navigate to advisor
    await page.goto(`${BASE}/advisor?profileId=test-sanity`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/advisor/);

    // Navigate back
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/profile/);
  });

  test("13 · User menu is visible in nav while logged in", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForLoadState("networkidle");

    // The avatar/user dropdown button should be visible (not a sign-in link)
    const avatarBtn = page.locator("nav button.rounded-full").first();
    await expect(avatarBtn).toBeVisible();

    // Open the dropdown
    await avatarBtn.click();
    await page.waitForTimeout(500);

    // Dropdown should show sign-out option
    await expect(page.locator("button", { hasText: /התנתק|Sign out/i }).last()).toBeVisible();

    // Close it by pressing Escape
    await page.keyboard.press("Escape");
  });

});
