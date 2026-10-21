/**
 * Routes for the shop's dashboard under /admin. Every page needs a session (see auth.ts); every
 * post needs the form token and must come from this server's own pages.
 *
 *   GET  /admin                  overview: sales totals, server health, latest invoices
 *   GET  /admin/invoices         all invoices (?q=, ?status=, ?page=)
 *   GET  /admin/invoices/:id     one invoice; POST .../review marks a problem as dealt with
 *   GET  /admin/review           invoices with a problem nobody has dealt with yet
 *   GET  /admin/links            payment links; POST creates one, POST .../off and .../on
 *   GET  /admin/export           the sales export form; GET /admin/export.csv downloads it
 *   POST /admin/login, /admin/logout
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { PayConfig } from "../config";
import { BadRequest, LOOKAHEAD_WARN_GAP, openInvoiceCount, subaddressUsage } from "../invoices";
import { createLink, presentLink } from "../links";
import type { Store } from "../store";
import type { IncomingPayment } from "../wallet";
import { adminAuth, clearedCookie, sameOrigin, sessionCookie } from "./auth";
import { allRows, filterRows, needsReview, rowFor, salesCsv, totals } from "./data";
import { exportPage, invoicePage, invoicesPage, layout, linksPage, loginPage, overviewPage, type Health } from "./pages";

const PAGE_SIZE = 50;

export interface AdminDeps {
  cfg: PayConfig;
  store: Store;
  state: { incoming: IncomingPayment[]; height: number; lastSyncAt: number | null; syncError: string | null };
  /** Shared helpers from the main app, so headers and limits stay in one place. */
  send(res: ServerResponse, status: number, body: string, type: string, extra?: Record<string, string>): void;
  readBody(req: IncomingMessage): Promise<string>;
  clientOf(req: IncomingMessage): string;
  /** Failed sign-ins per client address. */
  failLimit(key: string): boolean;
}

/**
 * Dashboard pages post forms to themselves and load one script and one stylesheet. They send
 * their origin to themselves only (same-origin): with no-referrer, browsers post "Origin: null",
 * which the cross-site check must refuse.
 */
const ADMIN_HEADERS = {
  "referrer-policy": "same-origin",
  "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "cache-control": "no-store",
};

const dateMs = (s: string | null, endOfDay = false): number | undefined => {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const t = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(t) ? t + (endOfDay ? 24 * 60 * 60 * 1000 : 0) : undefined;
};

