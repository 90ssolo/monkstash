import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, dashboard, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save screenshots. */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("gift link: make one, take it back, and claim one in a fresh browser", async ({ page, browser }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await expect(page.getByText("Up to date", { exact: true })).toBeVisible();
  await section(page, "Send").click();

  // Make a gift of 0.5 XMR with a message.
  const gifts = page.getByRole("region", { name: "Gift links" });
  await gifts.getByRole("button", { name: "Make a gift link" }).click();
  await gifts.getByLabel("Amount (XMR)").fill("0.5");
  await gifts.getByLabel("Message (optional)").fill("Happy birthday!");
  await gifts.getByRole("button", { name: "Review the gift" }).click();
  await expect(gifts.getByText("0.5 XMR", { exact: true })).toBeVisible();
  await gifts.locator("#gift-pw").fill(PASSWORD);
  await gifts.getByRole("button", { name: "Make the gift link" }).click();
  await expect(gifts.getByText(/Your gift of 0\.5 XMR is ready/)).toBeVisible();
  const link = await gifts.getByLabel("Gift link").inputValue();
  expect(link).toMatch(/#gift=[1-9A-HJ-NP-Za-km-z]{60,}$/);
  if (shots) await page.screenshot({ path: `${shots}/gift-made.png`, fullPage: true });
  await gifts.getByRole("button", { name: "Done" }).click();
  await expect(gifts.getByText(/Not claimed yet: "Happy birthday!"/)).toBeVisible();

  // The list survives a reload (sealed on this device).
  // (A refresh keeps the wallet open by default, within the auto-lock limits.)
  await page.reload();
  await dashboard(page);
  await expect(page.getByText("Up to date", { exact: true })).toBeVisible();
  await section(page, "Send").click();
  await expect(gifts.getByText(/Not claimed yet/)).toBeVisible();

  // Take it back: the gift is scanned and swept into this wallet.
  await gifts.getByRole("button", { name: "Check or take back" }).click();
  await expect(gifts.getByRole("heading", { name: "Take back a gift" })).toBeVisible();
  await gifts.getByRole("button", { name: "Review taking it back" }).click();
  await gifts.locator("#sweep-pw").fill(PASSWORD);
  await gifts.getByRole("button", { name: /^Take back .* XMR now$/ }).click();
  await expect(gifts.getByText(/is on its way to this wallet/)).toBeVisible();
  await gifts.getByRole("button", { name: "Done" }).click();
  await expect(gifts.getByText(/Taken back/)).toBeVisible();

  // Someone else opens the link in a browser with no wallet: the code leaves the address bar,
  // the gift waits through wallet setup and is claimed on the first screen.
  const other = await browser.newContext();
  const p2 = await other.newPage();
  await p2.addInitScript(() => {
    localStorage.setItem("quietmint.demo.session.v1", JSON.stringify({ assignedLabel: "e2e", mode: "simulation" }));
  });
  // The link opens the gift page: the note shows the amount and message, the code leaves the address bar.
  const code = link.slice(link.indexOf("#"));
  expect(link).toContain("/wallet/gift#gift=");
  await p2.goto(`/wallet/gift${code}`);
  await expect(p2.getByRole("heading", { name: "Someone sent you Monero." })).toBeVisible();
  const note = p2.getByRole("figure", { name: "Your gift" });
  await expect(note.getByText("0.5", { exact: true })).toBeVisible();
  await expect(note.getByText("Happy birthday!")).toBeVisible();
  expect(p2.url()).not.toContain("gift=");
  if (shots) await p2.screenshot({ path: `${shots}/gift-page.png`, fullPage: true });
  await p2.getByRole("link", { name: "Claim your gift" }).click();
  await expect(p2.getByRole("heading", { name: "Your gift is waiting" })).toBeVisible();
  await restore(p2, wallet("Test B"));
  await dashboard(p2);
  const claim = p2.getByRole("region", { name: "Claim your gift" });
  await expect(claim.getByText("Happy birthday!")).toBeVisible();
  await expect(claim.getByText("0.5 XMR", { exact: true })).toBeVisible();
  await claim.getByRole("button", { name: "Review the claim" }).click();
  await claim.locator("#sweep-pw").fill(PASSWORD);
  await claim.getByRole("button", { name: /^Claim .* XMR now$/ }).click();
  await expect(claim.getByText(/is on its way to this wallet/)).toBeVisible();
  if (shots) await p2.screenshot({ path: `${shots}/gift-claimed.png`, fullPage: true });
  await claim.getByRole("button", { name: "Done" }).click();
  await expect(p2.getByRole("region", { name: "Claim your gift" })).toHaveCount(0);
  await other.close();
});

test("a link made before the gift page (wallet address + #gift=) still opens the gift", async ({ page, browser }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await expect(page.getByText("Up to date", { exact: true })).toBeVisible();
  await section(page, "Send").click();
  const gifts = page.getByRole("region", { name: "Gift links" });
  await gifts.getByRole("button", { name: "Make a gift link" }).click();
  await gifts.getByLabel("Amount (XMR)").fill("0.25");
  await gifts.getByRole("button", { name: "Review the gift" }).click();
  await gifts.locator("#gift-pw").fill(PASSWORD);
  await gifts.getByRole("button", { name: "Make the gift link" }).click();
  const link = await gifts.getByLabel("Gift link").inputValue();

  const other = await browser.newContext();
  const p2 = await other.newPage();
  await p2.addInitScript(() => {
    localStorage.setItem("quietmint.demo.session.v1", JSON.stringify({ assignedLabel: "e2e", mode: "simulation" }));
  });
  await p2.goto(`/wallet${link.slice(link.indexOf("#"))}`);
  await expect(p2.getByRole("heading", { name: "Your gift is waiting" })).toBeVisible();
  expect(p2.url()).not.toContain("gift=");
  await other.close();
});

test("a damaged gift link explains itself", async ({ page }) => {
  await page.goto("/wallet/gift#gift=1LWcWdhCycHTxA2WPSX6VB3GXF64tC8Bx3U2aVzN4iZRLue34Qqpwe");
  await expect(page.getByRole("heading", { name: "This gift link does not open" })).toBeVisible();
});
