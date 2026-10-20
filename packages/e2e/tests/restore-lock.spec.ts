import { expect, test } from "@playwright/test";
import { dashboard, lock, openWallet, PASSWORD, restore, testWallets, unlock, wallet } from "./helpers";

test.skip(!testWallets().length, "needs apps/web/test-wallets.local.json");

test("restore: phrase problems are explained before anything is saved", async ({ page }) => {
  await openWallet(page);
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  const words = wallet("Test A").seed.trim().split(/\s+/);

  // 24 words: the missing check word is named and can be added with one click.
  await page.locator("#seed").fill(words.slice(0, 24).join(" "));
  await expect(page.getByText(/the 25th, a check word made from the others, is missing/)).toBeVisible();
  await page.getByRole("button", { name: "Add it" }).click();
  await expect(page.getByText("All 25 words are Monero words and the check word matches.")).toBeVisible();

  // Two words swapped: the check word no longer matches.
  const swapped = [...words];
  [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
  await page.locator("#seed").fill(swapped.join(" "));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#seed-err")).toContainText(/does not match the other 24/);

  // A word that is not a Monero word.
  await page.locator("#seed").fill([...words.slice(0, 24), "qqqqq"].join(" "));
  await expect(page.getByText(/Word 25, "qqqqq", is not a Monero word/).first()).toBeVisible();

  // Wrong count.
  await page.locator("#seed").fill(words.slice(0, 10).join(" "));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#seed-err")).toContainText(/You entered 10/);
});

test("restore, lock, wrong password, unlock, reload", async ({ page }) => {
  await openWallet(page);
  await restore(page, wallet("Test A"));
  await dashboard(page);
  // The restored wallet is the one the words belong to.
  await page.getByRole("button", { name: "Settings" }).first().click();
  await expect(page.locator("dd[title]").filter({ visible: true }).first()).toHaveAttribute("title", wallet("Test A").primaryAddress);

  await lock(page);
  await unlock(page, "not-the-password");
  await expect(page.locator("#unlock-err")).toBeVisible();
  await expect(page.locator("#upw")).toBeVisible();
  await unlock(page, PASSWORD);
  await dashboard(page);

  // A reload never leaves the wallet open: it asks for the password again.
  await page.reload();
  await expect(page.locator("#upw")).toBeVisible();
  await unlock(page);
  await dashboard(page);
});
