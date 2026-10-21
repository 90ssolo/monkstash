import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { dashboard, lock, openWallet, restore, testWallets, wallet } from "./helpers";

/** Automated WCAG 2.2 A/AA checks (axe-core) on what is visible now. */
async function axe(page: Page, what: string) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const found = r.violations.map((v) => `${what}: ${v.id} (${v.impact}) ${v.nodes.length}x ${v.nodes[0]?.target.join(" ")}`);
  expect(found, found.join("\n")).toEqual([]);
}

test("wallet screens pass automated accessibility checks", async ({ page }) => {
  test.skip(!testWallets().length, "needs apps/web/test-wallets.local.json");
  await openWallet(page, "simulation");
  await expect(page.getByRole("heading", { name: "Set up your wallet" })).toBeVisible();
  await axe(page, "welcome");

  await page.getByRole("button", { name: /I already use MonkStash/ }).click();
  await expect(page.locator("#move-setup-file")).toBeVisible();
  await axe(page, "move step");
  await page.getByRole("button", { name: "Back" }).click();

  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await expect(page.locator("#seed")).toBeVisible();
  await axe(page, "restore");
  await page.locator("#seed").fill(wallet("Test A").seed);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#pw")).toBeVisible();
  await axe(page, "password");
  // Nothing is saved before the password step: a reload starts setup again.
  await page.reload();
  await restore(page, wallet("Test A"));
  await dashboard(page);
  for (const name of ["Home", "Send", "Receive", "Get paid", "Activity", "Contacts", "Checkup", "Settings"]) {
    const b = page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });
    if (!(await b.count())) continue;
    await b.click();
    await page.waitForTimeout(400);
    await axe(page, name);
  }
  await lock(page);
  await axe(page, "unlock");
});

for (const path of ["/", "/verify", "/server", "/faq", "/monero-wallets", "/monero-chrome-extension", "/donate", "/tools/monero-address-validator", "/what-is-monero", "/business"]) {
  test(`content page ${path} passes automated accessibility checks`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await axe(page, path);
  });
}

test("keyboard only: setup can be reached and focus lands on each new step", async ({ page }) => {
  await openWallet(page, "simulation");
  await expect(page.getByRole("heading", { name: "Set up your wallet" })).toBeVisible();
  // Tab from the top of the page until a setup choice has focus, then press Enter.
  let label = "";
  for (let i = 0; i < 25 && !label.includes("Restore from recovery words"); i++) {
    await page.keyboard.press("Tab");
    label = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.innerText ?? "");
  }
  expect(label).toContain("Restore from recovery words");
  await page.keyboard.press("Enter");
  // Focus moves to the new step's heading, so screen readers announce it.
  await expect(page.locator("h2:focus")).toHaveText("Restore from recovery words");
  // The words field is a few tabs away, and typing there works.
  let id = "";
  for (let i = 0; i < 6 && id !== "seed"; i++) {
    await page.keyboard.press("Tab");
    id = await page.evaluate(() => document.activeElement?.id ?? "");
  }
  expect(id).toBe("seed");
  await page.keyboard.type("abbey");
  await expect(page.locator("#seed")).toHaveValue("abbey");
});
