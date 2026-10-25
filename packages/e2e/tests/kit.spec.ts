import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, dashboard, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 1, "needs a wallet in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save the blank kit as a PDF (never the one with words). */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("emergency kit: blank boxes by default, words only after the password, gone after printing", async ({ page }) => {
  // The print dialog cannot be driven headless: count the calls instead.
  await page.addInitScript(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => { (window as unknown as { printed: number }).printed++; };
  });
  await openWallet(page, "simulation");
  const w = wallet("Test A");
  await restore(page, w);
  await dashboard(page);
  await section(page, "Settings").click();
  await page.getByText("Emergency kit (print or save as PDF)").click();

  // Blank kit: no password, 25 empty boxes, the wallet's address and restore height.
  await page.getByLabel(/A note for whoever uses it/).fill("The passphrase is in the blue envelope.");
  await page.getByRole("button", { name: "Print the emergency kit" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
  const kit = page.locator("#kit-print");
  await expect(kit.locator('ol[aria-label="Recovery words"] li')).toHaveCount(25);
  await expect(kit.getByText("The passphrase is in the blue envelope.")).toBeAttached();
  expect(await kit.textContent()).toContain(w.primaryAddress.slice(0, 8));
  const wordsShown = await kit.locator('ol[aria-label="Recovery words"] li span:last-child').allTextContents();
  expect(wordsShown.every((t) => t.trim() === "")).toBe(true);
  // While printing, the page is only the kit.
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("main")).toBeHidden();
  await expect(kit).toBeVisible();
  if (shots) await page.pdf({ path: `${shots}/kit-blank.pdf`, format: "A4" });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(kit).toHaveCount(0);
  await page.emulateMedia({ media: "screen" });

  // With words: a wrong password prints nothing; the right one prints the words, which leave afterwards.
  await page.getByRole("radio", { name: /Print them/ }).check();
  await page.locator("#kit-pw").fill("not-the-password");
  await page.getByRole("button", { name: "Print the emergency kit" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(kit).toHaveCount(0);
  await page.locator("#kit-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Print the emergency kit" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(2);
  const printed = (await kit.locator('ol[aria-label="Recovery words"] li span:last-child').allTextContents()).map((t) => t.trim());
  // Compared without ever writing the words to the test output.
  expect(printed.join(" ") === w.seed.trim().split(/\s+/).join(" ")).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(kit).toHaveCount(0);
  expect(await page.content()).not.toContain(w.seed.trim().split(/\s+/).slice(0, 3).join(""));
});
