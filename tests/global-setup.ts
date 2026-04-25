import { chromium } from "@playwright/test";

const BASE = "https://work-hunter-five.vercel.app";
const TEST_EMAIL = "testuser_sanity@workhunter.dev";
const TEST_PASSWORD = "Test1234!";

export default async function globalSetup() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE}/auth/signin`);
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder(/מייל|Email/i).fill(TEST_EMAIL);
  await page.getByPlaceholder(/סיסמ|Password/i).first().fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /כניסה|Sign In|התחבר/i }).last().click();
  await page.waitForURL(/profile|advisor/, { timeout: 15000 });

  // Save the authenticated session to disk
  await page.context().storageState({ path: "tests/.auth.json" });
  await browser.close();
}