export function adminRoutes(deps: AdminDeps) {
  const { cfg, store, state } = deps;
  const auth = adminAuth(cfg.apiKey);
  const secure = cfg.publicUrl.startsWith("https://");

  const html = (res: ServerResponse, status: number, body: string, extra: Record<string, string> = {}) =>
    deps.send(res, status, body, "text/html; charset=utf-8", { ...ADMIN_HEADERS, ...extra });
  const redirect = (res: ServerResponse, to: string, extra: Record<string, string> = {}) => {
    res.writeHead(303, { location: to, "cache-control": "no-store", "content-length": "0", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", ...extra });
    res.end();
  };
  const ctx = () => ({ cfg, store, incoming: state.incoming, syncedAt: state.lastSyncAt });
  const notFound = (res: ServerResponse, token: string) =>
    html(res, 404, layout(cfg, "Not found", `<h1>Not found</h1><p class="muted">That page or invoice does not exist on this server.</p><p><a href="/admin">Back to the overview</a></p>`, { token }));
  const reviewCount = () => allRows(ctx()).filter(needsReview).length;
  const health = (): Health => {
    const sub = subaddressUsage(store, cfg.account);
    return {
      ok: !state.syncError && state.lastSyncAt !== null, height: state.height, lastSyncAt: state.lastSyncAt, syncError: state.syncError,
      pendingWebhooks: store.outbox.length, openInvoices: openInvoiceCount(store), maxOpenInvoices: cfg.maxOpenInvoices,
      lookaheadWarning: sub.gap > LOOKAHEAD_WARN_GAP, gap: sub.gap,
    };
  };

  return async function handleAdmin(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
    const p = url.pathname.replace(/\/+$/, "") || "/admin";
    const method = req.method ?? "GET";

    if (p === "/admin/login") {
      if (method === "GET") return redirect(res, "/admin");
      if (method !== "POST") return html(res, 405, loginPage(cfg));
      if (!sameOrigin(req, cfg.publicUrl)) return html(res, 403, loginPage(cfg, "This sign-in did not come from this page. Open the dashboard address directly."));
      const key = new URLSearchParams(await deps.readBody(req)).get("key") ?? "";
      if (!deps.failLimit(deps.clientOf(req))) return html(res, 429, loginPage(cfg, "Too many attempts. Wait a minute."));
      if (!auth.checkKey(key)) return html(res, 401, loginPage(cfg, "That is not this server's API key."));
      const s = auth.newSession();
      return redirect(res, "/admin", { "set-cookie": sessionCookie(s.value, s.expires, secure) });
    }

    const session = auth.session(req);
    if (!session) {
      if (method === "GET" && !p.endsWith(".csv")) return html(res, 200, loginPage(cfg));
      return html(res, 401, loginPage(cfg, "Your session ended. Sign in again."));
    }
    const token = auth.formToken(session);

    if (method === "POST") {
      const raw = await deps.readBody(req);
      const form = new URLSearchParams(raw);
      if (!sameOrigin(req, cfg.publicUrl) || !auth.checkFormToken(session, form.get("token"))) {
        return html(res, 403, loginPage(cfg, "That form has expired or did not come from this dashboard. Reload the page and try again."));
      }
      if (p === "/admin/logout") return redirect(res, "/admin", { "set-cookie": clearedCookie(secure) });

      const rv = /^\/admin\/invoices\/([A-Za-z0-9_-]{16,64})\/review$/.exec(p);
      if (rv) {
        const rec = store.get(rv[1]!);
        if (!rec) return notFound(res, token);
        const note = (form.get("note") ?? "").trim().slice(0, 200);
        if (form.get("action") === "reopen") delete rec.review;
        else rec.review = { resolvedAt: Date.now(), ...(note ? { note } : {}) };
        await store.put(rec);
        return redirect(res, `/admin/invoices/${encodeURIComponent(rec.invoice.id)}`);
      }

      if (p === "/admin/links") {
        const input: Record<string, unknown> = {};
        for (const k of ["title", "description", "currency", "amount", "minAmount"] as const) {
          const v = (form.get(k) ?? "").trim();
          if (v) input[k] = k === "amount" || k === "minAmount" ? v.replace(",", ".") : v;
        }
        const sug = (form.get("suggested") ?? "").split(/[\s;,]+/).map((x) => x.trim()).filter(Boolean);
        if (sug.length) input.suggested = sug;
        const max = (form.get("maxPayments") ?? "").trim();
        if (max) input.maxPayments = /^\d+$/.test(max) ? Number(max) : max;
        const exp = dateMs(form.get("expires"), true);
        if (exp) input.expiresAt = new Date(exp - 1000).toISOString();
        const links = () => store.allLinks().sort((a, b) => b.createdAt - a.createdAt).map((l) => presentLink(cfg, store, l, state.incoming));
        try {
          const link = createLink(input, cfg);
          await store.putLink(link);
          // Redirect after a post, so reloading the page does not create the link twice.
          return redirect(res, `/admin/links?created=${encodeURIComponent(link.id)}#link-${encodeURIComponent(link.id)}`);
        } catch (err) {
          if (err instanceof BadRequest) return html(res, 400, linksPage(cfg, token, links(), reviewCount(), { error: err.message }));
          throw err;
        }
      }

      const sw = /^\/admin\/links\/([A-Za-z0-9_-]{16,64})\/(on|off)$/.exec(p);
      if (sw) {
        const link = store.getLink(sw[1]!);
        if (link) await store.putLink({ ...link, active: sw[2] === "on" });
        return redirect(res, `/admin/links#link-${encodeURIComponent(sw[1]!)}`);
      }
      return notFound(res, token);
    }

    if (method !== "GET") return html(res, 405, loginPage(cfg));

    if (p === "/admin") {
      const rows = allRows(ctx());
      return html(res, 200, overviewPage(cfg, token, totals(rows), health(), rows.slice(0, 10), rows.filter(needsReview).length));
    }

    if (p === "/admin/invoices" || p === "/admin/review") {
      const review = p === "/admin/review";
      const status = url.searchParams.get("status") || undefined;
      const q = url.searchParams.get("q")?.slice(0, 100) || undefined;
      const all = allRows(ctx());
      const rows = filterRows(all, review ? { review: true } : { ...(status ? { status } : {}), ...(q ? { q } : {}) });
      const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
      const page = Math.min(pages, Math.max(1, Number(url.searchParams.get("page")) || 1));
      return html(res, 200, invoicesPage(cfg, token, rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), { ...(status ? { status } : {}), ...(q ? { q } : {}), page, pages, total: rows.length }, all.filter(needsReview).length, review));
    }

    const one = /^\/admin\/invoices\/([A-Za-z0-9_-]{16,64})$/.exec(p);
    if (one) {
      const rec = store.get(one[1]!);
      if (!rec) return notFound(res, token);
      return html(res, 200, invoicePage(cfg, token, rowFor(ctx(), rec), reviewCount()));
    }

    if (p === "/admin/links") {
      const links = store.allLinks().sort((a, b) => b.createdAt - a.createdAt).map((l) => presentLink(cfg, store, l, state.incoming));
      const created = store.getLink(url.searchParams.get("created") ?? "");
      return html(res, 200, linksPage(cfg, token, links, reviewCount(), created ? { created: created.title } : {}));
    }

    if (p === "/admin/export") return html(res, 200, exportPage(cfg, token, reviewCount()));

    if (p === "/admin/export.csv") {
      const from = dateMs(url.searchParams.get("from"));
      const to = dateMs(url.searchParams.get("to"), true);
      const name = `monkstash-sales-${url.searchParams.get("from") ?? "all"}-to-${url.searchParams.get("to") ?? "now"}.csv`.replace(/[^A-Za-z0-9._-]/g, "");
      return deps.send(res, 200, salesCsv(allRows(ctx()), from, to), "text/csv; charset=utf-8", { "cache-control": "no-store", "content-disposition": `attachment; filename="${name}"` });
    }

    return notFound(res, token);
  };
}
