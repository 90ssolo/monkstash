import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, dashboard, openWallet, restore, synced, testWallets, wallet } from "./helpers";

test.skip(testWallets().length < 2, "needs two wallets in apps/web/test-wallets.local.json");
// A German browser: euros, and "20,00 €" style formatting.
test.use({ locale: "de-DE" });

// The QR encoder the web app itself uses, to draw a "screenshot" of a payment code.
const QRCode = createRequire(fileURLToPath(new URL("../../../apps/web/package.json", import.meta.url)))("qrcode") as { toBuffer(text: string, o: object): Promise<Buffer> };

/** Set E2E_SHOTS to a folder to also save screenshots at phone and desktop widths. */
const shots = process.env.E2E_SHOTS;
async function shoot(page: Page, name: string) {
  if (!shots) return;
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${shots}/${name}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 720 });
}

const section = (page: Page, name: string) => page.getByRole("navigation", { name: "Wallet" }).getByRole("button", { name, exact: true });

/** A fixed price, so amounts are exact: 1 XMR = 200 EUR. */
async function fixedPrice(page: Page) {
  await page.route("**/api/price", (r) => r.fulfill({ json: { ok: true, quotedAt: Date.now(), sources: ["Test"], fxDate: "2026-10-23", rates: { EUR: "200", USD: "220" } } }));
}

test("send: type the amount in euros, switch back to XMR", async ({ page }) => {
  await fixedPrice(page);
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();

  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.getByRole("button", { name: "Type the amount in EUR instead" }).click();
  await expect(page.getByText("Amount (EUR)")).toBeVisible();
  await page.locator("#amt").fill("20");
  await expect(page.locator("#amt-hint")).toContainText("0.1 XMR at today's rate");
  await shoot(page, "send-eur");

  // Switching converts what was typed.
  await page.getByRole("button", { name: "Type the amount in XMR instead" }).click();
  await expect(page.locator("#amt")).toHaveValue("0.1");
  await page.getByRole("button", { name: "Type the amount in EUR instead" }).click();
  await expect(page.locator("#amt")).toHaveValue("20.00");

  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Review payment" })).toBeVisible();
  await expect(page.getByText(/You typed 20,00\s€/)).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: /^0\.1 XMR/ }).first()).toBeVisible();
});

test("activity: a payment's status in plain words, from sent to spendable", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);

  // A fresh payment is on the network, waiting for its first block.
  await section(page, "Send").click();
  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.locator("#amt").fill("0.2");
  await page.getByRole("button", { name: "Review" }).click();
  await page.locator("#send-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();
  await section(page, "Activity").click();
  await page.getByRole("button", { name: "Details of this outgoing payment" }).first().click();
  const status = page.getByRole("list", { name: "Payment status" });
  await expect(status.getByRole("listitem")).toHaveCount(3);
  await expect(status.locator('[aria-current="step"]')).toContainText("Recorded in a block");
  await expect(status).toContainText("Usually within 2 minutes");
  await expect(status).toContainText("Spendable by the recipient");
  await shoot(page, "timeline-pending");

  // An older payment with plenty of confirmations is final.
  // The demo wallet's oldest payment has 42 confirmations.
  await page.locator("li").filter({ hasText: "simaaaaaaa" }).getByRole("button", { name: "Details of this incoming payment" }).click();
  const done = page.getByRole("list", { name: "Payment status" });
  await expect(done).toContainText("Final. It cannot be reversed.");
  await expect(done.locator('[aria-current="step"]')).toHaveCount(0);
});

test("send: Paste reads pay links, joins broken addresses and explains gift links", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  const b = wallet("Test B").primaryAddress;
  const copy = (text: string) => page.evaluate((t) => navigator.clipboard.writeText(t), text);
  const paste = page.getByRole("button", { name: "Paste", exact: true });

  // A MonkStash pay link fills in the address and the amount.
  await copy(`https://monkstash.com/pay#monero:${b}?tx_amount=0.25&tx_description=Coffee`);
  await paste.click();
  await expect(page.locator("#to")).toHaveValue(b);
  await expect(page.locator("#amt")).toHaveValue("0.25");
  await shoot(page, "send-paste");

  // An address copied over three lines is joined up.
  await copy(`${b.slice(0, 30)}\n${b.slice(30, 70)}\n${b.slice(70)}`);
  await paste.click();
  await expect(page.locator("#to")).toHaveValue(b);
  await expect(page.locator("#to-hint")).toContainText("Valid");

  // A gift link is something to open, not an address to pay.
  await copy(`https://wallet.monkstash.com/gift#gift=${"3".repeat(60)}`);
  await paste.click();
  await expect(page.locator("#to")).toHaveValue("");
  await expect(page.getByRole("alert").filter({ hasText: "gift link" })).toBeVisible();
});

