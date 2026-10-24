import { expect, test } from "@playwright/test";
import { dashboard, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 1, "needs a wallet in apps/web/test-wallets.local.json");
test.use({ locale: "de-DE" });

/** Set E2E_SHOTS to a folder to also save screenshots of the menu. */
const shots = process.env.E2E_SHOTS;

test("balance value: currency menu searches, picks with the keyboard, turns off", async ({ page }) => {
  await openWallet(page);
  await restore(page, wallet("Test A"));
  await dashboard(page);

  const menu = page.getByRole("button", { name: /change the currency/ });
  // A German browser starts in euros.
  await expect(menu).toContainText("EUR");
  await expect(page.getByText(/^≈ .*€$/)).toBeVisible();

  await menu.click();
  const search = page.getByRole("combobox", { name: "Search currencies" });
  await expect(search).toBeFocused();
  await expect(page.getByRole("option", { name: /EUR/ })).toHaveAttribute("aria-selected", "true");
  if (shots) {
    for (const [width, height] of [[1280, 720], [390, 760], [320, 640]] as const) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${shots}/cur-open-${width}.png` });
    }
    await search.fill("dollar");
    await page.screenshot({ path: `${shots}/cur-search-320.png` });
    await search.fill("");
  }

  await search.fill("pfund");
  await expect(page.getByRole("option")).toHaveCount(2); // GBP and "XMR only"
  await search.press("Enter");
  await expect(search).toBeHidden();
  await expect(menu).toBeFocused();
  await expect(menu).toContainText("GBP");
  await expect(page.getByText(/^≈ .*£$/)).toBeVisible();

  // Escape closes without changing anything.
  await menu.click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(menu).toContainText("GBP");

  await menu.click();
  await page.getByRole("option", { name: /XMR only/ }).click();
  await expect(menu).toContainText("Show value");
  await expect(page.getByText(/^≈ /)).toHaveCount(0);
});
