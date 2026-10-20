import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { GatewayFlowArt, GatewayFlowNarrow } from "@/components/art/MerchantArt";
import { merchant } from "@/lib/merchant";

export const meta: ArticleMeta = {
  slug: "monero-payment-gateway",
  section: "guides",
  kicker: "For online shops",
  title: "Monero Payment Gateway: Self-Hosted, Non-Custodial (MonkStash Pay)",
  seoTitle: "Monero Payment Gateway: Self-Hosted and Private",
  summary: "A Monero payment gateway you run yourself: invoices, a checkout page and signed webhooks, with a view-only wallet that cannot spend. How it works and compares.",
  keyword: "monero payment gateway",
  updated: "2026-10-17",
  readingMinutes: 10,
  toc: [
    { id: "what", label: "What a Monero payment gateway does" },
    { id: "how", label: "How MonkStash Pay works" },
    { id: "safe", label: "Why it cannot lose your money" },
    { id: "api", label: "The API in one minute" },
    { id: "webhooks", label: "Webhooks your shop can trust" },
    { id: "compare", label: "Monero payment gateways compared" },
    { id: "setup", label: "What you need to run it" },
    { id: "status", label: "Status and limits" },
  ],
  related: ["accept-monero-payments", "monero-woocommerce", "monero-view-only-wallet", "monero-subaddress", "monero-remote-node", "monero-transaction-time"],
  faq: [
    { q: "What is a Monero payment gateway?", a: "Software that creates an invoice for each order, shows the customer how to pay in XMR, watches the blockchain for the payment, and tells your shop when the order is paid." },
    { q: "Is MonkStash Pay custodial?", a: "No. It runs on your own server with a view-only wallet. It can see incoming payments but has no spend key, so it cannot move your money. Payments go straight from the customer to your wallet." },
    { q: "Do I need to run a Monero node?", a: "No. MonkStash Pay can use any node you trust. Running your own node is the most private option, because a remote node sees your server's IP address and its sync requests (never your keys)." },
    { q: "Can I download MonkStash Pay now?", a: "Yes, as source code. MonkStash Pay is open source (BSD-3-Clause), so you can read the code and run it on your own server today. Version 0.1 is built and tested on stagenet, Monero's test network, and has not had an independent security review yet, so test it on stagenet first and start with small amounts." },
    { q: "Does MonkStash Pay charge a fee?", a: "No. It is free, open-source software you run yourself. The only cost on a payment is the small Monero network fee, which the customer pays." },
    { q: "How does my shop know an order is paid?", a: "MonkStash Pay sends a webhook signed with HMAC-SHA256. Your shop checks the signature, and can also ask the API for the invoice status at any time." },
    { q: "Can I price products in euros or dollars?", a: "Yes. Send the price in your currency; MonkStash Pay converts it at a live rate (the middle of several exchanges) and holds that rate for 30 minutes by default." },
  ],
};

