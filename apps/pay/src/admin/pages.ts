/**
 * The shop's dashboard pages: plain HTML rendered on the server, one stylesheet, one tiny script
 * for copy buttons. Every form posts back to this server with a token. Nothing is loaded from
 * anywhere else.
 */
import { createHash } from "node:crypto";
import type { PayConfig } from "../config";
import { esc } from "../checkout";
import type { presentLink } from "../links";
import { ISSUE_TEXT, needsReview, type Row, type Totals } from "./data";

type LinkView = ReturnType<typeof presentLink>;

export interface Health {
  ok: boolean;
  height: number;
  lastSyncAt: number | null;
  syncError: string | null;
  pendingWebhooks: number;
  openInvoices: number;
  maxOpenInvoices: number;
  lookaheadWarning: boolean;
  gap: number;
}

const STATUS_LABEL: Record<string, string> = {
  waiting: "Waiting", confirming: "Confirming", paid: "Paid", partial: "Part paid", expired: "Expired", late: "Late",
};

const when = (ms: number | string | null | undefined) => {
  if (ms === null || ms === undefined) return "";
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
};

const price = (r: Row) => (r.view.amount.fiat ? `${r.view.amount.fiat.amount} ${r.view.amount.fiat.currency}` : `${r.view.amount.xmr} XMR`);

const badge = (status: string) => `<span class="badge s-${esc(status)}">${esc(STATUS_LABEL[status] ?? status)}</span>`;

