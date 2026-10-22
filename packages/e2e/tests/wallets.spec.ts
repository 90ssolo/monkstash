import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, dashboard, lock, openWallet, restore, testWallets, unlock, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");

const menuButton = (page: Page) => page.getByRole("button", { name: /switch wallet/ });
/** Waits until the wallet with this name is the open one (a switch replaces the whole screen). */
const opened = async (page: Page, name: string) => {
  await expect(page.getByRole("button", { name: `${name} , switch wallet`, exact: true })).toBeVisible({ timeout: 60_000 });
  await dashboard(page);
};
const shownAddress = (page: Page) => page.locator("dd[title]").filter({ visible: true }).first();
const settings = (page: Page) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name: "Settings", exact: true }).click();

/** Adds a wallet from its recovery words through the wallet menu (no password step). */
async function addByWords(page: Page, seed: string) {
  await menuButton(page).click();
  await page.getByRole("button", { name: "Add a wallet" }).click();
  await expect(page.getByRole("heading", { name: "Add a wallet" })).toBeVisible();
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(seed);
  await page.getByRole("button", { name: "Continue" }).click();
}

test("several wallets: add, switch, rename, one password, remove one", async ({ page }) => {
  await openWallet(page);
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await expect(menuButton(page)).toContainText("Wallet");

  // Add a second wallet: no password or authenticator step, it opens straight away.
  await addByWords(page, wallet("Test B").seed);
  await expect(page.locator("#pw")).toHaveCount(0);
  await dashboard(page);
  await expect(menuButton(page)).toContainText("Wallet 2");
  await settings(page);
  await expect(shownAddress(page)).toHaveAttribute("title", wallet("Test B").primaryAddress);

  // The same wallet cannot be added twice.
  await addByWords(page, wallet("Test A").seed);
  await expect(page.getByText(/already in MonkStash in this browser/)).toBeVisible();
  // Back to the words, back to the choices, back to the wallet.
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator("#seed")).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back to my wallet" }).click();
  await dashboard(page);
  await expect(menuButton(page)).toContainText("Wallet 2");

  // Switch without a password.
  await menuButton(page).click();
  await expect(page.getByRole("button", { name: /^✓?\s*Wallet$/ })).toBeVisible();
  await page.getByRole("button", { name: /^\s*Wallet\s*$/ }).click();
  await opened(page, "Wallet");
  await settings(page);
  await expect(shownAddress(page)).toHaveAttribute("title", wallet("Test A").primaryAddress);

  // Rename it.
  await page.locator("#wallet-name").fill("Savings");
  await page.getByRole("button", { name: "Rename" }).click();
  await expect(menuButton(page)).toContainText("Savings");

  // One password unlocks both; the last used wallet opens.
  await lock(page);
  await expect(page.getByRole("heading", { name: "Unlock your 2 wallets" })).toBeVisible();
  await unlock(page);
  await dashboard(page);
  await expect(menuButton(page)).toContainText("Savings");

  // A new password applies to every wallet.
  await settings(page);
  await page.getByText("Change password").filter({ visible: true }).first().click();
  await page.locator("#chpw-pw").fill(PASSWORD);
  await page.locator("#chpw-new").fill("Second-Pass-2026-x");
  await page.locator("#chpw-again").fill("Second-Pass-2026-x");
  await page.getByRole("button", { name: /Change password/ }).filter({ visible: true }).last().click();
  await expect(page.getByText("Password changed.", { exact: false })).toBeVisible();
  await lock(page);
  await unlock(page, "Second-Pass-2026-x");
  await dashboard(page);
  await menuButton(page).click();
  await page.getByRole("button", { name: /Wallet 2/ }).click();
  await opened(page, "Wallet 2");

  // Removing one keeps the other, which opens.
  await settings(page);
  await expect(page.getByText(/Removes only "Wallet 2"/)).toBeVisible();
  await page.getByText("Remove wallet", { exact: true }).filter({ visible: true }).first().click();
  await page.locator("#rm-pw").fill("Second-Pass-2026-x");
  await page.locator("#rm").fill("REMOVE");
  await page.getByRole("button", { name: "Remove wallet" }).filter({ visible: true }).last().click();
  await opened(page, "Savings");
  await menuButton(page).click();
  await expect(page.getByRole("button", { name: /Wallet 2/ })).toHaveCount(0);
});

test("a wallet saved by an earlier version still unlocks, and joins the list", async ({ page }) => {
  await openWallet(page);
  await restore(page, wallet("Test A"));
  await dashboard(page);
  // Rewrite the stored list as the single record that earlier versions saved.
  await page.evaluate(() => {
    const key = "quietmint.wallet.v1";
    const list = JSON.parse(localStorage.getItem(key)!) as { wallets: unknown[] };
    localStorage.setItem(key, JSON.stringify(list.wallets[0]));
  });
  await page.reload();
  await expect(page.locator("#upw")).toBeVisible();
  await unlock(page);
  await dashboard(page);
  await addByWords(page, wallet("Test B").seed);
  await dashboard(page);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("quietmint.wallet.v1")!) as { format?: string; wallets?: unknown[] });
  expect(stored.format).toBe("monkstash-wallets");
  expect(stored.wallets).toHaveLength(2);
});
