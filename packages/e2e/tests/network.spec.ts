import { expect, test } from "@playwright/test";
import { openWallet, setPassword, testWallets, wallet } from "./helpers";

// Live stagenet through the dev relay: slower and depends on public nodes, so tagged @network
// and run on their own (pnpm e2e:network).
test.skip(!testWallets().length, "needs apps/web/test-wallets.local.json");

test("@network stagenet: sync, a node outage is shown, and the wallet recovers", async ({ page, context }) => {
  test.setTimeout(600_000);
  const b = wallet("Test B");
  await openWallet(page, "stagenet");
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(b.seed);
  await page.getByRole("radio").nth(1).check();
  await page.locator("#restore-height").fill(String(b.restoreHeight));
  await page.getByRole("button", { name: "Continue" }).click();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();

  const pill = page.getByText(/^(Up to date|Connecting|Preparing|Syncing.*|Sync stopped|Not connected.*)$/).filter({ visible: true }).first();
  await expect(pill).toHaveText("Up to date", { timeout: 420_000 });
  // The real node, not the simulation fallback.
  await expect(page.getByText("Stagenet (live test node)").first()).toBeVisible();
  await expect(page.getByText(/node unreachable, using simulation/)).toHaveCount(0);

  // The node goes away: after two minutes without an answer the wallet says so.
  // Offline for the whole context: the wallet engine runs in a worker, whose requests route()
  // does not see.
  await context.setOffline(true);
  await expect(pill).toHaveText(/Not connected, last checked/, { timeout: 200_000 });

  // It comes back: the wallet reconnects on its own.
  await context.setOffline(false);
  await expect(pill).toHaveText("Up to date", { timeout: 120_000 });
});