test("send: read a payment QR code from a screenshot", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  const b = wallet("Test B").primaryAddress;
  const png = await QRCode.toBuffer(`monero:${b}?tx_amount=0.3`, { margin: 4, width: 600 });

  await page.getByRole("button", { name: "Scan QR" }).click();
  await expect(page.getByRole("heading", { name: "Scan a QR code" })).toBeVisible();
  await shoot(page, "scan-dialog");
  await page.getByLabel("Choose a screenshot or photo").setInputFiles({ name: "screenshot.png", mimeType: "image/png", buffer: png });
  await expect(page.locator("#to")).toHaveValue(b);
  await expect(page.locator("#amt")).toHaveValue("0.3");

  // A picture without a code says so.
  await page.getByRole("button", { name: "Scan QR" }).click();
  const blank = await QRCode.toBuffer("x", { width: 40 });
  await page.getByLabel("Choose a screenshot or photo").setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: Buffer.from(blank).subarray(0, 60) });
  await expect(page.getByRole("status").filter({ hasText: /No QR code|could not be opened/ })).toBeVisible();
});

test("send: a few seconds to undo after approving", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  await page.locator("#to").fill(wallet("Test B").primaryAddress);
  await page.locator("#amt").fill("0.15");
  await page.getByRole("button", { name: "Review" }).click();
  await page.locator("#send-pw").fill(PASSWORD);

  // Undo: nothing is sent, and the review stays so it can be sent or edited.
  await page.getByRole("button", { name: "Send now" }).click();
  await expect(page.getByText(/Sending in [1-5] seconds?/)).toBeVisible();
  await shoot(page, "send-undo");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Cancelled. Nothing was sent.")).toBeVisible();
  await page.waitForTimeout(5500);
  await expect(page.getByText(/Your payment was sent to the network/)).toHaveCount(0);

  // Send again, without waiting for the countdown.
  await page.getByRole("button", { name: "Send now" }).click();
  await page.getByRole("button", { name: "Send without waiting" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();
});

test("install as an app: Chrome finds nothing missing, and Settings explains it", async ({ page }) => {
  await openWallet(page, "simulation");
  const manifest = await (await page.request.get("/app.webmanifest")).json();
  expect(manifest.start_url).toMatch(/^\/(wallet)?$/);
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).status()).toBe(200);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  // Playwright's browser is private (incognito), which never allows installing: that one is expected.
  expect(installabilityErrors.filter((e: { errorId: string }) => e.errorId !== "in-incognito")).toEqual([]);

  await restore(page, wallet("Test A"));
  await dashboard(page);
  await section(page, "Settings").click();
  await expect(page.getByRole("heading", { name: "Install as an app" })).toBeVisible();
  await shoot(page, "settings-install");
  await expect(page.getByText(/same wallet and the same files as this page/)).toBeVisible();
});

