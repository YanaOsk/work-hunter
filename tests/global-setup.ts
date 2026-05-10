import { chromium } from "@playwright/test";
import * as fs from "fs";

const BASE = "https://work-hunter-five.vercel.app";
const TEST_EMAIL = "testuser_sanity@workhunter.dev";
const TEST_PASSWORD = "Test1234!";

export default async function globalSetup() {
  // Write empty auth state first so prod-ui-test (which handles its own auth) never blocks
  const emptyState = { cookies: [], origins: [] };
  if (!fs.existsSync("tests/.auth.json")) {
    fs.writeFileSync("tests/.auth.json", JSON.stringify(emptyState));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE}/auth/signin`);
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder(/מייל|Email/i).fill(TEST_EMAIL);
    await page.getByPlaceholder(/סיסמ|Password/i).first().fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /כניסה|Sign In|התחבר/i }).last().click();
    await page.waitForURL(/profile|advisor|\/$/, { timeout: 15000 });
    await page.context().storageState({ path: "tests/.auth.json" });
    console.log("[global-setup] Auth saved for default tests");
  } catch {
    console.log("[global-setup] Sanity user not found — writing empty auth state. prod-ui-test handles its own auth.");
    fs.writeFileSync("tests/.auth.json", JSON.stringify(emptyState));
  } finally {
    await browser.close();
  }
}
