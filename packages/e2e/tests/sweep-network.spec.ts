import { expect, test, type Page } from "@playwright/test";
import { openWallet, PASSWORD, setPassword, testWallets, wallet } from "./helpers";

// Live stagenet: empties throwaway test wallet B into test wallet A with a real (stagenet)
// transaction. Run on its own with the other @network tests; B must hold unlocked stagenet XMR.
test.skip(testWallets().length < 2, "needs apps/web/test-wallets.local.json");

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("@network stagenet: move another wallet's money into this one", async ({ page }) => {
  test.setTimeout(1_500_000);
  const a = wallet("Test A");
  const b = wallet("Test B");
  await openWallet(page, "stagenet");
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(a.seed);
  await page.getByRole("radio").nth(1).check();
  await page.locator("#restore-height").fill(String(a.restoreHeight));
  await page.getByRole("button", { name: "Continue" }).click();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  const pill = page.getByText(/^(Up to date|Connecting|Preparing|Syncing.*|Sync stopped|Not connected.*)$/).filter({ visible: true }).first();
  await expect(pill).toHaveText("Up to date", { timeout: 600_000 });
  await expect(page.getByText(/node unreachable, using simulation/)).toHaveCount(0);

  await section(page, "Receive").click();
  await page.getByRole("button", { name: "Move it into this one" }).click();
  const sweep = page.getByRole("region", { name: "Move money from another wallet" });
  await sweep.getByLabel("Recovery words of the other wallet").fill(b.seed);
  await sweep.getByRole("radio", { name: /block height/ }).check();
  await sweep.locator("#sweep-height").fill(String(b.restoreHeight));
  await sweep.getByRole("button", { name: "Scan that wallet" }).click();
  await expect(sweep.getByText("Balance")).toBeVisible({ timeout: 900_000 });
  await sweep.getByRole("button", { name: "Review the move" }).click();
  await expect(sweep.getByText("This wallet receives")).toBeVisible({ timeout: 120_000 });
  await sweep.locator("#sweep-pw").fill(PASSWORD);
  await sweep.getByRole("button", { name: /^Move .* XMR now$/ }).click();
  await expect(sweep.getByText(/is on its way to this wallet/)).toBeVisible({ timeout: 120_000 });
  const id = (await sweep.getByRole("list", { name: "Transaction IDs" }).getByRole("listitem").first().textContent()) ?? "";
  console.log("sweep tx", id.slice(0, 12));

  // This wallet sees it arrive (in the pool, then in a block).
  await section(page, "Activity").click();
  await expect(page.getByRole("region", { name: "Activity" }).getByText(/Spendable in about/).first()).toBeVisible({ timeout: 240_000 });
});
