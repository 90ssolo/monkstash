import { expect, test, type Page } from "@playwright/test";
import { dashboard, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save screenshots. */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("coins: freeze keeps a coin out of the balance and of Send; a send across addresses is flagged", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);

  // The simulation holds 3 coins at 3 addresses: 3.7499 (main), 3.5 (#1), 4.75 (#2, unlocking).
  await section(page, "Coins").click();
  const coins = page.getByRole("region", { name: "Coins" });
  await expect(coins.getByRole("heading", { name: /Your main address/ })).toBeVisible();
  await expect(coins.getByRole("heading", { name: /Address #1/ })).toBeVisible();
  await expect(coins.getByText(/unlocking/)).toBeVisible();

  // Freeze the 3.5 XMR coin: out of the balance, shown apart on Home and Send.
  await coins.getByRole("button", { name: "Freeze the 3.5 XMR coin" }).click();
  await expect(coins.getByRole("button", { name: "Unfreeze the 3.5 XMR coin" })).toHaveAttribute("aria-pressed", "true");
  await expect(coins.getByText(/Frozen/).first()).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/coins.png`, fullPage: true });
  await section(page, "Home").click();
  await expect(page.getByText(/Plus 3\.5 XMR in frozen coins/)).toBeVisible();
  await expect(page.getByText(/^8\.4999/)).toBeVisible();

  // 5 XMR needs both remaining coins (main address and #2): the review says so.
  await section(page, "Send").click();
  await expect(page.getByText(/plus 3\.5 XMR frozen/)).toBeVisible();
  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.locator("#amt").fill("5");
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByText(/This payment combines money from 2 of your addresses/)).toBeVisible();
  await expect(page.getByText(/your main address, address #2/)).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/coins-warning.png`, fullPage: true });

  // 3 XMR fits in one coin: no warning.
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator("#amt").fill("3");
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByText(/This payment combines money/)).toHaveCount(0);
  await page.getByRole("button", { name: "Edit" }).click();

  // Unfreeze: back in the balance.
  await section(page, "Coins").click();
  await coins.getByRole("button", { name: "Unfreeze the 3.5 XMR coin" }).click();
  await expect(coins.getByRole("button", { name: "Freeze the 3.5 XMR coin" })).toHaveAttribute("aria-pressed", "false");
  await section(page, "Home").click();
  await expect(page.getByText(/in frozen coins/)).toHaveCount(0);
});
