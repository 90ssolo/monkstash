import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { EXPIRY_GRACE_MS, parsePaymentUri } from "@quietmint/wallet-core";
import { loadConfig, ConfigError, type PayConfig } from "../src/config";
import { createApp, SYNCING_MESSAGE, type AppState } from "../src/app";
import { accountsInUse, createShopInvoice, highestIndexes, presentInvoice, reconcile, subaddressUsage } from "../src/invoices";
import { Store, type StoredInvoice } from "../src/store";
import { isLockedPayment, type IncomingPayment, type Watcher } from "../src/wallet";
import { deliverDue, RETRY_DELAYS_MS, sign, verifySignature } from "../src/webhooks";
import { createPriceService, ecbWarning, type PriceService } from "../src/prices";

// Published stagenet test address (from the wallet-core test vectors); the view key is a dummy.
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";
const KEY = "k".repeat(40);
const XMR = 1_000_000_000_000n;

const env = (dir: string, extra: Record<string, string> = {}) => ({
  PAY_NETWORK: "stagenet", PAY_ADDRESS: STAGE, PAY_VIEW_KEY: "a".repeat(64), PAY_RESTORE_HEIGHT: "1000",
  PAY_NODE_URL: "http://127.0.0.1:1", PAY_API_KEY: KEY, PAY_DATA_DIR: dir, PAY_PUBLIC_URL: "https://pay.shop.example",
  PAY_SHOP_NAME: "Corner Coffee", PAY_CONFIRMATIONS: "standard", PAY_WEBHOOK_URL: "https://shop.example/hook", PAY_WEBHOOK_SECRET: "s".repeat(40), ...extra,
});

function fakeWatcher(): Watcher & { next: number } {
  return {
    next: 1,
    async newSubaddress(_label: string, after = 0) { this.next = Math.max(this.next, after + 1); const i = this.next++; return { index: i, address: STAGE }; },
    async incoming(_accounts: number[]) { return []; },
    async sync() {}, async height() { return 1234; }, async save() {}, async close() {},
  };
}
const fakePrices: PriceService = { async quote(currency: string) { return { currency, rate: "250", quotedAt: Date.now(), source: "median of Test" }; } };

let dir: string;
let cfg: PayConfig;
let store: Store;
let state: AppState;
let server: Server;
let base: string;
const extraServers: Server[] = [];

/** A second app with its own settings, for limits that need a fresh server. */
async function startApp(extra: Record<string, string>, appState: AppState = { incoming: [], height: 1, lastSyncAt: Date.now(), syncError: null }): Promise<{ url: string; store: Store; cfg: PayConfig }> {
  const c = loadConfig(env(path.join(dir, String(Math.random())), extra) as NodeJS.ProcessEnv);
  const st = new Store(c.dataDir);
  await st.load();
  const handle = createApp({ cfg: c, store: st, watcher: fakeWatcher(), prices: fakePrices, state: appState });
  const srv = createServer((req, res) => void handle(req, res));
  extraServers.push(srv);
  await new Promise<void>((r) => srv.listen(0, "127.0.0.1", r));
  const a = srv.address();
  return { url: `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`, store: st, cfg: c };
}

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "monkstash-pay-"));
});
afterAll(async () => {
  server?.close();
  extraServers.forEach((s) => s.close());
  await rm(dir, { recursive: true, force: true });
});
beforeEach(async () => {
  server?.close();
  cfg = loadConfig(env(path.join(dir, String(Math.random()))) as NodeJS.ProcessEnv);
  store = new Store(cfg.dataDir);
  await store.load();
  state = { incoming: [], height: 1234, lastSyncAt: Date.now(), syncError: null };
  const handle = createApp({ cfg, store, watcher: fakeWatcher(), prices: fakePrices, state });
  server = createServer((req, res) => void handle(req, res));
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const a = server.address();
  base = `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`;
});