export function layout(cfg: PayConfig, title: string, body: string, opts: { token?: string; nav?: string; reviewCount?: number } = {}): string {
  const testNet = cfg.network !== "mainnet";
  const nav = opts.token === undefined ? "" : `
<header class="top">
  <div class="brand"><strong>${esc(cfg.shopName ?? "MonkStash Pay")}</strong><span>Dashboard</span></div>
  <nav aria-label="Dashboard">
    ${[["overview", "/admin", "Overview"], ["invoices", "/admin/invoices", "Invoices"], ["review", "/admin/review", `Needs review${opts.reviewCount ? ` <b class="count">${opts.reviewCount}</b>` : ""}`], ["links", "/admin/links", "Payment links"], ["export", "/admin/export", "Export"]]
      .map(([k, href, label]) => `<a href="${href}"${opts.nav === k ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
  </nav>
  <form method="post" action="/admin/logout" class="logout"><input type="hidden" name="token" value="${esc(opts.token)}"><button class="btn small" type="submit">Sign out</button></form>
</header>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="same-origin">
<title>${esc(title)} | ${esc(cfg.shopName ?? "MonkStash Pay")}</title>
<link rel="stylesheet" href="/assets/admin.css?v=${ASSET_VERSION}">
</head>
<body>
${nav}
<main class="main">
${testNet ? `<p class="note warn">Test network (${esc(cfg.network)}): practice coins only.</p>` : ""}
${body}
</main>
<script src="/assets/admin.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

export function loginPage(cfg: PayConfig, error?: string): string {
  return layout(cfg, "Sign in", `
<section class="card narrow">
  <h1>Sign in</h1>
  <p class="muted">Use your MonkStash Pay API key. On MonkStash Server, <code>sudo monkstash-server pay-info</code> shows it.</p>
  ${error ? `<p class="note bad" role="alert">${esc(error)}</p>` : ""}
  <form method="post" action="/admin/login" class="stack">
    <label for="key">API key</label>
    <input id="key" name="key" type="password" autocomplete="current-password" required autofocus>
    <button class="btn primary" type="submit">Sign in</button>
  </form>
  <p class="hint">Sessions last 12 hours. Changing the API key signs everyone out.</p>
</section>`);
}

function healthBlock(h: Health): string {
  const items: string[] = [];
  items.push(h.ok ? `<li class="ok">Synced${h.lastSyncAt ? ` at ${esc(when(h.lastSyncAt))}` : ""}, block ${h.height}</li>` : `<li class="bad">Not synced${h.syncError ? `: ${esc(h.syncError)}` : " yet"}. Statuses are as of the last successful sync.</li>`);
  if (h.pendingWebhooks) items.push(`<li class="bad">${h.pendingWebhooks} webhook(s) waiting to reach your shop. Check that it is online.</li>`);
  if (h.openInvoices >= h.maxOpenInvoices * 0.8) items.push(`<li class="bad">${h.openInvoices} of ${h.maxOpenInvoices} unpaid invoices open: close to the limit.</li>`);
  if (h.lookaheadWarning) items.push(`<li class="bad">${h.gap} unpaid addresses in a row. A copy of this wallet restored elsewhere may not find later payments; see the README on restoring.</li>`);
  return `<ul class="health">${items.join("")}</ul>`;
}

function rowsTable(rows: Row[], empty: string): string {
  if (!rows.length) return `<p class="muted">${esc(empty)}</p>`;
  return `<div class="table-wrap"><table>
<thead><tr><th scope="col">Created</th><th scope="col">Order</th><th scope="col">Price</th><th scope="col">Received</th><th scope="col">Status</th></tr></thead>
<tbody>${rows.map((r) => `<tr${needsReview(r) ? ' class="flag"' : ""}>
<td data-label="Created">${esc(when(r.view.createdAt))}</td>
<td data-label="Order"><a href="/admin/invoices/${esc(encodeURIComponent(r.view.id))}">${esc(r.view.reference ?? r.linkTitle ?? r.view.id.slice(0, 10))}</a>${r.linkTitle && r.view.reference !== r.linkTitle ? `<span class="sub">via ${esc(r.linkTitle)}</span>` : ""}</td>
<td data-label="Price">${esc(price(r))}</td>
<td data-label="Received" class="num">${esc(r.view.received)} XMR</td>
<td data-label="Status">${badge(r.view.status)}${needsReview(r) ? ' <span class="badge s-flag">Review</span>' : ""}</td>
</tr>`).join("")}</tbody></table></div>`;
}

export function overviewPage(cfg: PayConfig, token: string, t: Totals[], h: Health, recent: Row[], reviewCount: number): string {
  return layout(cfg, "Overview", `
<h1>Overview</h1>
${reviewCount ? `<p class="note bad"><a href="/admin/review">${reviewCount} invoice(s) need your attention.</a></p>` : ""}
<section class="totals" aria-label="Sales">
${t.map((x) => `<div class="card total"><h2>${esc(x.label)}</h2><p class="big">${x.paid} paid</p><p>${esc(x.xmr)} XMR</p>${x.fiat.map((f) => `<p class="muted">${esc(f.amount)} ${esc(f.currency)}</p>`).join("")}</div>`).join("")}
</section>
<section class="card"><h2>Server</h2>${healthBlock(h)}</section>
<section class="card"><h2>Latest invoices</h2>${rowsTable(recent, "No invoices yet. They appear here as soon as your shop or a payment link creates one.")}<p><a href="/admin/invoices">All invoices</a></p></section>
`, { token, nav: "overview", reviewCount });
}

export function invoicesPage(cfg: PayConfig, token: string, rows: Row[], f: { status?: string; q?: string; page: number; pages: number; total: number }, reviewCount: number, review = false): string {
  const qs = (page: number) => `?${new URLSearchParams({ ...(f.status ? { status: f.status } : {}), ...(f.q ? { q: f.q } : {}), page: String(page) }).toString()}`;
  const base = review ? "/admin/review" : "/admin/invoices";
  const filters = review ? `<p class="muted">Invoices with a problem you have not marked as dealt with. Open one to see what to do.</p>` : `
<form method="get" action="/admin/invoices" class="filters">
  <label for="q" class="vh">Search</label><input id="q" name="q" value="${esc(f.q ?? "")}" placeholder="Order, link or transaction">
  <label for="status" class="vh">Status</label>
  <select id="status" name="status"><option value="">All statuses</option>${Object.entries(STATUS_LABEL).map(([k, v]) => `<option value="${k}"${f.status === k ? " selected" : ""}>${v}</option>`).join("")}</select>
  <button class="btn small" type="submit">Filter</button>
</form>`;
  const pager = f.pages > 1 ? `<nav class="pager" aria-label="Pages">${f.page > 1 ? `<a href="${base}${qs(f.page - 1)}">Newer</a>` : ""}<span>Page ${f.page} of ${f.pages}</span>${f.page < f.pages ? `<a href="${base}${qs(f.page + 1)}">Older</a>` : ""}</nav>` : "";
  return layout(cfg, review ? "Needs review" : "Invoices", `
<h1>${review ? "Needs review" : "Invoices"} <span class="muted small">${f.total}</span></h1>
${filters}
${rowsTable(rows, review ? "Nothing needs your attention." : "No invoices match.")}
${pager}`, { token, nav: review ? "review" : "invoices", reviewCount });
}

export function invoicePage(cfg: PayConfig, token: string, r: Row, reviewCount: number): string {
  const v = r.view;
  const dl = (pairs: [string, string][]) => `<dl class="facts">${pairs.filter(([, x]) => x !== "").map(([k, x]) => `<dt>${esc(k)}</dt><dd>${x}</dd>`).join("")}</dl>`;
  const issues = r.issues.length ? `<section class="card ${r.rec.review ? "" : "attention"}"><h2>${r.rec.review ? "Dealt with" : "Needs your attention"}</h2><ul>${r.issues.map((i) => `<li>${esc(ISSUE_TEXT[i])}</li>`).join("")}</ul>
${r.rec.review
    ? `<p class="muted">Marked as dealt with on ${esc(when(r.rec.review.resolvedAt))}${r.rec.review.note ? `: ${esc(r.rec.review.note)}` : ""}.</p>
<form method="post" action="/admin/invoices/${esc(encodeURIComponent(v.id))}/review"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="action" value="reopen"><button class="btn small" type="submit">Mark as not dealt with</button></form>`
    : `<form method="post" action="/admin/invoices/${esc(encodeURIComponent(v.id))}/review" class="stack"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="action" value="resolve">
<label for="note">What did you do? (optional, shown in the export)</label><input id="note" name="note" maxlength="200" placeholder="Refunded 0.02 XMR, transaction ...">
<button class="btn primary" type="submit">Mark as dealt with</button></form>`}</section>` : "";
  return layout(cfg, `Invoice ${v.reference ?? v.id.slice(0, 10)}`, `
<p><a href="/admin/invoices">All invoices</a></p>
<h1>${esc(v.reference ?? r.linkTitle ?? "Invoice")} ${badge(v.status)}</h1>
${issues}
<section class="card">
${dl([
    ["Price", esc(price(r))],
    ["Amount due", `${esc(v.amount.xmr)} XMR`],
    ["Rate", v.amount.fiat ? `${esc(v.amount.fiat.rate)} ${esc(v.amount.fiat.currency)} per XMR${v.amount.fiat.source ? ` (${esc(v.amount.fiat.source)})` : ""}` : ""],
    ["Received", `${esc(v.received)} XMR${v.pending ? " (part still unconfirmed)" : ""}`],
    ["Overpaid", v.overpaid !== "0" ? `${esc(v.overpaid)} XMR` : ""],
    ["Confirmations", v.status === "confirming" || v.status === "paid" || v.status === "late" ? `${v.confirmations} of ${v.requiredConfirmations}` : ""],
    ["Created", esc(when(v.createdAt))],
    ["Price held until", esc(when(v.expiresAt))],
    ["Money first seen", r.paidAt ? esc(when(r.paidAt)) : ""],
    ["Payment link", r.linkTitle ? esc(r.linkTitle) : ""],
    ["Your data", v.metadata ? `<code>${esc(v.metadata)}</code>` : ""],
    ["Invoice id", `<code>${esc(v.id)}</code>`],
    ["Address", `<code class="wrap">${esc(v.address)}</code>`],
    ["Checkout page", `<a href="${esc(v.checkoutUrl)}">${esc(v.checkoutUrl)}</a>`],
  ])}
</section>
${v.txHashes.length ? `<section class="card"><h2>Payments counted</h2><ul class="mono">${v.txHashes.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></section>` : ""}
${v.lockedPayments.length ? `<section class="card attention"><h2>Locked payments (not counted)</h2><ul class="mono">${v.lockedPayments.map((p) => `<li>${esc(p.amount)} XMR, ${esc(p.txHash)}</li>`).join("")}</ul></section>` : ""}
`, { token, nav: "invoices", reviewCount });
}

export function linksPage(cfg: PayConfig, token: string, links: LinkView[], reviewCount: number, msg?: { error?: string; created?: string }): string {
  const list = links.length ? links.map((l) => `
<article class="card link${l.active ? "" : " off"}" id="link-${esc(l.id)}">
  <div class="link-head">
    <img src="/l/${esc(encodeURIComponent(l.id))}/qr.svg" width="96" height="96" alt="QR code for ${esc(l.title)}" loading="lazy">
    <div>
      <h2>${esc(l.title)} ${l.active ? (l.available ? "" : '<span class="badge s-expired">Closed</span>') : '<span class="badge s-expired">Off</span>'}</h2>
      <p class="muted">${l.amount ? `${esc(l.amount)} ${esc(l.currency)}` : `Payer chooses (${esc(l.currency)})${l.minAmount ? `, at least ${esc(l.minAmount)}` : ""}${l.suggested.length ? `, buttons ${esc(l.suggested.join(", "))}` : ""}`}${l.maxPayments ? `, at most ${l.maxPayments} payment(s)` : ""}${l.expiresAt ? `, until ${esc(when(l.expiresAt))}` : ""}</p>
      <p>${l.stats.paid} paid, ${esc(l.stats.receivedXmr)} XMR${l.stats.open ? `, ${l.stats.open} waiting` : ""}</p>
    </div>
  </div>
  <div class="field"><label for="u-${esc(l.id)}">Link</label><div class="copyrow"><input id="u-${esc(l.id)}" readonly value="${esc(l.url)}"><button class="btn small" type="button" data-copy="u-${esc(l.id)}">Copy</button></div></div>
  <div class="field"><label for="b-${esc(l.id)}">Button for your website</label><div class="copyrow"><textarea id="b-${esc(l.id)}" readonly rows="2">${esc(l.buttonHtml)}</textarea><button class="btn small" type="button" data-copy="b-${esc(l.id)}">Copy</button></div></div>
  <form method="post" action="/admin/links/${esc(encodeURIComponent(l.id))}/${l.active ? "off" : "on"}"><input type="hidden" name="token" value="${esc(token)}"><button class="btn small" type="submit">${l.active ? "Switch off" : "Switch on"}</button></form>
</article>`).join("") : `<p class="muted">No payment links yet.</p>`;
  return layout(cfg, "Payment links", `
<h1>Payment links</h1>
<p class="muted">One link to share in a chat, an email or a profile, or as a button on your website. Every payer gets their own invoice.</p>
${msg?.error ? `<p class="note bad" role="alert">${esc(msg.error)}</p>` : ""}
${msg?.created ? `<p class="note good" role="status">Link created: ${esc(msg.created)}.</p>` : ""}
<details class="card"${links.length ? "" : " open"}>
  <summary><h2>New payment link</h2></summary>
  <form method="post" action="/admin/links" class="grid-form">
    <input type="hidden" name="token" value="${esc(token)}">
    <label for="title">Title</label><input id="title" name="title" required maxlength="80" placeholder="Logo design, or Support my podcast">
    <label for="description">Description (optional)</label><input id="description" name="description" maxlength="500">
    <label for="currency">Currency</label><input id="currency" name="currency" maxlength="3" value="${esc(cfg.defaultCurrency)}" autocapitalize="characters">
    <label for="amount">Fixed price</label><input id="amount" name="amount" inputmode="decimal" placeholder="Leave empty to let the payer choose">
    <label for="minAmount">Smallest amount (payer chooses)</label><input id="minAmount" name="minAmount" inputmode="decimal">
    <label for="suggested">One-tap amounts (payer chooses)</label><input id="suggested" name="suggested" placeholder="5, 10, 25">
    <label for="maxPayments">Most payments</label><input id="maxPayments" name="maxPayments" inputmode="numeric" placeholder="1 for a one-off bill; empty for no limit">
    <label for="expires">Last day (UTC)</label><input id="expires" name="expires" type="date">
    <span></span><button class="btn primary" type="submit">Create link</button>
  </form>
</details>
${list}`, { token, nav: "links", reviewCount });
}

export function exportPage(cfg: PayConfig, token: string, reviewCount: number): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  return layout(cfg, "Export", `
<h1>Sales export</h1>
<p class="muted">A spreadsheet (CSV) of every invoice that received money, by the date the money arrived (UTC): price, rate, XMR received, its value at the invoice rate, and transaction ids. Give it to your accountant.</p>
<section class="card">
  <form method="get" action="/admin/export.csv" class="grid-form">
    <label for="from">From</label><input id="from" name="from" type="date" value="${y}-01-01">
    <label for="to">To (inclusive)</label><input id="to" name="to" type="date" value="${now.toISOString().slice(0, 10)}">
    <span></span><button class="btn primary" type="submit">Download CSV</button>
  </form>
  <p class="hint">Quick: <a href="/admin/export.csv?from=${y}-01-01&amp;to=${y}-12-31">${y}</a>, <a href="/admin/export.csv?from=${y - 1}-01-01&amp;to=${y - 1}-12-31">${y - 1}</a>, <a href="/admin/export.csv">everything</a>.</p>
</section>
<p class="hint">Invoices priced in XMR have no value in another currency; add it from your own records.</p>`, { token, nav: "export", reviewCount });
}

export const ADMIN_JS = `
document.querySelectorAll("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    var el = document.getElementById(b.getAttribute("data-copy"));
    if (!el || !navigator.clipboard) return;
    navigator.clipboard.writeText(el.value).then(function () { var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1500); });
  });
});
`;

export const ADMIN_CSS = `
:root { --bg: #efeee7; --surface: #fbfbf7; --surface-2: #f2f2ec; --ink: #121a17; --ink-2: #3e4a44; --ink-3: #5f6e64; --line: #dcdcd2; --forest: #1f4733; --forest-soft: #e7efe8; --clay: #b4532a; --clay-soft: #f1e3da; --bad-soft: #f3e1de; --warn-soft: #f3ead6; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
a { color: var(--forest); }
a:focus-visible, .btn:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, summary:focus-visible { outline: 3px solid var(--clay); outline-offset: 2px; }
h1 { font: 500 1.9rem/1.15 Georgia, "Times New Roman", serif; margin: 8px 0 16px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
h2 { font-size: 1rem; margin: 0 0 10px; }
code, .mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.85rem; }
.wrap, .mono li { overflow-wrap: anywhere; }
.top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; padding: 12px 16px; background: var(--surface); border-bottom: 1px solid var(--ink); }
.brand { display: grid; line-height: 1.2; }
.brand span { color: var(--clay); font-size: 0.75rem; font-weight: 650; letter-spacing: 0.1em; text-transform: uppercase; }
.top nav { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }
.top nav a { padding: 8px 12px; border-radius: 6px; text-decoration: none; color: var(--ink-2); min-height: 40px; display: inline-flex; align-items: center; gap: 6px; }
.top nav a[aria-current="page"] { background: var(--forest-soft); color: var(--forest); font-weight: 650; }
.count { background: var(--clay); color: #fff; border-radius: 10px; padding: 0 7px; font-size: 0.75rem; }
.main { max-width: 1100px; margin: 0 auto; padding: 16px 16px 48px; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 18px; margin: 0 0 16px; min-width: 0; }
.card.attention { border-color: var(--clay); background: #fdf6f1; }
.narrow { max-width: 420px; margin: 40px auto; }
.muted { color: var(--ink-2); } .small { font-size: 0.9rem; font-weight: 400; } .hint { color: var(--ink-3); font-size: 0.85rem; }
.note { padding: 10px 14px; border-radius: 6px; margin: 0 0 16px; }
.note.warn { background: var(--warn-soft); } .note.bad { background: var(--bad-soft); } .note.good { background: var(--forest-soft); }
.totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.total p { margin: 2px 0; } .total .big { font: 500 1.6rem/1.2 Georgia, serif; }
.health { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.health li { padding: 8px 12px; border-radius: 6px; } .health .ok { background: var(--forest-soft); } .health .bad { background: var(--bad-soft); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--forest); }
td.num { font-variant-numeric: tabular-nums; }
tr.flag td:first-child { box-shadow: inset 3px 0 0 var(--clay); }
td .sub { display: block; color: var(--ink-3); font-size: 0.82rem; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 650; background: var(--surface-2); color: var(--ink-2); }
.s-paid { background: var(--forest); color: #fff; } .s-confirming { background: var(--forest-soft); color: var(--forest); }
.s-partial, .s-late, .s-flag { background: var(--clay-soft); color: #7a3417; } .s-expired { background: var(--surface-2); color: var(--ink-3); }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 8px 18px; border-radius: 7px; border: 1px solid var(--ink-3); background: var(--surface); color: var(--ink); font: 650 0.95rem/1.2 inherit; cursor: pointer; text-decoration: none; }
.btn.primary { background: var(--forest); border-color: var(--forest); color: #fff; }
.btn.small { min-height: 40px; padding: 6px 12px; font-size: 0.88rem; }
input, select, textarea { min-height: 44px; padding: 8px 10px; border: 1px solid var(--ink-3); border-radius: 6px; background: #fff; color: var(--ink); font: inherit; width: 100%; min-width: 0; }
textarea { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.8rem; resize: vertical; }
.stack { display: grid; gap: 8px; }
.grid-form { display: grid; grid-template-columns: minmax(160px, 240px) minmax(0, 1fr); gap: 10px 14px; align-items: center; margin-top: 12px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
.filters input { flex: 1 1 240px; width: auto; } .filters select { flex: 0 1 200px; width: auto; }
.pager { display: flex; gap: 16px; align-items: center; justify-content: center; margin-top: 12px; }
.facts { display: grid; grid-template-columns: minmax(130px, 200px) minmax(0, 1fr); gap: 8px 16px; margin: 0; }
.facts dt { color: var(--ink-3); } .facts dd { margin: 0; overflow-wrap: anywhere; }
details summary { cursor: pointer; list-style: none; } details summary h2 { display: inline; } details summary::before { content: "+ "; font-weight: 700; } details[open] summary::before { content: "- "; }
.link-head { display: flex; gap: 16px; align-items: flex-start; }
.link-head img { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: 4px; flex: none; }
.link.off { opacity: 0.75; }
.field { display: grid; gap: 4px; margin: 10px 0; } .field label { font-size: 0.8rem; color: var(--ink-3); }
.copyrow { display: flex; gap: 8px; align-items: flex-start; }
.vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.logout { margin-left: auto; }
@media (max-width: 640px) {
  .grid-form, .facts { grid-template-columns: minmax(0, 1fr); }
  .grid-form > span { display: none; }
  .copyrow { flex-direction: column; } .copyrow .btn { align-self: stretch; }
  .link-head { flex-direction: column; }
  .top { gap: 8px 12px; }
  table, tbody, tr, td { display: block; } thead { display: none; }
  tr { padding: 10px 0; border-bottom: 1px solid var(--line); }
  td { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 8px; padding: 3px 0; border: 0; }
  td::before { content: attr(data-label); color: var(--ink-3); font-size: 0.8rem; }
  td[data-label="Status"] { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  td[data-label="Status"]::before { flex: 0 0 90px; margin-right: 2px; }
  tr.flag td:first-child { box-shadow: none; } tr.flag { box-shadow: inset 3px 0 0 var(--clay); padding-left: 10px; }
  .top nav { order: 3; flex: 1 0 100%; flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 0 12px; }
  .top nav a { white-space: nowrap; }
  h1 { font-size: 1.6rem; }
}
`;

/** Changes whenever the stylesheet or script changes, so browsers never keep a stale copy. */
const ASSET_VERSION = createHash("sha256").update(ADMIN_CSS).update(ADMIN_JS).digest("hex").slice(0, 12);
