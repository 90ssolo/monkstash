import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, dashboard, synced, openWallet, restore, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 4, "needs four wallets in apps/web/test-wallets.local.json");

// The QR encoder the web app itself uses, to draw a code for the fake camera.
const QRCode = createRequire(fileURLToPath(new URL("../../../apps/web/package.json", import.meta.url)))("qrcode") as { toDataURL(text: string, o: object): Promise<string> };

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });
const sendNow = async (page: Page) => {
  await page.locator("#send-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();
};

test("send: speed, fee from the amount, first-time note", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();

  const b = wallet("Test B").primaryAddress;
  await page.locator("#to").fill(b);
  await expect(page.getByText(/You have not paid this address before/)).toBeVisible();
  await page.locator("#amt").fill("1");
  await page.getByRole("checkbox", { name: /Take the network fee from this amount/ }).check();
  await page.getByRole("radio", { name: "Fastest" }).check();
  await expect(page.getByText(/About 16 times the standard fee/)).toBeVisible();
  await page.getByRole("button", { name: "Review" }).click();

  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByText("They receive")).toBeVisible();
  await expect(page.getByText(/fastest speed/)).toBeVisible();
  // Fee taken from the 1 XMR typed: the total is exactly 1.
  await expect(page.locator("dd strong").filter({ hasText: /^1(\.0+)? XMR$/ })).toBeVisible();
  await sendNow(page);

  // Paid once: no first-time note for B any more, but a new address still gets one.
  await page.getByRole("button", { name: "Send another" }).click();
  await page.locator("#to").fill(b);
  await expect(page.getByText(/Valid .* address format/)).toBeVisible();
  await expect(page.getByText(/You have not paid this address before/)).toHaveCount(0);
  await page.locator("#to").fill(wallet("Test C").primaryAddress);
  await expect(page.getByText(/You have not paid this address before/)).toBeVisible();
});

test("pay several people in one transaction", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  await page.getByRole("button", { name: "Pay several people at once" }).click();
  await expect(page.getByRole("heading", { name: "Pay several people" })).toBeVisible();

  await page.getByLabel("Recipient 1 address").fill(wallet("Test B").primaryAddress);
  await page.getByLabel("Recipient 1 amount in XMR").fill("0.5");
  await page.getByLabel("Recipient 2 address").fill(wallet("Test C").primaryAddress);
  await page.getByLabel("Recipient 2 amount in XMR").fill("0.25");
  // A pasted list adds rows; a bad line is reported, not guessed.
  await page.getByText("Paste a list").click();
  await page.locator("#b-list").fill(`${wallet("Test D").primaryAddress} 0.125\nnot a line at all`);
  await page.getByRole("button", { name: "Add these" }).click();
  await expect(page.getByText(/1 added\. Lines 2 were not/)).toBeVisible();
  await expect(page.getByLabel("Recipient 3 address")).toHaveValue(wallet("Test D").primaryAddress);
  await expect(page.getByText(/^0\.875 XMR/)).toBeVisible();

  // The same address twice is refused.
  await page.getByRole("button", { name: "+ Add recipient" }).click();
  await page.getByLabel("Recipient 4 address").fill(wallet("Test B").primaryAddress);
  await page.getByLabel("Recipient 4 amount in XMR").fill("0.1");
  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByText(/Recipient 4 is the same address as an earlier one/)).toBeVisible();
  await page.getByRole("button", { name: "Remove recipient 4" }).click();

  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Recipients" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.getByText("They receive")).toBeVisible();
  await sendNow(page);
  await expect(page.getByRole("heading", { name: "Sent to 3 people" })).toBeVisible();
});

test("scan a payment QR code with the camera", async ({ page }) => {
  const b = wallet("Test B").primaryAddress;
  const png = await QRCode.toDataURL(`monero:${b}?tx_amount=0.25`, { margin: 4, width: 480 });
  // A fake camera: a canvas showing the QR code, streamed like a webcam would be.
  await page.addInitScript((src) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const c = document.createElement("canvas");
      c.width = 640; c.height = 480;
      const ctx = c.getContext("2d")!;
      const img = new Image();
      img.src = src;
      await img.decode();
      const draw = () => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 640, 480); ctx.drawImage(img, 80, 0, 480, 480); };
      draw();
      setInterval(draw, 100);
      return c.captureStream(10);
    };
  }, png);
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  await page.getByRole("button", { name: "Scan QR" }).first().click();
  await expect(page.getByRole("dialog", { name: "Scan a QR code" })).toBeVisible();
  await expect(page.locator("#to")).toHaveValue(b, { timeout: 15_000 });
  await expect(page.locator("#amt")).toHaveValue("0.25");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
