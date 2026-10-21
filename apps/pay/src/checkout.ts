/**
 * The checkout page a customer sees, served by the merchant's own MonkStash Pay. Plain HTML
 * rendered on the server with one small script for live status; no external fonts, scripts or
 * trackers. Works without JavaScript too (the QR, amount and address are in the HTML).
 */
import type { PayConfig } from "./config";
import type { presentInvoice } from "./invoices";
import type { StoredLink } from "./store";

type View = ReturnType<typeof presentInvoice>;

export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function money(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>${esc(title)}</title>
<link rel="stylesheet" href="/assets/checkout.css">
</head>
<body>
${body}
</body>
</html>`;
}

export function notFoundPage(): string {
  return shell("Payment not found", `<main class="wrap"><section class="card"><p class="kicker">Monero payment</p><h1 class="title">This payment link does not exist</h1><p class="muted">Check the link, or go back to the shop and start the payment again.</p></section></main>`);
}

export function syncingPage(): string {
  return shell("Payment server starting", `<main class="wrap"><section class="card"><p class="kicker">Monero payment</p><h1 class="title">The payment server is still syncing</h1><p class="muted">It is catching up with the Monero network. Reload this page in a minute.</p></section></main>`);
}

export function checkoutPage(v: View, cfg: PayConfig): string {
  const shop = cfg.shopName ?? "the shop";
  const price = v.amount.fiat ? money(v.amount.fiat.amount, v.amount.fiat.currency) : `${v.amount.xmr} XMR`;
  const testNet = cfg.network !== "mainnet";
  const statusUrl = `/pay/${encodeURIComponent(v.id)}/status`;
  return shell(`Pay ${price} with Monero`, `
<main class="wrap">
  <section class="card" id="card" data-status-url="${esc(statusUrl)}" data-qr-url="/pay/${esc(encodeURIComponent(v.id))}/qr.svg" data-expires="${esc(v.expiresAt ?? "")}" data-status="${esc(v.status)}" data-expired="${v.expired ? "1" : ""}" data-received="${esc(v.received)}">
    <p class="kicker">Monero payment${cfg.shopName ? ` to ${esc(cfg.shopName)}` : ""}</p>
    ${testNet ? `<p class="warn"><strong>Test network (${esc(cfg.network)}).</strong> Practice coins only. Do not send real Monero.</p>` : ""}
    <h1 class="title">${esc(price)}</h1>
    <p class="sub">${v.amount.fiat ? `Pay exactly <strong>${esc(v.amount.xmr)} XMR</strong>, at ${esc(money(v.amount.fiat.rate, v.amount.fiat.currency))} per XMR.` : "Pay exactly this amount."}${v.reference ? ` Order: <strong>${esc(v.reference)}</strong>.` : ""}</p>

    <div class="state" id="state" role="status" aria-live="polite">
      <span class="dot" aria-hidden="true"></span>
      <div><strong id="state-title">Waiting for your payment</strong><span id="state-text">${v.expiresAt ? `Price held until <b id="countdown">${esc(new Date(v.expiresAt).toUTCString())}</b>.` : ""}</span></div>
    </div>

    <div class="pay" id="pay">
      <figure class="qr"><img id="qr" src="/pay/${esc(encodeURIComponent(v.id))}/qr.svg" width="260" height="260" alt="QR code to pay ${esc(price)} in Monero"><figcaption>Scan with any Monero wallet</figcaption></figure>
      <div class="side">
        <a class="btn primary" id="open" href="${esc(v.paymentUri)}">Open in my wallet</a>
        <div class="field">
          <span class="label">Amount</span>
          <code class="value" id="amount">${esc(v.status === "partial" ? v.remaining : v.amount.xmr)} XMR</code>
          <button type="button" class="btn small" data-copy="amount">Copy amount</button>
        </div>
        <div class="field">
          <span class="label">Send to this address</span>
          <code class="value addr" id="address">${esc(v.address)}</code>
          <button type="button" class="btn small" data-copy="address">Copy address</button>
          <span class="hint">Check the first and last six characters: <b>${esc(v.address.slice(0, 6))}…${esc(v.address.slice(-6))}</b></span>
        </div>
      </div>
    </div>

    ${v.returnUrl ? `<a class="btn ghost" id="back" href="${esc(v.returnUrl)}" rel="noopener noreferrer">Back to ${esc(new URL(v.returnUrl).host)}</a>` : ""}

    <ul class="notes">
      <li>This address is for this order only. Payments to it are matched to your order automatically.</li>
      <li>Your payment goes straight to ${esc(shop)}'s wallet. MonkStash never holds it.</li>
      <li>Monero payments cannot be reversed. Check the amount before you send.</li>
    </ul>
  </section>
  <p class="foot">Non-custodial checkout by MonkStash Pay</p>
</main>
<script src="/assets/checkout.js" defer></script>`);
}

/** Formats a link amount for display: currency style for money, "0.5 XMR" for Monero. */
function linkMoney(amount: string, currency: string): string {
  if (currency === "XMR") return `${amount} XMR`;
  try {
    // Whole amounts read better without ".00" on a donation button: "€5", but "€12.50".
    const whole = !amount.includes(".") || /\.0+$/.test(amount);
    return new Intl.NumberFormat("en", { style: "currency", currency, ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : { minimumFractionDigits: 2 }) }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * The page behind a payment link. Works without JavaScript: the payer picks or types an amount
 * and a plain form post creates their own invoice, then they land on the usual checkout page.
 */
export function linkPage(link: StoredLink, cfg: PayConfig, opts: { error?: string; typed?: string } = {}): string {
  const action = `/l/${encodeURIComponent(link.id)}`;
  const testNet = cfg.network !== "mainnet";
  const to = cfg.shopName ? ` to ${esc(cfg.shopName)}` : "";
  const err = opts.error ? `<p class="warn" role="alert">${esc(opts.error)}</p>` : "";
  let choose: string;
  if (link.amount) {
    choose = `<form method="post" action="${esc(action)}" class="choose"><button class="btn primary" type="submit">Pay ${esc(linkMoney(link.amount, link.currency))} with Monero</button></form>`;
  } else {
    const quick = (link.suggested ?? []).map((a) => `<button class="btn" type="submit" name="amount" value="${esc(a)}">${esc(linkMoney(a, link.currency))}</button>`).join("");
    choose = `${quick ? `<form method="post" action="${esc(action)}" class="amounts" aria-label="Choose an amount">${quick}</form>` : ""}
    <form method="post" action="${esc(action)}" class="custom">
      <label class="label" for="amount">${quick ? "Or enter your own amount" : "Amount"} (${esc(link.currency)})</label>
      <div class="row">
        <input id="amount" name="amount" inputmode="decimal" autocomplete="off" required maxlength="24" value="${esc(opts.typed ?? "")}">
        <button class="btn primary" type="submit">Continue</button>
      </div>
      ${link.minAmount ? `<span class="hint">At least ${esc(linkMoney(link.minAmount, link.currency))}.</span>` : ""}
    </form>`;
  }
  return shell(`${link.title}: pay with Monero`, `
<main class="wrap">
  <section class="card">
    <p class="kicker">Monero payment${to}</p>
    ${testNet ? `<p class="warn"><strong>Test network (${esc(cfg.network)}).</strong> Practice coins only. Do not send real Monero.</p>` : ""}
    <h1 class="title">${esc(link.title)}</h1>
    ${link.description ? `<p class="sub">${esc(link.description)}</p>` : ""}
    ${err}
    ${choose}
    <ul class="notes">
      <li>You get your own payment address and an exact Monero amount on the next page.</li>
      <li>Your payment goes straight to ${esc(cfg.shopName ?? "the recipient")}'s wallet. MonkStash never holds it.</li>
      <li>Monero payments cannot be reversed. Check the amount before you send.</li>
    </ul>
  </section>
  <p class="foot">Non-custodial payments by MonkStash Pay</p>
</main>`);
}

const UNAVAILABLE: Record<"inactive" | "expired" | "used", { title: string; text: string }> = {
  inactive: { title: "This payment link is switched off", text: "The owner is not taking payments through it right now. Ask them for a new link." },
  expired: { title: "This payment link has expired", text: "It no longer takes payments. Ask the owner for a new link." },
  used: { title: "This payment link has been paid", text: "It took all the payments it was made for. If you still need to pay, ask the owner for a new link." },
};

export function linkUnavailablePage(reason: keyof typeof UNAVAILABLE): string {
  const m = UNAVAILABLE[reason];
  return shell(m.title, `<main class="wrap"><section class="card"><p class="kicker">Monero payment</p><h1 class="title">${esc(m.title)}</h1><p class="muted">${esc(m.text)}</p></section></main>`);
}

export const CHECKOUT_CSS = `
:root { --bg: #efeee7; --surface: #fbfbf7; --surface-2: #f2f2ec; --ink: #121a17; --ink-2: #3e4a44; --ink-3: #6b7a70; --line: #dcdcd2; --forest: #1f4733; --forest-soft: #e7efe8; --clay: #b4532a; --clay-soft: #f1e3da; --warn-soft: #f3ead6; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.wrap { max-width: 760px; margin: 0 auto; padding: 32px 16px 48px; }
.card { background: var(--surface); border: 1px solid var(--ink); border-radius: 6px; box-shadow: 10px 10px 0 var(--line); padding: 32px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; overflow-wrap: anywhere; }
.kicker { margin: 0; color: var(--clay); font-weight: 650; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; }
.title { margin: 0; font: 500 clamp(2.2rem, 1.6rem + 3vw, 3.4rem)/1.05 Georgia, "Times New Roman", serif; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.sub, .muted { margin: 0; color: var(--ink-2); }
.warn { margin: 0; padding: 10px 14px; background: var(--warn-soft); border-radius: 6px; font-size: 0.9rem; }
.state { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 8px; background: var(--clay-soft); }
.state div { display: grid; gap: 2px; }
.state strong { font-size: 1.1rem; }
.state span { color: var(--ink-2); font-size: 0.92rem; }
.dot { width: 12px; height: 12px; margin-top: 0.45em; border-radius: 50%; background: var(--clay); flex: none; animation: pulse 1.6s ease-in-out infinite; }
.state.good { background: var(--forest-soft); } .state.good .dot { background: var(--forest); }
.state.paid { background: var(--forest); color: #fff; } .state.paid span { color: #e2ece4; } .state.paid .dot { background: #fff; animation: none; }
.state.bad { background: #f3e1de; } .state.bad .dot { background: #a8332a; animation: none; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.pay { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 24px; align-items: start; padding-top: 16px; border-top: 1px solid var(--line); }
.pay.hidden { display: none; }
.qr { margin: 0; display: grid; justify-items: center; gap: 6px; }
.qr img { width: clamp(200px, 40vw, 260px); height: auto; background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 8px; }
.qr figcaption { font-size: 0.85rem; color: var(--ink-3); }
.side { display: grid; gap: 14px; min-width: 0; }
.field { display: grid; gap: 6px; }
.label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--forest); }
.value { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 0.86rem; background: var(--surface-2); padding: 10px 12px; border-radius: 6px; word-break: break-all; }
.hint { font-size: 0.82rem; color: var(--ink-3); }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 8px 20px; border-radius: 7px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font: 650 1rem/1.2 inherit; text-decoration: none; text-align: center; cursor: pointer; }
.btn.primary { background: var(--forest); border-color: var(--forest); color: #fff; }
.btn.ghost { justify-self: start; }
.btn.small { min-height: 44px; justify-self: start; font-size: 0.9rem; padding: 6px 14px; }
.btn:focus-visible { outline: 3px solid var(--clay); outline-offset: 2px; }
.notes { margin: 4px 0 0; padding: 14px 16px 14px 34px; background: var(--forest-soft); border-left: 4px solid var(--forest); border-radius: 0 6px 6px 0; font-size: 0.88rem; color: var(--ink-2); display: grid; gap: 4px; }
.choose { display: grid; }
.amounts { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.custom { display: grid; gap: 8px; }
.row { display: flex; gap: 10px; }
.row input { flex: 1; min-width: 0; min-height: 48px; padding: 8px 12px; border: 1px solid var(--ink-3); border-radius: 7px; background: #fff; color: var(--ink); font: 500 1.05rem/1.2 inherit; font-variant-numeric: tabular-nums; }
.row input:focus-visible { outline: 3px solid var(--clay); outline-offset: 1px; }
.foot { text-align: center; font-size: 0.8rem; color: var(--ink-3); margin: 20px 0 0; }
@media (max-width: 640px) {
  .wrap { padding: 16px 16px 40px; }
  .card { padding: 22px 16px; box-shadow: none; }
  .pay { grid-template-columns: minmax(0, 1fr); }
  .btn.ghost, .btn.small { justify-self: stretch; }
  .row { flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
`;

export const CHECKOUT_JS = `
(function () {
  var card = document.getElementById("card");
  if (!card) return;
  var statusUrl = card.getAttribute("data-status-url");
  var qrUrl = card.getAttribute("data-qr-url");
  var expires = card.getAttribute("data-expires");
  var stateBox = document.getElementById("state");
  var title = document.getElementById("state-title");
  var text = document.getElementById("state-text");
  var payBox = document.getElementById("pay");
  var lastUri = null, done = false;

  function setState(cls, t, msg) {
    stateBox.className = "state" + (cls ? " " + cls : "");
    title.textContent = t;
    text.textContent = msg;
  }
  function countdown() {
    if (!expires || done) return "";
    var left = Math.max(0, new Date(expires).getTime() - Date.now());
    var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
    return "Price held for " + m + ":" + (s < 10 ? "0" : "") + s + ".";
  }
  function render(st) {
    if (st.paymentUri && st.paymentUri !== lastUri) {
      lastUri = st.paymentUri;
      document.getElementById("open").setAttribute("href", st.paymentUri);
      document.getElementById("qr").setAttribute("src", qrUrl + "?v=" + encodeURIComponent(st.remaining));
    }
    if (st.status === "partial" && !st.expired) document.getElementById("amount").textContent = st.remaining + " XMR";
    switch (st.status) {
      case "waiting":
        // The hold has ended, but a payment sent just in time may still show up: keep checking.
        if (st.expired) { setState("bad", "This payment request expired", "Please do not pay it now. If you already sent the payment, it will show here within a few minutes. Otherwise go back to the shop and start again for a fresh price."); payBox.className = "pay hidden"; }
        else setState("", "Waiting for your payment", countdown());
        break;
      case "partial":
        if (st.expired) { setState("bad", "This payment request expired before the full amount arrived", st.received + " XMR arrived. Please do not send more to this address. Contact the shop about the part you paid."); payBox.className = "pay hidden"; }
        else setState("", "Part of the payment arrived", st.received + " XMR received. Please send the remaining " + st.remaining + " XMR to the same address.");
        break;
      case "confirming": setState("good", "Payment received", st.requiredConfirmations > 0 ? "Confirming on the network: " + st.confirmations + " of " + st.requiredConfirmations + ". You can close this page." : "Almost done."); payBox.className = "pay hidden"; break;
      case "paid": done = true; setState("paid", "Paid. Thank you!", st.overpaid !== "0" ? "You sent " + st.overpaid + " XMR more than needed. Contact the shop if you want it back." : "Your payment is complete."); payBox.className = "pay hidden"; break;
      case "late": done = true; setState("bad", "Payment arrived after the price expired", "The shop will review it and contact you. Please do not send more."); payBox.className = "pay hidden"; break;
      case "expired": done = true; setState("bad", "This payment request expired", "Please do not pay it now. Go back to the shop and start again for a fresh price."); payBox.className = "pay hidden"; break;
    }
  }
  function poll() {
    if (done) return;
    fetch(statusUrl, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (st) { if (st) render(st); }).catch(function () {});
  }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy"));
      var v = el.textContent.replace(/ XMR$/, "").trim();
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1500); });
    });
  });
  render({ status: card.getAttribute("data-status"), expired: card.getAttribute("data-expired") === "1", received: card.getAttribute("data-received") });
  poll();
  setInterval(poll, 5000);
  var expiredChecked = false;
  setInterval(function () {
    if (done) return;
    if (stateBox.className === "state" && title.textContent === "Waiting for your payment") text.textContent = countdown();
    // The moment the price hold ends, ask the server instead of waiting for the next poll.
    if (!expiredChecked && expires && Date.now() >= new Date(expires).getTime()) { expiredChecked = true; setTimeout(poll, 1500); }
  }, 1000);
  // Browsers slow timers in background tabs; check again as soon as the page is visible.
  document.addEventListener("visibilitychange", function () { if (!document.hidden) poll(); });
})();
`;
