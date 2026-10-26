import { expect, test, type Page } from "@playwright/test";
import { openWallet, setPassword, testWallets, wallet, type TestWallet } from "./helpers";

// Live stagenet: test wallet A makes a real proof of funds (wallet2 reserve proof through
// monero-ts), checks it, and a changed message fails. No transaction is sent. Run with the other
// @network tests; A must hold some stagenet XMR.
test.skip(testWallets().length < 1, "needs apps/web/test-wallets.local.json");

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

async function restoreSynced(page: Page, w: TestWallet) {
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(w.seed);
  await page.getByRole("radio").nth(1).check();
  await page.locator("#restore-height").fill(String(w.restoreHeight));
  await page.getByRole("button", { name: "Continue" }).click();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  const pill = page.getByText(/^(Up to date|Connecting|Preparing|Syncing.*|Sync stopped|Not connected.*)$/).filter({ visible: true }).first();
  await expect(pill).toHaveText("Up to date", { timeout: 900_000 });
  await expect(page.getByText(/node unreachable, using simulation/)).toHaveCount(0);
}

test("@network stagenet: a real proof of funds checks out, a changed message does not", async ({ page }) => {
  test.setTimeout(1_800_000);
  await openWallet(page, "stagenet");
  await restoreSynced(page, wallet("Test A"));

  await section(page, "Activity").click();
  await page.getByRole("button", { name: "Proof of funds" }).click();
  await page.locator("#funds-amt").fill("0.0001");
  await page.locator("#funds-msg").fill("network check");
  await page.getByRole("button", { name: "Make proof of funds" }).click();
  const proof = page.locator("pre code").filter({ hasText: "Monero proof of funds" });
  await expect(proof).toContainText("Signed proof: ReserveProofV2", { timeout: 120_000 });
  const text = await proof.innerText();

  await page.locator("#funds-paste").fill(text);
  await page.getByRole("button", { name: "Check proof" }).click();
  await expect(page.getByRole("status").filter({ hasText: /Valid: this wallet holds at least/ })).toBeVisible({ timeout: 120_000 });

  await page.locator("#funds-paste").fill(text.replace("Message: network check", "Message: another check"));
  await page.getByRole("button", { name: "Check proof" }).click();
  await expect(page.getByText("This proof does not check out")).toBeVisible({ timeout: 120_000 });
});
