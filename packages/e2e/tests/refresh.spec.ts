import { expect, test, type Page } from "@playwright/test";
import { dashboard, lock, openWallet, restore, testWallets, unlock, wallet } from "./helpers";

test.skip(testWallets().length < 1, "needs a wallet in apps/web/test-wallets.local.json");

const passwordAsked = (page: Page) => expect(page.locator("#upw")).toBeVisible({ timeout: 30_000 });
const settings = (page: Page) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name: "Settings", exact: true }).click();

test("a reload keeps the wallet open; Lock, a new tab and the setting ask for the password", async ({ page, context }) => {
  await openWallet(page);
  await restore(page, wallet("Test A"));
  await dashboard(page);

  // Reload: no password.
  await page.reload();
  await dashboard(page);
  await expect(page.locator("#upw")).toHaveCount(0);

  // Nothing readable is stored: no password text in either storage.
  const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage }) + JSON.stringify({ ...localStorage }));
  expect(stored).not.toContain("E2e-Wallet-Pass");

  // A new tab of the same wallet asks (sessionStorage is per tab). It waits for the first tab: close that.
  const other = await context.newPage();
  await page.close();
  await other.goto("/wallet");
  await passwordAsked(other);
  await unlock(other);
  await dashboard(other);

  // Lock, then reload: the password is needed.
  await lock(other);
  await other.reload();
  await passwordAsked(other);
  await unlock(other);
  await dashboard(other);

  // Setting on: a reload asks again.
  await settings(other);
  const ask = other.getByRole("checkbox", { name: /Ask for my password after a refresh/ });
  await ask.check();
  await other.reload();
  await passwordAsked(other);
  await unlock(other);
  await dashboard(other);

  // And off again: reloads keep it open (turning it off seals the current session at once).
  await settings(other);
  await other.getByRole("checkbox", { name: /Ask for my password after a refresh/ }).uncheck();
  await other.reload();
  await dashboard(other);
  await expect(other.locator("#upw")).toHaveCount(0);

  // Idle past the auto-lock limit before the reload (last activity 11 minutes ago): it asks.
  await other.evaluate(() => {
    const k = "monkstash.refresh.v1";
    const s = JSON.parse(sessionStorage.getItem(k)!);
    sessionStorage.setItem(k, JSON.stringify({ ...s, active: Date.now() - 11 * 60_000 }));
  });
  await other.reload();
  await passwordAsked(other);
  expect(await other.evaluate(() => sessionStorage.getItem("monkstash.refresh.v1"))).toBeNull();
});
