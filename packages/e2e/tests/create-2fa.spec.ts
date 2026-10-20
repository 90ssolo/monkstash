import { expect, test } from "@playwright/test";
import { dashboard, lock, openWallet, PASSWORD, totp, unlock } from "./helpers";

// Demo create shows SAMPLE words (disclosed as such) and then opens a stagenet test wallet, so the
// whole flow runs without real keys. Needs the test wallets file like the others.
test("create: backup check, password rules, authenticator, unlock with a code", async ({ page }) => {
  await openWallet(page);
  await page.getByRole("button", { name: /Create a new wallet/ }).click();
  await page.getByRole("button", { name: "Show recovery words" }).click();
  const words = await page.locator("main ol li").evaluateAll((lis) =>
    lis.map((li) => li.lastChild?.textContent?.trim() ?? "").filter((w) => /^[a-z]+$/.test(w)));
  expect(words).toHaveLength(25);

  await page.locator("main input[type=checkbox]").check();
  await page.getByRole("button", { name: "Continue" }).click();
  const asked = await page.locator("main label[for^=w]").evaluateAll((ls) => ls.map((l) => Number((l as HTMLElement).innerText.replace(/\D/g, ""))));
  expect(asked).toHaveLength(3);

  // A wrong word is refused.
  await page.locator("#w0").fill("wrongword");
  for (let k = 1; k < asked.length; k++) await page.locator(`#w${k}`).fill(words[asked[k]! - 1]!);
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.locator("main [role=alert]").first()).toBeVisible();
  await page.locator("#w0").fill(words[asked[0]! - 1]!);
  await page.getByRole("button", { name: "Confirm" }).click();

  // Passwords that do not match are refused.
  await page.locator("#pw").fill(PASSWORD);
  await page.locator("#pw2").fill(`${PASSWORD}x`);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("#totp, [role=alert]").first()).toBeVisible();
  await expect(page.locator("#totp")).toHaveCount(0);
  await page.locator("#pw2").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();

  // Authenticator: a wrong code is refused, the right one opens the wallet.
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const secret = (await page.locator("main code").first().innerText()).replace(/\s+/g, "");
  await page.locator("#totp").fill("000000");
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await expect(page.locator("main [role=alert], main .error").first()).toBeVisible();
  await page.locator("#totp").fill(totp(secret));
  await page.getByRole("button", { name: "Verify and continue" }).click();
  await dashboard(page);

  // Unlock now needs the password and then a code.
  await lock(page);
  await unlock(page);
  await expect(page.locator("#ucode")).toBeVisible();
  await page.locator("#ucode").fill("123456");
  await page.locator("#ucode").press("Enter");
  await expect(page.locator("#unlock-err")).toBeVisible();
  await page.locator("#ucode").fill(totp(secret));
  await page.locator("#ucode").press("Enter");
  await dashboard(page);
});
