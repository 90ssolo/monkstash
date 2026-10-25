import { expect, test, type Page } from "@playwright/test";
import { addressInfo, addressPublicViewKey, encodePrimaryAddress } from "../../wallet-core/src/index";
import { PASSWORD, dashboard, openWallet, restore, synced, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

/** An address with the same view key as `of` but a made-up spend key (the #11586 trap). */
function sameViewKey(of: string): string {
  return encodePrimaryAddress(addressInfo(of)!.network, "09".repeat(32), addressPublicViewKey(of)!);
}

test("payment proofs are signed only and refuse a trap address", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);

  // Pay B, so there is a payment this wallet can prove.
  await section(page, "Send").click();
  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.locator("#amt").fill("0.25");
  await page.getByRole("button", { name: "Review" }).click();
  await page.locator("#send-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();

  await section(page, "Activity").click();
  await page.getByRole("button", { name: "Details of this outgoing payment" }).first().click();
  await page.getByRole("button", { name: "Make proof" }).click();
  const proof = page.locator("pre code");
  await expect(proof).toContainText("Signed proof: OutProofV2");
  // Never the transaction key: with the sender's address it reveals the sender's change.
  await expect(proof).not.toContainText("Transaction key");
  const text = await proof.innerText();

  // The proof checks out in the same wallet.
  await page.getByRole("button", { name: "Check a payment proof" }).click();
  await page.locator("#proof-text").fill(text);
  await page.getByRole("button", { name: "Check proof" }).click();
  await expect(page.getByText(/Valid: 0\.25/)).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  // An address carrying this wallet's own view key gets no proof at all.
  const make = page.getByRole("button", { name: "Make proof" });
  if (!(await make.isVisible())) await page.getByRole("button", { name: "Details of this outgoing payment" }).first().click();
  await page.getByLabel("Paid to").fill(sameViewKey(wallet("Test A").primaryAddress));
  await make.click();
  await expect(page.getByRole("alert").filter({ hasText: "reuses your own" })).toContainText("No proof was made");
});
