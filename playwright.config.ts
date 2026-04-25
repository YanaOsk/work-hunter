import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  globalSetup: "./tests/global-setup.ts",
  use: {
    headless: false,
    launchOptions: { slowMo: 350 },
    viewport: { width: 1280, height: 800 },
    storageState: "tests/.auth.json",
    video: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["list"]],
});
