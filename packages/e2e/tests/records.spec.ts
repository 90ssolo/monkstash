import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { dashboard, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 1, "needs a wallet in apps/web/test-wallets.local.json");

/** Set E2E_SHOTS to a folder to also save screenshots. */
const shots = process.env.E2E_SHOTS;

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

test("notes, search, filters, hide and export with the value on each day", async ({ page }) => {
  // A fixed price table: 100 USD on every day of the last two weeks.
  const asked: string[] = [];
  await page.route("**/api/price/history**", (route) => {
    asked.push(route.request().url());
    const days: Record<string, string> = {};
    for (let i = 0; i < 14; i++) days[new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)] = "100";
    return route.fulfill({ json: { ok: true, currency: "USD", days, source: "test" } });
  });
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await section(page, "Activity").click();
  const activity = page.getByRole("region", { name: "Activity" });
  await expect(activity.getByRole("listitem")).toHaveCount(4);

  // A note on the 1.25 XMR payment.
  await activity.getByRole("button", { name: "Details of this outgoing payment" }).click();
  await activity.getByLabel(/^Note/).fill("Rent for March");
  await activity.getByRole("button", { name: "Save note" }).click();
  await expect(activity.getByText("Saved.")).toBeVisible();
  await expect(activity.getByText("Rent for March", { exact: true }).first()).toBeVisible();

  // Search by note and by amount; filter by direction.
  const search = activity.getByRole("searchbox", { name: "Search payments" });
  await search.fill("rent");
  await expect(activity.getByText("1 of 4 payments")).toBeVisible();
  await activity.getByRole("radio", { name: "Received" }).check();
  await expect(activity.getByText("No payment matches.")).toBeVisible();
  await activity.getByRole("radio", { name: "Sent" }).check();
  await expect(activity.getByText("1 of 4 payments")).toBeVisible();
  await activity.getByRole("button", { name: "Clear" }).click();
  await search.fill("3.5");
  await expect(activity.getByText("1 of 4 payments")).toBeVisible();
  await search.fill("");
  await activity.getByRole("radio", { name: "Received" }).check();
  await expect(activity.getByText("3 of 4 payments")).toBeVisible();
  await activity.getByRole("radio", { name: "All" }).check();

  // The note survives a reload (sealed on this device).
  await page.reload();
  await dashboard(page);
  await section(page, "Activity").click();
  await expect(activity.getByText("Rent for March", { exact: true })).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/activity-note.png`, fullPage: true });

  // Hide masks amounts and notes.
  await activity.getByRole("button", { name: /^Hide/ }).click();
  await expect(activity.getByText("Rent for March")).toHaveCount(0);
  await expect(activity.getByText("••••").first()).toBeVisible();
  await activity.getByRole("button", { name: /^Hide/ }).click();

  // Export with the value in USD on each payment's day.
  await activity.getByRole("button", { name: "Export" }).click();
  await expect(page.getByRole("heading", { name: "Export your history" })).toBeVisible();
  await expect(page.getByText(/never learns your dates or amounts/)).toBeVisible();
  if (shots) {
    await page.screenshot({ path: `${shots}/activity-export.png`, fullPage: true });
    for (const w of [320, 390]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.screenshot({ path: `${shots}/activity-export-${w}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  }
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV (4)" }).click()]);
  const csv = readFileSync(await download.path(), "utf8").replace(/^﻿/, "");
  const [header, ...rows] = csv.trim().split("\r\n");
  expect(header).toBe("date,direction,xmr_amount,xmr_fee,confirmations,status,block_height,tx_hash,note,received_at,xmr_price_usd,value_usd,fee_value_usd,price_date");
  const rent = rows.find((r) => r.includes("Rent for March"))!;
  expect(rent).toMatch(/,out,-1\.25,0\.0001,.*,Rent for March,,100,-125\.00,-0\.01,\d{4}-\d{2}-\d{2}$/);
  expect(rows.filter((r) => r.includes(",in,"))).toHaveLength(3);
  // The request named only the currency.
  expect(asked).toHaveLength(1);
  expect(new URL(asked[0]!).search).toBe("?currency=USD");
});

test("name a receive address", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await section(page, "Receive").click();
  await page.getByRole("button", { name: "New address" }).click();
  await expect(page.getByRole("heading", { name: "A new address" })).toBeVisible();
  await page.getByLabel(/Who is this address for/).fill("Ana");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText(/Saved\. Payments to this address will show this name/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Address for Ana" })).toBeVisible();
  const named = page.getByRole("region", { name: "Addresses you named" });
  await expect(named.getByText("Ana", { exact: true })).toBeVisible();

  // A second address, then back to Ana's from the list.
  await page.getByRole("button", { name: "New address" }).click();
  await expect(page.getByRole("heading", { name: "A new address" })).toBeVisible();
  await named.getByRole("button", { name: "Show the address for Ana" }).click();
  await expect(page.getByRole("heading", { name: "Address for Ana" })).toBeVisible();
  await expect(page.getByLabel(/Who is this address for/)).toHaveValue("Ana");
  if (shots) {
    await page.screenshot({ path: `${shots}/receive-named.png`, fullPage: true });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.screenshot({ path: `${shots}/receive-named-320.png`, fullPage: true });
  }
});
