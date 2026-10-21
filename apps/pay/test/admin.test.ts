import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadConfig, type PayConfig } from "../src/config";
import { createApp, type AppState } from "../src/app";
import { adminAuth, parseCookies } from "../src/admin/auth";
import { allRows, CSV_COLUMNS, salesCsv, totals } from "../src/admin/data";
import { Store } from "../src/store";
import type { IncomingPayment, Watcher } from "../src/wallet";
import type { PriceService } from "../src/prices";

// Published stagenet test address (from the wallet-core test vectors); the view key is a dummy.
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";
const KEY = "k".repeat(40);

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
interface App { url: string; store: Store; cfg: PayConfig; state: AppState; cookie: string }

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
  return { url: `http://127.0.0.1:${typeof a === "object" && a ? a.port : 0}`, store, cfg, state, cookie: "" };
}

const form = (data: Record<string, string>) => new URLSearchParams(data).toString();

async function login(app: App, key = KEY) {
  const res = await fetch(`${app.url}/admin/login`, { method: "POST", redirect: "manual", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form({ key }) });
  const set = res.headers.get("set-cookie") ?? "";
  if (res.status === 303) app.cookie = set.split(";")[0]!;
  return { res, set };
}

const get = (app: App, p: string, init: RequestInit = {}) => fetch(app.url + p, { redirect: "manual", ...init, headers: { cookie: app.cookie, ...(init.headers ?? {}) } });
const tokenOf = (html: string) => /name="token" value="([^"]+)"/.exec(html)?.[1] ?? "";
const post = (app: App, p: string, data: Record<string, string>, headers: Record<string, string> = {}) =>
  fetch(app.url + p, { method: "POST", redirect: "manual", headers: { cookie: app.cookie, "content-type": "application/x-www-form-urlencoded", ...headers }, body: form(data) });

