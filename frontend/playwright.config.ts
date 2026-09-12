import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    // Both frontend AND backend are started (the root "dev" script) because
    // e2e tests need a real API responding, even if only with mock data.
    // SERPAPI_KEY is forced empty here regardless of backend/.env so e2e
    // runs are deterministic and never spend real SerpApi quota.
    command: "cd .. && SERPAPI_KEY= npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