const api = (p: string, init: RequestInit = {}) =>
  fetch(base + p, { ...init, headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json", ...(init.headers ?? {}) } });
const create = (body: unknown) => api("/api/invoices", { method: "POST", body: JSON.stringify(body) });
const createAt = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(url + "/api/invoices", { method: "POST", body: JSON.stringify(body), headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json", ...headers } });

describe("config", () => {
  it("rejects unsafe or missing settings", () => {
    expect(() => loadConfig(env(dir, { PAY_API_KEY: "short" }) as never)).toThrow(ConfigError);
    expect(() => loadConfig(env(dir, { PAY_VIEW_KEY: "nope" }) as never)).toThrow(/view key/);
    expect(() => loadConfig(env(dir, { PAY_NETWORK: "mainnet" }) as never)).toThrow(/not a mainnet address/);
    expect(() => loadConfig(env(dir, { PAY_WEBHOOK_SECRET: "" }) as never)).toThrow(/WEBHOOK_SECRET/);
    expect(() => loadConfig(env(dir, { PAY_CONFIRMATIONS: "yolo" }) as never)).toThrow(ConfigError);
  });
  it("requires a restore height, with a helpful message", () => {
    expect(() => loadConfig(env(dir, { PAY_RESTORE_HEIGHT: "" }) as never)).toThrow(/PAY_RESTORE_HEIGHT is required/);
    expect(() => loadConfig(env(dir, { PAY_RESTORE_HEIGHT: "  " }) as never)).toThrow(/PAY_RESTORE_HEIGHT is required/);
    expect(() => loadConfig(env(dir, { PAY_RESTORE_HEIGHT: "-5" }) as never)).toThrow(/block height/);
    expect(() => loadConfig(env(dir, { PAY_RESTORE_HEIGHT: "12.5" }) as never)).toThrow(/block height/);
    expect(loadConfig(env(dir, { PAY_RESTORE_HEIGHT: "0" }) as never).restoreHeight).toBe(0);
  });
  it("uses wallet account 1 unless PAY_ACCOUNT says otherwise", () => {
    expect(loadConfig(env(dir) as never).account).toBe(1);
    expect(loadConfig(env(dir, { PAY_ACCOUNT: "0" }) as never).account).toBe(0);
    expect(loadConfig(env(dir, { PAY_ACCOUNT: "7" }) as never).account).toBe(7);
    expect(() => loadConfig(env(dir, { PAY_ACCOUNT: "-1" }) as never)).toThrow(/PAY_ACCOUNT/);
    expect(() => loadConfig(env(dir, { PAY_ACCOUNT: "one" }) as never)).toThrow(/PAY_ACCOUNT/);
  });
  it("caps open invoices at 500 unless set", () => {
    expect(loadConfig(env(dir) as never).maxOpenInvoices).toBe(500);
    expect(loadConfig(env(dir, { PAY_MAX_OPEN_INVOICES: "20" }) as never).maxOpenInvoices).toBe(20);
    expect(() => loadConfig(env(dir, { PAY_MAX_OPEN_INVOICES: "0" }) as never)).toThrow(/PAY_MAX_OPEN_INVOICES/);
  });
});

describe("API", () => {
  it("requires the API key", async () => {
    expect((await fetch(base + "/api/health")).status).toBe(401);
    expect((await fetch(base + "/api/health", { headers: { authorization: "Bearer wrong" } })).status).toBe(401);
    const h = await api("/api/health");
    expect(h.status).toBe(200);
    expect(await h.json()).toMatchObject({
      ok: true, network: "stagenet", height: 1234, openInvoices: 0, maxOpenInvoices: 500,
      subaddresses: { account: 1, highestIndex: 0, lastPaidIndex: 0, gap: 0, lookaheadWarning: false },
    });
  });

  it("reports the subaddress lookahead gap in health", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) ids.push((await (await create({ amount: "0.1", currency: "XMR" })).json()).id);
    const paidIdx = store.get(ids[1]!)!.invoice.subaddressIndex;
    await reconcile(store, [{ accountIndex: 1, subaddressIndex: paidIdx, amount: XMR / 10n, confirmations: 1, pending: false, hash: "gap" }], cfg);
    const h = await (await api("/api/health")).json();
    const highest = store.get(ids[3]!)!.invoice.subaddressIndex;
    expect(h.subaddresses).toMatchObject({ account: 1, highestIndex: highest, lastPaidIndex: paidIdx, gap: highest - paidIdx, warnAbove: 150, lookaheadWarning: false });
    expect(h.openInvoices).toBe(3);
  });

  it("limits new invoices per client, honouring PAY_TRUST_PROXY", async () => {
    const app = await startApp({ PAY_TRUST_PROXY: "1" });
    const body = { amount: "0.01", currency: "XMR" };
    for (let i = 0; i < 60; i++) expect((await createAt(app.url, body, { "x-forwarded-for": "203.0.113.5" })).status).toBe(201);
    const blocked = await createAt(app.url, body, { "x-forwarded-for": "203.0.113.5" });
    expect(blocked.status).toBe(429);
    expect((await blocked.json()).error).toMatch(/Too many new invoices/);
    // Another client is not held up by the first one's flood.
    expect((await createAt(app.url, body, { "x-forwarded-for": "198.51.100.9" })).status).toBe(201);
  });

  it("refuses new invoices with 503 when too many unpaid ones are open", async () => {
    const app = await startApp({ PAY_MAX_OPEN_INVOICES: "2" });
    const body = { amount: "0.01", currency: "XMR" };
    expect((await createAt(app.url, body)).status).toBe(201);
    const second = await (await createAt(app.url, body)).json();
    const third = await createAt(app.url, body);
    expect(third.status).toBe(503);
    expect((await third.json()).error).toMatch(/2 unpaid payment requests open/);
    // Once one has received money, there is room again.
    app.store.get(second.id)!.seen.someTx = Date.now();
    expect((await createAt(app.url, body)).status).toBe(201);
  });

  it("creates a fiat invoice with a fresh subaddress and a checkout link", async () => {
    const res = await create({ amount: "12.50", currency: "EUR", reference: "Order 42", metadata: "{\"order\":42}", returnUrl: "https://shop.example/thanks" });
    expect(res.status).toBe(201);
    const inv = await res.json();
    expect(inv).toMatchObject({ status: "waiting", expired: false, reference: "Order 42", amount: { xmr: "0.05", fiat: { currency: "EUR", amount: "12.50", rate: "250" } }, metadata: "{\"order\":42}", requiredConfirmations: 1 });
    expect(inv.checkoutUrl).toBe(`https://pay.shop.example/pay/${inv.id}`);
    expect(inv.id).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(inv.paymentUri).toContain("tx_amount=0.05");
    const again = await (await create({ amount: "12.50" })).json();
    expect(store.get(again.id)!.invoice.subaddressIndex).not.toBe(store.get(inv.id)!.invoice.subaddressIndex);
    expect(again.amount.fiat.currency).toBe("EUR");
  });

  it("validates input", async () => {
    expect((await create({ amount: "abc" })).status).toBe(400);
    expect((await create({})).status).toBe(400);
    expect((await create({ amount: "1", returnUrl: "javascript:alert(1)" })).status).toBe(400);
    expect((await create({ amount: "1", reference: "x".repeat(65) })).status).toBe(400);
    expect((await api("/api/invoices", { method: "POST", body: "not json" })).status).toBe(400);
    expect((await api("/api/invoices", { method: "POST", body: "{}", headers: { "content-type": "text/plain" } })).status).toBe(415);
    expect((await api("/api/invoices", { method: "POST", body: JSON.stringify({ amount: "1", note: "x".repeat(20_000) }) })).status).toBe(413);
  });

  it("accepts only 3-letter currency codes", async () => {
    for (const currency of ["EURO", "E1", "123", "e u"]) {
      const res = await create({ amount: "1", currency });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("currency must be a 3-letter code like EUR or XMR.");
    }
    const lower = await create({ amount: "0.1", currency: "xmr" });
    expect(lower.status).toBe(201);
    expect((await lower.json()).amount.xmr).toBe("0.1");
  });

  it("answers 503 with Retry-After until the first sync, but health still works", async () => {
    const st: AppState = { incoming: [], height: 0, lastSyncAt: null, syncError: null };
    const app = await startApp({}, st);
    const rec = await createShopInvoice({ amount: "0.1", currency: "XMR" }, { cfg: app.cfg, store: app.store, watcher: fakeWatcher(), prices: fakePrices });
    const id = rec.invoice.id;
    const auth = { authorization: `Bearer ${KEY}` };
    const checks = [
      await createAt(app.url, { amount: "0.1", currency: "XMR" }),
      await fetch(`${app.url}/api/invoices/${id}`, { headers: auth }),
      await fetch(`${app.url}/pay/${id}/status`),
      await fetch(`${app.url}/pay/${id}/qr.svg`),
    ];
    for (const r of checks) {
      expect(r.status).toBe(503);
      expect(r.headers.get("retry-after")).toBe("60");
      expect((await r.json()).error).toBe(SYNCING_MESSAGE);
    }
    const page = await fetch(`${app.url}/pay/${id}`);
    expect(page.status).toBe(503);
    expect(page.headers.get("retry-after")).toBe("60");
    expect(await page.text()).toContain("still syncing");
    expect((await fetch(`${app.url}/api/health`, { headers: auth })).status).toBe(200);
    // Once a sync has succeeded, everything answers again.
    st.lastSyncAt = Date.now();
    expect((await fetch(`${app.url}/pay/${id}/status`)).status).toBe(200);
    expect((await fetch(`${app.url}/api/invoices/${id}`, { headers: auth })).status).toBe(200);
  });

  it("serves a safe checkout page, live status without metadata, and a QR", async () => {
    const inv = await (await create({ amount: "0.25", currency: "XMR", reference: "<script>alert(1)</script>", metadata: "secret-order-data" })).json();
    const page = await fetch(base + `/pay/${inv.id}`);
    expect(page.headers.get("content-security-policy")).toContain("script-src 'self'");
    const html = await page.text();
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("0.25 XMR");
    expect(html).not.toContain("secret-order-data");
    const st = await (await fetch(base + `/pay/${inv.id}/status`)).json();
    expect(st).toMatchObject({ status: "waiting", expired: false, pending: false, remaining: "0.25" });
    expect(JSON.stringify(st)).not.toContain("secret-order-data");
    const qr = await fetch(base + `/pay/${inv.id}/qr.svg`);
    expect(qr.headers.get("content-type")).toBe("image/svg+xml");
    expect(await qr.text()).toContain("<svg");
    expect((await fetch(base + "/pay/doesnotexist0000000000")).status).toBe(404);
  });
  it("offers Pay with MonkStash with the order filled in, and the shop can turn it off", async () => {
    const inv = await (await create({ amount: "10", currency: "EUR", reference: "Order 7", returnUrl: "https://shop.example/orders/7" })).json();
    expect(inv.monkstashUrl.startsWith("https://wallet.monkstash.com/#pay=")).toBe(true);
    const r = parsePaymentUri(decodeURIComponent(inv.monkstashUrl.split("#pay=")[1]));
    expect(r).toMatchObject({ address: inv.address, note: "Order 7", name: "Corner Coffee", invoiceId: inv.id, returnUrl: "https://shop.example/orders/7", fiat: { currency: "EUR", amount: "10" } });
    expect(r.expiresAt).toBe(Math.floor(Date.parse(inv.expiresAt) / 1000) * 1000);
    const html = await (await fetch(base + `/pay/${inv.id}`)).text();
    expect(html).toContain('id="monkstash"');
    expect((await (await fetch(base + `/pay/${inv.id}/status`)).json()).monkstashUrl).toBe(inv.monkstashUrl);

    const off = await startApp({ PAY_MONKSTASH_WALLET: "off" });
    const res = await fetch(off.url + "/api/invoices", { method: "POST", headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" }, body: JSON.stringify({ amount: "1", currency: "XMR" }) });
    const inv2 = await res.json();
    expect(inv2.monkstashUrl).toBeNull();
    expect(await (await fetch(off.url + `/pay/${inv2.id}`)).text()).not.toContain('id="monkstash"');
    expect(() => loadConfig(env(dir, { PAY_MONKSTASH_WALLET: "http://evil.example/" }) as never)).toThrow(/PAY_MONKSTASH_WALLET/);
  });
});

describe("payments and webhooks", () => {
  const pay = (index: number, amount: bigint, extra: Partial<IncomingPayment> = {}): IncomingPayment => ({ accountIndex: 1, subaddressIndex: index, amount, confirmations: 0, pending: true, hash: `h${index}-${amount}`, ...extra });
  const idxOf = (id: string) => store.get(id)!.invoice.subaddressIndex;
  const eventsOf = (s: Store) => s.outbox.map((o) => ({ type: o.event, data: JSON.parse(o.body).data }));

  it("queues one webhook per status change: confirming, then paid", async () => {
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    const rec = store.get(inv.id)!;
    const idx = rec.invoice.subaddressIndex;
    expect(await reconcile(store, [], cfg)).toBe(0);
    expect(await reconcile(store, [pay(idx, XMR / 2n)], cfg)).toBe(1);
    expect(await reconcile(store, [pay(idx, XMR / 2n)], cfg)).toBe(0);
    expect(await reconcile(store, [pay(idx, XMR / 2n, { pending: false, confirmations: 1, timestamp: Math.floor(Date.now() / 1000) })], cfg)).toBe(1);
    const events = store.outbox.map((o) => JSON.parse(o.body));
    expect(events.map((e) => e.type)).toEqual(["invoice.confirming", "invoice.paid"]);
    expect(events[1].data).toMatchObject({ id: inv.id, status: "paid", received: "0.5" });
  });

  it("makes invoices in the configured account and ignores the same index in other accounts", async () => {
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    expect(store.get(inv.id)!.account).toBe(1);
    const idx = idxOf(inv.id);
    // A till or payment link in account 0 uses the same subaddress index: not ours.
    await reconcile(store, [pay(idx, XMR / 2n, { accountIndex: 0, pending: false, confirmations: 5 })], cfg);
    expect(store.outbox).toHaveLength(0);
    await reconcile(store, [pay(idx, XMR / 2n, { pending: false, confirmations: 5 })], cfg);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.paid"]);
  });

  it("keeps older account-0 invoices working and skips used indexes per account", async () => {
    const legacy: StoredInvoice = {
      invoice: { id: "legacyinvoice000000000000", subaddressIndex: 40, address: STAGE, amount: String(XMR), confirmations: 1, tolerance: "0", createdAt: Date.now() },
      seen: {},
    };
    await store.put(legacy);
    expect(accountsInUse(store, cfg)).toEqual([0, 1]);
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    // Index 40 in account 0 does not push account 1's numbering up.
    expect(idxOf(inv.id)).toBeLessThan(40);
    expect(highestIndexes(store)).toEqual({ 0: 40, 1: idxOf(inv.id) });
    expect(subaddressUsage(store, 1).highestIndex).toBe(idxOf(inv.id));
    // A second invoice in account 1 still skips the first one's index.
    const next = await createShopInvoice({ amount: "0.3", currency: "XMR" }, { cfg, store, watcher: fakeWatcher(), prices: fakePrices });
    expect(next.invoice.subaddressIndex).toBe(idxOf(inv.id) + 1);
    await reconcile(store, [pay(40, XMR, { accountIndex: 0, pending: false, confirmations: 2 })], cfg);
    expect(eventsOf(store).map((e) => [e.type, e.data.id])).toEqual([["invoice.paid", legacy.invoice.id]]);
  });

  it("reports partial payments each time more arrives", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR" })).json();
    const idx = store.get(inv.id)!.invoice.subaddressIndex;
    await reconcile(store, [pay(idx, XMR / 4n, { pending: false, confirmations: 2 })], cfg);
    await reconcile(store, [pay(idx, XMR / 4n, { pending: false, confirmations: 2 }), pay(idx, XMR / 4n + 1n, { pending: false, confirmations: 2 })], cfg);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.partial", "invoice.partial"]);
  });

  it("expires unpaid invoices and flags late payments", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = store.get(inv.id)!.invoice.subaddressIndex;
    const later = Date.now() + 10 * 60_000;
    await reconcile(store, [], cfg, later);
    await reconcile(store, [pay(idx, XMR, { pending: false, confirmations: 3, timestamp: Math.floor(later / 1000) })], cfg, later + 1000);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.expired", "invoice.late"]);
  });

  it("waits out the grace period before reporting expiry, and counts a payment seen in it", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = idxOf(inv.id);
    const expiresAt = Date.parse(inv.expiresAt);
    const inGrace = expiresAt + EXPIRY_GRACE_MS - 30_000;
    expect(await reconcile(store, [], cfg, expiresAt + 1000)).toBe(0);
    expect(presentInvoice(store.get(inv.id)!, [], cfg, { now: expiresAt + 1000 })).toMatchObject({ status: "waiting", expired: true });
    await reconcile(store, [pay(idx, XMR, { pending: false, confirmations: 1, timestamp: Math.floor(inGrace / 1000) })], cfg, inGrace + 1000);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.paid"]);
  });

  it("tells the shop when a partly paid invoice expires, and the page stops asking for the rest", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = idxOf(inv.id);
    const part = [pay(idx, XMR / 4n, { pending: false, confirmations: 2, timestamp: Math.floor(Date.now() / 1000) })];
    await reconcile(store, part, cfg);
    const expiresAt = Date.parse(inv.expiresAt);
    // Hold over but still inside the grace period: no event yet, but the page says expired.
    expect(await reconcile(store, part, cfg, expiresAt + 1000)).toBe(0);
    expect(presentInvoice(store.get(inv.id)!, part, cfg, { now: expiresAt + 1000 })).toMatchObject({ status: "partial", expired: true, received: "0.25" });
    expect(await reconcile(store, part, cfg, expiresAt + EXPIRY_GRACE_MS + 1000)).toBe(1);
    expect(await reconcile(store, part, cfg, expiresAt + EXPIRY_GRACE_MS + 60_000)).toBe(0);
    const ev = eventsOf(store);
    expect(ev.map((e) => e.type)).toEqual(["invoice.partial", "invoice.expired"]);
    expect(ev[1]!.data).toMatchObject({ status: "partial", expired: true, received: "0.25", remaining: "0.75" });
  });

  it("the checkout status says expired once the hold has ended", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    store.get(inv.id)!.invoice.expiresAt = Date.now() - 1000;
    const st = await (await fetch(base + `/pay/${inv.id}/status`)).json();
    expect(st).toMatchObject({ status: "waiting", expired: true });
    const part = pay(idxOf(inv.id), XMR / 4n, { pending: false, confirmations: 2, timestamp: Math.floor((Date.now() - 60_000) / 1000) });
    state.incoming = [part];
    expect(await (await fetch(base + `/pay/${inv.id}/status`)).json()).toMatchObject({ status: "partial", expired: true, received: "0.25" });
    const html = await (await fetch(base + `/pay/${inv.id}`)).text();
    expect(html).toContain('data-expired="1"');
    // The page script still parses after the expired states were added.
    const js = await (await fetch(base + "/assets/checkout.js")).text();
    expect(() => new Function(js)).not.toThrow();
    expect(js).toContain("st.expired");
  });

  it("paid is final: a later tiny payment does not send the shop back to confirming", async () => {
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    const idx = idxOf(inv.id);
    const main = pay(idx, XMR / 2n, { pending: false, confirmations: 3, timestamp: Math.floor(Date.now() / 1000), hash: "main" });
    await reconcile(store, [main], cfg);
    const dust = pay(idx, 1000n, { pending: true, hash: "dust" });
    const later = Date.now() + 60_000;
    expect(await reconcile(store, [main, dust], cfg, later)).toBe(0);
    expect(presentInvoice(store.get(inv.id)!, [main, dust], cfg, { now: later })).toMatchObject({ status: "paid", overpaid: "0.000000001", confirmations: 3 });
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.paid"]);
  });

  it("sends invoice.reverted when an unconfirmed payment the shop was told about disappears", async () => {
    const quick = await startApp({ PAY_CONFIRMATIONS: "quick" });
    const inv = await (await createAt(quick.url, { amount: "0.05", currency: "XMR" })).json();
    expect(inv.requiredConfirmations).toBe(0);
    const idx = quick.store.get(inv.id)!.invoice.subaddressIndex;
    expect(await reconcile(quick.store, [pay(idx, XMR / 20n, { hash: "zc" })], quick.cfg)).toBe(1);
    // Dropped from the mempool (a double spend, say): it is gone from the wallet.
    expect(await reconcile(quick.store, [], quick.cfg)).toBe(1);
    expect(await reconcile(quick.store, [], quick.cfg)).toBe(0);
    const ev = eventsOf(quick.store);
    expect(ev.map((e) => e.type)).toEqual(["invoice.paid", "invoice.reverted"]);
    expect(ev[1]!.data).toMatchObject({ status: "waiting", received: "0" });
  });

  it("sends invoice.reverted when a late payment disappears", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = idxOf(inv.id);
    const later = Date.parse(inv.expiresAt) + 20 * 60_000;
    await reconcile(store, [], cfg, later);
    expect(await reconcile(store, [pay(idx, XMR, { hash: "lt" })], cfg, later + 1000)).toBe(1);
    expect(await reconcile(store, [], cfg, later + 2000)).toBe(1);
    expect(await reconcile(store, [], cfg, later + 3000)).toBe(0);
    expect(eventsOf(store).map((e) => e.type)).toEqual(["invoice.expired", "invoice.late", "invoice.reverted"]);
  });

  it("never counts a payment whose coins the sender locked, and tells the shop once", async () => {
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    const idx = idxOf(inv.id);
    const ts = Math.floor(Date.now() / 1000);
    // Confirmed many times over, but spendable only at block 5,000,000.
    const trap = pay(idx, XMR / 2n, { pending: false, confirmations: 30, timestamp: ts, hash: "trap", locked: true, unlockTime: "5000000" });
    expect(await reconcile(store, [trap], cfg)).toBe(1);
    expect(await reconcile(store, [trap], cfg)).toBe(0);
    expect(presentInvoice(store.get(inv.id)!, [trap], cfg, { withMetadata: true })).toMatchObject({
      status: "waiting", received: "0", txHashes: [],
      lockedPayments: [{ txHash: "trap", amount: "0.5", unlockTime: "5000000", confirmations: 30 }],
    });
    // A normal payment afterwards still completes the order.
    const good = pay(idx, XMR / 2n, { pending: false, confirmations: 2, timestamp: ts, hash: "good" });
    expect(await reconcile(store, [trap, good], cfg)).toBe(1);
    const ev = eventsOf(store);
    expect(ev.map((e) => e.type)).toEqual(["invoice.locked", "invoice.paid"]);
    expect(ev[0]!.data).toMatchObject({ status: "waiting", lockedPayments: [{ txHash: "trap" }] });
    expect(ev[1]!.data).toMatchObject({ status: "paid", received: "0.5", txHashes: ["good"] });
  });

  it("treats any non-zero unlock time, or coins locked past 10 blocks, as locked", () => {
    expect(isLockedPayment(0n, true, 3)).toBe(false); // the normal 10-block lock
    expect(isLockedPayment(0n, false, 30)).toBe(false);
    expect(isLockedPayment(0n, true, 11)).toBe(true);
    expect(isLockedPayment(1n, false, 30)).toBe(true);
    expect(isLockedPayment(1_800_000_000n, false, 0)).toBe(true); // a Unix time
  });

  it("sends invoice.reverted when a reorganization removes a payment past the safe 10 confirmations", async () => {
    const safe = await startApp({ PAY_CONFIRMATIONS: "safe" });
    const inv = await (await createAt(safe.url, { amount: "0.5", currency: "XMR" })).json();
    expect(inv.requiredConfirmations).toBe(10);
    const idx = safe.store.get(inv.id)!.invoice.subaddressIndex;
    const ts = Math.floor(Date.now() / 1000);
    expect(await reconcile(safe.store, [pay(idx, XMR / 2n, { pending: false, confirmations: 15, timestamp: ts, hash: "rg" })], safe.cfg)).toBe(1);
    // 18 blocks replaced, and the new chain does not contain the payment.
    expect(await reconcile(safe.store, [], safe.cfg)).toBe(1);
    expect(await reconcile(safe.store, [], safe.cfg)).toBe(0);
    const ev = eventsOf(safe.store);
    expect(ev.map((e) => e.type)).toEqual(["invoice.paid", "invoice.reverted"]);
    expect(ev[1]!.data).toMatchObject({ status: "waiting", received: "0" });
  });

  it("sends invoice.reverted when a reorganization sends a paid invoice back to confirming, then paid again", async () => {
    const safe = await startApp({ PAY_CONFIRMATIONS: "safe" });
    const inv = await (await createAt(safe.url, { amount: "0.5", currency: "XMR" })).json();
    const idx = safe.store.get(inv.id)!.invoice.subaddressIndex;
    const ts = Math.floor(Date.now() / 1000);
    const at = (confirmations: number) => pay(idx, XMR / 2n, { pending: confirmations === 0, confirmations, hash: "rc", ...(confirmations ? { timestamp: ts } : {}) });
    await reconcile(safe.store, [at(12)], safe.cfg);
    // Back in the mempool after the reorganization, then mined again.
    expect(await reconcile(safe.store, [at(0)], safe.cfg)).toBe(1);
    expect(await reconcile(safe.store, [at(3)], safe.cfg)).toBe(0);
    expect(await reconcile(safe.store, [at(10)], safe.cfg)).toBe(1);
    const ev = eventsOf(safe.store);
    expect(ev.map((e) => e.type)).toEqual(["invoice.paid", "invoice.reverted", "invoice.paid"]);
    expect(ev[1]!.data).toMatchObject({ status: "confirming", confirmations: 0, pending: true });
  });

  it("stops re-checking a paid invoice a week after it was made", async () => {
    const inv = await (await create({ amount: "0.5", currency: "XMR" })).json();
    const idx = idxOf(inv.id);
    const ts = Math.floor(Date.now() / 1000);
    await reconcile(store, [pay(idx, XMR / 2n, { pending: false, confirmations: 2, timestamp: ts, hash: "old" })], cfg);
    expect(await reconcile(store, [], cfg, Date.now() + 8 * 24 * 3600_000)).toBe(0);
    expect(eventsOf(store).map((e) => e.type)).toEqual(["invoice.paid"]);
  });

  it("decides status as of the last successful sync, not the wall clock", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const rec = store.get(inv.id)!;
    const expiresAt = Date.parse(inv.expiresAt);
    const muchLater = expiresAt + EXPIRY_GRACE_MS + 30 * 60_000;
    // The node has been unreachable since before the invoice expired.
    const syncedAt = expiresAt - 60_000;
    expect(presentInvoice(rec, [], cfg, { now: muchLater, syncedAt })).toMatchObject({ status: "waiting", expired: true });
    expect(presentInvoice(rec, [], cfg, { now: muchLater, syncedAt: muchLater })).toMatchObject({ status: "expired", expired: true });
    expect(await reconcile(store, [], cfg, muchLater, { syncedAt })).toBe(0);
    expect(store.outbox).toHaveLength(0);
    // The node is back: now the expiry is real.
    expect(await reconcile(store, [], cfg, muchLater + 1000)).toBe(1);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.expired"]);
  });

  it("dates a mempool payment found after a sync gap from the previous sync, so it is not late", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = idxOf(inv.id);
    const createdAt = Date.parse(inv.createdAt);
    const lastGood = createdAt + 60_000;
    await reconcile(store, [], cfg, lastGood);
    // The server was down past the expiry; the payment waits in the mempool.
    const back = Date.parse(inv.expiresAt) + 30 * 60_000;
    expect(await reconcile(store, [pay(idx, XMR, { hash: "gapped" })], cfg, back, { resumed: true })).toBe(1);
    expect(store.get(inv.id)!.seen.gapped).toBe(lastGood);
    expect(store.outbox.map((o) => o.event)).toEqual(["invoice.confirming"]);
    // The last sync time survives a restart.
    const fresh = new Store(cfg.dataDir);
    await fresh.load();
    expect(fresh.lastSyncAt).toBe(back);
    // Without a gap, a payment seen after the hold is late as before.
    const inv2 = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const t = Date.parse(inv2.expiresAt) + 30 * 60_000;
    await reconcile(store, [], cfg, t);
    await reconcile(store, [pay(idxOf(inv2.id), XMR, { hash: "notgapped" })], cfg, t + 15_000);
    expect(store.get(inv2.id)!.seen.notgapped).toBe(t + 15_000);
    expect(eventsOf(store).filter((e) => e.data.id === inv2.id).map((e) => e.type)).toEqual(["invoice.expired", "invoice.late"]);
  });

  it("shows real confirmations and pending for late payments", async () => {
    const inv = await (await create({ amount: "1", currency: "XMR", expiresInMinutes: 5 })).json();
    const idx = idxOf(inv.id);
    const later = Date.parse(inv.expiresAt) + 20 * 60_000;
    const late = pay(idx, XMR, { pending: false, confirmations: 4, timestamp: Math.floor(later / 1000) });
    expect(presentInvoice(store.get(inv.id)!, [late], cfg, { now: later + 1000 })).toMatchObject({ status: "late", confirmations: 4, pending: false });
    store.get(inv.id)!.seen.lp = later;
    expect(presentInvoice(store.get(inv.id)!, [pay(idx, XMR, { hash: "lp" })], cfg, { now: later + 1000 })).toMatchObject({ status: "late", confirmations: 0, pending: true });
  });

  it("signs webhooks verifiably and retries failures with backoff", async () => {
    const inv = await (await create({ amount: "0.1", currency: "XMR" })).json();
    await reconcile(store, [pay(store.get(inv.id)!.invoice.subaddressIndex, XMR / 10n, { pending: false, confirmations: 1 })], cfg);
    const sent: { headers: Headers; body: string }[] = [];
    let fail = true;
    const fakeFetch = (async (_url: string, init: RequestInit) => {
      sent.push({ headers: new Headers(init.headers), body: String(init.body) });
      return new Response("", { status: fail ? 500 : 200 });
    }) as unknown as typeof fetch;
    const now = Date.now();
    expect(await deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!, fakeFetch, now)).toBe(0);
    expect(store.outbox[0]).toMatchObject({ attempts: 1, nextAt: now + RETRY_DELAYS_MS[0]! });
    const sig = sent[0]!.headers.get("x-monkstash-signature")!;
    expect(verifySignature(cfg.webhookSecret!, sig, sent[0]!.body, Math.floor(now / 1000))).toBe(true);
    expect(verifySignature(cfg.webhookSecret!, sig, sent[0]!.body + " ", Math.floor(now / 1000))).toBe(false);
    expect(verifySignature("wrong-secret".repeat(4), sig, sent[0]!.body, Math.floor(now / 1000))).toBe(false);
    expect(verifySignature(cfg.webhookSecret!, sig, sent[0]!.body, Math.floor(now / 1000) + 600)).toBe(false);
    fail = false;
    expect(await deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!, fakeFetch, now + RETRY_DELAYS_MS[0]!)).toBe(1);
    expect(store.outbox).toHaveLength(0);
  });

  it("runs one delivery pass at a time", async () => {
    const inv = await (await create({ amount: "0.1", currency: "XMR" })).json();
    await reconcile(store, [pay(store.get(inv.id)!.invoice.subaddressIndex, XMR / 10n, { pending: false, confirmations: 1 })], cfg);
    let calls = 0;
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const slow = (async () => { calls++; await gate; return new Response("", { status: 200 }); }) as unknown as typeof fetch;
    const first = deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!, slow);
    expect(await deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!, slow)).toBe(0);
    release();
    expect(await first).toBe(1);
    expect(calls).toBe(1);
  });

  it("gives up after the last retry", async () => {
    const inv = await (await create({ amount: "0.1", currency: "XMR" })).json();
    await reconcile(store, [pay(store.get(inv.id)!.invoice.subaddressIndex, XMR / 10n, { pending: false, confirmations: 1 })], cfg);
    const failing = (async () => new Response("", { status: 503 })) as unknown as typeof fetch;
    let t = Date.now();
    let attempts = 0;
    for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
      attempts++;
      await deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!, failing, t);
      t += 24 * 3600_000;
    }
    expect(attempts).toBe(RETRY_DELAYS_MS.length + 1);
    expect(store.outbox).toHaveLength(0);
  });

  it("README states the real webhook retry schedule", async () => {
    const totalMin = RETRY_DELAYS_MS.reduce((a, b) => a + b, 0) / 60_000;
    const readme = await readFile(path.join(__dirname, "..", "README.md"), "utf8");
    expect(readme).toContain(`${Math.floor(totalMin / 60)} hours ${totalMin % 60} minutes`);
    expect(readme).toContain(`${RETRY_DELAYS_MS.length + 1} attempts`);
  });

  it("never reuses a subaddress, even with a wallet rebuilt from scratch", async () => {
    const first = await (await create({ amount: "0.3", currency: "XMR" })).json();
    const second = await (await create({ amount: "0.3", currency: "XMR" })).json();
    // A fresh wallet counts from 1 again; the new invoice must skip the stored indexes.
    const next = await createShopInvoice({ amount: "0.3", currency: "XMR" }, { cfg, store, watcher: fakeWatcher(), prices: fakePrices });
    const used = [first, second].map((i) => store.get(i.id)!.invoice.subaddressIndex);
    expect(next.invoice.subaddressIndex).toBeGreaterThan(Math.max(...used));
  });

  it("keeps invoices across a restart", async () => {
    const inv = await (await create({ amount: "0.3", currency: "XMR" })).json();
    const fresh = new Store(cfg.dataDir);
    await fresh.load();
    expect(fresh.get(inv.id)?.invoice.amount).toBe("300000000000");
    expect(JSON.parse(await readFile(path.join(cfg.dataDir, "invoices.json"), "utf8")).version).toBe(1);
  });

  it("falls back to invoices.json.bak when invoices.json is damaged", async () => {
    const first = await (await create({ amount: "0.3", currency: "XMR" })).json();
    await create({ amount: "0.4", currency: "XMR" });
    const file = path.join(cfg.dataDir, "invoices.json");
    expect(JSON.parse(await readFile(file + ".bak", "utf8")).invoices[first.id]).toBeTruthy();
    await writeFile(file, "{\"version\":1,\"invoi");
    const fresh = new Store(cfg.dataDir);
    await fresh.load();
    expect(fresh.get(first.id)?.invoice.amount).toBe("300000000000");
    // Saving after a fallback must not copy the damaged file over the good backup.
    await fresh.save();
    expect(JSON.parse(await readFile(file + ".bak", "utf8")).invoices[first.id]).toBeTruthy();
    expect(JSON.parse(await readFile(file, "utf8")).invoices[first.id]).toBeTruthy();
    // Both damaged: refuse to start rather than run with no invoices.
    await writeFile(file, "garbage");
    await writeFile(file + ".bak", "garbage");
    await expect(new Store(cfg.dataDir).load()).rejects.toThrow(/no usable backup/);
  });

  it("signs as HMAC-SHA256 over \"<timestamp>.<body>\"", async () => {
    const { createHmac } = await import("node:crypto");
    expect(sign("secret", 1700000000, "{}")).toBe(createHmac("sha256", "secret").update("1700000000.{}").digest("hex"));
  });
});