async function newInvoice(app: App, body: Record<string, unknown>) {
  const res = await fetch(`${app.url}/api/invoices`, { method: "POST", headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" }, body: JSON.stringify(body) });
  expect(res.status).toBe(201);
  return ((await res.json()) as { id: string }).id;
}

/** Puts a confirmed payment of `atomic` on the invoice's address, as the sync loop would see it. */
function pay(app: App, invoiceId: string, atomic: bigint, at = Date.now()) {
  const rec = app.store.get(invoiceId)!;
  // Pay ignores money seen before its invoice existed: date the invoice just before the payment.
  if (at < rec.invoice.createdAt) {
    rec.invoice.createdAt = at - 60_000;
    if (rec.invoice.expiresAt !== undefined) rec.invoice.expiresAt = at + 29 * 60_000;
  }
  const hash = (invoiceId + "0".repeat(64)).slice(0, 64).replace(/[^0-9a-f]/gi, "a").toLowerCase();
  rec.seen[hash] = at;
  const p: IncomingPayment = { accountIndex: rec.account ?? 0, subaddressIndex: rec.invoice.subaddressIndex, amount: atomic, confirmations: 20, pending: false, hash, timestamp: Math.floor(at / 1000) };
  app.state.incoming.push(p);
  return hash;
}

beforeAll(async () => { dir = await mkdtemp(path.join(tmpdir(), "monkstash-admin-")); });
afterAll(async () => {
  await Promise.all(servers.map((s) => new Promise<void>((r) => s.close(() => r()))));
  await rm(dir, { recursive: true, force: true });
});

describe("dashboard sign-in", () => {
  let app: App;
  beforeEach(async () => { app = await startApp(); });

  it("shows the sign-in page without a session, never the data", async () => {
    await newInvoice(app, { amount: "10", reference: "secret-order" });
    const res = await get(app, "/admin");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sign in");
    expect(body).not.toContain("secret-order");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect((await get(app, "/admin/export.csv")).status).toBe(401);
  });

  it("refuses a wrong key and signs in with the right one", async () => {
    expect((await login(app, "wrong".repeat(10))).res.status).toBe(401);
    const { res, set } = await login(app);
    expect(res.status).toBe(303);
    expect(set).toMatch(/HttpOnly/);
    expect(set).toMatch(/SameSite=Strict/);
    expect(set).toMatch(/Path=\/admin/);
    expect(set).toMatch(/Secure/);
    const page = await get(app, "/admin");
    expect(await page.text()).toContain("Overview");
    expect(page.headers.get("referrer-policy")).toBe("same-origin");
    expect(page.headers.get("content-security-policy")).toContain("form-action 'self'");
  });

  it("rejects a tampered or expired session", async () => {
    await login(app);
    const [name, value] = app.cookie.split("=");
    const parts = value!.split(".");
    app.cookie = `${name}=${String(Number(parts[0]) + 1000)}.${parts[1]}.${parts[2]}`;
    expect(await (await get(app, "/admin")).text()).toContain("Sign in");
    const auth = adminAuth(KEY);
    const old = auth.newSession(Date.now() - 13 * 60 * 60 * 1000);
    expect(auth.session({ headers: { cookie: `monkstash_admin=${old.value}` } } as never)).toBeNull();
    // A session made with another API key is not valid here.
    const other = adminAuth("x".repeat(40)).newSession();
    expect(auth.session({ headers: { cookie: `monkstash_admin=${other.value}` } } as never)).toBeNull();
  });

  it("limits sign-in attempts", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 11; i++) codes.push((await login(app, "nope".repeat(10))).res.status);
    expect(codes.at(-1)).toBe(429);
  });

  it("refuses posts from other sites or without the form token", async () => {
    await login(app);
    const token = tokenOf(await (await get(app, "/admin")).text());
    expect(token).toBeTruthy();
    expect((await post(app, "/admin/links", { token, title: "x", amount: "1" }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await post(app, "/admin/links", { token, title: "x", amount: "1" }, { origin: "null" })).status).toBe(403);
    expect((await post(app, "/admin/links", { title: "x", amount: "1" })).status).toBe(403);
    expect((await post(app, "/admin/links", { token: "forged", title: "x", amount: "1" })).status).toBe(403);
    expect(app.store.allLinks()).toHaveLength(0);
    // The dashboard's own page, as a browser sends it.
    expect((await post(app, "/admin/links", { token, title: "x", amount: "1" }, { origin: "https://pay.shop.example" })).status).toBe(303);
    expect(app.store.allLinks()).toHaveLength(1);
  });

  it("signs out", async () => {
    await login(app);
    const token = tokenOf(await (await get(app, "/admin")).text());
    const res = await post(app, "/admin/logout", { token });
    expect(res.status).toBe(303);
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/);
  });
});

