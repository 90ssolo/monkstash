import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { WooFlowArt } from "@/components/art/MerchantArt";
import { merchant } from "@/lib/merchant";

export const meta: ArticleMeta = {
  slug: "monero-woocommerce",
  section: "guides",
  kicker: "WordPress plugin",
  title: "Monero WooCommerce Plugin: Accept XMR on WordPress, Non-Custodial",
  seoTitle: "Monero WooCommerce Plugin for WordPress",
  summary: "A Monero WordPress plugin for WooCommerce: a fresh address per order, prices in your shop currency, and orders that complete themselves.",
  keyword: "monero woocommerce",
  updated: "2026-10-17",
  readingMinutes: 7,
  toc: [
    { id: "what", label: "What the plugin does" },
    { id: "how", label: "How an order gets paid" },
    { id: "install", label: "Install and connect it" },
    { id: "statuses", label: "What happens to your orders" },
    { id: "safe", label: "Why a fake webhook cannot fool it" },
    { id: "compare", label: "Compared to the older Monero plugin" },
    { id: "status", label: "Status" },
  ],
  related: ["monero-payment-gateway", "accept-monero-payments", "monero-transaction-time", "monero-view-only-wallet"],
  faq: [
    { q: "Is there a Monero WordPress plugin?", a: "For WooCommerce stores, yes: the older monerowp gateway exists today, and MonkStash Pay for WooCommerce is built and tested on stagenet. Its code is open source; a ready-to-install download is not released yet." },
    { q: "Can I download the plugin now?", a: "Not as a ready-to-install zip yet. The plugin code is already in the open-source MonkStash repository (BSD-3-Clause), next to MonkStash Pay, so you can read it today. The download comes after it has been tested on a real WordPress shop. MonkStash Pay itself is available to read and self-host now; it is built and tested on stagenet, has not had an independent security review yet, and you should start with small amounts." },
    { q: "How do I accept Monero on WooCommerce?", a: "Once it is released: run MonkStash Pay on your server, install the MonkStash Pay for WooCommerce plugin, and enter the server address, API key and webhook secret in WooCommerce, Settings, Payments." },
    { q: "Does it work with the WooCommerce block checkout?", a: "Yes. It supports both the block checkout (the default for new stores since WooCommerce 8.3) and the classic checkout, and WooCommerce's order tables (HPOS)." },
    { q: "Is the plugin custodial?", a: "No. Payments go straight to your wallet. The plugin only has an API key for your own MonkStash Pay server, which itself only has a view-only wallet." },
    { q: "Can I keep prices in euros or dollars?", a: "Yes. The order total in your shop currency is converted to XMR at a live rate and held for 30 minutes by default." },
    { q: "What if a webhook is missed?", a: "The plugin checks open Monero orders every five minutes, so orders still update if a webhook never arrives." },
  ],
  sources: [
    { label: "WooCommerce docs: Cart and Checkout blocks (default for new stores since 8.3)", href: "https://woocommerce.com/document/woocommerce-store-editing/customizing-cart-and-checkout/" },
    { label: "WooCommerce docs: High-Performance Order Storage (HPOS)", href: "https://woocommerce.com/document/high-performance-order-storage/" },
    { label: "WordPress documentation: Manage plugins (upload a plugin zip)", href: "https://wordpress.org/documentation/article/manage-plugins/" },
    { label: "monerowp, the older Monero WooCommerce gateway: open issues (GitHub)", href: "https://github.com/monero-integrations/monerowp/issues" },
    { label: "RFC 2104: HMAC, keyed hashing for message authentication (IETF)", href: "https://datatracker.ietf.org/doc/html/rfc2104" },
  ],
};