describe("exchange rates", () => {
  const NOW = Date.UTC(2026, 9, 15, 12);
  it("warns when the ECB table never loaded or is more than 3 days old", () => {
    expect(ecbWarning(null, NOW)).toMatch(/only USD/);
    expect(ecbWarning({ date: "2026-10-14" }, NOW)).toBeNull();
    // Friday's rates on a Monday evening are normal (no new rates at weekends).
    expect(ecbWarning({ date: "2026-10-09" }, Date.UTC(2026, 9, 12, 18))).toBeNull();
    expect(ecbWarning({ date: "2026-10-10" }, NOW)).toMatch(/2026-10-10, more than 3 days old/);
  });
  it("logs the warning once when the ECB cannot be reached", async () => {
    const logs: string[] = [];
    const fakeFetch = (async (url: string) => {
      if (url.includes("ecb.europa.eu")) throw new Error("offline");
      if (url.includes("kraken")) return Response.json({ error: [], result: { XMRUSD: { c: ["300.0", "1"] } } });
      if (url.includes("bitfinex")) return Response.json([0, 0, 0, 0, 0, 0, 300.5]);
      return new Response("", { status: 500 });
    }) as unknown as typeof fetch;
    const svc = createPriceService({ fetchImpl: fakeFetch, log: (m) => logs.push(m) });
    expect((await svc.quote("USD", NOW)).currency).toBe("USD");
    await expect(svc.quote("EUR", NOW + 120_000)).rejects.toThrow(/unavailable/);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(/ECB reference rates could not be loaded/);
  });
});
