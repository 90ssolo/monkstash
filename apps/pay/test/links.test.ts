import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadConfig, type PayConfig } from "../src/config";
import { createApp, type AppState } from "../src/app";
import { compareAmounts } from "../src/links";
import { Store } from "../src/store";
import type { IncomingPayment, Watcher } from "../src/wallet";
import type { PriceService } from "../src/prices";

// Published stagenet test address (from the wallet-core test vectors); the view key is a dummy.
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";
const KEY = "k".repeat(40);
const XMR = 1_000_000_000_000n;

function fakeWatcher(): Watcher & { next: number } {
  return {
    next: 1,
    async newSubaddress(_label: string, after = 0) { this.next = Math.max(this.next, after + 1); const i = this.next++; return { index: i, address: STAGE }; },
    async incoming() { return []; },
    async sync() {}, async height() { return 1234; }, async save() {}, async close() {},
  };
}
const fakePrices: PriceService = { async quote(currency: string) { return { currency, rate: "250", quotedAt: Date.now(), source: "median of Test" }; } };

let dir: string;
const servers: Server[] = [];

interface App { url: string; store: Store; cfg: PayConfig; state: AppState }

async function startApp(): Promise<App> {
  const cfg = loadConfig({
    PAY_NETWORK: "stagenet", PAY_ADDRESS: STAGE, PAY_VIEW_KEY: "a".repeat(64), PAY_RESTORE_HEIGHT: "1000",
    PAY_NODE_URL: "http://127.0.0.1:1", PAY_API_KEY: KEY, PAY_DATA_DIR: path.join(dir, String(Math.random())), PAY_PUBLIC_URL: "https://pay.shop.example",
    PAY_SHOP_NAME: "Corner Coffee", PAY_CONFIRMATIONS: "standard",
  } as NodeJS.ProcessEnv);
  const store = new Store(cfg.dataDir);
  await store.load();
  const state: AppState = { incoming: [], height: 2000, lastSyncAt: Date.now(), syncError: null };
  const handle = createApp({ cfg, store, watcher: fakeWatcher(), prices: fakePrices, state });
  const srv = createServer((req, res) => void handle(req, res));
  servers.push(srv);
  await new Promise<void>((r) => srv.listen(0, "127.0.0.1", r));
  const a = srv.address();
  return { url: `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`, store, cfg, state };
}

