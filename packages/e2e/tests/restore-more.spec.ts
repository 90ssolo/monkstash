import { expect, test, type Page } from "@playwright/test";
import { dashboard, openWallet, PASSWORD, setPassword, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save screenshots. */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("restore with a seed passphrase opens a different wallet, and says so with the words", async ({ page }) => {
  const a = wallet("Test A");
  await openWallet(page, "simulation");
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(a.seed);
  await page.getByText("My seed has a passphrase").click();
  await page.locator("#seed-pass").fill("Correct Horse 1");
  if (shots) await page.screenshot({ path: `${shots}/restore-passphrase.png`, fullPage: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#pw")).toBeVisible();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  await dashboard(page);

  await section(page, "Receive").click();
  const shown = (await page.locator("section:not([hidden]) p.mono").first().textContent())!.trim();
  expect(shown).toMatch(/^5/);
  expect(shown).not.toBe(a.primaryAddress);

  await section(page, "Settings").click();
  await page.locator("summary", { hasText: "Show recovery words" }).click();
  await page.locator("#reveal-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Show recovery words" }).click();
  await expect(page.getByText(/This wallet also has a seed passphrase/)).toBeVisible();
});

// Monero's own Polyseed test phrase, and the same phrase encrypted with "MonkStash test 1" by the
// reference library (see packages/polyseed/test). Both are the same wallet.
const POLYSEED = "pulse tone truth head invite orphan sock wet crumble oven price corn pilot antenna luxury strategy";
const POLYSEED_ENCRYPTED = "knee vapor day minimum more aim battle object blanket medal scatter sibling actor unlock inform final";

async function restorePolyseed(page: Page, phrase: string, passphrase?: string): Promise<string> {
  await openWallet(page, "simulation");
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(phrase);
  await expect(page.getByText(/16 words: a Polyseed/)).toBeVisible();
  // The date is in the words: no date question.
  await expect(page.getByRole("radio", { name: "A date" })).toHaveCount(0);
  if (passphrase === undefined && phrase === POLYSEED_ENCRYPTED) {
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText(/protected with a passphrase/)).toBeVisible();
    return "";
  }
  if (passphrase) {
    await page.getByText("My seed has a passphrase").click();
    await page.locator("#seed-pass").fill(passphrase);
  }
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#pw")).toBeVisible({ timeout: 30_000 });
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  await dashboard(page);
  await section(page, "Receive").click();
  return (await page.locator("section:not([hidden]) p.mono").first().textContent())!.trim();
}

test("restore a 16-word Polyseed, plain and encrypted", async ({ page, browser }) => {
  const plain = await restorePolyseed(page, POLYSEED);
  expect(plain).toMatch(/^5/);
  // Settings shows the 16 words the owner wrote down.
  await section(page, "Settings").click();
  await page.locator("summary", { hasText: "Show recovery words" }).click();
  await page.locator("#reveal-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Show recovery words" }).click();
  await expect(page.getByRole("list", { name: "Your 16 recovery words" })).toBeVisible();
  await expect(page.getByText(/also has a seed passphrase/)).toHaveCount(0);

  const other = await browser.newPage();
  await restorePolyseed(other, POLYSEED_ENCRYPTED);
  await other.close();
  const third = await browser.newPage();
  expect(await restorePolyseed(third, POLYSEED_ENCRYPTED, "MonkStash test 1")).toBe(plain);
  await third.close();
});

test("move money from another wallet into this one", async ({ page }) => {
  const a = wallet("Test A");
  await openWallet(page, "simulation");
  await page.getByRole("button", { name: /Restore from recovery words/ }).click();
  await page.locator("#seed").fill(a.seed);
  await page.getByRole("button", { name: "Continue" }).click();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  await dashboard(page);
  await section(page, "Receive").click();
  await page.getByRole("button", { name: "Move it into this one" }).click();
  const sweep = page.getByRole("region", { name: "Move money from another wallet" });

  // Its own words are refused.
  await sweep.getByLabel("Recovery words of the other wallet").fill(a.seed);
  await sweep.getByRole("button", { name: "Scan that wallet" }).click();
  await expect(sweep.getByText(/These are the recovery words of this wallet/)).toBeVisible();

  // Another wallet's words: scan, review, move.
  await sweep.getByLabel("Recovery words of the other wallet").fill(wallet("Test B").seed);
  await sweep.getByRole("button", { name: "Scan that wallet" }).click();
  await expect(sweep.getByText("Balance")).toBeVisible();
  await expect(sweep.getByLabel("Recovery words of the other wallet")).toHaveCount(0);
  await sweep.getByRole("button", { name: "Review the move" }).click();
  await expect(sweep.getByText("This wallet receives")).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/sweep-review.png`, fullPage: true });
  await sweep.locator("#sweep-pw").fill("wrong password 1");
  await sweep.getByRole("button", { name: /^Move .* XMR now$/ }).click();
  await expect(sweep.getByRole("alert")).toBeVisible();
  await sweep.locator("#sweep-pw").fill(PASSWORD);
  await sweep.getByRole("button", { name: /^Move .* XMR now$/ }).click();
  await expect(sweep.getByText(/is on its way to this wallet/)).toBeVisible();
  await expect(sweep.getByRole("list", { name: "Transaction IDs" }).getByRole("listitem")).toHaveCount(1);
  if (shots) await page.screenshot({ path: `${shots}/sweep-sent.png`, fullPage: true });
});
