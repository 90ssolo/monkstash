import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests of the web wallet against the local dev server on stagenet
 * (apps/web/.env.local with NEXT_PUBLIC_MONERO_NETWORK=stagenet). Most tests run the wallet in
 * simulation mode (canned balances, no node), so they are fast and repeatable. Tests tagged
 * @network use the public stagenet node through the dev relay and are run on their own.
 *
 * Throwaway stagenet wallets come from apps/web/test-wallets.local.json (never committed).
 * Tests that need them are skipped when the file is missing.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3210",
    // The Chrome installed on this machine: no browser download needed.
    channel: process.env.E2E_CHANNEL ?? "chrome",
    headless: true,
    trace: "retain-on-failure",
    acceptDownloads: true,
  },
  webServer: {
    command: "pnpm --filter @quietmint/web dev",
    url: "http://localhost:3210/api/network-stats",
    reuseExistingServer: true,
    timeout: 180_000,
    cwd: "../..",
  },
});
