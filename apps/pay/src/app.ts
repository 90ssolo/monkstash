/**
 * HTTP routes for MonkStash Pay.
 *
 *   POST /api/invoices        create an invoice (Authorization: Bearer <PAY_API_KEY>)
 *   GET  /api/invoices/:id    full invoice status, with your metadata (same key)
 *   GET  /api/health          sync height, wallet state and subaddress lookahead gap (same key)
 *   GET  /pay/:id             the checkout page your customer sees
 *   GET  /pay/:id/status      live status for the checkout page (public, no metadata)
 *   GET  /pay/:id/qr.svg      the payment QR code
 *   POST /api/links           create a payment link (same key)
 *   GET  /api/links           all payment links with their totals (same key)
 *   GET  /api/links/:id       one payment link (same key)
 *   PATCH /api/links/:id      switch a link off or on: {"active": false} (same key)
 *   GET  /l/:id               the payment link page: the payer picks or confirms the amount
 *   POST /l/:id               creates the payer's own invoice and redirects to its checkout page
 *   GET  /l/:id/qr.svg        QR code of the link, for print or a profile picture
 *   /admin/...                the shop's dashboard, signed in with the API key (see admin/routes.ts)
 *
 * Until the first successful sync after a start, invoice routes answer 503 with Retry-After:
 * the server cannot tell yet what has been paid. /api/health always answers.
 *
 * No customer data is logged. Responses carry strict security headers.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { timingSafeEqual, createHash } from "node:crypto";
import type { PayConfig } from "./config";
import { BadRequest, createShopInvoice, LOOKAHEAD_WARN_GAP, openInvoiceCount, presentInvoice, subaddressUsage, TooManyOpen } from "./invoices";
import { PriceUnavailable, UnsupportedCurrency, type PriceService } from "./prices";
import type { Store } from "./store";
import type { IncomingPayment, Watcher } from "./wallet";
import QRCode from "qrcode";
import { checkoutPage, linkPage, linkUnavailablePage, notFoundPage, syncingPage, CHECKOUT_CSS, CHECKOUT_JS } from "./checkout";
import { adminRoutes } from "./admin/routes";
import { ADMIN_CSS, ADMIN_JS } from "./admin/pages";
import { chosenAmount, createLink, linkAvailability, linkUrl, presentLink, updateLink } from "./links";

export interface AppState {
  /** Latest incoming payments, refreshed by the sync loop. */
  incoming: IncomingPayment[];
  height: number;
  /** Time of the last successful sync since this process started; null until the first one. */
  lastSyncAt: number | null;
  syncError: string | null;
}

export interface AppDeps {
  cfg: PayConfig;
  store: Store;
  watcher: Watcher;
  prices: PriceService;
  state: AppState;
}

const MAX_BODY = 16 * 1024;
const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "cross-origin-opener-policy": "same-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

/**
 * A small fixed-window rate limiter per client address. Memory only; nothing is logged. Expired
 * entries are swept at most once a minute, and the map never holds more than MAX_KEYS addresses
 * (the oldest are dropped first), so a flood from many addresses costs neither CPU nor memory.
 */
const MAX_KEYS = 20_000;
/** One IPv6 connection usually owns a whole /64, so limits count per /64; IPv4 per address. */
export function limitKey(ip: string): string {
  const v4 = /^(?:::ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (v4) return v4[1]!;
  if (!ip.includes(":")) return ip;
  const [head = "", tail = ""] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  return groups.slice(0, 4).map((g) => g.toLowerCase().replace(/^0+(?=.)/, "")).join(":") + "::/64";
}
function limiter(perMinute: number) {
  const hits = new Map<string, { n: number; reset: number }>();
  let nextSweep = 0;
  return (key: string, now = Date.now()): boolean => {
    if (now >= nextSweep) {
      nextSweep = now + 60_000;
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }
    while (hits.size >= MAX_KEYS) hits.delete(hits.keys().next().value!);
    const h = hits.get(key);
    if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + 60_000 }); return true; }
    h.n += 1;
    return h.n <= perMinute;
  };
}

function send(res: ServerResponse, status: number, body: string, type: string, extra: Record<string, string> = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, "content-type": type, "content-length": Buffer.byteLength(body), ...extra });
  res.end(body);
}
/** Link pages post a form to themselves, so they allow form-action 'self'. */
const LINK_PAGE_HEADERS = { "content-security-policy": SECURITY_HEADERS["content-security-policy"]!.replace("form-action 'none'", "form-action 'self'"), "cache-control": "no-store" };
const html = (res: ServerResponse, status: number, body: string, extra: Record<string, string> = {}) =>
  send(res, status, body, "text/html; charset=utf-8", { "cache-control": "no-store", ...extra });
