=== MonkStash Pay ===
Contributors: monkstash
Tags: monero, xmr, crypto, payments, privacy
Requires at least: 6.4
Tested up to: 7.1
Requires PHP: 7.4
WC requires at least: 8.0
Stable tag: 0.1.1
License: BSD-3-Clause
License URI: https://opensource.org/licenses/BSD-3-Clause

Accept Monero on your WooCommerce shop through your own MonkStash Pay server. Non-custodial, with a fresh address for every order.

== Description ==

MonkStash Pay for WooCommerce adds "Monero (XMR)" to your checkout. It talks to **your own** MonkStash Pay server (open source, self-hosted), so:

* **Payments go straight to your wallet.** Nobody holds your money; the server only has a view-only key.
* **Every order gets its own address.** Payments are matched by address, never by amount, so two orders for the same price are never confused.
* **Prices in your shop currency.** Your EUR, USD or GBP price is converted at a live rate and held for 30 minutes.
* **Orders complete themselves.** A signed webhook marks the order paid; a check every five minutes covers missed webhooks.
* **Works with the block checkout and the classic checkout**, and with WooCommerce's order tables (HPOS).

Your shop never stores a view key, and no MonkStash company server is involved.

= How an order is marked paid =

1. The customer chooses Monero and is sent to your MonkStash Pay checkout page.
2. When the payment is confirmed, MonkStash Pay sends a signed webhook.
3. The plugin checks the signature, then asks your MonkStash Pay server for the invoice's real status before changing the order. A forged webhook cannot mark an order paid.

Partial payments put the order on hold with a note, and a second note tells you when the price hold ended before the rest arrived (refund the part paid, or agree the rest with the customer). A payment that arrives after the price hold ended also goes on hold for you to review. Unpaid orders are cancelled when the price hold (plus a 3-minute grace period) ends.

If a customer starts the payment again, the order gets a new payment request. The plugin keeps watching the earlier ones: if money still arrives for one, the order gets a note and goes on hold (or just a note, if it is already paid), so a double payment is never missed.

If an unconfirmed payment disappears from the network after it was reported (as confirming, or as paid with the "quick" setting in MonkStash Pay), the order goes on hold with a note. Do not use "quick" for goods delivered instantly.

If a reorganization of the Monero chain moves a paid order's payment back to too few confirmations, the order goes on hold with a note until it is confirmed again.

A sender can lock a Monero payment so the coins cannot be spent until a later block or date. MonkStash Pay never counts such a payment. The plugin adds a note to the order, once per payment, and puts an unpaid order on hold so it is not cancelled. Do not deliver the order for it; contact the customer.

The five-minute check goes through every open MonkStash order from the last 7 days, not only the newest ones.

== External services ==

This plugin connects to one service: **your own MonkStash Pay server**, at the HTTPS address you enter in the settings. MonkStash Pay is open-source software you install and run yourself; no MonkStash company server is involved.

* When a customer chooses Monero, the plugin sends the order total, currency, order number and a return link to your MonkStash Pay server to create a payment request, then sends the customer to its checkout page.
* To confirm a payment, and every five minutes for open Monero orders, the plugin asks your MonkStash Pay server for the payment request's status.
* When you save the settings, it asks your server for its status to check the connection.

Your MonkStash Pay server sends signed status messages (webhooks) back to your shop. No customer names, emails or addresses are sent. The server's terms and privacy policy are your own, because you run it. The MonkStash Pay software and its licence: https://github.com/90ssolo/monkstash

== Installation ==

1. Set up MonkStash Pay on your server (see its README). Note the server's HTTPS address, the API key and the webhook secret.
2. Upload this plugin and activate it.
3. Go to WooCommerce, Settings, Payments, MonkStash Pay (Monero). Enter the server address, API key and webhook secret, and save. The plugin checks the connection and shows the sync height.
4. In your MonkStash Pay settings, set PAY_WEBHOOK_URL to the address shown under "Webhook secret" (it ends in /wp-json/monkstash-pay/v1/webhook).
5. Make a test order on stagenet before going live.

== Frequently Asked Questions ==

= Do I need to run a Monero node? =

No, but your own node is the most private option. MonkStash Pay can use any node you trust.

= Can the plugin or MonkStash Pay spend my money? =

No. MonkStash Pay only has your view key, which can see incoming payments but cannot spend. This plugin only has an API key for your MonkStash Pay server.

= How do refunds work? =

Monero hides the sender, so ask the customer for a refund address and send the refund from your own wallet.

= How are fake checkouts limited? =

Each visitor address can start at most 10 Monero payments in 10 minutes, and the whole shop at most 100 (change that with the `monkstash_pay_max_invoices_per_10_minutes` filter). The visitor address is the address of the connection. If your shop sits behind a proxy or CDN you control, turn on "Behind a trusted proxy" so the address the proxy reports is used instead.

== Changelog ==

= 0.1.1 =
* Locked payments (coins the sender locked for later) are noted on the order and put an unpaid order on hold. Needs MonkStash Pay with locked-payment support.
* Tested with WordPress 7.1 and WooCommerce 11.2. Error messages are escaped; the gateway class is now MonkStash_Pay_Gateway (settings are kept).

= 0.1.0 =
* First version: checkout, webhooks with signature and status confirmation, five-minute fallback check, block checkout, HPOS.