export function Body() {
  const zip = merchant.wooPluginUrl;
  return (
    <>
      <p>
        <strong>MonkStash Pay for WooCommerce</strong> is a coming Monero WordPress plugin that adds &quot;Monero (XMR)&quot; to your WooCommerce checkout. Each order gets its own
        address and a price held in your shop currency, the customer pays from any wallet, and <mark>the order marks itself paid</mark>.
        The money goes straight to your wallet: nothing in the chain can spend it but you.
      </p>
      <Callout title="Coming soon">
        The plugin and <Link href="/monero-payment-gateway">MonkStash Pay</Link> are built and tested on stagenet, Monero&apos;s free test
        network. The <a href={merchant.wooSourceUrl} rel="noopener">plugin code</a> is already in our open-source repository. A
        ready-to-install download comes after testing on a real WordPress shop.
      </Callout>

      <Takeaways items={[
        "A fresh Monero address for every order, matched by address, never by amount.",
        "Prices in your shop currency, converted at a live rate and held for 30 minutes.",
        "Orders complete themselves; partial and late payments go on hold for you.",
        "Works with block and classic checkout, and with HPOS order tables.",
      ]} />

      <h2 id="what">What the plugin does</h2>
      <p>
        The plugin is the bridge between WooCommerce and <Link href="/monero-payment-gateway">MonkStash Pay</Link>, the self-hosted payment
        server that watches for payments with a view-only wallet. WooCommerce handles your shop; MonkStash Pay handles Monero; the plugin
        keeps the two in step.
      </p>

      <h2 id="how">How an order gets paid</h2>
      <Figure caption="From Place order to Processing, without anyone watching a screen.">
        <WooFlowArt />
      </Figure>

      <h2 id="install">Install and connect it</h2>
      <Steps items={[
        { title: "Run MonkStash Pay", body: <>On your server, with your shop wallet&apos;s address and view key. See <Link href="/monero-payment-gateway">the gateway guide</Link>.</> },
        { title: "Install the plugin", body: <>Upload it in WordPress under <em>Plugins, Add New, Upload Plugin</em>, then activate it.</> },
        { title: "Enter three settings", body: <>In <em>WooCommerce, Settings, Payments, MonkStash Pay (Monero)</em>: the server address, API key and webhook secret. Saving tests the connection and shows the sync height.</> },
        { title: "Point the webhook at your shop", body: <>The settings page shows your webhook address (ending in <code>/wp-json/monkstash-pay/v1/webhook</code>). Put it in MonkStash Pay&apos;s <code>PAY_WEBHOOK_URL</code>.</> },
        { title: "Test on stagenet", body: <>Place a test order with free stagenet coins before taking real money.</> },
      ]} />

      <h2 id="statuses">What happens to your orders</h2>
      <table>
        <thead><tr><th>Payment</th><th>Order becomes</th></tr></thead>
        <tbody>
          <tr><td>Paid and confirmed</td><td><strong>Processing</strong> (paid), with a note of the XMR received and any overpayment</td></tr>
          <tr><td>Seen, waiting for confirmations</td><td>A note on the order</td></tr>
          <tr><td>Partly paid</td><td><strong>On hold</strong>, with how much is still owed</td></tr>
          <tr><td>Arrived after the price hold ended</td><td><strong>On hold</strong>, for you to accept or refund</td></tr>
          <tr><td>Expired unpaid</td><td><strong>Cancelled</strong></td></tr>
        </tbody>
      </table>
      <p>If a customer comes back to pay an unpaid order, the plugin sends them to the same open invoice instead of making a new one.</p>

      <h2 id="safe">Why a fake webhook cannot fool it</h2>
      <p>
        A payment plugin is only as safe as its &quot;this order is paid&quot; message. This one checks three things before it changes an
        order:
      </p>
      <ol>
        <li><strong>The signature.</strong> Every webhook is signed with your secret (HMAC-SHA256). Unsigned, wrongly signed or stale messages are rejected.</li>
        <li><strong>The order.</strong> The invoice must belong to that exact order.</li>
        <li><strong>The real status.</strong> Even with a valid signature, the plugin <mark>asks your MonkStash Pay server for the invoice status</mark> and acts on that, so a replayed message cannot mark an order paid.</li>
      </ol>
      <p>A check every five minutes catches anything a missed webhook would have changed.</p>

      <h2 id="compare">Compared to the older Monero plugin</h2>
      <p>
        The long-standing WooCommerce gateway for Monero (monerowp) has served shops for years, but its{" "}
        <a href="https://github.com/monero-integrations/monerowp/issues" rel="noopener">open issues</a> include payments that
        are not detected and orders matched by amount, and one of its modes checks payments through a third-party block explorer using
        your view key. MonkStash Pay for WooCommerce takes a different route:
      </p>
      <ul>
        <li>Your view key stays on your own server, never on a third-party site.</li>
        <li>Every order has its own subaddress, so same-priced orders cannot be confused.</li>
        <li>Prices in your shop currency are converted from several exchanges, not one.</li>
      </ul>

      <h2 id="status">Status</h2>
      <Callout kind="warn" title={`Version ${merchant.wooVersion}: test before you rely on it`}>
        This is a first version. It has been written against current WooCommerce and WordPress and tested with MonkStash Pay on
        stagenet, but it has not yet been run on a live store. When it is released, install it on a staging copy and place a stagenet
        test order first. {zip ? <><a href={zip} rel="noopener">Download the plugin</a>.</> : <>There is no ready-to-install download yet, but you can <a href={merchant.wooSourceUrl} rel="noopener">read the plugin code</a> today.</>}
      </Callout>
      <KeyFact label="No WordPress?">
        Any shop can call <Link href="/monero-payment-gateway">MonkStash Pay</Link>&apos;s API directly. Selling at a counter? Use{" "}
        <Link href="/monero-pos">cashier mode</Link>.
      </KeyFact>
    </>
  );
}