const redirect = (res: ServerResponse, location: string) => {
  res.writeHead(303, { ...SECURITY_HEADERS, location, "cache-control": "no-store", "content-length": "0" });
  res.end();
};
const json = (res: ServerResponse, status: number, data: unknown) =>
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8", { "cache-control": "no-store" });
const syncing = (res: ServerResponse) =>
  send(res, 503, JSON.stringify({ error: SYNCING_MESSAGE }), "application/json; charset=utf-8", { "cache-control": "no-store", "retry-after": RETRY_AFTER_S });

export class TooLarge extends Error {}

export const SYNCING_MESSAGE = "The payment server is still syncing. Try again in a minute.";
const RETRY_AFTER_S = "60";

/** Reads a JSON body up to MAX_BODY. Larger bodies are drained (not stored) and answered with 413. */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size <= MAX_BODY) chunks.push(c);
    });
    req.on("end", () => (size > MAX_BODY ? reject(new TooLarge("Request body is too large (16 KB max).")) : resolve(Buffer.concat(chunks).toString("utf8"))));
    req.on("error", reject);
  });
}

/** Parses a JSON object body, or throws BadRequest. */
async function readJsonObject(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readBody(req);
  let input: unknown;
  try { input = JSON.parse(raw); } catch { throw new BadRequest("Body must be valid JSON."); }
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new BadRequest("Body must be a JSON object.");
  return input as Record<string, unknown>;
}