export function Body() {
  const repo = merchant.payRepoUrl;
  return (
    <>
      <p>
        A <strong>Monero payment gateway</strong> turns &quot;pay with XMR&quot; into something your shop can run on its own: an invoice
        per order, a checkout page for the customer, and a message to your shop when the money arrives. <mark>MonkStash Pay</mark> is a
        free gateway you host yourself. It holds no money and has no spend key, so the only person who can move your funds is you.
      </p>
      <Callout title="Early version, in testing">
        MonkStash Pay is open source, and you can <a href={repo} rel="noopener">read the code and run it yourself</a> today.
        Version {merchant.payVersion} is built and tested on stagenet, Monero&apos;s free test network, and has not had an independent
        security review yet. This guide explains how it works so you can decide whether it fits your shop.
      </Callout>

      <Takeaways items={[
        "Every order gets its own subaddress, so payments are matched by address, never by amount.",
        "It runs on your server with a view-only wallet: it can see payments, never spend them.",
        "Prices in euros or dollars are converted at a live rate and held for 30 minutes.",
        "Your shop gets signed webhooks, and a WooCommerce plugin connects stores in three settings.",
      ]} />

      <h2 id="what">What a Monero payment gateway does</h2>
      <p>Whatever gateway you use, it has four jobs:</p>
      <ol>
        <li><strong>Make an invoice</strong> with a fresh address and an exact amount.</li>
        <li><strong>Show the customer how to pay</strong>: a QR code, the amount, a countdown.</li>
        <li><strong>Watch the blockchain</strong> for a payment to that address, which takes a <Link href="/monero-view-key">view key</Link>.</li>
        <li><strong>Tell your shop</strong> when the order is paid, so it can ship.</li>
      </ol>
      <p>
        The big question is <mark>where the view key lives</mark>. Hosted processors keep it (or your money) on their servers. MonkStash
        Pay keeps it on yours.
      </p>

      <h2 id="how">How MonkStash Pay works</h2>
      <Figure caption="Everything inside the dashed box runs on your own server.">
        <Adaptive wide={<GatewayFlowArt />} narrow={<GatewayFlowNarrow />} />
      </Figure>
      <Steps items={[
        { title: "Your shop asks for an invoice", body: <>One API call: &quot;€19.99, Order 1001&quot;.</> },
        { title: "MonkStash Pay creates it", body: <>A fresh subaddress from your view-only wallet, the price converted to XMR and held for 30 minutes, and a checkout link.</> },
        { title: "The customer pays", body: <>On the checkout page: QR code, exact amount, copy buttons and a status that updates by itself.</> },
        { title: "Your shop gets told", body: <>A signed webhook for each change: confirming, paid, partly paid, late or expired.</> },
      ]} />

      <h2 id="safe">Why it cannot lose your money</h2>
      <ul>
        <li><strong>View-only wallet.</strong> It is set up with your address and private <em>view</em> key only. Without the spend key, nothing on the server can send your XMR anywhere.</li>
        <li><strong>No middleman.</strong> The customer pays your wallet directly. There is no balance on our side, because there is no our side.</li>
        <li><strong>Locked-down checkout.</strong> Checkout pages use long random links, strict security headers and no third-party scripts, fonts or trackers.</li>
        <li><strong>Careful defaults.</strong> The API needs a long secret key, requests are size- and rate-limited, and no customer data is written to logs.</li>
      </ul>
      <KeyFact label="What a hacker could do">
        With your server, an attacker could see your incoming payments (what the view key shows). They could not spend them. Protect the
        server anyway, and keep backups of its data folder.
      </KeyFact>

      <h2 id="api">The API in one minute</h2>
      <p>Create an invoice with one request. Keep the API key on your shop&apos;s server, never in a web page.</p>
      <pre><code>{`POST /api/invoices
Authorization: Bearer <your API key>
Content-Type: application/json

{ "amount": "19.99", "currency": "EUR", "reference": "Order 1001",
  "returnUrl": "https://yourshop.com/orders/1001" }`}</code></pre>
      <p>
        The reply includes the invoice <code>id</code>, the exact XMR amount, the held rate, the expiry time and a{" "}
        <code>checkoutUrl</code> to send your customer to. <code>GET /api/invoices/:id</code> returns the current status at any time:
      </p>
      <table>
        <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><code>waiting</code></td><td>Nothing received yet</td></tr>
          <tr><td><code>confirming</code></td><td>Enough received, waiting for confirmations</td></tr>
          <tr><td><code>paid</code></td><td>Paid and confirmed; ship it</td></tr>
          <tr><td><code>partial</code></td><td>Less than the amount arrived; the checkout asks for the rest</td></tr>
          <tr><td><code>expired</code></td><td>Nothing arrived before the price hold ended</td></tr>
          <tr><td><code>late</code></td><td>Money arrived after the hold; review it</td></tr>
        </tbody>
      </table>

      <h2 id="webhooks">Webhooks your shop can trust</h2>
      <p>
        Each status change is sent to your shop as a webhook, signed with HMAC-SHA256 and a timestamp. Your shop checks the signature
        before believing it, and rejects anything older than five minutes. If your shop does not answer, MonkStash Pay tries again after 1 minute, 5 minutes,
        30 minutes, 2 hours and 6 hours: six attempts in all, with the last one about eight and a half hours after the first.
      </p>
      <p>
        For extra safety, our <Link href="/monero-woocommerce">WooCommerce plugin</Link> goes one step further: after a valid webhook it
        <mark>asks the gateway for the real status</mark> before changing the order, so even a replayed or forged message cannot mark an
        order paid.
      </p>

      <h2 id="compare">Monero payment gateways compared</h2>
      <table>
        <thead>
          <tr><th>Option</th><th>View key held by</th><th>Address per order</th><th>You run</th></tr>
        </thead>
        <tbody>
          <tr><td>MonkStash Pay</td><td>Your server</td><td>Yes</td><td>One small program (Docker or Node)</td></tr>
          <tr><td>BTCPay Server, Monero plugin</td><td>Your server</td><td>Yes</td><td>BTCPay plus a Monero node</td></tr>
          <tr><td>Older WooCommerce gateway (monerowp)</td><td>Can be a third-party explorer, depending on mode</td><td>Depends on mode</td><td>A WordPress plugin</td></tr>
          <tr><td>Hosted processors</td><td>The processor</td><td>Usually</td><td>Nothing; you trust them</td></tr>
        </tbody>
      </table>
      <p>
        BTCPay is a strong choice if you already run it. MonkStash Pay is for shops that want the same self-hosted privacy with less to
        install. Check each project&apos;s current documentation; these tools change.
      </p>

      <h2 id="setup">What you need to run it</h2>
      <ul>
        <li>A small server or VPS with Docker or Node.js 22 or newer, and HTTPS in front of it.</li>
        <li>A wallet for your shop, and its primary address, private view key and creation height. Never the seed or spend key.</li>
        <li>A Monero node you trust (your own is best).</li>
        <li>About 20 minutes, most of it waiting for the first sync.</li>
      </ul>
      <p>
        Setup has three parts: fill in a settings file, build and run the server (with Docker or Node.js), and put it behind an HTTPS
        proxy such as Caddy or nginx. Test on stagenet, the free test network, before you take real money. The full guide, every
        setting and copy-paste webhook code for Node.js and PHP are in the project&apos;s{" "}
        <a href={repo} rel="noopener">README</a>.
      </p>

      <h2 id="status">Status and limits</h2>
      <Callout title={`Version ${merchant.payVersion}: early, and honest about it`}>
        Here is exactly what has been tested on stagenet: a real invoice and its checkout page, and an expiry webhook delivered to a
        test shop with a valid signature. A paid order has not been tested end to end yet. It is new software that has not had an
        independent security review, so test it yourself on stagenet and start with small amounts. Get the code on <a href={repo} rel="noopener">the project page</a>.
      </Callout>
      <ul>
        <li>One wallet and one shop per server.</li>
        <li>Invoices are kept in a single file: fine for thousands of orders, not millions.</li>
        <li>No admin screen yet; use the API or your shop&apos;s order list.</li>
      </ul>
      <p>
        Selling in person instead? Use <Link href="/monero-pos">cashier mode</Link>. Invoicing a client? A{" "}
        <Link href="/monero-payment-link">payment link</Link> is all you need.
      </p>
    </>
  );
}