const api = (app: App, p: string, init: RequestInit = {}) =>
  fetch(app.url + p, { ...init, headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json", ...(init.headers ?? {}) } });

async function newLink(app: App, body: Record<string, unknown>) {
  const res = await api(app, "/api/links", { method: "POST", body: JSON.stringify(body) });
  expect(res.status).toBe(201);
  return (await res.json()) as { id: string; url: string; buttonHtml: string; stats: { payments: number; paid: number; open: number; receivedXmr: string }; available: boolean };
}

/** Posts the link form like a browser would, without following the redirect. */
const payVia = (app: App, id: string, amount?: string) =>
  fetch(`${app.url}/l/${id}`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: amount === undefined ? "" : new URLSearchParams({ amount }).toString() });

const invoiceIdFrom = (res: Response) => /^\/pay\/([A-Za-z0-9_-]+)$/.exec(res.headers.get("location") ?? "")?.[1];

/** Marks an invoice fully paid with confirmed coins, as the sync loop would see it. */
function markPaid(app: App, invoiceId: string) {
  const rec = app.store.get(invoiceId)!;
  const hash = invoiceId.padEnd(64, "0").slice(0, 64);
  rec.seen[hash] = Date.now();
  const amount = rec.invoice.amount ? BigInt(rec.invoice.amount) : XMR;
  const p: IncomingPayment = { accountIndex: rec.account ?? 0, subaddressIndex: rec.invoice.subaddressIndex, amount, confirmations: 20, pending: false, hash, timestamp: Math.floor(Date.now() / 1000) };
  app.state.incoming.push(p);
}

beforeAll(async () => { dir = await mkdtemp(path.join(tmpdir(), "monkstash-links-")); });
afterAll(async () => {
  await Promise.all(servers.map((s) => new Promise<void>((r) => s.close(() => r()))));
  await rm(dir, { recursive: true, force: true });
});

describe("compareAmounts", () => {
  it("compares decimals exactly", () => {
    expect(compareAmounts("12.5", "12.50")).toBe(0);
    expect(compareAmounts("9.99", "10")).toBe(-1);
    expect(compareAmounts("0.000000000001", "0")).toBe(1);
  });
});

describe("payment links API", () => {
  let app: App;
  beforeAll(async () => { app = await startApp(); });

  it("needs the API key", async () => {
    expect((await fetch(`${app.url}/api/links`)).status).toBe(401);
  });

  it("creates a fixed-price link with a share URL and a script-free button", async () => {
    const l = await newLink(app, { title: "Logo design", amount: "150", currency: "eur" });
    expect(l.url).toBe(`https://pay.shop.example/l/${l.id}`);
    expect(l.buttonHtml).toContain(`href="${l.url}"`);
    expect(l.buttonHtml).toContain("Pay with Monero");
    expect(l.buttonHtml).not.toMatch(/<script|onclick/i);
    expect(l.available).toBe(true);
    const list = (await (await api(app, "/api/links")).json()) as { links: { id: string }[] };
    expect(list.links.map((x) => x.id)).toContain(l.id);
  });

  it("labels open-amount links as donations", async () => {
    const l = await newLink(app, { title: "Support my podcast", suggested: ["5", "10", "25"], minAmount: "2" });
    expect(l.buttonHtml).toContain("Donate with Monero");
  });

  it.each([
    [{}, /title is required/],
    [{ title: "x", amount: "10", minAmount: "1" }, /only for links where the payer chooses/],
    [{ title: "x", suggested: ["1", "2", "3", "4", "5"] }, /up to 4/],
    [{ title: "x", minAmount: "5", suggested: ["2"] }, /at least minAmount/],
    [{ title: "x", amount: "abc" }, /price like/],
    [{ title: "x", currency: "XMR", amount: "0.1234567890123" }, /at most 12 decimals/],
    [{ title: "x", maxPayments: 0 }, /maxPayments/],
    [{ title: "x", expiresAt: "2001-01-01T00:00:00Z" }, /in the future/],
    [{ title: "x", returnUrl: "http://insecure.example" }, /https/],
    [{ title: "x".repeat(81) }, /at most 80/],
  ])("rejects bad input %#", async (body, msg) => {
    const res = await api(app, "/api/links", { method: "POST", body: JSON.stringify(body) });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(msg);
  });

  it("switches a link off and on, and accepts no other change", async () => {
    const l = await newLink(app, { title: "Tips", minAmount: "1" });
    const off = await api(app, `/api/links/${l.id}`, { method: "PATCH", body: JSON.stringify({ active: false }) });
    expect(((await off.json()) as { active: boolean }).active).toBe(false);
    expect((await fetch(`${app.url}/l/${l.id}`)).status).toBe(410);
    expect((await api(app, `/api/links/${l.id}`, { method: "PATCH", body: JSON.stringify({ title: "new" }) })).status).toBe(400);
    await api(app, `/api/links/${l.id}`, { method: "PATCH", body: JSON.stringify({ active: true }) });
    expect((await fetch(`${app.url}/l/${l.id}`)).status).toBe(200);
  });

  it("answers 404 for unknown links", async () => {
    expect((await api(app, "/api/links/AAAAAAAAAAAAAAAAAAAAAA")).status).toBe(404);
    expect((await fetch(`${app.url}/l/AAAAAAAAAAAAAAAAAAAAAA`)).status).toBe(404);
  });
});

describe("payment link pages", () => {
  let app: App;
  // A fresh server per test: each starts with its own per-visitor limit.
  beforeEach(async () => { app = await startApp(); });

  it("shows the link page with a form that may post only to itself", async () => {
    const l = await newLink(app, { title: "Logo <design>", description: "Two rounds of changes", amount: "150" });
    const res = await fetch(`${app.url}/l/${l.id}`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Logo &lt;design&gt;");
    expect(body).toContain("Two rounds of changes");
    expect(body).toContain("Test network");
    expect(res.headers.get("content-security-policy")).toContain("form-action 'self'");
    expect(res.headers.get("content-security-policy")).toContain("script-src 'self'");
  });

  it("gives each payer of a fixed-price link their own invoice", async () => {
    const l = await newLink(app, { title: "Coffee beans", amount: "12.50", metadata: "sku-42" });
    const a = await payVia(app, l.id);
    const b = await payVia(app, l.id);
    expect(a.status).toBe(303);
    const ia = invoiceIdFrom(a)!, ib = invoiceIdFrom(b)!;
    expect(ia).toBeTruthy();
    expect(ia).not.toBe(ib);
    expect(app.store.get(ia)!.invoice.subaddressIndex).not.toBe(app.store.get(ib)!.invoice.subaddressIndex);
    const inv = (await (await api(app, `/api/invoices/${ia}`)).json()) as { linkId: string; metadata: string; amount: { fiat: { amount: string } } };
    expect(inv.linkId).toBe(l.id);
    expect(inv.metadata).toBe("sku-42");
    expect(inv.amount.fiat.amount).toBe("12.50");
  });

  it("ignores an amount sent for a fixed-price link", async () => {
    const l = await newLink(app, { title: "Fixed", amount: "20" });
    const id = invoiceIdFrom(await payVia(app, l.id, "0.01"))!;
    expect(app.store.get(id)!.invoice.fiat?.amount ?? "").toBe("20");
  });

  it("lets the payer choose an amount, with a minimum and a comma decimal", async () => {
    const l = await newLink(app, { title: "Donate", minAmount: "5", suggested: ["10", "25"] });
    const page = await (await fetch(`${app.url}/l/${l.id}`)).text();
    expect(page).toContain('value="10"');
    expect(page).toContain("At least");
    const low = await payVia(app, l.id, "4.99");
    expect(low.status).toBe(400);
    expect(await low.text()).toContain("The smallest amount is 5 EUR.");
    const bad = await payVia(app, l.id, "lots");
    expect(bad.status).toBe(400);
    expect(await bad.text()).toContain('value="lots"');
    const empty = await payVia(app, l.id, "");
    expect(empty.status).toBe(400);
    const ok = await payVia(app, l.id, "12,5");
    expect(ok.status).toBe(303);
    expect(app.store.get(invoiceIdFrom(ok)!)!.invoice.fiat?.amount).toBe("12.5");
  });

  it("serves a QR code of the link itself", async () => {
    const l = await newLink(app, { title: "Stall", minAmount: "1" });
    const res = await fetch(`${app.url}/l/${l.id}/qr.svg`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/svg+xml");
    expect(await res.text()).toContain("<svg");
  });

  it("never hands a one-off link to two payers, and closes it once paid", async () => {
    const l = await newLink(app, { title: "Invoice 2026-17", amount: "300", maxPayments: 1 });
    const first = invoiceIdFrom(await payVia(app, l.id))!;
    // Opened again (another tab, or the client forwarded the link): the same invoice, not a second one.
    expect(invoiceIdFrom(await payVia(app, l.id))).toBe(first);
    const view = await fetch(`${app.url}/l/${l.id}`, { redirect: "manual" });
    expect(view.status).toBe(303);
    expect(view.headers.get("location")).toBe(`/pay/${first}`);
    markPaid(app, first);
    const done = await fetch(`${app.url}/l/${l.id}`, { redirect: "manual" });
    expect(done.status).toBe(410);
    expect(await done.text()).toContain("has been paid");
    expect((await payVia(app, l.id)).status).toBe(410);
    const stats = ((await (await api(app, `/api/links/${l.id}`)).json()) as { stats: { payments: number; paid: number; receivedXmr: string }; available: boolean });
    expect(stats.stats.payments).toBe(1);
    expect(stats.stats.paid).toBe(1);
    expect(stats.available).toBe(false);
  });

  it("does not create two invoices for a one-off link under simultaneous requests", async () => {
    const l = await newLink(app, { title: "Race", amount: "5", maxPayments: 1 });
    const [a, b] = await Promise.all([payVia(app, l.id), payVia(app, l.id)]);
    expect(invoiceIdFrom(a)).toBe(invoiceIdFrom(b));
    expect(app.store.all().filter((r) => r.linkId === l.id)).toHaveLength(1);
  });

  it("closes an expired link", async () => {
    const l = await newLink(app, { title: "Early bird", amount: "5", expiresAt: new Date(Date.now() + 60_000).toISOString() });
    app.store.getLink(l.id)!.expiresAt = Date.now() - 1;
    const res = await fetch(`${app.url}/l/${l.id}`);
    expect(res.status).toBe(410);
    expect(await res.text()).toContain("has expired");
  });

  it("refuses to create invoices before the first sync", async () => {
    const l = await newLink(app, { title: "Sync", amount: "5" });
    app.state.lastSyncAt = null;
    try {
      expect((await payVia(app, l.id)).status).toBe(503);
    } finally {
      app.state.lastSyncAt = Date.now();
    }
  });
});

describe("payment link limits", () => {
  it("caps how many invoices one visitor can start per minute", async () => {
    const app = await startApp();
    const l = await newLink(app, { title: "Flood", minAmount: "1" });
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) codes.push((await payVia(app, l.id, "1")).status);
    expect(codes.slice(0, 6).every((c) => c === 303)).toBe(true);
    expect(codes[6]).toBe(429);
  });
});