export function createApp(deps: AppDeps) {
  const { cfg, store, state } = deps;
  const publicLimit = limiter(120);
  const authFailLimit = limiter(10);
  // Shop plugins create invoices on behalf of anonymous visitors. Limit each caller (by the same
  // client address as the public routes), and separately cap how many unpaid invoices can be open
  // at once (PAY_MAX_OPEN_INVOICES), so a flood of fake checkouts cannot fill the disk or burn
  // through subaddresses.
  const createLimit = limiter(60);
  const keyHash = createHash("sha256").update(cfg.apiKey).digest();
  const admin = adminRoutes({ cfg, store, state, send, readBody, clientOf: (req) => clientOf(req), failLimit: (k) => authFailLimit(k) });
  // Anyone with a link can ask for an invoice, so each visitor gets far fewer than a shop plugin.
  const linkCreateLimit = limiter(6);
  // One invoice at a time per link, so a link limited to N payments never hands out N + 1.
  const linkLocks = new Map<string, Promise<unknown>>();
  const withLinkLock = <T>(id: string, fn: () => Promise<T>): Promise<T> => {
    const run = (linkLocks.get(id) ?? Promise.resolve()).catch(() => {}).then(fn);
    linkLocks.set(id, run);
    void run.finally(() => { if (linkLocks.get(id) === run) linkLocks.delete(id); }).catch(() => {});
    return run;
  };

  const authorized = (req: IncomingMessage): boolean => {
    const h = req.headers.authorization ?? "";
    const m = /^Bearer\s+(.+)$/.exec(h);
    if (!m) return false;
    // Compare hashes in constant time, so neither length nor content leaks through timing.
    return timingSafeEqual(createHash("sha256").update(m[1]!.trim()).digest(), keyHash);
  };
  // Per invoice too: a checkout page polls a few times a minute; far more means abuse.
  const invoiceLimit = limiter(240);
  const clientOf = (req: IncomingMessage) => {
    let ip = req.socket.remoteAddress ?? "unknown";
    if (cfg.trustProxy) {
      // The proxy appends the address it saw, so the last entry is the one we can trust.
      const fwd = String(req.headers["x-forwarded-for"] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      if (fwd.length) ip = fwd[fwd.length - 1]!.slice(0, 64);
    }
    return limitKey(ip);
  };

  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const p = url.pathname;
    const method = req.method ?? "GET";
    try {
      // ---- Static assets for the checkout page
      if (method === "GET" && p === "/assets/checkout.css") return send(res, 200, CHECKOUT_CSS, "text/css; charset=utf-8", { "cache-control": "public, max-age=3600" });
      if (method === "GET" && p === "/assets/checkout.js") return send(res, 200, CHECKOUT_JS, "text/javascript; charset=utf-8", { "cache-control": "public, max-age=3600" });
      if (method === "GET" && p === "/assets/admin.css") return send(res, 200, ADMIN_CSS, "text/css; charset=utf-8", { "cache-control": "public, max-age=3600" });
      if (method === "GET" && p === "/assets/admin.js") return send(res, 200, ADMIN_JS, "text/javascript; charset=utf-8", { "cache-control": "public, max-age=3600" });

      // ---- The shop's dashboard
      if (p === "/admin" || p.startsWith("/admin/")) {
        if (!publicLimit(clientOf(req))) return json(res, 429, { error: "Too many requests. Slow down." });
        return await admin(req, res, url);
      }

      // ---- Payment links (public)
      const lk = /^\/l\/([A-Za-z0-9_-]{16,64})(\/qr\.svg)?$/.exec(p);
      if (lk) {
        if (!publicLimit(clientOf(req))) return json(res, 429, { error: "Too many requests. Slow down." });
        const link = store.getLink(lk[1]!);
        if (!link) return lk[2] ? json(res, 404, { error: "Not found." }) : html(res, 404, notFoundPage());
        if (method === "GET" && lk[2]) {
          const svg = await QRCode.toString(linkUrl(cfg, link), { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121a17", light: "#ffffff" } });
          return send(res, 200, svg, "image/svg+xml", { "cache-control": "no-store" });
        }
        if (lk[2] || (method !== "GET" && method !== "POST")) return json(res, 405, { error: "Method not allowed." });
        if (method === "GET") {
          const avail = linkAvailability(store, link);
          if (!avail.ok) return avail.reason === "held" ? redirect(res, `/pay/${encodeURIComponent(avail.invoiceId)}`) : html(res, 410, linkUnavailablePage(avail.reason));
          return html(res, 200, linkPage(link, cfg), LINK_PAGE_HEADERS);
        }
        // POST: the payer asks for their own invoice.
        const raw = await readBody(req);
        const typed = new URLSearchParams(raw).get("amount") ?? undefined;
        const again = (status: number, error: string) => html(res, status, linkPage(link, cfg, { error, ...(typed ? { typed: typed.slice(0, 24) } : {}) }), LINK_PAGE_HEADERS);
        if (state.lastSyncAt === null) return html(res, 503, syncingPage(), { "retry-after": RETRY_AFTER_S });
        let amount: string;
        try { amount = chosenAmount(link, typed); } catch (err) {
          if (err instanceof BadRequest) return again(400, err.message);
          throw err;
        }
        // Counted only once the request is valid, so a payer who mistypes is not locked out.
        if (!linkCreateLimit(clientOf(req))) return again(429, "Too many payment requests from your connection. Wait a minute and try again.");
        type Out = { ok: true; invoiceId: string } | { ok: false; reason: "busy" } | Exclude<ReturnType<typeof linkAvailability>, { ok: true }>;
        const out: Out = await withLinkLock<Out>(link.id, async () => {
          const avail = linkAvailability(store, link);
          if (!avail.ok) return avail;
          const rec = await createShopInvoice({ amount, currency: link.currency, reference: link.title.slice(0, 64), returnUrl: link.returnUrl, metadata: link.metadata }, deps, { linkId: link.id });
          return { ok: true, invoiceId: rec.invoice.id };
        }).catch((err: unknown): Out => {
          if (err instanceof TooManyOpen || err instanceof PriceUnavailable) return { ok: false, reason: "busy" };
          throw err;
        });
        if (out.ok) return redirect(res, `/pay/${encodeURIComponent(out.invoiceId)}`);
        if (out.reason === "busy") return again(503, "Payments are busy right now. Try again in a few minutes.");
        if (out.reason === "held") return redirect(res, `/pay/${encodeURIComponent(out.invoiceId)}`);
        return html(res, 410, linkUnavailablePage(out.reason));
      }

      // ---- Public checkout
      const pay = /^\/pay\/([A-Za-z0-9_-]{16,64})(\/status|\/qr\.svg)?$/.exec(p);
      if (method === "GET" && pay) {
        if (!publicLimit(clientOf(req)) || !invoiceLimit(pay[1]!)) return json(res, 429, { error: "Too many requests. Slow down." });
        if (state.lastSyncAt === null) {
          return pay[2] === "/status" || pay[2] === "/qr.svg" ? syncing(res) : send(res, 503, syncingPage(), "text/html; charset=utf-8", { "cache-control": "no-store", "retry-after": RETRY_AFTER_S });
        }
        const rec = store.get(pay[1]!);
        if (!rec) return pay[2] ? json(res, 404, { error: "Not found." }) : send(res, 404, notFoundPage(), "text/html; charset=utf-8");
        const view = presentInvoice(rec, state.incoming, cfg, { syncedAt: state.lastSyncAt });
        if (pay[2] === "/qr.svg") {
          const svg = await QRCode.toString(view.paymentUri, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#121a17", light: "#ffffff" } });
          return send(res, 200, svg, "image/svg+xml", { "cache-control": "no-store" });
        }
        if (pay[2]) return json(res, 200, { status: view.status, expired: view.expired, pending: view.pending, received: view.received, remaining: view.remaining, overpaid: view.overpaid, confirmations: view.confirmations, requiredConfirmations: view.requiredConfirmations, paymentUri: view.paymentUri, monkstashUrl: view.monkstashUrl, expiresAt: view.expiresAt });
        return send(res, 200, checkoutPage(view, cfg), "text/html; charset=utf-8", { "cache-control": "no-store" });
      }

      // ---- Shop API
      if (p.startsWith("/api/")) {
        if (!authorized(req)) {
          if (!authFailLimit(clientOf(req))) return json(res, 429, { error: "Too many failed attempts. Wait a minute." });
          return json(res, 401, { error: "Missing or wrong API key." }, );
        }
        if (method === "GET" && p === "/api/health") {
          const subaddresses = subaddressUsage(store, cfg.account);
          return json(res, 200, {
            // Not ok until the first sync has finished: before that, no payment can be seen.
            ok: !state.syncError && state.lastSyncAt !== null, network: cfg.network, height: state.height,
            lastSyncAt: state.lastSyncAt ? new Date(state.lastSyncAt).toISOString() : null,
            syncError: state.syncError, pendingWebhooks: store.outbox.length,
            openInvoices: openInvoiceCount(store), maxOpenInvoices: cfg.maxOpenInvoices,
            subaddresses: { ...subaddresses, warnAbove: LOOKAHEAD_WARN_GAP, lookaheadWarning: subaddresses.gap > LOOKAHEAD_WARN_GAP },
          });
        }
        if (method === "POST" && p === "/api/invoices") {
          if (!(req.headers["content-type"] ?? "").includes("application/json")) return json(res, 415, { error: "Send JSON with Content-Type: application/json." });
          if (state.lastSyncAt === null) return syncing(res);
          if (!createLimit(clientOf(req))) return json(res, 429, { error: "Too many new invoices from this client this minute. Try again shortly." });
          const rec = await createShopInvoice(await readJsonObject(req), deps);
          return json(res, 201, presentInvoice(rec, state.incoming, cfg, { withMetadata: true, syncedAt: state.lastSyncAt }));
        }
        const one = /^\/api\/invoices\/([A-Za-z0-9_-]{16,64})$/.exec(p);
        if (method === "GET" && one) {
          if (state.lastSyncAt === null) return syncing(res);
          const rec = store.get(one[1]!);
          if (!rec) return json(res, 404, { error: "No invoice with that id." });
          return json(res, 200, presentInvoice(rec, state.incoming, cfg, { withMetadata: true, syncedAt: state.lastSyncAt }));
        }
        if (p === "/api/links") {
          if (method === "GET") {
            const links = store.allLinks().sort((a, b) => b.createdAt - a.createdAt).map((l) => presentLink(cfg, store, l, state.incoming));
            return json(res, 200, { links });
          }
          if (method === "POST") {
            if (!(req.headers["content-type"] ?? "").includes("application/json")) return json(res, 415, { error: "Send JSON with Content-Type: application/json." });
            const link = createLink(await readJsonObject(req), cfg);
            await store.putLink(link);
            return json(res, 201, presentLink(cfg, store, link, state.incoming));
          }
          return json(res, 405, { error: "Method not allowed." });
        }
        const oneLink = /^\/api\/links\/([A-Za-z0-9_-]{16,64})$/.exec(p);
        if (oneLink) {
          const link = store.getLink(oneLink[1]!);
          if (!link) return json(res, 404, { error: "No payment link with that id." });
          if (method === "GET") return json(res, 200, presentLink(cfg, store, link, state.incoming));
          if (method === "PATCH") {
            if (!(req.headers["content-type"] ?? "").includes("application/json")) return json(res, 415, { error: "Send JSON with Content-Type: application/json." });
            const next = updateLink(link, await readJsonObject(req));
            await store.putLink(next);
            return json(res, 200, presentLink(cfg, store, next, state.incoming));
          }
          return json(res, 405, { error: "Method not allowed." });
        }
        return json(res, 404, { error: "Unknown API route." });
      }

      if (method === "GET" && p === "/") return send(res, 200, "MonkStash Pay is running.\n", "text/plain; charset=utf-8");
      return json(res, 404, { error: "Not found." });
    } catch (err) {
      if (err instanceof BadRequest) return json(res, 400, { error: err.message });
      if (err instanceof TooLarge) return json(res, 413, { error: err.message });
      if (err instanceof UnsupportedCurrency) return json(res, 400, { error: err.message });
      if (err instanceof PriceUnavailable) return json(res, 503, { error: err.message });
      if (err instanceof TooManyOpen) return json(res, 503, { error: err.message });
      console.error("[pay] request failed:", (err as Error).message);
      return json(res, 500, { error: "Something went wrong on the payment server." });
    }
  };
}
