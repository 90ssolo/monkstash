# MonkStash Pay

Accept Monero on your online shop, on your own server, with nobody in the middle.

MonkStash Pay is a small open-source payment server you run yourself. Your shop asks it for an invoice, your customer pays on a clean checkout page, and your shop gets a signed message the moment the order is paid. The money goes straight from the customer's wallet to yours.

* **Non-custodial.** It uses a **view-only** wallet: it can see payments, it can never spend them. Even if the server is hacked, your money stays put.
* **Private.** No MonkStash servers are involved. Your view key, your orders and your customers never leave your server.
* **A fresh address per order.** Payments are matched by address, never by amount, so two orders for the same price can never be confused.
* **Prices in your currency.** Set prices in EUR, USD, GBP and 25 more; the XMR amount is held for a set time (30 minutes by default).
* **Light.** One small Node.js program and a JSON file. No database, no full node required (though your own node is best).

## How it works

```
Your shop ──POST /api/invoices──▶ MonkStash Pay ──▶ checkout link
Customer ──opens checkout link──▶ pays with any Monero wallet
MonkStash Pay ──watches the chain with your view key──▶ sees the payment
MonkStash Pay ──signed webhook "invoice.paid"──▶ Your shop marks the order paid
```

## Quick start (Docker)

1. Make a wallet for your shop (Feather, Monero GUI, Cake or MonkStash) and note its **primary address**, **private view key** and the **block height** when you created it. Never use the seed or spend key here. MonkStash Pay makes its invoice addresses in wallet account 1 by default; read [One account per Pay server](#one-account-per-pay-server) before you change that.
2. Copy `apps/pay/.env.example` to `apps/pay/.env` and fill it in. Generate the two secrets with `openssl rand -hex 32`.
3. From the repository root:

```bash
docker build -f apps/pay/Dockerfile -t monkstash-pay .
docker run -d --name monkstash-pay --restart unless-stopped --env-file apps/pay/.env -v monkstash-pay-data:/data -p 127.0.0.1:8080:8080 monkstash-pay
```

4. Put it behind HTTPS (Caddy, nginx or your host's proxy) at the address you set in `PAY_PUBLIC_URL`, for example `https://pay.yourshop.com`. Checkout pages must be served over HTTPS.

Without Docker (Node.js 22 or newer, from the repository root): `pnpm install`, then `pnpm --filter @quietmint/pay build` and `node --env-file=apps/pay/.env apps/pay/dist/server.mjs`.

The first start scans the chain from your restore height, which can take a while on mainnet. After that, progress is saved in the data directory and restarts are quick.

## Settings

| Variable | Required | What it does |
|---|---|---|
| `PAY_NETWORK` | yes | `mainnet` for real money, `stagenet` for testing |
| `PAY_ADDRESS` | yes | Your shop wallet's primary address (starts with 4) |
| `PAY_VIEW_KEY` | yes | Its private **view** key (64 hex characters) |
| `PAY_RESTORE_HEIGHT` | yes | Block height to start scanning from: when the wallet was made, or a little earlier. The server refuses to start without it |
| `PAY_ACCOUNT` | no | Wallet account for invoice addresses (default `1`). One account per Pay server, see below |
| `PAY_NODE_URL` | yes | A Monero node, like `https://node.example:18089` |
| `PAY_API_KEY` | yes | 32+ character secret your shop uses to call the API |
| `PAY_WEBHOOK_URL` | no | Where to send payment events |
| `PAY_WEBHOOK_SECRET` | with webhooks | 32+ character secret for signing events |
| `PAY_PUBLIC_URL` | yes in production | Public HTTPS address of this server |
| `PAY_SHOP_NAME` | no | Shown on the checkout page and in the customer's wallet |
| `PAY_CURRENCY` | no | Default price currency (`EUR` unless set) |
| `PAY_CONFIRMATIONS` | no | `quick`, `standard` (default) or `safe`, see below |
| `PAY_EXPIRY_MINUTES` | no | How long a price is held (default 30) |
| `PAY_MAX_OPEN_INVOICES` | no | Most unpaid, unexpired invoices at once (default 500). New ones get a 503 above this |
| `PAY_DATA_DIR` | no | Where invoices and wallet state are kept |
| `PAY_TRUST_PROXY` | behind a proxy | Set to `1` when a reverse proxy (Caddy, nginx) is the only way in, so rate limits apply per visitor instead of to the proxy |

### When is an order paid?

| Setting | Rule |
|---|---|
| `quick` | Up to 0.1 XMR: paid as soon as the payment is seen. Up to 1 XMR: 1 confirmation (about 2 minutes). Above: 10 |
| `standard` | 1 confirmation. Over 5 XMR: 10 confirmations |
| `safe` | 10 confirmations (about 20 minutes), when the coins become spendable |

**Do not use `quick` for goods delivered instantly** (downloads, licence keys, gift cards, account credit). A payment with no confirmations can still be dropped from the network, for example by a double spend. `quick` suits sales where you can stop handing over the goods, like a coffee or an order you ship later. If an unconfirmed payment disappears after the order was reported paid or confirming, MonkStash Pay sends `invoice.reverted` (see [Webhooks](#webhooks)).

Once an invoice is `paid`, it stays paid: more money sent to the same address later counts as overpayment and never sends it back to `confirming`. Only the payments that brought the total up to the amount due need confirmations.

### One account per Pay server

A Monero wallet has accounts, and each account numbers its own subaddresses 1, 2, 3 and so on. MonkStash Pay hands out the next subaddress in its account (`PAY_ACCOUNT`, default `1`) for every invoice. If anything else creates subaddresses in that same account, such as a till, payment links, your desktop wallet or a second Pay server, two orders can end up with the same address, and one order could be marked paid with another customer's money.

* Use **one wallet account per Pay server**. Never share it with a till, payment links or another Pay server.
* Account `0` is the one wallet apps use by default, so leave it for your own use.
* Invoices made before `PAY_ACCOUNT` existed stay in account `0` and are still watched there.

### Restoring the shop wallet in another app

Every invoice uses up a subaddress, including ones that are never paid. Wallet software only looks a limited distance ahead for payments to subaddresses it has not used yet: by default 200 subaddresses past the last one that received money (and 50 accounts) in Monero's own wallets. If you restore the shop wallet from its seed in another app, payments further ahead than that will not show up there until you raise the lookahead.

`GET /api/health` shows the numbers you need under `subaddresses`: `highestIndex` (the highest subaddress handed out), `lastPaidIndex` and `gap` (how many were handed out since the last one that was paid). The server logs a warning once the gap passes 150.

* **monero-wallet-cli:** run `set subaddress-lookahead 50:1000` (accounts, then subaddresses; make the first number larger than your `PAY_ACCOUNT` and the second larger than your gap), then `rescan_bc`.
* **Other wallets (Monero GUI, Feather, Cake and others):** use your wallet's subaddress lookahead setting if it has one, set it above the gap, and rescan. If it has none, create subaddresses in the Pay account up to `highestIndex` and rescan.

The server's own view-only wallet does not have this problem: it creates every subaddress it hands out, and if its wallet files are lost it creates them again, up to the highest stored index, before it scans.
## API

Every API call needs `Authorization: Bearer <PAY_API_KEY>`. Keep the key on your shop's server; never put it in a web page.

### Create an invoice

```http
POST /api/invoices
Content-Type: application/json

{
  "amount": "19.99",
  "currency": "EUR",
  "reference": "Order 1001",
  "metadata": "{\"orderId\":1001}",
  "returnUrl": "https://yourshop.com/orders/1001",
  "expiresInMinutes": 30
}
```

Only `amount` is required. `currency` is `XMR` or a code like `EUR`. `metadata` is your own text (up to 1000 characters), returned in the API and webhooks but never shown to the customer.

Response `201`:

```json
{
  "id": "SKqy6lEvr9TElqiK17G9euyG_R4OcUef",
  "status": "waiting",
  "reference": "Order 1001",
  "amount": { "xmr": "0.041277", "fiat": { "currency": "EUR", "amount": "19.99", "rate": "484.29693", "source": "median of Bitfinex, Kraken, KuCoin" } },
  "received": "0",
  "remaining": "0.041277",
  "overpaid": "0",
  "confirmations": 0,
  "requiredConfirmations": 1,
  "address": "7BBJ5m...",
  "paymentUri": "monero:7BBJ5m...?tx_amount=0.041277",
  "createdAt": "2026-10-15T15:21:08.369Z",
  "expiresAt": "2026-10-15T15:51:08.369Z",
  "checkoutUrl": "https://pay.yourshop.com/pay/SKqy6lEvr9TElqiK17G9euyG_R4OcUef",
  "returnUrl": "https://yourshop.com/orders/1001",
  "metadata": "{\"orderId\":1001}",
  "txHashes": []
}
```

Send your customer to `checkoutUrl`.

### Check an invoice

`GET /api/invoices/:id` returns the same shape with the current status.

### Health

`GET /api/health` returns the sync height, the last sync time, any node problem, how many webhooks are waiting, how many unpaid invoices are open (`openInvoices`, `maxOpenInvoices`) and the subaddress lookahead numbers (`subaddresses`, see [Restoring the shop wallet in another app](#restoring-the-shop-wallet-in-another-app)).

### Limits

Creating invoices is limited to 60 a minute per client address (your shop's server, or with `PAY_TRUST_PROXY=1` the address your proxy reports); above that the API answers `429`. Separately, while `PAY_MAX_OPEN_INVOICES` unpaid, unexpired invoices are open, new ones get `503` with an `error` message until some are paid or expire. Your shop should show the customer a "try again shortly" message in both cases.

### While the server syncs

After a start, the server cannot tell what has been paid until its first sync with the node succeeds. Until then, creating or reading invoices and the checkout page answer `503` with a `Retry-After` header and the message "The payment server is still syncing. Try again in a minute." `GET /api/health` keeps answering. If the node becomes unreachable later, statuses are decided as of the last successful sync, so an invoice is never reported `expired` (or a payment `late`) because the server could not see the chain. A payment found in the mempool after such a gap counts as sent at the last successful sync, not when the server came back.

Invoices are kept in `invoices.json` in the data folder, with the previous version as `invoices.json.bak`. If the main file is ever damaged, the server starts from the backup and logs a warning.

### Statuses

| Status | Meaning | What to do |
|---|---|---|
| `waiting` | Nothing received yet | Wait |
| `confirming` | Enough received, waiting for confirmations | Wait; you may tell the customer it arrived |
| `paid` | Paid in full and confirmed | Ship the order. `overpaid` > 0 means they sent extra |
| `partial` | Less than the amount arrived | The checkout page asks for the rest until the price hold ends. With `expired: true` it stops asking: refund the part paid, or agree the rest with the customer |
| `expired` | Nothing arrived before the price hold ended | Cancel or let the customer start again |
| `late` | Money arrived after the price hold ended | Review: accept it, or refund (ask the customer for a refund address) |

Every invoice also has `expired` (true once `expiresAt` has passed: the customer should not send money now), `confirmations` (for `confirming`, `paid` and `late`: the fewest confirmations among the payments that count) and `pending` (part of the money is still unconfirmed).

**Grace period.** A payment first seen up to 3 minutes after `expiresAt` still counts as on time, so a customer who pressed send in the last seconds is not treated as late. For the same reason an unpaid invoice stays `waiting` (with `expired: true`) for those 3 minutes and only then turns `expired`, and a partly paid invoice is reported as expired only then.

## Webhooks

When an invoice changes status, MonkStash Pay sends a `POST` to `PAY_WEBHOOK_URL`:

```json
{ "id": "<event id>", "type": "invoice.paid", "created": 1792077982, "data": { ...the invoice, as in the API... } }
```

| Event | Sent when |
|---|---|
| `invoice.confirming` | Enough arrived; waiting for confirmations |
| `invoice.paid` | Paid in full and confirmed |
| `invoice.partial` | Part of the amount arrived (again each time more arrives) |
| `invoice.late` | Money arrived after the price hold and grace period |
| `invoice.expired` | The hold and grace period ended. If nothing arrived, `data.status` is `expired`. If part arrived, `data.status` is `partial` with `expired: true` and the amount in `data.received`: refund it or follow up |
| `invoice.reverted` | An invoice you were told is `paid` or `confirming` went back (to `waiting` or `partial`) because an unconfirmed payment disappeared. Stop the order if you have not delivered it |

A failed delivery is retried after 1 minute, 5 minutes, 30 minutes, 2 hours and 6 hours: 6 attempts in all, the last about 8 hours 36 minutes after the first. After that the event is dropped. The API always has the current status, so you can also poll it.

**Always verify the signature** before trusting an event. The header is:

```
X-MonkStash-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>" with PAY_WEBHOOK_SECRET>
```

Node.js:

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(secret, header, rawBody) {
  const p = Object.fromEntries(header.split(",").map((kv) => kv.split("=")));
  if (Math.abs(Date.now() / 1000 - Number(p.t)) > 300) return false; // reject replays
  const expected = createHmac("sha256", secret).update(`${p.t}.${rawBody}`).digest();
  const got = Buffer.from(p.v1 ?? "", "hex");
  return got.length === expected.length && timingSafeEqual(got, expected);
}
```

PHP:

```php
function monkstash_verify(string $secret, string $header, string $rawBody): bool {
    parse_str(str_replace(',', '&', $header), $p);
    if (!isset($p['t'], $p['v1']) || abs(time() - (int) $p['t']) > 300) return false;
    $expected = hash_hmac('sha256', $p['t'] . '.' . $rawBody, $secret);
    return hash_equals($expected, $p['v1']);
}
```

Use the raw request body exactly as received, before any JSON parsing.

## Security notes

* The server holds only your **view key**. Anyone who gets it can see your incoming payments (not spend them). Protect the server and the `.env` file accordingly.
* Run it behind HTTPS. The API key and checkout pages must never travel over plain HTTP on the internet.
* Back up the data directory. It holds your invoices; losing it does not lose money (the payments are in your wallet), but you lose the link between payments and orders.
* Checkout pages use long random IDs and strict security headers (no third-party scripts, no framing). Public routes are rate limited.
* The node you connect to sees this server's IP address and its sync requests, never your keys. Your own node is the most private choice.
* Exchange rates come from public exchange APIs (Kraken, Bitfinex, KuCoin; CoinGecko as a backup), at most once a minute. Your customers' browsers never contact them. Other currencies are converted with the European Central Bank's reference rates; the server logs a warning if it could not load them (then only USD prices work) or if the newest ones are more than 3 days old.

## Limits (version 0.1)

* One wallet, one wallet account and one shop per server.
* Invoices are kept in a JSON file loaded into memory: fine for thousands of orders, not for millions.
* No admin screen yet. Use the API, or your shop's order list.

License: BSD-3-Clause.
