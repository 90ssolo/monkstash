import { expect, test, type Page } from "@playwright/test";
import { dashboard, lock, openWallet, restore, testWallets, unlock, wallet } from "./helpers";

test.skip(testWallets().length < 1, "needs a wallet in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save screenshots. */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });
const pageBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const DARK_BG = "rgb(17, 24, 19)";
const LIGHT_BG = "rgb(237, 238, 230)";

test("dark theme: chosen in Settings, kept after a reload, the content site stays light", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  expect(await pageBg(page)).toBe(LIGHT_BG);

  await section(page, "Settings").click();
  const colours = page.getByRole("radiogroup", { name: "Colours" });
  await expect(colours.getByRole("radio", { name: "System" })).toBeChecked();
  await colours.getByRole("radio", { name: "Dark" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-wallet-theme", "dark");
  expect(await pageBg(page)).toBe(DARK_BG);
  if (shots) await page.screenshot({ path: `${shots}/theme-settings.png`, fullPage: true });

  for (const name of ["Home", "Activity", "Receive", "Send"]) {
    await section(page, name).click();
    if (shots) await page.screenshot({ path: `${shots}/theme-${name.toLowerCase()}.png`, fullPage: true });
  }

  // The unlock screen after a reload is dark too (applied as the wallet loads).
  await lock(page);
  await page.reload();
  await expect(page.locator("#upw")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-wallet-theme", "dark");
  expect(await pageBg(page)).toBe(DARK_BG);
  if (shots) await page.screenshot({ path: `${shots}/theme-unlock.png` });
  await unlock(page);
  await dashboard(page);

  // The content site never takes the wallet's theme.
  await page.goto("/");
  expect(await pageBg(page)).toBe(LIGHT_BG);
});

test("System follows the device: dark when the device is dark, light when chosen", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openWallet(page, "simulation");
  await expect(page.getByRole("button", { name: /Restore from recovery words/ })).toBeVisible();
  expect(await pageBg(page)).toBe(DARK_BG);
  if (shots) await page.screenshot({ path: `${shots}/theme-welcome.png` });
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await section(page, "Settings").click();
  await page.getByRole("radiogroup", { name: "Colours" }).getByRole("radio", { name: "Light" }).check();
  expect(await pageBg(page)).toBe(LIGHT_BG);
  await page.goto("/");
  expect(await pageBg(page)).toBe(LIGHT_BG);
});
