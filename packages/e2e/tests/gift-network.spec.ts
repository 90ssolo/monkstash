import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { openWallet, PASSWORD, setPassword, testWallets, wallet, type TestWallet } from "./helpers";

// Live stagenet: test wallet A freezes and unfreezes its coin, then makes a 0.001 XMR gift link;
// test wallet C opens the link in another browser and claims it once it has 10 confirmations.
// Real (stagenet) transactions. Run on its own with the other @network tests; A must hold
// unlocked stagenet XMR.
test.skip(testWallets().length < 3, "needs apps/web/test-wallets.local.json");

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

test("@network stagenet: freeze a coin, then make a gift link and claim it in another browser", async ({ page, browser }) => {
  test.setTimeout(10_800_000);
  await openWallet(page, "stagenet");
  await restoreSynced(page, wallet("Test A"));

  // Coin control on the real engine: freezing takes the coin out of the balance, unfreezing puts it back.
  await section(page, "Coins").click();
  const coins = page.getByRole("region", { name: "Coins" });
  const freeze = coins.getByRole("button", { name: /^Freeze the .* XMR coin$/ }).first();
  await expect(freeze).toBeVisible({ timeout: 60_000 });
  await freeze.click();
  await expect(coins.getByRole("button", { name: /^Unfreeze the/ }).first()).toBeVisible({ timeout: 60_000 });
  await section(page, "Home").click();
  await expect(page.getByText(/in frozen coins, kept out of payments/)).toBeVisible({ timeout: 60_000 });
  await section(page, "Coins").click();
  await coins.getByRole("button", { name: /^Unfreeze the/ }).first().click();
  await expect(coins.getByRole("button", { name: /^Freeze the/ }).first()).toBeVisible({ timeout: 60_000 });

  // A real gift of 0.001 XMR.
  await section(page, "Send").click();
  const gifts = page.getByRole("region", { name: "Gift links" });
  await gifts.getByRole("button", { name: "Make a gift link" }).click();
  await gifts.getByLabel("Amount (XMR)").fill("0.001");
  await gifts.getByLabel("Message (optional)").fill("MonkStash stagenet test");
  await gifts.getByRole("button", { name: "Review the gift" }).click();
  await gifts.locator("#gift-pw").fill(PASSWORD);
  await gifts.getByRole("button", { name: "Make the gift link" }).click();
  await expect(gifts.getByText(/Your gift of 0\.001 XMR is ready/)).toBeVisible({ timeout: 180_000 });
  const link = await gifts.getByLabel("Gift link").inputValue();
  mkdirSync(fileURLToPath(new URL("../test-results/", import.meta.url)), { recursive: true });
  // Kept (git-ignored) so a stagenet gift can still be claimed by hand if this run stops early.
  writeFileSync(fileURLToPath(new URL("../test-results/last-stagenet-gift.txt", import.meta.url)), link);
  console.log("gift made at", new Date().toISOString());

  // Wallet C, in another browser, opens the link and claims it when it can.
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await p2.addInitScript(() => {
    localStorage.setItem("quietmint.demo.session.v1", JSON.stringify({ assignedLabel: "e2e", mode: "stagenet" }));
  });
  await p2.goto(`/wallet${link.slice(link.indexOf("#"))}`);
  await expect(p2.getByText(/Someone sent you Monero as a gift/)).toBeVisible();
  await restoreSynced(p2, wallet("Test C"));
  const claim = p2.getByRole("region", { name: "Claim your gift" });
  await expect(claim.getByText("MonkStash stagenet test")).toBeVisible({ timeout: 600_000 });
  const review = claim.getByRole("button", { name: "Review the claim" });
  // Stagenet blocks can come slowly (13 an hour, not 30): 10 confirmations may take well over an hour.
  const deadline = Date.now() + 9_000_000;
  while (!(await review.isVisible())) {
    if (Date.now() > deadline) throw new Error("the gift never became spendable");
    const again = claim.getByRole("button", { name: "Check again" });
    if (await again.isVisible()) {
      console.log("waiting:", (await claim.getByRole("status").first().textContent())?.slice(0, 80));
      await p2.waitForTimeout(120_000);
      await again.click();
    } else {
      await p2.waitForTimeout(10_000);
    }
  }
  await review.click();
  await expect(claim.getByText("This wallet receives")).toBeVisible({ timeout: 120_000 });
  await claim.locator("#sweep-pw").fill(PASSWORD);
  await claim.getByRole("button", { name: /^Claim .* XMR now$/ }).click();
  await expect(claim.getByText(/is on its way to this wallet/)).toBeVisible({ timeout: 120_000 });
  const id = (await claim.getByRole("list", { name: "Transaction IDs" }).getByRole("listitem").first().textContent()) ?? "";
  console.log("claim tx", id.slice(0, 12));

  // The sender sees it claimed (its tab locked itself while idle: unlock first).
  if (await page.locator("#upw").isVisible()) {
    await page.locator("#upw").fill(PASSWORD);
    await page.locator("#upw").press("Enter");
    await expect(page.getByRole("button", { name: "Lock" }).first()).toBeVisible({ timeout: 300_000 });
    await section(page, "Send").click();
  } else {
    await gifts.getByRole("button", { name: "Done" }).click();
  }
  await gifts.getByRole("button", { name: "Check or take back" }).click();
  await expect(gifts.getByText(/This gift was claimed/)).toBeVisible({ timeout: 900_000 });
  await other.close();
});
