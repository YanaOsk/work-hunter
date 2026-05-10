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
  projects: [
    {
      name: "prod-users",
      testMatch: "**/prod-ui-test.spec.ts",
      use: {
        headless: false,
        launchOptions: { slowMo: 200 },
        viewport: { width: 1280, height: 900 },
        storageState: { cookies: [], origins: [] },
        video: "retain-on-failure",
        screenshot: "on",
        locale: "he-IL",
      },
    },
    {
      name: "default",
      testIgnore: "**/prod-ui-test.spec.ts",
      use: {
        storageState: "tests/.auth.json",
      },
    },
  ],
});