test("hear it land: a chime and a message when Monero arrives, sound can be turned off", async ({ page }) => {
  // Count the notes played, without speakers.
  await page.addInitScript(() => {
    const w = window as unknown as { __notes: number; AudioContext: typeof AudioContext };
    w.__notes = 0;
    const make = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function (this: AudioContext) { w.__notes++; return make.call(this); };
  });
  const notes = () => page.evaluate(() => (window as unknown as { __notes: number }).__notes);
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  // The existing history never chimes.
  await page.waitForTimeout(6000);
  expect(await notes()).toBe(0);

  // The simulation pays a new payment request a few seconds after it is made.
  await section(page, "Get paid").click();
  await page.locator("#req-amt").fill("0.4");
  await page.getByRole("button", { name: "Create payment request" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Received 0.4 XMR" })).toBeVisible({ timeout: 25_000 });
  expect(await notes()).toBeGreaterThan(0);
  await shoot(page, "arrival");

  // Sound off: the message still shows, no chime.
  await section(page, "Settings").click();
  await page.getByRole("checkbox", { name: /Play a short sound when Monero arrives/ }).uncheck();
  const before = await notes();
  await section(page, "Get paid").click();
  await page.locator("#req-amt").fill("0.6");
  await page.getByRole("button", { name: "Create payment request" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Received 0.6 XMR" })).toBeVisible({ timeout: 25_000 });
  expect(await notes()).toBe(before);
});

test("contacts: give someone their own address, and see what arrived from it", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Contacts").click();
  await page.locator("#c-name").fill("Kai");
  await page.locator("#c-addr").fill(wallet("Test B").primaryAddress);
  await page.getByRole("button", { name: "Save contact" }).click();

  await page.getByRole("button", { name: "Give Kai their own address" }).click();
  await expect(page.getByText(/Their address for paying you/)).toBeVisible();
  await expect(page.getByText("Nothing received at it yet")).toBeVisible();
  // The simulation pays a new address 0.1 XMR a few seconds after it is made.
  await expect(page.getByText("Received 0.1 XMR from it")).toBeVisible({ timeout: 25_000 });
  await shoot(page, "contact-address");

  // The same address is listed under Receive, named after Kai, with its total.
  await section(page, "Receive").click();
  const kai = page.getByRole("region", { name: "Addresses you named" }).locator("li").filter({ hasText: "Kai" });
  await expect(kai).toContainText("Received 0.1 XMR");
});

test("receipts and refunds: a link's shop and purpose become the note, a refund address, a receipt with signed proofs", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Send").click();
  const b = wallet("Test B").primaryAddress;
  await page.evaluate((t) => navigator.clipboard.writeText(t), `monero:${b}?tx_amount=0.2&recipient_name=Corner%20Shop&tx_description=Order%2042`);
  await page.getByRole("button", { name: "Paste", exact: true }).click();
  await page.getByRole("button", { name: "Review" }).click();
  await page.locator("#send-pw").fill(PASSWORD);
  await page.getByRole("button", { name: "Send now" }).click();
  await page.getByRole("button", { name: "Send without waiting" }).click();
  await expect(page.getByText(/Your payment was sent to the network/)).toBeVisible();

  await page.getByRole("button", { name: "Get a refund address" }).click();
  await expect(page.getByText(/Your refund address for Corner Shop/)).toBeVisible();
  await shoot(page, "refund");

  await section(page, "Activity").click();
  await expect(page.getByText("Corner Shop: Order 42").filter({ visible: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Details of this outgoing payment" }).first().click();
  await page.getByRole("button", { name: "Make a receipt" }).click();
  const receipt = page.locator("pre code").filter({ hasText: "MonkStash payment receipt" });
  await expect(receipt).toContainText("For: Corner Shop: Order 42");
  await expect(receipt).toContainText("Signed proof: OutProofV2");
  await expect(receipt).not.toContainText("Transaction key");

  await section(page, "Receive").click();
  await expect(page.getByRole("region", { name: "Addresses you named" })).toContainText("Refund from Corner Shop");
});

test("proof of funds: prove at least an amount, check it, and a changed message fails", async ({ page }) => {
  await openWallet(page, "simulation");
  await restore(page, wallet("Test A"));
  await dashboard(page);
  await synced(page);
  await section(page, "Activity").click();
  await page.getByRole("button", { name: "Proof of funds" }).click();
  await expect(page.getByText(/names the coins it covers/)).toBeVisible();
  await page.locator("#funds-amt").fill("2.5");
  await page.locator("#funds-msg").fill("Trade 7");
  await page.getByRole("button", { name: "Make proof of funds" }).click();
  const proof = page.locator("pre code").filter({ hasText: "Monero proof of funds" });
  await expect(proof).toContainText("At least: 2.5 XMR");
  await expect(proof).toContainText("Signed proof: ReserveProofV2");
  await shoot(page, "funds");
  const text = await proof.innerText();

  await page.locator("#funds-paste").fill(text);
  await page.getByRole("button", { name: "Check proof" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Valid: this wallet holds at least 2.5 XMR" })).toBeVisible();

  await page.locator("#funds-paste").fill(text.replace("Message: Trade 7", "Message: Trade 8"));
  await page.getByRole("button", { name: "Check proof" }).click();
  await expect(page.getByText("This proof does not check out")).toBeVisible();
});