describe("dashboard pages", () => {
  let app: App;
  beforeEach(async () => { app = await startApp(); await login(app); });

  it("lists invoices, searches them and escapes shop data", async () => {
    await newInvoice(app, { amount: "10", reference: "<b>order-1</b>" });
    await newInvoice(app, { amount: "20", reference: "order-2" });
    const all = await (await get(app, "/admin/invoices")).text();
    expect(all).toContain("&lt;b&gt;order-1&lt;/b&gt;");
    expect(all).not.toContain("<b>order-1</b>");
    const found = await (await get(app, "/admin/invoices?q=order-2")).text();
    expect(found).toContain("order-2");
    expect(found).not.toContain("order-1");
    const paidOnly = await (await get(app, "/admin/invoices?status=paid")).text();
    expect(paidOnly).toContain("No invoices match.");
  });

  it("flags a part-paid invoice for review and records how it was dealt with", async () => {
    const id = await newInvoice(app, { amount: "10", reference: "short" });
    pay(app, id, 10_000_000_000n, Date.now() - 20 * 60_000); // 0.01 of 0.04 XMR, on time
    app.store.get(id)!.invoice.expiresAt = Date.now() - 10 * 60_000; // then the price hold ended
    const overview = await (await get(app, "/admin")).text();
    expect(overview).toContain("1 invoice(s) need your attention");
    expect(await (await get(app, "/admin/review")).text()).toContain("short");
    const detail = await (await get(app, `/admin/invoices/${id}`)).text();
    expect(detail).toContain("Part paid: the price hold ended");
    const res = await post(app, `/admin/invoices/${id}/review`, { token: tokenOf(detail), action: "resolve", note: "Refunded 0.01 XMR" });
    expect(res.status).toBe(303);
    expect(app.store.get(id)!.review?.note).toBe("Refunded 0.01 XMR");
    expect(await (await get(app, "/admin/review")).text()).toContain("Nothing needs your attention.");
    const csv = await (await get(app, "/admin/export.csv")).text();
    expect(csv).toContain("Refunded 0.01 XMR");
    await post(app, `/admin/invoices/${id}/review`, { token: tokenOf(detail), action: "reopen" });
    expect(app.store.get(id)!.review).toBeUndefined();
  });

  it("creates payment links from a form and switches them off", async () => {
    const page = await (await get(app, "/admin/links")).text();
    const token = tokenOf(page);
    const bad = await post(app, "/admin/links", { token, title: "" });
    expect(bad.status).toBe(400);
    expect(await bad.text()).toContain("title is required");
    const ok = await post(app, "/admin/links", { token, title: "Tips", currency: "eur", minAmount: "1,50", suggested: "2, 5 10", expires: "2099-12-31" });
    expect(ok.status).toBe(303);
    const link = app.store.allLinks()[0]!;
    expect(link.minAmount).toBe("1.50");
    expect(link.suggested).toEqual(["2", "5", "10"]);
    expect(new Date(link.expiresAt!).toISOString()).toBe("2099-12-31T23:59:59.000Z");
    const shown = await (await get(app, ok.headers.get("location")!.split("#")[0]!)).text();
    expect(shown).toContain("Link created: Tips");
    expect(shown).toContain(`/l/${link.id}`);
    await post(app, `/admin/links/${link.id}/off`, { token });
    expect(app.store.getLink(link.id)!.active).toBe(false);
  });

  it("answers 404 inside the dashboard for unknown pages and invoices", async () => {
    expect((await get(app, "/admin/nothing")).status).toBe(404);
    expect((await get(app, "/admin/invoices/AAAAAAAAAAAAAAAAAAAAAA")).status).toBe(404);
  });

  it("downloads a sales export limited to a period", async () => {
    const a = await newInvoice(app, { amount: "10", reference: "=HYPERLINK(\"x\")" });
    pay(app, a, 40_000_000_000n, Date.parse("2026-03-10T12:00:00Z"));
    const b = await newInvoice(app, { amount: "20", reference: "later" });
    pay(app, b, 80_000_000_000n, Date.parse("2026-04-02T12:00:00Z"));
    await newInvoice(app, { amount: "30", reference: "unpaid" });
    const res = await get(app, "/admin/export.csv?from=2026-03-01&to=2026-03-31");
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("monkstash-sales-2026-03-01-to-2026-03-31.csv");
    const lines = (await res.text()).trim().split("\r\n");
    expect(lines[0]).toBe(CSV_COLUMNS.join(","));
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("2026-03-10T12:00:00.000Z");
    expect(lines[1]).toContain("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(lines[1]).toContain(",10,EUR,250,");
    expect(lines[1]).toContain(",10.00,"); // 0.04 XMR at 250 EUR
    const everything = (await (await get(app, "/admin/export.csv")).text()).trim().split("\r\n");
    expect(everything).toHaveLength(3);
  });
});

describe("dashboard totals", () => {
  it("adds up paid invoices per window and per currency", async () => {
    const app = await startApp();
    const now = Date.now();
    const a = await newInvoice(app, { amount: "10" });
    pay(app, a, 40_000_000_000n, now - 60_000);
    const b = await newInvoice(app, { amount: "12.50" });
    pay(app, b, 50_000_000_000n, now - 3 * 24 * 60 * 60 * 1000);
    const rows = allRows({ cfg: app.cfg, store: app.store, incoming: app.state.incoming, syncedAt: now });
    const t = totals(rows, now);
    expect(t[1]).toMatchObject({ label: "Last 7 days", paid: 2, xmr: "0.09", fiat: [{ currency: "EUR", amount: "22.50" }] });
    expect(t[0]!.paid).toBeLessThanOrEqual(1);
    expect(salesCsv(rows).trim().split("\r\n")).toHaveLength(3);
  });

  it("parses cookies defensively", () => {
    expect(parseCookies("a=1; b=2; a=3")).toEqual({ a: "1", b: "2" });
    expect(parseCookies(undefined)).toEqual({});
  });
});
