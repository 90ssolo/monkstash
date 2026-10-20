import { expect, test, type Page } from "@playwright/test";
import { dashboard, openWallet, restore, setPassword, testWallets, wallet } from "./helpers";

test.skip(!testWallets().length, "needs apps/web/test-wallets.local.json");

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("watch-only: a wrong view key is refused, the right one opens a wallet that cannot send", async ({ page }) => {
  await openWallet(page);
  const a = wallet("Test A"), b = wallet("Test B");
  await page.getByRole("button", { name: /Add a watch-only wallet/ }).click();
  await page.locator("#addr").fill(a.primaryAddress);
  await page.locator("#vk").fill(b.privateViewKey);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#vo-err")).toContainText(/does not belong to this address/);

  await page.locator("#vk").fill(a.privateViewKey);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#pw")).toBeVisible();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  await dashboard(page);
  await section(page, "Settings").click();
  await expect(page.getByText("Watch-only", { exact: true }).filter({ visible: true }).first()).toBeVisible();
});

test("receive and send (simulation): new addresses, review screen, sent", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);

  // Receive: a new address is a different subaddress.
  await section(page, "Receive").click();
  const addr = page.locator("main p.mono").filter({ visible: true }).first();
  const first = await addr.innerText();
  await page.getByRole("button", { name: "New address" }).click();
  await expect(addr).not.toHaveText(first);

  // Send: an invalid address is refused, then a valid payment is reviewed and sent.
  await section(page, "Send").click();
  await page.locator("#to").fill("4notAnAddress");
  await page.locator("#amt").fill("0.1");
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.locator("main [role=alert], main .error").filter({ visible: true }).first()).toBeVisible();

  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByText("Network fee")).toBeVisible();
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();
});

test("two tabs: the wallet runs in one tab at a time", async ({ page, context }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);

  const second = await context.newPage();
  await second.goto("/wallet");
  await expect(second.getByRole("heading", { name: "MonkStash is open in another tab" })).toBeVisible();
  await second.getByRole("button", { name: "Use MonkStash here instead" }).click();
  await expect(second.locator("#upw")).toBeVisible();
  await expect(page.getByRole("heading", { name: "MonkStash moved to another tab" })).toBeVisible();
});

test("move file setup: words of another wallet are refused, the right ones skip the scan", async ({ page }) => {
  const file = process.env.E2E_MOVE_FILE;
  test.skip(!file, "set E2E_MOVE_FILE to a stagenet move file of Test B");
  await openWallet(page, "simulation");
  await page.getByRole("button", { name: /I already use MonkStash/ }).click();
  await page.locator("#move-setup-file").setInputFiles(file!);
  await expect(page.getByText(/Full wallet, scanned to block/)).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("fieldset legend")).toHaveCount(0);
  await page.locator("#seed").fill(wallet("Test A").seed);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#seed-err")).toContainText(/belongs to a different wallet/);
  await page.locator("#seed").fill(wallet("Test B").seed);
  await page.getByRole("button", { name: "Continue" }).click();
  await setPassword(page);
  await page.getByRole("button", { name: /^Skip/ }).first().click();
  await dashboard(page);
  await section(page, "Settings").click();
  // The restore height comes from the file, not the default.
  await expect(page.locator("dd.tnum").filter({ visible: true }).first()).not.toHaveText("0");
});

test("remove: typing REMOVE deletes the wallet from this browser", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await page.getByRole("button", { name: "Lock" }).first().click();
  await page.getByText("Forgot password?").click();
  const remove = page.getByRole("button", { name: "Remove wallet from this browser" });
  await expect(remove).toBeDisabled();
  await page.locator("main input").filter({ visible: true }).last().fill("REMOVE");
  await remove.click();
  await expect(page.getByRole("heading", { name: "Set up your wallet" })).toBeVisible();
});
